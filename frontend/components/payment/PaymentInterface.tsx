import React, { useState, useEffect, useCallback } from 'react';
import { 
  CreditCardIcon, 
  ShieldCheckIcon, 
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  BanknotesIcon,
  DocumentTextIcon,
  ArrowRightIcon
} from '@heroicons/react/24/outline';

interface PaymentProvider {
  id: string;
  name: string;
  nameAr: string;
  logo: string;
  fees: number;
  processingTime: string;
  supported: boolean;
  description: string;
}

interface PaymentData {
  amount: number;
  currency: string;
  serviceId: string;
  provider: string;
  metadata?: Record<string, any>;
}

interface PaymentState {
  loading: boolean;
  processing: boolean;
  success: boolean;
  error: string | null;
  paymentRef: string | null;
  paymentUrl: string | null;
}

const PAYMENT_PROVIDERS: PaymentProvider[] = [
  {
    id: 'paymob',
    name: 'PayMob',
    nameAr: 'بايموب',
    logo: '/images/payment/paymob.png',
    fees: 2.5,
    processingTime: 'فوري',
    supported: true,
    description: 'الدفع بالفيزا أو ماستركارد'
  },
  {
    id: 'fawry',
    name: 'Fawry',
    nameAr: 'فوري',
    logo: '/images/payment/fawry.png',
    fees: 3,
    processingTime: 'فوري',
    supported: true,
    description: 'الدفع من فروع فوري أو المحافظ الإلكترونية'
  },
  {
    id: 'stripe',
    name: 'Stripe',
    nameAr: 'سترايب',
    logo: '/images/payment/stripe.png',
    fees: 2.9,
    processingTime: 'فوري',
    supported: true,
    description: 'الدفع الإلكتروني العالمي'
  },
  {
    id: 'paypal',
    name: 'PayPal',
    nameAr: 'باي بال',
    logo: '/images/payment/paypal.png',
    fees: 3.4,
    processingTime: 'فوري',
    supported: false,
    description: 'محفظة باي بال الإلكترونية'
  }
];

const PaymentInterface: React.FC<{
  paymentData: PaymentData;
  onSuccess: (paymentRef: string) => void;
  onCancel: () => void;
}> = ({ paymentData, onSuccess, onCancel }) => {
  const [selectedProvider, setSelectedProvider] = useState<string>('paymob');
  const [paymentState, setPaymentState] = useState<PaymentState>({
    loading: false,
    processing: false,
    success: false,
    error: null,
    paymentRef: null,
    paymentUrl: null
  });
  const [agreement, setAgreement] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  const selectedProviderData = PAYMENT_PROVIDERS.find(p => p.id === selectedProvider);
  const finalAmount = paymentData.amount + (paymentData.amount * (selectedProviderData?.fees || 0) / 100);

  /**
   * إنشاء Intent للدفع
   */
  const createPaymentIntent = async () => {
    if (!agreement) {
      setPaymentState(prev => ({ ...prev, error: 'يجب الموافقة على الشروط والأحكام' }));
      return;
    }

    setPaymentState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const response = await fetch('/api/payment/create-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...paymentData,
          provider: selectedProvider.toUpperCase()
        })
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'فشل في إنشاء طلب الدفع');
      }

      setPaymentState(prev => ({
        ...prev,
        loading: false,
        paymentRef: result.paymentRef,
        paymentUrl: result.paymentUrl
      }));

      // فتح صفحة الدفع
      if (result.paymentUrl) {
        const paymentWindow = window.open(result.paymentUrl, '_blank', 'width=800,height=600');
        
        // مراقبة حالة الدفع
        startPaymentMonitoring(result.paymentRef, paymentWindow);
      }

    } catch (error) {
      setPaymentState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'حدث خطأ غير متوقع'
      }));
    }
  };

  /**
   * مراقبة حالة الدفع
   */
  const startPaymentMonitoring = useCallback((paymentRef: string, paymentWindow: Window | null) => {
    setPaymentState(prev => ({ ...prev, processing: true }));

    const checkPaymentStatus = async () => {
      try {
        const response = await fetch(`/api/payment/verify/${paymentRef}`);
        const result = await response.json();

        if (result.status === 'COMPLETED') {
          setPaymentState(prev => ({ ...prev, processing: false, success: true }));
          if (paymentWindow) paymentWindow.close();
          onSuccess(paymentRef);
        } else if (result.status === 'FAILED') {
          setPaymentState(prev => ({ 
            ...prev, 
            processing: false, 
            error: 'فشل في عملية الدفع' 
          }));
          if (paymentWindow) paymentWindow.close();
        }
      } catch (error) {
        console.error('Payment verification error:', error);
      }
    };

    // فحص كل 3 ثوان
    const interval = setInterval(checkPaymentStatus, 3000);

    // فحص إغلاق النافذة
    const windowCheckInterval = setInterval(() => {
      if (paymentWindow && paymentWindow.closed) {
        clearInterval(interval);
        clearInterval(windowCheckInterval);
        setPaymentState(prev => ({ ...prev, processing: false }));
        
        // فحص أخير لحالة الدفع
        setTimeout(checkPaymentStatus, 1000);
      }
    }, 1000);

    // تنظيف بعد 15 دقيقة
    setTimeout(() => {
      clearInterval(interval);
      clearInterval(windowCheckInterval);
      if (paymentWindow && !paymentWindow.closed) {
        paymentWindow.close();
      }
      setPaymentState(prev => ({ 
        ...prev, 
        processing: false,
        error: 'انتهت مهلة الدفع'
      }));
    }, 15 * 60 * 1000);
  }, [onSuccess]);

  /**
   * إعادة تعيين حالة الدفع
   */
  const resetPaymentState = () => {
    setPaymentState({
      loading: false,
      processing: false,
      success: false,
      error: null,
      paymentRef: null,
      paymentUrl: null
    });
    setAgreement(false);
  };

  if (paymentState.success) {
    return (
      <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-lg text-center">
        <CheckCircleIcon className="w-16 h-16 text-green-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-green-600 mb-2">
          تم الدفع بنجاح
        </h2>
        <p className="text-gray-600 mb-4">
          رقم المرجع: {paymentState.paymentRef}
        </p>
        <button
          onClick={() => onSuccess(paymentState.paymentRef!)}
          className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors"
        >
          متابعة
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto p-6 bg-white rounded-lg shadow-lg">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800">
          إتمام الدفع
        </h2>
        <button
          onClick={onCancel}
          className="text-gray-400 hover:text-gray-600 transition-colors"
        >
          <XCircleIcon className="w-6 h-6" />
        </button>
      </div>

      {/* Payment Summary */}
      <div className="bg-gray-50 rounded-lg p-4 mb-6">
        <div className="flex justify-between items-center mb-2">
          <span className="text-gray-600">قيمة الخدمة:</span>
          <span className="font-semibold">{paymentData.amount} {paymentData.currency}</span>
        </div>
        <div className="flex justify-between items-center mb-2">
          <span className="text-gray-600">رسوم المعاملة:</span>
          <span className="text-sm text-gray-500">
            {selectedProviderData ? (finalAmount - paymentData.amount).toFixed(2) : '0'} {paymentData.currency}
          </span>
        </div>
        <div className="border-t pt-2 mt-2">
          <div className="flex justify-between items-center font-bold">
            <span>المجموع:</span>
            <span className="text-lg text-blue-600">
              {finalAmount.toFixed(2)} {paymentData.currency}
            </span>
          </div>
        </div>
      </div>

      {/* Provider Selection */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-3">اختر طريقة الدفع</h3>
        <div className="grid gap-3">
          {PAYMENT_PROVIDERS.map((provider) => (
            <label
              key={provider.id}
              className={`
                flex items-center p-3 border rounded-lg cursor-pointer transition-all
                ${selectedProvider === provider.id 
                  ? 'border-blue-500 bg-blue-50' 
                  : 'border-gray-200 hover:border-gray-300'
                }
                ${!provider.supported ? 'opacity-50 cursor-not-allowed' : ''}
              `}
            >
              <input
                type="radio"
                name="provider"
                value={provider.id}
                checked={selectedProvider === provider.id}
                onChange={(e) => setSelectedProvider(e.target.value)}
                disabled={!provider.supported}
                className="sr-only"
              />
              <div className="flex-1 flex items-center">
                <img
                  src={provider.logo}
                  alt={provider.name}
                  className="w-8 h-8 ml-3"
                  onError={(e) => {
                    e.currentTarget.src = '/images/payment/default.png';
                  }}
                />
                <div className="flex-1">
                  <div className="font-semibold">
                    {provider.nameAr}
                    {!provider.supported && (
                      <span className="text-sm text-gray-400 mr-2">(قريباً)</span>
                    )}
                  </div>
                  <div className="text-sm text-gray-600">
                    {provider.description}
                  </div>
                </div>
                <div className="text-left">
                  <div className="text-sm font-semibold">
                    {provider.fees}%
                  </div>
                  <div className="text-xs text-gray-500">
                    {provider.processingTime}
                  </div>
                </div>
              </div>
              {selectedProvider === provider.id && (
                <CheckCircleIcon className="w-5 h-5 text-blue-500 mr-2" />
              )}
            </label>
          ))}
        </div>
      </div>

      {/* Security Info */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
        <div className="flex items-center text-green-800">
          <ShieldCheckIcon className="w-5 h-5 ml-2" />
          <span className="text-sm font-medium">
            جميع المعاملات مؤمنة ومشفرة بأعلى معايير الأمان
          </span>
        </div>
      </div>

      {/* Agreement */}
      <div className="mb-4">
        <label className="flex items-start">
          <input
            type="checkbox"
            checked={agreement}
            onChange={(e) => setAgreement(e.target.checked)}
            className="mt-1 ml-2 text-blue-600 focus:ring-blue-500"
          />
          <span className="text-sm text-gray-600">
            أوافق على{' '}
            <button
              type="button"
              onClick={() => setShowDetails(!showDetails)}
              className="text-blue-600 underline hover:text-blue-700"
            >
              الشروط والأحكام
            </button>
            {' '}وسياسة الاسترداد
          </span>
        </label>
      </div>

      {/* Terms Details */}
      {showDetails && (
        <div className="bg-gray-50 border rounded-lg p-4 mb-4 text-sm">
          <h4 className="font-semibold mb-2">الشروط والأحكام:</h4>
          <ul className="list-disc list-inside space-y-1 text-gray-600">
            <li>جميع المدفوعات قابلة للاسترداد خلال 24 ساعة</li>
            <li>يتم معالجة طلبات الاسترداد خلال 3-5 أيام عمل</li>
            <li>الخدمة محمية بضمان استرداد الأموال</li>
            <li>جميع البيانات محمية ومشفرة</li>
          </ul>
        </div>
      )}

      {/* Error Display */}
      {paymentState.error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
          <div className="flex items-center text-red-800">
            <ExclamationTriangleIcon className="w-5 h-5 ml-2" />
            <span className="text-sm">{paymentState.error}</span>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-3">
        <button
          onClick={onCancel}
          className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg hover:bg-gray-300 transition-colors"
          disabled={paymentState.loading || paymentState.processing}
        >
          إلغاء
        </button>
        <button
          onClick={createPaymentIntent}
          disabled={!agreement || paymentState.loading || paymentState.processing || !selectedProviderData?.supported}
          className={`
            flex-1 py-3 rounded-lg font-semibold transition-colors flex items-center justify-center
            ${agreement && selectedProviderData?.supported && !paymentState.loading && !paymentState.processing
              ? 'bg-blue-600 text-white hover:bg-blue-700'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }
          `}
        >
          {paymentState.loading ? (
            <div className="flex items-center">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white ml-2"></div>
              جاري التحضير...
            </div>
          ) : paymentState.processing ? (
            <div className="flex items-center">
              <ClockIcon className="w-4 h-4 ml-2" />
              جاري المعالجة...
            </div>
          ) : (
            <div className="flex items-center">
              <BanknotesIcon className="w-4 h-4 ml-2" />
              ادفع الآن
            </div>
          )}
        </button>
      </div>

      {/* Processing Overlay */}
      {paymentState.processing && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg text-center max-w-sm">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <h3 className="text-lg font-semibold mb-2">
              جاري معالجة الدفع
            </h3>
            <p className="text-gray-600 text-sm">
              يرجى عدم إغلاق هذه النافذة
            </p>
            <button
              onClick={resetPaymentState}
              className="mt-4 text-sm text-gray-500 underline hover:text-gray-700"
            >
              إلغاء
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentInterface;
