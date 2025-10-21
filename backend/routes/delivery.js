import express from 'express';
import multer from 'multer';
import path from 'path';
import deliveryController from '../controllers/deliveryController.js';
import { auth } from '../middleware/auth.js'; // middleware المصادقة
import roleCheck from '../middleware/roleCheck.js'; // middleware التحقق من الدور

const router = express.Router();

// إعداد multer لرفع الملفات
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/delivery/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB حد أقصى
  },
  fileFilter: (req, file, cb) => {
    // السماح بالصور فقط
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('يُسمح بالصور فقط'), false);
    }
  }
});

// === طلبات التوصيل ===

// حساب سعر التوصيل
router.post('/calculate-price',
  deliveryController.calculatePrice
);

// جلب السائقين القريبين
router.get('/nearby-drivers',
  auth,
  deliveryController.getNearbyDrivers
);

// إنشاء طلب توصيل جديد
router.post('/requests',
  auth, 
  roleCheck(['CUSTOMER']), 
  deliveryController.createDeliveryRequest
);

// جلب طلبات المستخدم
router.get('/requests/my', 
  auth, 
  roleCheck(['CUSTOMER']), 
  deliveryController.getMyDeliveryRequests
);

// جلب الطلبات المتاحة (للمندوبين)
router.get('/requests/available', 
  auth, 
  roleCheck(['DELIVERY']), 
  deliveryController.getAvailableDeliveryRequests
);

// جلب تفاصيل طلب محدد
router.get('/requests/:requestId', 
  auth, 
  deliveryController.getRequestDetails
);

// إلغاء طلب توصيل
router.put('/requests/:requestId/cancel', 
  auth, 
  roleCheck(['CUSTOMER']), 
  deliveryController.cancelDeliveryRequest
);

// === عروض الأسعار ===

// تقديم عرض سعر لطلب توصيل
router.post('/requests/:deliveryRequestId/offers', 
  auth, 
  roleCheck(['DELIVERY']), 
  deliveryController.submitDeliveryOffer
);

// جلب عروض الأسعار لطلب محدد
router.get('/requests/:deliveryRequestId/offers', 
  auth, 
  deliveryController.getRequestOffers
);

// قبول عرض سعر
router.post('/requests/:deliveryRequestId/offers/:deliveryOfferId/accept', 
  auth, 
  roleCheck(['CUSTOMER']), 
  deliveryController.acceptDeliveryOffer
);

// رفض عرض سعر
router.post('/requests/:deliveryRequestId/offers/:deliveryOfferId/reject', 
  auth, 
  roleCheck(['CUSTOMER']), 
  deliveryController.rejectDeliveryOffer
);

// سحب عرض سعر (من المندوب)
router.post('/offers/:deliveryOfferId/withdraw', 
  auth, 
  roleCheck(['DELIVERY']), 
  deliveryController.withdrawDeliveryOffer
);

// === إدارة الرحلات ===

// جلب تفاصيل رحلة محددة
router.get('/trips/:deliveryTripId', 
  auth, 
  deliveryController.getTripDetails
);

// تحديث حالة الرحلة
router.put('/trips/:deliveryTripId/status', 
  auth, 
  upload.single('receiptImage'),
  deliveryController.updateTripStatus
);

// تحديث موقع المندوب
router.put('/trips/:deliveryTripId/location', 
  auth, 
  roleCheck(['DELIVERY']), 
  deliveryController.updateDeliveryLocation
);

// رفع فاتورة الشراء
router.post('/trips/:deliveryTripId/receipt', 
  auth, 
  roleCheck(['DELIVERY']), 
  upload.single('receiptImage'),
  deliveryController.uploadReceipt
);

// تأكيد الدفع (من العميل)
router.post('/trips/:deliveryTripId/payment/confirm', 
  auth, 
  roleCheck(['CUSTOMER']), 
  deliveryController.confirmPayment
);

// === التأكيدات ===

// تأكيد التسليم/الاستلام
router.post('/trips/:deliveryTripId/confirm', 
  auth, 
  upload.array('photos', 5), // حتى 5 صور
  deliveryController.confirmDelivery
);

// إلغاء رحلة
router.put('/trips/:deliveryTripId/cancel', 
  auth, 
  deliveryController.cancelTrip
);

// === الإبلاغ عن المشاكل ===

// إبلاغ عن مشكلة في الرحلة
router.post('/trips/:deliveryTripId/report-issue', 
  auth, 
  upload.array('photos', 3), // حتى 3 صور للمشكلة
  deliveryController.reportIssue
);

// جلب المشاكل المُبلغ عنها
router.get('/trips/:deliveryTripId/issues', 
  auth, 
  deliveryController.getTripIssues
);

// حل مشكلة
router.put('/issues/:issueId/resolve', 
  auth, 
  roleCheck(['ADMIN', 'DELIVERY', 'CUSTOMER']), 
  deliveryController.resolveIssue
);

// === إحصائيات ومعلومات المندوب ===

// جلب رحلات المندوب
router.get('/my-trips', 
  auth, 
  roleCheck(['DELIVERY']), 
  deliveryController.getMyTrips
);

// جلب إحصائيات المندوب
router.get('/my-stats', 
  auth, 
  roleCheck(['DELIVERY']), 
  deliveryController.getDeliveryStats
);

// تحديث معلومات المندوب
router.put('/profile', 
  auth, 
  roleCheck(['DELIVERY']), 
  deliveryController.updateDeliveryProfile
);

// === التقييمات ===

// تقييم رحلة توصيل
router.post('/trips/:deliveryTripId/rate', 
  auth, 
  deliveryController.rateTripParticipant
);

// جلب تقييمات مندوب
router.get('/delivery-user/:userId/ratings', 
  deliveryController.getDeliveryUserRatings
);

// === البحث والفلترة ===

// البحث في الطلبات المتاحة
router.get('/requests/search', 
  auth, 
  roleCheck(['DELIVERY']), 
  deliveryController.searchAvailableRequests
);

// فلترة الرحلات
router.get('/trips/filter', 
  auth, 
  deliveryController.filterTrips
);

// === إعدادات المندوب ===

// تحديث منطقة التغطية
router.put('/coverage-area', 
  auth, 
  roleCheck(['DELIVERY']), 
  deliveryController.updateCoverageArea
);

// تحديث حالة التوفر
router.put('/availability', 
  auth, 
  roleCheck(['DELIVERY']), 
  deliveryController.updateAvailability
);

// === التقارير والتحليلات (للإدارة) ===

// تقرير شامل عن الطلبات
router.get('/admin/requests/report', 
  auth, 
  roleCheck(['ADMIN']), 
  deliveryController.getRequestsReport
);

// تقرير أداء المندوبين
router.get('/admin/delivery-performance', 
  auth, 
  roleCheck(['ADMIN']), 
  deliveryController.getDeliveryPerformanceReport
);

// إحصائيات عامة
router.get('/admin/statistics', 
  auth, 
  roleCheck(['ADMIN']), 
  deliveryController.getGeneralStatistics
);

// === Webhooks ===

// Payment webhook from Paymob
router.post('/webhooks/payment',
  deliveryController.handlePaymentWebhook
);

// === معالجة الأخطاء ===

// معالجة أخطاء رفع الملفات
router.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'حجم الملف كبير جداً (الحد الأقصى 5MB)'
      });
    }
    if (error.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({
        success: false,
        message: 'عدد الملفات يتجاوز الحد المسموح'
      });
    }
    return res.status(400).json({
      success: false,
      message: 'خطأ في رفع الملف'
    });
  }
  
  if (error.message === 'يُسمح بالصور فقط') {
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }
  
  next(error);
});

// معالجة الأخطاء العامة
router.use((error, req, res, next) => {
  console.error('Delivery route error:', error);
  
  res.status(500).json({
    success: false,
    message: 'خطأ داخلي في الخادم'
  });
});

export default router;
