// check-missing.js
import fs from "fs";
import path from "path";

const OUTPUT_DIR = "output";
const MAX_PAGE = 594; // set this to the maximum page number you expect

function checkMissingFiles() {
  const missing = [];

  for (let i = 1; i <= MAX_PAGE; i++) {
    const filePath = path.join(OUTPUT_DIR, `page-${i}.json`);
    if (!fs.existsSync(filePath)) {
      missing.push(i);
    }
  }

  if (missing.length === 0) {
    console.log("✅ No missing files, all pages exist up to " + MAX_PAGE);
  } else {
    console.log("⚠️ Missing files:");
    console.log(missing.join(", "));
  }
}

checkMissingFiles();
