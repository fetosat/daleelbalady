import { NextRequest, NextResponse } from 'next/server';

const BACKEND_API_URL = (process.env.BACKEND_API_URL || 'https://api.daleelbalady.com').replace(/\/$/, '');
const API_BASE = BACKEND_API_URL.endsWith('/api') ? BACKEND_API_URL : `${BACKEND_API_URL}/api`;

export async function POST(request: NextRequest) {
  try {
    console.log('🔧 Upload API Route - POST request');
    
    const url = `${API_BASE}/upload`;
    
    // Get the FormData from the request
    const formData = await request.formData();
    
    console.log('🔗 Forwarding POST request to:', url);

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': request.headers.get('Authorization') || '',
        // Don't set Content-Type for FormData - let fetch handle it
      },
      body: formData,
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
          { error: 'Upload failed', message: errorText },
          { status: response.status }
        );
      }
    }

    const data = await response.json();
    console.log('✅ Upload API Route - POST request successful');
    
    return NextResponse.json(data);
  } catch (error) {
    console.error('❌ Upload API Route - POST error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Handle static file serving for uploads
export async function GET(request: NextRequest) {
  try {
    console.log('🔧 Upload API Route - GET request for static file');
    
    const { searchParams, pathname } = request.nextUrl;
    
    // Extract the file path (everything after /api/upload)
    const filePath = pathname.replace('/api/upload', '');
    
    if (!filePath || filePath === '/') {
      return NextResponse.json(
        { error: 'File path required' },
        { status: 400 }
      );
    }
    
    const url = `${API_BASE}/upload${filePath}${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;
    
    console.log('🔗 Forwarding GET request to:', url);

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': request.headers.get('Authorization') || '',
      },
    });

    console.log('📊 Backend response status:', response.status);

    if (!response.ok) {
      console.error('❌ Backend error response:', response.status, response.statusText);
      return NextResponse.json(
        { error: 'File not found' },
        { status: response.status }
      );
    }

    // Forward the file content with proper headers
    const contentType = response.headers.get('content-type') || 'application/octet-stream';
    const contentLength = response.headers.get('content-length');
    const arrayBuffer = await response.arrayBuffer();

    const headers: HeadersInit = {
      'Content-Type': contentType,
      'Cache-Control': 'public, max-age=31536000', // 1 year cache
    };

    if (contentLength) {
      headers['Content-Length'] = contentLength;
    }

    console.log('✅ Upload API Route - GET request successful');
    
    return new NextResponse(arrayBuffer, {
      status: 200,
      headers,
    });
  } catch (error) {
    console.error('❌ Upload API Route - GET error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
