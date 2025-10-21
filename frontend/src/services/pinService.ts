import axios from 'axios';

const API_BASE_URL =  'http://localhost:8080';

// Create axios instance with default config
const api = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Types
export interface PinVerificationRequest {
  pin: string;
  serviceId?: string;
  productId?: string;
  shopId?: string;
  originalAmount: number;
  offerId?: string;
  customerName?: string;
  receiptNumber?: string;
  verificationLocation?: string;
}

export interface PinVerificationResult {
  success: boolean;
  verification: {
    code: string;
    planOwner: {
      name: string;
      email: string;
    };
    planType: string;
    originalAmount: number;
    discountAmount: number;
    finalAmount: number;
    discountPercent: number;
    offerUsed: string;
    verificationLocation?: string;
    verifiedAt: string;
  };
}

export interface PinValidationResult {
  success: boolean;
  message?: string;
  error?: string;
  planOwner?: {
    name: string;
    email: string;
  };
  planType?: string;
  pinUsageCount?: number;
  includesDiscounts?: boolean;
}

export interface PinUsageHistory {
  id: string;
  verificationCode: string;
  originalAmount: number;
  discountAmount: number;
  finalAmount: number;
  discountPercent: number;
  currency: string;
  verificationLocation?: string;
  customerName?: string;
  receiptNumber?: string;
  verifiedAt: string;
  status: string;
  monthYear: string;
  service?: {
    id: string;
    embeddingText: string;
  };
  product?: {
    id: string;
    name: string;
  };
  shop?: {
    id: string;
    name: string;
  };
  offer?: {
    id: string;
    title: string;
    level: string;
  };
}

export interface PinUsageStats {
  totalUsages: number;
  thisMonthUsages: number;
  totalSavingsThisMonth: number;
  averageDiscount: number;
  topUsedOffers: Array<{
    title: string;
    count: number;
  }>;
  lastUsed?: string;
}

export interface VerificationDetails {
  id: string;
  verificationCode: string;
  originalAmount: number;
  discountAmount: number;
  finalAmount: number;
  discountPercent: number;
  currency: string;
  verificationLocation?: string;
  customerName?: string;
  receiptNumber?: string;
  verifiedAt: string;
  status: string;
  monthYear: string;
  planOwner?: {
    name: string;
    email: string;
  };
  service?: {
    name: string;
  };
  product?: {
    id: string;
    name: string;
  };
  shop?: {
    id: string;
    name: string;
  };
  offer?: {
    id: string;
    title: string;
    description: string;
  };
}

// PIN Verification Services
export class PinVerificationService {
  // Verify PIN and apply discount (for providers)
  static async verifyPin(data: PinVerificationRequest): Promise<PinVerificationResult> {
    const response = await api.post('/pin-verification/verify', data);
    return response.data;
  }

  // Validate PIN without applying discount (preview)
  static async validatePin(pin: string): Promise<PinValidationResult> {
    const response = await api.post('/pin-verification/validate', { pin });
    return response.data;
  }

  // Get verification details by code
  static async getVerificationByCode(code: string): Promise<VerificationDetails> {
    const response = await api.get(`/pin-verification/verification/${code}`);
    return response.data;
  }

  // Get PIN usage history for user
  static async getPinUsageHistory(limit: number = 20): Promise<PinUsageHistory[]> {
    const response = await api.get(`/pin-verification/history?limit=${limit}`);
    return response.data;
  }

  // Get PIN usage statistics for user
  static async getPinUsageStats(): Promise<PinUsageStats> {
    const response = await api.get('/pin-verification/stats');
    return response.data;
  }

  // Get provider history (for providers only)
  static async getProviderHistory(limit: number = 20): Promise<PinUsageHistory[]> {
    const response = await api.get(`/pin-verification/provider-history?limit=${limit}`);
    return response.data;
  }

  // Confirm PIN usage and apply discount
  static async confirmPinUsage(data: {
    pinCode: string;
    originalAmount: number;
    discountAmount: number;
    finalAmount: number;
  }): Promise<{ success: boolean; message: string }> {
    const response = await api.post('/pin-verification/confirm', data);
    return response.data;
  }
}

// Offer types and services
export interface Offer {
  id: string;
  title: string;
  description: string;
  shortDescription?: string;
  level: 'BASIC' | 'STANDARD' | 'PREMIUM' | 'EXCLUSIVE';
  targetType: 'SERVICE' | 'PRODUCT' | 'BOTH';
  discountType: 'PERCENTAGE' | 'FIXED_AMOUNT';
  discountValue: number;
  maxDiscountAmount?: number;
  minPurchaseAmount?: number;
  minPrice?: number;
  maxPrice?: number;
  validFrom: string;
  validUntil?: string;
  validDays?: string;
  validTimeFrom?: string;
  validTimeTo?: string;
  maxTotalUsage?: number;
  currentUsage: number;
  maxUsagePerUser?: number;
  maxUsagePerDay?: number;
  maxUsagePerMonth?: number;
  maxUsagePerYear?: number;
  isActive: boolean;
  isExclusive: boolean;
  requiresPlan: boolean;
  imageUrl?: string;
  backgroundColor?: string;
  textColor?: string;
  viewCount: number;
  clickCount: number;
  conversionCount: number;
  provider: {
    id: string;
    name: string;
    email: string;
  };
  shop?: {
    id: string;
    name: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface CreateOfferData {
  title: string;
  description: string;
  shortDescription?: string;
  level: 'BASIC' | 'STANDARD' | 'PREMIUM' | 'EXCLUSIVE';
  targetType: 'SERVICE' | 'PRODUCT' | 'BOTH';
  discountType: 'PERCENTAGE' | 'FIXED_AMOUNT';
  discountValue: number;
  maxDiscountAmount?: number;
  minPurchaseAmount?: number;
  minPrice?: number;
  maxPrice?: number;
  validFrom: string;
  validUntil?: string;
  validDays?: string[];
  validTimeFrom?: string;
  validTimeTo?: string;
  maxTotalUsage?: number;
  maxUsagePerUser?: number;
  maxUsagePerDay?: number;
  maxUsagePerMonth?: number;
  maxUsagePerYear?: number;
  isExclusive?: boolean;
  requiresPlan?: boolean;
  services?: string[];
  products?: string[];
  categories?: string[];
  shopId?: string;
  imageUrl?: string;
  backgroundColor?: string;
  textColor?: string;
}

export interface OfferUsage {
  id: string;
  originalAmount: number;
  discountAmount: number;
  finalAmount: number;
  usedAt: string;
  service?: {
    id: string;
    embeddingText: string;
  };
  product?: {
    id: string;
    name: string;
  };
  user: {
    id: string;
    name: string;
    email: string;
  };
}

// Offer Services
export class OfferService {
  // Get available offers for user
  static async getAvailableOffers(filters?: {
    level?: string;
    targetType?: string;
    categoryId?: string;
    serviceId?: string;
    productId?: string;
  }): Promise<Offer[]> {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value);
      });
    }
    
    const response = await api.get(`/offers?${params.toString()}`);
    return response.data;
  }

  // Create new offer (for providers)
  static async createOffer(offerData: CreateOfferData): Promise<{ success: boolean; message: string; offer: Offer }> {
    const response = await api.post('/offers', offerData);
    return response.data;
  }

  // Get provider's offers
  static async getMyOffers(): Promise<Offer[]> {
    const response = await api.get('/offers/my-offers');
    return response.data;
  }

  // Update offer
  static async updateOffer(offerId: string, offerData: Partial<CreateOfferData>): Promise<{ success: boolean; message: string; offer: Offer }> {
    const response = await api.patch(`/offers/${offerId}`, offerData);
    return response.data;
  }

  // Delete offer
  static async deleteOffer(offerId: string): Promise<{ success: boolean; message: string }> {
    const response = await api.delete(`/offers/${offerId}`);
    return response.data;
  }

  // Get offer details
  static async getOfferDetails(offerId: string): Promise<Offer> {
    const response = await api.get(`/offers/${offerId}`);
    return response.data;
  }

  // Get offer usage history
  static async getOfferUsage(offerId: string): Promise<OfferUsage[]> {
    const response = await api.get(`/offers/${offerId}/usage`);
    return response.data;
  }

  // Track offer view
  static async trackOfferView(offerId: string): Promise<void> {
    await api.post(`/offers/${offerId}/view`);
  }

  // Track offer click
  static async trackOfferClick(offerId: string): Promise<void> {
    await api.post(`/offers/${offerId}/click`);
  }
}

// Named export for compatibility
export const PinService = PinVerificationService;

export default PinVerificationService;
