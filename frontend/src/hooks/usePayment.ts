import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  validateCardNumber, 
  validateExpiryDate, 
  validateEgyptianMobile,
  getCardBrand,
  initializePayment,
  getPaymentStatus,
  type PaymentInitializationRequest,
  type PaymentInitializationResponse
} from '@/api/payments';

// Payment form validation hook
export const usePaymentValidation = () => {
  const { i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateField = useCallback((field: string, value: string): string | null => {
    switch (field) {
      case 'cardNumber':
        if (!value) {
          return isRTL ? 'رقم البطاقة مطلوب' : 'Card number is required';
        }
        if (!validateCardNumber(value.replace(/\s/g, ''))) {
          return isRTL ? 'رقم البطاقة غير صحيح' : 'Invalid card number';
        }
        return null;

      case 'expiry':
        if (!value) {
          return isRTL ? 'تاريخ انتهاء الصلاحية مطلوب' : 'Expiry date is required';
        }
        if (!validateExpiryDate(value)) {
          return isRTL ? 'تاريخ انتهاء الصلاحية غير صحيح' : 'Invalid expiry date';
        }
        return null;

      case 'cvv':
        if (!value) {
          return isRTL ? 'رمز الحماية مطلوب' : 'CVV is required';
        }
        if (!/^\d{3,4}$/.test(value)) {
          return isRTL ? 'رمز الحماية غير صحيح' : 'Invalid CVV';
        }
        return null;

      case 'holderName':
        if (!value) {
          return isRTL ? 'اسم حامل البطاقة مطلوب' : 'Cardholder name is required';
        }
        if (value.length < 2) {
          return isRTL ? 'اسم حامل البطاقة قصير جداً' : 'Cardholder name too short';
        }
        return null;

      case 'mobileNumber':
        if (!value) {
          return isRTL ? 'رقم الهاتف مطلوب' : 'Mobile number is required';
        }
        if (!validateEgyptianMobile(value)) {
          return isRTL ? 'رقم الهاتف المصري غير صحيح' : 'Invalid Egyptian mobile number';
        }
        return null;

      case 'email':
        if (!value) {
          return isRTL ? 'البريد الإلكتروني مطلوب' : 'Email is required';
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          return isRTL ? 'البريد الإلكتروني غير صحيح' : 'Invalid email address';
        }
        return null;

      default:
        return null;
    }
  }, [isRTL]);

  const setFieldError = useCallback((field: string, error: string | null) => {
    setErrors(prev => ({
      ...prev,
      [field]: error || undefined
    }));
  }, []);

  const validateForm = useCallback((formData: Record<string, string>): boolean => {
    const newErrors: Record<string, string> = {};
    let isValid = true;

    Object.entries(formData).forEach(([field, value]) => {
      const error = validateField(field, value);
      if (error) {
        newErrors[field] = error;
        isValid = false;
      }
    });

    setErrors(newErrors);
    return isValid;
  }, [validateField]);

  const clearErrors = useCallback(() => {
    setErrors({});
  }, []);

  const clearFieldError = useCallback((field: string) => {
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[field];
      return newErrors;
    });
  }, []);

  return {
    errors,
    validateField,
    setFieldError,
    validateForm,
    clearErrors,
    clearFieldError
  };
};

// Payment processing state hook
export const usePaymentProcessing = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'processing' | 'success' | 'failed'>('idle');
  const [transactionId, setTransactionId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const processPayment = useCallback(async (
    paymentData: PaymentInitializationRequest,
    callbacks?: {
      onSuccess?: (transactionId: string) => void;
      onFailure?: (error: string) => void;
      onStatusUpdate?: (status: string) => void;
    }
  ): Promise<PaymentInitializationResponse | null> => {
    setIsProcessing(true);
    setPaymentStatus('processing');
    setError(null);
    callbacks?.onStatusUpdate?.('processing');

    try {
      const response = await initializePayment(paymentData);
      
      if (response.success) {
        setTransactionId(response.transactionId);
        setPaymentStatus('success');
        callbacks?.onSuccess?.(response.transactionId);
        callbacks?.onStatusUpdate?.('success');
        return response;
      } else {
        throw new Error(response.message || 'Payment failed');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Payment processing failed';
      setError(errorMessage);
      setPaymentStatus('failed');
      callbacks?.onFailure?.(errorMessage);
      callbacks?.onStatusUpdate?.('failed');
      return null;
    } finally {
      setIsProcessing(false);
    }
  }, []);

  const checkPaymentStatus = useCallback(async (txnId: string) => {
    if (!txnId) return null;

    try {
      const status = await getPaymentStatus(txnId);
      setPaymentStatus(status.status === 'SUCCESS' ? 'success' : 'failed');
      return status;
    } catch (err) {
      console.error('Failed to check payment status:', err);
      return null;
    }
  }, []);

  const resetPaymentState = useCallback(() => {
    setIsProcessing(false);
    setPaymentStatus('idle');
    setTransactionId(null);
    setError(null);
  }, []);

  return {
    isProcessing,
    paymentStatus,
    transactionId,
    error,
    processPayment,
    checkPaymentStatus,
    resetPaymentState
  };
};

// Card input formatting hook
export const useCardFormatting = () => {
  const formatCardNumber = useCallback((value: string): string => {
    // Remove all non-numeric characters
    const numericValue = value.replace(/\D/g, '');
    
    // Format with spaces every 4 digits
    const formatted = numericValue.replace(/(\d{4})(?=\d)/g, '$1 ');
    
    // Limit to 19 characters (16 digits + 3 spaces)
    return formatted.substring(0, 19);
  }, []);

  const formatExpiry = useCallback((value: string): string => {
    // Remove all non-numeric characters
    const numericValue = value.replace(/\D/g, '');
    
    // Add slash after 2 digits
    if (numericValue.length >= 2) {
      return `${numericValue.substring(0, 2)}/${numericValue.substring(2, 4)}`;
    }
    
    return numericValue;
  }, []);

  const formatCVV = useCallback((value: string): string => {
    // Only allow numeric characters, max 4 digits
    return value.replace(/\D/g, '').substring(0, 4);
  }, []);

  const formatMobileNumber = useCallback((value: string): string => {
    // Only allow numeric characters, max 11 digits for Egyptian numbers
    const numericValue = value.replace(/\D/g, '');
    return numericValue.substring(0, 11);
  }, []);

  const getCardBrandFromNumber = useCallback((cardNumber: string): string => {
    return getCardBrand(cardNumber.replace(/\s/g, ''));
  }, []);

  return {
    formatCardNumber,
    formatExpiry,
    formatCVV,
    formatMobileNumber,
    getCardBrandFromNumber
  };
};

// Subscription status hook
export const useSubscriptionStatus = () => {
  const [subscriptions, setSubscriptions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSubscriptions = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // This would call the actual API
      // const subs = await getSubscriptions();
      // setSubscriptions(subs);
      
      // For now, use mock data
      setSubscriptions([]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch subscriptions');
    } finally {
      setLoading(false);
    }
  }, []);

  const getActiveSubscription = useCallback(() => {
    return subscriptions.find(sub => sub.status === 'ACTIVE');
  }, [subscriptions]);

  const hasActiveSubscription = useCallback((planType?: 'PROVIDER' | 'USER') => {
    return subscriptions.some(sub => 
      sub.status === 'ACTIVE' && 
      (!planType || sub.planType === planType)
    );
  }, [subscriptions]);

  const getSubscriptionByType = useCallback((planType: 'PROVIDER' | 'USER') => {
    return subscriptions.find(sub => sub.planType === planType);
  }, [subscriptions]);

  useEffect(() => {
    fetchSubscriptions();
  }, [fetchSubscriptions]);

  return {
    subscriptions,
    loading,
    error,
    fetchSubscriptions,
    getActiveSubscription,
    hasActiveSubscription,
    getSubscriptionByType
  };
};

// Payment form state hook
export const usePaymentForm = () => {
  const [formData, setFormData] = useState({
    cardNumber: '',
    expiry: '',
    cvv: '',
    holderName: '',
    mobileNumber: '',
    email: ''
  });

  const { formatCardNumber, formatExpiry, formatCVV, formatMobileNumber } = useCardFormatting();
  const { validateForm, errors } = usePaymentValidation();

  const updateField = useCallback((field: string, value: string) => {
    let formattedValue = value;

    switch (field) {
      case 'cardNumber':
        formattedValue = formatCardNumber(value);
        break;
      case 'expiry':
        formattedValue = formatExpiry(value);
        break;
      case 'cvv':
        formattedValue = formatCVV(value);
        break;
      case 'mobileNumber':
        formattedValue = formatMobileNumber(value);
        break;
      default:
        formattedValue = value;
    }

    setFormData(prev => ({
      ...prev,
      [field]: formattedValue
    }));
  }, [formatCardNumber, formatExpiry, formatCVV, formatMobileNumber]);

  const resetForm = useCallback(() => {
    setFormData({
      cardNumber: '',
      expiry: '',
      cvv: '',
      holderName: '',
      mobileNumber: '',
      email: ''
    });
  }, []);

  const isFormValid = useCallback(() => {
    return validateForm(formData);
  }, [formData, validateForm]);

  return {
    formData,
    errors,
    updateField,
    resetForm,
    isFormValid
  };
};

// Discount calculation hook
export const useDiscountCalculation = () => {
  const calculateDiscount = useCallback((
    baseAmount: number,
    discounts: { type: string; percentage: number }[]
  ) => {
    let totalDiscount = 0;
    let appliedDiscounts: { type: string; percentage: number; amount: number }[] = [];

    discounts.forEach(discount => {
      const discountAmount = (baseAmount * discount.percentage) / 100;
      totalDiscount += discount.percentage;
      appliedDiscounts.push({
        ...discount,
        amount: discountAmount
      });
    });

    // Cap at 100%
    totalDiscount = Math.min(totalDiscount, 100);
    const finalDiscountAmount = (baseAmount * totalDiscount) / 100;
    const finalAmount = Math.max(0, baseAmount - finalDiscountAmount);

    return {
      baseAmount,
      totalDiscountPercentage: totalDiscount,
      totalDiscountAmount: finalDiscountAmount,
      finalAmount,
      appliedDiscounts
    };
  }, []);

  return { calculateDiscount };
};

const paymentHooksExports = {
  usePaymentValidation,
  usePaymentProcessing,
  useCardFormatting,
  useSubscriptionStatus,
  usePaymentForm,
  useDiscountCalculation
};

export default paymentHooksExports;
