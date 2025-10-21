import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Star,
  CheckCircle,
  MapPin,
  Phone,
  Mail,
  Globe,
  Share,
  Heart,
  MessageSquare,
  Store,
  Package,
  Loader2,
  ExternalLink
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Textarea } from '@/components/ui/textarea';
import { StarRating, StarDisplay } from '@/components/StarRating';
import { getShopBySlug, addShopReview, handleShopApiError, type Shop } from '../api/shops';
import { checkIfShopIsFavorited, addFavoriteShop, removeFavoriteShop } from '@/api/user';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';



interface ShopProfileProps {
  slug: string;
}

const ShopProfile: React.FC<ShopProfileProps> = ({ slug }) => {
  const { toast } = useToast();
  const [shop, setShop] = useState<Shop | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('services');
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
  const [isFavorited, setIsFavorited] = useState(false);
  const [favoriteLoading, setFavoriteLoading] = useState(false);
  const [newReview, setNewReview] = useState({
    rating: 0,
    comment: ''
  });
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    fetchShopData();
  }, [slug]);

  const fetchShopData = async () => {
    if (!slug) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const shopData = await getShopBySlug(slug);
      setShop(shopData);
      
      // Check if shop is favorited
      if (shopData?.id) {
        const favorited = await checkIfShopIsFavorited(shopData.id);
        setIsFavorited(favorited);
      }
    } catch (err) {
      console.error('Error fetching shop:', err);
      setError(handleShopApiError(err));
    } finally {
      setLoading(false);
    }
  };


  const handleShare = async () => {
    if (navigator.share && shop) {
      try {
        await navigator.share({
          title: shop.name,
          text: shop.description || `Check out ${shop.name}`,
          url: window.location.href,
        });
      } catch (err) {
        console.log('Error sharing:', err);
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      // You could show a snackbar here
    }
  };

  const handleFavoriteToggle = async () => {
    if (!shop?.id || favoriteLoading) return;
    
    try {
      setFavoriteLoading(true);
      
      if (isFavorited) {
        await removeFavoriteShop(shop.id);
        setIsFavorited(false);
        toast({
          title: 'Removed from favorites',
          description: `${shop.name} has been removed from your favorites.`,
        });
      } else {
        await addFavoriteShop(shop.id);
        setIsFavorited(true);
        toast({
          title: 'Added to favorites',
          description: `${shop.name} has been added to your favorites.`,
        });
      }
    } catch (err) {
      console.error('Error toggling favorite:', err);
      toast({
        title: 'Error',
        description: 'Failed to update favorites. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setFavoriteLoading(false);
    }
  };

  const handleSubmitReview = async () => {
    if (!shop || newReview.rating === 0) return;

    try {
      setSubmittingReview(true);
      
      await addShopReview(shop.id, newReview);
      setReviewDialogOpen(false);
      setNewReview({ rating: 0, comment: '' });
      // Refresh shop data to show new review
      fetchShopData();
    } catch (err) {
      console.error('Error submitting review:', err);
      setError(handleShopApiError(err));
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (error || !shop) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Alert className="mb-4">
          <AlertDescription>
            {error || 'Shop not found'}
          </AlertDescription>
        </Alert>
        <Button asChild>
          <Link href="/">Back to Home</Link>
        </Button>
      </div>
    );
  }

  return (
    <>
      {/* SEO Meta Tags */}
      <title>{shop.name} - Daleel Balady</title>
      <meta name="description" content={shop.description || `Visit ${shop.name} for quality services and products.`} />
      <meta property="og:title" content={`${shop.name} - Daleel Balady`} />
      <meta property="og:description" content={shop.description || `Visit ${shop.name} for quality services and products.`} />
      <meta property="og:type" content="business.business" />
      <meta property="og:url" content={window.location.href} />
      {shop.owner.profilePic && <meta property="og:image" content={shop.owner.profilePic} />}

      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-6 max-w-6xl">
          {/* Breadcrumbs */}
          <Breadcrumb className="mb-6">
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link href="/">Home</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link href="/shops">Shops</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>{shop.name}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>

          {/* Shop Header */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative bg-gradient-to-br from-primary/10 via-background to-secondary/10 rounded-3xl p-8 mb-8 border border-border/50"
          >
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              <div className="flex items-start gap-6">
                <Avatar className="h-20 w-20 border-4 border-background shadow-lg">
                  <AvatarImage src={shop.owner.profilePic} alt={shop.name} />
                  <AvatarFallback className="text-2xl font-bold">
                    {shop.name.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h1 className="text-4xl font-bold text-foreground">{shop.name}</h1>
                    {shop.isVerified && (
                      <Badge variant="default" className="flex items-center gap-1">
                        <CheckCircle className="h-3 w-3" />
                        Verified
                      </Badge>
                    )}
                  </div>
                  
                  <p className="text-muted-foreground text-lg mb-4">{shop.description}</p>
                  
                  <div className="flex items-center gap-4 flex-wrap">
                    {shop.stats.averageRating > 0 && (
                      <div className="flex items-center gap-2">
                        <StarDisplay 
                          rating={shop.stats.averageRating} 
                          size="md" 
                          showNumber={false}
                        />
                        <span className="text-sm text-muted-foreground">
                          {shop.stats.averageRating.toFixed(1)} ({shop.stats.totalReviews} reviews)
                        </span>
                      </div>
                    )}
                    {shop.city && (
                      <Badge variant="outline" className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {shop.city}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleFavoriteToggle}
                  disabled={favoriteLoading}
                  className={cn(
                    "transition-colors",
                    isFavorited && "text-red-500 hover:text-red-600 bg-red-50 dark:bg-red-950"
                  )}
                >
                  {favoriteLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Heart className={cn("h-4 w-4", isFavorited && "fill-current")} />
                  )}
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleShare}
                >
                  <Share className="h-4 w-4" />
                </Button>
                <Button
                  onClick={() => setReviewDialogOpen(true)}
                  className="flex items-center gap-2"
                >
                  <MessageSquare className="h-4 w-4" />
                  Write Review
                </Button>
              </div>
            </div>
          </motion.div>

          {/* Statistics Cards */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
          >
            <Card className="text-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-blue-900/20 dark:to-indigo-900/20 border-blue-200 dark:border-blue-800">
              <CardContent className="p-4">
                <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                  {shop.stats.totalServices}
                </div>
                <div className="text-sm text-muted-foreground mt-1">Services</div>
              </CardContent>
            </Card>
            
            <Card className="text-center bg-gradient-to-br from-green-50 to-emerald-100 dark:from-green-900/20 dark:to-emerald-900/20 border-green-200 dark:border-green-800">
              <CardContent className="p-4">
                <div className="text-3xl font-bold text-green-600 dark:text-green-400">
                  {shop.stats.totalProducts}
                </div>
                <div className="text-sm text-muted-foreground mt-1">Products</div>
              </CardContent>
            </Card>
            
            <Card className="text-center bg-gradient-to-br from-purple-50 to-violet-100 dark:from-purple-900/20 dark:to-violet-900/20 border-purple-200 dark:border-purple-800">
              <CardContent className="p-4">
                <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                  {shop.stats.totalReviews}
                </div>
                <div className="text-sm text-muted-foreground mt-1">Reviews</div>
              </CardContent>
            </Card>
            
            <Card className="text-center bg-gradient-to-br from-yellow-50 to-orange-100 dark:from-yellow-900/20 dark:to-orange-900/20 border-yellow-200 dark:border-yellow-800">
              <CardContent className="p-4">
                <div className="text-3xl font-bold text-yellow-600 dark:text-yellow-500">
                  {shop.stats.averageRating.toFixed(1)}
                </div>
                <div className="text-sm text-muted-foreground mt-1">Rating</div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Contact Information */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-8"
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Phone className="h-5 w-5" />
                  Contact Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {shop.phone && (
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                      <Phone className="h-4 w-4 text-primary" />
                      <a 
                        href={`tel:${shop.phone}`} 
                        className="text-sm hover:underline transition-colors"
                      >
                        {shop.phone}
                      </a>
                    </div>
                  )}
                  {shop.email && (
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                      <Mail className="h-4 w-4 text-primary" />
                      <a 
                        href={`mailto:${shop.email}`} 
                        className="text-sm hover:underline transition-colors"
                      >
                        {shop.email}
                      </a>
                    </div>
                  )}
                  {shop.website && (
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                      <Globe className="h-4 w-4 text-primary" />
                      <a 
                        href={shop.website.startsWith('http') ? shop.website : `https://${shop.website}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm hover:underline transition-colors flex items-center gap-1"
                      >
                        {shop.website}
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Tabs for Services, Products, Reviews */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="services" className="flex items-center gap-2">
                  <Store className="h-4 w-4" />
                  Services
                  <Badge variant="secondary" className="ml-1 text-xs">
                    {shop.stats.totalServices}
                  </Badge>
                </TabsTrigger>
                <TabsTrigger value="products" className="flex items-center gap-2">
                  <Package className="h-4 w-4" />
                  Products
                  <Badge variant="secondary" className="ml-1 text-xs">
                    {shop.stats.totalProducts}
                  </Badge>
                </TabsTrigger>
                <TabsTrigger value="reviews" className="flex items-center gap-2">
                  <Star className="h-4 w-4" />
                  Reviews
                  <Badge variant="secondary" className="ml-1 text-xs">
                    {shop.stats.totalReviews}
                  </Badge>
                </TabsTrigger>
              </TabsList>

              {/* Services Tab */}
              <TabsContent value="services" className="mt-6">
                {shop.services.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {shop.services.map((service) => (
                      <motion.div
                        key={service.id}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        whileHover={{ y: -4 }}
                        transition={{ duration: 0.2 }}
                      >
                        <Card className="h-full hover:shadow-lg transition-shadow">
                          <CardContent className="p-6">
                            <h3 className="text-lg font-semibold mb-2">
                              {service.translation?.name_en || service.translation?.name_ar || 'Service'}
                            </h3>
                            <p className="text-muted-foreground text-sm mb-4 line-clamp-3">
                              {service.translation?.description_en || service.translation?.description_ar || ''}
                            </p>
                            
                            <div className="flex items-center justify-between mb-4">
                              <div className="text-lg font-bold text-primary">
                                {service.price ? `$${service.price}` : 'Price on request'}
                              </div>
                              <Button variant="outline" size="sm">
                                View Details
                              </Button>
                            </div>
                            
                            {service.category && service.category.length > 0 && (
                              <div className="flex flex-wrap gap-1">
                                {service.category.slice(0, 2).map((cat: any, index: number) => (
                                  <Badge key={index} variant="outline" className="text-xs">
                                    {cat.name}
                                  </Badge>
                                ))}
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Store className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-muted-foreground mb-2">
                      No services available yet
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      This shop hasn't added any services yet.
                    </p>
                  </div>
                )}
              </TabsContent>

              {/* Products Tab */}
              <TabsContent value="products" className="mt-6">
                {shop.products.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {shop.products.map((product) => (
                      <motion.div
                        key={product.id}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        whileHover={{ y: -4 }}
                        transition={{ duration: 0.2 }}
                      >
                        <Card className="h-full hover:shadow-lg transition-shadow">
                          <CardContent className="p-6">
                            <h3 className="text-lg font-semibold mb-2">
                              {product.name}
                            </h3>
                            <p className="text-muted-foreground text-sm mb-4 line-clamp-3">
                              {product.description}
                            </p>
                            
                            <div className="flex items-center justify-between mb-4">
                              <div className="text-lg font-bold text-primary">
                                ${product.price}
                              </div>
                              <Badge 
                                variant={product.stock > 0 ? "default" : "destructive"} 
                                className="text-xs"
                              >
                                {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
                              </Badge>
                            </div>
                            
                            <Button 
                              variant={product.stock > 0 ? "default" : "outline"}
                              size="sm"
                              className="w-full"
                              disabled={product.stock === 0}
                            >
                              {product.stock > 0 ? 'Add to Cart' : 'Out of Stock'}
                            </Button>
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Package className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-muted-foreground mb-2">
                      No products available yet
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      This shop hasn't added any products yet.
                    </p>
                  </div>
                )}
              </TabsContent>

              {/* Reviews Tab */}
              <TabsContent value="reviews" className="mt-6">
                {shop.reviews.length > 0 ? (
                  <div className="space-y-4">
                    {shop.reviews.map((review) => (
                      <motion.div
                        key={review.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <Card>
                          <CardContent className="p-6">
                            <div className="flex items-start gap-4">
                              <Avatar className="h-10 w-10">
                                <AvatarImage src={review.author?.profilePic} />
                                <AvatarFallback>
                                  {review.author?.name?.charAt(0) || 'A'}
                                </AvatarFallback>
                              </Avatar>
                              
                              <div className="flex-1">
                                <div className="flex items-center justify-between mb-2">
                                  <div>
                                    <h4 className="font-medium">
                                      {review.author?.name || 'Anonymous'}
                                    </h4>
                                    <StarDisplay rating={review.rating} size="sm" showNumber={false} />
                                  </div>
                                  <div className="text-sm text-muted-foreground">
                                    {new Date(review.createdAt).toLocaleDateString()}
                                  </div>
                                </div>
                                {review.comment && (
                                  <p className="text-muted-foreground">
                                    {review.comment}
                                  </p>
                                )}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Star className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-muted-foreground mb-2">
                      No reviews yet
                    </h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Be the first to write a review!
                    </p>
                    <Button onClick={() => setReviewDialogOpen(true)}>
                      Write First Review
                    </Button>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </motion.div>
        </div>
      </div>

      {/* Review Dialog */}
      <Dialog open={reviewDialogOpen} onOpenChange={setReviewDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Write a Review</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Rating</label>
              <StarRating
                rating={newReview.rating}
                onRatingChange={(rating) => setNewReview(prev => ({ ...prev, rating }))}
                size="lg"
                showText
              />
            </div>
            
            <div>
              <label className="text-sm font-medium mb-2 block">Comment (optional)</label>
              <Textarea
                placeholder="Share your experience..."
                value={newReview.comment}
                onChange={(e) => setNewReview(prev => ({ ...prev, comment: e.target.value }))}
                rows={4}
                className="resize-none"
              />
            </div>
            
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setReviewDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSubmitReview}
                disabled={newReview.rating === 0 || submittingReview}
              >
                {submittingReview ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  'Submit Review'
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ShopProfile;
