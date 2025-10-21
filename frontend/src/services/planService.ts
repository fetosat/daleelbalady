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
export interface UserPlan {
  id: string;
  planType: 'FREE' | 'SINGLE_CATEGORY' | 'ALL_CATEGORIES';
  selectedCategoryId?: string;
  selectedCategory?: {
    id: string;
    name: string;
    slug: string;
  };
  pricePerMonth: number;
  currency: string;
  includesChat: boolean;
  includesDiscounts: boolean;
  egyptianNationalId?: string;
  fullArabicName?: string;
  profilePicture?: string;
  maskedPin?: string;
  isPinExpired?: boolean;
  pinExpiresAt?: string;
  maxFamilyMembers: number;
  currentMembers: number;
  isActive: boolean;
  startedAt: string;
  familyMembers?: FamilyMember[];
  nextPaymentDue?: string;
  pinUsageCount?: number;
}

export interface FamilyMember {
  id: string;
  inviteEmail?: string;
  invitePhone?: string;
  inviteStatus: 'PENDING' | 'ACCEPTED' | 'EXPIRED' | 'CANCELLED';
  tempName?: string;
  invitedUser?: {
    id: string;
    name: string;
    email: string;
  };
  acceptedAt?: string;
  expiresAt: string;
  canUseChat: boolean;
  canUseDiscounts: boolean;
}

export interface PlanUpgradeData {
  planType: 'SINGLE_CATEGORY' | 'ALL_CATEGORIES';
  selectedCategoryId?: string;
  egyptianNationalId: string;
  fullArabicName: string;
  profilePicture?: string;
  pricePerMonth?: number;
}

export interface FamilyInvite {
  id: string;
  inviteEmail?: string;
  invitePhone?: string;
  inviteLink: string;
  expiresAt: string;
}

export interface PinInfo {
  maskedPin: string;
  isPinExpired: boolean;
  pinExpiresAt: string;
  currentMonthYear: string;
}

export interface UserPermissions {
  hasActivePlan: boolean;
  canUseChat: boolean;
  canUseDiscounts: boolean;
  planType: string;
  selectedCategoryId?: string;
  isPinExpired?: boolean;
}

export interface PlanStats {
  planType: string;
  isActive: boolean;
  startedAt: string;
  daysActive: number;
  pinUsageCount: number;
  familyMembersCount: number;
  nextPaymentDue?: string;
  totalSavingsThisMonth: number;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
}

// Plan Services
export class PlanService {
  // Get current user plan
  static async getMyPlan(): Promise<UserPlan> {
    const response = await api.get('/plans/my-plan');
    return response.data;
  }

  // Upgrade to paid plan
  static async upgradePlan(planData: PlanUpgradeData): Promise<{ success: boolean; message: string; plan: UserPlan }> {
    const response = await api.post('/plans/upgrade', planData);
    return response.data;
  }

  // Get PIN information
  static async getPinInfo(): Promise<PinInfo> {
    const response = await api.get('/plans/pin');
    return response.data;
  }

  // Get user permissions
  static async getPermissions(): Promise<UserPermissions> {
    const response = await api.get('/plans/permissions');
    return response.data;
  }

  // Get plan statistics
  static async getPlanStats(): Promise<PlanStats> {
    const response = await api.get('/plans/stats');
    return response.data;
  }

  // Family management
  static async inviteFamilyMember(data: {
    inviteEmail?: string;
    invitePhone?: string;
    tempName?: string;
    inviteMethod?: string;
  }): Promise<{ success: boolean; message: string; invite: FamilyInvite }> {
    const response = await api.post('/plans/invite-family', data);
    return response.data;
  }

  static async getFamilyMembers(): Promise<{
    familyMembers: FamilyMember[];
    maxFamilyMembers: number;
    currentMembers: number;
  }> {
    const response = await api.get('/plans/family-members');
    return response.data;
  }

  static async getInviteData(token: string): Promise<{ invite: any }> {
    const response = await api.get(`/plans/invite/${token}`);
    return response.data;
  }

  static async acceptFamilyInvite(token: string): Promise<{ success: boolean; message: string; membership: any }> {
    const response = await api.post(`/plans/accept-invite/${token}`);
    return response.data;
  }

  static async cancelFamilyInvite(inviteId: string): Promise<{ success: boolean; message: string }> {
    const response = await api.delete(`/plans/family-invite/${inviteId}`);
    return response.data;
  }

  // Admin functions
  static async renewPins(): Promise<{ success: boolean; message: string; renewedCount: number }> {
    const response = await api.post('/plans/renew-pins');
    return response.data;
  }
}

// Categories Service (assuming you have categories endpoint)
export class CategoryService {
  static async getCategories(): Promise<Category[]> {
    try {
      const response = await api.get('/categories');
      return response.data;
    } catch (error) {
      console.error('Error fetching categories:', error);
      // Fallback categories if API fails
      return [
        { id: '1', name: 'طبي', slug: 'medical' },
        { id: '2', name: 'قانوني', slug: 'legal' },
        { id: '3', name: 'تعليمي', slug: 'educational' },
        { id: '4', name: 'تجاري', slug: 'commercial' },
        { id: '5', name: 'صناعي', slug: 'industrial' },
      ];
    }
  }
}

export default PlanService;
