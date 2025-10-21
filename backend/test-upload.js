// Test upload script
import fetch from 'node-fetch';
import FormData from 'form-data';
import fs from 'fs';
import path from 'path';

const API_URL = 'http://localhost:1024/api'; // Or your backend URL

async function testUpload() {
    console.log('🧪 Testing provider service upload endpoint...\n');
    
    // Create a test image file if it doesn't exist
    const testImagePath = path.join(process.cwd(), 'test-image.png');
    if (!fs.existsSync(testImagePath)) {
        // Create a simple 1x1 pixel PNG
        const pngBuffer = Buffer.from([
            0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, // PNG signature
            0x00, 0x00, 0x00, 0x0D, 0x49, 0x48, 0x44, 0x52, // IHDR chunk
            0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01,
            0x08, 0x06, 0x00, 0x00, 0x00, 0x1F, 0x15, 0xC4,
            0x89, 0x00, 0x00, 0x00, 0x0D, 0x49, 0x44, 0x41,
            0x54, 0x08, 0x99, 0x63, 0xF8, 0x0F, 0x00, 0x00,
            0x01, 0x01, 0x01, 0x00, 0x1B, 0xB6, 0xEE, 0x56,
            0x00, 0x00, 0x00, 0x00, 0x49, 0x45, 0x4E, 0x44,
            0xAE, 0x42, 0x60, 0x82
        ]);
        fs.writeFileSync(testImagePath, pngBuffer);
        console.log('✅ Created test image:', testImagePath);
    }
    
    // Test the test-upload endpoint
    console.log('\n📤 Testing /api/provider/test-upload endpoint...');
    
    const formData = new FormData();
    formData.append('image', fs.createReadStream(testImagePath), 'test-image.png');
    
    try {
        const response = await fetch(`${API_URL}/provider/test-upload`, {
            method: 'POST',
            body: formData,
            headers: formData.getHeaders()
        });
        
        const result = await response.json();
        console.log('📥 Response status:', response.status);
        console.log('📥 Response data:', JSON.stringify(result, null, 2));
        
        if (result.success && result.file) {
            // Check if the file actually exists
            const uploadedPath = result.file.fullPath || path.join('uploads', 'services', result.file.filename);
            console.log('\n🔍 Checking if file exists at:', uploadedPath);
            
            if (fs.existsSync(uploadedPath)) {
                console.log('✅ File exists on disk!');
                const stats = fs.statSync(uploadedPath);
                console.log('📊 File stats:', {
                    size: stats.size,
                    created: stats.birthtime,
                    modified: stats.mtime
                });
            } else {
                console.error('❌ File NOT found at expected path');
            }
        }
        
    } catch (error) {
        console.error('❌ Upload test failed:', error.message);
        if (error.response) {
            const text = await error.response.text();
            console.error('Response:', text);
        }
    }
    
    // Clean up test file
    if (fs.existsSync(testImagePath)) {
        fs.unlinkSync(testImagePath);
        console.log('\n🧹 Cleaned up test image');
    }
}

testUpload().catch(console.error);
