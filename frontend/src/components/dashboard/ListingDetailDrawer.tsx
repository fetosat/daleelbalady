'use client';

import React, { useState, useEffect } from 'react';
import { UnifiedListing } from '@/types/dashboard';
import { X, Store, Package, ShoppingBag, Eye, Star, MessageSquare, MapPin, Phone, Mail, Globe, Calendar, Edit, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import AnalyticsCard from './AnalyticsCard';

interface ListingDetailDrawerProps {
  listing: UnifiedListing | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
}

type Tab = 'overview' | 'media' | 'analytics' | 'sub-items';

export const ListingDetailDrawer: React.FC<ListingDetailDrawerProps> = ({
  listing,
  isOpen,
  onClose,
  onEdit,
  onDelete,
}) => {
  const [activeTab, setActiveTab] = useState<Tab>('overview');

  // Prevent body scroll when drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!listing) return null;

  const getTypeIcon = () => {
    switch (listing.type) {
      case 'SHOP':
        return Store;
      case 'SERVICE':
        return ShoppingBag;
      case 'PRODUCT':
        return Package;
      default:
        return Store;
    }
  };

  const TypeIcon = getTypeIcon();

  const tabs: { id: Tab; label: string }[] = [
    { id: 'overview', label: 'Overview' },
    { id: 'media', label: 'Media' },
    { id: 'analytics', label: 'Analytics' },
    { id: 'sub-items', label: listing.type === 'SHOP' ? 'Listings' : 'Details' },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0  bg-black/50 z-40"
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 pt-16 h-full w-full max-w-2xl bg-white dark:bg-stone-800 shadow-2xl z-50 overflow-hidden flex flex-col"
          >
            {/* Header */}
            <div className="flex items-start justify-between p-6 border-b border-stone-200">
              <div className="flex items-start gap-4 flex-1 min-w-0">
                <div className="h-16 w-16 flex-shrink-0 rounded-xl overflow-hidden bg-stone-100">
                  {listing.coverImage || listing.logoImage ? (
                    <img
                      src={listing.coverImage || listing.logoImage}
                      alt={listing.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center">
                      <TypeIcon className="h-8 w-8 text-stone-400" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="info" size="sm">{listing.type}</Badge>
                    <Badge variant={listing.status === 'active' ? 'success' : 'warning'} size="sm">
                      {listing.status}
                    </Badge>
                    {listing.isVerified && (
                      <Badge variant="info" size="sm">✓ Verified</Badge>
                    )}
                  </div>
                  <h2 className="text-2xl font-bold text-stone-900 mb-1 truncate">
                    {listing.name}
                  </h2>
                  {listing.description && (
                    <p className="text-sm text-stone-600 line-clamp-2">
                      {listing.description}
                    </p>
                  )}
                </div>
              </div>
              <button
                onClick={onClose}
                className="ml-4 p-2 hover:bg-stone-100 rounded-lg transition-colors"
              >
                <X className="h-5 w-5 text-stone-500" />
              </button>
            </div>

            {/* Tabs */}
            <div className="flex items-center gap-1 px-6 pt-4 border-b border-stone-200">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    'px-4 py-2 text-sm font-medium rounded-t-lg transition-colors',
                    activeTab === tab.id
                      ? 'bg-white text-blue-600 border-b-2 border-blue-600'
                      : 'text-stone-600 hover:text-stone-900 hover:bg-stone-50'
                  )}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6">
              {activeTab === 'overview' && (
                <div className="space-y-6">
                  {/* Basic Info */}
                  <div className="grid grid-cols-2 gap-4">
                    {listing.city && (
                      <div>
                        <label className="text-xs font-medium text-stone-500 uppercase">City</label>
                        <div className="flex items-center gap-2 mt-1 text-stone-900">
                          <MapPin className="h-4 w-4" />
                          {listing.city}
                        </div>
                      </div>
                    )}
                    {listing.price && (
                      <div>
                        <label className="text-xs font-medium text-stone-500 uppercase">Price</label>
                        <div className="mt-1 text-lg font-semibold text-stone-900">
                          {listing.price} {listing.currency || 'EGP'}
                        </div>
                      </div>
                    )}
                    {listing.stock !== undefined && (
                      <div>
                        <label className="text-xs font-medium text-stone-500 uppercase">Stock</label>
                        <div className={cn(
                          'mt-1 text-lg font-semibold',
                          listing.stock > 0 ? 'text-emerald-600' : 'text-red-600'
                        )}>
                          {listing.stock} units
                        </div>
                      </div>
                    )}
                    {listing.durationMins && (
                      <div>
                        <label className="text-xs font-medium text-stone-500 uppercase">Duration</label>
                        <div className="mt-1 text-stone-900">
                          {listing.durationMins} minutes
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Contact Info */}
                  {(listing.phone || listing.email || listing.website) && (
                    <div>
                      <h3 className="text-sm font-semibold text-stone-900 mb-3">Contact Information</h3>
                      <div className="space-y-2">
                        {listing.phone && (
                          <div className="flex items-center gap-2 text-sm text-stone-600">
                            <Phone className="h-4 w-4" />
                            {listing.phone}
                          </div>
                        )}
                        {listing.email && (
                          <div className="flex items-center gap-2 text-sm text-stone-600">
                            <Mail className="h-4 w-4" />
                            {listing.email}
                          </div>
                        )}
                        {listing.website && (
                          <div className="flex items-center gap-2 text-sm text-stone-600">
                            <Globe className="h-4 w-4" />
                            <a href={listing.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                              {listing.website}
                            </a>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Dates */}
                  <div>
                    <h3 className="text-sm font-semibold text-stone-900 mb-3">Timeline</h3>
                    <div className="flex items-center gap-2 text-sm text-stone-600">
                      <Calendar className="h-4 w-4" />
                      <span>Created: {new Date(listing.createdAt).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-stone-600 mt-1">
                      <Calendar className="h-4 w-4" />
                      <span>Updated: {new Date(listing.updatedAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'media' && (
                <div className="space-y-6">
                  {/* Cover Image */}
                  {listing.coverImage && (
                    <div>
                      <label className="text-sm font-semibold text-stone-900 mb-3 block">Cover Image</label>
                      <img
                        src={listing.coverImage}
                        alt={`${listing.name} cover`}
                        className="w-full h-64 object-cover rounded-xl border border-stone-200"
                      />
                    </div>
                  )}

                  {/* Logo Image */}
                  {listing.logoImage && (
                    <div>
                      <label className="text-sm font-semibold text-stone-900 mb-3 block">Logo</label>
                      <img
                        src={listing.logoImage}
                        alt={`${listing.name} logo`}
                        className="w-32 h-32 object-cover rounded-xl border border-stone-200"
                      />
                    </div>
                  )}

                  {/* Gallery */}
                  {listing.galleryImages && listing.galleryImages.length > 0 && (
                    <div>
                      <label className="text-sm font-semibold text-stone-900 mb-3 block">Gallery</label>
                      <div className="grid grid-cols-2 gap-4">
                        {listing.galleryImages.map((img, idx) => (
                          <img
                            key={idx}
                            src={img}
                            alt={`Gallery image ${idx + 1}`}
                            className="w-full h-48 object-cover rounded-xl border border-stone-200"
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  {!listing.coverImage && !listing.logoImage && (!listing.galleryImages || listing.galleryImages.length === 0) && (
                    <div className="flex flex-col items-center justify-center py-12 text-stone-400">
                      <Package className="h-16 w-16 mb-4" />
                      <p>No media available</p>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'analytics' && (
                <div className="space-y-6">
                  {listing.analytics ? (
                    <div className="grid grid-cols-2 gap-4">
                      <AnalyticsCard
                        title="Total Views"
                        value={listing.analytics.views}
                        icon={Eye}
                        color="blue"
                      />
                      {listing.analytics.bookings !== undefined && (
                        <AnalyticsCard
                          title="Bookings"
                          value={listing.analytics.bookings}
                          icon={Calendar}
                          color="emerald"
                        />
                      )}
                      {listing.analytics.orders !== undefined && (
                        <AnalyticsCard
                          title="Orders"
                          value={listing.analytics.orders}
                          icon={ShoppingBag}
                          color="purple"
                        />
                      )}
                      <AnalyticsCard
                        title="Reviews"
                        value={listing.analytics.reviews}
                        icon={MessageSquare}
                        color="orange"
                      />
                      <AnalyticsCard
                        title="Average Rating"
                        value={listing.analytics.avgRating.toFixed(1)}
                        icon={Star}
                        color="blue"
                      />
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-12 text-stone-400">
                      <Eye className="h-16 w-16 mb-4" />
                      <p>No analytics data available</p>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'sub-items' && (
                <div className="space-y-4">
                  {listing.type === 'SHOP' && (
                    <>
                      {(listing.servicesCount || listing.productsCount) ? (
                        <div>
                          <div className="bg-stone-50 rounded-xl p-4 mb-4">
                            <div className="grid grid-cols-2 gap-4 text-center">
                              {listing.servicesCount !== undefined && (
                                <div>
                                  <div className="text-2xl font-bold text-stone-900">{listing.servicesCount}</div>
                                  <div className="text-sm text-stone-600">Services</div>
                                </div>
                              )}
                              {listing.productsCount !== undefined && (
                                <div>
                                  <div className="text-2xl font-bold text-stone-900">{listing.productsCount}</div>
                                  <div className="text-sm text-stone-600">Products</div>
                                </div>
                              )}
                            </div>
                          </div>
                          <p className="text-sm text-stone-600">
                            View detailed listings of services and products in the shop page.
                          </p>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center py-12 text-stone-400">
                          <Package className="h-16 w-16 mb-4" />
                          <p>No services or products yet</p>
                        </div>
                      )}
                    </>
                  )}
                  {listing.type === 'PRODUCT' && listing.parentShop && (
                    <div>
                      <label className="text-sm font-semibold text-stone-900 mb-2 block">Parent Shop</label>
                      <div className="bg-stone-50 rounded-xl p-4">
                        <div className="font-medium text-stone-900">{listing.parentShop}</div>
                      </div>
                    </div>
                  )}
                  {listing.type === 'SERVICE' && listing.parentShop && (
                    <div>
                      <label className="text-sm font-semibold text-stone-900 mb-2 block">Associated Shop</label>
                      <div className="bg-stone-50 rounded-xl p-4">
                        <div className="font-medium text-stone-900">{listing.parentShop}</div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Footer Actions */}
            <div className="flex items-center justify-end gap-3 p-6 border-t border-stone-200 bg-stone-50">
              {onDelete && (
                <button
                  onClick={onDelete}
                  className="px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors flex items-center gap-2"
                >
                  <Trash2 className="h-4 w-4" />
                  Delete
                </button>
              )}
              {onEdit && (
                <button
                  onClick={onEdit}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors flex items-center gap-2"
                >
                  <Edit className="h-4 w-4" />
                  Edit Listing
                </button>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default ListingDetailDrawer;

