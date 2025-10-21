import crypto from 'crypto';
import { PrismaClient } from '../generated/prisma/client.js';
import axios from 'axios';

const prisma = new PrismaClient();

/**
 * Advanced Payment System with Enhanced Security
 */

/**
 * Payment Providers Configuration
 */
const PAYMENT_PROVIDERS = {
  PAYPAL: {
    name: 'PayPal',
    apiUrl: process.env.PAYPAL_API_URL,
    clientId: process.env.PAYPAL_CLIENT_ID,
    clientSecret: process.env.PAYPAL_CLIENT_SECRET,
    sandbox: process.env.NODE_ENV !== 'production'
  },
  STRIPE: {
    name: 'Stripe',
    apiUrl: 'https://api.stripe.com/v1',
    secretKey: process.env.STRIPE_SECRET_KEY,
    publishableKey: process.env.STRIPE_PUBLISHABLE_KEY,
    webhookSecret: process.env.STRIPE_WEBHOOK_SECRET
  },
  FAWRY: {
    name: 'Fawry',
    apiUrl: process.env.FAWRY_API_URL,
    merchantId: process.env.FAWRY_MERCHANT_ID,
    securityKey: process.env.FAWRY_SECURITY_KEY,
    sandbox: process.env.NODE_ENV !== 'production'
  },
  PAYMOB: {
    name: 'PayMob',
    apiUrl: process.env.PAYMOB_API_URL,
    apiKey: process.env.PAYMOB_API_KEY,
    integrationId: process.env.PAYMOB_INTEGRATION_ID,
    hmacSecret: process.env.PAYMOB_HMAC_SECRET
  }
};

/**
 * Encrypt Sensitive Payment Data
 */
export const encryptPaymentData = (data) => {
  const algorithm = 'aes-256-gcm';
  const key = Buffer.from(process.env.PAYMENT_ENCRYPTION_KEY, 'hex');
  const iv = crypto.randomBytes(16);
  
  const cipher = crypto.createCipher(algorithm, key);
  cipher.setAAD(Buffer.from('payment-data'));
  
  let encrypted = cipher.update(JSON.stringify(data), 'utf8', 'hex');
  encrypted += cipher.final('hex');
  
  const authTag = cipher.getAuthTag();
  
  return {
    encrypted,
    iv: iv.toString('hex'),
    authTag: authTag.toString('hex')
  };
};

/**
 * Decrypt Sensitive Payment Data
 */
export const decryptPaymentData = (encryptedData) => {
  const algorithm = 'aes-256-gcm';
  const key = Buffer.from(process.env.PAYMENT_ENCRYPTION_KEY, 'hex');
  
  const decipher = crypto.createDecipher(algorithm, key);
  decipher.setAAD(Buffer.from('payment-data'));
  decipher.setAuthTag(Buffer.from(encryptedData.authTag, 'hex'));
  
  let decrypted = decipher.update(encryptedData.encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  
  return JSON.parse(decrypted);
};

/**
 * Generate Payment Reference ID
 */
export const generatePaymentRef = (prefix = 'PAY') => {
  const timestamp = Date.now().toString(36);
  const random = crypto.randomBytes(8).toString('hex').toUpperCase();
  const checksum = crypto.createHash('md5')
    .update(timestamp + random + process.env.PAYMENT_SECRET)
    .digest('hex')
    .substring(0, 4)
    .toUpperCase();
  
  return `${prefix}-${timestamp}-${random}-${checksum}`;
};

/**
 * Create Payment Intent
 */
export const createPaymentIntent = async (paymentData) => {
  const {
    amount,
    currency = 'EGP',
    userId,
    serviceId,
    provider = 'PAYMOB',
    metadata = {}
  } = paymentData;
  
  // Validate amount
  if (amount <= 0) {
    throw new Error('Amount must be greater than 0');
  }
  
  // Generate payment reference
  const paymentRef = generatePaymentRef();
  
  // Create payment record
  const payment = await prisma.payment.create({
    data: {
      paymentRef,
      userId,
      serviceId,
      amount: parseFloat(amount),
      currency,
      provider,
      status: 'PENDING',
      metadata: JSON.stringify(metadata),
      expiresAt: new Date(Date.now() + 15 * 60 * 1000) // 15 minutes
    }
  });
  
  let providerResponse;
  
  try {
    switch (provider) {
      case 'PAYMOB':
        providerResponse = await createPayMobPayment(payment);
        break;
      case 'FAWRY':
        providerResponse = await createFawryPayment(payment);
        break;
      case 'STRIPE':
        providerResponse = await createStripePayment(payment);
        break;
      case 'PAYPAL':
        providerResponse = await createPayPalPayment(payment);
        break;
      default:
        throw new Error(`Unsupported payment provider: ${provider}`);
    }
    
    // Update payment with provider data
    await prisma.payment.update({
      where: { id: payment.id },
      data: {
        providerPaymentId: providerResponse.paymentId,
        providerData: encryptPaymentData(providerResponse).encrypted,
        status: 'INITIATED'
      }
    });
    
    return {
      paymentRef,
      paymentUrl: providerResponse.paymentUrl,
      paymentId: providerResponse.paymentId,
      expiresAt: payment.expiresAt
    };
    
  } catch (error) {
    // Update payment status to failed
    await prisma.payment.update({
      where: { id: payment.id },
      data: {
        status: 'FAILED',
        errorMessage: error.message
      }
    });
    
    throw error;
  }
};

/**
 * PayMob Payment Integration
 */
const createPayMobPayment = async (payment) => {
  const config = PAYMENT_PROVIDERS.PAYMOB;
  
  // Step 1: Get authentication token
  const authResponse = await axios.post(`${config.apiUrl}/auth/tokens`, {
    api_key: config.apiKey
  });
  
  const token = authResponse.data.token;
  
  // Step 2: Create order
  const orderResponse = await axios.post(`${config.apiUrl}/ecommerce/orders`, {
    auth_token: token,
    delivery_needed: false,
    amount_cents: Math.round(payment.amount * 100),
    currency: payment.currency,
    items: [{
      name: `خدمة طبية - ${payment.serviceId}`,
      amount_cents: Math.round(payment.amount * 100),
      description: 'خدمة طبية من دليل بلدي',
      quantity: 1
    }]
  });
  
  const orderId = orderResponse.data.id;
  
  // Step 3: Create payment key
  const paymentKeyResponse = await axios.post(`${config.apiUrl}/acceptance/payment_keys`, {
    auth_token: token,
    amount_cents: Math.round(payment.amount * 100),
    expiration: 3600, // 1 hour
    order_id: orderId,
    billing_data: {
      apartment: "NA",
      email: "user@daleelbalady.com",
      floor: "NA",
      first_name: "User",
      street: "NA",
      building: "NA",
      phone_number: "+201000000000",
      shipping_method: "NA",
      postal_code: "NA",
      city: "Cairo",
      country: "EG",
      last_name: "Name",
      state: "Cairo"
    },
    currency: payment.currency,
    integration_id: config.integrationId
  });
  
  const paymentKey = paymentKeyResponse.data.token;
  const paymentUrl = `https://accept.paymob.com/api/acceptance/iframes/your_iframe_id?payment_token=${paymentKey}`;
  
  return {
    paymentId: orderId.toString(),
    paymentUrl,
    paymentKey,
    token
  };
};

/**
 * Fawry Payment Integration
 */
const createFawryPayment = async (payment) => {
  const config = PAYMENT_PROVIDERS.FAWRY;
  
  const chargeItems = [{
    itemId: payment.serviceId,
    description: `خدمة طبية - ${payment.serviceId}`,
    price: payment.amount,
    quantity: 1
  }];
  
  // Generate signature
  const signatureString = config.merchantId + payment.paymentRef + payment.amount + config.securityKey;
  const signature = crypto.createHash('sha256').update(signatureString).digest('hex');
  
  const fawryResponse = await axios.post(`${config.apiUrl}/ECommerceWeb/Fawry/payments/charge`, {
    merchantCode: config.merchantId,
    merchantRefNum: payment.paymentRef,
    customerProfileId: payment.userId,
    paymentMethod: 'PAYATFAWRY',
    amount: payment.amount,
    currencyCode: payment.currency,
    description: 'خدمة طبية من دليل بلدي',
    chargeItems,
    signature
  });
  
  return {
    paymentId: fawryResponse.data.referenceNumber,
    paymentUrl: `https://www.atfawry.com/ECommerceWeb/Fawry/payments/pay?merchantCode=${config.merchantId}&merchantRefNum=${payment.paymentRef}`,
    referenceNumber: fawryResponse.data.referenceNumber
  };
};

/**
 * Stripe Payment Integration
 */
const createStripePayment = async (payment) => {
  const config = PAYMENT_PROVIDERS.STRIPE;
  const stripe = await import('stripe');
  const stripeClient = stripe.default(config.secretKey);
  
  const paymentIntent = await stripeClient.paymentIntents.create({
    amount: Math.round(payment.amount * 100), // Convert to cents
    currency: payment.currency.toLowerCase(),
    metadata: {
      paymentRef: payment.paymentRef,
      userId: payment.userId,
      serviceId: payment.serviceId
    },
    description: 'خدمة طبية من دليل بلدي'
  });
  
  return {
    paymentId: paymentIntent.id,
    paymentUrl: `https://js.stripe.com/v3/`,
    clientSecret: paymentIntent.client_secret
  };
};

/**
 * PayPal Payment Integration
 */
const createPayPalPayment = async (payment) => {
  const config = PAYMENT_PROVIDERS.PAYPAL;
  
  // Get access token
  const auth = Buffer.from(`${config.clientId}:${config.clientSecret}`).toString('base64');
  const tokenResponse = await axios.post(`${config.apiUrl}/v1/oauth2/token`, 
    'grant_type=client_credentials', 
    {
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    }
  );
  
  const accessToken = tokenResponse.data.access_token;
  
  // Create payment
  const paymentResponse = await axios.post(`${config.apiUrl}/v1/payments/payment`, {
    intent: 'sale',
    payer: { payment_method: 'paypal' },
    transactions: [{
      amount: {
        total: payment.amount.toFixed(2),
        currency: payment.currency
      },
      description: 'خدمة طبية من دليل بلدي',
      custom: payment.paymentRef
    }],
    redirect_urls: {
      return_url: `${process.env.FRONTEND_URL}/payment/success`,
      cancel_url: `${process.env.FRONTEND_URL}/payment/cancel`
    }
  }, {
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    }
  });
  
  const approvalUrl = paymentResponse.data.links.find(link => link.rel === 'approval_url').href;
  
  return {
    paymentId: paymentResponse.data.id,
    paymentUrl: approvalUrl
  };
};

/**
 * Verify Payment Status
 */
export const verifyPaymentStatus = async (paymentRef, provider) => {
  const payment = await prisma.payment.findUnique({
    where: { paymentRef },
    include: { user: true, service: true }
  });
  
  if (!payment) {
    throw new Error('Payment not found');
  }
  
  let providerStatus;
  
  try {
    switch (provider) {
      case 'PAYMOB':
        providerStatus = await verifyPayMobPayment(payment);
        break;
      case 'FAWRY':
        providerStatus = await verifyFawryPayment(payment);
        break;
      case 'STRIPE':
        providerStatus = await verifyStripePayment(payment);
        break;
      case 'PAYPAL':
        providerStatus = await verifyPayPalPayment(payment);
        break;
      default:
        throw new Error(`Unsupported payment provider: ${provider}`);
    }
    
    // Update payment status
    await prisma.payment.update({
      where: { id: payment.id },
      data: {
        status: providerStatus.status,
        paidAt: providerStatus.paidAt,
        providerTransactionId: providerStatus.transactionId
      }
    });
    
    // If payment is successful, update service status
    if (providerStatus.status === 'COMPLETED') {
      await handleSuccessfulPayment(payment);
    }
    
    return providerStatus;
    
  } catch (error) {
    console.error('Payment verification error:', error);
    throw error;
  }
};

/**
 * Handle Successful Payment
 */
const handleSuccessfulPayment = async (payment) => {
  // Create transaction record
  await prisma.transaction.create({
    data: {
      paymentId: payment.id,
      userId: payment.userId,
      amount: payment.amount,
      currency: payment.currency,
      type: 'PAYMENT',
      status: 'COMPLETED',
      description: `Payment for service ${payment.serviceId}`
    }
  });
  
  // Update service status if applicable
  if (payment.serviceId) {
    await prisma.medicalService.update({
      where: { id: payment.serviceId },
      data: { 
        status: 'PAID',
        paidAt: new Date()
      }
    });
  }
  
  // Send payment confirmation notification
  await prisma.notification.create({
    data: {
      userId: payment.userId,
      type: 'PAYMENT',
      title: 'تأكيد الدفع',
      message: `تم استلام دفعتك بنجاح بقيمة ${payment.amount} ${payment.currency}`,
      metadata: { paymentRef: payment.paymentRef }
    }
  });
  
  // Log payment success
  console.log(`✅ Payment completed: ${payment.paymentRef} - ${payment.amount} ${payment.currency}`);
};

/**
 * Refund Payment
 */
export const refundPayment = async (paymentRef, refundAmount = null, reason = '') => {
  const payment = await prisma.payment.findUnique({
    where: { paymentRef }
  });
  
  if (!payment || payment.status !== 'COMPLETED') {
    throw new Error('Payment not found or not eligible for refund');
  }
  
  const refundAmountFinal = refundAmount || payment.amount;
  
  if (refundAmountFinal > payment.amount) {
    throw new Error('Refund amount cannot exceed original payment amount');
  }
  
  // Create refund record
  const refund = await prisma.refund.create({
    data: {
      paymentId: payment.id,
      amount: refundAmountFinal,
      reason,
      status: 'PROCESSING'
    }
  });
  
  try {
    let refundResult;
    
    switch (payment.provider) {
      case 'STRIPE':
        refundResult = await processStripeRefund(payment, refundAmountFinal);
        break;
      case 'PAYPAL':
        refundResult = await processPayPalRefund(payment, refundAmountFinal);
        break;
      default:
        throw new Error(`Refunds not supported for provider: ${payment.provider}`);
    }
    
    // Update refund record
    await prisma.refund.update({
      where: { id: refund.id },
      data: {
        status: 'COMPLETED',
        providerRefundId: refundResult.refundId,
        processedAt: new Date()
      }
    });
    
    return refundResult;
    
  } catch (error) {
    // Update refund record with error
    await prisma.refund.update({
      where: { id: refund.id },
      data: {
        status: 'FAILED',
        errorMessage: error.message
      }
    });
    
    throw error;
  }
};

/**
 * Generate Payment Report
 */
export const generatePaymentReport = async (filters = {}) => {
  const {
    startDate,
    endDate,
    provider,
    status,
    userId
  } = filters;
  
  const whereClause = {};
  
  if (startDate && endDate) {
    whereClause.createdAt = {
      gte: new Date(startDate),
      lte: new Date(endDate)
    };
  }
  
  if (provider) whereClause.provider = provider;
  if (status) whereClause.status = status;
  if (userId) whereClause.userId = userId;
  
  const payments = await prisma.payment.findMany({
    where: whereClause,
    include: {
      user: { select: { name: true, email: true } },
      refunds: true,
      transactions: true
    },
    orderBy: { createdAt: 'desc' }
  });
  
  // Calculate summary
  const summary = {
    totalPayments: payments.length,
    totalAmount: payments.reduce((sum, p) => sum + p.amount, 0),
    successfulPayments: payments.filter(p => p.status === 'COMPLETED').length,
    failedPayments: payments.filter(p => p.status === 'FAILED').length,
    pendingPayments: payments.filter(p => p.status === 'PENDING').length,
    totalRefunds: payments.reduce((sum, p) => sum + p.refunds.reduce((rs, r) => rs + r.amount, 0), 0),
    byProvider: {}
  };
  
  // Group by provider
  Object.values(PAYMENT_PROVIDERS).forEach(provider => {
    const providerPayments = payments.filter(p => p.provider === provider.name.toUpperCase());
    summary.byProvider[provider.name] = {
      count: providerPayments.length,
      amount: providerPayments.reduce((sum, p) => sum + p.amount, 0),
      successRate: providerPayments.length > 0 
        ? (providerPayments.filter(p => p.status === 'COMPLETED').length / providerPayments.length * 100).toFixed(2)
        : 0
    };
  });
  
  return {
    summary,
    payments: payments.map(p => ({
      paymentRef: p.paymentRef,
      amount: p.amount,
      currency: p.currency,
      status: p.status,
      provider: p.provider,
      user: p.user ? { name: p.user.name, email: p.user.email } : null,
      createdAt: p.createdAt,
      paidAt: p.paidAt,
      refunded: p.refunds.reduce((sum, r) => sum + r.amount, 0)
    }))
  };
};

export default {
  createPaymentIntent,
  verifyPaymentStatus,
  refundPayment,
  generatePaymentReport,
  generatePaymentRef,
  encryptPaymentData,
  decryptPaymentData
};
