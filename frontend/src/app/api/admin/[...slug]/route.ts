import { NextRequest, NextResponse } from 'next/server';

const BACKEND_API_URL = process.env.BACKEND_API_URL || 'https://api.daleelbalady.com';

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string[] } }
) {
  try {
    console.log('🔧 Admin API Route - GET request for:', params.slug);
    
    const slug = params.slug.join('/');
    const searchParams = request.nextUrl.searchParams.toString();
    const url = `${BACKEND_API_URL}/api/admin/${slug}${searchParams ? `?${searchParams}` : ''}`;
    
    console.log('🔗 Forwarding GET request to:', url);

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': request.headers.get('Authorization') || '',
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    });

    console.log('📊 Backend response status:', response.status);

    if (!response.ok) {
      console.error('❌ Backend error response:', response.status, response.statusText);
      return NextResponse.json(
        { error: 'Backend request failed', status: response.status },
        { status: response.status }
      );
    }

    const data = await response.json();
    console.log('✅ Admin API Route - GET request successful');
    
    return NextResponse.json(data);
  } catch (error) {
    console.error('❌ Admin API Route - GET error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { slug: string[] } }
) {
  try {
    console.log('🔧 Admin API Route - POST request for:', params.slug);
    
    const slug = params.slug.join('/');
    const url = `${BACKEND_API_URL}/api/admin/${slug}`;
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
    console.log('✅ Admin API Route - POST request successful');
    
    return NextResponse.json(data);
  } catch (error) {
    console.error('❌ Admin API Route - POST error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { slug: string[] } }
) {
  try {
    console.log('🔧 Admin API Route - PATCH request for:', params.slug);
    
    const slug = params.slug.join('/');
    const url = `${BACKEND_API_URL}/api/admin/${slug}`;
    const body = await request.text();
    
    console.log('🔗 Forwarding PATCH request to:', url);

    const response = await fetch(url, {
      method: 'PATCH',
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
    console.log('✅ Admin API Route - PATCH request successful');
    
    return NextResponse.json(data);
  } catch (error) {
    console.error('❌ Admin API Route - PATCH error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { slug: string[] } }
) {
  try {
    console.log('🔧 Admin API Route - DELETE request for:', params.slug);
    
    const slug = params.slug.join('/');
    const url = `${BACKEND_API_URL}/api/admin/${slug}`;
    
    console.log('🔗 Forwarding DELETE request to:', url);

    const response = await fetch(url, {
      method: 'DELETE',
      headers: {
        'Authorization': request.headers.get('Authorization') || '',
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
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
    console.log('✅ Admin API Route - DELETE request successful');
    
    return NextResponse.json(data);
  } catch (error) {
    console.error('❌ Admin API Route - DELETE error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
