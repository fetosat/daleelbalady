'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { UnifiedListing, ListingFilters, ViewMode, DashboardStats, ListingFormData } from '@/types/dashboard';
import { FilterBar } from '@/components/dashboard/FilterBar';
import { ListingCard } from '@/components/dashboard/ListingCard';
import { ListingsTable } from '@/components/dashboard/ListingsTable';
import { ListingDetailDrawer } from '@/components/dashboard/ListingDetailDrawer';
import { CreateListingModal } from '@/components/dashboard/CreateListingModal';
import { AnalyticsCard } from '@/components/dashboard/AnalyticsCard';
import { Store, ShoppingBag, Package, TrendingUp, Plus } from 'lucide-react';
import { motion } from 'framer-motion';

// Mock data fetching - replace with actual API calls
const fetchUnifiedListings = async (): Promise<UnifiedListing[]> => {
  // TODO: Replace with actual API call to backend
  // Example: const response = await fetch('/api/provider/listings');
  // return response.json();
  
  // Mock data for demonstration
  return [];
};

const fetchDashboardStats = async (): Promise<DashboardStats> => {
  // TODO: Replace with actual API call
  return {
    totalShops: 0,
    totalServices: 0,
    totalProducts: 0,
    totalViews: 0,
    totalBookings: 0,
    totalOrders: 0,
    totalRevenue: 0,
  };
};

export default function UnifiedListingsPage() {
  // State Management
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
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch data on mount
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
      setError('Failed to load dashboard data. Please try again.');
      console.error('Error loading data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Filter and sort listings
  const filteredListings = useMemo(() => {
    let result = [...listings];

    // Search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      result = result.filter(
        (listing) =>
          listing.name.toLowerCase().includes(searchLower) ||
          listing.description?.toLowerCase().includes(searchLower)
      );
    }

    // Type filter
    if (filters.type !== 'ALL') {
      result = result.filter((listing) => listing.type === filters.type);
    }

    // City filter
    if (filters.city) {
      result = result.filter((listing) =>
        listing.city?.toLowerCase().includes(filters.city.toLowerCase())
      );
    }

    // Status filter
    if (filters.status !== 'all') {
      result = result.filter((listing) => listing.status === filters.status);
    }

    // Sorting
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

  // Handlers
  const handleListingClick = (listing: UnifiedListing) => {
    setSelectedListing(listing);
    setIsDetailDrawerOpen(true);
  };

  const handleCreateListing = async (data: ListingFormData) => {
    try {
      // TODO: Replace with actual API call
      console.log('Creating listing:', data);
      
      // Reload data after creation
      await loadData();
      setIsCreateModalOpen(false);
    } catch (err) {
      console.error('Error creating listing:', err);
      throw err;
    }
  };

  const handleEditListing = (listing?: UnifiedListing) => {
    const targetListing = listing || selectedListing;
    if (targetListing) {
      console.log('Edit listing:', targetListing);
      // TODO: Implement edit functionality
    }
  };

  const handleDeleteListing = async (listing?: UnifiedListing) => {
    const targetListing = listing || selectedListing;
    if (targetListing && confirm(`Are you sure you want to delete "${targetListing.name}"?`)) {
      try {
        // TODO: Replace with actual API call
        console.log('Deleting listing:', targetListing.id);
        
        // Reload data after deletion
        await loadData();
        setIsDetailDrawerOpen(false);
        setSelectedListing(null);
      } catch (err) {
        console.error('Error deleting listing:', err);
        alert('Failed to delete listing. Please try again.');
      }
    }
  };

  // Get existing shops for dropdown in create modal
  const existingShops = useMemo(() => {
    return listings
      .filter((listing) => listing.type === 'SHOP')
      .map((shop) => ({ id: shop.id, name: shop.name }));
  }, [listings]);

  // Loading State
  if (isLoading) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-stone-600">Loading your listings...</p>
        </div>
      </div>
    );
  }

  // Error State
  if (error) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="text-red-600 text-5xl mb-4">⚠️</div>
          <h2 className="text-xl font-semibold text-stone-900 mb-2">Something went wrong</h2>
          <p className="text-stone-600 mb-4">{error}</p>
          <button
            onClick={loadData}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50">
      {/* Header */}
      <div className="bg-white border-b border-stone-200">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-stone-900">Unified Listings</h1>
              <p className="text-stone-600 mt-1">Manage all your shops, services, and products in one place</p>
            </div>
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
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
            <AnalyticsCard
              title="Total Shops"
              value={stats.totalShops}
              icon={Store}
              color="blue"
            />
            <AnalyticsCard
              title="Total Services"
              value={stats.totalServices}
              icon={ShoppingBag}
              color="emerald"
            />
            <AnalyticsCard
              title="Total Products"
              value={stats.totalProducts}
              icon={Package}
              color="purple"
            />
            <AnalyticsCard
              title="Total Views"
              value={stats.totalViews}
              icon={TrendingUp}
              color="orange"
            />
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 pb-6">
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          {/* Filter Bar */}
          <FilterBar
            filters={filters}
            onFiltersChange={setFilters}
            viewMode={viewMode}
            onViewModeChange={setViewMode}
            totalResults={filteredListings.length}
          />

          {/* Listings Content */}
          <div className="p-6">
            {filteredListings.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16">
                <div className="text-stone-400 mb-4">
                  <Store className="h-16 w-16" />
                </div>
                <h3 className="text-lg font-semibold text-stone-900 mb-2">No listings found</h3>
                <p className="text-sm text-stone-500 text-center max-w-sm mb-6">
                  {listings.length === 0
                    ? "You haven't created any listings yet. Get started by creating your first shop, service, or product."
                    : 'Try adjusting your filters to see more results.'}
                </p>
                {listings.length === 0 && (
                  <button
                    onClick={() => setIsCreateModalOpen(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Plus className="h-5 w-5" />
                    Create Your First Listing
                  </button>
                )}
              </div>
            ) : viewMode === 'grid' ? (
              <motion.div
                layout
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              >
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

      {/* Detail Drawer */}
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

      {/* Create Modal */}
      <CreateListingModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateListing}
        existingShops={existingShops}
      />
    </div>
  );
}

