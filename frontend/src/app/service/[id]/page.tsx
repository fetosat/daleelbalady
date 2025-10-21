import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import ClientWrapper from './ClientWrapper';

// Force dynamic rendering to avoid build-time API calls
export const dynamic = 'force-dynamic';
export const dynamicParams = true;

interface ServiceData {
  id: string;
  name: string;
  description?: string;
  translation?: {
    name_en?: string;
    name_ar?: string;
    description_en?: string;
    description_ar?: string;
  };
  price?: number;
  currency?: string;
  duration?: string;
  durationMins?: number;
  city?: string;
  locationLat?: number;
  locationLon?: number;
  isVerified?: boolean;
  verifiedBadge?: string;
  createdAt: string;
  reviews: any[];
  avgRating?: number;
  reviewsCount?: number;
  design?: {
    id: string;
    name: string;
    description: string;
    slug: string;
  };
  ownerUser?: {
    id: string;
    name: string;
    profilePic?: string;
    isVerified: boolean;
    phone?: string;
    email?: string;
    bio?: string;
  };
  shop?: {
    id: string;
    name: string;
    slug?: string;
    description?: string;
    city?: string;
    locationLat?: number;
    locationLon?: number;
    phone?: string;
    isVerified?: boolean;
  };
  category?: {
    en: string;
    ar: string;
  };
  priority?: number;
  filterTags?: string[];
  metadata?: {
    specialty?: string;
    availability?: string;
    price?: string;
    isRecommended?: boolean;
    isVerified?: boolean;
    categoryCode?: string;
  };
  stats: {
    totalBookings: number;
    avgRating: number;
    totalReviews: number;
    availability: string;
    isVerified: boolean;
    memberSince: string;
  };
}

async function fetchService(id: string): Promise<ServiceData | null> {
  try {
    console.log('Fetching service with ID:', id);
    const response = await fetch(`https://api.daleelbalady.com/api/services/${id}`, {
      next: { revalidate: 300 } // Revalidate every 5 minutes
    });
    
    console.log('Service fetch response status:', response.status);
    
    if (!response.ok) {
      console.error('Service fetch failed:', response.status, response.statusText);
      
      // For development, return mock data if API fails
      if (process.env.NODE_ENV === 'development') {
        return createMockServiceData(id);
      }
      
      return null;
    }
    
    const data = await response.json();
    console.log('Service fetch data:', data);
    
    if (data.success && data.service) {
      return data.service;
    }
    
    // If API returns unsuccessful, return mock data for development
    if (process.env.NODE_ENV === 'development') {
      return createMockServiceData(id);
    }
    
    return null;
  } catch (error) {
    console.error('Error fetching service:', error);
    
    // For development, return mock data if API fails
    if (process.env.NODE_ENV === 'development') {
      return createMockServiceData(id);
    }
    
    return null;
  }
}

// Mock service data for development
function createMockServiceData(id: string): ServiceData {
  return {
    id,
    name: 'Dr. Ahmed Hassan - Cardiologist',
    description: 'Experienced cardiologist with over 15 years of practice in heart disease treatment and prevention.',
    translation: {
      name_en: 'Dr. Ahmed Hassan - Cardiologist',
      name_ar: 'د. أحمد حسن - أخصائي القلب',
      description_en: 'Experienced cardiologist with over 15 years of practice in heart disease treatment and prevention.',
      description_ar: 'أخصائي قلب ذو خبرة تزيد عن 15 عاماً في علاج ومنع أمراض القلب.'
    },
    price: 500,
    currency: 'EGP',
    duration: '45 minutes',
    durationMins: 45,
    city: 'Cairo',
    locationLat: 30.0444,
    locationLon: 31.2357,
    isVerified: true,
    verifiedBadge: 'Medical Board Certified',
    createdAt: new Date().toISOString(),
    reviews: [
      {
        id: 'review1',
        rating: 5,
        comment: 'Excellent doctor, very professional and caring.',
        user: { id: 'user1', name: 'Patient A', isVerified: true },
        createdAt: new Date().toISOString()
      },
      {
        id: 'review2', 
        rating: 5,
        comment: 'Highly recommend Dr. Hassan for heart problems.',
        user: { id: 'user2', name: 'Patient B', isVerified: true },
        createdAt: new Date().toISOString()
      }
    ],
    avgRating: 4.9,
    reviewsCount: 127,
    design: {
      id: 'design1',
      name: 'Medical Service',
      description: 'Professional medical service template',
      slug: 'medical'
    },
    ownerUser: {
      id: 'user123',
      name: 'Dr. Ahmed Hassan',
      profilePic: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=150&h=150&fit=crop&crop=face',
      isVerified: true,
      phone: '+20123456789',
      email: 'dr.hassan@example.com',
      bio: 'Senior Cardiologist at Cairo Heart Institute'
    },
    shop: {
      id: 'shop1',
      name: 'Cairo Heart Center',
      slug: 'cairo-heart-center',
      description: 'Leading cardiac care facility in Egypt',
      city: 'Cairo',
      locationLat: 30.0444,
      locationLon: 31.2357,
      phone: '+20223456789',
      isVerified: true
    },
    category: {
      en: 'Healthcare',
      ar: 'الرعاية الصحية'
    },
    priority: 4,
    filterTags: ['cardiology', 'heart', 'healthcare', 'medical', 'doctor'],
    metadata: {
      specialty: 'Cardiology & Heart Surgery',
      availability: 'available',
      price: '500 EGP',
      isRecommended: true,
      isVerified: true,
      categoryCode: 'healthcare'
    },
    stats: {
      totalBookings: 850,
      avgRating: 4.9,
      totalReviews: 127,
      availability: 'Available',
      isVerified: true,
      memberSince: '2018-01-01'
    }
  };
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const service = await fetchService(id);
  
  if (!service) {
    return {
      title: 'Service Not Found - Daleel Balady',
      description: 'The requested service could not be found.',
    };
  }

  // Get localized content
  const name = service.translation?.name_en || service.name;
  const nameAr = service.translation?.name_ar || service.name;
  const description = service.translation?.description_en || service.description || '';
  const descriptionAr = service.translation?.description_ar || service.description || '';

  // Format price for display
  const priceText = service.price ? 
    (service.price === 0 ? 'Free' : `${service.currency || 'EGP'} ${service.price}`) : 
    '';

  // Create SEO-optimized title and description
  const seoTitle = `${name}${service.city ? ` in ${service.city}` : ''}${priceText ? ` - ${priceText}` : ''} | Daleel Balady`;
  const seoDescription = description || 
    `Find ${name}${service.city ? ` in ${service.city}` : ''}. ${service.ownerUser?.name ? `Provided by ${service.ownerUser.name}` : ''}${service.avgRating ? ` - Rated ${service.avgRating}/5 stars` : ''}${service.reviewsCount ? ` based on ${service.reviewsCount} reviews` : ''}.`;

  // Create Open Graph images URL (you might want to generate dynamic images)
  const ogImageUrl = `https://daleelbalady.com/api/og/service/${id}`;

  return {
    title: seoTitle,
    description: seoDescription.slice(0, 160), // Keep under 160 chars for SEO
    keywords: [
      name,
      nameAr,
      service.city,
      service.category?.en,
      service.category?.ar,
      ...(service.filterTags || []),
      'service provider',
      'daleel balady'
    ].filter(Boolean).join(', '),
    
    openGraph: {
      title: seoTitle,
      description: seoDescription.slice(0, 200),
      url: `https://daleelbalady.com/service/${id}`,
      siteName: 'Daleel Balady',
      locale: 'en_US',
      alternateLocale: 'ar_EG',
      type: 'website',
      images: [
        {
          url: ogImageUrl,
          width: 1200,
          height: 630,
          alt: name,
        }
      ],
    },
    
    twitter: {
      card: 'summary_large_image',
      title: seoTitle,
      description: seoDescription.slice(0, 200),
      images: [ogImageUrl],
    },
    
    alternates: {
      canonical: `https://daleelbalady.com/service/${id}`,
    },
    
    other: {
      'application-name': 'Daleel Balady',
      'og:price:amount': service.price?.toString() || '',
      'og:price:currency': service.currency || 'EGP',
      'product:availability': service.metadata?.availability || 'in stock',
      'business:contact_data:locality': service.city || '',
      'business:contact_data:phone_number': service.ownerUser?.phone || service.shop?.phone || '',
    },
    
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
  };
}

// Generate structured data for the service
function generateStructuredData(service: ServiceData) {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Service",
    "name": service.translation?.name_en || service.name,
    "description": service.translation?.description_en || service.description,
    "url": `https://daleelbalady.com/service/${service.id}`,
    "image": `https://daleelbalady.com/api/og/service/${service.id}`,
    "provider": {
      "@type": service.ownerUser ? "Person" : "Organization",
      "name": service.ownerUser?.name || service.shop?.name,
      ...(service.ownerUser?.profilePic && { "image": service.ownerUser.profilePic }),
      ...(service.ownerUser?.phone && { "telephone": service.ownerUser.phone }),
      ...(service.ownerUser?.email && { "email": service.ownerUser.email }),
    },
    ...(service.price && {
      "offers": {
        "@type": "Offer",
        "price": service.price,
        "priceCurrency": service.currency || "EGP",
        "availability": service.metadata?.availability === "available" ? 
          "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      }
    }),
    ...(service.avgRating && {
      "aggregateRating": {
        "@type": "AggregateRating",
        "ratingValue": service.avgRating,
        "reviewCount": service.reviewsCount || service.reviews.length,
        "bestRating": 5,
        "worstRating": 1,
      }
    }),
    ...(service.city && {
      "areaServed": {
        "@type": "City",
        "name": service.city,
      }
    }),
    ...(service.category && {
      "category": service.category.en,
      "additionalType": `https://daleelbalady.com/categories/${service.metadata?.categoryCode || 'general'}`
    }),
    ...(service.duration && {
      "duration": `PT${service.durationMins || 60}M`
    }),
    "dateModified": new Date(service.createdAt).toISOString(),
    "isVerified": service.isVerified || false,
  };

  return structuredData;
}

export default async function ServicePage({ params }: { params: Promise<{ id: string }> }) {
  console.log('ServicePage rendering, awaiting params...');
  const { id } = await params;
  console.log('ServicePage ID received:', id);
  
  const service = await fetchService(id);
  console.log('ServicePage service fetched:', service ? 'SUCCESS' : 'NULL');
  
  if (!service) {
    console.log('ServicePage: service not found, calling notFound()');
    notFound();
  }

  const structuredData = generateStructuredData(service);
  console.log('ServicePage: structured data generated, rendering...');

  return (
    <>
      {/* Structured Data for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      
      {/* Client-side content */}
      <ClientWrapper service={service} />
    </>
  );
}

// Generate static params for popular services (optional)
export async function generateStaticParams() {
  // Skip static generation during build if API is not accessible
  // This prevents build failures when the API domain cannot be resolved
  console.log('generateStaticParams called - skipping API call during build');
  
  // Return empty array to allow dynamic rendering for all service pages
  // This means all service pages will be generated on-demand instead of at build time
  return [];
  
  /* Original implementation disabled to fix build issues:
  try {
    // Fetch popular/featured service IDs for pre-rendering
    const response = await fetch('https://api.daleelbalady.com/api/services/featured', {
      next: { revalidate: 3600 } // Revalidate every hour
    });
    
    if (response.ok) {
      const data = await response.json();
      if (data.success && data.services) {
        return data.services.map((service: ServiceData) => ({
          id: service.id,
        }));
      }
    }
  } catch (error) {
    console.error('Error generating static params:', error);
  }
  
  // For development, return sample service IDs
  if (process.env.NODE_ENV === 'development') {
    return [
      { id: 'dr-ahmed-hassan-cardiologist' },
      { id: 'dr-sarah-mohamed-dermatologist' },
      { id: 'dr-mohamed-ali-orthopedic' },
      { id: '1' }, // For testing with simple ID
      { id: 'test-service' }
    ];
  }
  
  // Return empty array if no featured services or error
  return [];
  */
}
