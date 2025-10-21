/**
 * Utility to sync authentication token between localStorage and cookies
 * This ensures Next.js middleware can validate user role on server-side
 */

export function setAuthToken(token: string) {
  if (typeof window === 'undefined') return;
  
  // Store in localStorage for client-side use
  localStorage.setItem('daleel-token', token);
  
  // Store in cookie for middleware access
  // Set cookie with 7 days expiration
  const expirationDate = new Date();
  expirationDate.setDate(expirationDate.getDate() + 7);
  
  // Set cookie without SameSite=Strict for localhost compatibility
  document.cookie = `daleel-token=${token}; expires=${expirationDate.toUTCString()}; path=/; SameSite=Lax`;
  
  console.log('✅ Token set in cookie:', token.substring(0, 20) + '...');
}

export function removeAuthToken() {
  if (typeof window === 'undefined') return;
  
  // Remove from localStorage
  localStorage.removeItem('daleel-token');
  localStorage.removeItem('daleel-user');
  
  // Remove cookie
  document.cookie = 'daleel-token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
}

export function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null;
  
  // Try localStorage first
  const token = localStorage.getItem('daleel-token');
  if (token) return token;
  
  // Fallback to cookie
  const cookies = document.cookie.split(';');
  for (const cookie of cookies) {
    const [name, value] = cookie.trim().split('=');
    if (name === 'daleel-token') {
      return value;
    }
  }
  
  return null;
}

export function syncAuthToken() {
  if (typeof window === 'undefined') return;
  
  const token = localStorage.getItem('daleel-token');
  if (token) {
    setAuthToken(token);
  } else {
    removeAuthToken();
  }
}

