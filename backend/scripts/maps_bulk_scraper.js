/**
 * maps_bulk_scraper.js
 *
 * Usage: node maps_bulk_scraper.js
 *
 * Requirements:
 *  - categories.json in same folder (as you pasted)
 *  - output directory will be created: ./output
 *
 * IMPORTANT: Scraping Google Maps may violate Google ToS.
 * Use proxies/rotate UA and respect rate-limits if you run at scale.
 */

import fs from 'fs-extra';
import path from 'path';
import puppeteer from 'puppeteer';
import pLimit from 'p-limit';

const CATEGORIES_FILE = path.resolve('./categories.json');
const OUTPUT_DIR = path.resolve('./out');

// Tunables:
const CONCURRENCY = 10;               // how many place pages to fetch in parallel
const NAVIGATION_TIMEOUT = 30_0000;   // ms per navigation
const SCROLL_TIMEOUT = 20_000;       // ms to wait for more results during scroll
const MAX_SCROLL_ITERATIONS = 40;    // safety cap for scrolling attempts
const PLACE_VISIT_DELAY_MS = [200, 600]; // randomized delay range between place visits
const BROWSER_CONCURRENCY = 5;

function randInt(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }
function sleep(ms) { return new Promise(resolve => setTimeout(resolve, ms)); }
function randomDelay() { return sleep(randInt(PLACE_VISIT_DELAY_MS[0], PLACE_VISIT_DELAY_MS[1])); }

async function ensureOutputDir() {
  await fs.ensureDir(OUTPUT_DIR);
}

async function readCategories() {
  const raw = await fs.readFile(CATEGORIES_FILE, 'utf8');
  const parsed = JSON.parse(raw);
  // flatten subcategories with parent info
  const tasks = [];
  for (const cat of parsed.categories || []) {
    for (const sub of cat.subCategories || []) {
      tasks.push({
        parentCategoryName: cat.name,
        parentCategorySlug: cat.slug,
        parentCategoryDescription: cat.description,
        categoryId: sub.id,
        subCategoryName: sub.name,
        subCategorySlug: sub.slug,
      });
    }
  }
  return tasks;
}

/**
 * Scroll the search results page to load all results.
 * Strategy:
 *  - collect number of result items ('.hfpxzc' selector used by UI)
 *  - simulate PageDown / scroll the results container until no new items appear or cap reached
 */
async function scrollResultsToEnd(page) {
  await page.waitForSelector('.hfpxzc', { timeout: 10000 });

  let lastCount = 0;
  let stableCounter = 0;

  for (let i = 0; i < MAX_SCROLL_ITERATIONS; i++) {
    const count = await page.evaluate(() => document.querySelectorAll('.hfpxzc').length);

    if (count > lastCount) {
      lastCount = count;
      stableCounter = 0;
    } else {
      stableCounter++;
    }

    if (stableCounter >= 3) break;

    const scrolled = await page.evaluate(() => {
      const list = document.querySelector('[role="feed"]') 
                || document.querySelector('.section-scrollbox') 
                || document.scrollingElement;
      if (!list) return false;
      list.scrollBy(0, 3000);
      return true;
    });

    try {
      await page.keyboard.press('PageDown');
    } catch(e){}

    await sleep(800 + Math.random() * 600);

    // replace page.waitForTimeout with sleep
    await sleep(400);
  }

  await sleep(800);
  const finalCount = await page.evaluate(() => document.querySelectorAll('.hfpxzc').length);
  return finalCount;
}


/**
 * Extract all place links from the search page
 */
async function extractPlaceLinksFromSearch(page) {
  const links = await page.evaluate(() =>
    Array.from(document.querySelectorAll('.hfpxzc'))
      .map(el => el.getAttribute('href'))
      .filter(Boolean)
  );
  // dedupe
  return Array.from(new Set(links));
}

/**
 * Given a place URL, open it and extract detailed information from the side panel.
 * This function uses fairly robust fallback selectors and also returns the raw
 * sidebar rows so you don't lose any data Google shows.
 */
async function scrapePlacePage(browser, url) {
  const page = await browser.newPage();
  try {
    page.setDefaultNavigationTimeout(NAVIGATION_TIMEOUT);
    await page.goto(url, { waitUntil: 'networkidle2' });

    // wait for sidebar name or fail
    await page.waitForSelector('h1.DUwDvf, h1[data-testid="place-card-title"]', { timeout: 8000 }).catch(()=>{});

    // Evaluate data
    const data = await page.evaluate(() => {
      const takeText = el => el ? el.textContent.trim() : null;
      const safeQuery = s => document.querySelector(s) || null;

      const name = takeText(safeQuery('h1.DUwDvf')) || takeText(safeQuery('h1[data-testid="place-card-title"]')) || null;
      const googleCategory = takeText(safeQuery('.DkEaL')) || takeText(safeQuery('.SK8p5e')) || null;

      // Collect structured info rows: often .rogA2c each row, with previousIcon sibling
      const infoRows = [];
      const rowEls = Array.from(document.querySelectorAll('.rogA2c'));
      for (const row of rowEls) {
        const icon = row.previousElementSibling ? row.previousElementSibling.textContent : null;
        const visibleText = row.innerText ? row.innerText.trim() : null;
        infoRows.push({ icon: icon ? icon.trim() : null, text: visibleText });
      }

      // Try to extract phone specifically (common container class .Io6YTe)
      let phone = null;
      const phoneEl = document.querySelector('.Io6YTe span[dir="ltr"]') || Array.from(document.querySelectorAll('.Io6YTe')).find(r => /\+?\d{2,}/.test(r.textContent));
      if (phoneEl) phone = phoneEl.textContent.trim();

      // website link
      let website = null;
      const aTags = Array.from(document.querySelectorAll('a'));
      const websiteCandidate = aTags.find(a => {
        const href = a.getAttribute('href') || '';
        // maps sometimes use gws and then redirect; prefer something that looks like external link
        return href.startsWith('http') && !href.includes('google.com/maps');
      });
      if (websiteCandidate) website = websiteCandidate.href;

      // address: some pages include .LrzXr or in .CsEnBe text nodes
      const address = takeText(document.querySelector('button[data-item-id="address"]')) ||
                      takeText(document.querySelector('.Io6YTe')) || 
                      takeText(document.querySelector('.LrzXr')) || 
                      takeText(document.querySelector('.rogA2c .Io6YTe'));

      // main image: Google uses .AoRNLd or .yYlJEf . or many variants.
      const img = document.querySelector('.aoRNLd img')?.src ||
                  document.querySelector('.YdI3zb img')?.src ||
                  document.querySelector('.lIqY4c img')?.src ||
                  document.querySelector('img[data-photo-index]')?.src ||
                  null;

      // description/snippet (if present)
      const description = takeText(document.querySelector('.W4Efsd')) || takeText(document.querySelector('.kno-rdesc')) || null;

      // Extract reviews summary (stars and count)
      const reviewsText = takeText(document.querySelector('.Yr7JMd')) || takeText(document.querySelector('.F7nice')) || null;

      // Some pages render location coordinates in the page as accessible text (rare).
      const coordsFromMeta = (() => {
        const metas = Array.from(document.querySelectorAll('meta'));
        const latMeta = metas.find(m => m.getAttribute('itemprop') === 'latitude')?.content;
        const lonMeta = metas.find(m => m.getAttribute('itemprop') === 'longitude')?.content;
        if (latMeta && lonMeta) return { lat: parseFloat(latMeta), lng: parseFloat(lonMeta) };
        return null;
      })();

      return {
        name, googleCategory, phone, website, address, img, description, reviewsText, infoRows, coordsFromMeta
      };
    });

    // attempt lat/lng from page url
    const match = url.match(/!3d(-?\d+\.\d+)!4d(-?\d+\.\d+)/);
    if (match) {
      data.lat = parseFloat(match[1]);
      data.lng = parseFloat(match[2]);
    } else if (data.coordsFromMeta) {
      data.lat = data.coordsFromMeta.lat;
      data.lng = data.coordsFromMeta.lng;
    } else {
      // try to parse from current page url (maps sometimes put @lat,lng,z)
      const current = page.url();
      const m2 = current.match(/@(-?\d+\.\d+),(-?\d+\.\d+),/);
      if (m2) {
        data.lat = parseFloat(m2[1]);
        data.lng = parseFloat(m2[2]);
      }
    }

    data.link = url;

    await page.close();
    return data;
  } catch (err) {
    try { await page.close(); } catch(e){}
    throw err;
  }
}

async function processSubcategory(browser, task) {
  const { subCategoryName, categoryId, parentCategoryName } = task;
  console.log(`\n→ Processing subcategory: ${subCategoryName} (${categoryId})`);

  // Build query - tweak as you prefer
  const mapsSearchQuery = encodeURIComponent(subCategoryName + " في طنطا");
  const searchUrl = `https://www.google.com/maps/search/${mapsSearchQuery}`;

  const page = await browser.newPage();
  page.setDefaultNavigationTimeout(NAVIGATION_TIMEOUT);
  await page.goto(searchUrl, { waitUntil: 'networkidle2' });

  // scroll to load all results
  console.log('  scrolling results to load all items...');
  const count = await scrollResultsToEnd(page);
  console.log(`  results loaded: ~${count}`);

  // extract place links
  const links = await extractPlaceLinksFromSearch(page);
  console.log(`  found ${links.length} unique place links`);

  await page.close();

  // visit each link with concurrency limit
  const limit = pLimit(CONCURRENCY);
  const results = [];
  let idx = 0;

  const browserForWorkers = browser; // reuse same browser instance

  const jobs = links.map(link => limit(async () => {
    idx++;
    try {
      // small randomized delay between workers to look less robotic
      await randomDelay();
      const place = await scrapePlacePage(browserForWorkers, link);

      // attach our category id info
      place.inputCategoryId = categoryId;
      place.inputSubCategoryName = subCategoryName;
      place.fetchedAt = new Date().toISOString();
      results.push(place);
      console.log(`    [${results.length}/${links.length}] scraped: ${place.name || link}`);
    } catch (err) {
      console.error('    error scraping place:', link, err.message || err);
    }
  }));

  await Promise.all(jobs);

  // Write file
  const outPath = path.join(OUTPUT_DIR, `${categoryId}.json`);
  await fs.writeFile(outPath, JSON.stringify({
    meta: {
      subCategoryName: task.subCategoryName,
      parentCategoryName: task.parentCategoryName,
      categoryId: task.categoryId,
      scrapedAt: new Date().toISOString(),
      source: 'google_maps'
    },
    places: results
  }, null, 2), 'utf8');

  console.log(`  => Saved ${results.length} results to ${outPath}`);
  return results.length;
}

async function main() {
  await ensureOutputDir();
  const tasks = await readCategories();
  console.log(`Loaded ${tasks.length} subcategory tasks.`);

  const limitBrowsers = pLimit(BROWSER_CONCURRENCY);

  // Run multiple browsers at once
  const jobs = tasks.map(task => limitBrowsers(async () => {
    const browser = await puppeteer.launch({
      headless: false,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox'
      ]
    });

    try {
      await processSubcategory(browser, task);
    } catch (err) {
      console.error('Error processing subcategory', task.subCategoryName, err.message || err);
    } finally {
      await browser.close();
    }
  }));

  await Promise.all(jobs);

  console.log('All done.');
}


main().catch(err => {
  console.error('Fatal error', err);
  process.exit(1);
});
