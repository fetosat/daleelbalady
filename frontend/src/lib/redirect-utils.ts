/**
 * Utilities for safely handling redirect URLs to prevent open redirect vulnerabilities
 */

/**
 * List of allowed domains for redirects (in production, this should be more restrictive)
 */
const ALLOWED_DOMAINS = [
  'localhost',
  '127.0.0.1',
  'daleelbalady.com',
  'www.daleelbalady.com',
  'api.daleelbalady.com'
];

/**
 * List of dangerous protocols to block
 */
const DANGEROUS_PROTOCOLS = [
  'javascript:',
  'data:',
  'vbscript:',
  'file:',
  'ftp:'
];

/**
 * Validates if a URL is safe to redirect to
 * @param url - The URL to validate
 * @returns boolean indicating if the URL is safe
 */
export function isUrlSafe(url: string): boolean {
  try {
    // Check for dangerous protocols
    const lowerUrl = url.toLowerCase();
    if (DANGEROUS_PROTOCOLS.some(protocol => lowerUrl.startsWith(protocol))) {
      return false;
    }

    // If it's a relative URL (starts with / but not //), it's safe
    if (url.startsWith('/') && !url.startsWith('//')) {
      return true;
    }

    // Parse the URL to check domain
    const parsedUrl = new URL(url);
    
    // Only allow http and https protocols
    if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
      return false;
    }

    // Check if domain is in allowed list
    const hostname = parsedUrl.hostname.toLowerCase();
    return ALLOWED_DOMAINS.some(domain => 
      hostname === domain || hostname.endsWith(`.${domain}`)
    );
  } catch {
    // If URL parsing fails, it's not safe
    return false;
  }
}

/**
 * Sanitizes a redirect URL to ensure it's safe
 * @param url - The URL to sanitize
 * @param fallback - Fallback URL if the original is unsafe (defaults to '/')
 * @returns A safe URL to redirect to
 */
export function sanitizeRedirectUrl(url: string | null | undefined, fallback: string = '/'): string {
  // Handle null/undefined/empty strings
  if (!url || url.trim() === '') {
    return fallback;
  }

  // Decode URL if it's encoded
  let decodedUrl: string;
  try {
    decodedUrl = decodeURIComponent(url);
  } catch {
    return fallback;
  }

  // Check if the URL is safe
  if (!isUrlSafe(decodedUrl)) {
    return fallback;
  }

  return decodedUrl;
}

/**
 * Gets the current URL path and query parameters for use as a redirect URL
 * @param location - The current location object from React Router
 * @returns A string representing the current page URL
 */
export function getCurrentRedirectUrl(location: { pathname: string; search: string }): string {
  return `${location.pathname}${location.search}`;
}

/**
 * Creates a login URL with a redirect parameter
 * @param redirectTo - The URL to redirect to after login
 * @returns Login URL with redirect parameter
 */
export function createLoginUrl(redirectTo?: string): string {
  if (!redirectTo || redirectTo === '/login' || redirectTo === '/signup' || redirectTo.includes('/login')) {
    return '/login';
  }
  
  const sanitizedRedirect = sanitizeRedirectUrl(redirectTo);
  if (sanitizedRedirect === '/' || sanitizedRedirect.includes('/login')) {
    return '/login';
  }
  
  const encodedRedirect = encodeURIComponent(sanitizedRedirect);
  return `/login?redirect=${encodedRedirect}`;
}

/**
 * Extracts the redirect URL from URL search parameters
 * @param searchParams - URLSearchParams object
 * @returns The redirect URL or null if not present/invalid
 */
export function extractRedirectUrl(searchParams: URLSearchParams): string | null {
  const redirectParam = searchParams.get('redirect');
  if (!redirectParam) {
    return null;
  }
  
  return sanitizeRedirectUrl(redirectParam, null);
}

/**
 * Determines the best redirect URL after login
 * @param redirectUrl - The redirect URL from parameters
 * @param userRole - The user's role to determine default dashboard
 * @returns The URL to redirect to after login
 */
export function getPostLoginRedirectUrl(redirectUrl: string | null, userRole?: string): string {
  // If we have a valid redirect URL, use it
  if (redirectUrl && redirectUrl !== '/' && redirectUrl !== '/dashboard') {
    return redirectUrl;
  }
  
  // Route based on user role
  switch (userRole) {
    case 'ADMIN':
      return '/admin';
    case 'PROVIDER':
    case 'SHOP_OWNER':
      return '/dashboard/provider';
    case 'DELIVERY':
      return '/dashboard/delivery';
    case 'CUSTOMER':
    case 'GUEST':
    default:
      return '/dashboard/customer';
  }
}
