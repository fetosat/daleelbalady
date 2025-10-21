import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { auth } from './api';
import { sanitizeRedirectUrl, getPostLoginRedirectUrl } from './redirect-utils';

export type UserRole = 'GUEST' | 'CUSTOMER' | 'PROVIDER' | 'SHOP_OWNER' | 'DELIVERY' | 'ADMIN';

export interface Subscription {
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

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  profilePic?: string;
  role: UserRole;
  isVerified: boolean;
  verifiedBadge?: string;
  subscription?: Subscription;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, phone: string, password: string, redirectUrl?: string | null) => Promise<{ user: User; token: string; redirectUrl: string }>;
  signup: (name: string, email: string, password: string, role?: UserRole, phone?: string, redirectUrl?: string | null) => Promise<{ user: User; token: string; redirectUrl: string }>;
  logout: (stayOnCurrentPage?: boolean) => void;
  updateUser: (updates: Partial<User>) => void;
  refreshUser: () => Promise<void>;
  isLoading: boolean;
  setRedirectUrl: (url: string | null) => void;
  getRedirectUrl: () => string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Mock user data
const mockUsers: Record<string, User & { password: string }> = {
  'customer@example.com': {
    id: '1',
    name: 'Ahmed Mohamed',
    email: 'customer@example.com',
    password: 'password',
    phone: '01012345678',
    role: 'CUSTOMER',
    isVerified: true,
  },
  'shop@example.com': {
    id: '2',
    name: 'Al Salam Shop',
    email: 'shop@example.com',
    password: 'password',
    role: 'SHOP_OWNER',
    isVerified: true,
    verifiedBadge: 'verified_business',
  },
  'provider@example.com': {
    id: '3',
    name: 'Dr. Mohamed Ali',
    email: 'provider@example.com',
    password: 'password',
    role: 'PROVIDER',
    isVerified: true,
    verifiedBadge: 'gold',
  },
  'delivery@example.com': {
    id: '4',
    name: 'Kareem Hassan',
    email: 'delivery@example.com',
    password: 'password',
    role: 'DELIVERY',
    isVerified: true,
  },
  'admin@example.com': {
    id: '5',
    name: 'System Admin',
    email: 'admin@example.com',
    password: 'password',
    role: 'ADMIN',
    isVerified: true,
  },
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [redirectUrl, setRedirectUrlState] = useState<string | null>(null);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const token = localStorage.getItem('daleel-token');
        const storedUser = localStorage.getItem('daleel-user');
        
        if (token) {
          // First try to restore from localStorage if available
          if (storedUser) {
            try {
              const user = JSON.parse(storedUser);
              setUser(user);
            } catch (e) {
              console.warn('Failed to parse stored user data');
            }
          }
          
          // Always fetch fresh data from backend
          try {
            console.log('🔄 Refreshing user data from backend...');
            const currentUser = await auth.getCurrentUser();
            console.log('✅ Fresh user data received:', currentUser);
            setUser(currentUser);
            localStorage.setItem('daleel-user', JSON.stringify(currentUser));
          } catch (error) {
            console.error('❌ Failed to fetch user from backend:', error);
            // If backend fails and we have cached data, keep using it
            if (!storedUser) {
              // No cached data and backend failed - logout
              auth.logout();
            }
          }
        } else {
          // No token - clear any stale user data
          setUser(null);
          localStorage.removeItem('daleel-user');
        }
      } catch (error) {
        console.error('Failed to load user:', error);
        auth.logout();
      } finally {
        setIsLoading(false);
      }
    };

    loadUser();
  }, []);

  const login = async (email: string, phone: string, password: string, providedRedirectUrl?: string | null) => {
    setIsLoading(true);
    try {
      const { user, token } = await auth.login(email, phone, password);
      setUser(user);
      localStorage.setItem('daleel-user', JSON.stringify(user));
      localStorage.setItem('daleel-token', token);
      
      // Determine redirect URL
      const finalRedirectUrl = getPostLoginRedirectUrl(
        providedRedirectUrl || redirectUrl,
        user.role
      );
      
      // Clear stored redirect URL after use
      setRedirectUrlState(null);
      localStorage.removeItem('daleel-redirect');
      
      return { user, token, redirectUrl: finalRedirectUrl };
    } catch (error) {
      throw error instanceof Error ? error : new Error('Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (name: string, email: string, password: string, role: UserRole = 'CUSTOMER', phone?: string, providedRedirectUrl?: string | null) => {
    setIsLoading(true);
    try {
      const { user, token } = await auth.signup(name, email, password, role, phone);
      setUser(user);
      localStorage.setItem('daleel-user', JSON.stringify(user));
      localStorage.setItem('daleel-token', token);
      
      // Determine redirect URL
      const finalRedirectUrl = getPostLoginRedirectUrl(
        providedRedirectUrl || redirectUrl,
        user.role
      );
      
      // Clear stored redirect URL after use
      setRedirectUrlState(null);
      localStorage.removeItem('daleel-redirect');
      
      return { user, token, redirectUrl: finalRedirectUrl };
    } catch (error) {
      throw error instanceof Error ? error : new Error('Signup failed');
    } finally {
      setIsLoading(false);
    }
  };

  const logout = (stayOnCurrentPage: boolean = false) => {
    try {
      // Call API logout if available
      auth.logout();
    } catch (error) {
      console.warn('API logout failed:', error);
    }
    
    // Clear auth state
    setUser(null);
    
    // Clear all stored data
    setRedirectUrlState(null);
    if (typeof window !== 'undefined') {
      // Clear all authentication-related localStorage items
      localStorage.removeItem('daleel-token');
      localStorage.removeItem('daleel-user');
      localStorage.removeItem('daleel-redirect');
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      localStorage.removeItem('refreshToken');
      
      // Clear sessionStorage as well
      sessionStorage.clear();
      
      // Clear any cookies (if applicable)
      document.cookie.split(';').forEach(function(c) { 
        document.cookie = c.replace(/^ +/, '').replace(/=.*/, '=;expires=' + new Date().toUTCString() + ';path=/');
      });
    }
    
    // Handle navigation
    if (stayOnCurrentPage) {
      // Force reload to clear any cached auth state
      window.location.reload();
    } else {
      // Redirect to home page
      window.location.href = '/';
    }
  };

  const updateUser = (updates: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...updates };
      setUser(updatedUser);
      localStorage.setItem('daleel-user', JSON.stringify(updatedUser));
    }
  };
  
  const refreshUser = async () => {
    try {
      const token = localStorage.getItem('daleel-token');
      if (!token) {
        console.warn('No token available for refresh');
        return;
      }
      
      console.log('🔄 Manually refreshing user data...');
      const currentUser = await auth.getCurrentUser();
      console.log('✅ User data refreshed successfully');
      setUser(currentUser);
      localStorage.setItem('daleel-user', JSON.stringify(currentUser));
    } catch (error) {
      console.error('❌ Failed to refresh user data:', error);
      throw error;
    }
  };
  
  const setRedirectUrl = (url: string | null) => {
    const sanitizedUrl = url ? sanitizeRedirectUrl(url, null) : null;
    setRedirectUrlState(sanitizedUrl);
    
    // Persist to localStorage for cross-session redirects
    if (sanitizedUrl) {
      localStorage.setItem('daleel-redirect', sanitizedUrl);
    } else {
      localStorage.removeItem('daleel-redirect');
    }
  };
  
  const getRedirectUrl = (): string | null => {
    // First check state, then localStorage
    if (redirectUrl) return redirectUrl;
    
    const stored = localStorage.getItem('daleel-redirect');
    return stored ? sanitizeRedirectUrl(stored, null) : null;
  };
  
  // Load redirect URL from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem('daleel-redirect');
    if (stored) {
      const sanitized = sanitizeRedirectUrl(stored, null);
      if (sanitized) {
        setRedirectUrlState(sanitized);
      } else {
        localStorage.removeItem('daleel-redirect');
      }
    }
  }, []);

  return (
    <AuthContext.Provider value={{
      user,
      login,
      signup,
      logout,
      updateUser,
      refreshUser,
      isLoading,
      setRedirectUrl,
      getRedirectUrl,
    }}>
      {children}
    </AuthContext.Provider>
  );
};