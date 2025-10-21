import React from 'react';
import { motion } from 'framer-motion';
import {
  Settings,
  Package,
  MapPin,
  DollarSign,
  Clock,
  Star,
  Phone,
  Eye,
  Heart,
  Share2,
  CheckCircle,
  Calendar,
  Tag
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  type IndependentService,
  type IndependentProduct
} from '@/api/userListings';

interface IndependentListingsResultsProps {
  results: {
    services: IndependentService[];
    products: IndependentProduct[];
  };
  loading?: boolean;
  onServiceClick?: (service: IndependentService) => void;
  onProductClick?: (product: IndependentProduct) => void;
  onContactClick?: (listing: IndependentService | IndependentProduct) => void;
  className?: string;
}

const IndependentListingsResults: React.FC<IndependentListingsResultsProps> = ({
  results,
  loading = false,
  onServiceClick,
  onProductClick,
  onContactClick,
  className = ''
}) => {
  const { services, products } = results;
  const totalResults = services.length + products.length;

  if (loading) {
    return (
      <div className={`space-y-4 ${className}`}>
        {Array.from({ length: 3 }).map((_, index) => (
          <Card key={index} className="animate-pulse">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-stone-200 rounded-full"></div>
                <div className="flex-1 space-y-3">
                  <div className="h-4 bg-stone-200 rounded w-3/4"></div>
                  <div className="h-3 bg-stone-200 rounded w-1/2"></div>
                  <div className="flex gap-2">
                    <div className="h-6 bg-stone-200 rounded w-16"></div>
                    <div className="h-6 bg-stone-200 rounded w-20"></div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (totalResults === 0) {
    return (
      <div className={`text-center py-12 ${className}`}>
        <div className="mb-4">
          <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No results found</h3>
          <p className="text-muted-foreground">
            Try adjusting your search terms or filters to find what you're looking for.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Services Section */}
      {services.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Settings className="h-5 w-5 text-blue-600" />
            <h3 className="text-lg font-semibold">Services ({services.length})</h3>
          </div>
          <div className="grid gap-4">
            {services.map((service, index) => (
              <ServiceCard
                key={service.id}
                service={service}
                index={index}
                onServiceClick={onServiceClick}
                onContactClick={onContactClick}
              />
            ))}
          </div>
        </div>
      )}

      {/* Products Section */}
      {products.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Package className="h-5 w-5 text-green-600" />
            <h3 className="text-lg font-semibold">Products ({products.length})</h3>
          </div>
          <div className="grid gap-4">
            {products.map((product, index) => (
              <ProductCard
                key={product.id}
                product={product}
                index={index}
                onProductClick={onProductClick}
                onContactClick={onContactClick}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// Service Card Component
interface ServiceCardProps {
  service: IndependentService;
  index: number;
  onServiceClick?: (service: IndependentService) => void;
  onContactClick?: (service: IndependentService) => void;
}

const ServiceCard: React.FC<ServiceCardProps> = ({
  service,
  index,
  onServiceClick,
  onContactClick
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.1 }}
    >
      <Card className="hover:shadow-lg transition-shadow cursor-pointer">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            {/* Provider Avatar */}
            <div className="relative">
              <Avatar className="h-12 w-12">
                <AvatarImage src={service.ownerUser?.profilePic} />
                <AvatarFallback>
                  {service.ownerUser?.name?.charAt(0) || 'U'}
                </AvatarFallback>
              </Avatar>
              {service.ownerUser?.isVerified && (
                <CheckCircle className="absolute -bottom-1 -right-1 h-4 w-4 text-blue-600 bg-white rounded-full" />
              )}
            </div>

            {/* Service Details */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h4 className="text-xl font-semibold mb-1 hover:text-primary cursor-pointer" 
                      onClick={() => onServiceClick?.(service)}>
                    {service.translation?.name_en || 'Unnamed Service'}
                  </h4>
                  <p className="text-sm text-muted-foreground mb-2">
                    by {service.ownerUser?.name || 'Unknown User'}
                  </p>
                  {service.translation?.description_en && (
                    <p className="text-muted-foreground mb-3 line-clamp-2">
                      {service.translation.description_en}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-1 ml-4">
                  <Button variant="ghost" size="sm">
                    <Heart className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Share2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Service Info */}
              <div className="flex flex-wrap items-center gap-4 mb-3 text-sm text-muted-foreground">
                {service.price && (
                  <div className="flex items-center gap-1">
                    <DollarSign className="h-4 w-4" />
                    <span className="font-medium text-foreground">
                      {service.price} {service.currency || 'EGP'}
                    </span>
                  </div>
                )}
                {service.durationMins && (
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    <span>{service.durationMins} mins</span>
                  </div>
                )}
                {service.city && (
                  <div className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    <span>{service.city}</span>
                  </div>
                )}
                {service.stats && (
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 text-yellow-500" />
                    <span>{service.stats.averageRating.toFixed(1)}</span>
                    <span>({service.stats.totalReviews})</span>
                  </div>
                )}
              </div>

              {/* Tags and Status */}
              <div className="flex items-center justify-between">
                <div className="flex flex-wrap gap-1">
                  <Badge variant={service.available ? "default" : "secondary"} className="text-xs">
                    {service.available ? 'Available' : 'Unavailable'}
                  </Badge>
                  {service.tags?.slice(0, 3).map((tag) => (
                    <Badge key={tag.name} variant="outline" className="text-xs">
                      {tag.name}
                    </Badge>
                  ))}
                  {service.tags && service.tags.length > 3 && (
                    <Badge variant="outline" className="text-xs">
                      +{service.tags.length - 3}
                    </Badge>
                  )}
                </div>
                
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => onServiceClick?.(service)}
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    View
                  </Button>
                  {service.phone && (
                    <Button 
                      size="sm"
                      onClick={() => onContactClick?.(service)}
                    >
                      <Phone className="h-4 w-4 mr-1" />
                      Contact
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

// Product Card Component
interface ProductCardProps {
  product: IndependentProduct;
  index: number;
  onProductClick?: (product: IndependentProduct) => void;
  onContactClick?: (product: IndependentProduct) => void;
}

const ProductCard: React.FC<ProductCardProps> = ({
  product,
  index,
  onProductClick,
  onContactClick
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.1 }}
    >
      <Card className="hover:shadow-lg transition-shadow cursor-pointer">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            {/* Provider Avatar */}
            <div className="relative">
              <Avatar className="h-12 w-12">
                <AvatarImage src={product.ownerUser?.profilePic} />
                <AvatarFallback>
                  {product.ownerUser?.name?.charAt(0) || 'U'}
                </AvatarFallback>
              </Avatar>
              {product.ownerUser?.isVerified && (
                <CheckCircle className="absolute -bottom-1 -right-1 h-4 w-4 text-blue-600 bg-white rounded-full" />
              )}
            </div>

            {/* Product Details */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h4 className="text-xl font-semibold mb-1 hover:text-primary cursor-pointer"
                      onClick={() => onProductClick?.(product)}>
                    {product.name || 'Unnamed Product'}
                  </h4>
                  <p className="text-sm text-muted-foreground mb-2">
                    by {product.ownerUser?.name || 'Unknown User'}
                  </p>
                  {product.description && (
                    <p className="text-muted-foreground mb-3 line-clamp-2">
                      {product.description}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-1 ml-4">
                  <Button variant="ghost" size="sm">
                    <Heart className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Share2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Product Info */}
              <div className="flex flex-wrap items-center gap-4 mb-3 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <DollarSign className="h-4 w-4" />
                  <span className="font-medium text-foreground">
                    {product.price ? `${product.price} ${product.currency || 'EGP'}` : 'Price on request'}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <Package className="h-4 w-4" />
                  <span>Stock: {product.stock || 0}</span>
                </div>
                {product.stats && (
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 text-yellow-500" />
                    <span>{product.stats.averageRating.toFixed(1)}</span>
                    <span>({product.stats.totalReviews})</span>
                  </div>
                )}
              </div>

              {/* Tags and Status */}
              <div className="flex items-center justify-between">
                <div className="flex flex-wrap gap-1">
                  <Badge variant={product.isActive ? "default" : "secondary"} className="text-xs">
                    {product.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                  <Badge 
                    variant={(product.stock || 0) > 0 ? "default" : "destructive"} 
                    className="text-xs"
                  >
                    {(product.stock || 0) > 0 ? 'In Stock' : 'Out of Stock'}
                  </Badge>
                  {product.tags?.slice(0, 2).map((tag) => (
                    <Badge key={tag.name} variant="outline" className="text-xs">
                      {tag.name}
                    </Badge>
                  ))}
                  {product.tags && product.tags.length > 2 && (
                    <Badge variant="outline" className="text-xs">
                      +{product.tags.length - 2}
                    </Badge>
                  )}
                </div>
                
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => onProductClick?.(product)}
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    View
                  </Button>
                  <Button 
                    size="sm"
                    onClick={() => onContactClick?.(product)}
                  >
                    <Phone className="h-4 w-4 mr-1" />
                    Contact
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default IndependentListingsResults;
