// Translation system for admin pages
// Supports Arabic (ar) and English (en)

export type Locale = 'ar' | 'en';

export interface Translations {
  // Navigation
  nav: {
    dashboard: string;
    users: string;
    shops: string;
    services: string;
    products: string;
    bookings: string;
    orders: string;
    payments: string;
    subscriptions: string;
    applications: string;
    coupons: string;
    categories: string;
    reviews: string;
    notifications: string;
    deliveries: string;
    analytics: string;
    activity: string;
    settings: string;
  };

  // Dashboard
  dashboard: {
    title: string;
    overview: string;
    stats: {
      totalUsers: string;
      providers: string;
      customers: string;
      recentSignups: string;
      totalShops: string;
      totalServices: string;
      totalProducts: string;
      totalBookings: string;
      recentBookings: string;
      totalOrders: string;
      totalRevenue: string;
      activeSubscriptions: string;
      pendingApplications: string;
    };
    failedToLoadStats: string;
  };

  // Common
  common: {
    save: string;
    cancel: string;
    delete: string;
    edit: string;
    view: string;
    create: string;
    search: string;
    filter: string;
    open: string;
    openPublicPage: string;
    loading: string;
    noData: string;
    page: string;
    of: string;
    previous: string;
    next: string;
    required: string;
    optional: string;
    actions: string;
    status: string;
    createdAt: string;
    updatedAt: string;
    yes: string;
    no: string;
    active: string;
    inactive: string;
    verified: string;
    unverified: string;
    name: string;
    description: string;
    email: string;
    phone: string;
    city: string;
    price: string;
    currency: string;
    admin: string;
    new: string;
  };

  // Products
  products: {
    title: string;
    description: string;
    createNew: string;
    editProduct: string;
    viewProduct: string;
    deleteProduct: string;
    deleteConfirm: string;
    name: string;
    sku: string;
    price: string;
    currency: string;
    stock: string;
    shop: string;
    description_field: string;
    embeddingText: string;
    isActive: string;
    selectShop: string;
    createSuccess: string;
    updateSuccess: string;
    deleteSuccess: string;
    createError: string;
    updateError: string;
    deleteError: string;
    validationError: string;
    totalProducts: string;
    activeProducts: string;
    lowStock: string;
    outOfStock: string;
    productsList: string;
  };

  // Services
  services: {
    title: string;
    description: string;
    createNew: string;
    editService: string;
    viewService: string;
    deleteService: string;
    deleteConfirm: string;
    embeddingText: string;
    phone: string;
    city: string;
    price: string;
    currency: string;
    duration: string;
    durationMins: string;
    available: string;
    shop: string;
    subCategory: string;
    selectShop: string;
    selectSubCategory: string;
    noShop: string;
    noSubCategory: string;
    createSuccess: string;
    updateSuccess: string;
    deleteSuccess: string;
    createError: string;
    updateError: string;
    deleteError: string;
    validationError: string;
    totalServices: string;
    availableServices: string;
    totalBookings: string;
    totalReviews: string;
    servicesList: string;
    serviceDescription: string;
  };

  // Shops
  shops: {
    title: string;
    description: string;
    createNew: string;
    editShop: string;
    viewShop: string;
    deleteShop: string;
    deleteConfirm: string;
    name: string;
    owner: string;
    description_field: string;
    phone: string;
    email: string;
    website: string;
    city: string;
    location: string;
    latitude: string;
    longitude: string;
    isVerified: string;
    selectOwner: string;
    createSuccess: string;
    updateSuccess: string;
    deleteSuccess: string;
    createError: string;
    updateError: string;
    deleteError: string;
    validationError: string;
    totalShops: string;
    verifiedShops: string;
    totalServices: string;
    totalProducts: string;
    shopsList: string;
  };

  // Users
  users: {
    title: string;
    description: string;
    createNew: string;
    editUser: string;
    viewUser: string;
    deleteUser: string;
    deleteConfirm: string;
    openProfile: string;
    viewDetails: string;
    name: string;
    email: string;
    phone: string;
    password: string;
    newPassword: string;
    leaveEmptyNoChange: string;
    role: string;
    bio: string;
    profilePic: string;
    isVerified: string;
    verifiedBadge: string;
    roles: {
      GUEST: string;
      CUSTOMER: string;
      PROVIDER: string;
      DELIVERY: string;
      ADMIN: string;
    };
    createSuccess: string;
    updateSuccess: string;
    deleteSuccess: string;
    createError: string;
    updateError: string;
    deleteError: string;
    validationError: string;
    validationPasswordRequired: string;
    statistics: string;
    registrationDate: string;
  };

  // Categories
  categories: {
    title: string;
    description: string;
    createNew: string;
    createSubCategory: string;
    editCategory: string;
    editSubCategory: string;
    viewCategory: string;
    deleteCategory: string;
    deleteSubCategory: string;
    deleteConfirm: string;
    name: string;
    slug: string;
    description_field: string;
    design: string;
    selectDesign: string;
    parentCategory: string;
    createSuccess: string;
    updateSuccess: string;
    deleteSuccess: string;
    createError: string;
    updateError: string;
    deleteError: string;
    validationError: string;
    totalCategories: string;
    totalSubCategories: string;
    totalServices: string;
    categoriesList: string;
    subCategories: string;
    expand: string;
    collapse: string;
  };

  // Bookings
  bookings: {
    title: string;
    description: string;
    createNew: string;
    editBooking: string;
    viewBooking: string;
    deleteBooking: string;
    deleteConfirm: string;
    user: string;
    service: string;
    shop: string;
    startAt: string;
    endAt: string;
    duration: string;
    durationMins: string;
    status: string;
    price: string;
    currency: string;
    notes: string;
    selectUser: string;
    selectService: string;
    selectShop: string;
    statuses: {
      PENDING: string;
      CONFIRMED: string;
      CANCELLED: string;
      COMPLETED: string;
      NO_SHOW: string;
    };
    createSuccess: string;
    updateSuccess: string;
    deleteSuccess: string;
    createError: string;
    updateError: string;
    deleteError: string;
    validationError: string;
    totalBookings: string;
    bookingsList: string;
  };

  // Orders
  orders: {
    title: string;
    description: string;
    createNew: string;
    editOrder: string;
    viewOrder: string;
    deleteOrder: string;
    deleteConfirm: string;
    orderNumber: string;
    user: string;
    totalAmount: string;
    currency: string;
    status: string;
    paymentMethod: string;
    items: string;
    selectUser: string;
    statuses: {
      PENDING: string;
      CONFIRMED: string;
      PACKED: string;
      SHIPPED: string;
      DELIVERED: string;
      CANCELLED: string;
      RETURNED: string;
    };
    paymentMethods: {
      CASH: string;
      CARD: string;
      WALLET: string;
      ONLINE: string;
    };
    createSuccess: string;
    updateSuccess: string;
    deleteSuccess: string;
    createError: string;
    updateError: string;
    deleteError: string;
    validationError: string;
    totalOrders: string;
    ordersList: string;
  };

  // Payments
  payments: {
    title: string;
    description: string;
    totalPayments: string;
    successfulPayments: string;
    pendingPayments: string;
    failedPayments: string;
  };

  // Subscriptions
  subscriptions: {
    title: string;
    description: string;
    totalSubscriptions: string;
    activeSubscriptions: string;
    expiredSubscriptions: string;
  };

  // Applications
  applications: {
    title: string;
    description: string;
    totalApplications: string;
    pendingApplications: string;
    approvedApplications: string;
    rejectedApplications: string;
  };

  // Coupons
  coupons: {
    title: string;
    description: string;
    totalCoupons: string;
    activeCoupons: string;
    expiredCoupons: string;
  };

  // Reviews
  reviews: {
    title: string;
    description: string;
    totalReviews: string;
    pendingReviews: string;
    approvedReviews: string;
    averageRating: string;
  };

  // Notifications
  notifications: {
    title: string;
    description: string;
    totalNotifications: string;
    unreadNotifications: string;
  };

  // Deliveries
  deliveries: {
    title: string;
    description: string;
    totalDeliveries: string;
    pendingDeliveries: string;
    completedDeliveries: string;
  };

  // Analytics
  analytics: {
    title: string;
    description: string;
    overview: string;
  };

  // Activity
  activity: {
    title: string;
    description: string;
    recentActivity: string;
  };

  // Settings
  settings: {
    title: string;
    description: string;
    generalSettings: string;
  };
}

export const translations: Record<Locale, Translations> = {
  ar: {
    nav: {
      dashboard: 'لوحة التحكم',
      users: 'المستخدمين',
      shops: 'المتاجر',
      services: 'الخدمات',
      products: 'المنتجات',
      bookings: 'الحجوزات',
      orders: 'الطلبات',
      payments: 'المدفوعات',
      subscriptions: 'الاشتراكات',
      applications: 'طلبات الأعمال',
      coupons: 'كوبونات الخصم',
      categories: 'التصنيفات',
      reviews: 'التقييمات',
      notifications: 'الإشعارات',
      deliveries: 'التوصيل',
      analytics: 'التحليلات',
      activity: 'النشاط',
      settings: 'الإعدادات',
    },
    dashboard: {
      title: 'لوحة التحكم',
      overview: 'نظرة عامة',
      stats: {
        totalUsers: 'إجمالي المستخدمين',
        providers: 'مقدمو الخدمات',
        customers: 'العملاء',
        recentSignups: 'تسجيلات جديدة',
        totalShops: 'إجمالي المتاجر',
        totalServices: 'إجمالي الخدمات',
        totalProducts: 'إجمالي المنتجات',
        totalBookings: 'إجمالي الحجوزات',
        recentBookings: 'حجوزات جديدة',
        totalOrders: 'إجمالي الطلبات',
        totalRevenue: 'إجمالي الإيرادات',
        activeSubscriptions: 'اشتراكات نشطة',
        pendingApplications: 'طلبات معلقة',
      },
      failedToLoadStats: 'فشل في تحميل الإحصائيات',
    },
    common: {
      save: 'حفظ',
      cancel: 'إلغاء',
      delete: 'حذف',
      edit: 'تعديل',
      view: 'عرض',
      create: 'إنشاء',
      search: 'بحث',
      filter: 'فلتر',
      open: 'فتح',
      openPublicPage: 'فتح الصفحة العامة',
      loading: 'جاري التحميل...',
      noData: 'لا توجد بيانات',
      page: 'صفحة',
      of: 'من',
      previous: 'السابق',
      next: 'التالي',
      required: 'مطلوب',
      optional: 'اختياري',
      actions: 'إجراءات',
      status: 'الحالة',
      createdAt: 'تاريخ الإنشاء',
      updatedAt: 'تاريخ التحديث',
      yes: 'نعم',
      no: 'لا',
      active: 'نشط',
      inactive: 'غير نشط',
      verified: 'موثق',
      unverified: 'غير موثق',
      name: 'الاسم',
      description: 'الوصف',
      email: 'البريد الإلكتروني',
      phone: 'الهاتف',
      city: 'المدينة',
      price: 'السعر',
      currency: 'العملة',
      admin: 'مدير',
      new: 'جديد',
    },
    products: {
      title: 'إدارة المنتجات',
      description: 'عرض وإدارة جميع المنتجات في المنصة',
      createNew: 'منتج جديد',
      editProduct: 'تعديل المنتج',
      viewProduct: 'تفاصيل المنتج',
      deleteProduct: 'حذف المنتج',
      deleteConfirm: 'هل أنت متأكد من حذف هذا المنتج؟',
      name: 'اسم المنتج',
      sku: 'رمز المنتج (SKU)',
      price: 'السعر',
      currency: 'العملة',
      stock: 'المخزون',
      shop: 'المتجر',
      description_field: 'الوصف',
      embeddingText: 'نص البحث (Embedding Text)',
      isActive: 'منتج نشط',
      selectShop: 'اختر متجر',
      createSuccess: 'تم إنشاء المنتج بنجاح',
      updateSuccess: 'تم تحديث المنتج بنجاح',
      deleteSuccess: 'تم حذف المنتج بنجاح',
      createError: 'فشل في إنشاء المنتج',
      updateError: 'فشل في تحديث المنتج',
      deleteError: 'فشل في حذف المنتج',
      validationError: 'الرجاء إدخال الاسم والسعر والمتجر',
      totalProducts: 'إجمالي المنتجات',
      activeProducts: 'نشطة',
      lowStock: 'مخزون منخفض',
      outOfStock: 'نفذ من المخزون',
      productsList: 'قائمة المنتجات',
    },
    services: {
      title: 'إدارة الخدمات',
      description: 'عرض وإدارة جميع الخدمات في المنصة',
      createNew: 'خدمة جديدة',
      editService: 'تعديل الخدمة',
      viewService: 'تفاصيل الخدمة',
      deleteService: 'حذف الخدمة',
      deleteConfirm: 'هل أنت متأكد من حذف هذه الخدمة؟',
      embeddingText: 'وصف الخدمة',
      phone: 'الهاتف',
      city: 'المدينة',
      price: 'السعر',
      currency: 'العملة',
      duration: 'المدة',
      durationMins: 'المدة (دقيقة)',
      available: 'خدمة متاحة',
      shop: 'المتجر',
      subCategory: 'الفئة الفرعية',
      selectShop: 'اختياري - بدون متجر',
      selectSubCategory: 'اختياري - بدون فئة',
      noShop: 'بدون متجر',
      noSubCategory: 'بدون فئة',
      createSuccess: 'تم إنشاء الخدمة بنجاح',
      updateSuccess: 'تم تحديث الخدمة بنجاح',
      deleteSuccess: 'تم حذف الخدمة بنجاح',
      createError: 'فشل في إنشاء الخدمة',
      updateError: 'فشل في تحديث الخدمة',
      deleteError: 'فشل في حذف الخدمة',
      validationError: 'الرجاء إدخال وصف الخدمة',
      totalServices: 'إجمالي الخدمات',
      availableServices: 'متاحة',
      totalBookings: 'إجمالي الحجوزات',
      totalReviews: 'إجمالي التقييمات',
      servicesList: 'قائمة الخدمات',
      serviceDescription: 'أدخل وصف شامل للخدمة',
    },
    shops: {
      title: 'إدارة المتاجر',
      description: 'عرض وإدارة جميع المتاجر في المنصة',
      createNew: 'متجر جديد',
      editShop: 'تعديل المتجر',
      viewShop: 'تفاصيل المتجر',
      deleteShop: 'حذف المتجر',
      deleteConfirm: 'هل أنت متأكد من حذف هذا المتجر؟',
      name: 'اسم المتجر',
      owner: 'المالك',
      description_field: 'الوصف',
      phone: 'الهاتف',
      email: 'البريد الإلكتروني',
      website: 'الموقع الإلكتروني',
      city: 'المدينة',
      location: 'الموقع الجغرافي (اختياري)',
      latitude: 'خط العرض (Latitude)',
      longitude: 'خط الطول (Longitude)',
      isVerified: 'متجر موثق',
      selectOwner: 'اختر مالك المتجر',
      createSuccess: 'تم إنشاء المتجر بنجاح',
      updateSuccess: 'تم تحديث المتجر بنجاح',
      deleteSuccess: 'تم حذف المتجر بنجاح',
      createError: 'فشل في إنشاء المتجر',
      updateError: 'فشل في تحديث المتجر',
      deleteError: 'فشل في حذف المتجر',
      validationError: 'الرجاء إدخال اسم المتجر واختيار المالك',
      totalShops: 'إجمالي المتاجر',
      verifiedShops: 'موثقة',
      totalServices: 'إجمالي الخدمات',
      totalProducts: 'إجمالي المنتجات',
      shopsList: 'قائمة المتاجر',
    },
    users: {
      title: 'إدارة المستخدمين',
      description: 'عرض وإدارة جميع المستخدمين في المنصة',
      createNew: 'إضافة مستخدم جديد',
      editUser: 'تعديل المستخدم',
      viewUser: 'تفاصيل المستخدم',
      deleteUser: 'حذف المستخدم',
      deleteConfirm: 'هل أنت متأكد من حذف هذا المستخدم؟',
      openProfile: 'فتح الملف الشخصي',
      viewDetails: 'عرض التفاصيل',
      name: 'الاسم',
      email: 'البريد الإلكتروني',
      phone: 'رقم الهاتف',
      password: 'كلمة المرور',
      newPassword: 'كلمة المرور الجديدة (اختياري)',
      leaveEmptyNoChange: 'اتركها فارغة لعدم التغيير',
      role: 'الدور',
      bio: 'النبذة الشخصية',
      profilePic: 'رابط صورة الملف الشخصي',
      isVerified: 'مستخدم مؤكد',
      verifiedBadge: 'شارة التحقق',
      roles: {
        GUEST: 'زائر',
        CUSTOMER: 'عميل',
        PROVIDER: 'مقدم خدمة',
        DELIVERY: 'توصيل',
        ADMIN: 'مدير',
      },
      createSuccess: 'تم إنشاء المستخدم بنجاح',
      updateSuccess: 'تم تحديث المستخدم بنجاح',
      deleteSuccess: 'تم حذف المستخدم بنجاح',
      createError: 'فشل في إنشاء المستخدم',
      updateError: 'فشل في تحديث المستخدم',
      deleteError: 'فشل في حذف المستخدم',
      validationError: 'الرجاء إدخال اسم المستخدم',
      validationPasswordRequired: 'الرجاء إدخال كلمة المرور',
      statistics: 'الإحصائيات',
      registrationDate: 'تاريخ التسجيل',
    },
    categories: {
      title: 'إدارة الفئات',
      description: 'إدارة فئات الخدمات والمنتجات',
      createNew: 'فئة جديدة',
      createSubCategory: 'إضافة فئة فرعية',
      editCategory: 'تعديل الفئة',
      editSubCategory: 'تعديل الفئة الفرعية',
      viewCategory: 'تفاصيل الفئة',
      deleteCategory: 'حذف الفئة',
      deleteSubCategory: 'حذف الفئة الفرعية',
      deleteConfirm: 'هل أنت متأكد من حذف هذه الفئة؟',
      name: 'اسم الفئة',
      slug: 'المعرف (Slug)',
      description_field: 'الوصف',
      design: 'التصميم',
      selectDesign: 'اختر تصميم',
      parentCategory: 'الفئة الرئيسية',
      createSuccess: 'تم إنشاء الفئة بنجاح',
      updateSuccess: 'تم تحديث الفئة بنجاح',
      deleteSuccess: 'تم حذف الفئة بنجاح',
      createError: 'فشل في إنشاء الفئة',
      updateError: 'فشل في تحديث الفئة',
      deleteError: 'فشل في حذف الفئة',
      validationError: 'الرجاء إدخال اسم الفئة واختيار التصميم',
      totalCategories: 'إجمالي الفئات',
      totalSubCategories: 'الفئات الفرعية',
      totalServices: 'الخدمات',
      categoriesList: 'قائمة الفئات',
      subCategories: 'فئات فرعية',
      expand: 'توسيع',
      collapse: 'طي',
    },
    bookings: {
      title: 'إدارة الحجوزات',
      description: 'عرض وإدارة جميع الحجوزات في المنصة',
      createNew: 'حجز جديد',
      editBooking: 'تعديل الحجز',
      viewBooking: 'تفاصيل الحجز',
      deleteBooking: 'حذف الحجز',
      deleteConfirm: 'هل أنت متأكد من حذف هذا الحجز؟',
      user: 'المستخدم',
      service: 'الخدمة',
      shop: 'المتجر',
      startAt: 'وقت البداية',
      endAt: 'وقت النهاية',
      duration: 'المدة',
      durationMins: 'المدة (دقيقة)',
      status: 'الحالة',
      price: 'السعر',
      currency: 'العملة',
      notes: 'ملاحظات',
      selectUser: 'اختر مستخدم',
      selectService: 'اختر خدمة',
      selectShop: 'اختر متجر',
      statuses: {
        PENDING: 'قيد الانتظار',
        CONFIRMED: 'مؤكد',
        CANCELLED: 'ملغي',
        COMPLETED: 'مكتمل',
        NO_SHOW: 'لم يحضر',
      },
      createSuccess: 'تم إنشاء الحجز بنجاح',
      updateSuccess: 'تم تحديث الحجز بنجاح',
      deleteSuccess: 'تم حذف الحجز بنجاح',
      createError: 'فشل في إنشاء الحجز',
      updateError: 'فشل في تحديث الحجز',
      deleteError: 'فشل في حذف الحجز',
      validationError: 'الرجاء إدخال جميع الحقول المطلوبة',
      totalBookings: 'إجمالي الحجوزات',
      bookingsList: 'قائمة الحجوزات',
    },
    orders: {
      title: 'إدارة الطلبات',
      description: 'عرض وإدارة جميع الطلبات في المنصة',
      createNew: 'طلب جديد',
      editOrder: 'تعديل الطلب',
      viewOrder: 'تفاصيل الطلب',
      deleteOrder: 'حذف الطلب',
      deleteConfirm: 'هل أنت متأكد من حذف هذا الطلب؟',
      orderNumber: 'رقم الطلب',
      user: 'المستخدم',
      totalAmount: 'المبلغ الإجمالي',
      currency: 'العملة',
      status: 'الحالة',
      paymentMethod: 'طريقة الدفع',
      items: 'العناصر',
      selectUser: 'اختر مستخدم',
      statuses: {
        PENDING: 'قيد الانتظار',
        CONFIRMED: 'مؤكد',
        PACKED: 'معبأ',
        SHIPPED: 'تم الشحن',
        DELIVERED: 'تم التسليم',
        CANCELLED: 'ملغي',
        RETURNED: 'مرتجع',
      },
      paymentMethods: {
        CASH: 'نقدي',
        CARD: 'بطاقة',
        WALLET: 'محفظة إلكترونية',
        ONLINE: 'أونلاين',
      },
      createSuccess: 'تم إنشاء الطلب بنجاح',
      updateSuccess: 'تم تحديث الطلب بنجاح',
      deleteSuccess: 'تم حذف الطلب بنجاح',
      createError: 'فشل في إنشاء الطلب',
      updateError: 'فشل في تحديث الطلب',
      deleteError: 'فشل في حذف الطلب',
      validationError: 'الرجاء إدخال جميع الحقول المطلوبة',
      totalOrders: 'إجمالي الطلبات',
      ordersList: 'قائمة الطلبات',
    },
    payments: {
      title: 'إدارة المدفوعات',
      description: 'عرض وإدارة جميع المدفوعات في المنصة',
      totalPayments: 'إجمالي المدفوعات',
      successfulPayments: 'مدفوعات ناجحة',
      pendingPayments: 'مدفوعات معلقة',
      failedPayments: 'مدفوعات فاشلة',
    },
    subscriptions: {
      title: 'إدارة الاشتراكات',
      description: 'عرض وإدارة اشتراكات المستخدمين',
      totalSubscriptions: 'إجمالي الاشتراكات',
      activeSubscriptions: 'اشتراكات نشطة',
      expiredSubscriptions: 'اشتراكات منتهية',
    },
    applications: {
      title: 'طلبات الأعمال',
      description: 'عرض وإدارة طلبات الأعمال الجديدة',
      totalApplications: 'إجمالي الطلبات',
      pendingApplications: 'طلبات معلقة',
      approvedApplications: 'طلبات موافق عليها',
      rejectedApplications: 'طلبات مرفوضة',
    },
    coupons: {
      title: 'إدارة كوبونات الخصم',
      description: 'عرض وإدارة كوبونات الخصم',
      totalCoupons: 'إجمالي الكوبونات',
      activeCoupons: 'كوبونات نشطة',
      expiredCoupons: 'كوبونات منتهية',
    },
    reviews: {
      title: 'إدارة التقييمات',
      description: 'عرض وإدارة تقييمات المستخدمين',
      totalReviews: 'إجمالي التقييمات',
      pendingReviews: 'تقييمات معلقة',
      approvedReviews: 'تقييمات موافق عليها',
      averageRating: 'متوسط التقييم',
    },
    notifications: {
      title: 'إدارة الإشعارات',
      description: 'عرض وإدارة إشعارات النظام',
      totalNotifications: 'إجمالي الإشعارات',
      unreadNotifications: 'إشعارات غير مقروءة',
    },
    deliveries: {
      title: 'إدارة التوصيل',
      description: 'عرض وإدارة طلبات التوصيل',
      totalDeliveries: 'إجمالي التوصيلات',
      pendingDeliveries: 'توصيلات معلقة',
      completedDeliveries: 'توصيلات مكتملة',
    },
    analytics: {
      title: 'التحليلات',
      description: 'عرض تحليلات المنصة والإحصائيات',
      overview: 'نظرة عامة',
    },
    activity: {
      title: 'سجل النشاط',
      description: 'عرض سجل نشاطات المستخدمين',
      recentActivity: 'النشاط الأخير',
    },
    settings: {
      title: 'الإعدادات',
      description: 'إدارة إعدادات النظام',
      generalSettings: 'الإعدادات العامة',
    },
  },
  en: {
    nav: {
      dashboard: 'Dashboard',
      users: 'Users',
      shops: 'Shops',
      services: 'Services',
      products: 'Products',
      bookings: 'Bookings',
      orders: 'Orders',
      payments: 'Payments',
      subscriptions: 'Subscriptions',
      applications: 'Applications',
      coupons: 'Coupons',
      categories: 'Categories',
      reviews: 'Reviews',
      notifications: 'Notifications',
      deliveries: 'Deliveries',
      analytics: 'Analytics',
      activity: 'Activity',
      settings: 'Settings',
    },
    dashboard: {
      title: 'Dashboard',
      overview: 'Overview',
      stats: {
        totalUsers: 'Total Users',
        providers: 'Service Providers',
        customers: 'Customers',
        recentSignups: 'Recent Signups',
        totalShops: 'Total Shops',
        totalServices: 'Total Services',
        totalProducts: 'Total Products',
        totalBookings: 'Total Bookings',
        recentBookings: 'Recent Bookings',
        totalOrders: 'Total Orders',
        totalRevenue: 'Total Revenue',
        activeSubscriptions: 'Active Subscriptions',
        pendingApplications: 'Pending Applications',
      },
      failedToLoadStats: 'Failed to load statistics',
    },
    common: {
      save: 'Save',
      cancel: 'Cancel',
      delete: 'Delete',
      edit: 'Edit',
      view: 'View',
      create: 'Create',
      search: 'Search',
      filter: 'Filter',
      open: 'Open',
      openPublicPage: 'Open Public Page',
      loading: 'Loading...',
      noData: 'No Data',
      page: 'Page',
      of: 'of',
      previous: 'Previous',
      next: 'Next',
      required: 'Required',
      optional: 'Optional',
      actions: 'Actions',
      status: 'Status',
      createdAt: 'Created At',
      updatedAt: 'Updated At',
      yes: 'Yes',
      no: 'No',
      active: 'Active',
      inactive: 'Inactive',
      verified: 'Verified',
      unverified: 'Unverified',
      name: 'Name',
      description: 'Description',
      email: 'Email',
      phone: 'Phone',
      city: 'City',
      price: 'Price',
      currency: 'Currency',
      admin: 'Admin',
      new: 'New',
    },
    products: {
      title: 'Product Management',
      description: 'View and manage all products on the platform',
      createNew: 'New Product',
      editProduct: 'Edit Product',
      viewProduct: 'Product Details',
      deleteProduct: 'Delete Product',
      deleteConfirm: 'Are you sure you want to delete this product?',
      name: 'Product Name',
      sku: 'SKU',
      price: 'Price',
      currency: 'Currency',
      stock: 'Stock',
      shop: 'Shop',
      description_field: 'Description',
      embeddingText: 'Embedding Text',
      isActive: 'Active Product',
      selectShop: 'Select Shop',
      createSuccess: 'Product created successfully',
      updateSuccess: 'Product updated successfully',
      deleteSuccess: 'Product deleted successfully',
      createError: 'Failed to create product',
      updateError: 'Failed to update product',
      deleteError: 'Failed to delete product',
      validationError: 'Please enter name, price, and shop',
      totalProducts: 'Total Products',
      activeProducts: 'Active',
      lowStock: 'Low Stock',
      outOfStock: 'Out of Stock',
      productsList: 'Products List',
    },
    services: {
      title: 'Service Management',
      description: 'View and manage all services on the platform',
      createNew: 'New Service',
      editService: 'Edit Service',
      viewService: 'Service Details',
      deleteService: 'Delete Service',
      deleteConfirm: 'Are you sure you want to delete this service?',
      embeddingText: 'Service Description',
      phone: 'Phone',
      city: 'City',
      price: 'Price',
      currency: 'Currency',
      duration: 'Duration',
      durationMins: 'Duration (minutes)',
      available: 'Service Available',
      shop: 'Shop',
      subCategory: 'Sub Category',
      selectShop: 'Optional - No Shop',
      selectSubCategory: 'Optional - No Category',
      noShop: 'No Shop',
      noSubCategory: 'No Category',
      createSuccess: 'Service created successfully',
      updateSuccess: 'Service updated successfully',
      deleteSuccess: 'Service deleted successfully',
      createError: 'Failed to create service',
      updateError: 'Failed to update service',
      deleteError: 'Failed to delete service',
      validationError: 'Please enter service description',
      totalServices: 'Total Services',
      availableServices: 'Available',
      totalBookings: 'Total Bookings',
      totalReviews: 'Total Reviews',
      servicesList: 'Services List',
      serviceDescription: 'Enter comprehensive service description',
    },
    shops: {
      title: 'Shop Management',
      description: 'View and manage all shops on the platform',
      createNew: 'New Shop',
      editShop: 'Edit Shop',
      viewShop: 'Shop Details',
      deleteShop: 'Delete Shop',
      deleteConfirm: 'Are you sure you want to delete this shop?',
      name: 'Shop Name',
      owner: 'Owner',
      description_field: 'Description',
      phone: 'Phone',
      email: 'Email',
      website: 'Website',
      city: 'City',
      location: 'Geographic Location (Optional)',
      latitude: 'Latitude',
      longitude: 'Longitude',
      isVerified: 'Verified Shop',
      selectOwner: 'Select Shop Owner',
      createSuccess: 'Shop created successfully',
      updateSuccess: 'Shop updated successfully',
      deleteSuccess: 'Shop deleted successfully',
      createError: 'Failed to create shop',
      updateError: 'Failed to update shop',
      deleteError: 'Failed to delete shop',
      validationError: 'Please enter shop name and select owner',
      totalShops: 'Total Shops',
      verifiedShops: 'Verified',
      totalServices: 'Total Services',
      totalProducts: 'Total Products',
      shopsList: 'Shops List',
    },
    users: {
      title: 'User Management',
      description: 'View and manage all users on the platform',
      createNew: 'Add New User',
      editUser: 'Edit User',
      viewUser: 'User Details',
      deleteUser: 'Delete User',
      deleteConfirm: 'Are you sure you want to delete this user?',
      openProfile: 'Open Profile',
      viewDetails: 'View Details',
      name: 'Name',
      email: 'Email',
      phone: 'Phone',
      password: 'Password',
      newPassword: 'New Password (Optional)',
      leaveEmptyNoChange: 'Leave empty to keep unchanged',
      role: 'Role',
      bio: 'Bio',
      profilePic: 'Profile Picture URL',
      isVerified: 'Verified User',
      verifiedBadge: 'Verified Badge',
      roles: {
        GUEST: 'Guest',
        CUSTOMER: 'Customer',
        PROVIDER: 'Provider',
        DELIVERY: 'Delivery',
        ADMIN: 'Admin',
      },
      createSuccess: 'User created successfully',
      updateSuccess: 'User updated successfully',
      deleteSuccess: 'User deleted successfully',
      createError: 'Failed to create user',
      updateError: 'Failed to update user',
      deleteError: 'Failed to delete user',
      validationError: 'Please enter user name',
      validationPasswordRequired: 'Please enter password',
      statistics: 'Statistics',
      registrationDate: 'Registration Date',
    },
    categories: {
      title: 'Category Management',
      description: 'Manage service and product categories',
      createNew: 'New Category',
      createSubCategory: 'Add Sub Category',
      editCategory: 'Edit Category',
      editSubCategory: 'Edit Sub Category',
      viewCategory: 'Category Details',
      deleteCategory: 'Delete Category',
      deleteSubCategory: 'Delete Sub Category',
      deleteConfirm: 'Are you sure you want to delete this category?',
      name: 'Category Name',
      slug: 'Slug',
      description_field: 'Description',
      design: 'Design',
      selectDesign: 'Select Design',
      parentCategory: 'Parent Category',
      createSuccess: 'Category created successfully',
      updateSuccess: 'Category updated successfully',
      deleteSuccess: 'Category deleted successfully',
      createError: 'Failed to create category',
      updateError: 'Failed to update category',
      deleteError: 'Failed to delete category',
      validationError: 'Please enter category name and select design',
      totalCategories: 'Total Categories',
      totalSubCategories: 'Sub Categories',
      totalServices: 'Services',
      categoriesList: 'Categories List',
      subCategories: 'sub categories',
      expand: 'Expand',
      collapse: 'Collapse',
    },
    bookings: {
      title: 'Booking Management',
      description: 'View and manage all bookings on the platform',
      createNew: 'New Booking',
      editBooking: 'Edit Booking',
      viewBooking: 'Booking Details',
      deleteBooking: 'Delete Booking',
      deleteConfirm: 'Are you sure you want to delete this booking?',
      user: 'User',
      service: 'Service',
      shop: 'Shop',
      startAt: 'Start Time',
      endAt: 'End Time',
      duration: 'Duration',
      durationMins: 'Duration (minutes)',
      status: 'Status',
      price: 'Price',
      currency: 'Currency',
      notes: 'Notes',
      selectUser: 'Select User',
      selectService: 'Select Service',
      selectShop: 'Select Shop',
      statuses: {
        PENDING: 'Pending',
        CONFIRMED: 'Confirmed',
        CANCELLED: 'Cancelled',
        COMPLETED: 'Completed',
        NO_SHOW: 'No Show',
      },
      createSuccess: 'Booking created successfully',
      updateSuccess: 'Booking updated successfully',
      deleteSuccess: 'Booking deleted successfully',
      createError: 'Failed to create booking',
      updateError: 'Failed to update booking',
      deleteError: 'Failed to delete booking',
      validationError: 'Please enter all required fields',
      totalBookings: 'Total Bookings',
      bookingsList: 'Bookings List',
    },
    orders: {
      title: 'Order Management',
      description: 'View and manage all orders on the platform',
      createNew: 'New Order',
      editOrder: 'Edit Order',
      viewOrder: 'Order Details',
      deleteOrder: 'Delete Order',
      deleteConfirm: 'Are you sure you want to delete this order?',
      orderNumber: 'Order Number',
      user: 'User',
      totalAmount: 'Total Amount',
      currency: 'Currency',
      status: 'Status',
      paymentMethod: 'Payment Method',
      items: 'Items',
      selectUser: 'Select User',
      statuses: {
        PENDING: 'Pending',
        CONFIRMED: 'Confirmed',
        PACKED: 'Packed',
        SHIPPED: 'Shipped',
        DELIVERED: 'Delivered',
        CANCELLED: 'Cancelled',
        RETURNED: 'Returned',
      },
      paymentMethods: {
        CASH: 'Cash',
        CARD: 'Card',
        WALLET: 'Wallet',
        ONLINE: 'Online',
      },
      createSuccess: 'Order created successfully',
      updateSuccess: 'Order updated successfully',
      deleteSuccess: 'Order deleted successfully',
      createError: 'Failed to create order',
      updateError: 'Failed to update order',
      deleteError: 'Failed to delete order',
      validationError: 'Please enter all required fields',
      totalOrders: 'Total Orders',
      ordersList: 'Orders List',
    },
    payments: {
      title: 'Payment Management',
      description: 'View and manage all payments on the platform',
      totalPayments: 'Total Payments',
      successfulPayments: 'Successful Payments',
      pendingPayments: 'Pending Payments',
      failedPayments: 'Failed Payments',
    },
    subscriptions: {
      title: 'Subscription Management',
      description: 'View and manage user subscriptions',
      totalSubscriptions: 'Total Subscriptions',
      activeSubscriptions: 'Active Subscriptions',
      expiredSubscriptions: 'Expired Subscriptions',
    },
    applications: {
      title: 'Business Applications',
      description: 'View and manage new business applications',
      totalApplications: 'Total Applications',
      pendingApplications: 'Pending Applications',
      approvedApplications: 'Approved Applications',
      rejectedApplications: 'Rejected Applications',
    },
    coupons: {
      title: 'Coupon Management',
      description: 'View and manage discount coupons',
      totalCoupons: 'Total Coupons',
      activeCoupons: 'Active Coupons',
      expiredCoupons: 'Expired Coupons',
    },
    reviews: {
      title: 'Review Management',
      description: 'View and manage user reviews',
      totalReviews: 'Total Reviews',
      pendingReviews: 'Pending Reviews',
      approvedReviews: 'Approved Reviews',
      averageRating: 'Average Rating',
    },
    notifications: {
      title: 'Notification Management',
      description: 'View and manage system notifications',
      totalNotifications: 'Total Notifications',
      unreadNotifications: 'Unread Notifications',
    },
    deliveries: {
      title: 'Delivery Management',
      description: 'View and manage delivery orders',
      totalDeliveries: 'Total Deliveries',
      pendingDeliveries: 'Pending Deliveries',
      completedDeliveries: 'Completed Deliveries',
    },
    analytics: {
      title: 'Analytics',
      description: 'View platform analytics and statistics',
      overview: 'Overview',
    },
    activity: {
      title: 'Activity Log',
      description: 'View user activity log',
      recentActivity: 'Recent Activity',
    },
    settings: {
      title: 'Settings',
      description: 'Manage system settings',
      generalSettings: 'General Settings',
    },
  },
};

// Helper function to get nested translations
export function getTranslation(locale: Locale, key: string): string {
  const keys = key.split('.');
  let value: any = translations[locale];
  
  for (const k of keys) {
    if (value && typeof value === 'object') {
      value = value[k];
    } else {
      return key; // Return key if translation not found
    }
  }
  
  return typeof value === 'string' ? value : key;
}

