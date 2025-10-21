const { DataTypes } = require('sequelize');

const DeliveryOffer = (sequelize) => sequelize.define('DeliveryOffer', {
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
  deliveryUserId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id',
    },
    comment: 'مندوب التوصيل الذي قدم العرض',
  },
  offerPrice: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    comment: 'سعر التوصيل المقترح',
  },
  estimatedPickupTime: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: 'الوقت التقديري للوصول لمحل الشراء (بالدقائق)',
  },
  estimatedDeliveryTime: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: 'الوقت التقديري الكامل للتوصيل (بالدقائق)',
  },
  offerMessage: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'رسالة من مندوب التوصيل للعميل',
  },
  deliveryMethod: {
    type: DataTypes.ENUM('MOTORCYCLE', 'CAR', 'BICYCLE', 'WALKING', 'OTHER'),
    allowNull: false,
    defaultValue: 'MOTORCYCLE',
  },
  canWaitForPayment: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true,
    comment: 'هل يمكن للمندوب انتظار دفع العميل للبضاعة',
  },
  advancePaymentRequired: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
    comment: 'مبلغ مقدم مطلوب من العميل',
  },
  offerValidUntil: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'تاريخ انتهاء صلاحية العرض',
  },
  status: {
    type: DataTypes.ENUM('PENDING', 'ACCEPTED', 'REJECTED', 'EXPIRED', 'WITHDRAWN'),
    allowNull: false,
    defaultValue: 'PENDING',
  },
  deliveryAreaCovered: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: 'المناطق التي يغطيها هذا المندوب',
  },
  vehicleDetails: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: '{"type": "Honda", "model": "2020", "plateNumber": "123 أ ب ج", "color": "أحمر"}',
  },
  deliveryRating: {
    type: DataTypes.DECIMAL(3, 2),
    allowNull: true,
    comment: 'تقييم مندوب التوصيل العام',
  },
  completedDeliveries: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
    comment: 'عدد الطلبات المكتملة لهذا المندوب',
  },
  responseTime: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: 'زمن الرد على الطلب (بالثواني)',
  },
  isCounterOffer: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
    comment: 'هل هذا عرض مضاد لعرض أولي',
  },
  originalOfferId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'delivery_offers',
      key: 'id',
    },
    comment: 'إشارة للعرض الأصلي في حالة العروض المضادة',
  },
  withdrawalReason: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'سبب سحب العرض',
  },
  acceptedAt: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  rejectedAt: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  withdrawnAt: {
    type: DataTypes.DATE,
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
}, {
  tableName: 'delivery_offers',
  timestamps: true,
  indexes: [
    {
      fields: ['deliveryRequestId'],
    },
    {
      fields: ['deliveryUserId'],
    },
    {
      fields: ['status'],
    },
    {
      fields: ['createdAt'],
    },
    {
      fields: ['offerPrice'],
    },
    {
      fields: ['estimatedDeliveryTime'],
    },
  ],
});

module.exports = DeliveryOffer;
