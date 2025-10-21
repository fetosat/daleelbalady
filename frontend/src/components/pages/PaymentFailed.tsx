import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  XCircle,
  RefreshCw,
  ArrowLeft,
  AlertCircle,
  CreditCard,
  Phone,
  Mail,
  MessageSquare,
  HelpCircle,
  Shield,
  Clock,
  Home,
  ChevronRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface PaymentFailureData {
  error: string;
  planId?: string;
  planDetails?: {
    id: string;
    name: string;
    nameAr: string;
    type: 'PROVIDER' | 'USER';
  };
  errorCode?: string;
  transactionId?: string;
}

const PaymentFailed = () => {
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const [isClient, setIsClient] = useState(false);
  const isRTL = i18n.language === 'ar';
  
  useEffect(() => {
    setIsClient(true);
  }, []);
  
  const [failureData, setFailureData] = useState<PaymentFailureData | null>(null);
  const [showAnimation, setShowAnimation] = useState(true);

  const commonErrors = [
    {
      code: 'INSUFFICIENT_FUNDS',
      title: isRTL ? 'رصيد غير كافي' : 'Insufficient Funds',
      titleAr: 'رصيد غير كافي',
      description: isRTL ? 'لا يوجد رصيد كافي في البطاقة أو الحساب' : 'Not enough balance in card or account',
      descriptionAr: 'لا يوجد رصيد كافي في البطاقة أو الحساب',
      solutions: [
        { text: isRTL ? 'تحقق من رصيد البطاقة' : 'Check card balance', textAr: 'تحقق من رصيد البطاقة' },
        { text: isRTL ? 'استخدم بطاقة أخرى' : 'Try a different card', textAr: 'استخدم بطاقة أخرى' },
        { text: isRTL ? 'تواصل مع البنك' : 'Contact your bank', textAr: 'تواصل مع البنك' }
      ]
    },
    {
      code: 'CARD_DECLINED',
      title: isRTL ? 'البطاقة مرفوضة' : 'Card Declined',
      titleAr: 'البطاقة مرفوضة',
      description: isRTL ? 'تم رفض البطاقة من قبل البنك المُصدر' : 'Card was declined by the issuing bank',
      descriptionAr: 'تم رفض البطاقة من قبل البنك المُصدر',
      solutions: [
        { text: isRTL ? 'تحقق من صحة بيانات البطاقة' : 'Verify card details', textAr: 'تحقق من صحة بيانات البطاقة' },
        { text: isRTL ? 'تأكد من عدم انتهاء صلاحية البطاقة' : 'Check card expiry date', textAr: 'تأكد من عدم انتهاء صلاحية البطاقة' },
        { text: isRTL ? 'تواصل مع البنك لفهم سبب الرفض' : 'Contact bank for decline reason', textAr: 'تواصل مع البنك لفهم سبب الرفض' }
      ]
    },
    {
      code: 'NETWORK_ERROR',
      title: isRTL ? 'خطأ في الاتصال' : 'Network Error',
      titleAr: 'خطأ في الاتصال',
      description: isRTL ? 'حدث خطأ في الاتصال أثناء المعالجة' : 'Connection error occurred during processing',
      descriptionAr: 'حدث خطأ في الاتصال أثناء المعالجة',
      solutions: [
        { text: isRTL ? 'تحقق من الاتصال بالإنترنت' : 'Check internet connection', textAr: 'تحقق من الاتصال بالإنترنت' },
        { text: isRTL ? 'حاول مرة أخرى' : 'Try again', textAr: 'حاول مرة أخرى' },
        { text: isRTL ? 'استخدم شبكة أخرى' : 'Try a different network', textAr: 'استخدم شبكة أخرى' }
      ]
    },
    {
      code: 'TIMEOUT',
      title: isRTL ? 'انتهت مهلة المعالجة' : 'Processing Timeout',
      titleAr: 'انتهت مهلة المعالجة',
      description: isRTL ? 'انتهت مهلة معالجة الدفع' : 'Payment processing timed out',
      descriptionAr: 'انتهت مهلة معالجة الدفع',
      solutions: [
        { text: isRTL ? 'حاول مرة أخرى' : 'Try again', textAr: 'حاول مرة أخرى' },
        { text: isRTL ? 'تحقق من استقرار الاتصال' : 'Ensure stable connection', textAr: 'تحقق من استقرار الاتصال' },
        { text: isRTL ? 'تواصل مع الدعم إذا استمرت المشكلة' : 'Contact support if issue persists', textAr: 'تواصل مع الدعم إذا استمرت المشكلة' }
      ]
    }
  ];

  useEffect(() => {
    if (!isClient) return;
    
    // In Next.js, we can get state from query params or sessionStorage
    const data = sessionStorage.getItem('paymentFailureData');
    if (data) {
      try {
        setFailureData(JSON.parse(data));
        // Clear the data after use
        sessionStorage.removeItem('paymentFailureData');
      } catch (e) {
        console.error('Failed to parse payment failure data:', e);
      }
    } else {
      // Redirect if no failure data
      router.push('/subscription-plans');
    }

    // Hide animation after 2 seconds
    const timer = setTimeout(() => setShowAnimation(false), 2000);
    return () => clearTimeout(timer);
  }, [isClient, router]);

  const getErrorDetails = () => {
    if (!failureData?.errorCode) return null;
    return commonErrors.find(error => error.code === failureData.errorCode);
  };

  const handleRetryPayment = () => {
    if (failureData?.planId) {
      // Store plan data in sessionStorage for Next.js navigation
      sessionStorage.setItem('checkoutPlanId', failureData.planId);
      router.push('/payment-checkout');
    } else {
      router.push('/subscription-plans');
    }
  };

  const handleContactSupport = () => {
    if (!isClient) return;
    
    // You can integrate with your support system here
    // For now, we'll show contact options
    const phoneNumber = '+201234567890'; // Replace with actual support number
    const email = 'support@daleelbalady.com'; // Replace with actual support email
    
    if (window.confirm(isRTL ? 'هل تريد الاتصال بالدعم الفني؟' : 'Would you like to contact technical support?')) {
      window.open(`tel:${phoneNumber}`);
    }
  };

  const supportOptions = [
    {
      icon: Phone,
      title: isRTL ? 'الهاتف' : 'Phone',
      titleAr: 'الهاتف',
      description: isRTL ? 'اتصل بنا مباشرة' : 'Call us directly',
      descriptionAr: 'اتصل بنا مباشرة',
      action: () => isClient && window.open('tel:+201234567890'),
      available: isRTL ? '24/7 متاح' : 'Available 24/7'
    },
    {
      icon: Mail,
      title: isRTL ? 'البريد الإلكتروني' : 'Email',
      titleAr: 'البريد الإلكتروني',
      description: isRTL ? 'أرسل استفسارك بالتفصيل' : 'Send detailed inquiry',
      descriptionAr: 'أرسل استفسارك بالتفصيل',
      action: () => isClient && window.open('mailto:support@daleelbalady.com'),
      available: isRTL ? 'رد خلال 24 ساعة' : 'Response within 24h'
    },
    {
      icon: MessageSquare,
      title: isRTL ? 'الدردشة المباشرة' : 'Live Chat',
      titleAr: 'الدردشة المباشرة',
      description: isRTL ? 'احصل على مساعدة فورية' : 'Get instant help',
      descriptionAr: 'احصل على مساعدة فورية',
      action: () => {
        // Integrate with your chat system
        alert(isRTL ? 'ستفتح الدردشة المباشرة قريباً' : 'Live chat opening soon');
      },
      available: isRTL ? 'متاح الآن' : 'Available now'
    }
  ];

  // Show loading state during SSR or while client is initializing
  if (!isClient || !failureData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto mb-4"></div>
          <p>{isRTL ? 'جاري التحميل...' : 'Loading...'}</p>
        </div>
      </div>
    );
  }

  const errorDetails = getErrorDetails();

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50">
      {/* Failure Animation */}
      {showAnimation && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 flex items-center justify-center"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ 
              type: "spring",
              stiffness: 260,
              damping: 20,
              delay: 0.2 
            }}
            className="bg-white rounded-full p-8 shadow-2xl"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.5 }}
            >
              <XCircle className="h-16 w-16 text-red-500 mx-auto" />
            </motion.div>
          </motion.div>
        </motion.div>
      )}

      <div className="max-w-4xl mx-auto px-6 py-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: showAnimation ? 2.2 : 0 }}
          className="text-center mb-12"
        >
          <div className="flex justify-center mb-6">
            <div className="bg-red-100 rounded-full p-4">
              <XCircle className="h-12 w-12 text-red-600" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-red-700 mb-4">
            {isRTL ? '❌ فشل في الدفع' : '❌ Payment Failed'}
          </h1>
          <p className="text-xl text-text-secondary max-w-2xl mx-auto">
            {isRTL 
              ? 'عذراً، لم نتمكن من إكمال عملية الدفع. يرجى المحاولة مرة أخرى أو التواصل مع الدعم.'
              : 'Sorry, we couldn\'t complete the payment. Please try again or contact support.'
            }
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Error Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Error Information */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: showAnimation ? 2.4 : 0.2 }}
            >
              <Alert className="border-red-200 bg-red-50">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="text-red-800">
                  <strong>{isRTL ? 'خطأ:' : 'Error:'}</strong> {failureData.error}
                  {failureData.transactionId && (
                    <div className="mt-2 text-sm">
                      {isRTL ? 'رقم المرجع:' : 'Reference ID:'} <span className="font-mono">{failureData.transactionId}</span>
                    </div>
                  )}
                </AlertDescription>
              </Alert>
            </motion.div>

            {/* Error Details & Solutions */}
            {errorDetails && (
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: showAnimation ? 2.6 : 0.4 }}
              >
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-3">
                      <HelpCircle className="h-5 w-5 text-blue-600" />
                      {isRTL ? 'تفاصيل المشكلة والحلول' : 'Problem Details & Solutions'}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div>
                      <h3 className="font-semibold text-lg mb-2">
                        {isRTL ? errorDetails.titleAr : errorDetails.title}
                      </h3>
                      <p className="text-text-secondary mb-4">
                        {isRTL ? errorDetails.descriptionAr : errorDetails.description}
                      </p>
                    </div>

                    <div>
                      <h4 className="font-semibold mb-3">
                        {isRTL ? 'الحلول المقترحة:' : 'Suggested Solutions:'}
                      </h4>
                      <ul className="space-y-2">
                        {errorDetails.solutions.map((solution, index) => (
                          <li key={index} className="flex items-start gap-3">
                            <ChevronRight className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                            <span className="text-text-secondary">
                              {isRTL ? solution.textAr : solution.text}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Action Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: showAnimation ? 2.8 : 0.6 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <RefreshCw className="h-5 w-5 text-green-600" />
                    {isRTL ? 'ماذا تريد أن تفعل؟' : 'What would you like to do?'}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Button 
                      onClick={handleRetryPayment}
                      className="w-full"
                      size="lg"
                    >
                      <RefreshCw className="h-4 w-4 mr-2" />
                      {isRTL ? 'إعادة المحاولة' : 'Try Again'}
                    </Button>
                    
                    <Button 
                      onClick={() => router.push('/subscription-plans')}
                      variant="outline"
                      className="w-full"
                      size="lg"
                    >
                      <ArrowLeft className="h-4 w-4 mr-2" />
                      {isRTL ? 'اختيار باقة أخرى' : 'Choose Different Plan'}
                    </Button>
                  </div>

                  <Separator />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Button 
                      onClick={handleContactSupport}
                      variant="outline"
                      className="w-full"
                    >
                      <Phone className="h-4 w-4 mr-2" />
                      {isRTL ? 'اتصال بالدعم' : 'Contact Support'}
                    </Button>
                    
                    <Button 
                      onClick={() => router.push('/')}
                      variant="ghost"
                      className="w-full"
                    >
                      <Home className="h-4 w-4 mr-2" />
                      {isRTL ? 'العودة للرئيسية' : 'Back to Home'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Plan Details (if available) */}
            {failureData.planDetails && (
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: showAnimation ? 3 : 0.8 }}
              >
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-3">
                      <CreditCard className="h-5 w-5 text-blue-600" />
                      {isRTL ? 'الباقة التي حاولت شراءها' : 'Plan You Tried to Purchase'}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold">
                          {isRTL ? failureData.planDetails.nameAr : failureData.planDetails.name}
                        </h3>
                        <p className="text-text-secondary">
                          {failureData.planDetails.type === 'PROVIDER' 
                            ? (isRTL ? 'باقة مقدم خدمة' : 'Service Provider Plan')
                            : (isRTL ? 'باقة مستخدم' : 'User Plan')
                          }
                        </p>
                      </div>
                      <Badge variant="outline">
                        {isRTL ? 'لم يكتمل' : 'Incomplete'}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </div>

          {/* Support Options */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: showAnimation ? 3 : 0.8 }}
            >
              <Card className="sticky top-6">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <MessageSquare className="h-5 w-5 text-purple-600" />
                    {isRTL ? 'تحتاج مساعدة؟' : 'Need Help?'}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <p className="text-text-secondary text-sm">
                    {isRTL 
                      ? 'فريق الدعم الخاص بنا متاح لمساعدتك في حل هذه المشكلة.'
                      : 'Our support team is available to help you resolve this issue.'
                    }
                  </p>

                  {supportOptions.map((option, index) => {
                    const Icon = option.icon;
                    return (
                      <div key={index} className="border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer" onClick={option.action}>
                        <div className="flex items-start gap-3">
                          <div className="bg-purple-100 rounded-lg p-2">
                            <Icon className="h-4 w-4 text-purple-600" />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-semibold text-sm">
                              {isRTL ? option.titleAr : option.title}
                            </h4>
                            <p className="text-xs text-text-secondary mb-2">
                              {isRTL ? option.descriptionAr : option.description}
                            </p>
                            <Badge variant="secondary" className="text-xs">
                              {option.available}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    );
                  })}

                  {/* Security Notice */}
                  <div className="bg-green-50 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Shield className="h-4 w-4 text-green-600" />
                      <span className="text-sm font-medium text-green-800">
                        {isRTL ? 'أمان معلوماتك' : 'Your Information Security'}
                      </span>
                    </div>
                    <p className="text-xs text-green-700">
                      {isRTL 
                        ? 'معلومات الدفع الخاصة بك آمنة ولم يتم خصم أي مبلغ من حسابك.'
                        : 'Your payment information is secure and no amount has been charged from your account.'
                      }
                    </p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentFailed;
