import puppeteer from "puppeteer";

async function scrapeGoogleMaps(query) {
  const browser = await puppeteer.launch({ headless: false }); // keep visible for debugging
  const page = await browser.newPage();

  // Search
  const searchUrl = `https://www.google.com/maps/search/doctor/@30.7635622,30.6953818,18z?entry=ttu&g_ep=EgoyMDI1MTAwMS4wIKXMDSoASAFQAw%3D%3D`;
  await page.goto(searchUrl, { waitUntil: "networkidle2" });
  await page.waitForSelector(".hfpxzc");

  // Collect result links
  const placeLinks = await page.evaluate(() =>
    Array.from(document.querySelectorAll(".hfpxzc"))
      .map(el => el.getAttribute("href"))
      .filter(Boolean)
  );

  const results = [];

  for (const link of placeLinks) {
    try {
      await page.goto(link, { waitUntil: "networkidle2" });
      await page.waitForSelector("h1.DUwDvf", { timeout: 8000 });

    const data = await page.evaluate(() => {
  const name = document.querySelector("h1.DUwDvf")?.textContent || null;
  const category = document.querySelector(".DkEaL")?.textContent || null;
  const img = document.querySelector(".aoRNLd img")?.src || null;

  // Phone like we fixed before
  let phone = null;
  const allInfoRows = document.querySelectorAll(".rogA2c");
  allInfoRows.forEach(row => {
    const icon = row.previousElementSibling?.textContent || "";
    if (icon.includes("")) {
      const phoneEl = row.querySelector(".Io6YTe")?.textContent?.trim();
      if (phoneEl) phone = phoneEl;
    }
  });

  return { name, category, phone, img };
});


      // extract lat/lng from URL
      const match = link.match(/!3d(-?\d+\.\d+)!4d(-?\d+\.\d+)/);
      if (match) {
        data.lat = parseFloat(match[1]);
        data.lng = parseFloat(match[2]);
      }
      data.link = link;

      results.push(data);
    } catch (err) {
      console.error("Error scraping:", link, err.message);
    }
  }

  await browser.close();
  return results;
}

// Example usage
scrapeGoogleMaps("عيادة في دمنهور").then(console.log);
