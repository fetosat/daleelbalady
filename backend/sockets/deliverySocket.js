const jwt = require('jsonwebtoken');

// معالجة اتصالات Socket.IO للدليفري
const handleDeliverySocket = (io) => {
  // middleware للمصادقة
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.replace('Bearer ', '');
      
      if (!token) {
        return next(new Error('Authentication error'));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret');
      socket.userId = decoded.id;
      socket.userRole = decoded.role;
      
      next();
    } catch (err) {
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`User ${socket.userId} (${socket.userRole}) connected`);

    // الانضمام لغرفة المستخدم الشخصية
    socket.join(`user_${socket.userId}`);

    // الانضمام لغرفة مندوبي التوصيل (للمندوبين فقط)
    if (socket.userRole === 'DELIVERY') {
      socket.join('delivery_agents');
      console.log(`Delivery agent ${socket.userId} joined delivery_agents room`);
    }

    // === أحداث طلبات التوصيل ===

    // طلب دليفري جديد (يرسل لجميع مندوبي التوصيل)
    socket.on('new_delivery_request', (requestData) => {
      console.log('New delivery request created:', requestData.id);
      
      // إشعار جميع مندوبي التوصيل
      socket.to('delivery_agents').emit('delivery_request_notification', {
        type: 'NEW_REQUEST',
        requestId: requestData.id,
        title: requestData.requestTitle,
        priority: requestData.priority,
        estimatedValue: requestData.customerBudget,
        location: requestData.deliveryLocation,
        message: `طلب توصيل جديد: ${requestData.requestTitle}`,
        timestamp: new Date().toISOString()
      });
    });

    // عرض سعر جديد
    socket.on('new_delivery_offer', (offerData) => {
      console.log('New delivery offer:', offerData);
      
      // إشعار العميل بالعرض الجديد
      io.to(`user_${offerData.customerId}`).emit('delivery_offer_notification', {
        type: 'NEW_OFFER',
        requestId: offerData.deliveryRequestId,
        offerId: offerData.id,
        offerPrice: offerData.offerPrice,
        deliveryUserName: offerData.deliveryUserName,
        estimatedTime: offerData.estimatedDeliveryTime,
        message: `عرض جديد: ${offerData.offerPrice} جنيه من ${offerData.deliveryUserName}`,
        timestamp: new Date().toISOString()
      });
    });

    // قبول عرض
    socket.on('offer_accepted', (acceptanceData) => {
      console.log('Offer accepted:', acceptanceData);
      
      // إشعار المندوب بقبول عرضه
      io.to(`user_${acceptanceData.deliveryUserId}`).emit('offer_acceptance_notification', {
        type: 'OFFER_ACCEPTED',
        requestId: acceptanceData.deliveryRequestId,
        tripId: acceptanceData.tripId,
        chatId: acceptanceData.chatId,
        message: 'تم قبول عرضك! ابدأ رحلة التوصيل',
        timestamp: new Date().toISOString()
      });

      // إشعار باقي المندوبين برفض عروضهم
      if (acceptanceData.rejectedOffers && acceptanceData.rejectedOffers.length > 0) {
        acceptanceData.rejectedOffers.forEach(offer => {
          io.to(`user_${offer.deliveryUserId}`).emit('offer_rejection_notification', {
            type: 'OFFER_REJECTED',
            requestId: acceptanceData.deliveryRequestId,
            message: 'تم اختيار عرض آخر لهذا الطلب',
            timestamp: new Date().toISOString()
          });
        });
      }
    });

    // === أحداث تتبع الرحلة ===

    // الانضمام لغرفة رحلة محددة
    socket.on('join_trip', (tripId) => {
      socket.join(`trip_${tripId}`);
      console.log(`User ${socket.userId} joined trip_${tripId}`);
      
      // تأكيد الانضمام
      socket.emit('trip_joined', {
        tripId,
        message: 'تم الانضمام لتتبع الرحلة',
        timestamp: new Date().toISOString()
      });
    });

    // مغادرة غرفة الرحلة
    socket.on('leave_trip', (tripId) => {
      socket.leave(`trip_${tripId}`);
      console.log(`User ${socket.userId} left trip_${tripId}`);
    });

    // تحديث موقع المندوب
    socket.on('location_update', (locationData) => {
      const { tripId, location } = locationData;
      
      // التحقق من أن المستخدم مندوب توصيل
      if (socket.userRole !== 'DELIVERY') {
        return socket.emit('error', { message: 'غير مسموح بتحديث الموقع' });
      }

      console.log(`Location update for trip ${tripId}:`, location);
      
      // إرسال الموقع الجديد لجميع المتابعين للرحلة
      socket.to(`trip_${tripId}`).emit('location_update', {
        tripId,
        location,
        timestamp: new Date().toISOString()
      });

      // حفظ الموقع في قاعدة البيانات (يمكن إضافة هذا لاحقاً)
      // await updateTripLocation(tripId, location);
    });

    // تحديث حالة الرحلة
    socket.on('trip_status_update', (statusData) => {
      const { tripId, newStatus, previousStatus, updateMessage } = statusData;
      
      console.log(`Trip ${tripId} status updated: ${previousStatus} -> ${newStatus}`);
      
      // إشعار جميع المتابعين للرحلة
      io.to(`trip_${tripId}`).emit('trip_status_update', {
        tripId,
        newStatus,
        previousStatus,
        updateMessage,
        updatedBy: socket.userId,
        timestamp: new Date().toISOString()
      });
    });

    // رفع فاتورة
    socket.on('receipt_uploaded', (receiptData) => {
      const { tripId, receiptDetails, itemsCost, totalCost } = receiptData;
      
      console.log(`Receipt uploaded for trip ${tripId}:`, receiptDetails);
      
      // إشعار العميل بالفاتورة
      socket.to(`trip_${tripId}`).emit('receipt_notification', {
        tripId,
        receiptDetails,
        itemsCost,
        totalCost,
        message: 'تم رفع فاتورة المشتريات، يرجى المراجعة',
        timestamp: new Date().toISOString()
      });
    });

    // تأكيد التسليم/الاستلام
    socket.on('delivery_confirmation', (confirmationData) => {
      const { tripId, confirmationType, rating, review } = confirmationData;
      
      console.log(`Delivery confirmation for trip ${tripId}:`, confirmationType);
      
      // إشعار الطرف الآخر
      socket.to(`trip_${tripId}`).emit('delivery_confirmation_notification', {
        tripId,
        confirmationType,
        rating,
        review,
        confirmedBy: socket.userId,
        message: confirmationType === 'DELIVERY' 
          ? 'تم تأكيد التسليم من المندوب' 
          : 'تم تأكيد الاستلام من العميل',
        timestamp: new Date().toISOString()
      });
    });

    // === أحداث المحادثة ===

    // الانضمام لمحادثة
    socket.on('join_chat', (chatId) => {
      socket.join(`chat_${chatId}`);
      console.log(`User ${socket.userId} joined chat_${chatId}`);
    });

    // مغادرة المحادثة
    socket.on('leave_chat', (chatId) => {
      socket.leave(`chat_${chatId}`);
      console.log(`User ${socket.userId} left chat_${chatId}`);
    });

    // إرسال رسالة
    socket.on('send_message', (messageData) => {
      const { chatId, text, attachments } = messageData;
      
      // إرسال الرسالة لجميع المشاركين في المحادثة
      socket.to(`chat_${chatId}`).emit('new_message', {
        chatId,
        senderId: socket.userId,
        text,
        attachments,
        timestamp: new Date().toISOString()
      });
    });

    // كتابة رسالة (typing indicator)
    socket.on('typing_start', (chatId) => {
      socket.to(`chat_${chatId}`).emit('user_typing', {
        userId: socket.userId,
        isTyping: true
      });
    });

    socket.on('typing_stop', (chatId) => {
      socket.to(`chat_${chatId}`).emit('user_typing', {
        userId: socket.userId,
        isTyping: false
      });
    });

    // === أحداث الإشعارات العامة ===

    // إشعار مخصص
    socket.on('custom_notification', (notificationData) => {
      const { targetUserId, type, title, message, metadata } = notificationData;
      
      // إرسال إشعار للمستخدم المحدد
      io.to(`user_${targetUserId}`).emit('notification', {
        type,
        title,
        message,
        metadata,
        timestamp: new Date().toISOString()
      });
    });

    // === أحداث إبلاغ المشاكل ===

    // مشكلة جديدة
    socket.on('issue_reported', (issueData) => {
      const { tripId, issueType, description, priority } = issueData;
      
      console.log(`Issue reported for trip ${tripId}:`, issueType);
      
      // إشعار الطرف الآخر والإدارة
      socket.to(`trip_${tripId}`).emit('issue_reported_notification', {
        tripId,
        issueType,
        description,
        priority,
        reportedBy: socket.userId,
        message: 'تم الإبلاغ عن مشكلة في الرحلة',
        timestamp: new Date().toISOString()
      });

      // إشعار فريق الدعم (يمكن إضافة غرفة للإدارة)
      io.to('support_team').emit('new_issue_notification', {
        tripId,
        issueType,
        description,
        priority,
        reportedBy: socket.userId,
        timestamp: new Date().toISOString()
      });
    });

    // === أحداث قطع الاتصال ===

    socket.on('disconnect', (reason) => {
      console.log(`User ${socket.userId} disconnected:`, reason);
      
      // يمكن إضافة منطق لحفظ آخر ظهور أو تنظيف البيانات المؤقتة
    });

    // === معالجة الأخطاء ===

    socket.on('error', (error) => {
      console.error(`Socket error for user ${socket.userId}:`, error);
      
      socket.emit('error_response', {
        message: 'حدث خطأ في الاتصال',
        timestamp: new Date().toISOString()
      });
    });
  });
};

module.exports = {
  handleDeliverySocket
};
