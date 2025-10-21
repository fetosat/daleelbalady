import { NextRequest, NextResponse } from 'next/server';

const BACKEND_API_URL = process.env.BACKEND_API_URL || 'https://api.daleelbalady.com';

export async function GET(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  try {
    console.log('🔧 Chats API Route - GET request for:', params.path);
    
    const path = params.path.join('/');
    const searchParams = request.nextUrl.searchParams.toString();
    const url = `${BACKEND_API_URL}/chats/${path}${searchParams ? `?${searchParams}` : ''}`;
    
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
    console.log('✅ Chats API Route - GET request successful');
    
    return NextResponse.json(data);
  } catch (error) {
    console.error('❌ Chats API Route - GET error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  try {
    console.log('🔧 Chats API Route - POST request for:', params.path);
    
    const path = params.path.join('/');
    const url = `${BACKEND_API_URL}/chats/${path}`;
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
    console.log('✅ Chats API Route - POST request successful');
    
    return NextResponse.json(data);
  } catch (error) {
    console.error('❌ Chats API Route - POST error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  try {
    console.log('🔧 Chats API Route - PUT request for:', params.path);
    
    const path = params.path.join('/');
    const url = `${BACKEND_API_URL}/chats/${path}`;
    const body = await request.text();
    
    console.log('🔗 Forwarding PUT request to:', url);

    const response = await fetch(url, {
      method: 'PUT',
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
    console.log('✅ Chats API Route - PUT request successful');
    
    return NextResponse.json(data);
  } catch (error) {
    console.error('❌ Chats API Route - PUT error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  try {
    console.log('🔧 Chats API Route - DELETE request for:', params.path);
    
    const path = params.path.join('/');
    const url = `${BACKEND_API_URL}/chats/${path}`;
    const body = await request.text();
    
    console.log('🔗 Forwarding DELETE request to:', url);

    const response = await fetch(url, {
      method: 'DELETE',
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

    // DELETE may return empty response
    const text = await response.text();
    const data = text ? JSON.parse(text) : {};
    console.log('✅ Chats API Route - DELETE request successful');
    
    return NextResponse.json(data);
  } catch (error) {
    console.error('❌ Chats API Route - DELETE error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
