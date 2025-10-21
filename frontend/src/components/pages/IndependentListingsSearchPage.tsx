import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Search as SearchIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import IndependentListingsSearch from '@/components/search/IndependentListingsSearch';
import IndependentListingsResults from '@/components/search/IndependentListingsResults';
import { useToast } from '@/components/ui/use-toast';
import ClientOnly from '@/components/ClientOnly';
import {
  type IndependentService,
  type IndependentProduct
} from '@/api/userListings';

const IndependentListingsSearchPage: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [searchResults, setSearchResults] = useState<{
    services: IndependentService[];
    products: IndependentProduct[];
  }>({
    services: [],
    products: []
  });

  const [isSearching, setIsSearching] = useState(false);

  const handleSearchResults = (results: { services: IndependentService[]; products: IndependentProduct[] }) => {
    setSearchResults(results);
    setIsSearching(false);
  };

  const handleServiceClick = (service: IndependentService) => {
    // Navigate to service detail page
    navigate(`/listings/services/${service.id}`);
  };

  const handleProductClick = (product: IndependentProduct) => {
    // Navigate to product detail page
    navigate(`/listings/products/${product.id}`);
  };

  const handleContactClick = (listing: IndependentService | IndependentProduct) => {
    // Check if listing is a service (has phone property)
    if ('phone' in listing && listing.phone) {
      // Open phone dialer or show contact modal - only on client side
      if (typeof window !== 'undefined') {
        window.open(`tel:${listing.phone}`);
      }
    } else {
      toast({
        title: "Contact Information",
        description: "No contact information available for this listing.",
        variant: "destructive"
      });
    }
  };

  return (
    <ClientOnly 
      fallback={
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading...</p>
          </div>
        </div>
      }
    >
      <title>Search Independent Listings - Daleel Balady</title>
      <meta name="description" content="Find independent services and products from local providers without shops." />

      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-6 max-w-6xl">
          {/* Header */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className="flex items-center gap-4 mb-6">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate(-1)}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Back
              </Button>
            </div>

            <div className="text-center mb-8">
              <div className="flex items-center justify-center gap-3 mb-4">
                <div className="p-3 bg-primary/10 rounded-full">
                  <SearchIcon className="h-8 w-8 text-primary" />
                </div>
                <h1 className="text-4xl font-bold text-foreground">
                  Find Independent Listings
                </h1>
              </div>
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                Discover services and products from individual providers who offer their expertise 
                and goods directly, without needing a full shop setup.
              </p>
            </div>
          </motion.div>

          {/* Search Component */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-8"
          >
            <IndependentListingsSearch
              onResults={handleSearchResults}
              showFilters={true}
            />
          </motion.div>

          {/* Results Component */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <IndependentListingsResults
              results={searchResults}
              loading={isSearching}
              onServiceClick={handleServiceClick}
              onProductClick={handleProductClick}
              onContactClick={handleContactClick}
            />
          </motion.div>

          {/* Getting Started Section */}
          {searchResults.services.length === 0 && searchResults.products.length === 0 && !isSearching && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-center py-16"
            >
              <div className="max-w-2xl mx-auto">
                <h2 className="text-2xl font-semibold mb-4">How to Get Started</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
                  <div className="space-y-3">
                    <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto md:mx-0">
                      <SearchIcon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <h3 className="font-semibold text-center md:text-left">1. Search</h3>
                    <p className="text-muted-foreground text-sm text-center md:text-left">
                      Use the search bar above to find services or products you need. Try keywords like "repair", "handmade", or specific services.
                    </p>
                  </div>
                  <div className="space-y-3">
                    <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto md:mx-0">
                      <SearchIcon className="h-6 w-6 text-green-600 dark:text-green-400" />
                    </div>
                    <h3 className="font-semibold text-center md:text-left">2. Filter</h3>
                    <p className="text-muted-foreground text-sm text-center md:text-left">
                      Use the advanced filters to narrow down results by price, location, availability, and tags to find exactly what you need.
                    </p>
                  </div>
                  <div className="space-y-3">
                    <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center mx-auto md:mx-0">
                      <SearchIcon className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                    </div>
                    <h3 className="font-semibold text-center md:text-left">3. Connect</h3>
                    <p className="text-muted-foreground text-sm text-center md:text-left">
                      Contact providers directly through their listings to discuss details, pricing, and arrange services or purchases.
                    </p>
                  </div>
                </div>

                <div className="mt-8">
                  <p className="text-muted-foreground mb-4">
                    Want to offer your own services or products?
                  </p>
                  <Button
                    onClick={() => navigate('/dashboard/independent-listings')}
                    className="mx-auto"
                  >
                    Create Your Independent Listing
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </ClientOnly>
  );
};

export default IndependentListingsSearchPage;
