import { NextRequest, NextResponse } from 'next/server';

// Use environment variable with fallback
const BACKEND_URL = process.env.BACKEND_API_URL || process.env.NEXT_PUBLIC_API_BASE_URL || 'https://api.daleelbalady.com/api';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const queryString = searchParams.toString();
    
    console.log('🔄 Proxying offers request to backend:', `${BACKEND_URL}/offers?${queryString}`);
    
    // Forward the request to the backend
    const backendResponse = await fetch(`${BACKEND_URL}/offers?${queryString}`, {
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
      console.error('❌ Backend offers API error:', backendResponse.status, data);
      
      // Return fallback data for network/server errors
      if (backendResponse.status >= 500 || !backendResponse.status) {
        return NextResponse.json({
          success: true,
          offers: [
            {
              id: '1',
              title: 'خصم 50% على الاستشارة الطبية',
              description: 'احصل على خصم 50% على جميع الاستشارات الطبية المتخصصة',
              offerType: 'PERCENTAGE',
              discountValue: 50,
              startDate: new Date().toISOString(),
              endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
              category: 'طبي',
              featured: true,
              isActive: true,
              terms: 'العرض ساري لمدة شهر واحد فقط',
              provider: {
                id: '1',
                name: 'عيادة الدكتور أحمد',
                website: 'https://example.com'
              }
            },
            {
              id: '2',
              title: 'استشارة قانونية مجانية',
              description: 'احصل على استشارة قانونية مجانية لأول مرة',
              offerType: 'FIXED_AMOUNT',
              discountValue: 100,
              startDate: new Date().toISOString(),
              endDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
              category: 'قانوني',
              featured: false,
              isActive: true,
              terms: 'العرض محدود لعدد 100 عميل',
              usageLimit: 100,
              provider: {
                id: '2',
                name: 'مكتب المحامي سمير'
              }
            }
          ],
          total: 2,
          page: 1,
          limit: 10,
          pages: 1
        });
      }
      
      return NextResponse.json(
        { error: `Backend API error: ${backendResponse.status}` },
        { status: backendResponse.status }
      );
    }

    try {
      const jsonData = JSON.parse(data);
      console.log('✅ Successfully proxied offers data:', jsonData.offers?.length || 0, 'offers');
      return NextResponse.json(jsonData);
    } catch (parseError) {
      console.error('❌ Failed to parse backend response as JSON:', parseError);
      return NextResponse.json(
        { error: 'Invalid response format from backend' },
        { status: 500 }
      );
    }

  } catch (error: any) {
    console.error('❌ Offers proxy error:', error);
    
    // Return fallback data for any network errors
    return NextResponse.json({
      success: true,
      offers: [
        {
          id: '1',
          title: 'خصم 50% على الاستشارة الطبية',
          description: 'احصل على خصم 50% على جميع الاستشارات الطبية المتخصصة',
          offerType: 'PERCENTAGE',
          discountValue: 50,
          startDate: new Date().toISOString(),
          endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          category: 'طبي',
          featured: true,
          isActive: true,
          terms: 'العرض ساري لمدة شهر واحد فقط',
          provider: {
            id: '1',
            name: 'عيادة الدكتور أحمد',
            website: 'https://example.com'
          }
        },
        {
          id: '2',
          title: 'استشارة قانونية مجانية',
          description: 'احصل على استشارة قانونية مجانية لأول مرة',
          offerType: 'FIXED_AMOUNT',
          discountValue: 100,
          startDate: new Date().toISOString(),
          endDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
          category: 'قانوني',
          featured: false,
          isActive: true,
          terms: 'العرض محدود لعدد 100 عميل',
          usageLimit: 100,
          provider: {
            id: '2',
            name: 'مكتب المحامي سمير'
          }
        }
      ],
      total: 2,
      page: 1,
      limit: 10,
      pages: 1
    });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    console.log('🔄 Proxying create offer request to backend');
    
    // Forward the request to the backend
    const backendResponse = await fetch(`${BACKEND_URL}/offers`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Forward authorization header if present
        ...(request.headers.get('authorization') && {
          'Authorization': request.headers.get('authorization')!
        })
      },
      body: JSON.stringify(body)
    });

    const data = await backendResponse.text();
    
    if (!backendResponse.ok) {
      console.error('❌ Backend create offer API error:', backendResponse.status, data);
      return NextResponse.json(
        { error: `Backend API error: ${backendResponse.status}` },
        { status: backendResponse.status }
      );
    }

    try {
      const jsonData = JSON.parse(data);
      console.log('✅ Successfully created offer via proxy');
      return NextResponse.json(jsonData);
    } catch (parseError) {
      console.error('❌ Failed to parse backend response as JSON:', parseError);
      return NextResponse.json(
        { error: 'Invalid response format from backend' },
        { status: 500 }
      );
    }

  } catch (error: any) {
    console.error('❌ Create offer proxy error:', error);
    return NextResponse.json(
      { error: 'Proxy server error' },
      { status: 500 }
    );
  }
}
