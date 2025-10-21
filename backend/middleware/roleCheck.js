/**
 * Role Check Middleware
 * التحقق من صلاحيات المستخدم
 */

const roleCheck = (allowedRoles = []) => {
  return (req, res, next) => {
    try {
      // التأكد من وجود المستخدم (يجب أن يكون auth middleware قد تم تشغيله قبل هذا)
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'غير مصرح لك بالدخول'
        });
      }

      // التحقق من الدور
      if (!allowedRoles.includes(req.user.role)) {
        return res.status(403).json({
          success: false,
          message: 'ليس لديك الصلاحيات الكافية لهذا الإجراء',
          requiredRoles: allowedRoles,
          userRole: req.user.role
        });
      }

      next();
    } catch (error) {
      console.error('Role check error:', error);
      res.status(500).json({
        success: false,
        message: 'خطأ في التحقق من الصلاحيات'
      });
    }
  };
};

export default roleCheck;
