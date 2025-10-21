import { MetadataRoute } from 'next';

interface Service {
  id: string;
  updatedAt?: string;
  createdAt: string;
}

interface Shop {
  id: string;
  slug?: string;
  updatedAt?: string;
  createdAt: string;
}

interface Offer {
  id: string;
  updatedAt?: string;
  createdAt: string;
}

interface Category {
  id: string;
  slug: string;
  updatedAt?: string;
}

const API_BASE = 'https://api.daleelbalady.com/api';
const SITE_URL = 'https://daleelbalady.com';

async function getServices(): Promise<Service[]> {
  try {
    const response = await fetch(`${API_BASE}/services/sitemap`, {
      next: { revalidate: 3600 }
    });
    
    if (response.ok) {
      const data = await response.json();
      if (data.success && data.services) {
        return data.services;
      }
    }
  } catch (error) {
    console.error('Error fetching services for sitemap:', error);
  }
  
  return [];
}

async function getShops(): Promise<Shop[]> {
  try {
    const response = await fetch(`${API_BASE}/shops?limit=500&featured=true`, {
      next: { revalidate: 3600 }
    });
    
    if (response.ok) {
      const data = await response.json();
      if (data.success && data.shops) {
        return data.shops;
      }
    }
  } catch (error) {
    console.error('Error fetching shops for sitemap:', error);
  }
  
  return [];
}

async function getOffers(): Promise<Offer[]> {
  try {
    const response = await fetch(`${API_BASE}/offers?limit=200&featured=true`, {
      next: { revalidate: 3600 }
    });
    
    if (response.ok) {
      const data = await response.json();
      if (data.success && data.offers) {
        return data.offers;
      }
    }
  } catch (error) {
    console.error('Error fetching offers for sitemap:', error);
  }
  
  return [];
}

async function getCategories(): Promise<Category[]> {
  try {
    const response = await fetch(`${API_BASE}/advanced-search/categories`, {
      next: { revalidate: 3600 }
    });
    
    if (response.ok) {
      const data = await response.json();
      if (data.success && data.categories) {
        return data.categories;
      }
    }
  } catch (error) {
    console.error('Error fetching categories for sitemap:', error);
  }
  
  return [];
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // جلب جميع البيانات بشكل متزامن
  const [services, shops, offers, categories] = await Promise.all([
    getServices(),
    getShops(),
    getOffers(),
    getCategories()
  ]);
  
  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: SITE_URL,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${SITE_URL}/search`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/find`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/shops`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/offers`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/delivery/new`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.7,
    },
    {
      url: `${SITE_URL}/delivery/dashboard`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.6,
    },
    {
      url: `${SITE_URL}/become-partner`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${SITE_URL}/about`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${SITE_URL}/contact`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${SITE_URL}/subscription-plans`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
  ];

  // Category pages
  const categoryPages: MetadataRoute.Sitemap = categories.map((category) => ({
    url: `${SITE_URL}/find/${category.slug}`,
    lastModified: category.updatedAt ? new Date(category.updatedAt) : new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }));

  // Service pages
  const servicePages: MetadataRoute.Sitemap = services.map((service) => ({
    url: `${SITE_URL}/service/${service.id}`,
    lastModified: service.updatedAt ? new Date(service.updatedAt) : new Date(service.createdAt),
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }));

  // Shop pages
  const shopPages: MetadataRoute.Sitemap = shops.map((shop) => ({
    url: `${SITE_URL}/shops/${shop.slug || shop.id}`,
    lastModified: shop.updatedAt ? new Date(shop.updatedAt) : new Date(shop.createdAt),
    changeFrequency: 'daily' as const,
    priority: 0.7,
  }));

  // Offer pages
  const offerPages: MetadataRoute.Sitemap = offers.map((offer) => ({
    url: `${SITE_URL}/offers/${offer.id}`,
    lastModified: offer.updatedAt ? new Date(offer.updatedAt) : new Date(offer.createdAt),
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }));

  return [
    ...staticPages,
    ...categoryPages,
    ...servicePages,
    ...shopPages,
    ...offerPages
  ];
}
