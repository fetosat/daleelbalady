import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { 
  CreditCard, 
  Wallet, 
  Smartphone, 
  Shield, 
  Lock,
  Check,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Separator } from '@/components/ui/separator';
import { apiFetch } from '@/utils/apiClient';
import PaymentIframe from './PaymentIframe';

interface PaymentMethod {
  id: string;
  name: string;
  nameAr: string;
  icon: React.ElementType;
  description: string;
  descriptionAr: string;
  fees?: number;
  isAvailable: boolean;
}

interface PaymentGatewayProps {
  amount: number;
  currency?: string;
  planType?: 'PROVIDER' | 'USER';
  planId: string;
  discount?: number;
  onPaymentSuccess: (transactionId: string) => void;
  onPaymentFailed: (error: string) => void;
  onBack?: () => void;
}

const PaymentGateway: React.FC<PaymentGatewayProps> = ({
  amount,
  currency = 'EGP',
  planType = 'PROVIDER',
  planId,
  discount = 0,
  onPaymentSuccess,
  onPaymentFailed,
  onBack
}) => {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';
  
  const [selectedMethod, setSelectedMethod] = useState<string>('card');
  const [isProcessing, setIsProcessing] = useState(false);
  const [holderName, setHolderName] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  // Payment iframe state
  const [showPaymentIframe, setShowPaymentIframe] = useState(false);
  const [paymentUrls, setPaymentUrls] = useState<{
    iframeUrl?: string;
    redirectUrl?: string;
  }>({});

  const paymentMethods: PaymentMethod[] = [
    {
      id: 'card',
      name: 'Credit/Debit Card',
      nameAr: 'بطاقة ائتمان/خصم',
      icon: CreditCard,
      description: 'Visa, Mastercard, and local cards',
      descriptionAr: 'فيزا، ماستركارد، والبطاقات المحلية',
      fees: 0,
      isAvailable: true
    },
    {
      id: 'mobile_wallet',
      name: 'Mobile Wallet',
      nameAr: 'المحفظة المحمولة',
      icon: Smartphone,
      description: 'Vodafone Cash, Orange Cash, Etisalat Cash',
      descriptionAr: 'فودافون كاش، أورانج كاش، اتصالات كاش',
      fees: 0,
      isAvailable: true
    },
    {
      id: 'bank_transfer',
      name: 'Bank Transfer',
      nameAr: 'تحويل بنكي',
      icon: Wallet,
      description: 'Direct bank transfer',
      descriptionAr: 'تحويل بنكي مباشر',
      fees: 0,
      isAvailable: true
    }
  ];

  const finalAmount = amount - (amount * discount / 100);

  const validateCardData = () => {
    const newErrors: Record<string, string> = {};
    
    if (!holderName.trim()) {
      newErrors.holderName = isRTL ? 'اسم حامل البطاقة مطلوب' : 'Cardholder name required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateMobileWallet = () => {
    const newErrors: Record<string, string> = {};
    
    if (!mobileNumber || !/^01[0125][0-9]{8}$/.test(mobileNumber)) {
      newErrors.mobile = isRTL ? 'رقم الهاتف غير صحيح' : 'Invalid mobile number';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const initializePaymobPayment = async () => {
    try {
      // Initialize Paymob payment using centralized API client
      const response = await apiFetch('/payments/initialize', {
        method: 'POST',
        body: JSON.stringify({
          amount: finalAmount,
          currency,
          planType,
          planId,
          paymentMethod: selectedMethod,
          holderName: selectedMethod === 'card' ? holderName : undefined,
          mobileNumber: selectedMethod === 'mobile_wallet' ? mobileNumber : undefined
        })
      });

      const data = await response.json();

      // Store payment URLs and show iframe
      setPaymentUrls({
        iframeUrl: data.iframeUrl,
        redirectUrl: data.redirectUrl
      });
      
      setShowPaymentIframe(true);

    } catch (error) {
      console.error('Payment error:', error);
      onPaymentFailed(error instanceof Error ? error.message : 'Payment failed');
    }
  };

  const handlePayment = async () => {
    setIsProcessing(true);
    setErrors({});

    let isValid = false;
    
    if (selectedMethod === 'card') {
      isValid = validateCardData();
    } else if (selectedMethod === 'mobile_wallet') {
      isValid = validateMobileWallet();
    } else {
      isValid = true;
    }

    if (!isValid) {
      setIsProcessing(false);
      return;
    }

    await initializePaymobPayment();
    setIsProcessing(false);
  };


  return (
    <div className="max-w-2xl mx-auto">
      <Card className="border-0 shadow-xl">
        <CardHeader className="text-center pb-6">
          <CardTitle className="flex items-center justify-center gap-3 text-2xl font-bold text-text-primary">
            <Shield className="h-6 w-6 text-green-primary" />
            {isRTL ? 'الدفع الآمن' : 'Secure Payment'}
          </CardTitle>
          <p className="text-text-secondary">
            {isRTL ? 'جميع المعاملات محمية بتشفير SSL' : 'All transactions are protected with SSL encryption'}
          </p>
        </CardHeader>

        <CardContent className="space-y-8">
          {/* Payment Summary */}
          <div className="bg-background-secondary/30 rounded-lg p-6">
            <h3 className="font-semibold text-text-primary mb-4 flex items-center gap-2">
              <Check className="h-4 w-4 text-green-primary" />
              {isRTL ? 'ملخص الدفع' : 'Payment Summary'}
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-text-secondary">{isRTL ? 'المبلغ الأساسي' : 'Base Amount'}</span>
                <span className="font-medium">{amount.toLocaleString()} {currency}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between items-center text-green-600">
                  <span>{isRTL ? `خصم (${discount}%)` : `Discount (${discount}%)`}</span>
                  <span>-{(amount * discount / 100).toLocaleString()} {currency}</span>
                </div>
              )}
              <Separator />
              <div className="flex justify-between items-center text-lg font-bold text-text-primary">
                <span>{isRTL ? 'إجمالي المبلغ' : 'Total Amount'}</span>
                <span className="text-green-primary">{finalAmount.toLocaleString()} {currency}</span>
              </div>
            </div>
          </div>

          {/* Payment Methods */}
          <div>
            <Label className="text-base font-semibold text-text-primary mb-4 block">
              {isRTL ? 'اختر طريقة الدفع' : 'Select Payment Method'}
            </Label>
            
            <RadioGroup value={selectedMethod} onValueChange={setSelectedMethod} className="space-y-4">
              {paymentMethods.map((method) => {
                const Icon = method.icon;
                return (
                  <div key={method.id} className="relative">
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className={`flex items-center space-x-3 p-4 rounded-lg border-2 cursor-pointer transition-all ${
                        selectedMethod === method.id 
                          ? 'border-green-primary bg-green-subtle/20' 
                          : 'border-border hover:border-green-primary/50'
                      } ${!method.isAvailable ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      <RadioGroupItem 
                        value={method.id} 
                        id={method.id}
                        disabled={!method.isAvailable}
                      />
                      <div className="flex items-center gap-3 flex-1">
                        <div className={`p-2 rounded-full ${
                          selectedMethod === method.id ? 'bg-green-primary text-white' : 'bg-background-secondary'
                        }`}>
                          <Icon className="h-5 w-5" />
                        </div>
                        <div>
                          <Label htmlFor={method.id} className="font-medium text-text-primary cursor-pointer">
                            {isRTL ? method.nameAr : method.name}
                          </Label>
                          <p className="text-sm text-text-secondary">
                            {isRTL ? method.descriptionAr : method.description}
                          </p>
                        </div>
                        {method.fees && method.fees > 0 && (
                          <Badge variant="outline" className="ml-auto">
                            +{method.fees} {currency}
                          </Badge>
                        )}
                      </div>
                    </motion.div>
                    {!method.isAvailable && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Badge variant="secondary">
                          {isRTL ? 'قريبًا' : 'Coming Soon'}
                        </Badge>
                      </div>
                    )}
                  </div>
                );
              })}
            </RadioGroup>
          </div>

          {/* Payment Details Form */}
          {selectedMethod === 'card' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4 border rounded-lg p-6 bg-background-secondary/20"
            >
              <h4 className="font-semibold text-text-primary mb-4">
                {isRTL ? 'معلومات الدفع' : 'Payment Information'}
              </h4>
              
              <div className="space-y-4">
                <div>
                  <Label htmlFor="holderName">{isRTL ? 'اسم حامل البطاقة' : 'Cardholder Name'}</Label>
                  <Input
                    id="holderName"
                    placeholder={isRTL ? 'كما هو مكتوب على البطاقة' : 'As written on card'}
                    value={holderName}
                    onChange={(e) => setHolderName(e.target.value)}
                    className={errors.holderName ? 'border-red-500' : ''}
                  />
                  {errors.holderName && <p className="text-red-500 text-sm mt-1">{errors.holderName}</p>}
                </div>
                
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <Shield className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <h5 className="font-medium text-blue-800 mb-1">
                        {isRTL ? 'معلومات البطاقة الآمنة' : 'Secure Card Information'}
                      </h5>
                      <p className="text-sm text-blue-700">
                        {isRTL 
                          ? 'سيتم إدخال تفاصيل البطاقة (الرقم، تاريخ الانتهاء، CVV) بشكل آمن في الصفحة التالية من خلال Paymob المشفرة.'
                          : 'Card details (number, expiry, CVV) will be securely entered on the next page through Paymob\'s encrypted form.'
                        }
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {selectedMethod === 'mobile_wallet' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4 border rounded-lg p-6 bg-background-secondary/20"
            >
              <h4 className="font-semibold text-text-primary mb-4">
                {isRTL ? 'تفاصيل المحفظة المحمولة' : 'Mobile Wallet Details'}
              </h4>
              
              <div>
                <Label htmlFor="mobileNumber">{isRTL ? 'رقم الهاتف' : 'Mobile Number'}</Label>
                <Input
                  id="mobileNumber"
                  placeholder={isRTL ? '01XXXXXXXXX' : '01XXXXXXXXX'}
                  value={mobileNumber}
                  onChange={(e) => setMobileNumber(e.target.value.replace(/\D/g, ''))}
                  maxLength={11}
                  className={errors.mobile ? 'border-red-500' : ''}
                />
                {errors.mobile && <p className="text-red-500 text-sm mt-1">{errors.mobile}</p>}
                <p className="text-sm text-text-secondary mt-1">
                  {isRTL ? 'سيتم إرسال رسالة تأكيد للرقم المدخل' : 'A confirmation message will be sent to this number'}
                </p>
              </div>
            </motion.div>
          )}

          {selectedMethod === 'bank_transfer' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4 border rounded-lg p-6 bg-yellow-50 border-yellow-200"
            >
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold text-text-primary mb-2">
                    {isRTL ? 'تعليمات التحويل البنكي' : 'Bank Transfer Instructions'}
                  </h4>
                  <p className="text-sm text-text-secondary mb-3">
                    {isRTL 
                      ? 'سيتم توجيهك لإكمال التحويل البنكي بعد تأكيد الطلب' 
                      : 'You will be redirected to complete the bank transfer after confirming your order'
                    }
                  </p>
                  <div className="text-sm space-y-1">
                    <p><strong>{isRTL ? 'مدة المعالجة:' : 'Processing Time:'}</strong> {isRTL ? '1-2 يوم عمل' : '1-2 business days'}</p>
                    <p><strong>{isRTL ? 'رسوم إضافية:' : 'Additional Fees:'}</strong> {isRTL ? 'حسب البنك' : 'As per bank charges'}</p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Security Notice */}
          <div className="flex items-start gap-3 p-4 bg-green-50 rounded-lg border border-green-200">
            <Lock className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
            <div className="text-sm">
              <p className="font-medium text-green-800 mb-1">
                {isRTL ? 'دفع آمن 100%' : '100% Secure Payment'}
              </p>
              <p className="text-green-700">
                {isRTL 
                  ? 'معلوماتك محمية بتشفير SSL 256-bit. تفاصيل البطاقة يتم تجميعها مباشرة بواسطة Paymob ولا تمر عبر خوادمنا.'
                  : 'Your information is protected with 256-bit SSL encryption. Card details are collected directly by Paymob and never pass through our servers.'
                }
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 pt-4">
            {onBack && (
              <Button 
                variant="outline" 
                onClick={onBack}
                disabled={isProcessing}
                className="flex-1"
              >
                {isRTL ? 'رجوع' : 'Back'}
              </Button>
            )}
            <Button 
              onClick={handlePayment}
              disabled={isProcessing || !paymentMethods.find(m => m.id === selectedMethod)?.isAvailable}
              className="flex-1"
              size="lg"
            >
              {isProcessing ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {isRTL ? 'جاري المعالجة...' : 'Processing...'}
                </div>
              ) : (
                <>
                  <Lock className="h-4 w-4 mr-2" />
                  {isRTL ? `ادفع ${finalAmount.toLocaleString()} ${currency}` : `Pay ${finalAmount.toLocaleString()} ${currency}`}
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
      
      {/* Payment Iframe */}
      <PaymentIframe
        isVisible={showPaymentIframe}
        iframeUrl={paymentUrls.iframeUrl}
        redirectUrl={paymentUrls.redirectUrl}
        paymentMethod={selectedMethod as 'card' | 'mobile_wallet' | 'bank_transfer'}
        amount={finalAmount}
        currency={currency}
        onPaymentSuccess={(transactionId) => {
          setShowPaymentIframe(false);
          onPaymentSuccess(transactionId);
        }}
        onPaymentFailed={(error) => {
          setShowPaymentIframe(false);
          onPaymentFailed(error);
        }}
        onClose={() => {
          setShowPaymentIframe(false);
          setIsProcessing(false);
        }}
      />
    </div>
  );
};

export default PaymentGateway;
