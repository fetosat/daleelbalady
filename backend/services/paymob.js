// Paymob Payment Gateway Integration Service
import fetch from 'node-fetch';
import crypto from 'crypto';

class PaymobService {
  constructor() {
    this.apiKey = process.env.PAYMOB_API_KEY;
    this.integrationId = process.env.PAYMOB_INTEGRATION_ID;
    this.iframeId = process.env.PAYMOB_IFRAME_ID;
    this.webhookSecret = process.env.PAYMOB_WEBHOOK_SECRET;
    this.baseURL = 'https://accept.paymob.com/api';
    this.authToken = null;
    
    // Validate environment variables
    this.validateConfig();
  }
  
  validateConfig() {
    const requiredVars = {
      PAYMOB_API_KEY: this.apiKey,
      PAYMOB_INTEGRATION_ID: this.integrationId,
      PAYMOB_IFRAME_ID: this.iframeId,
      PAYMOB_WEBHOOK_SECRET: this.webhookSecret
    };
    
    const missing = [];
    for (const [key, value] of Object.entries(requiredVars)) {
      if (!value) {
        missing.push(key);
      }
    }
    
    if (missing.length > 0) {
      console.error('❌ Missing Paymob configuration variables:', missing);
      throw new Error(`Missing Paymob configuration: ${missing.join(', ')}`);
    }
    
    // Check if API key is base64 encoded (common with Paymob)
    if (this.apiKey && this.apiKey.length > 100) {
      try {
        // Try to decode if it looks like base64
        const decoded = Buffer.from(this.apiKey, 'base64').toString('utf8');
        if (decoded.includes('api_key') || decoded.includes('token')) {
          console.log('🔄 API Key appears to be base64 encoded, using as-is');
        }
      } catch (e) {
        // Not base64, use as-is
      }
    }
    
    console.log('✅ Paymob configuration validated');
    console.log('🔑 API Key length:', this.apiKey?.length || 0);
    console.log('🔑 API Key starts with:', this.apiKey?.substring(0, 20) + '...');
    console.log('🔢 Integration ID:', this.integrationId);
    console.log('🖼️ Iframe ID:', this.iframeId);
  }

  // Authenticate with Paymob
  async authenticate() {
    try {
      console.log('🔑 Authenticating with Paymob...');
      
      const response = await fetch(`${this.baseURL}/auth/tokens`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          api_key: this.apiKey,
        }),
      });

      const data = await response.json();
      console.log('📡 Paymob auth response status:', response.status);
      console.log('📡 Paymob auth response data:', JSON.stringify(data, null, 2));
      
      if (data.token) {
        this.authToken = data.token;
        console.log('✅ Paymob authentication successful');
        return data.token;
      }
      
      console.error('❌ Paymob authentication failed - no token in response');
      throw new Error(`Failed to authenticate with Paymob: ${data.detail || JSON.stringify(data)}`);
    } catch (error) {
      console.error('💥 Paymob authentication error:', error.message);
      throw error;
    }
  }

  // Create order
  async createOrder(orderData) {
    try {
      console.log('🛒 Creating Paymob order...');
      
      if (!this.authToken) {
        await this.authenticate();
      }

      const orderPayload = {
        auth_token: this.authToken,
        delivery_needed: false,
        amount_cents: Math.round(orderData.amount * 100), // Convert to cents
        currency: orderData.currency || 'EGP',
        items: orderData.items || [],
      };
      
      console.log('📤 Order payload:', JSON.stringify(orderPayload, null, 2));

      const response = await fetch(`${this.baseURL}/ecommerce/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderPayload),
      });

      const data = await response.json();
      console.log('📡 Order response status:', response.status);
      console.log('📡 Order response data:', JSON.stringify(data, null, 2));
      
      if (data.id) {
        console.log('✅ Paymob order created successfully:', data.id);
        return data;
      }
      
      console.error('❌ Failed to create Paymob order - no ID in response');
      throw new Error(`Failed to create Paymob order: ${data.detail || JSON.stringify(data)}`);
    } catch (error) {
      console.error('💥 Paymob create order error:', error.message);
      throw error;
    }
  }

  // Create payment key
  async createPaymentKey(paymentData) {
    try {
      console.log('🔐 Creating Paymob payment key...');
      
      if (!this.authToken) {
        await this.authenticate();
      }

      const billingData = {
        apartment: paymentData.billingData?.apartment || 'NA',
        email: paymentData.billingData?.email || 'customer@example.com',
        floor: paymentData.billingData?.floor || 'NA',
        first_name: paymentData.billingData?.first_name || 'Customer',
        street: paymentData.billingData?.street || 'NA',
        building: paymentData.billingData?.building || 'NA',
        phone_number: paymentData.billingData?.phone_number || '+20123456789',
        shipping_method: 'NA',
        postal_code: 'NA',
        city: paymentData.billingData?.city || 'Cairo',
        country: paymentData.billingData?.country || 'Egypt',
        last_name: paymentData.billingData?.last_name || 'Customer',
        state: paymentData.billingData?.state || 'Cairo',
      };
      
      const paymentKeyPayload = {
        auth_token: this.authToken,
        amount_cents: Math.round(paymentData.amount * 100),
        expiration: 3600, // 1 hour
        order_id: paymentData.orderId,
        billing_data: billingData,
        currency: paymentData.currency || 'EGP',
        integration_id: parseInt(this.integrationId),
      };
      
      console.log('📤 Payment key payload:', JSON.stringify(paymentKeyPayload, null, 2));

      const response = await fetch(`${this.baseURL}/acceptance/payment_keys`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(paymentKeyPayload),
      });

      const data = await response.json();
      console.log('📡 Payment key response status:', response.status);
      console.log('📡 Payment key response data:', JSON.stringify(data, null, 2));
      
      if (data.token) {
        console.log('✅ Payment key created successfully');
        return data.token;
      }
      
      console.error('❌ Failed to create payment key - no token in response');
      throw new Error(`Failed to create payment key: ${data.detail || JSON.stringify(data)}`);
    } catch (error) {
      console.error('💥 Paymob create payment key error:', error.message);
      throw error;
    }
  }

  // Initialize payment
  async initializePayment(paymentRequest) {
    try {
      console.log('💳 Initializing payment with request data:');
      console.log('Amount:', paymentRequest.amount);
      console.log('Email:', paymentRequest.email);
      console.log('Holder Name:', paymentRequest.holderName);
      console.log('Mobile Number:', paymentRequest.mobileNumber);
      console.log('Payment Method:', paymentRequest.paymentMethod);
      
      // Create order first
      const order = await this.createOrder({
        amount: paymentRequest.amount,
        currency: paymentRequest.currency,
        items: [
          {
            name: `${paymentRequest.planType} Subscription - ${paymentRequest.planId}`,
            amount_cents: Math.round(paymentRequest.amount * 100),
            description: `Subscription plan payment for ${paymentRequest.planId}`,
            quantity: 1,
          },
        ],
      });

      // Create payment key with proper billing data
      const holderName = paymentRequest.holderName || paymentRequest.cardData?.holderName || 'Customer User';
      const nameParts = holderName.split(' ');
      const firstName = nameParts[0] || 'Customer';
      const lastName = nameParts.slice(1).join(' ') || 'User';
      
      console.log('📝 Constructing billing data:');
      console.log('Original holder name:', paymentRequest.holderName);
      console.log('Card holder name:', paymentRequest.cardData?.holderName);
      console.log('Final holder name:', holderName);
      console.log('First name:', firstName);
      console.log('Last name:', lastName);
      console.log('Email:', paymentRequest.email);
      
      const paymentKey = await this.createPaymentKey({
        amount: paymentRequest.amount,
        currency: paymentRequest.currency,
        orderId: order.id,
        billingData: {
          email: paymentRequest.email || 'customer@daleelbalady.com',
          first_name: firstName,
          last_name: lastName,
          phone_number: paymentRequest.mobileNumber || '+201234567890',
        },
      });

      // Generate transaction ID
      const transactionId = `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      // Generate payment URLs - use iframe for all payment methods
      const paymentUrl = `https://accept.paymob.com/api/acceptance/iframes/${this.iframeId}?payment_token=${paymentKey}`;
      
      let redirectUrl = null;
      let iframeUrl = null;

      // For all payment methods, use iframe for embedded experience
      iframeUrl = paymentUrl;
      
      // Also provide redirect URL as fallback
      redirectUrl = paymentUrl;
      
      console.log('🔗 Final payment URLs:');
      console.log('Payment method:', paymentRequest.paymentMethod);
      console.log('Redirect URL:', redirectUrl);
      console.log('Iframe URL:', iframeUrl);

      return {
        success: true,
        transactionId,
        orderId: order.id,
        paymentKey,
        redirectUrl,
        iframeUrl,
        message: 'Payment initialized successfully',
      };
    } catch (error) {
      console.error('Payment initialization error:', error);
      return {
        success: false,
        message: error.message || 'Payment initialization failed',
      };
    }
  }

  // Verify webhook signature
  verifyWebhookSignature(payload, signature) {
    try {
      const hmac = crypto.createHmac('sha512', this.webhookSecret);
      hmac.update(payload);
      const calculatedSignature = hmac.digest('hex');
      return calculatedSignature === signature;
    } catch (error) {
      console.error('Webhook signature verification error:', error);
      return false;
    }
  }

  // Process webhook
  processWebhook(webhookData) {
    try {
      const {
        obj: transaction,
        type: eventType,
      } = webhookData;

      return {
        eventType,
        transactionId: transaction.id,
        orderId: transaction.order?.id,
        success: transaction.success,
        pending: transaction.pending,
        amount: transaction.amount_cents / 100, // Convert from cents
        currency: transaction.currency,
        paymentMethod: transaction.source_data?.type || 'unknown',
        responseCode: transaction.txn_response_code,
        message: transaction.data?.message || '',
        createdAt: transaction.created_at,
      };
    } catch (error) {
      console.error('Webhook processing error:', error);
      throw error;
    }
  }

  // Get transaction status
  async getTransactionStatus(transactionId) {
    try {
      console.log('🔍 Getting transaction status for:', transactionId);
      
      if (!this.authToken) {
        await this.authenticate();
      }

      const response = await fetch(`${this.baseURL}/acceptance/transactions/${transactionId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      console.log('📡 Transaction status response:', JSON.stringify(data, null, 2));
      
      return {
        success: data.success || false,
        pending: data.pending || false,
        amount: data.amount_cents ? data.amount_cents / 100 : 0,
        currency: data.currency || 'EGP',
        paymentMethod: data.source_data?.type || 'unknown',
        responseCode: data.txn_response_code,
        message: data.data?.message || '',
        createdAt: data.created_at
      };
    } catch (error) {
      console.error('💥 Get transaction status error:', error.message);
      throw error;
    }
  }

  // Refund transaction
  async refundTransaction(orderId, amount) {
    try {
      console.log('💰 Requesting refund for order:', orderId, 'amount:', amount);
      
      if (!this.authToken) {
        await this.authenticate();
      }

      const refundPayload = {
        auth_token: this.authToken,
        transaction_id: orderId,
        amount_cents: Math.round(amount * 100)
      };
      
      console.log('📤 Refund payload:', JSON.stringify(refundPayload, null, 2));

      const response = await fetch(`${this.baseURL}/acceptance/void_refund/refund`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(refundPayload),
      });

      const data = await response.json();
      console.log('📡 Refund response:', JSON.stringify(data, null, 2));
      
      if (data.id) {
        console.log('✅ Refund requested successfully:', data.id);
        return {
          success: true,
          refundId: data.id,
          message: 'Refund requested successfully'
        };
      }
      
      console.error('❌ Failed to request refund');
      return {
        success: false,
        message: data.detail || 'Failed to request refund'
      };
    } catch (error) {
      console.error('💥 Refund transaction error:', error.message);
      return {
        success: false,
        message: error.message || 'Refund request failed'
      };
    }
  }

  // Generate mobile wallet payment URL
  generateMobileWalletUrl(paymentKey, mobileNumber, walletProvider = 'vodafone_cash') {
    // Mobile wallet providers mapping
    const providers = {
      'vodafone_cash': 2,
      'orange_cash': 3,
      'etisalat_cash': 4
    };
    
    const integrationId = providers[walletProvider] || 2; // Default to Vodafone Cash
    
    return `https://accept.paymob.com/api/acceptance/iframes/${this.iframeId}?payment_token=${paymentKey}&integration_id=${integrationId}&mobile_number=${mobileNumber}`;
  }

  // Validate payment method data
  validatePaymentMethod(paymentMethod, requestData) {
    switch (paymentMethod) {
      case 'mobile_wallet':
        if (!requestData.mobileNumber) {
          throw new Error('Mobile number is required for mobile wallet payments');
        }
        if (!/^01[0125][0-9]{8}$/.test(requestData.mobileNumber)) {
          throw new Error('Invalid Egyptian mobile number format');
        }
        break;
        
      case 'card':
        if (!requestData.holderName) {
          throw new Error('Cardholder name is required for card payments');
        }
        break;
        
      case 'bank_transfer':
        // No additional validation required for bank transfers
        break;
        
      default:
        throw new Error(`Unsupported payment method: ${paymentMethod}`);
    }
  }

  // Initiate mobile wallet payment
  async initiateMobileWalletPayment(paymentKey, mobileNumber) {
    try {
      console.log('📱 Initiating mobile wallet payment...');
      
      // For mobile wallet, we can use the iframe but with wallet-specific parameters
      // Or initiate wallet payment via API if needed
      
      // For now, return the iframe URL as Paymob handles wallet selection in the iframe
      return {
        success: true,
        redirectUrl: `https://accept.paymob.com/api/acceptance/iframes/${this.iframeId}?payment_token=${paymentKey}`,
        message: 'Mobile wallet payment initiated'
      };
    } catch (error) {
      console.error('Mobile wallet payment initiation error:', error);
      return {
        success: false,
        redirectUrl: `https://accept.paymob.com/api/acceptance/iframes/${this.iframeId}?payment_token=${paymentKey}`,
        message: 'Fallback to iframe'
      };
    }
  }

  // Generate iframe URL
  getIframeUrl(paymentKey) {
    return `https://accept.paymob.com/api/acceptance/iframes/${this.iframeId}?payment_token=${paymentKey}`;
  }
  
  // Test Paymob connection
  async testConnection() {
    try {
      console.log('🗜️ Testing Paymob connection...');
      const token = await this.authenticate();
      console.log('✅ Paymob connection test successful');
      return { success: true, token: token.substring(0, 20) + '...' };
    } catch (error) {
      console.error('❌ Paymob connection test failed:', error.message);
      return { success: false, error: error.message };
    }
  }

}

export default PaymobService;
