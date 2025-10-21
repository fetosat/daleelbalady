// Authentication utility functions
import { API_BASE } from './env';
interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: string;
  profilePic?: string;
  bio?: string;
  isVerified?: boolean;
  verifiedBadge?: boolean;
}

interface AuthResponse {
  user: User;
  token?: string;
  message?: string;
}

// Store auth data in localStorage
export const setAuthData = (user: User, token: string) => {
  localStorage.setItem('daleel-user', JSON.stringify(user));
  localStorage.setItem('daleel-token', token);
  // Also store in alternative keys for compatibility
  localStorage.setItem('user', JSON.stringify(user));
  localStorage.setItem('token', token);
};

// Get auth data from localStorage
export const getAuthData = () => {
  // Try daleel- prefixed keys first
  let userStr = localStorage.getItem('daleel-user');
  let token = localStorage.getItem('daleel-token');
  
  // Fallback to non-prefixed keys
  if (!userStr) userStr = localStorage.getItem('user');
  if (!token) token = localStorage.getItem('token');
  
  if (!userStr || !token) {
    return null;
  }
  
  try {
    return {
      user: JSON.parse(userStr) as User,
      token
    };
  } catch {
    return null;
  }
};

// Clear auth data
export const clearAuthData = () => {
  localStorage.removeItem('daleel-user');
  localStorage.removeItem('daleel-token');
  localStorage.removeItem('user');
  localStorage.removeItem('token');
};

// Check if user is logged in
export const isAuthenticated = () => {
  return getAuthData() !== null;
};

// Get current user with fallback to API
export const getCurrentUser = async (): Promise<User | null> => {
  // First try localStorage
  const stored = getAuthData();
  if (stored) {
    return stored.user;
  }
  
  // Then try API with cookie
  try {
    const response = await fetch(`${API_BASE}/auth/me`, {
      credentials: 'include',
      headers: {
        'Authorization': (stored as any)?.token ? `Bearer ${stored.token}` : ''
      }
    });
    
    if (response.ok) {
      const data = await response.json();
      return data.user || data;
    }
  } catch (error) {
    console.error('Failed to get current user:', error);
  }
  
  return null;
};

// Login helper
export const login = async (credentials: { email?: string; phone?: string; password: string }): Promise<AuthResponse> => {
  const response = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    credentials: 'include',
    body: JSON.stringify(credentials)
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Login failed');
  }
  
  const data = await response.json();
  
  // Store in localStorage if token is returned
  if (data.token && data.user) {
    setAuthData(data.user, data.token);
  }
  
  return data;
};

// Signup helper
export const signup = async (userData: { name: string; email?: string; phone?: string; password: string; role?: string }): Promise<AuthResponse> => {
  const response = await fetch(`${API_BASE}/auth/signup`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    credentials: 'include',
    body: JSON.stringify(userData)
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Signup failed');
  }
  
  const data = await response.json();
  
  // Store in localStorage if token is returned
  if (data.token && data.user) {
    setAuthData(data.user, data.token);
  }
  
  return data;
};

// Logout helper
export const logout = async () => {
  try {
    await fetch(`${API_BASE}/auth/logout`, {
      method: 'POST',
      credentials: 'include'
    });
  } catch (error) {
    console.error('Logout error:', error);
  } finally {
    clearAuthData();
    window.location.href = '/';
  }
};

// Helper to make authenticated API calls
export const authenticatedFetch = async (url: string, options: RequestInit = {}) => {
  const authData = getAuthData();
  
  const headers = {
    ...options.headers,
    ...(authData?.token ? { 'Authorization': `Bearer ${authData.token}` } : {})
  };
  
  return fetch(url, {
    ...options,
    credentials: 'include',
    headers
  });
};
