// scraper.js
import axios from "axios";
import * as cheerio from "cheerio";
import fs from "fs";
import path from "path";

const BASE_URL =
    "https://eg.shewaya.com/state/%D8%A7%D9%84%D8%A8%D8%AD%D9%8A%D8%B1%D8%A9/?filter_sort_by=1&page=";



const ids = [45, 161, 164, 166, 167, 169, 170, 171, 173, 176, 177, 178, 188, 199, 200, 247, 249, 302, 307, 313, 314, 325, 326, 329, 342, 347, 349, 350, 508, 510];
const OUTPUT_DIR = "output";
const TOTAL_PAGES = 594; // total number of pages to scrape
const CONCURRENCY = 50; // number of pages to scrape at once

// ensure output dir exists
if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR);
}

async function scrapePage(page) {
    try {
        const { data } = await axios.get(`${BASE_URL}${page}`, {
            headers: {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
            },
            timeout: 15000,
        });

        const $ = cheerio.load(data);
        const listings = [];

        $("div.d-block.d-md-flex.listing.vertical").each((i, el) => {
            const element = $(el);

            const link = element.find("a.img").attr("href") || "";
            const image =
                (element.find("a.img").attr("style") || "").match(/url\((.*?)\)/)?.[1] ||
                "";
            const category = element.find(".category").text().trim();
            const title = element.find("h3 a").text().trim();
            const address = element.find("address").text().trim();
            const user = element.find(".item-box-user-name-div span.font-size-13").text().trim();
            const reviewTime = element.find(".item-box-user-name-div span.review").text().trim();

            listings.push({
                link,
                image,
                category,
                title,
                address,
                user,
                reviewTime,
            });
        });

        const filePath = path.join(OUTPUT_DIR, `page-${page}.json`);
        fs.writeFileSync(filePath, JSON.stringify(listings, null, 2), "utf-8");
        console.log(`✅ Page ${page} saved (${listings.length} listings)`);

        return listings;
    } catch (err) {
        console.error(`❌ Error scraping page ${page}:`, err.message);
        return [];
    }
}

async function scrapeAll() {
    const pages = ids;

    // break into chunks of CONCURRENCY
    for (let i = 0; i < pages.length; i += CONCURRENCY) {
        const chunk = pages.slice(i, i + CONCURRENCY);
        await Promise.all(chunk.map((p) => scrapePage(p)));
    }

    console.log("🎉 All pages scraped and saved into output/ directory");
}

scrapeAll();