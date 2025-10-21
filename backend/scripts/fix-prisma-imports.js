/**
 * Script to fix Prisma Client imports
 * Replaces all instances of "new PrismaClient()" with imports from lib/db.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const routesDir = path.join(__dirname, '..', 'routes');
const handlersDir = path.join(__dirname, '..', 'handler');
const controllersDir = path.join(__dirname, '..', 'controllers');

const dirsToFix = [routesDir, handlersDir, controllersDir];

function getAllJsFiles(dir) {
  const files = [];
  
  if (!fs.existsSync(dir)) {
    return files;
  }
  
  const items = fs.readdirSync(dir);
  
  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory()) {
      files.push(...getAllJsFiles(fullPath));
    } else if (item.endsWith('.js')) {
      files.push(fullPath);
    }
  }
  
  return files;
}

function fixFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;
  
  // Check if file uses PrismaClient
  if (content.includes('new PrismaClient()')) {
    console.log(`Fixing: ${path.basename(filePath)}`);
    
    // Remove old import
    content = content.replace(/import\s+{\s*PrismaClient\s*}\s+from\s+['"].*prisma.*['"];?\n/g, '');
    
    // Remove old initialization
    content = content.replace(/const\s+prisma\s*=\s*new\s+PrismaClient\(\);?\n/g, '');
    
    // Add new import at the top
    const lines = content.split('\n');
    let firstImportIndex = lines.findIndex(line => line.trim().startsWith('import'));
    
    if (firstImportIndex === -1) {
      firstImportIndex = 0;
    }
    
    // Check if import already exists
    if (!content.includes("from '../lib/db.js'") && !content.includes("from '../../lib/db.js'")) {
      // Determine relative path
      const relativePath = filePath.includes('handler') ? '../../lib/db.js' : '../lib/db.js';
      lines.splice(firstImportIndex, 0, `import { prisma } from '${relativePath}';`);
      content = lines.join('\n');
    }
    
    // Clean up extra newlines
    content = content.replace(/\n\n\n+/g, '\n\n');
    
    fs.writeFileSync(filePath, content, 'utf8');
    modified = true;
  }
  
  return modified;
}

console.log('🔧 Fixing Prisma Client imports...\n');

let totalFixed = 0;

for (const dir of dirsToFix) {
  const files = getAllJsFiles(dir);
  
  for (const file of files) {
    if (fixFile(file)) {
      totalFixed++;
    }
  }
}

console.log(`\n✅ Fixed ${totalFixed} files!`);
console.log('All files now use the singleton Prisma instance from lib/db.js');

