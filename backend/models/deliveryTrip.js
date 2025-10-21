const { DataTypes } = require('sequelize');

const DeliveryTrip = (sequelize) => sequelize.define('DeliveryTrip', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  deliveryRequestId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'delivery_requests',
      key: 'id',
    },
  },
  deliveryOfferId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'delivery_offers',
      key: 'id',
    },
  },
  deliveryUserId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id',
    },
  },
  customerId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id',
    },
  },
  tripStatus: {
    type: DataTypes.ENUM(
      'ACCEPTED',              // تم قبول العرض وبدء الرحلة
      'HEADING_TO_PICKUP',     // في الطريق للشراء
      'AT_PICKUP_LOCATION',    // وصل لموقع الشراء
      'SHOPPING',              // يقوم بالشراء
      'RECEIPT_UPLOADED',      // رفع الفاتورة
      'PAYMENT_CONFIRMED',     // تأكيد الدفع من العميل
      'HEADING_TO_DELIVERY',   // في الطريق للعميل
      'AT_DELIVERY_LOCATION',  // وصل للعميل
      'DELIVERED',             // تم التسليم
      'CUSTOMER_CONFIRMED',    // العميل أكد الاستلام
      'COMPLETED',             // اكتملت الرحلة
      'CANCELLED',             // تم إلغاء الرحلة
      'PROBLEM_REPORTED'       // تم الإبلاغ عن مشكلة
    ),
    allowNull: false,
    defaultValue: 'ACCEPTED',
  },
  currentLocation: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: '{"lat": 0, "lng": 0, "address": "", "timestamp": ""}',
  },
  pickupLocation: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: 'موقع الشراء المحدد',
  },
  deliveryLocation: {
    type: DataTypes.JSON,
    allowNull: false,
    comment: 'موقع التسليم',
  },
  estimatedPickupTime: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  actualPickupTime: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  estimatedDeliveryTime: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  actualDeliveryTime: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  receiptDetails: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: '{"imageUrl": "", "totalAmount": 0, "items": [], "uploadedAt": ""}',
  },
  paymentStatus: {
    type: DataTypes.ENUM('PENDING', 'ADVANCE_PAID', 'FULL_PAID', 'COD_PENDING', 'COMPLETED'),
    allowNull: false,
    defaultValue: 'PENDING',
  },
  totalTripCost: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
    comment: 'التكلفة الإجمالية (بضاعة + توصيل)',
  },
  itemsCost: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
    comment: 'تكلفة البضاعة',
  },
  deliveryFee: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    comment: 'مصاريف التوصيل',
  },
  advancePayment: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
    comment: 'المبلغ المدفوع مقدماً',
  },
  remainingPayment: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
    comment: 'المبلغ المتبقي للدفع',
  },
  deliveryNotes: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'ملاحظات من مندوب التوصيل',
  },
  customerNotes: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'ملاحظات من العميل',
  },
  problems: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: 'قائمة بالمشاكل المبلغ عنها',
  },
  deliveryRating: {
    type: DataTypes.INTEGER,
    allowNull: true,
    validate: {
      min: 1,
      max: 5,
    },
    comment: 'تقييم العميل للمندوب',
  },
  customerRating: {
    type: DataTypes.INTEGER,
    allowNull: true,
    validate: {
      min: 1,
      max: 5,
    },
    comment: 'تقييم المندوب للعميل',
  },
  deliveryReview: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'تعليق العميل على المندوب',
  },
  customerReview: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'تعليق المندوب على العميل',
  },
  tripStartedAt: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  tripCompletedAt: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  totalDuration: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: 'مدة الرحلة الإجمالية بالدقائق',
  },
  distanceTraveled: {
    type: DataTypes.DECIMAL(8, 2),
    allowNull: true,
    comment: 'المسافة المقطوعة بالكيلومتر',
  },
  routeData: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: 'بيانات المسار المسلوك',
  },
  confirmationCodes: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: '{"deliveryCode": "", "customerCode": "", "usedAt": ""}',
  },
  createdAt: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
  },
  updatedAt: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
  },
}, {
  tableName: 'delivery_trips',
  timestamps: true,
  indexes: [
    {
      fields: ['deliveryRequestId'],
    },
    {
      fields: ['deliveryUserId'],
    },
    {
      fields: ['customerId'],
    },
    {
      fields: ['tripStatus'],
    },
    {
      fields: ['createdAt'],
    },
    {
      fields: ['tripStartedAt'],
    },
  ],
});

// نموذج تتبع حالات الرحلة
const TripStatusUpdate = (sequelize) => sequelize.define('TripStatusUpdate', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  deliveryTripId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'delivery_trips',
      key: 'id',
    },
  },
  previousStatus: {
    type: DataTypes.STRING(50),
    allowNull: true,
  },
  newStatus: {
    type: DataTypes.STRING(50),
    allowNull: false,
  },
  updatedBy: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id',
    },
  },
  updateLocation: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: 'موقع التحديث',
  },
  updateMessage: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'رسالة التحديث',
  },
  attachments: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: 'مرفقات (صور، ملفات)',
  },
  isAutomated: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
    comment: 'هل التحديث تلقائي أم يدوي',
  },
  notificationSent: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  },
  createdAt: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
  },
}, {
  tableName: 'trip_status_updates',
  timestamps: false,
  indexes: [
    {
      fields: ['deliveryTripId'],
    },
    {
      fields: ['newStatus'],
    },
    {
      fields: ['updatedBy'],
    },
    {
      fields: ['createdAt'],
    },
  ],
});

module.exports = { DeliveryTrip, TripStatusUpdate };
