import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = 'https://api.daleelbalady.com/api';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: offerId } = await params;
  
  try {
    console.log('🔄 Proxying offer click counter request to backend:', `${BACKEND_URL}/offers/${offerId}/click`);
    
    // Get request body if any
    let body = null;
    try {
      body = await request.json();
    } catch {
      // No body or invalid JSON, that's fine for click counter
      body = {};
    }
    
    // Forward the request to the backend
    const backendResponse = await fetch(`${BACKEND_URL}/offers/${offerId}/click`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Forward authorization header if present
        ...(request.headers.get('authorization') && {
          'Authorization': request.headers.get('authorization')!
        })
      },
      body: JSON.stringify(body),
    });

    const data = await backendResponse.text();
    
    if (!backendResponse.ok) {
      console.error('❌ Backend offer click counter API error:', backendResponse.status, data);
      
      // For click counter, we can be graceful about failures
      // Return success even if backend fails to avoid breaking UX
      if (backendResponse.status === 404) {
        console.warn('⚠️ Offer click endpoint not found on backend, returning success');
        return NextResponse.json({ success: true, message: 'Click recorded (local fallback)' });
      }
      
      if (backendResponse.status >= 500) {
        console.warn('⚠️ Backend server error for click counter, returning success');
        return NextResponse.json({ success: true, message: 'Click recorded (fallback)' });
      }
      
      return NextResponse.json(
        { error: `Backend API error: ${backendResponse.status}` },
        { status: backendResponse.status }
      );
    }

    try {
      const jsonData = JSON.parse(data);
      console.log('✅ Successfully proxied offer click counter for ID:', offerId);
      return NextResponse.json(jsonData);
    } catch (parseError) {
      console.warn('⚠️ Failed to parse backend response, assuming success');
      return NextResponse.json({ success: true, message: 'Click recorded' });
    }

  } catch (error: any) {
    console.error('❌ Offer click counter proxy error:', error);
    
    // For click counter, always return success to avoid breaking UX
    return NextResponse.json({ 
      success: true, 
      message: 'Click recorded (network error fallback)' 
    });
  }
}
