// Import necessary libraries
import fs from 'fs/promises';
import path from 'path';
import axios from 'axios';
import * as cheerio from 'cheerio';
import pLimit from 'p-limit';

// --- CONFIGURATION ---

// Directory containing the input JSON files
const INPUT_DIR = './output';

// Directory to save the scraped data batches
const SCRAPED_DIR = './scraped';

// How many entries to save in each JSON file
const BATCH_SIZE = 50;

// How many pages to scrape at the same time.
const CONCURRENCY_LIMIT = 10;

// --- HELPER FUNCTION ---

/**
 * Saves a batch of data to a numbered JSON file.
 * @param {Array<object>} data - The array of scraped data to save.
 * @param {number} batchNumber - The current batch number for filename.
 */
async function saveBatch(data, batchNumber) {
  if (data.length === 0) return;

  const fileName = `batch-${batchNumber}.json`;
  const filePath = path.join(SCRAPED_DIR, fileName);
  try {
    await fs.writeFile(filePath, JSON.stringify(data, null, 2));
    console.log(`\n💾 Batch ${batchNumber} saved successfully with ${data.length} entries to '${filePath}'`);
  } catch (error) {
    console.error(`\n🔥 Failed to write batch file ${fileName}: ${error.message}`);
  }
}

// --- MAIN SCRAPER LOGIC ---

/**
 * Scrapes a single webpage for detailed information.
 * @param {string} url - The URL of the page to scrape.
 * @returns {Promise<object|null>} - A promise that resolves to an object with the scraped data, or null if an error occurs.
 */
async function scrapePage(url) {
  try {
    const { data: html } = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });
    const $ = cheerio.load(html);

    // --- DATA EXTRACTION ---

    const title = $('h1.item-cover-title-section').text().trim();

    const categories = $('.item-cover-title-section + a .category')
      .map((i, el) => $(el).text().trim())
      .get();

    const address = $('p.item-cover-address-section').text().trim().replace(/\s+/g, ' ');

    const phoneNumber = $('.item-cover-contact-section a[href^="tel:"]').first().text().trim();

    const socialLinks = {};
    $('.item-cover-contact-section a').each((i, el) => {
      const href = $(el).attr('href');
      if (!href || href === '#') return;

      if (href.includes('facebook.com')) socialLinks.facebook = href;
      else if (href.includes('api.whatsapp.com')) socialLinks.whatsapp = href;
      else if ($(el).find('i.fa-globe').length) socialLinks.website = href;
    });

    const mapsLink = $('a[href*="google.com/maps/dir"]').attr('href');
    let location = { lat: null, long: null };
    if (mapsLink) {
      const urlParams = new URLSearchParams(new URL(mapsLink).search);
      const destination = urlParams.get('destination');
      if (destination) {
        const [lat, long] = destination.split(',');
        location = { lat: parseFloat(lat), long: parseFloat(long) };
      }
    }

    const description = $('h4.h5:contains("وصف")').next('p').html()?.trim().replace(/<br\s*\/?>/gi, '\n');

    const images = $('#item-image-gallery a')
      .map((i, el) => $(el).attr('href'))
      .get();

    const workingHours = {};
    $('h3:contains("ساعات العمل")').closest('.pt-3').find('.row.border-left').each((i, el) => {
        const day = $(el).find('div[class*="col-"]:first-child span').text().trim();
        const status = $(el).find('div[class*="col-"]:last-child span').text().trim();
        if (day) {
            workingHours[day] = status;
        }
    });
    
    const managerSection = $('h3:contains("مدير")').next('.row.align-items-center');
    const userName = managerSection.find('.col-8 span').first().text().trim();
    const postDate = managerSection.find('.col-8 span').last().text().trim();

    return {
      sourceUrl: url,
      title,
      categories,
      address,
      phoneNumber,
      socialLinks,
      location,
      description,
      images,
      workingHours,
      postedBy: {
        name: userName,
        date: postDate,
      },
    };
  } catch (error) {
    console.error(`\n❌ Error scraping ${url}: ${error.message}`);
    return null; 
  }
}

/**
 * Main function to orchestrate the scraping process.
 */
async function main() {
  console.log('🚀 Starting the scraper...');

  // 0. Ensure the output directory exists
  await fs.mkdir(SCRAPED_DIR, { recursive: true });

  // 1. Read all JSON files from the input directory
  const files = await fs.readdir(INPUT_DIR);
  const jsonFiles = files.filter(file => path.extname(file).toLowerCase() === '.json');
  console.log(`📂 Found ${jsonFiles.length} JSON files in '${INPUT_DIR}'.`);

  if (jsonFiles.length === 0) {
    console.log('No JSON files to process. Exiting.');
    return;
  }

  // 2. Collect all URLs from all files
  let allUrls = [];
  for (const file of jsonFiles) {
    const filePath = path.join(INPUT_DIR, file);
    try {
      const content = await fs.readFile(filePath, 'utf8');
      const data = JSON.parse(content);
      const urls = data.map(item => item.link).filter(Boolean);
      allUrls.push(...urls);
    } catch (error) {
      console.error(`Error reading or parsing ${file}: ${error.message}`);
    }
  }
  
  const uniqueUrls = [...new Set(allUrls)];
  console.log(`🔗 Total unique URLs to scrape: ${uniqueUrls.length}`);

  // 3. Set up for batch processing
  const limit = pLimit(CONCURRENCY_LIMIT);
  let completedCount = 0;
  let successfulScrapes = 0;
  let batchCounter = 1;
  let resultsBuffer = [];

  const scrapingPromises = uniqueUrls.map(url => {
    return limit(async () => {
      const result = await scrapePage(url);
      
      completedCount++;
      process.stdout.write(`\r🔄 Progress: ${completedCount}/${uniqueUrls.length} pages processed...`);

      if (result) {
        resultsBuffer.push(result);
        successfulScrapes++;
        // Check if the buffer is full and needs to be saved
        if (resultsBuffer.length >= BATCH_SIZE) {
          // Important: Copy buffer and then clear it, so other concurrent scrapes don't interfere
          const batchToSave = [...resultsBuffer];
          resultsBuffer = []; 
          await saveBatch(batchToSave, batchCounter);
          batchCounter++;
        }
      }
    });
  });

  // 4. Wait for all scraping tasks to complete
  await Promise.all(scrapingPromises);
  
  // 5. Save any remaining results in the buffer as the final batch
  if (resultsBuffer.length > 0) {
    await saveBatch(resultsBuffer, batchCounter);
  }

  console.log('\n\n✅ Scraping finished!');
  console.log(`📈 Successfully scraped ${successfulScrapes} out of ${uniqueUrls.length} pages.`);
  console.log(`💾 All data saved in batches inside the '${SCRAPED_DIR}' directory.`);
}

// Run the main function and catch any top-level errors
main().catch(console.error);