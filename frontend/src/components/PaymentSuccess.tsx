import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from '@/lib/router-compat';
import { useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  CheckCircle,
  Download,
  Mail,
  ArrowRight,
  ArrowLeft,
  Calendar,
  Settings,
  Share2,
  QrCode,
  Star,
  Smartphone,
  Award,
  Gift,
  Crown,
  CreditCard,
  Shield,
  Home
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { apiFetch } from '@/utils/apiClient';

interface PaymentData {
  transactionId: string;
  planId: string;
  amount: number;
  planDetails: {
    id: string;
    name: string;
    nameAr: string;
    type: 'PROVIDER' | 'USER';
    features: string[];
    featuresAr: string[];
  };
}

const PaymentSuccess = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const searchParams = useSearchParams();
  const isRTL = i18n.language === 'ar';
  
  const [paymentData, setPaymentData] = useState<PaymentData | null>(null);
  const [showAnimation, setShowAnimation] = useState(true);
  const [subscriptionDetails, setSubscriptionDetails] = useState<any>(null);

  useEffect(() => {
    // Get payment data from query parameters
    const transactionId = searchParams.get('transactionId');
    const planId = searchParams.get('planId');
    const amount = searchParams.get('amount');
    
    if (transactionId) {
      // Fetch complete payment details from API
      fetchPaymentDetails(transactionId);
    } else {
      // Redirect if no payment data
      navigate('/subscription-plans');
    }

    // Hide animation after 3 seconds
    const timer = setTimeout(() => setShowAnimation(false), 3000);
    return () => clearTimeout(timer);
  }, [searchParams, navigate]);

  const fetchPaymentDetails = async (transactionId: string) => {
    try {
      // Fetch payment details from API
      const response = await apiFetch(`/payments/details/${transactionId}`);
      if (response.ok) {
        const data = await response.json();
        setPaymentData(data);
        // Then fetch subscription details
        fetchSubscriptionDetails(transactionId);
      } else {
        // If API fails, create mock data from query params
        const planId = searchParams.get('planId') || '';
        const amount = searchParams.get('amount');
        setPaymentData({
          transactionId,
          planId,
          amount: amount ? parseFloat(amount) : 0,
          planDetails: {
            id: planId,
            name: 'Premium Plan',
            nameAr: 'الباقة المتميزة',
            type: planId.includes('PROVIDER') ? 'PROVIDER' : 'USER',
            features: ['Feature 1', 'Feature 2', 'Feature 3'],
            featuresAr: ['ميزة 1', 'ميزة 2', 'ميزة 3']
          }
        });
      }
    } catch (error) {
      console.error('Failed to fetch payment details:', error);
      // Fallback to basic data from query params
      const planId = searchParams.get('planId') || '';
      const amount = searchParams.get('amount');
      setPaymentData({
        transactionId,
        planId,
        amount: amount ? parseFloat(amount) : 0,
        planDetails: {
          id: planId,
          name: 'Premium Plan',
          nameAr: 'الباقة المتميزة',
          type: planId.includes('PROVIDER') ? 'PROVIDER' : 'USER',
          features: ['Feature 1', 'Feature 2', 'Feature 3'],
          featuresAr: ['ميزة 1', 'ميزة 2', 'ميزة 3']
        }
      });
    }
  };

  const fetchSubscriptionDetails = async (transactionId: string) => {
    try {
      const response = await apiFetch(`/subscriptions/details?transactionId=${transactionId}`);
      const details = await response.json();
      setSubscriptionDetails(details);
    } catch (error) {
      console.error('Failed to fetch subscription details:', error);
    }
  };

  const handleDownloadReceipt = async () => {
    if (!paymentData) return;
    
    try {
      const response = await apiFetch(`/payments/receipt/${paymentData.transactionId}`);
      
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `receipt-${paymentData.transactionId}.pdf`;
        a.click();
        window.URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error('Failed to download receipt:', error);
    }
  };

  const handleSendConfirmationEmail = async () => {
    if (!paymentData) return;
    
    try {
      await apiFetch('/payments/send-confirmation', {
        method: 'POST',
        body: JSON.stringify({
          transactionId: paymentData.transactionId
        })
      });
      
      // Show success message
      alert(isRTL ? 'تم إرسال رسالة التأكيد بنجاح!' : 'Confirmation email sent successfully!');
    } catch (error) {
      console.error('Failed to send confirmation email:', error);
    }
  };

  const getNextSteps = () => {
    if (!paymentData) return [];

    if (paymentData.planDetails.type === 'PROVIDER') {
      return [
        {
          icon: Settings,
          title: isRTL ? 'أكمل إعداد الملف الشخصي' : 'Complete Profile Setup',
          titleAr: 'أكمل إعداد الملف الشخصي',
          description: isRTL ? 'أضف معلومات العمل والصور والخدمات' : 'Add business information, photos, and services',
          descriptionAr: 'أضف معلومات العمل والصور والخدمات',
          action: () => navigate('/dashboard/profile'),
          buttonText: isRTL ? 'إعداد الملف الشخصي' : 'Setup Profile'
        },
        {
          icon: Calendar,
          title: isRTL ? 'إعداد مواعيد العمل' : 'Set Working Hours',
          titleAr: 'إعداد مواعيد العمل',
          description: isRTL ? 'حدد أوقات العمل ومتى تكون متاحاً للحجز' : 'Define your working hours and availability for bookings',
          descriptionAr: 'حدد أوقات العمل ومتى تكون متاحاً للحجز',
          action: () => navigate('/dashboard/availability'),
          buttonText: isRTL ? 'إعداد المواعيد' : 'Set Schedule'
        },
        {
          icon: Share2,
          title: isRTL ? 'شارك صفحة عملك' : 'Share Your Business Page',
          titleAr: 'شارك صفحة عملك',
          description: isRTL ? 'اشارك رابط صفحتك مع العملاء' : 'Share your page link with customers',
          descriptionAr: 'اشارك رابط صفحتك مع العملاء',
          action: () => {
            const shareUrl = `${window.location.origin}/business/profile`;
            navigator.share?.({ url: shareUrl }) || navigator.clipboard.writeText(shareUrl);
          },
          buttonText: isRTL ? 'شارك الآن' : 'Share Now'
        }
      ];
    } else {
      return [
        {
          icon: QrCode,
          title: isRTL ? 'احصل على بطاقتك الرقمية' : 'Get Your Digital Card',
          titleAr: 'احصل على بطاقتك الرقمية',
          description: isRTL ? 'قم بتنزيل بطاقة الخصم الرقمية مع رمز QR' : 'Download your digital discount card with QR code',
          descriptionAr: 'قم بتنزيل بطاقة الخصم الرقمية مع رمز QR',
          action: () => navigate('/dashboard/digital-card'),
          buttonText: isRTL ? 'تحميل البطاقة' : 'Download Card'
        },
        {
          icon: Star,
          title: isRTL ? 'استكشف الخصومات' : 'Explore Discounts',
          titleAr: 'استكشف الخصومات',
          description: isRTL ? 'ابحث عن الخدمات والخصومات المتاحة' : 'Find available services and discounts',
          descriptionAr: 'ابحث عن الخدمات والخصومات المتاحة',
          action: () => navigate('/search?category=discounts'),
          buttonText: isRTL ? 'استكشف الآن' : 'Explore Now'
        },
        {
          icon: Smartphone,
          title: isRTL ? 'أضف أفراد العائلة' : 'Add Family Members',
          titleAr: 'أضف أفراد العائلة',
          description: isRTL ? 'أضف حتى 5 أفراد من العائلة للاستفادة من البطاقة' : 'Add up to 5 family members to benefit from the card',
          descriptionAr: 'أضف حتى 5 أفراد من العائلة للاستفادة من البطاقة',
          action: () => navigate('/dashboard/family'),
          buttonText: isRTL ? 'إضافة أفراد' : 'Add Members'
        }
      ];
    }
  };

  if (!paymentData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto mb-4"></div>
          <p>{isRTL ? 'جاري التحميل...' : 'Loading...'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50">
      {/* Success Animation */}
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
              <CheckCircle className="h-16 w-16 text-green-500 mx-auto" />
            </motion.div>
          </motion.div>
        </motion.div>
      )}

      <div className="max-w-4xl mx-auto px-6 py-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: showAnimation ? 3.2 : 0 }}
          className="text-center mb-12"
        >
          <div className="flex justify-center mb-6">
            <div className="bg-green-100 rounded-full p-4">
              <CheckCircle className="h-12 w-12 text-green-600" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-green-700 mb-4">
            {isRTL ? '🎉 تم الدفع بنجاح!' : '🎉 Payment Successful!'}
          </h1>
          <p className="text-xl text-text-secondary max-w-2xl mx-auto">
            {isRTL 
              ? 'تهانينا! تم تفعيل اشتراكك بنجاح. يمكنك الآن الاستفادة من جميع ميزات الباقة.'
              : 'Congratulations! Your subscription has been activated successfully. You can now enjoy all plan features.'
            }
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Payment Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Transaction Details */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: showAnimation ? 3.4 : 0.2 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <CreditCard className="h-5 w-5 text-green-600" />
                    {isRTL ? 'تفاصيل المعاملة' : 'Transaction Details'}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-text-secondary">{isRTL ? 'رقم المعاملة' : 'Transaction ID'}</p>
                      <p className="font-mono text-sm font-medium">{paymentData.transactionId}</p>
                    </div>
                    <div>
                      <p className="text-sm text-text-secondary">{isRTL ? 'المبلغ المدفوع' : 'Amount Paid'}</p>
                      <p className="font-bold text-green-600">{paymentData.amount.toLocaleString()} EGP</p>
                    </div>
                    <div>
                      <p className="text-sm text-text-secondary">{isRTL ? 'الباقة' : 'Plan'}</p>
                      <p className="font-medium">{isRTL ? paymentData.planDetails.nameAr : paymentData.planDetails.name}</p>
                    </div>
                    <div>
                      <p className="text-sm text-text-secondary">{isRTL ? 'تاريخ الدفع' : 'Payment Date'}</p>
                      <p className="font-medium">{new Date().toLocaleDateString()}</p>
                    </div>
                  </div>

                  <Separator />

                  <div className="flex flex-wrap gap-2">
                    <Button onClick={handleDownloadReceipt} variant="outline" size="sm">
                      <Download className="h-4 w-4 mr-2" />
                      {isRTL ? 'تحميل الإيصال' : 'Download Receipt'}
                    </Button>
                    <Button onClick={handleSendConfirmationEmail} variant="outline" size="sm">
                      <Mail className="h-4 w-4 mr-2" />
                      {isRTL ? 'إرسال بالبريد' : 'Email Receipt'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Plan Features */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: showAnimation ? 3.6 : 0.4 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <Crown className="h-5 w-5 text-yellow-500" />
                    {isRTL ? 'ميزات باقتك' : 'Your Plan Features'}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {(isRTL ? paymentData.planDetails.featuresAr : paymentData.planDetails.features).map((feature, index) => (
                      <motion.li
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: (showAnimation ? 3.8 : 0.6) + index * 0.1 }}
                        className="flex items-start gap-3"
                      >
                        <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                        <span className="text-text-secondary">{feature}</span>
                      </motion.li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </motion.div>

            {/* Next Steps */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: showAnimation ? 3.8 : 0.6 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <ArrowRight className="h-5 w-5 text-blue-600" />
                    {isRTL ? 'الخطوات التالية' : 'Next Steps'}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {getNextSteps().map((step, index) => {
                    const Icon = step.icon;
                    return (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: (showAnimation ? 4 : 0.8) + index * 0.2 }}
                        className="flex items-start gap-4 p-4 border rounded-lg hover:shadow-md transition-shadow"
                      >
                        <div className="bg-blue-100 rounded-lg p-2 flex-shrink-0">
                          <Icon className="h-5 w-5 text-blue-600" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-text-primary mb-2">
                            {isRTL ? step.titleAr : step.title}
                          </h3>
                          <p className="text-sm text-text-secondary mb-3">
                            {isRTL ? step.descriptionAr : step.description}
                          </p>
                          <Button 
                            onClick={step.action} 
                            variant="outline" 
                            size="sm"
                            className="text-blue-600 border-blue-600 hover:bg-blue-50"
                          >
                            {step.buttonText}
                          </Button>
                        </div>
                      </motion.div>
                    );
                  })}
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Subscription Summary */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: showAnimation ? 4 : 0.8 }}
            >
              <Card className="sticky top-6">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <Shield className="h-5 w-5 text-green-600" />
                    {isRTL ? 'ملخص الاشتراك' : 'Subscription Summary'}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-center">
                    <div className="bg-gradient-to-br from-green-100 to-blue-100 rounded-lg p-6 mb-4">
                      <Crown className="h-8 w-8 text-yellow-500 mx-auto mb-2" />
                      <h3 className="font-bold text-lg text-text-primary">
                        {isRTL ? paymentData.planDetails.nameAr : paymentData.planDetails.name}
                      </h3>
                      <Badge className="bg-green-primary text-white mt-2">
                        {isRTL ? 'نشط' : 'Active'}
                      </Badge>
                    </div>
                  </div>

                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-text-secondary">{isRTL ? 'نوع الباقة' : 'Plan Type'}</span>
                      <span className="font-medium">
                        {paymentData.planDetails.type === 'PROVIDER' 
                          ? (isRTL ? 'مقدم خدمة' : 'Provider')
                          : (isRTL ? 'مستخدم' : 'User')
                        }
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-text-secondary">{isRTL ? 'تاريخ التفعيل' : 'Activation Date'}</span>
                      <span className="font-medium">{new Date().toLocaleDateString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-text-secondary">{isRTL ? 'تاريخ التجديد' : 'Next Renewal'}</span>
                      <span className="font-medium">
                        {new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-3">
                    <Button 
                      onClick={() => navigate('/dashboard')} 
                      className="w-full"
                    >
                      <Home className="h-4 w-4 mr-2" />
                      {isRTL ? 'الذهاب للوحة التحكم' : 'Go to Dashboard'}
                    </Button>
                    
                    <Button 
                      onClick={() => navigate('/dashboard/subscription')} 
                      variant="outline" 
                      className="w-full"
                    >
                      <Settings className="h-4 w-4 mr-2" />
                      {isRTL ? 'إدارة الاشتراك' : 'Manage Subscription'}
                    </Button>
                  </div>

                  {/* Support */}
                  <div className="bg-blue-50 rounded-lg p-4 text-center">
                    <p className="text-sm text-blue-800 mb-2">
                      {isRTL ? 'هل تحتاج مساعدة؟' : 'Need help?'}
                    </p>
                    <Button variant="link" size="sm" className="text-blue-600">
                      {isRTL ? 'تواصل مع الدعم' : 'Contact Support'}
                    </Button>
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

export default PaymentSuccess;
