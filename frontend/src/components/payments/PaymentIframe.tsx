import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { 
  X,
  Loader2,
  AlertCircle,
  CheckCircle,
  RefreshCw,
  ExternalLink
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface PaymentIframeProps {
  iframeUrl?: string;
  redirectUrl?: string;
  paymentMethod: 'card' | 'mobile_wallet' | 'bank_transfer';
  amount: number;
  currency: string;
  onPaymentSuccess: (transactionId: string) => void;
  onPaymentFailed: (error: string) => void;
  onClose: () => void;
  isVisible: boolean;
}

const PaymentIframe: React.FC<PaymentIframeProps> = ({
  iframeUrl,
  redirectUrl,
  paymentMethod,
  amount,
  currency,
  onPaymentSuccess,
  onPaymentFailed,
  onClose,
  isVisible
}) => {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';
  const iframeRef = useRef<HTMLIFrameElement>(null);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [paymentStatus, setPaymentStatus] = useState<'processing' | 'success' | 'failed' | null>(null);
  const [showFallback, setShowFallback] = useState(false);

  // Payment method configurations
  const paymentMethodConfig = {
    card: {
      icon: '💳',
      title: isRTL ? 'دفع بالبطاقة' : 'Card Payment',
      description: isRTL ? 'ادخل تفاصيل بطاقتك للمتابعة' : 'Enter your card details to continue'
    },
    mobile_wallet: {
      icon: '📱',
      title: isRTL ? 'المحفظة المحمولة' : 'Mobile Wallet',
      description: isRTL ? 'اختر محفظتك المحمولة للدفع' : 'Choose your mobile wallet to pay'
    },
    bank_transfer: {
      icon: '🏦',
      title: isRTL ? 'تحويل بنكي' : 'Bank Transfer',
      description: isRTL ? 'اكمل التحويل البنكي' : 'Complete your bank transfer'
    }
  };

  const config = paymentMethodConfig[paymentMethod];

  useEffect(() => {
    if (!isVisible) return;

    // Set timeout to show fallback option if iframe takes too long
    const timeout = setTimeout(() => {
      if (loading) {
        setShowFallback(true);
      }
    }, 10000); // 10 seconds

    // Listen for messages from the payment iframe
    const handleMessage = (event: MessageEvent) => {
      // Security check - only accept messages from Paymob domains
      const allowedOrigins = [
        'https://accept.paymob.com',
        'https://accept.paymobsolutions.com'
      ];
      
      if (!allowedOrigins.some(origin => event.origin.startsWith(origin))) {
        return;
      }

      try {
        const data = typeof event.data === 'string' ? JSON.parse(event.data) : event.data;
        
        console.log('Payment iframe message:', data);

        // Handle different message types from Paymob
        switch (data.type) {
          case 'payment_success':
            setPaymentStatus('success');
            setLoading(false);
            setTimeout(() => {
              onPaymentSuccess(data.transactionId || 'success_' + Date.now());
            }, 1500);
            break;
            
          case 'payment_failed':
          case 'payment_error':
            setPaymentStatus('failed');
            setError(data.message || 'Payment failed');
            setLoading(false);
            setTimeout(() => {
              onPaymentFailed(data.message || 'Payment failed');
            }, 2000);
            break;
            
          case 'payment_cancelled':
            setError('Payment was cancelled');
            setLoading(false);
            break;
            
          case 'iframe_loaded':
            setLoading(false);
            break;
            
          default:
            // Handle generic success/failure based on URL changes or other indicators
            if (data.success === true) {
              setPaymentStatus('success');
              onPaymentSuccess(data.transactionId || 'success_' + Date.now());
            } else if (data.success === false) {
              setPaymentStatus('failed');
              onPaymentFailed(data.message || 'Payment failed');
            }
        }
      } catch (e) {
        console.error('Error parsing iframe message:', e);
      }
    };

    window.addEventListener('message', handleMessage);

    return () => {
      window.removeEventListener('message', handleMessage);
      clearTimeout(timeout);
    };
  }, [isVisible, onPaymentSuccess, onPaymentFailed]);

  const handleIframeLoad = () => {
    setLoading(false);
  };

  const handleIframeError = () => {
    setError('Failed to load payment form');
    setLoading(false);
  };

  const handleOpenInNewTab = () => {
    const url = iframeUrl || redirectUrl;
    if (url) {
      window.open(url, '_blank', 'width=800,height=600,scrollbars=yes,resizable=yes');
    }
  };

  const refreshIframe = () => {
    setLoading(true);
    setError(null);
    setPaymentStatus(null);
    setShowFallback(false);
    
    if (iframeRef.current) {
      iframeRef.current.src = iframeRef.current.src;
    }
  };

  if (!isVisible) return null;

  // Always use iframe when available, fallback to redirect URL
  const shouldUseIframe = !!(iframeUrl || redirectUrl);
  const paymentUrl = iframeUrl || redirectUrl;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white rounded-lg shadow-2xl w-full max-w-4xl h-[80vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center gap-3">
            <span className="text-2xl">{config.icon}</span>
            <div>
              <h2 className="text-xl font-bold text-stone-900">
                {config.title}
              </h2>
              <p className="text-sm text-stone-600">
                {config.description}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-lg font-semibold">
              {amount.toLocaleString()} {currency}
            </Badge>
            
            <div className="flex gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={refreshIframe}
                className="h-8 w-8 p-0"
                title={isRTL ? 'إعادة تحميل' : 'Refresh'}
              >
                <RefreshCw className="h-4 w-4" />
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={handleOpenInNewTab}
                className="h-8 w-8 p-0"
                title={isRTL ? 'فتح في نافذة جديدة' : 'Open in new tab'}
              >
                <ExternalLink className="h-4 w-4" />
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="h-8 w-8 p-0"
                title={isRTL ? 'إغلاق' : 'Close'}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 relative">
          {/* Loading State */}
          {loading && (
            <div className="absolute inset-0 flex items-center justify-center bg-stone-50">
              <div className="text-center max-w-md">
                <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
                <p className="text-stone-600 mb-4">
                  {isRTL ? 'جاري تحميل نموذج الدفع...' : 'Loading payment form...'}
                </p>
                {showFallback && (
                  <div className="space-y-3">
                    <p className="text-sm text-stone-500">
                      {isRTL 
                        ? 'يبدو أن التحميل يستغرق وقتاً أطول...'
                        : 'Loading is taking longer than expected...'
                      }
                    </p>
                    <Button onClick={handleOpenInNewTab} variant="outline">
                      {isRTL ? 'فتح في نافذة جديدة' : 'Open in New Tab'}
                      <ExternalLink className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Error State */}
          {error && !loading && (
            <div className="absolute inset-0 flex items-center justify-center bg-stone-50">
              <div className="text-center max-w-md">
                <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-stone-900 mb-2">
                  {isRTL ? 'خطأ في الدفع' : 'Payment Error'}
                </h3>
                <p className="text-stone-600 mb-4">{error}</p>
                <div className="flex gap-2 justify-center">
                  <Button onClick={refreshIframe} variant="outline">
                    {isRTL ? 'إعادة المحاولة' : 'Try Again'}
                  </Button>
                  <Button onClick={handleOpenInNewTab} variant="default">
                    {isRTL ? 'فتح في نافذة جديدة' : 'Open in New Tab'}
                  </Button>
                </div>
                <p className="text-xs text-stone-500 mt-4">
                  {isRTL 
                    ? 'إذا استمر هذا الخطأ، جرب فتح الدفع في نافذة جديدة' 
                    : 'If this error persists, try opening the payment in a new tab'
                  }
                </p>
              </div>
            </div>
          )}

          {/* Success State */}
          {paymentStatus === 'success' && (
            <div className="absolute inset-0 flex items-center justify-center bg-green-50">
              <div className="text-center">
                <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-stone-900 mb-2">
                  {isRTL ? 'تم الدفع بنجاح!' : 'Payment Successful!'}
                </h3>
                <p className="text-stone-600">
                  {isRTL ? 'جاري تحويلك...' : 'Redirecting you now...'}
                </p>
              </div>
            </div>
          )}

          {/* Payment Iframe - Always show iframe when available */}
          {paymentUrl && !error && paymentStatus !== 'success' && shouldUseIframe && (
            <iframe
              ref={iframeRef}
              src={paymentUrl}
              className="w-full h-full border-0"
              onLoad={handleIframeLoad}
              onError={handleIframeError}
              sandbox="allow-forms allow-scripts allow-same-origin allow-top-navigation allow-top-navigation-by-user-activation allow-popups allow-popups-to-escape-sandbox"
              title="Payment Form"
            />
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t bg-stone-50">
          <div className="flex items-center justify-between text-sm text-stone-600">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
              {isRTL ? 'اتصال آمن - محمي بـ SSL' : 'Secure Connection - Protected by SSL'}
            </div>
            <div>
              {isRTL ? 'مدعوم بواسطة Paymob' : 'Powered by Paymob'}
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default PaymentIframe;
