import { NextRequest, NextResponse } from 'next/server';
import { BACKEND_URL, createBackendUrl, getCommonHeaders } from '../../../lib/backendConfig';

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
  
  // Skip if this is already handled by more specific routes
  if (apiPath.startsWith('offers') || apiPath.startsWith('auth') || apiPath.startsWith('dashboard') || apiPath.startsWith('products')) {
    return NextResponse.json(
      { error: 'Route should be handled by specific API route' },
      { status: 404 }
    );
  }
  
  const backendUrl = createBackendUrl(apiPath);
  
  try {
    console.log(`🔄 Proxying ${method} request to backend:`, backendUrl);
    
    // Get request body if it exists
    let body = null;
    let headers = getCommonHeaders(request);
    
    if (['POST', 'PUT', 'PATCH'].includes(method)) {
      const contentType = request.headers.get('content-type');
      
      if (contentType?.includes('multipart/form-data')) {
        // Handle FormData
        body = await request.formData();
        // Don't set Content-Type for FormData, let fetch handle it
      } else {
        // Handle JSON
        try {
          body = await request.json();
          headers['Content-Type'] = 'application/json';
        } catch {
          // No body or invalid JSON, that's okay
        }
      }
    }
    
    // Get search params
    const { searchParams } = new URL(request.url);
    const queryString = searchParams.toString();
    const fullUrl = queryString ? `${backendUrl}?${queryString}` : backendUrl;
    
    // Forward the request to the backend
    const backendResponse = await fetch(fullUrl, {
      method,
      headers,
      ...(body && { body: body instanceof FormData ? body : JSON.stringify(body) }),
    });

    const responseText = await backendResponse.text();
    
    if (!backendResponse.ok) {
      console.error(`❌ Backend API error:`, backendResponse.status, responseText);
      
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
      console.log(`✅ Successfully proxied ${method} request for:`, apiPath);
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
    console.error(`❌ API proxy error for ${method} ${apiPath}:`, error);
    
    return NextResponse.json(
      { error: 'Proxy server error', message: error.message },
      { status: 500 }
    );
  }
}
