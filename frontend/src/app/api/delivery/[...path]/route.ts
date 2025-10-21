import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.daleelbalady.com/api';

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
  const backendUrl = `${BACKEND_URL}/delivery/${apiPath}`;

  try {
    // Handle JSON body for non-GET
    let body: any = null;
    let headers: Record<string, string> = {};

    // For multipart/form-data we must forward the original body without setting Content-Type
    const contentType = request.headers.get('content-type') || '';
    const isMultipart = contentType.includes('multipart/form-data');

    if (!isMultipart && ['POST', 'PUT', 'PATCH'].includes(method)) {
      try { body = await request.json(); } catch {}
      headers['Content-Type'] = 'application/json';
    }

    // Forward auth header if present
    const auth = request.headers.get('authorization');
    if (auth) headers['Authorization'] = auth;

    // Preserve query string
    const { searchParams } = new URL(request.url);
    const qs = searchParams.toString();
    const fullUrl = qs ? `${backendUrl}?${qs}` : backendUrl;

    const backendResponse = await fetch(fullUrl, {
      method,
      headers,
      body: isMultipart ? (request as any).body : (body ? JSON.stringify(body) : undefined),
    });

    const text = await backendResponse.text();
    if (!backendResponse.ok) {
      try { return NextResponse.json(JSON.parse(text), { status: backendResponse.status }); }
      catch { return NextResponse.json({ error: 'Backend error' }, { status: backendResponse.status }); }
    }

    try { return NextResponse.json(JSON.parse(text)); }
    catch {
      return new NextResponse(text, {
        status: backendResponse.status,
        headers: { 'Content-Type': backendResponse.headers.get('Content-Type') || 'text/plain' },
      });
    }
  } catch (err: any) {
    return NextResponse.json({ error: 'Proxy server error', message: err.message }, { status: 500 });
  }
}

