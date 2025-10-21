import { NextRequest, NextResponse } from 'next/server';

const BACKEND_API_URL = process.env.BACKEND_API_URL || 'https://api.daleelbalady.com';

export async function GET(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  try {
    console.log('🔧 Uploads API Route - GET request for file:', params.path);
    
    const filePath = params.path.join('/');
    const url = `${BACKEND_API_URL}/uploads/${filePath}`;
    
    console.log('🔗 Forwarding GET request to:', url);

    const response = await fetch(url, {
      method: 'GET',
      // No authorization needed for public file access
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
      'Cache-Control': 'public, max-age=31536000, immutable', // 1 year cache for static files
    };

    if (contentLength) {
      headers['Content-Length'] = contentLength;
    }

    console.log('✅ Uploads API Route - GET request successful for file:', filePath);
    
    return new NextResponse(arrayBuffer, {
      status: 200,
      headers,
    });
  } catch (error) {
    console.error('❌ Uploads API Route - GET error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
