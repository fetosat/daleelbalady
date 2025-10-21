import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Test the exact same multer config as provider.js
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        try {
            const uploadDir = path.resolve(process.cwd(), 'uploads', 'services');
            console.log('Setting upload destination to:', uploadDir);
            fs.mkdirSync(uploadDir, { recursive: true });
            cb(null, uploadDir);
        } catch (err) {
            console.error('Failed to prepare upload directory:', err);
            cb(err);
        }
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const filename = file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname);
        console.log('Generated filename:', filename);
        cb(null, filename);
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
    fileFilter: (req, file, cb) => {
        console.log('File filter:', file.originalname, file.mimetype);
        const allowedTypes = /jpeg|jpg|png|gif|webp/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);
        
        if (mimetype && extname) {
            return cb(null, true);
        } else {
            cb(new Error('Only image files are allowed!'));
        }
    }
});

console.log('Multer configuration test:');
console.log('Process cwd:', process.cwd());
console.log('Expected upload dir:', path.resolve(process.cwd(), 'uploads', 'services'));

// Check if directory exists
const expectedDir = path.resolve(process.cwd(), 'uploads', 'services');
console.log('Directory exists:', fs.existsSync(expectedDir));

// Test creating the directory
try {
    fs.mkdirSync(expectedDir, { recursive: true });
    console.log('Directory creation successful');
} catch (err) {
    console.error('Directory creation failed:', err);
}

export { upload };
console.log('Test completed');
