/**
 * ملف الربط الرئيسي لجميع الـ routes
 * يتم استيراده في server.js لربط جميع المسارات
 */

const express = require('express');
const router = express.Router();

// استيراد الـ routes الجديدة
const plansRoutes = require('./plans');
const pinVerificationRoutes = require('./pin-verification');

// ربط المسارات
router.use('/plans', plansRoutes);
router.use('/pin-verification', pinVerificationRoutes);

module.exports = router;
