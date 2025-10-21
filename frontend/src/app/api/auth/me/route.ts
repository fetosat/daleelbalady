import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.NODE_ENV === 'development' 
  ? (process.env.BACKEND_API_URL?.replace(/\/api$/, '') || 'http://localhost:5000')
  : 'https://api.daleelbalady.com';

export async function GET(request: NextRequest) {
  try {
    // Get authorization header from the request
    const authHeader = request.headers.get('authorization');
    const cookieHeader = request.headers.get('cookie');
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (authHeader) {
      headers.Authorization = authHeader;
    }

    if (cookieHeader) {
      headers.Cookie = cookieHeader;
    }

    console.log('🔄 Proxying auth/me request to:', `${BACKEND_URL}/api/auth/me`);

    const response = await fetch(`${BACKEND_URL}/api/auth/me`, {
      method: 'GET',
      headers,
    });

    const data = await response.json();
    
    if (!response.ok) {
      console.error('❌ Backend auth/me error:', data);
      return NextResponse.json(data, { status: response.status });
    }

    console.log('✅ Auth/me proxy successful');
    return NextResponse.json(data);

  } catch (error) {
    console.error('❌ Auth/me proxy error:', error);
    return NextResponse.json(
      { error: 'Proxy server error', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
