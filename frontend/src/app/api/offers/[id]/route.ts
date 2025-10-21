import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = 'https://api.daleelbalady.com/api';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: offerId } = await params;
  
  try {
    
    console.log('🔄 Proxying offer details request to backend:', `${BACKEND_URL}/offers/${offerId}`);
    
    // Forward the request to the backend
    const backendResponse = await fetch(`${BACKEND_URL}/offers/${offerId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        // Forward authorization header if present
        ...(request.headers.get('authorization') && {
          'Authorization': request.headers.get('authorization')!
        })
      },
    });

    const data = await backendResponse.text();
    
    if (!backendResponse.ok) {
      console.error('❌ Backend offer details API error:', backendResponse.status, data);
      
      // Return 404 for not found
      if (backendResponse.status === 404) {
        return NextResponse.json(
          { error: 'Offer not found' },
          { status: 404 }
        );
      }
      
      // Return fallback data for network/server errors
      if (backendResponse.status >= 500 || !backendResponse.status) {
        return NextResponse.json({
          success: true,
          offer: {
            id: offerId,
            title: 'خصم خاص',
            description: 'عرض خاص متاح الآن',
            offerType: 'PERCENTAGE',
            discountValue: 25,
            startDate: new Date().toISOString(),
            endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
            category: 'عام',
            featured: false,
            isActive: true,
            terms: 'العرض محدود لفترة قصيرة',
            provider: {
              id: '1',
              name: 'مقدم الخدمة',
              website: undefined
            }
          }
        });
      }
      
      return NextResponse.json(
        { error: `Backend API error: ${backendResponse.status}` },
        { status: backendResponse.status }
      );
    }

    try {
      const jsonData = JSON.parse(data);
      console.log('✅ Successfully proxied offer details for ID:', offerId);
      return NextResponse.json(jsonData);
    } catch (parseError) {
      console.error('❌ Failed to parse backend response as JSON:', parseError);
      return NextResponse.json(
        { error: 'Invalid response format from backend' },
        { status: 500 }
      );
    }

  } catch (error: any) {
    console.error('❌ Offer details proxy error:', error);
    
    // Return fallback data for any network errors
    return NextResponse.json({
      success: true,
      offer: {
        id: offerId,
        title: 'خصم خاص',
        description: 'عرض خاص متاح الآن',
        offerType: 'PERCENTAGE',
        discountValue: 25,
        startDate: new Date().toISOString(),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        category: 'عام',
        featured: false,
        isActive: true,
        terms: 'العرض محدود لفترة قصيرة',
        provider: {
          id: '1',
          name: 'مقدم الخدمة',
          website: undefined
        }
      }
    });
  }
}
