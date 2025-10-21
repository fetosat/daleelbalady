import { NextRequest, NextResponse } from 'next/server';
import { BACKEND_URL, createBackendUrl, getCommonHeaders } from '../../../../lib/backendConfig';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  return handleRequest(request, await params, 'GET');
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  return handleRequest(request, await params, 'POST');
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  return handleRequest(request, await params, 'PUT');
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  return handleRequest(request, await params, 'PATCH');
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  return handleRequest(request, await params, 'DELETE');
}

async function handleRequest(
  request: NextRequest,
  params: { path: string[] },
  method: string
) {
  const { path } = params;
  const apiPath = path.join('/');
  const backendUrl = createBackendUrl(`auth/${apiPath}`);
  
  try {
    console.log(`🔄 Proxying ${method} request to backend:`, backendUrl);
    
    // Get request body if it exists
    let body = null;
    if (['POST', 'PUT', 'PATCH'].includes(method)) {
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
      headers: getCommonHeaders(request),
      ...(body && { body: JSON.stringify(body) }),
    });

    const responseText = await backendResponse.text();
    
    if (!backendResponse.ok) {
      console.error(`❌ Backend auth API error:`, backendResponse.status, responseText);
      
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
      console.log(`✅ Successfully proxied ${method} auth request for:`, apiPath);
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
    console.error(`❌ Auth proxy error for ${method} ${apiPath}:`, error);
    
    return NextResponse.json(
      { error: 'Proxy server error', message: error.message },
      { status: 500 }
    );
  }
}
