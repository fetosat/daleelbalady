import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { useNavigate } from '@/lib/router-compat';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Navbar } from '@/components/Navbar';
import { useAuth } from '@/lib/auth';
import { useProductTitle } from '@/hooks/useDocumentTitle';
import {
  ArrowLeft,
  Package,
  Store,
  User,
  ShoppingBag,
  Star,
  Heart,
  Share2,
  MapPin,
  Phone,
  Mail,
  Eye,
  Clock,
  Activity
} from 'lucide-react';

interface Product {
  id: string;
  vid?: string;
  name: string;
  description?: string;
  price: number;
  currency?: string;
  stock: number;
  sku?: string;
  isActive?: boolean;
  createdAt: string;
  shop: {
    id: string;
    vid?: string;
    name: string;
    slug?: string;
    owner?: {
      id: string;
      name: string;
      profilePic?: string;
    };
  };
  _count?: {
    reviews: number;
  };
}

const ProductProfile = () => {
  const params = useParams();
  const id = params?.id as string;
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const { user: currentUser } = useAuth();
  
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const isRTL = i18n.language === 'ar';

  // Set dynamic document title
  useProductTitle(product?.name);

  useEffect(() => {
    const fetchProduct = async () => {
      if (!id) {
        setError('Invalid product ID');
        setLoading(false);
        return;
      }
      
      try {
        const response = await fetch(`https://api.daleelbalady.com/api/products/${id}`);
        if (!response.ok) {
          throw new Error('Product not found');
        }
        
        const data = await response.json();
        if (data.success) {
          setProduct(data.product);
        } else {
          throw new Error(data.message || 'Failed to fetch product');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load product');
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  const handleAddToCart = async () => {
    if (!currentUser || !product) {
      navigate('/login');
      return;
    }

    try {
      const response = await fetch(`https://api.daleelbalady.com/api/cart/${currentUser.id}/add`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('daleel-token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          type: 'PRODUCT',
          productId: product.id,
          quantity: 1
        })
      });

      if (response.ok) {
        // Show success message or update UI
        console.log('Product added to cart successfully');
      }
    } catch (error) {
      console.error('Failed to add product to cart:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-stone-50 via-white to-blue-50/30 dark:from-stone-950 dark:via-stone-900 dark:to-stone-800/50">
        <Navbar />
        <div className="min-h-screen pt-24 flex items-center justify-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="w-16 h-16 border-4 border-blue-500 dark:border-stone-400 border-t-transparent rounded-full"
          />
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-stone-50 via-white to-blue-50/30 dark:from-stone-950 dark:via-stone-900 dark:to-stone-800/50">
        <Navbar />
        <div className="min-h-screen pt-24 flex items-center justify-center px-6">
          <Card className="max-w-md mx-auto bg-white/90 dark:bg-stone-900/90 backdrop-blur-lg border border-white/20 dark:border-stone-700/20">
            <CardContent className="p-8 text-center">
              <Package className="h-16 w-16 text-stone-400 dark:text-stone-500 mx-auto mb-4" />
              <h2 className="text-2xl font-semibold text-stone-900 dark:text-stone-100 mb-2">
                {isRTL ? 'المنتج غير موجود' : 'Product Not Found'}
              </h2>
              <p className="text-stone-600 dark:text-stone-400 mb-6">
                {error || (isRTL ? 'لا يمكن العثور على هذا المنتج' : 'This product could not be found')}
              </p>
              <Button onClick={() => navigate(-1)} variant="outline">
                <ArrowLeft className="h-4 w-4 mr-2" />
                {isRTL ? 'عودة' : 'Go Back'}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-50 via-white to-blue-50/30 dark:from-stone-950 dark:via-stone-900 dark:to-stone-800/50">
      <Navbar />
      
      <div className="pt-20">
        <div className="max-w-6xl mx-auto px-6 py-8">
          {/* Back Button */}
          <Button
            onClick={() => navigate(-1)}
            variant="ghost"
            className="mb-6 gap-2"
          >
            <ArrowLeft className={`h-4 w-4 ${isRTL ? 'rotate-180' : ''}`} />
            {isRTL ? 'عودة' : 'Back'}
          </Button>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Product Image */}
            <Card className="bg-white/90 dark:bg-stone-900/90 backdrop-blur-lg border border-white/20 dark:border-stone-700/20">
              <CardContent className="p-0">
                <div className="relative h-96 bg-gradient-to-br from-stone-100 to-stone-200 dark:from-stone-800 dark:to-stone-700 flex items-center justify-center rounded-lg">
                  <Package className="h-32 w-32 text-stone-400" />
                  
                  {/* Status Badges */}
                  <div className="absolute top-4 left-4">
                    {product.stock > 0 ? (
                      <Badge className="bg-emerald-500 text-white">
                        {isRTL ? 'متوفر' : 'In Stock'}
                      </Badge>
                    ) : (
                      <Badge className="bg-red-500 text-white">
                        {isRTL ? 'نفد' : 'Out of Stock'}
                      </Badge>
                    )}
                  </div>
                  
                  <div className="absolute top-4 right-4 flex gap-2">
                    <Button variant="ghost" size="sm" className="bg-white/80 dark:bg-stone-900/80">
                      <Heart className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" className="bg-white/80 dark:bg-stone-900/80">
                      <Share2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Product Details */}
            <div className="space-y-6">
              <Card className="bg-white/90 dark:bg-stone-900/90 backdrop-blur-lg border border-white/20 dark:border-stone-700/20">
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div>
                      <h1 className="text-3xl font-bold text-stone-900 dark:text-stone-100 mb-2">
                        {product.name}
                      </h1>
                      <div className="flex items-center gap-4 text-sm text-stone-600 dark:text-stone-400">
                        {product.sku && <span>SKU: {product.sku}</span>}
                        <span>{product.stock} {isRTL ? 'قطعة متاحة' : 'in stock'}</span>
                      </div>
                    </div>

                    <div className="text-4xl font-bold text-blue-600 dark:text-blue-400">
                      {product.price} {product.currency || 'EGP'}
                    </div>

                    {product.description && (
                      <div>
                        <h3 className="font-semibold text-stone-900 dark:text-stone-100 mb-2">
                          {isRTL ? 'الوصف' : 'Description'}
                        </h3>
                        <p className="text-stone-700 dark:text-stone-300 leading-relaxed">
                          {product.description}
                        </p>
                      </div>
                    )}

                    <div className="flex items-center gap-3 pt-4">
                      <Button
                        onClick={handleAddToCart}
                        disabled={product.stock === 0 || !currentUser}
                        className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                      >
                        <ShoppingBag className="h-4 w-4 mr-2" />
                        {isRTL ? 'أضف للسلة' : 'Add to Cart'}
                      </Button>
                      <Button variant="outline" size="icon">
                        <Heart className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Shop Info */}
              <Card className="bg-white/90 dark:bg-stone-900/90 backdrop-blur-lg border border-white/20 dark:border-stone-700/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Store className="h-5 w-5" />
                    {isRTL ? 'بائع بواسطة' : 'Sold by'}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage src={product.shop.owner?.profilePic} />
                        <AvatarFallback>
                          {product.shop.name.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h4 className="font-semibold text-stone-900 dark:text-stone-100">
                          {product.shop.name}
                        </h4>
                        <p className="text-sm text-stone-600 dark:text-stone-400">
                          {product.shop.owner?.name}
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      onClick={() => navigate(`/shop/${product.shop.slug || product.shop.id}`)}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      {isRTL ? 'عرض المتجر' : 'View Shop'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductProfile;
