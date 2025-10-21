import { NextRequest, NextResponse } from 'next/server';

const BACKEND_API_URL = process.env.BACKEND_API_URL || 'https://api.daleelbalady.com';

export async function POST(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  try {
    console.log('🔧 Analytics API Route - POST request for:', params.path);
    
    const path = params.path.join('/');
    const url = `${BACKEND_API_URL}/api/analytics/${path}`;
    const body = await request.text();
    
    console.log('🔗 Forwarding POST request to:', url);

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': request.headers.get('Authorization') || '',
        'Content-Type': request.headers.get('Content-Type') || 'application/json',
        'Accept': 'application/json',
      },
      body: body || undefined,
    });

    console.log('📊 Backend response status:', response.status);

    if (!response.ok) {
      console.error('❌ Backend error response:', response.status, response.statusText);
      const errorText = await response.text();
      console.error('❌ Backend error details:', errorText);
      
      try {
        const errorJson = JSON.parse(errorText);
        return NextResponse.json(errorJson, { status: response.status });
      } catch {
        return NextResponse.json(
          { error: 'Backend request failed', message: errorText },
          { status: response.status }
        );
      }
    }

    const data = await response.json();
    console.log('✅ Analytics API Route - POST request successful');
    
    return NextResponse.json(data);
  } catch (error) {
    console.error('❌ Analytics API Route - POST error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
