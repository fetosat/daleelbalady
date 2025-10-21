const { DataTypes } = require('sequelize');

const DeliveryRequest = (sequelize) => sequelize.define('DeliveryRequest', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  customerId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id',
    },
  },
  requestTitle: {
    type: DataTypes.STRING(255),
    allowNull: false,
    comment: 'عنوان مختصر للطلب مثل "احتاج شاي وسكر من أي محل"',
  },
  requestDescription: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'تفاصيل إضافية للطلب',
  },
  requestType: {
    type: DataTypes.ENUM('SPECIFIC_STORE', 'ANY_STORE', 'GROCERY', 'PHARMACY', 'RESTAURANT', 'OTHER'),
    allowNull: false,
    defaultValue: 'ANY_STORE',
  },
  specificStoreId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'shops',
      key: 'id',
    },
    comment: 'إذا كان الطلب من محل محدد',
  },
  items: {
    type: DataTypes.JSON,
    allowNull: false,
    comment: 'قائمة بالأشياء المطلوبة [{"name": "شاي", "quantity": "2 كيلو", "notes": "شاي أحمر"}, ...]',
  },
  pickupLocation: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: '{"address": "", "lat": 0, "lng": 0, "notes": ""}',
  },
  deliveryLocation: {
    type: DataTypes.JSON,
    allowNull: false,
    comment: '{"address": "", "lat": 0, "lng": 0, "notes": "", "phone": ""}',
  },
  customerBudget: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
    comment: 'الميزانية المتوقعة للمشتريات (بدون مصاريف التوصيل)',
  },
  preferredDeliveryTime: {
    type: DataTypes.ENUM('ASAP', 'WITHIN_1_HOUR', 'WITHIN_2_HOURS', 'TODAY', 'TOMORROW', 'SPECIFIC_TIME'),
    allowNull: false,
    defaultValue: 'ASAP',
  },
  specificDeliveryTime: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'إذا كان الوقت محدد',
  },
  status: {
    type: DataTypes.ENUM(
      'PENDING',        // في انتظار عروض
      'OFFERS_RECEIVED', // تم استلام عروض
      'OFFER_ACCEPTED',  // تم قبول عرض
      'PICKUP_IN_PROGRESS', // المندوب في الطريق للشراء
      'AT_PICKUP_LOCATION', // المندوب وصل لموقع الشراء
      'SHOPPING_IN_PROGRESS', // المندوب يقوم بالشراء
      'RECEIPT_SUBMITTED', // تم إرسال الفاتورة
      'DELIVERY_IN_PROGRESS', // المندوب في طريقه للعميل
      'AT_DELIVERY_LOCATION', // المندوب وصل للعميل
      'COMPLETED',      // تم التسليم والاستلام
      'CANCELLED',      // تم الإلغاء
      'EXPIRED'         // انتهت صلاحية الطلب
    ),
    allowNull: false,
    defaultValue: 'PENDING',
  },
  acceptedOfferId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'delivery_offers',
      key: 'id',
    },
  },
  chatId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'chats',
      key: 'id',
    },
    comment: 'المحادثة بين العميل والمندوب',
  },
  priority: {
    type: DataTypes.ENUM('LOW', 'NORMAL', 'HIGH', 'URGENT'),
    allowNull: false,
    defaultValue: 'NORMAL',
  },
  estimatedValue: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
    comment: 'القيمة التقديرية للطلب',
  },
  actualReceiptValue: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
    comment: 'القيمة الفعلية من الفاتورة',
  },
  deliveryFee: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
    comment: 'مصاريف التوصيل المتفق عليها',
  },
  totalAmount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
    comment: 'المبلغ الإجمالي (البضاعة + التوصيل)',
  },
  receiptImage: {
    type: DataTypes.STRING(500),
    allowNull: true,
    comment: 'رابط صورة الفاتورة',
  },
  customerNotes: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  deliveryNotes: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  rating: {
    type: DataTypes.INTEGER,
    allowNull: true,
    validate: {
      min: 1,
      max: 5,
    },
  },
  reviewComment: {
    type: DataTypes.TEXT,
    allowNull: true,
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
  expiresAt: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'تاريخ انتهاء صلاحية الطلب',
  },
}, {
  tableName: 'delivery_requests',
  timestamps: true,
  indexes: [
    {
      fields: ['customerId'],
    },
    {
      fields: ['status'],
    },
    {
      fields: ['createdAt'],
    },
    {
      fields: ['acceptedOfferId'],
    },
    {
      fields: ['expiresAt'],
    },
  ],
});

module.exports = DeliveryRequest;
