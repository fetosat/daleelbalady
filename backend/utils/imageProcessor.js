// utils/imageProcessor.js
// Advanced Image Processing and Optimization

import sharp from 'sharp';
import path from 'path';
import fs from 'fs/promises';
import { loggers } from './logger.js';
import { FileUploadError } from './AppError.js';

// Image processing configurations
export const imageConfigs = {
  // Profile pictures
  profile: {
    sizes: [
      { name: 'thumb', width: 150, height: 150 },
      { name: 'medium', width: 400, height: 400 },
      { name: 'large', width: 800, height: 800 }
    ],
    quality: 85,
    format: 'webp'
  },
  
  // Shop/Service covers
  cover: {
    sizes: [
      { name: 'thumb', width: 300, height: 200 },
      { name: 'medium', width: 800, height: 600 },
      { name: 'large', width: 1200, height: 900 }
    ],
    quality: 80,
    format: 'webp'
  },
  
  // Product images
  product: {
    sizes: [
      { name: 'thumb', width: 200, height: 200 },
      { name: 'medium', width: 600, height: 600 },
      { name: 'large', width: 1000, height: 1000 }
    ],
    quality: 85,
    format: 'webp'
  },
  
  // Gallery images
  gallery: {
    sizes: [
      { name: 'thumb', width: 300, height: 300 },
      { name: 'medium', width: 800, height: 600 },
      { name: 'large', width: 1400, height: 1050 }
    ],
    quality: 80,
    format: 'webp'
  }
};

// Helper to ensure directory exists
const ensureDir = async (dirPath) => {
  try {
    await fs.access(dirPath);
  } catch {
    await fs.mkdir(dirPath, { recursive: true });
  }
};

// Generate unique filename
const generateFilename = (originalName, size = '', format = 'webp') => {
  const timestamp = Date.now();
  const random = Math.round(Math.random() * 1E9);
  const ext = `.${format}`;
  const baseName = path.parse(originalName).name.replace(/[^a-zA-Z0-9]/g, '_');
  const sizeSuffix = size ? `_${size}` : '';
  
  return `${baseName}_${timestamp}_${random}${sizeSuffix}${ext}`;
};

// Process single image with multiple sizes
export const processImage = async (inputBuffer, config, originalName, outputDir) => {
  try {
    const startTime = Date.now();
    
    // Ensure output directory exists
    await ensureDir(outputDir);
    
    // Get image metadata
    const metadata = await sharp(inputBuffer).metadata();
    
    loggers.upload.success(`Processing image: ${originalName}`, metadata.size, metadata.format, null);
    
    const processedImages = [];
    
    // Process each size
    for (const sizeConfig of config.sizes) {
      const filename = generateFilename(originalName, sizeConfig.name, config.format);
      const outputPath = path.join(outputDir, filename);
      
      let sharpInstance = sharp(inputBuffer);
      
      // Resize image
      sharpInstance = sharpInstance.resize({
        width: sizeConfig.width,
        height: sizeConfig.height,
        fit: sharp.fit.cover,
        position: sharp.strategy.entropy
      });
      
      // Apply format and quality
      switch (config.format) {
        case 'webp':
          sharpInstance = sharpInstance.webp({ 
            quality: config.quality,
            effort: 6 // Best compression
          });
          break;
        case 'jpeg':
          sharpInstance = sharpInstance.jpeg({ 
            quality: config.quality,
            progressive: true,
            mozjpeg: true
          });
          break;
        case 'png':
          sharpInstance = sharpInstance.png({ 
            compressionLevel: 9,
            progressive: true
          });
          break;
        default:
          sharpInstance = sharpInstance.webp({ quality: config.quality });
      }
      
      // Save processed image
      await sharpInstance.toFile(outputPath);
      
      // Get file stats
      const stats = await fs.stat(outputPath);
      
      processedImages.push({
        size: sizeConfig.name,
        filename: filename,
        path: outputPath,
        url: `uploads/${path.basename(outputDir)}/${filename}`,
        width: sizeConfig.width,
        height: sizeConfig.height,
        fileSize: stats.size,
        format: config.format
      });
    }
    
    const processingTime = Date.now() - startTime;
    
    loggers.upload.success(
      `Image processed successfully: ${originalName}`,
      processedImages.reduce((sum, img) => sum + img.fileSize, 0),
      `${config.format} (${processedImages.length} sizes)`,
      null
    );
    
    loggers.performance?.trackSlow?.('image_processing', processingTime, 5000);
    
    return processedImages;
    
  } catch (error) {
    loggers.upload.failed(originalName, error, null);
    throw new FileUploadError(`فشل في معالجة الصورة ${originalName}: ${error.message}`);
  }
};

// Process multiple images
export const processImages = async (files, configType = 'gallery', outputSubDir = 'processed') => {
  try {
    const config = imageConfigs[configType];
    if (!config) {
      throw new FileUploadError(`تكوين معالجة الصور غير موجود: ${configType}`);
    }
    
    const outputDir = path.join(process.cwd(), 'uploads', outputSubDir);
    const results = [];
    
    // Process each file
    for (const file of files) {
      const inputBuffer = file.buffer || await fs.readFile(file.path);
      const processedImages = await processImage(inputBuffer, config, file.originalname, outputDir);
      
      results.push({
        original: {
          filename: file.originalname,
          size: file.size,
          mimetype: file.mimetype
        },
        processed: processedImages
      });
    }
    
    return results;
    
  } catch (error) {
    throw new FileUploadError(`فشل في معالجة الصور: ${error.message}`);
  }
};

// Create optimized thumbnail
export const createThumbnail = async (inputPath, outputPath, width = 300, height = 300) => {
  try {
    await sharp(inputPath)
      .resize(width, height, {
        fit: sharp.fit.cover,
        position: sharp.strategy.entropy
      })
      .webp({ quality: 80 })
      .toFile(outputPath);
      
    const stats = await fs.stat(outputPath);
    return {
      path: outputPath,
      size: stats.size,
      width,
      height
    };
  } catch (error) {
    throw new FileUploadError(`فشل في إنشاء صورة مصغرة: ${error.message}`);
  }
};

// Add watermark to image
export const addWatermark = async (inputPath, watermarkPath, outputPath, options = {}) => {
  const {
    position = 'southeast',
    opacity = 0.3,
    margin = 20
  } = options;
  
  try {
    const watermark = await sharp(watermarkPath)
      .resize({ width: 200, height: 60, fit: 'contain' })
      .png()
      .toBuffer();
    
    await sharp(inputPath)
      .composite([{
        input: watermark,
        gravity: position,
        blend: 'over'
      }])
      .webp({ quality: 85 })
      .toFile(outputPath);
      
    return { path: outputPath };
  } catch (error) {
    throw new FileUploadError(`فشل في إضافة العلامة المائية: ${error.message}`);
  }
};

// Extract dominant colors from image
export const extractColors = async (inputBuffer) => {
  try {
    const { dominant } = await sharp(inputBuffer)
      .resize(50, 50)
      .removeAlpha()
      .raw()
      .toBuffer({ resolveWithObject: true });
      
    // Simple dominant color extraction (you might want to use a more sophisticated algorithm)
    const r = dominant[0];
    const g = dominant[1];
    const b = dominant[2];
    
    return {
      dominant: `rgb(${r}, ${g}, ${b})`,
      hex: `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`
    };
  } catch (error) {
    return null;
  }
};

// Validate image file
export const validateImage = (file, options = {}) => {
  const {
    maxSize = 10 * 1024 * 1024, // 10MB
    allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
    minWidth = 100,
    minHeight = 100,
    maxWidth = 4000,
    maxHeight = 4000
  } = options;
  
  const errors = [];
  
  // Check file size
  if (file.size > maxSize) {
    errors.push(`حجم الصورة كبير جداً. الحد الأقصى ${Math.round(maxSize / 1024 / 1024)} ميجابايت`);
  }
  
  // Check file type
  if (!allowedTypes.includes(file.mimetype)) {
    errors.push(`نوع الصورة غير مدعوم. الأنواع المسموحة: ${allowedTypes.join(', ')}`);
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

// Clean up old images
export const cleanupOldImages = async (directory, maxAge = 30 * 24 * 60 * 60 * 1000) => {
  try {
    const files = await fs.readdir(directory);
    const now = Date.now();
    let cleanedCount = 0;
    
    for (const file of files) {
      const filePath = path.join(directory, file);
      const stats = await fs.stat(filePath);
      
      if (now - stats.mtime.getTime() > maxAge) {
        await fs.unlink(filePath);
        cleanedCount++;
        loggers.upload.deleted(file, 'system_cleanup');
      }
    }
    
    return { cleanedCount };
  } catch (error) {
    loggers.upload.failed('cleanup', error, 'system');
    return { cleanedCount: 0, error: error.message };
  }
};

// Middleware for automatic image processing
export const imageProcessingMiddleware = (configType = 'gallery', outputSubDir = 'processed') => {
  return async (req, res, next) => {
    try {
      if (!req.files || req.files.length === 0) {
        return next();
      }
      
      const results = await processImages(req.files, configType, outputSubDir);
      
      // Add processed images to request
      req.processedImages = results;
      
      // Extract URLs for easy access
      req.imageUrls = results.map(result => ({
        original: result.original.filename,
        urls: result.processed.reduce((acc, img) => {
          acc[img.size] = img.url;
          return acc;
        }, {})
      }));
      
      next();
    } catch (error) {
      next(error);
    }
  };
};

// Get image info
export const getImageInfo = async (imagePath) => {
  try {
    const metadata = await sharp(imagePath).metadata();
    const stats = await fs.stat(imagePath);
    
    return {
      width: metadata.width,
      height: metadata.height,
      format: metadata.format,
      size: stats.size,
      hasAlpha: metadata.hasAlpha,
      channels: metadata.channels,
      density: metadata.density
    };
  } catch (error) {
    return null;
  }
};

export default {
  processImage,
  processImages,
  createThumbnail,
  addWatermark,
  extractColors,
  validateImage,
  cleanupOldImages,
  imageProcessingMiddleware,
  getImageInfo,
  imageConfigs
};
