import axios from 'axios';

const API_BASE_URL =   'https://api.daleelbalady.com/api';

// Create axios instance with default config
const paymentsAPI = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth interceptor
paymentsAPI.interceptors.request.use((config) => {
  const token = localStorage.getItem('daleel-token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor for error handling
paymentsAPI.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

export interface PaymentInitializationRequest {
  amount: number;
  currency: string;
  planType: 'PROVIDER' | 'USER';
  planId: string;
  paymentMethod: 'card' | 'mobile_wallet' | 'bank_transfer';
  cardData?: {
    number: string;
    expiry: string;
    cvv: string;
    holderName: string;
  };
  mobileNumber?: string;
  discountCode?: string;
}

export interface PaymentInitializationResponse {
  success: boolean;
  transactionId: string;
  redirectUrl?: string;
  iframeUrl?: string;
  message?: string;
}

export interface PaymentRecord {
  id: string;
  transactionId: string;
  amount: number;
  currency: string;
  status: 'SUCCESS' | 'FAILED' | 'PENDING' | 'REFUNDED';
  paymentMethod: string;
  planName: string;
  planNameAr: string;
  planType: 'PROVIDER' | 'USER';
  date: string;
  period: string;
  description?: string;
  receipt?: string;
}

export interface Subscription {
  id: string;
  planType: 'PROVIDER' | 'USER';
  planName: string;
  planNameAr: string;
  status: 'ACTIVE' | 'EXPIRED' | 'CANCELLED';
  startDate: string;
  endDate: string;
  autoRenew: boolean;
  amount: number;
  currency: string;
  nextPaymentDate?: string;
  features: string[];
  featuresAr: string[];
  fieldRepDiscount?: number;
  matchingDiscount?: number;
  totalDiscount: number;
}

export interface PaymentMethod {
  id: string;
  type: 'CARD' | 'WALLET' | 'BANK_TRANSFER';
  last4?: string;
  brand?: string;
  expiryMonth?: number;
  expiryYear?: number;
  holderName?: string;
  walletProvider?: string;
  isDefault: boolean;
}

export interface CouponValidationResponse {
  valid: boolean;
  discountPercent: number;
  discountAmount: number;
  description: string;
  descriptionAr: string;
  expiresAt?: string;
  minOrderAmount?: number;
  maxUses?: number;
  usesCount: number;
}

/**
 * Payment Processing APIs
 */

// Initialize payment with Paymob
export const initializePayment = async (
  paymentData: PaymentInitializationRequest
): Promise<PaymentInitializationResponse> => {
  try {
    const response = await paymentsAPI.post('/payments/initialize', paymentData);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to initialize payment');
  }
};

// Confirm payment after successful processing
export const confirmPayment = async (transactionId: string) => {
  try {
    const response = await paymentsAPI.post(`/payments/confirm/${transactionId}`);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to confirm payment');
  }
};

// Get payment status
export const getPaymentStatus = async (transactionId: string) => {
  try {
    const response = await paymentsAPI.get(`/payments/status/${transactionId}`);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to get payment status');
  }
};

// Download payment receipt
export const downloadReceipt = async (paymentId: string): Promise<Blob> => {
  try {
    const response = await paymentsAPI.get(`/payments/receipt/${paymentId}`, {
      responseType: 'blob'
    });
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to download receipt');
  }
};

// Send confirmation email
export const sendConfirmationEmail = async (transactionId: string) => {
  try {
    const response = await paymentsAPI.post('/payments/send-confirmation', {
      transactionId
    });
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to send confirmation email');
  }
};

/**
 * Payment History APIs
 */

// Get user's payment history
export const getPaymentHistory = async (filters?: {
  status?: string;
  dateRange?: string;
  search?: string;
  page?: number;
  limit?: number;
}): Promise<{ payments: PaymentRecord[]; total: number }> => {
  try {
    const response = await paymentsAPI.get('/payments/history', {
      params: filters
    });
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to get payment history');
  }
};

/**
 * Subscription Management APIs
 */

// Get user's subscriptions
export const getSubscriptions = async (): Promise<Subscription[]> => {
  try {
    const response = await paymentsAPI.get('/subscriptions');
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to get subscriptions');
  }
};

// Get subscription details
export const getSubscriptionDetails = async (subscriptionId: string): Promise<Subscription> => {
  try {
    const response = await paymentsAPI.get(`/subscriptions/${subscriptionId}`);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to get subscription details');
  }
};

// Cancel subscription
export const cancelSubscription = async (subscriptionId: string) => {
  try {
    const response = await paymentsAPI.post(`/subscriptions/${subscriptionId}/cancel`);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to cancel subscription');
  }
};

// Update subscription auto-renewal
export const updateSubscriptionAutoRenew = async (
  subscriptionId: string,
  autoRenew: boolean
) => {
  try {
    const response = await paymentsAPI.patch(`/subscriptions/${subscriptionId}/auto-renew`, {
      autoRenew
    });
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to update auto-renewal');
  }
};

// Apply discount to subscription
export const applySubscriptionDiscount = async (
  subscriptionId: string,
  discountData: {
    type: 'FIELD_REPRESENTATIVE' | 'MATCHING_DISCOUNT' | 'CUSTOM';
    percentage: number;
    description?: string;
  }
) => {
  try {
    const response = await paymentsAPI.post(`/subscriptions/${subscriptionId}/discount`, discountData);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to apply discount');
  }
};

/**
 * Payment Methods APIs
 */

// Get saved payment methods
export const getPaymentMethods = async (): Promise<PaymentMethod[]> => {
  try {
    const response = await paymentsAPI.get('/payments/methods');
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to get payment methods');
  }
};

// Add new payment method
export const addPaymentMethod = async (methodData: {
  type: 'CARD' | 'WALLET';
  cardData?: {
    number: string;
    expiry: string;
    cvv: string;
    holderName: string;
  };
  walletProvider?: string;
  isDefault?: boolean;
}): Promise<PaymentMethod> => {
  try {
    const response = await paymentsAPI.post('/payments/methods', methodData);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to add payment method');
  }
};

// Update payment method
export const updatePaymentMethod = async (
  methodId: string,
  updates: {
    isDefault?: boolean;
    holderName?: string;
  }
): Promise<PaymentMethod> => {
  try {
    const response = await paymentsAPI.patch(`/payments/methods/${methodId}`, updates);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to update payment method');
  }
};

// Delete payment method
export const deletePaymentMethod = async (methodId: string) => {
  try {
    const response = await paymentsAPI.delete(`/payments/methods/${methodId}`);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to delete payment method');
  }
};

/**
 * Coupon & Discount APIs
 */

// Validate coupon code
export const validateCoupon = async (
  code: string,
  planId: string,
  planType: 'PROVIDER' | 'USER'
): Promise<CouponValidationResponse> => {
  try {
    const response = await paymentsAPI.post('/coupons/validate', {
      code,
      planId,
      planType
    });
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Invalid coupon code');
  }
};

// Apply coupon to order
export const applyCoupon = async (
  code: string,
  amount: number,
  planId: string
) => {
  try {
    const response = await paymentsAPI.post('/coupons/apply', {
      code,
      amount,
      planId
    });
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to apply coupon');
  }
};

/**
 * Analytics & Reporting APIs
 */

// Get payment analytics for providers
export const getPaymentAnalytics = async (dateRange?: string) => {
  try {
    const response = await paymentsAPI.get('/payments/analytics', {
      params: { dateRange }
    });
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to get payment analytics');
  }
};

// Get earnings summary for providers
export const getEarningsSummary = async (period?: string) => {
  try {
    const response = await paymentsAPI.get('/payments/earnings', {
      params: { period }
    });
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to get earnings summary');
  }
};

/**
 * Paymob Integration Utilities
 */

// Get Paymob iframe URL
export const getPaymobIframeUrl = async (transactionId: string) => {
  try {
    const response = await paymentsAPI.get(`/payments/paymob/iframe/${transactionId}`);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to get Paymob iframe URL');
  }
};

// Handle Paymob webhook callback
export const handlePaymobCallback = async (callbackData: any) => {
  try {
    const response = await paymentsAPI.post('/payments/paymob/callback', callbackData);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to process Paymob callback');
  }
};

/**
 * Invoice & Receipt APIs
 */

// Generate invoice for subscription
export const generateInvoice = async (subscriptionId: string) => {
  try {
    const response = await paymentsAPI.post(`/subscriptions/${subscriptionId}/invoice`);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to generate invoice');
  }
};

// Download invoice
export const downloadInvoice = async (invoiceId: string): Promise<Blob> => {
  try {
    const response = await paymentsAPI.get(`/invoices/${invoiceId}/download`, {
      responseType: 'blob'
    });
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to download invoice');
  }
};

/**
 * Refund APIs
 */

// Request refund
export const requestRefund = async (
  paymentId: string,
  reason: string,
  amount?: number
) => {
  try {
    const response = await paymentsAPI.post(`/payments/${paymentId}/refund`, {
      reason,
      amount
    });
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to request refund');
  }
};

// Get refund status
export const getRefundStatus = async (refundId: string) => {
  try {
    const response = await paymentsAPI.get(`/refunds/${refundId}`);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to get refund status');
  }
};

/**
 * Utility Functions
 */

// Format amount for display
export const formatAmount = (amount: number, currency: string = 'EGP'): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
};

// Calculate discount amount
export const calculateDiscountAmount = (
  baseAmount: number,
  discountPercent: number
): number => {
  return (baseAmount * discountPercent) / 100;
};

// Calculate final amount after discount
export const calculateFinalAmount = (
  baseAmount: number,
  discountPercent: number
): number => {
  const discountAmount = calculateDiscountAmount(baseAmount, discountPercent);
  return Math.max(0, baseAmount - discountAmount);
};

// Validate payment card number using Luhn algorithm
export const validateCardNumber = (cardNumber: string): boolean => {
  const num = cardNumber.replace(/\s/g, '');
  if (!/^\d{13,19}$/.test(num)) return false;
  
  let sum = 0;
  let alternate = false;
  
  for (let i = num.length - 1; i >= 0; i--) {
    let digit = parseInt(num[i]);
    
    if (alternate) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }
    
    sum += digit;
    alternate = !alternate;
  }
  
  return sum % 10 === 0;
};

// Get card brand from number
export const getCardBrand = (cardNumber: string): string => {
  const num = cardNumber.replace(/\s/g, '');
  
  if (/^4/.test(num)) return 'Visa';
  if (/^5[1-5]/.test(num)) return 'MasterCard';
  if (/^3[47]/.test(num)) return 'American Express';
  if (/^6/.test(num)) return 'Discover';
  
  return 'Unknown';
};

// Validate expiry date
export const validateExpiryDate = (expiry: string): boolean => {
  const match = expiry.match(/^(\d{2})\/(\d{2})$/);
  if (!match) return false;
  
  const [, month, year] = match;
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear() % 100;
  const currentMonth = currentDate.getMonth() + 1;
  
  const expiryMonth = parseInt(month);
  const expiryYear = parseInt(year);
  
  if (expiryMonth < 1 || expiryMonth > 12) return false;
  if (expiryYear < currentYear) return false;
  if (expiryYear === currentYear && expiryMonth < currentMonth) return false;
  
  return true;
};

// Validate Egyptian mobile number
export const validateEgyptianMobile = (mobile: string): boolean => {
  return /^01[0125][0-9]{8}$/.test(mobile);
};

const paymentsExports = {
  // Payment Processing
  initializePayment,
  confirmPayment,
  getPaymentStatus,
  downloadReceipt,
  sendConfirmationEmail,
  
  // Payment History
  getPaymentHistory,
  
  // Subscriptions
  getSubscriptions,
  getSubscriptionDetails,
  cancelSubscription,
  updateSubscriptionAutoRenew,
  applySubscriptionDiscount,
  
  // Payment Methods
  getPaymentMethods,
  addPaymentMethod,
  updatePaymentMethod,
  deletePaymentMethod,
  
  // Coupons
  validateCoupon,
  applyCoupon,
  
  // Analytics
  getPaymentAnalytics,
  getEarningsSummary,
  
  // Paymob
  getPaymobIframeUrl,
  handlePaymobCallback,
  
  // Invoices
  generateInvoice,
  downloadInvoice,
  
  // Refunds
  requestRefund,
  getRefundStatus,
  
  // Utilities
  formatAmount,
  calculateDiscountAmount,
  calculateFinalAmount,
  validateCardNumber,
  getCardBrand,
  validateExpiryDate,
  validateEgyptianMobile,
};

export default paymentsExports;
