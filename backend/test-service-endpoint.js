import { PrismaClient } from './generated/prisma/client.js';
import dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();

async function testServiceEndpoint() {
  try {
    console.log('🔍 Testing service endpoint structure...');
    
    // Test the exact query structure used in the endpoint
    console.log('📋 Checking all services...');
    const allServices = await prisma.service.findMany({
      take: 1,
      select: {
        id: true,
        available: true,
        deletedAt: true
      }
    });
    
    console.log(`Found ${allServices.length} services`);
    
    if (allServices.length === 0) {
      console.log('❌ No services found - running sample creation...');
      // Create a simple service
      const user = await prisma.user.upsert({
        where: { email: 'test@example.com' },
        update: {},
        create: {
          name: 'Test User',
          email: 'test@example.com',
          role: 'PROVIDER',
          password: 'test123'
        }
      });
      
      const translation = await prisma.service_translation.create({
        data: {
          name_en: 'Test Service',
          name_ar: 'خدمة تجريبية',
          description_en: 'A test service for API testing',
          description_ar: 'خدمة تجريبية لاختبار API'
        }
      });
      
      const service = await prisma.service.create({
        data: {
          ownerUserId: user.id,
          translationId: translation.id,
          price: 100.0,
          currency: 'EGP',
          durationMins: 30,
          city: 'Cairo',
          available: true,
          embeddingText: 'test service for API testing'
        }
      });
      
      console.log('✅ Created test service:', service.id);
      
      // Now test the full query
      const testService = await testServiceQuery(service.id);
      return testService;
    } else {
      const serviceId = allServices[0].id;
      console.log(`🧪 Testing with existing service: ${serviceId}`);
      const testService = await testServiceQuery(serviceId);
      return testService;
    }
    
  } catch (error) {
    console.error('❌ Error in test:', error);
    console.error('Error message:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

async function testServiceQuery(serviceId) {
  try {
    console.log(`📡 Testing service query for ID: ${serviceId}`);
    
    const service = await prisma.service.findUnique({
      where: { id: serviceId },
      select: {
        id: true,
        vid: true,
        translation: {
          select: {
            name_en: true,
            name_ar: true,
            description_en: true,
            description_ar: true
          }
        },
        price: true,
        currency: true,
        durationMins: true,
        city: true,
        locationLat: true,
        locationLon: true,
        available: true,
        createdAt: true,
        updatedAt: true,
        // Owner information
        ownerUser: {
          select: {
            id: true,
            name: true,
            profilePic: true,
            isVerified: true,
            phone: true,
            email: true,
            bio: true
          }
        },
        // Shop information (if service belongs to a shop)
        shop: {
          select: {
            id: true,
            name: true,
            slug: true,
            description: true,
            city: true,
            locationLat: true,
            locationLon: true,
            phone: true,
            isVerified: true,
            _count: {
              select: {
                services: true,
                products: true,
                reviews: true
              }
            }
          }
        },
        // Reviews for this service
        reviews: {
          select: {
            id: true,
            rating: true,
            comment: true,
            isVerified: true,
            createdAt: true,
            author: {
              select: {
                id: true,
                name: true,
                profilePic: true,
                isVerified: true
              }
            }
          },
          orderBy: {
            createdAt: 'desc'
          },
          take: 20 // Limit to 20 recent reviews
        },
        // Bookings count for this service
        _count: {
          select: {
            bookings: true,
            reviews: true
          }
        }
      }
    });
    
    if (service) {
      console.log('✅ Service query successful!');
      console.log('📊 Service data:', {
        id: service.id,
        name: service.translation?.name_en || 'Unknown',
        price: service.price,
        city: service.city,
        hasOwner: !!service.ownerUser,
        hasShop: !!service.shop,
        reviewCount: service._count?.reviews || 0
      });
      
      // Test the endpoint URL
      const endpointUrl = `https://api.daleelbalady.com/api/services/${service.id}`;
      console.log(`🌐 Test this endpoint: ${endpointUrl}`);
      
      return service;
    } else {
      console.log('❌ Service not found');
      return null;
    }
    
  } catch (error) {
    console.error('❌ Query error:', error);
    console.error('Error details:', error.message);
    return null;
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  testServiceEndpoint();
}

export { testServiceEndpoint };
