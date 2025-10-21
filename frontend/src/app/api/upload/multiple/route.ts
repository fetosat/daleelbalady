import { NextRequest, NextResponse } from 'next/server';

const BACKEND_API_URL = (process.env.BACKEND_API_URL || 'https://api.daleelbalady.com').replace(/\/$/, '');
const API_BASE = BACKEND_API_URL.endsWith('/api') ? BACKEND_API_URL : `${BACKEND_API_URL}/api`;

export async function POST(request: NextRequest) {
  try {
    console.log('🔧 Multiple Upload API Route - POST request');
    
    const url = `${API_BASE}/upload/multiple`;
    
    // Get the FormData from the request
    const formData = await request.formData();
    
    console.log('🔗 Forwarding POST request to:', url);
    console.log('📁 Files in FormData:', formData.getAll('files').length);

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
    console.log('✅ Multiple Upload API Route - POST request successful');
    console.log('📦 Uploaded files:', data.files?.length || 0);
    
    return NextResponse.json(data);
  } catch (error) {
    console.error('❌ Multiple Upload API Route - POST error:', error);
    return NextResponse.json(
      { error: 'Internal server error', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

