import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = 'https://api.daleelbalady.com/api';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: offerId } = await params;
  
  try {
    console.log('🔄 Proxying offer view counter request to backend:', `${BACKEND_URL}/offers/${offerId}/view`);
    
    // Get request body if any
    let body = null;
    try {
      body = await request.json();
    } catch {
      // No body or invalid JSON, that's fine for view counter
      body = {};
    }
    
    // Forward the request to the backend
    const backendResponse = await fetch(`${BACKEND_URL}/offers/${offerId}/view`, {
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
      console.error('❌ Backend offer view counter API error:', backendResponse.status, data);
      
      // For view counter, we can be graceful about failures
      // Return success even if backend fails to avoid breaking UX
      if (backendResponse.status === 404) {
        console.warn('⚠️ Offer view endpoint not found on backend, returning success');
        return NextResponse.json({ success: true, message: 'View recorded (local fallback)' });
      }
      
      if (backendResponse.status >= 500) {
        console.warn('⚠️ Backend server error for view counter, returning success');
        return NextResponse.json({ success: true, message: 'View recorded (fallback)' });
      }
      
      return NextResponse.json(
        { error: `Backend API error: ${backendResponse.status}` },
        { status: backendResponse.status }
      );
    }

    try {
      const jsonData = JSON.parse(data);
      console.log('✅ Successfully proxied offer view counter for ID:', offerId);
      return NextResponse.json(jsonData);
    } catch (parseError) {
      console.warn('⚠️ Failed to parse backend response, assuming success');
      return NextResponse.json({ success: true, message: 'View recorded' });
    }

  } catch (error: any) {
    console.error('❌ Offer view counter proxy error:', error);
    
    // For view counter, always return success to avoid breaking UX
    return NextResponse.json({ 
      success: true, 
      message: 'View recorded (network error fallback)' 
    });
  }
}
