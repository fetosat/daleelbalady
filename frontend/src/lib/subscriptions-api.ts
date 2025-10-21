import api from './api';
import type { Subscription } from './auth';

interface SubscriptionResponse {
  id: string;
  planType: 'PROVIDER' | 'USER';
  planName: string;
  planNameAr: string;
  status: 'ACTIVE' | 'EXPIRED' | 'CANCELLED';
  startDate?: string;
  endDate?: string;
  autoRenew?: boolean;
  amount?: number;
  currency?: string;
  features?: string[];
  featuresAr?: string[];
  // Provider-specific fields
  canTakeBookings?: boolean;
  canListProducts?: boolean;
  searchPriority?: number;
  // User-specific fields
  cardNumber?: string;
  qrCode?: string;
  maxFamilyMembers?: number;
  periodMonths?: number;
}

export const subscriptionsAPI = {
  // Get user's current subscriptions
  async getUserSubscriptions(): Promise<Subscription[]> {
    try {
      const response = await api.get('/subscriptions');
      return response.data;
    } catch (error: any) {
      console.error('Error fetching subscriptions:', error);
      
      // Return empty array if no subscriptions found
      if (error.response?.status === 404) {
        return [];
      }
      
      throw new Error(error.response?.data?.message || 'Failed to fetch subscriptions');
    }
  },

  // Get specific subscription details
  async getSubscriptionDetails(subscriptionId: string): Promise<Subscription> {
    try {
      const response = await api.get(`/subscriptions/${subscriptionId}`);
      return response.data;
    } catch (error: any) {
      console.error('Error fetching subscription details:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch subscription details');
    }
  },

  // Initiate subscription upgrade
  async upgradeSubscription(planId: string, amount: number, paymentMethod: string): Promise<{ redirectUrl: string; paymentData: any }> {
    try {
      const response = await api.post('/subscriptions/upgrade', {
        planType: 'PROVIDER', // This could be dynamic based on user role
        planId,
        amount,
        paymentMethod
      });
      
      return response.data;
    } catch (error: any) {
      console.error('Error initiating subscription upgrade:', error);
      throw new Error(error.response?.data?.message || 'Failed to initiate subscription upgrade');
    }
  }
};
