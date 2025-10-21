// fix-uploads.js
const path = require('path');
const fs = require('fs');

console.log('=== Upload Directory Diagnostic ===');
console.log('Working directory:', process.cwd());

// Check current structure
const currentDir = process.cwd();
const uploadsDir = path.resolve(currentDir, 'uploads');
const servicesDir = path.resolve(uploadsDir, 'services');

console.log('Uploads directory:', uploadsDir);
console.log('Services directory:', servicesDir);

console.log('Uploads directory exists:', fs.existsSync(uploadsDir));
console.log('Services directory exists:', fs.existsSync(servicesDir));

// Create directories if they don't exist
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
    console.log('Created uploads directory');
}

if (!fs.existsSync(servicesDir)) {
    fs.mkdirSync(servicesDir, { recursive: true });
    console.log('Created services directory');
}

// List contents
console.log('\n=== Directory Contents ===');
if (fs.existsSync(uploadsDir)) {
    console.log('Uploads directory contents:');
    try {
        const items = fs.readdirSync(uploadsDir);
        items.forEach(item => {
            const itemPath = path.join(uploadsDir, item);
            const isDir = fs.statSync(itemPath).isDirectory();
            console.log(`  ${isDir ? '[DIR]' : '[FILE]'} ${item}`);
        });
    } catch (err) {
        console.error('Error reading uploads directory:', err.message);
    }
}

if (fs.existsSync(servicesDir)) {
    console.log('\nServices directory contents:');
    try {
        const items = fs.readdirSync(servicesDir);
        if (items.length === 0) {
            console.log('  (empty)');
        } else {
            items.forEach(item => {
                console.log(`  [FILE] ${item}`);
            });
        }
    } catch (err) {
        console.error('Error reading services directory:', err.message);
    }
}

console.log('\n=== Fix Complete ===');
