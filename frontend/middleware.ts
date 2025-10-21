import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// ONLY protect these specific sensitive routes
// Everything else is PUBLIC by default
const PROTECTED_ROUTES = {
  '/admin': 'ADMIN',
  '/dashboard/admin': 'ADMIN',
  '/dashboard/provider': 'PROVIDER',
  '/dashboard/customer': 'CUSTOMER',
  '/dashboard/delivery': 'DELIVERY',
};

// Get correct dashboard path based on user role
function getDashboardPath(role: string): string {
  const dashboardMap: Record<string, string> = {
    ADMIN: '/dashboard/admin',
    PROVIDER: '/dashboard/provider',
    CUSTOMER: '/dashboard/customer',
    DELIVERY: '/dashboard/delivery',
  };
  
  return dashboardMap[role] || '/';
}

// Check if pathname is a protected route
function getRequiredRole(pathname: string): string | null {
  // Check for exact match or nested routes
  for (const [route, role] of Object.entries(PROTECTED_ROUTES)) {
    if (pathname === route || pathname.startsWith(route + '/')) {
      return role;
    }
  }
  return null;
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Skip middleware for static files and API routes
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/static') ||
    pathname.startsWith('/api') ||
    pathname.includes('.')
  ) {
    return NextResponse.next();
  }
  
  // Get token from cookie to check user role
  const token = request.cookies.get('daleel-token')?.value;
  let userRole: string | null = null;
  
  if (token) {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      const decoded = JSON.parse(jsonPayload);
      userRole = decoded.role;
    } catch (error) {
      // Invalid token - ignore for now
    }
  }
  
  // Handle /dashboard route - redirect to role-specific dashboard
  if (pathname === '/dashboard' && userRole) {
    const correctDashboard = getDashboardPath(userRole);
    if (correctDashboard !== '/dashboard') {
      return NextResponse.redirect(new URL(correctDashboard, request.url));
    }
  }
  
  // Check if this route requires specific role protection
  const requiredRole = getRequiredRole(pathname);
  
  // If route is not protected, allow access
  if (!requiredRole) {
    return NextResponse.next();
  }
  
  // Route is protected - check if user has token
  if (!token) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    url.searchParams.set('redirect', pathname);
    return NextResponse.redirect(url);
  }
  
  // If token couldn't be decoded earlier, redirect to login
  if (!userRole) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    return NextResponse.redirect(url);
  }
  
  // Check if user has the required role
  if (userRole !== requiredRole) {
    // User doesn't have permission - redirect to their correct dashboard
    const correctDashboard = getDashboardPath(userRole || 'GUEST');
    return NextResponse.redirect(new URL(correctDashboard, request.url));
  }
  
  // User has permission - allow access
  return NextResponse.next();
}

// Configure which routes to run middleware on
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\..*|public).*)',
  ],
};

