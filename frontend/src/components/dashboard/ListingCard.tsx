'use client';

import React from 'react';
import { UnifiedListing } from '@/types/dashboard';
import { Store, Package, ShoppingBag, Eye, Star, MapPin, MoreVertical, Edit, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';

interface ListingCardProps {
  listing: UnifiedListing;
  onClick: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
}

const getTypeIcon = (type: string) => {
  switch (type) {
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

const getTypeBadgeVariant = (type: string): 'info' | 'success' | 'purple' => {
  switch (type) {
    case 'SHOP':
      return 'info';
    case 'SERVICE':
      return 'success';
    case 'PRODUCT':
      return 'purple';
    default:
      return 'info';
  }
};

const getStatusBadgeVariant = (status: string): 'success' | 'warning' | 'default' => {
  switch (status) {
    case 'active':
      return 'success';
    case 'pending':
      return 'warning';
    default:
      return 'default';
  }
};

export const ListingCard: React.FC<ListingCardProps> = ({
  listing,
  onClick,
  onEdit,
  onDelete,
}) => {
  const [showActions, setShowActions] = React.useState(false);
  const TypeIcon = getTypeIcon(listing.type);

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    onEdit?.();
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete?.();
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.2 }}
      onClick={onClick}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
      className="group relative bg-white dark:bg-stone-800 rounded-2xl border border-stone-200 dark:border-stone-700 overflow-hidden hover:shadow-xl hover:border-stone-300 dark:hover:border-stone-600 transition-all cursor-pointer"
    >
      {/* Cover Image */}
      <div className="relative h-48 bg-gradient-to-br from-stone-100 to-stone-200 overflow-hidden">
        {listing.coverImage ? (
          <img
            src={listing.coverImage}
            alt={listing.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="flex items-center justify-center h-full">
            <TypeIcon className="h-16 w-16 text-stone-300" />
          </div>
        )}
        
        {/* Verified Badge */}
        {listing.isVerified && (
          <div className="absolute top-3 right-3 bg-blue-600 text-white px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1">
            <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            Verified
          </div>
        )}

        {/* Actions Menu (visible on hover) */}
        {showActions && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute top-3 left-3 flex gap-2"
          >
            {onEdit && (
              <button
                onClick={handleEdit}
                className="p-2 bg-white rounded-lg shadow-md hover:bg-stone-50 transition-colors"
                title="Edit"
              >
                <Edit className="h-4 w-4 text-stone-600" />
              </button>
            )}
            {onDelete && (
              <button
                onClick={handleDelete}
                className="p-2 bg-white rounded-lg shadow-md hover:bg-red-50 transition-colors"
                title="Delete"
              >
                <Trash2 className="h-4 w-4 text-red-600" />
              </button>
            )}
          </motion.div>
        )}
      </div>

      {/* Content */}
      <div className="p-5">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <Badge variant={getTypeBadgeVariant(listing.type)} size="sm">
                {listing.type}
              </Badge>
              <Badge variant={getStatusBadgeVariant(listing.status)} size="sm">
                {listing.status}
              </Badge>
            </div>
            <h3 className="text-lg font-semibold text-stone-900 truncate group-hover:text-blue-600 transition-colors">
              {listing.name}
            </h3>
          </div>
        </div>

        {/* Description */}
        {listing.description && (
          <p className="text-sm text-stone-600 mb-4 line-clamp-2">
            {listing.description}
          </p>
        )}

        {/* Metadata */}
        <div className="flex items-center gap-4 mb-4 text-sm text-stone-500">
          {listing.city && (
            <div className="flex items-center gap-1">
              <MapPin className="h-3.5 w-3.5" />
              <span>{listing.city}</span>
            </div>
          )}
          {listing.price && (
            <div className="font-medium text-stone-900">
              {listing.price} {listing.currency || 'EGP'}
            </div>
          )}
          {listing.stock !== undefined && (
            <div className={cn(
              'font-medium',
              listing.stock > 0 ? 'text-emerald-600' : 'text-red-600'
            )}>
              {listing.stock} in stock
            </div>
          )}
        </div>

        {/* Analytics */}
        {listing.analytics && (
          <div className="flex items-center justify-between pt-4 border-t border-stone-100">
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-1 text-stone-600">
                <Eye className="h-4 w-4" />
                <span>{listing.analytics.views}</span>
              </div>
              <div className="flex items-center gap-1 text-stone-600">
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                <span>{listing.analytics.avgRating.toFixed(1)}</span>
              </div>
            </div>
            {(listing.servicesCount || listing.productsCount) && (
              <div className="text-xs text-stone-500">
                {listing.servicesCount && `${listing.servicesCount} services`}
                {listing.servicesCount && listing.productsCount && ' • '}
                {listing.productsCount && `${listing.productsCount} products`}
              </div>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default ListingCard;

