const fs = require('fs');
const path = require('path');

function clearDirectory(dirPath) {
  if (fs.existsSync(dirPath)) {
    console.log(`Clearing ${dirPath}...`);
    fs.rmSync(dirPath, { recursive: true, force: true });
    console.log(`✅ Cleared ${dirPath}`);
  } else {
    console.log(`⚠️  ${dirPath} does not exist`);
  }
}

console.log('🧹 Clearing Next.js caches to fix chunk loading errors...');

// Clear Next.js build cache

// Clear Next.js build directories
clearDirectory(path.join(__dirname, '.next'));
clearDirectory(path.join(__dirname, 'dist'));

// Clear node_modules/.cache if it exists
clearDirectory(path.join(__dirname, 'node_modules', '.cache'));

// Clear any webpack cache
clearDirectory(path.join(__dirname, 'node_modules', '.cache', 'webpack'));

console.log('✅ All cache directories cleared!');
console.log('Now run: npm run build && npm run dev');
