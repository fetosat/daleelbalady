'use client';

import { ServiceNavbar } from './ServiceNavbar';
import ServicePageContent from './ServicePageContent';
import { ServiceErrorBoundary } from './ServiceErrorBoundary';

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

interface ClientWrapperProps {
  service: ServiceData;
}

export default function ClientWrapper({ service }: ClientWrapperProps) {
  return (
    <ServiceErrorBoundary>
      <ServiceNavbar />
      <div className="pt-20">
        <ServicePageContent service={service} />
      </div>
    </ServiceErrorBoundary>
  );
}
