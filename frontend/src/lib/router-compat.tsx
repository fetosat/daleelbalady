/**
 * React Router DOM compatibility layer for Next.js
 * This file provides React Router-like APIs using Next.js routing
 */

import React, { useEffect, useState } from 'react';
import { useCallback } from 'react';

// Check if we're in a Next.js context by checking for the router
const hasNextRouter = () => {
  try {
    // Check if Next.js router context exists
    if (typeof window !== 'undefined' && (window as any).__NEXT_DATA__) {
      return true;
    }
    return false;
  } catch {
    return false;
  }
};

// Safe wrapper for useRouter that returns null if not in Next.js context
const useSafeRouter = () => {
  if (!hasNextRouter()) {
    return null;
  }
  
  try {
    // Dynamically import only when needed to avoid build errors
    const { useRouter: nextUseRouter } = require('next/navigation');
    return nextUseRouter();
  } catch (e) {
    return null;
  }
};

// Export useNavigate hook
export function useNavigate() {
  // Try to use Next.js router if available
  const router = useSafeRouter();

  const navigate = useCallback((to: string | number, options?: { replace?: boolean; state?: any }) => {
    if (!router) {
      // Fallback for non-Next.js contexts - use window navigation
      if (typeof to === 'number') {
        if (to === -1 && typeof window !== 'undefined') {
          window.history.back();
        }
      } else if (typeof window !== 'undefined') {
        // Store state in sessionStorage if provided
        if (options?.state && typeof window !== 'undefined') {
          try {
            sessionStorage.setItem('navigate-state', JSON.stringify(options.state));
          } catch {}
        }
        if (options?.replace) {
          window.location.replace(to);
        } else {
          window.location.href = to;
        }
      }
      return;
    }
    
    // Next.js router is available
    if (typeof to === 'number') {
      // Handle relative navigation like navigate(-1)
      if (to === -1) {
        router.back();
      } else {
        console.warn('Navigation by steps other than -1 is not supported');
      }
    } else {
      // Store state in sessionStorage if provided (Next.js doesn't support state in navigation)
      if (options?.state && typeof window !== 'undefined') {
        try {
          sessionStorage.setItem('navigate-state', JSON.stringify(options.state));
        } catch {}
      }
      // Handle string paths
      if (options?.replace) {
        router.replace(to);
      } else {
        router.push(to);
      }
    }
  }, [router]);

  return navigate;
}

// Export useLocation hook
export function useLocation() {
  // For Next.js App Router, we use window.location directly
  if (typeof window !== 'undefined') {
    return {
      pathname: window.location.pathname,
      search: window.location.search,
      hash: window.location.hash,
      state: null,
      key: ''
    };
  }
  
  return {
    pathname: '/',
    search: '',
    hash: '',
    state: null,
    key: ''
  };
}

// Export useParams hook
export function useParams() {
  // For Next.js App Router, we need to use next/navigation's useParams
  try {
    const { useParams: nextUseParams } = require('next/navigation');
    return nextUseParams() || {};
  } catch {
    return {};
  }
}

// Export useSearchParams hook
export function useSearchParams(): [URLSearchParams, (params: URLSearchParams | ((prev: URLSearchParams) => URLSearchParams), options?: { replace?: boolean }) => void] {
  const router = useSafeRouter();
  const [searchParams, setSearchParamsState] = useState<URLSearchParams>(() => {
    if (typeof window !== 'undefined') {
      return new URLSearchParams(window.location.search);
    }
    return new URLSearchParams();
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Listen for popstate events
      const handlePopState = () => {
        setSearchParamsState(new URLSearchParams(window.location.search));
      };
      window.addEventListener('popstate', handlePopState);
      setSearchParamsState(new URLSearchParams(window.location.search));
      return () => window.removeEventListener('popstate', handlePopState);
    }
  }, []);

  const setSearchParams = useCallback((params: URLSearchParams | ((prev: URLSearchParams) => URLSearchParams), options?: { replace?: boolean }) => {
    const newParams = typeof params === 'function' ? params(searchParams) : params;
    const newParamsString = newParams.toString();
    const currentParamsString = searchParams.toString();
    
    // Don't update if params haven't changed
    if (newParamsString === currentParamsString) {
      return;
    }
    
    if (!router) {
      // Fallback for non-Next.js contexts
      if (typeof window !== 'undefined') {
        const newUrl = `${window.location.pathname}${newParamsString ? '?' + newParamsString : ''}`;
        if (options?.replace) {
          window.history.replaceState(null, '', newUrl);
        } else {
          window.history.pushState(null, '', newUrl);
        }
        // Update the state immediately
        setSearchParamsState(newParams);
      }
      return;
    }
    
    const currentPath = window.location.pathname;
    const newPath = `${currentPath}${newParamsString ? '?' + newParamsString : ''}`;
    
    if (options?.replace) {
      router.replace(newPath);
    } else {
      router.push(newPath);
    }
  }, [router, searchParams]);

  return [searchParams, setSearchParams];
}

// Export Link component (wraps Next.js Link)
export const Link = ({ to, children, className, ...props }: { to: string; children: React.ReactNode; className?: string; [key: string]: any }) => {
  if (!hasNextRouter()) {
    // Fallback for non-Next.js contexts - use regular anchor tag
    return (
      <a href={to} className={className} {...props}>
        {children}
      </a>
    );
  }
  
  try {
    const NextLink = require('next/link').default;
    return (
      <NextLink href={to} className={className} {...props}>
        {children}
      </NextLink>
    );
  } catch {
    // Fallback if Next.js Link can't be loaded
    return (
      <a href={to} className={className} {...props}>
        {children}
      </a>
    );
  }
};

// Also export as NavLink for compatibility
export const NavLink = Link;

// Export Navigate component for redirects
export const Navigate = ({ to, replace = false }: { to: string; replace?: boolean }) => {
  const router = useSafeRouter();
  
  useEffect(() => {
    if (!router) {
      // Fallback for non-Next.js contexts
      if (typeof window !== 'undefined') {
        if (replace) {
          window.location.replace(to);
        } else {
          window.location.href = to;
        }
      }
      return;
    }
    
    if (replace) {
      router.replace(to);
    } else {
      router.push(to);
    }
  }, [to, replace, router]);
  
  return null;
};

// Export Routes and Route components (no-ops in Next.js)
export const Routes = ({ children }: { children: React.ReactNode }) => {
  return <>{children}</>;
};

export const Route = ({ element }: { path?: string; element: React.ReactNode }) => {
  return <>{element}</>;
};

// Export BrowserRouter (no-op in Next.js)
export const BrowserRouter = ({ children }: { children: React.ReactNode }) => {
  return <>{children}</>;
};

// Export Outlet (no-op in Next.js)
export const Outlet = () => {
  return null;
};
