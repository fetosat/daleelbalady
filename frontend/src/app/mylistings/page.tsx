'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { UnifiedListing, ListingFilters, ViewMode, DashboardStats, ListingFormData } from '@/types/dashboard';
import { FilterBar } from '@/components/dashboard/FilterBar';
import { ListingCard } from '@/components/dashboard/ListingCard';
import { ListingsTable } from '@/components/dashboard/ListingsTable';
import { ListingDetailDrawer } from '@/components/dashboard/ListingDetailDrawer';
import { CreateListingModal } from '@/components/dashboard/CreateListingModal';
import { EditListingModal } from '@/components/dashboard/EditListingModal';
import { AnalyticsCard } from '@/components/dashboard/AnalyticsCard';
import { Store, ShoppingBag, Package, TrendingUp, Plus } from 'lucide-react';
import { motion } from 'framer-motion';
import api from '@/lib/api';

// Helper to map backend data to UnifiedListing format
const mapToUnifiedListing = (item: any, type: 'SHOP' | 'SERVICE' | 'PRODUCT'): UnifiedListing => {
  const base = {
    id: item.id,
    type,
    name: item.name || item.translation?.name_en || item.translation?.name_ar || 'Untitled',
    description: item.description || item.translation?.description_en || item.translation?.description_ar || '',
    city: item.city,
    status: (item.isActive ?? item.available ?? true) ? 'active' : 'inactive',
    isVerified: item.isVerified || false,
    createdAt: item.createdAt || new Date().toISOString(),
    updatedAt: item.updatedAt || new Date().toISOString(),
  };

  if (type === 'SHOP') {
    return {
      ...base,
      logoImage: item.logoImage,
      coverImage: item.coverImage,
      phone: item.phone,
      email: item.email,
      website: item.website,
      servicesCount: item._count?.services,
      productsCount: item._count?.products,
      analytics: {
        views: item.stats?.views || 0,
        reviews: item._count?.reviews || 0,
        avgRating: item.stats?.avgRating || 0,
      },
    };
  }

  if (type === 'SERVICE') {
    return {
      ...base,
      price: item.price,
      currency: item.currency || 'EGP',
      durationMins: item.durationMins,
      coverImage: item.coverImage || item.images?.[0],
      parentShop: item.shop?.name,
      analytics: {
        views: item.stats?.views || 0,
        bookings: item._count?.bookings || 0,
        reviews: item.reviewsCount || item._count?.reviews || 0,
        avgRating: item.avgRating || 0,
      },
    };
  }

  if (type === 'PRODUCT') {
    return {
      ...base,
      price: item.price,
      currency: item.currency || 'EGP',
      stock: item.stock,
      sku: item.sku,
      coverImage: item.images?.[0],
      parentShop: item.shop?.name,
      analytics: {
        views: item.stats?.views || 0,
        orders: item.stats?.sales || 0,
        reviews: item.stats?.totalReviews || 0,
        avgRating: item.stats?.avgRating || 0,
      },
    };
  }

  return base as UnifiedListing;
};

// Fetch unified listings from backend
const fetchUnifiedListings = async (): Promise<UnifiedListing[]> => {
  try {
    const [shopsRes, servicesRes, productsRes] = await Promise.allSettled([
      api.get('/shops/provider'),
      api.get('/services/provider'),
      api.get('/products/provider'),
    ]);

    const shops = shopsRes.status === 'fulfilled' ? (shopsRes.value.data.shops || []) : [];
    const services = servicesRes.status === 'fulfilled' ? (servicesRes.value.data.services || []) : [];
    const products = productsRes.status === 'fulfilled' ? (productsRes.value.data.products || []) : [];

    const unifiedListings = [
      ...shops.map((shop: any) => mapToUnifiedListing(shop, 'SHOP')),
      ...services.map((service: any) => mapToUnifiedListing(service, 'SERVICE')),
      ...products.map((product: any) => mapToUnifiedListing(product, 'PRODUCT')),
    ];

    return unifiedListings;
  } catch (error) {
    console.error('Error fetching listings:', error);
    return [];
  }
};

const fetchDashboardStats = async (): Promise<DashboardStats> => {
  try {
    const listings = await fetchUnifiedListings();
    
    const stats = {
      totalShops: listings.filter(l => l.type === 'SHOP').length,
      totalServices: listings.filter(l => l.type === 'SERVICE').length,
      totalProducts: listings.filter(l => l.type === 'PRODUCT').length,
      totalViews: listings.reduce((sum, l) => sum + (l.analytics?.views || 0), 0),
      totalBookings: listings.reduce((sum, l) => sum + (l.analytics?.bookings || 0), 0),
      totalOrders: listings.reduce((sum, l) => sum + (l.analytics?.orders || 0), 0),
      totalRevenue: 0, // Calculate based on actual data if available
    };

    return stats;
  } catch (error) {
    console.error('Error fetching stats:', error);
    return {
      totalShops: 0,
      totalServices: 0,
      totalProducts: 0,
      totalViews: 0,
      totalBookings: 0,
      totalOrders: 0,
      totalRevenue: 0,
    };
  }
};

export default function MyListingsPage() {
  const [listings, setListings] = useState<UnifiedListing[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [filters, setFilters] = useState<ListingFilters>({
    search: '',
    type: 'ALL',
    city: '',
    status: 'all',
    sortBy: 'latest',
  });
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [selectedListing, setSelectedListing] = useState<UnifiedListing | null>(null);
  const [isDetailDrawerOpen, setIsDetailDrawerOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const [listingsData, statsData] = await Promise.all([
        fetchUnifiedListings(),
        fetchDashboardStats(),
      ]);
      setListings(listingsData);
      setStats(statsData);
    } catch (err) {
      setError('Failed to load your listings. Please try again.');
      console.error('Error loading data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredListings = useMemo(() => {
    let result = [...listings];

    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      result = result.filter(
        (listing) =>
          listing.name.toLowerCase().includes(searchLower) ||
          listing.description?.toLowerCase().includes(searchLower)
      );
    }

    if (filters.type !== 'ALL') {
      result = result.filter((listing) => listing.type === filters.type);
    }

    if (filters.city) {
      result = result.filter((listing) =>
        listing.city?.toLowerCase().includes(filters.city.toLowerCase())
      );
    }

    if (filters.status !== 'all') {
      result = result.filter((listing) => listing.status === filters.status);
    }

    switch (filters.sortBy) {
      case 'latest':
        result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
      case 'views':
        result.sort((a, b) => (b.analytics?.views || 0) - (a.analytics?.views || 0));
        break;
      case 'rating':
        result.sort((a, b) => (b.analytics?.avgRating || 0) - (a.analytics?.avgRating || 0));
        break;
      case 'name':
        result.sort((a, b) => a.name.localeCompare(b.name));
        break;
    }

    return result;
  }, [listings, filters]);

  const handleListingClick = (listing: UnifiedListing) => {
    setSelectedListing(listing);
    setIsDetailDrawerOpen(true);
  };

  const handleCreateListing = async (data: ListingFormData) => {
    try {
      console.log('Creating listing:', data);
      // TODO: Implement actual API calls based on type
      await loadData();
      setIsCreateModalOpen(false);
    } catch (err) {
      console.error('Error creating listing:', err);
      throw err;
    }
  };

  const handleUpdateListing = async (data: ListingFormData) => {
    try {
      if (!selectedListing) return;
      const id = selectedListing.id;
      switch (selectedListing.type) {
        case 'SHOP':
          await api.put(`/shops/${id}`, {
            name: data.name,
            description: data.description,
            city: data.city,
            phone: data.phone,
            email: data.email,
            website: data.website,
            coverImage: data.coverImage,
            logoImage: data.logoImage,
          });
          break;
        case 'SERVICE':
          await api.put(`/services/${id}`, {
            name: data.name,
            description: data.description,
            city: data.city,
            price: data.price,
            currency: data.currency,
            durationMins: data.durationMins,
            coverImage: data.coverImage,
            shopId: data.shopId,
          });
          break;
        case 'PRODUCT':
          await api.put(`/products/${id}`, {
            name: data.name,
            description: data.description,
            city: data.city,
            price: data.price,
            currency: data.currency,
            stock: data.stock,
            sku: data.sku,
            coverImage: data.coverImage,
            shopId: data.shopId,
          });
          break;
      }
      await loadData();
      setIsEditModalOpen(false);
      setSelectedListing(null);
    } catch (err) {
      console.error('Error updating listing:', err);
      throw err;
    }
  };

  const handleEditListing = (listing?: UnifiedListing) => {
    const targetListing = listing || selectedListing;
    if (targetListing) {
      setSelectedListing(targetListing);
      setIsDetailDrawerOpen(false);
      setIsEditModalOpen(true);
    }
  };

  const handleDeleteListing = async (listing?: UnifiedListing) => {
    const targetListing = listing || selectedListing;
    if (targetListing && confirm(`Are you sure you want to delete "${targetListing.name}"?`)) {
      try {
        console.log('Deleting listing:', targetListing.id);
        // TODO: Implement delete API call
        await loadData();
        setIsDetailDrawerOpen(false);
        setSelectedListing(null);
      } catch (err) {
        console.error('Error deleting listing:', err);
        alert('Failed to delete listing. Please try again.');
      }
    }
  };

  const existingShops = useMemo(() => {
    return listings
      .filter((listing) => listing.type === 'SHOP')
      .map((shop) => ({ id: shop.id, name: shop.name }));
  }, [listings]);

  if (isLoading) {
    return (
      <>
        <div className="min-h-screen bg-stone-50 dark:bg-stone-900 flex items-center justify-center pt-20">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 dark:border-blue-400 mx-auto mb-4"></div>
            <p className="text-stone-600 dark:text-stone-300">Loading your listings...</p>
          </div>
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <div className="min-h-screen bg-stone-50 dark:bg-stone-900 flex items-center justify-center pt-20">
          <div className="text-center max-w-md">
            <div className="text-red-600 dark:text-red-400 text-5xl mb-4">⚠️</div>
            <h2 className="text-xl font-semibold text-stone-900 dark:text-stone-100 mb-2">Something went wrong</h2>
            <p className="text-stone-600 dark:text-stone-400 mb-4">{error}</p>
            <button
              onClick={loadData}
              className="px-4 py-2 bg-blue-600 dark:bg-blue-500 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50 dark:bg-stone-900">
      <CreateListingModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateListing}
        existingShops={existingShops}
      />
      <EditListingModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSubmit={handleUpdateListing}
        listing={selectedListing}
        existingShops={existingShops}
      />
      <div className="">
        {/* Header */}
        <div className="bg-white dark:bg-stone-800 border-b border-stone-200 dark:border-stone-700">
          <div className="max-w-7xl mx-auto px-6 py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-stone-900 dark:text-stone-100">My Listings</h1>
                <p className="text-stone-600 dark:text-stone-400 mt-1">Manage all your shops, services, and products in one place</p>
              </div>
              <button
                onClick={() => setIsCreateModalOpen(true)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 dark:bg-blue-500 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors shadow-sm"
              >
                <Plus className="h-5 w-5" />
                Create New Listing
              </button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="max-w-7xl mx-auto px-6 py-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <AnalyticsCard title="Total Shops" value={stats.totalShops} icon={Store} color="blue" />
              <AnalyticsCard title="Total Services" value={stats.totalServices} icon={ShoppingBag} color="emerald" />
              <AnalyticsCard title="Total Products" value={stats.totalProducts} icon={Package} color="purple" />
              <AnalyticsCard title="Total Views" value={stats.totalViews} icon={TrendingUp} color="orange" />
            </div>
          </div>
        )}

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-6 pb-6">
          <div className="bg-white dark:bg-stone-800 rounded-2xl shadow-sm overflow-hidden">
            <FilterBar
              filters={filters}
              onFiltersChange={setFilters}
              viewMode={viewMode}
              onViewModeChange={setViewMode}
              totalResults={filteredListings.length}
            />

            <div className="p-6">
              {filteredListings.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16">
                  <div className="text-stone-400 dark:text-stone-500 mb-4">
                    <Store className="h-16 w-16" />
                  </div>
                  <h3 className="text-lg font-semibold text-stone-900 dark:text-stone-100 mb-2">No listings found</h3>
                  <p className="text-sm text-stone-500 dark:text-stone-400 text-center max-w-sm mb-6">
                    {listings.length === 0
                      ? "You haven't created any listings yet. Get started by creating your first shop, service, or product."
                      : 'Try adjusting your filters to see more results.'}
                  </p>
                  {listings.length === 0 && (
                    <button
                      onClick={() => setIsCreateModalOpen(true)}
                      className="flex items-center gap-2 px-4 py-2 bg-blue-600 dark:bg-blue-500 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors"
                    >
                      <Plus className="h-5 w-5" />
                      Create Your First Listing
                    </button>
                  )}
                </div>
              ) : viewMode === 'grid' ? (
                <motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredListings.map((listing) => (
                    <ListingCard
                      key={listing.id}
                      listing={listing}
                      onClick={() => handleListingClick(listing)}
                      onEdit={() => handleEditListing(listing)}
                      onDelete={() => handleDeleteListing(listing)}
                    />
                  ))}
                </motion.div>
              ) : (
                <ListingsTable
                  listings={filteredListings}
                  onRowClick={handleListingClick}
                  onEdit={handleEditListing}
                  onDelete={handleDeleteListing}
                />
              )}
            </div>
          </div>
        </div>
      </div>

      <ListingDetailDrawer
        listing={selectedListing}
        isOpen={isDetailDrawerOpen}
        onClose={() => {
          setIsDetailDrawerOpen(false);
          setSelectedListing(null);
        }}
        onEdit={() => handleEditListing()}
        onDelete={() => handleDeleteListing()}
      />

      
    </div>
  );
}

