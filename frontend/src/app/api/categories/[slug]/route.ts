import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.NODE_ENV === 'development' 
  ? (process.env.BACKEND_API_URL?.replace(/\/api$/, '') || 'http://localhost:5000')
  : 'https://api.daleelbalady.com';

export async function GET(request: NextRequest, { params }: { params: { slug: string } }) {
  try {
    const { slug } = params;
    
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

    console.log(`🔄 Proxying category request to: ${BACKEND_URL}/api/categories/${slug}`);

    const response = await fetch(`${BACKEND_URL}/api/categories/${slug}`, {
      method: 'GET',
      headers,
    });

    const data = await response.json();
    
    if (!response.ok) {
      console.error('❌ Backend category error:', data);
      return NextResponse.json(data, { status: response.status });
    }

    console.log('✅ Category proxy successful');
    return NextResponse.json(data);

  } catch (error) {
    console.error('❌ Category proxy error:', error);
    return NextResponse.json(
      { error: 'Proxy server error', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
