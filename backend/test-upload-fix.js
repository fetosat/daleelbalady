// test-upload-fix.js
import express from 'express';
import path from 'path';
import fs from 'fs';

console.log('=== Upload Fix Verification ===');

// Simulate the server working directory
const currentDir = process.cwd();
console.log('Current working directory:', currentDir);

// Check upload directory structure from server perspective
const uploadsPath = path.resolve(currentDir, 'uploads');
const servicesPath = path.resolve(uploadsPath, 'services');

console.log('Uploads path:', uploadsPath);
console.log('Services path:', servicesPath);
console.log('Uploads exists:', fs.existsSync(uploadsPath));
console.log('Services exists:', fs.existsSync(servicesPath));

// Ensure directories exist
if (!fs.existsSync(uploadsPath)) {
    fs.mkdirSync(uploadsPath, { recursive: true });
    console.log('✅ Created uploads directory');
}

if (!fs.existsSync(servicesPath)) {
    fs.mkdirSync(servicesPath, { recursive: true });
    console.log('✅ Created services directory');
}

// Create a test file to verify the path works
const testFilename = 'test-image-' + Date.now() + '.txt';
const testFilePath = path.join(servicesPath, testFilename);
const testContent = 'This is a test file to verify upload paths work correctly.';

try {
    fs.writeFileSync(testFilePath, testContent);
    console.log('✅ Test file created:', testFilePath);
    
    // Verify it can be read
    const readContent = fs.readFileSync(testFilePath, 'utf8');
    if (readContent === testContent) {
        console.log('✅ Test file can be read correctly');
        
        // Test URL path
        const relativeUrl = `/uploads/services/${testFilename}`;
        console.log('✅ File should be accessible at:', relativeUrl);
        
        // Clean up test file
        fs.unlinkSync(testFilePath);
        console.log('✅ Test file cleaned up');
    } else {
        console.error('❌ Test file content mismatch');
    }
} catch (error) {
    console.error('❌ Error with test file:', error.message);
}

console.log('\n=== Directory Status ===');
if (fs.existsSync(servicesPath)) {
    const files = fs.readdirSync(servicesPath);
    console.log(`Services directory contains ${files.length} files`);
    if (files.length > 0) {
        console.log('Files:', files.slice(0, 5).join(', ') + (files.length > 5 ? '...' : ''));
    }
}

console.log('✅ Upload fix verification complete');
