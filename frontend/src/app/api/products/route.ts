import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = 'https://api.daleelbalady.com/api';

export async function GET(request: NextRequest) {
  return handleRequest(request, 'GET');
}

export async function POST(request: NextRequest) {
  return handleRequest(request, 'POST');
}

async function handleRequest(request: NextRequest, method: string) {
  const backendUrl = `${BACKEND_URL}/products`;
  
  try {
    console.log(`🔄 Proxying ${method} products base request to backend:`, backendUrl);
    
    // Get request body if it exists
    let body = null;
    if (method === 'POST') {
      try {
        body = await request.json();
      } catch {
        // No body or invalid JSON, that's okay
      }
    }
    
    // Get search params
    const { searchParams } = new URL(request.url);
    const queryString = searchParams.toString();
    const fullUrl = queryString ? `${backendUrl}?${queryString}` : backendUrl;
    
    // Forward the request to the backend
    const backendResponse = await fetch(fullUrl, {
      method,
      headers: {
        'Content-Type': 'application/json',
        // Forward authorization header if present
        ...(request.headers.get('authorization') && {
          'Authorization': request.headers.get('authorization')!
        }),
        // Forward other relevant headers
        ...(request.headers.get('user-agent') && {
          'User-Agent': request.headers.get('user-agent')!
        })
      },
      ...(body && { body: JSON.stringify(body) }),
    });

    const responseText = await backendResponse.text();
    
    if (!backendResponse.ok) {
      console.error(`❌ Backend products base API error:`, backendResponse.status, responseText);
      
      // Forward the error response with the same status code
      try {
        const errorData = JSON.parse(responseText);
        return NextResponse.json(errorData, { status: backendResponse.status });
      } catch {
        return NextResponse.json(
          { error: `Backend API error: ${backendResponse.status}` },
          { status: backendResponse.status }
        );
      }
    }

    try {
      const data = JSON.parse(responseText);
      console.log(`✅ Successfully proxied ${method} products base request`);
      return NextResponse.json(data);
    } catch {
      // Response might not be JSON (e.g., plain text)
      return new NextResponse(responseText, {
        status: backendResponse.status,
        headers: {
          'Content-Type': backendResponse.headers.get('Content-Type') || 'text/plain',
        },
      });
    }

  } catch (error: any) {
    console.error(`❌ Products base proxy error for ${method}:`, error);
    
    return NextResponse.json(
      { error: 'Proxy server error', message: error.message },
      { status: 500 }
    );
  }
}
