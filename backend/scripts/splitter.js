// split-json.js
const fs = require("fs");
const path = require("path");

// Input file and output folder
const inputFile = path.join(__dirname, "services-export.json"); // your big JSON file
const outputDir = path.join(__dirname, "split");

// How many records per file
const CHUNK_SIZE = 500;

// Ensure output folder exists
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir);
}

// Read JSON file
const rawData = fs.readFileSync(inputFile, "utf-8");
let data;

try {
  data = JSON.parse(rawData);
} catch (err) {
  console.error("❌ Failed to parse JSON:", err.message);
  process.exit(1);
}

// Split into chunks
for (let i = 0; i < data.services.length; i += CHUNK_SIZE) {
  const chunk = data.services.slice(i, i + CHUNK_SIZE);
  const fileName = path.join(outputDir, `part-${Math.floor(i / CHUNK_SIZE) + 1}.json`);
  fs.writeFileSync(fileName, JSON.stringify(chunk, null, 2), "utf-8");
  console.log(`✅ Wrote ${fileName} (${chunk.length} records)`);
}

console.log("🎉 Done! JSON has been split successfully.");