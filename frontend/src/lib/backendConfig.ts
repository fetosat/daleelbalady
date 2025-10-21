/**
 * Backend Configuration for API Routes
 * إعدادات مركزية للاتصال بـ Backend
 */

// Environment-based backend URL
export const BACKEND_URL = process.env.NODE_ENV === 'production' 
  ? 'https://api.daleelbalady.com/api'
  : process.env.BACKEND_API_URL || 'http://localhost:5000/api'; // Use local backend for development

// Log configuration for debugging
console.log('🔧 Backend Configuration:', {
  NODE_ENV: process.env.NODE_ENV,
  BACKEND_URL,
  IS_PRODUCTION: BACKEND_URL.includes('daleelbalady.com'),
  IS_LOCAL: BACKEND_URL.includes('localhost'),
  TIMESTAMP: new Date().toISOString()
});

// Helper function for creating backend URLs
export const createBackendUrl = (path: string) => {
  // Remove leading slash if present
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;
  return `${BACKEND_URL}/${cleanPath}`;
};

// Common headers for backend requests
export const getCommonHeaders = (request: Request) => ({
  'Content-Type': 'application/json',
  // Forward authorization header if present
  ...(request.headers.get('authorization') && {
    'Authorization': request.headers.get('authorization')!
  }),
  // Forward other relevant headers
  ...(request.headers.get('user-agent') && {
    'User-Agent': request.headers.get('user-agent')!
  })
});

// Health check helper
export const checkBackendHealth = async () => {
  try {
    const response = await fetch(createBackendUrl('health'), {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    return {
      healthy: response.ok,
      status: response.status,
      data: response.ok ? await response.json() : null
    };
  } catch (error) {
    return {
      healthy: false,
      status: 0,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
};
