import React, { useState } from 'react';
import PaymentIframe from './PaymentIframe';
import { Button } from '@/components/ui/button';

// Example usage of PaymentIframe component
const PaymentIframeExample = () => {
  const [showPaymentIframe, setShowPaymentIframe] = useState(false);

  // These URLs would typically come from your payment initialization API
  const mockPaymentUrls = {
    // For mobile wallet (redirect)
    redirectUrl: 'https://accept.paymob.com/api/acceptance/iframes/960980?payment_token=YOUR_PAYMENT_TOKEN',
    
    // For card payments (iframe)
    iframeUrl: 'https://accept.paymob.com/api/acceptance/iframes/960980?payment_token=YOUR_PAYMENT_TOKEN'
  };

  const handlePaymentSuccess = (transactionId: string) => {
    console.log('Payment successful!', transactionId);
    // Handle success - redirect to success page, show success message, etc.
  };

  const handlePaymentFailed = (error: string) => {
    console.error('Payment failed:', error);
    // Handle failure - show error message, allow retry, etc.
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Payment Iframe Examples</h1>
      
      <div className="grid gap-4 md:grid-cols-3">
        {/* Card Payment Example */}
        <div className="border rounded-lg p-4">
          <h3 className="font-semibold mb-2">💳 Card Payment</h3>
          <p className="text-sm text-stone-600 mb-4">Shows payment form in an iframe</p>
          <Button
            onClick={() => setShowPaymentIframe(true)}
            className="w-full"
          >
            Pay with Card
          </Button>
        </div>

        {/* Mobile Wallet Example */}
        <div className="border rounded-lg p-4">
          <h3 className="font-semibold mb-2">📱 Mobile Wallet</h3>
          <p className="text-sm text-stone-600 mb-4">Redirects to wallet selection page</p>
          <Button
            onClick={() => setShowPaymentIframe(true)}
            className="w-full"
          >
            Pay with Mobile Wallet
          </Button>
        </div>

        {/* Bank Transfer Example */}
        <div className="border rounded-lg p-4">
          <h3 className="font-semibold mb-2">🏦 Bank Transfer</h3>
          <p className="text-sm text-stone-600 mb-4">Opens bank transfer page</p>
          <Button
            onClick={() => setShowPaymentIframe(true)}
            className="w-full"
          >
            Pay via Bank Transfer
          </Button>
        </div>
      </div>

      {/* Payment Iframe */}
      <PaymentIframe
        isVisible={showPaymentIframe}
        
        // For card payments, provide iframeUrl
        iframeUrl={mockPaymentUrls.iframeUrl}
        
        // For mobile wallet/bank transfer, provide redirectUrl
        redirectUrl={mockPaymentUrls.redirectUrl}
        
        // Payment details
        paymentMethod="mobile_wallet" // 'card' | 'mobile_wallet' | 'bank_transfer'
        amount={2000}
        currency="EGP"
        
        // Event handlers
        onPaymentSuccess={handlePaymentSuccess}
        onPaymentFailed={handlePaymentFailed}
        onClose={() => setShowPaymentIframe(false)}
      />
    </div>
  );
};

export default PaymentIframeExample;
