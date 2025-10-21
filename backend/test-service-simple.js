import { PrismaClient } from './generated/prisma/client.js';
import dotenv from 'dotenv';

dotenv.config();
const prisma = new PrismaClient();

// Helper function to format duration from minutes to a readable string
const formatDuration = (durationMins) => {
  if (!durationMins) return null;
  const hours = Math.floor(durationMins / 60);
  const minutes = durationMins % 60;
  if (hours && minutes) return `${hours}h ${minutes}m`;
  if (hours) return `${hours}h`;
  return `${minutes}m`;
};

async function testService() {
  try {
    console.log('🔍 Testing service endpoint query...');
    
    // First, get any available service
    const services = await prisma.service.findMany({
      take: 1,
      select: { id: true, translation: true }
    });
    
    if (services.length === 0) {
      console.log('❌ No services found. Please run the test-add-service.js first.');
      return;
    }
    
    const serviceId = services[0].id;
    console.log(`🧪 Testing service ID: ${serviceId}`);
    
    // Test the exact query from our endpoint
    const service = await prisma.service.findUnique({
      where: { id: serviceId },
      include: {
        translation: true,
        design: {
          select: {
            id: true,
            name: true,
            description: true,
            slug: true
          }
        },
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
            description: true
          }
        },
        subCategory: {
          select: {
            id: true,
            name: true,
            slug: true
          }
        },
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
        reviews: {
          include: {
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
          take: 20
        },
        _count: {
          select: {
            bookings: true,
            reviews: true
          }
        }
      }
    });

    if (!service) {
      console.log('❌ Service not found in detailed query');
      return;
    }

    console.log('✅ Service query successful!');
    
    // Calculate stats like the endpoint does
    const totalReviews = service._count.reviews;
    const avgRating = service.reviews.length > 0 
      ? service.reviews.reduce((sum, review) => sum + review.rating, 0) / service.reviews.length 
      : 0;

    // Format reviews like the endpoint does
    const formattedReviews = service.reviews.map(review => ({
      ...review,
      user: review.author
    }));

    // Prepare the final response object
    const serviceData = {
      id: service.id,
      vid: service.vid,
      name: service.translation?.name_en || service.translation?.name_ar || 'Unknown Service',
      description: service.translation?.description_en || service.translation?.description_ar || '',
      translation: service.translation,
      price: service.price,
      currency: service.currency || 'EGP',
      duration: formatDuration(service.durationMins),
      durationMins: service.durationMins,
      city: service.city,
      locationLat: service.locationLat,
      locationLon: service.locationLon,
      available: service.available,
      isVerified: service.ownerUser?.isVerified || service.shop?.isVerified || false,
      verifiedBadge: service.ownerUser?.isVerified ? 'verified' : null,
      createdAt: service.createdAt.toISOString(),
      updatedAt: service.updatedAt.toISOString(),
      reviews: formattedReviews,
      avgRating: Math.round(avgRating * 10) / 10,
      reviewsCount: totalReviews,
      
      // Design system - Critical for frontend rendering logic
      design: service.design,
      
      // Category information
      category: service.category?.length > 0 ? service.category[0] : null,
      subCategory: service.subCategory?.length > 0 ? service.subCategory[0] : null,
      
      // Provider information
      ownerUser: service.ownerUser,
      
      // Shop information
      shop: service.shop,
      
      // Enhanced metadata that matches frontend expectations
      priority: service.design?.slug === 'medical' ? 8 : 5, // Numeric priority for PriorityIndicator component
      filterTags: [],
      isRecommended: avgRating >= 4.5,
      metadata: {
        specialty: service.category?.length > 0 ? service.category[0].name : null,
        availability: service.available ? 'available' : 'unavailable',
        price: service.price ? `${service.price} ${service.currency || 'EGP'}` : null,
        isRecommended: avgRating >= 4.5,
        isVerified: service.ownerUser?.isVerified || service.shop?.isVerified || false,
        categoryCode: service.category?.length > 0 ? service.category[0].slug : null,
        designSlug: service.design?.slug
      },
      
      // Statistics that frontend expects
      stats: {
        totalBookings: service._count.bookings,
        avgRating: Math.round(avgRating * 10) / 10,
        totalReviews: totalReviews,
        availability: service.available ? 'Available' : 'Unavailable',
        isVerified: service.ownerUser?.isVerified || service.shop?.isVerified || false,
        memberSince: service.createdAt.toISOString()
      }
    };

    console.log('\n📋 Service Data Structure:');
    console.log('- ID:', serviceData.id);
    console.log('- Name:', serviceData.name);
    console.log('- Design Slug:', serviceData.design?.slug || 'No design');
    console.log('- Category:', serviceData.category?.name || 'No category');
    console.log('- Is Medical:', serviceData.design?.slug === 'medical');
    console.log('- Provider:', serviceData.ownerUser?.name || 'No user');
    console.log('- Shop:', serviceData.shop?.name || 'No shop');
    console.log('- Reviews:', serviceData.reviewsCount);
    console.log('- Rating:', serviceData.avgRating);
    console.log('- Verified:', serviceData.isVerified);

    // Test URL
    console.log(`\n🌐 Test this endpoint: https://api.daleelbalady.com/api/services/${service.id}`);
    
    console.log('\n✅ All tests passed! The endpoint should work correctly.');
    
    return serviceData;
    
  } catch (error) {
    console.error('❌ Test failed:', error);
    console.error('Error details:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the test
testService();
