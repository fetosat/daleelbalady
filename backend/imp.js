// save as copyChunks.js
import fs from "fs";
import readline from "readline";
import clipboard from "clipboardy";

const raw = fs.readFileSync("./vesito/gharbia.json", "utf-8");
const data = JSON.parse(raw);

console.log(`✅ Loaded ${data.length} items from gharbia.json`);

let index = 0;
const chunkSize = 100;

// setup interactive console
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log("👉 Press ENTER to copy the next 100 items to clipboard...");

rl.on("line", () => {
  if (index >= data.length) {
    console.log("🎉 All items copied! Exiting...");
    rl.close();
    process.exit(0);
  }

  const chunk = data.slice(index, index + chunkSize);
  clipboard.writeSync(JSON.stringify(chunk, null, 2));
  console.log(
    `📋 Copied items ${index + 1} to ${Math.min(
      index + chunkSize,
      data.length
    )} of ${data.length}`
  );

  index += chunkSize;
});
