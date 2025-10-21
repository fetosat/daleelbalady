'use client';

import React from 'react';
import { UnifiedListing } from '@/types/dashboard';
import { Store, Package, ShoppingBag, Eye, Star, MapPin, Edit, Trash2, ExternalLink } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';

interface ListingsTableProps {
  listings: UnifiedListing[];
  onRowClick: (listing: UnifiedListing) => void;
  onEdit?: (listing: UnifiedListing) => void;
  onDelete?: (listing: UnifiedListing) => void;
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

export const ListingsTable: React.FC<ListingsTableProps> = ({
  listings,
  onRowClick,
  onEdit,
  onDelete,
}) => {
  const handleEdit = (e: React.MouseEvent, listing: UnifiedListing) => {
    e.stopPropagation();
    onEdit?.(listing);
  };

  const handleDelete = (e: React.MouseEvent, listing: UnifiedListing) => {
    e.stopPropagation();
    onDelete?.(listing);
  };

  if (listings.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4">
        <div className="text-stone-400 mb-4">
          <Store className="h-16 w-16" />
        </div>
        <h3 className="text-lg font-semibold text-stone-900 dark:text-stone-100 mb-2">No listings found</h3>
        <p className="text-sm text-stone-500 dark:text-stone-400 text-center max-w-sm">
          Try adjusting your filters or create a new listing to get started.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-stone-50 dark:bg-stone-800 border-b border-stone-200 dark:border-stone-700">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-stone-500 uppercase tracking-wider">
              Listing
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-stone-500 uppercase tracking-wider">
              Type
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-stone-500 uppercase tracking-wider">
              Status
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-stone-500 uppercase tracking-wider">
              Location
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-stone-500 uppercase tracking-wider">
              Price
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-stone-500 uppercase tracking-wider">
              Analytics
            </th>
            <th className="px-6 py-3 text-right text-xs font-medium text-stone-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white dark:bg-stone-800 divide-y divide-stone-200 dark:divide-stone-700">
          {listings.map((listing, index) => {
            const TypeIcon = getTypeIcon(listing.type);
            
            return (
              <motion.tr
                key={listing.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2, delay: index * 0.05 }}
                onClick={() => onRowClick(listing)}
                className="hover:bg-stone-50 dark:hover:bg-stone-700 cursor-pointer transition-colors"
              >
                {/* Listing Name & Image */}
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="h-10 w-10 flex-shrink-0 rounded-lg overflow-hidden bg-stone-100">
                      {listing.coverImage || listing.logoImage ? (
                        <img
                          src={listing.coverImage || listing.logoImage}
                          alt={listing.name}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="h-full w-full flex items-center justify-center">
                          <TypeIcon className="h-5 w-5 text-stone-400" />
                        </div>
                      )}
                    </div>
                    <div className="ml-4">
                      <div className="flex items-center gap-2">
                        <div className="text-sm font-medium text-stone-900 max-w-xs truncate">
                          {listing.name}
                        </div>
                        {listing.isVerified && (
                          <svg className="h-4 w-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                        )}
                      </div>
                      {listing.description && (
                        <div className="text-xs text-stone-500 max-w-xs truncate">
                          {listing.description}
                        </div>
                      )}
                    </div>
                  </div>
                </td>

                {/* Type */}
                <td className="px-6 py-4 whitespace-nowrap">
                  <Badge variant={getTypeBadgeVariant(listing.type)} size="sm">
                    {listing.type}
                  </Badge>
                </td>

                {/* Status */}
                <td className="px-6 py-4 whitespace-nowrap">
                  <Badge variant={getStatusBadgeVariant(listing.status)} size="sm">
                    {listing.status}
                  </Badge>
                </td>

                {/* Location */}
                <td className="px-6 py-4 whitespace-nowrap">
                  {listing.city ? (
                    <div className="flex items-center gap-1 text-sm text-stone-600">
                      <MapPin className="h-3.5 w-3.5" />
                      <span>{listing.city}</span>
                    </div>
                  ) : (
                    <span className="text-sm text-stone-400">—</span>
                  )}
                </td>

                {/* Price */}
                <td className="px-6 py-4 whitespace-nowrap">
                  {listing.price ? (
                    <div className="text-sm font-medium text-stone-900">
                      {listing.price} {listing.currency || 'EGP'}
                    </div>
                  ) : listing.stock !== undefined ? (
                    <div className={cn(
                      'text-sm font-medium',
                      listing.stock > 0 ? 'text-emerald-600' : 'text-red-600'
                    )}>
                      {listing.stock} in stock
                    </div>
                  ) : (
                    <span className="text-sm text-stone-400">—</span>
                  )}
                </td>

                {/* Analytics */}
                <td className="px-6 py-4 whitespace-nowrap">
                  {listing.analytics ? (
                    <div className="flex items-center gap-3 text-xs text-stone-600">
                      <div className="flex items-center gap-1">
                        <Eye className="h-3.5 w-3.5" />
                        <span>{listing.analytics.views}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
                        <span>{listing.analytics.avgRating.toFixed(1)}</span>
                      </div>
                      <div className="text-stone-500">
                        {listing.analytics.reviews} reviews
                      </div>
                    </div>
                  ) : (
                    <span className="text-sm text-stone-400">—</span>
                  )}
                </td>

                {/* Actions */}
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex items-center justify-end gap-2">
                    {onEdit && (
                      <button
                        onClick={(e) => handleEdit(e, listing)}
                        className="p-1.5 text-stone-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Edit"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                    )}
                    {onDelete && (
                      <button
                        onClick={(e) => handleDelete(e, listing)}
                        className="p-1.5 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                    <button
                      className="p-1.5 text-stone-400 hover:text-stone-600 hover:bg-stone-50 rounded-lg transition-colors"
                      title="View details"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </motion.tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default ListingsTable;

