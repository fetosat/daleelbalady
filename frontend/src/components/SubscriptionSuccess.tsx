import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { 
  CheckCircle, 
  Gift, 
  Crown, 
  Star,
  ArrowRight,
  Home,
  Settings,
  CreditCard,
  Calendar,
  Sparkles
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useNavigate, useSearchParams } from 'react-router-dom';

const SubscriptionSuccess = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isRTL = i18n.language === 'ar';
  
  const [showConfetti, setShowConfetti] = useState(false);
  const planType = searchParams.get('plan') || 'BOOKING_BASIC';

  useEffect(() => {
    setShowConfetti(true);
    // Auto-hide confetti after animation
    const timer = setTimeout(() => setShowConfetti(false), 3000);
    return () => clearTimeout(timer);
  }, []);

  const getPlanDetails = (planId: string) => {
    const plans = {
      'BASIC_FREE': {
        name: isRTL ? 'الأساسي (مجاني)' : 'Basic (Free)',
        icon: Star,
        color: 'text-stone-600',
        features: isRTL ? [
          'عرض كامل للأعمال',
          'إعداد الملف الأساسي',
          'تقييمات العملاء'
        ] : [
          'Full business listing',
          'Basic profile setup',
          'Customer reviews'
        ]
      },
      'BOOKING_BASIC': {
        name: isRTL ? 'باقة الحجز' : 'Booking Package',
        icon: Calendar,
        color: 'text-blue-600',
        features: isRTL ? [
          'حجز المواعيد المباشر',
          'إدارة التقويم',
          'إشعارات العملاء'
        ] : [
          'Direct appointment booking',
          'Calendar management',
          'Customer notifications'
        ]
      },
      'PRODUCTS_PREMIUM': {
        name: isRTL ? 'باقة المنتجات' : 'Products Package',
        icon: Gift,
        color: 'text-purple-600',
        features: isRTL ? [
          'عرض وبيع المنتجات',
          'إدارة المخزون',
          'معالجة الطلبات'
        ] : [
          'Product listing & sales',
          'Inventory management',
          'Order processing'
        ]
      },
      'TOP_GOLD': {
        name: isRTL ? 'المركز 3 الذهبي' : 'Top 3 Gold',
        icon: Crown,
        color: 'text-yellow-500',
        features: isRTL ? [
          'أولوية الظهور في أول 3 نتائج',
          'شارة التحقق الذهبية',
          'ميزة الفيديو الترويجي'
        ] : [
          'Top 3 search priority',
          'Gold verified badge',
          'Promotional video feature'
        ]
      }
    };
    
    return plans[planId as keyof typeof plans] || plans.BOOKING_BASIC;
  };

  const planDetails = getPlanDetails(planType);
  const PlanIcon = planDetails.icon;

  // Confetti animation components
  const confettiColors = ['#10B981', '#3B82F6', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4'];
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 flex items-center justify-center p-6 relative overflow-hidden">
      {/* Confetti Animation */}
      {showConfetti && (
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(50)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 rounded-full"
              style={{
                backgroundColor: confettiColors[i % confettiColors.length],
                left: `${Math.random() * 100}%`,
                top: '-10px'
              }}
              animate={{
                y: window.innerHeight + 100,
                x: Math.random() * 200 - 100,
                rotate: Math.random() * 360,
                opacity: [1, 1, 0]
              }}
              transition={{
                duration: Math.random() * 2 + 2,
                ease: "easeOut",
                delay: Math.random() * 2
              }}
            />
          ))}
        </div>
      )}

      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0 bg-gradient-to-r from-green-400 to-blue-500 animate-pulse" />
      </div>

      <div className="relative z-10 max-w-2xl mx-auto">
        {/* Success Animation */}
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", stiffness: 200, damping: 15 }}
          className="text-center mb-8"
        >
          <div className="relative inline-flex">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              className="absolute inset-0 rounded-full bg-gradient-to-r from-green-400 to-blue-500 opacity-20"
            />
            <div className="relative w-24 h-24 bg-green-500 rounded-full flex items-center justify-center">
              <CheckCircle className="h-12 w-12 text-white" />
            </div>
          </div>
        </motion.div>

        {/* Success Message */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-bold text-text-primary mb-4">
            {isRTL ? '🎉 تهانينا!' : '🎉 Congratulations!'}
          </h1>
          <p className="text-xl text-text-secondary">
            {isRTL 
              ? 'تم تفعيل اشتراكك بنجاح' 
              : 'Your subscription has been activated successfully'
            }
          </p>
        </motion.div>

        {/* Plan Details Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mb-8"
        >
          <Card className="relative overflow-hidden border-2 border-green-200 bg-gradient-to-r from-green-50 to-blue-50">
            <div className="absolute top-0 right-0 -transtone-y-1/2 transtone-x-1/2">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                className="w-32 h-32 bg-gradient-to-r from-green-300/20 to-blue-300/20 rounded-full"
              />
            </div>
            
            <CardHeader className="text-center pb-4">
              <div className="relative z-10">
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  className={`mx-auto w-16 h-16 rounded-full bg-gradient-to-r from-green-100 to-blue-100 flex items-center justify-center mb-4`}
                >
                  <PlanIcon className={`h-8 w-8 ${planDetails.color}`} />
                </motion.div>
                
                <CardTitle className="text-2xl font-bold text-text-primary">
                  {planDetails.name}
                </CardTitle>
                
                <Badge className="bg-green-primary text-white mt-2">
                  <Sparkles className="h-3 w-3 mr-1" />
                  {isRTL ? 'مُفعل الآن' : 'Now Active'}
                </Badge>
              </div>
            </CardHeader>

            <CardContent className="relative z-10">
              <div className="space-y-4">
                <h3 className="font-semibold text-text-primary text-center mb-4">
                  {isRTL ? 'الميزات المتاحة الآن:' : 'Features Now Available:'}
                </h3>
                
                <ul className="space-y-3">
                  {planDetails.features.map((feature, index) => (
                    <motion.li 
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.7 + index * 0.1 }}
                      className="flex items-center gap-3"
                    >
                      <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0">
                        <CheckCircle className="h-4 w-4 text-white" />
                      </div>
                      <span className="text-text-secondary">{feature}</span>
                    </motion.li>
                  ))}
                </ul>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Next Steps */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8"
        >
          <Card className="hover:shadow-lg transition-all duration-300 group">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-blue-200 transition-colors">
                <Settings className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="font-semibold text-text-primary mb-2">
                {isRTL ? 'إعداد حسابك' : 'Setup Your Account'}
              </h3>
              <p className="text-sm text-text-secondary">
                {isRTL 
                  ? 'أكمل إعداد ملفك الشخصي واستفد من جميع الميزات'
                  : 'Complete your profile setup and access all features'
                }
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-all duration-300 group">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-purple-200 transition-colors">
                <CreditCard className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="font-semibold text-text-primary mb-2">
                {isRTL ? 'إدارة الاشتراك' : 'Manage Subscription'}
              </h3>
              <p className="text-sm text-text-secondary">
                {isRTL 
                  ? 'راجع تفاصيل اشتراكك وإعدادات الدفع'
                  : 'View subscription details and payment settings'
                }
              </p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
          className="flex flex-col sm:flex-row gap-4 justify-center"
        >
          <Button 
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-2 bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white px-8 py-3 rounded-full font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
          >
            <Home className="h-5 w-5" />
            {isRTL ? 'الذهاب للوحة التحكم' : 'Go to Dashboard'}
            <ArrowRight className="h-4 w-4" />
          </Button>
          
          <Button 
            variant="outline"
            onClick={() => navigate('/profile')}
            className="flex items-center gap-2 border-2 border-green-200 hover:bg-green-50 px-8 py-3 rounded-full font-semibold transition-all duration-300"
          >
            <Settings className="h-5 w-5" />
            {isRTL ? 'إعداد الملف الشخصي' : 'Setup Profile'}
          </Button>
        </motion.div>

        {/* Support Information */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.1 }}
          className="mt-12 text-center"
        >
          <p className="text-sm text-text-muted">
            {isRTL 
              ? 'هل تحتاج مساعدة؟ تواصل معنا على support@daleelbalady.com'
              : 'Need help? Contact us at support@daleelbalady.com'
            }
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default SubscriptionSuccess;
