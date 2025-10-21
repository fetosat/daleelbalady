import { NextResponse } from 'next/server';
import { checkBackendHealth, BACKEND_URL } from '../../../lib/backendConfig';

/**
 * Frontend Health Check Endpoint
 * للتحقق من صحة Frontend والاتصال بـ Backend
 */

export async function GET() {
  try {
    console.log('🔍 Frontend health check started...');
    
    // Check backend connectivity
    const backendHealth = await checkBackendHealth();
    
    const response = {
      frontend: {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        version: '1.0.0',
        environment: process.env.NODE_ENV || 'development'
      },
      backend: {
        url: BACKEND_URL,
        status: backendHealth.healthy ? 'healthy' : 'unhealthy',
        responseStatus: backendHealth.status,
        ...backendHealth.data && { data: backendHealth.data },
        ...backendHealth.error && { error: backendHealth.error }
      },
      overall: {
        status: backendHealth.healthy ? 'healthy' : 'degraded',
        message: backendHealth.healthy 
          ? 'All systems operational' 
          : 'Backend connectivity issues detected'
      }
    };
    
    console.log('✅ Frontend health check completed:', response.overall.status);
    
    return NextResponse.json(response, {
      status: backendHealth.healthy ? 200 : 503
    });
    
  } catch (error) {
    console.error('❌ Frontend health check failed:', error);
    
    return NextResponse.json({
      frontend: {
        status: 'error',
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      backend: {
        url: BACKEND_URL,
        status: 'unknown'
      },
      overall: {
        status: 'error',
        message: 'Health check failed'
      }
    }, { status: 500 });
  }
}
