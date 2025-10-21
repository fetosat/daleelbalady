// api/advancedSearch.ts

export interface AdvancedSearchParams {
  q?: string;
  type?: 'all' | 'shops' | 'services' | 'users' | 'products';
  location?: {
    city?: string;
    lat?: number;
    lon?: number;
    radius?: number;
  };
  category?: {
    categoryId?: string;
    subCategoryId?: string;
  };
  sortBy?: 'reviews' | 'recommendation' | 'location' | 'customers' | 'rating' | 'recent';
  page?: number;
  limit?: number;
  filters?: {
    verified?: boolean;
    hasReviews?: boolean;
    priceRange?: {
      min?: number;
      max?: number;
    };
  };
}

export interface AdvancedSearchResponse {
  success: boolean;
  shops: any[];
  services: any[];
  users: any[];
  products: any[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  serviceCount: number;
  subCategories: SubCategory[];
}

export interface SubCategory {
  id: string;
  name: string;
  slug: string;
  serviceCount: number;
}

export interface CategoriesResponse {
  success: boolean;
  categories: Category[];
}

export const advancedSearchAPI = {
  // Perform advanced search
  search: async (params: AdvancedSearchParams): Promise<AdvancedSearchResponse> => {
    const response = await fetch('/api/advanced-search', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(params),
    });

    if (!response.ok) {
      throw new Error(`Search failed: ${response.statusText}`);
    }

    return response.json();
  },

  // Get categories with subcategories
  getCategories: async (): Promise<CategoriesResponse> => {
    const response = await fetch('/api/advanced-search/categories');

    if (!response.ok) {
      throw new Error(`Failed to load categories: ${response.statusText}`);
    }

    return response.json();
  },

  // Handle API errors
  handleError: (error: any): string => {
    console.error('Advanced search API error:', error);
    
    if (error.message) {
      return error.message;
    }
    
    if (typeof error === 'string') {
      return error;
    }
    
    return 'An unexpected error occurred. Please try again.';
  }
};

export default advancedSearchAPI;
