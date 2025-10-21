import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.NODE_ENV === 'development' 
  ? process.env.BACKEND_API_URL?.replace('/api', '') || 'http://localhost:5000'
  : 'https://api.daleelbalady.com';

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const searchParams = url.searchParams.toString();
    const fullUrl = `${BACKEND_URL}/api/advanced-search/categories${searchParams ? `?${searchParams}` : ''}`;

    console.log('🔄 Proxying categories request to:', fullUrl);

    const response = await fetch(fullUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        // Forward any authorization headers
        ...(request.headers.get('authorization') && {
          'Authorization': request.headers.get('authorization')!
        })
      },
    });

    const data = await response.json();
    
    if (!response.ok) {
      console.error('❌ Backend categories error:', data);
      return NextResponse.json(data, { status: response.status });
    }

    console.log('✅ Categories proxy successful');
    return NextResponse.json(data);

  } catch (error) {
    console.error('❌ Categories proxy error:', error);
    return NextResponse.json(
      { error: 'Proxy server error', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
