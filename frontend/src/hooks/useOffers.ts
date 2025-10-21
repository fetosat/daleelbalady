import { useState, useEffect, useCallback } from 'react';

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
  validFrom: string;
  validUntil?: string;
  isActive: boolean;
  isExclusive: boolean;
  imageUrl?: string;
  backgroundColor?: string;
  textColor?: string;
  viewCount: number;
  clickCount: number;
  conversionCount: number;
  createdAt: string;
  updatedAt: string;
  
  // Relations
  shop?: {
    id: string;
    name: string;
    logoImage?: string;
    coverImage?: string;
  };
  provider?: {
    id: string;
    name: string;
    profilePic?: string;
  };
  services?: Array<{
    id: string;
    coverImage?: string;
    translation?: {
      name_ar: string;
      name_en: string;
    };
  }>;
  categories?: Array<{
    id: string;
    name: string;
    slug: string;
  }>;
}

export interface UseOffersOptions {
  categoryId?: string;
  subCategoryId?: string;
  sortBy?: 'discount' | 'date' | 'popularity';
  limit?: number;
  isActive?: boolean;
  isExclusive?: boolean;
}

export interface UseOffersResult {
  offers: Offer[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
  incrementViewCount: (offerId: string) => Promise<void>;
  incrementClickCount: (offerId: string) => Promise<void>;
}

// Use Next.js API proxy to avoid CORS issues
const API_BASE_URL = '/api';

export function useOffers(options: UseOffersOptions = {}): UseOffersResult {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const {
    categoryId,
    subCategoryId,
    sortBy = 'discount',
    limit = 12,
    isActive = true,
  } = options;

  const fetchOffers = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // Build query parameters
      const params = new URLSearchParams();
      
      if (categoryId) params.append('categoryId', categoryId);
      if (subCategoryId) params.append('subCategoryId', subCategoryId);
      if (sortBy) params.append('sortBy', sortBy);
      if (limit) params.append('limit', limit.toString());
      if (isActive !== undefined) params.append('isActive', isActive.toString());

      const response = await fetch(`${API_BASE_URL}/offers?${params.toString()}`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch offers: ${response.statusText}`);
      }

      const data = await response.json();
      
      // Process and filter offers
      let processedOffers = data.offers || data || [];

      // Filter by validUntil (only show active offers that haven't expired)
      const now = new Date();
      processedOffers = processedOffers.filter((offer: Offer) => {
        if (!offer.validUntil) return true;
        return new Date(offer.validUntil) >= now;
      });

      // Sort based on sortBy parameter
      if (sortBy === 'discount') {
        processedOffers.sort((a: Offer, b: Offer) => b.discountValue - a.discountValue);
      } else if (sortBy === 'date') {
        processedOffers.sort((a: Offer, b: Offer) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      } else if (sortBy === 'popularity') {
        processedOffers.sort((a: Offer, b: Offer) => 
          (b.viewCount + b.clickCount + b.conversionCount * 3) - 
          (a.viewCount + a.clickCount + a.conversionCount * 3)
        );
      }

      setOffers(processedOffers.slice(0, limit));
    } catch (err) {
      console.error('Error fetching offers:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch offers');
      setOffers([]);
    } finally {
      setLoading(false);
    }
  }, [categoryId, subCategoryId, sortBy, limit, isActive]);

  useEffect(() => {
    fetchOffers();
  }, [fetchOffers]);

  const incrementViewCount = useCallback(async (offerId: string) => {
    try {
      await fetch(`${API_BASE_URL}/offers/${offerId}/view`, {
        method: 'POST',
      });
    } catch (err) {
      console.error('Error incrementing view count:', err);
    }
  }, []);

  const incrementClickCount = useCallback(async (offerId: string) => {
    try {
      await fetch(`${API_BASE_URL}/offers/${offerId}/click`, {
        method: 'POST',
      });
    } catch (err) {
      console.error('Error incrementing click count:', err);
    }
  }, []);

  return {
    offers,
    loading,
    error,
    refetch: fetchOffers,
    incrementViewCount,
    incrementClickCount,
  };
}

