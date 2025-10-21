'use client'

import React from 'react';
import { useRouter } from 'next/navigation';
import { 
  Star, MapPin, Phone, Mail, Clock, DollarSign, 
  ShoppingBag, Package, User, Store, Award, 
  CheckCircle, Heart, Share2, ExternalLink,
  Users, Calendar, TrendingUp, MessageCircle,
  BadgeCheck, Shield, Zap, Tag, Eye
} from 'lucide-react';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';

// ==================== USER CARD ====================
interface UserCardProps {
  user: {
    id: string;
    name: string;
    email?: string;
    phone?: string;
    profilePic?: string;
    bio?: string;
    city?: string;
    isVerified?: boolean;
    verifiedBadge?: string;
    role?: string;
    rating?: number;
    reviewsCount?: number;
    servicesCount?: number;
    shopsCount?: number;
    memberSince?: string;
  };
  viewMode?: 'grid' | 'list';
}

export function UserCard({ user, viewMode = 'grid' }: UserCardProps) {
  const router = useRouter();

  const getRoleBadge = (role?: string) => {
    switch (role) {
      case 'PROVIDER':
        return { label: 'مزود خدمة', color: 'bg-blue-500' };
      case 'BUSINESS':
        return { label: 'صاحب عمل', color: 'bg-purple-500' };
      case 'PROFESSIONAL':
        return { label: 'محترف', color: 'bg-green-500' };
      default:
        return { label: 'مستخدم', color: 'bg-stone-500' };
    }
  };

  const roleBadge = getRoleBadge(user.role);

  if (viewMode === 'list') {
    return (
      <Card 
        className="hover:shadow-lg transition-all cursor-pointer group"
        onClick={() => router.push(`/listing/${user.id}`)}
      >
        <div className="flex flex-col sm:flex-row">
          {/* صورة المستخدم */}
          <div className="relative w-full sm:w-48 h-48 overflow-hidden">
            <Avatar className="w-full h-full rounded-none">
              <AvatarImage src={user.profilePic} alt={user.name} className="object-cover" />
              <AvatarFallback className="text-4xl rounded-none">
                {user.name.charAt(0)}
              </AvatarFallback>
            </Avatar>
            {user.isVerified && (
              <div className="absolute top-2 right-2">
                <Badge className="bg-green-500 text-white gap-1">
                  <BadgeCheck className="h-3 w-3" />
                  موثق
                </Badge>
              </div>
            )}
          </div>

          {/* المحتوى */}
          <CardContent className="flex-1 p-4 sm:p-6">
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1">
                <h3 className="text-xl font-bold mb-1 group-hover:text-primary transition-colors">
                  {user.name}
                </h3>
                <Badge className={cn("text-xs", roleBadge.color, "text-white")}>
                  {roleBadge.label}
                </Badge>
              </div>
            </div>

            {user.bio && (
              <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                {user.bio}
              </p>
            )}

            {/* معلومات سريعة */}
            <div className="flex flex-wrap gap-3 text-sm text-muted-foreground mb-3">
              {user.city && (
                <div className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  <span>{user.city}</span>
                </div>
              )}
              {user.rating && (
                <div className="flex items-center gap-1 text-yellow-600">
                  <Star className="h-4 w-4 fill-current" />
                  <span>{user.rating.toFixed(1)}</span>
                  <span className="text-muted-foreground">({user.reviewsCount || 0})</span>
                </div>
              )}
              {user.memberSince && (
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  <span>عضو منذ {new Date(user.memberSince).getFullYear()}</span>
                </div>
              )}
            </div>

            {/* إحصائيات */}
            <div className="flex gap-4 pt-3 border-t">
              {user.servicesCount !== undefined && (
                <div className="text-center">
                  <div className="text-lg font-bold text-primary">{user.servicesCount}</div>
                  <div className="text-xs text-muted-foreground">خدمة</div>
                </div>
              )}
              {user.shopsCount !== undefined && (
                <div className="text-center">
                  <div className="text-lg font-bold text-primary">{user.shopsCount}</div>
                  <div className="text-xs text-muted-foreground">متجر</div>
                </div>
              )}
            </div>
          </CardContent>
        </div>
      </Card>
    );
  }

  // Grid View
  return (
    <Card 
      className="hover:shadow-xl transition-all cursor-pointer group overflow-hidden"
      onClick={() => router.push(`/listing/${user.id}`)}
    >
      {/* صورة المستخدم مع Overlay */}
      <div className="relative h-48 overflow-hidden bg-gradient-to-br from-blue-500 to-purple-600">
        <Avatar className="w-full h-full rounded-none">
          <AvatarImage src={user.profilePic} alt={user.name} className="object-cover group-hover:scale-110 transition-transform duration-300" />
          <AvatarFallback className="text-6xl rounded-none bg-transparent text-white">
            {user.name.charAt(0)}
          </AvatarFallback>
        </Avatar>
        
        {/* Badges */}
        <div className="absolute top-2 right-2 flex gap-2">
          {user.isVerified && (
            <Badge className="bg-green-500 text-white gap-1 shadow-lg">
              <BadgeCheck className="h-3 w-3" />
              موثق
            </Badge>
          )}
        </div>

        {/* Role Badge */}
        <div className="absolute bottom-2 left-2">
          <Badge className={cn("text-xs", roleBadge.color, "text-white shadow-lg")}>
            {roleBadge.label}
          </Badge>
        </div>
      </div>

      <CardContent className="p-4">
        {/* الاسم والتقييم */}
        <div className="mb-3">
          <h3 className="text-lg font-bold mb-1 group-hover:text-primary transition-colors line-clamp-1">
            {user.name}
          </h3>
          {user.rating && (
            <div className="flex items-center gap-1 text-sm">
              <Star className="h-4 w-4 fill-yellow-500 text-yellow-500" />
              <span className="font-semibold">{user.rating.toFixed(1)}</span>
              <span className="text-muted-foreground">({user.reviewsCount || 0} تقييم)</span>
            </div>
          )}
        </div>

        {/* الوصف */}
        {user.bio && (
          <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
            {user.bio}
          </p>
        )}

        {/* المدينة */}
        {user.city && (
          <div className="flex items-center gap-1 text-sm text-muted-foreground mb-3">
            <MapPin className="h-4 w-4" />
            <span>{user.city}</span>
          </div>
        )}

        {/* إحصائيات */}
        <div className="flex gap-4 pt-3 border-t">
          {user.servicesCount !== undefined && (
            <div className="flex-1 text-center">
              <div className="text-xl font-bold text-primary">{user.servicesCount}</div>
              <div className="text-xs text-muted-foreground">خدمة</div>
            </div>
          )}
          {user.shopsCount !== undefined && (
            <div className="flex-1 text-center">
              <div className="text-xl font-bold text-primary">{user.shopsCount}</div>
              <div className="text-xs text-muted-foreground">متجر</div>
            </div>
          )}
        </div>
      </CardContent>

      <CardFooter className="p-4 pt-0 flex gap-2">
        <Button className="flex-1" size="sm">
          عرض الملف الشخصي
        </Button>
        <Button variant="outline" size="sm" className="gap-1">
          <MessageCircle className="h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  );
}

// ==================== SERVICE CARD ====================
interface ServiceCardProps {
  service: {
    id: string;
    name: string;
    description?: string;
    price?: number;
    currency?: string;
    coverImage?: string;
    category?: { name: string };
    subCategory?: { name: string };
    provider?: {
      name: string;
      profilePic?: string;
      isVerified?: boolean;
    };
    city?: string;
    rating?: number;
    reviewsCount?: number;
    bookingsCount?: number;
    durationMins?: number;
    isVerified?: boolean;
  };
  viewMode?: 'grid' | 'list';
}

export function ServiceCard({ service, viewMode = 'grid' }: ServiceCardProps) {
  const router = useRouter();

  if (viewMode === 'list') {
    return (
      <Card 
        className="hover:shadow-lg transition-all cursor-pointer group"
        onClick={() => router.push(`/service/${service.id}`)}
      >
        <div className="flex flex-col sm:flex-row">
          {/* صورة الخدمة */}
          <div className="relative w-full sm:w-64 h-48 overflow-hidden">
            {service.coverImage ? (
              <img 
                src={service.coverImage} 
                alt={service.name}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-green-400 to-blue-500 flex items-center justify-center">
                <Package className="h-16 w-16 text-white opacity-50" />
              </div>
            )}
            {service.isVerified && (
              <div className="absolute top-2 right-2">
                <Badge className="bg-green-500 text-white gap-1">
                  <Shield className="h-3 w-3" />
                  موثوق
                </Badge>
              </div>
            )}
          </div>

          {/* المحتوى */}
          <CardContent className="flex-1 p-4 sm:p-6">
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1">
                <h3 className="text-xl font-bold mb-1 group-hover:text-primary transition-colors">
                  {service.name}
                </h3>
                <div className="flex gap-2 mb-2">
                  {service.category && (
                    <Badge variant="secondary" className="text-xs">
                      {service.category.name}
                    </Badge>
                  )}
                  {service.subCategory && (
                    <Badge variant="outline" className="text-xs">
                      {service.subCategory.name}
                    </Badge>
                  )}
                </div>
              </div>
              {service.price && (
                <div className="text-left">
                  <div className="text-2xl font-bold text-green-600">
                    {service.price}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {service.currency || 'جنيه'}
                  </div>
                </div>
              )}
            </div>

            {service.description && (
              <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                {service.description}
              </p>
            )}

            {/* مقدم الخدمة */}
            {service.provider && (
              <div className="flex items-center gap-2 mb-3 p-2 bg-muted/50 rounded-lg">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={service.provider.profilePic} />
                  <AvatarFallback>{service.provider.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="text-sm font-medium">{service.provider.name}</div>
                </div>
                {service.provider.isVerified && (
                  <BadgeCheck className="h-4 w-4 text-green-500" />
                )}
              </div>
            )}

            {/* معلومات إضافية */}
            <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
              {service.city && (
                <div className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  <span>{service.city}</span>
                </div>
              )}
              {service.rating && (
                <div className="flex items-center gap-1 text-yellow-600">
                  <Star className="h-4 w-4 fill-current" />
                  <span>{service.rating.toFixed(1)}</span>
                  <span className="text-muted-foreground">({service.reviewsCount || 0})</span>
                </div>
              )}
              {service.durationMins && (
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  <span>{service.durationMins} دقيقة</span>
                </div>
              )}
              {service.bookingsCount !== undefined && (
                <div className="flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  <span>{service.bookingsCount} حجز</span>
                </div>
              )}
            </div>
          </CardContent>
        </div>
      </Card>
    );
  }

  // Grid View
  return (
    <Card 
      className="hover:shadow-xl transition-all cursor-pointer group overflow-hidden"
      onClick={() => router.push(`/service/${service.id}`)}
    >
      {/* صورة الخدمة */}
      <div className="relative h-48 overflow-hidden">
        {service.coverImage ? (
          <img 
            src={service.coverImage} 
            alt={service.name}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-green-400 to-blue-500 flex items-center justify-center">
            <Package className="h-16 w-16 text-white opacity-50" />
          </div>
        )}
        
        {/* السعر */}
        {service.price && (
          <div className="absolute top-2 left-2">
            <Badge className="bg-green-600 text-white text-lg px-3 py-1 shadow-lg">
              {service.price} {service.currency || 'جنيه'}
            </Badge>
          </div>
        )}

        {/* موثوق */}
        {service.isVerified && (
          <div className="absolute top-2 right-2">
            <Badge className="bg-white text-green-600 gap-1">
              <Shield className="h-3 w-3" />
              موثوق
            </Badge>
          </div>
        )}
      </div>

      <CardContent className="p-4">
        {/* الفئة */}
        <div className="flex gap-2 mb-2">
          {service.category && (
            <Badge variant="secondary" className="text-xs">
              {service.category.name}
            </Badge>
          )}
          {service.subCategory && (
            <Badge variant="outline" className="text-xs">
              {service.subCategory.name}
            </Badge>
          )}
        </div>

        {/* الاسم */}
        <h3 className="text-lg font-bold mb-2 group-hover:text-primary transition-colors line-clamp-2">
          {service.name}
        </h3>

        {/* الوصف */}
        {service.description && (
          <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
            {service.description}
          </p>
        )}

        {/* مقدم الخدمة */}
        {service.provider && (
          <div className="flex items-center gap-2 mb-3">
            <Avatar className="h-6 w-6">
              <AvatarImage src={service.provider.profilePic} />
              <AvatarFallback className="text-xs">{service.provider.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <span className="text-sm font-medium">{service.provider.name}</span>
            {service.provider.isVerified && (
              <BadgeCheck className="h-3 w-3 text-green-500" />
            )}
          </div>
        )}

        {/* التقييم والمعلومات */}
        <div className="flex items-center justify-between text-sm">
          {service.rating && (
            <div className="flex items-center gap-1">
              <Star className="h-4 w-4 fill-yellow-500 text-yellow-500" />
              <span className="font-semibold">{service.rating.toFixed(1)}</span>
              <span className="text-muted-foreground text-xs">({service.reviewsCount || 0})</span>
            </div>
          )}
          {service.durationMins && (
            <div className="flex items-center gap-1 text-muted-foreground">
              <Clock className="h-3 w-3" />
              <span className="text-xs">{service.durationMins} د</span>
            </div>
          )}
        </div>
      </CardContent>

      <CardFooter className="p-4 pt-0">
        <Button className="w-full gap-2" size="sm">
          <Calendar className="h-4 w-4" />
          احجز الآن
        </Button>
      </CardFooter>
    </Card>
  );
}

// ==================== SHOP CARD ====================
interface ShopCardProps {
  shop: {
    id: string;
    name: string;
    description?: string;
    logoImage?: string;
    coverImage?: string;
    category?: { name: string };
    owner?: {
      name: string;
      isVerified?: boolean;
    };
    city?: string;
    address?: string;
    rating?: number;
    reviewsCount?: number;
    productsCount?: number;
    servicesCount?: number;
    isVerified?: boolean;
    isOpen?: boolean;
  };
  viewMode?: 'grid' | 'list';
}

export function ShopCard({ shop, viewMode = 'grid' }: ShopCardProps) {
  const router = useRouter();

  if (viewMode === 'list') {
    return (
      <Card 
        className="hover:shadow-lg transition-all cursor-pointer group"
        onClick={() => router.push(`/shop/${shop.id}`)}
      >
        <div className="flex flex-col sm:flex-row">
          {/* صورة المتجر */}
          <div className="relative w-full sm:w-64 h-48 overflow-hidden">
            {shop.coverImage ? (
              <img 
                src={shop.coverImage} 
                alt={shop.name}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-purple-400 to-pink-500 flex items-center justify-center">
                <Store className="h-16 w-16 text-white opacity-50" />
              </div>
            )}
            
            {/* Logo */}
            {shop.logoImage && (
              <div className="absolute bottom-2 right-2">
                <Avatar className="h-16 w-16 border-4 border-white shadow-lg">
                  <AvatarImage src={shop.logoImage} />
                  <AvatarFallback>{shop.name.charAt(0)}</AvatarFallback>
                </Avatar>
              </div>
            )}

            {/* حالة المتجر */}
            {shop.isOpen !== undefined && (
              <div className="absolute top-2 right-2">
                <Badge className={shop.isOpen ? "bg-green-500 text-white" : "bg-red-500 text-white"}>
                  {shop.isOpen ? 'مفتوح' : 'مغلق'}
                </Badge>
              </div>
            )}
          </div>

          {/* المحتوى */}
          <CardContent className="flex-1 p-4 sm:p-6">
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-xl font-bold group-hover:text-primary transition-colors">
                    {shop.name}
                  </h3>
                  {shop.isVerified && (
                    <BadgeCheck className="h-5 w-5 text-green-500" />
                  )}
                </div>
                {shop.category && (
                  <Badge variant="secondary" className="text-xs mb-2">
                    {shop.category.name}
                  </Badge>
                )}
              </div>
            </div>

            {shop.description && (
              <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                {shop.description}
              </p>
            )}

            {/* المعلومات */}
            <div className="flex flex-wrap gap-3 text-sm text-muted-foreground mb-3">
              {shop.address && (
                <div className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  <span>{shop.address}, {shop.city}</span>
                </div>
              )}
              {shop.rating && (
                <div className="flex items-center gap-1 text-yellow-600">
                  <Star className="h-4 w-4 fill-current" />
                  <span>{shop.rating.toFixed(1)}</span>
                  <span className="text-muted-foreground">({shop.reviewsCount || 0})</span>
                </div>
              )}
            </div>

            {/* إحصائيات */}
            <div className="flex gap-4 pt-3 border-t">
              {shop.productsCount !== undefined && (
                <div className="text-center">
                  <div className="text-lg font-bold text-primary">{shop.productsCount}</div>
                  <div className="text-xs text-muted-foreground">منتج</div>
                </div>
              )}
              {shop.servicesCount !== undefined && (
                <div className="text-center">
                  <div className="text-lg font-bold text-primary">{shop.servicesCount}</div>
                  <div className="text-xs text-muted-foreground">خدمة</div>
                </div>
              )}
            </div>
          </CardContent>
        </div>
      </Card>
    );
  }

  // Grid View - يتبع...
  return (
    <Card 
      className="hover:shadow-xl transition-all cursor-pointer group overflow-hidden"
      onClick={() => router.push(`/shop/${shop.id}`)}
    >
      {/* صورة المتجر */}
      <div className="relative h-48 overflow-hidden">
        {shop.coverImage ? (
          <img 
            src={shop.coverImage} 
            alt={shop.name}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-purple-400 to-pink-500 flex items-center justify-center">
            <Store className="h-16 w-16 text-white opacity-50" />
          </div>
        )}

        {/* Logo */}
        {shop.logoImage && (
          <div className="absolute bottom-2 right-2">
            <Avatar className="h-16 w-16 border-4 border-white shadow-lg">
              <AvatarImage src={shop.logoImage} />
              <AvatarFallback>{shop.name.charAt(0)}</AvatarFallback>
            </Avatar>
          </div>
        )}

        {/* حالة المتجر */}
        {shop.isOpen !== undefined && (
          <div className="absolute top-2 right-2">
            <Badge className={shop.isOpen ? "bg-green-500 text-white shadow-lg" : "bg-red-500 text-white shadow-lg"}>
              {shop.isOpen ? 'مفتوح' : 'مغلق'}
            </Badge>
          </div>
        )}
      </div>

      <CardContent className="p-4">
        {/* الاسم */}
        <div className="flex items-center gap-2 mb-2">
          <h3 className="text-lg font-bold group-hover:text-primary transition-colors line-clamp-1 flex-1">
            {shop.name}
          </h3>
          {shop.isVerified && (
            <BadgeCheck className="h-5 w-5 text-green-500 flex-shrink-0" />
          )}
        </div>

        {/* الفئة */}
        {shop.category && (
          <Badge variant="secondary" className="text-xs mb-2">
            {shop.category.name}
          </Badge>
        )}

        {/* الوصف */}
        {shop.description && (
          <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
            {shop.description}
          </p>
        )}

        {/* الموقع */}
        {shop.city && (
          <div className="flex items-center gap-1 text-sm text-muted-foreground mb-3">
            <MapPin className="h-4 w-4" />
            <span className="line-clamp-1">{shop.address || shop.city}</span>
          </div>
        )}

        {/* التقييم */}
        {shop.rating && (
          <div className="flex items-center gap-1 mb-3">
            <Star className="h-4 w-4 fill-yellow-500 text-yellow-500" />
            <span className="font-semibold text-sm">{shop.rating.toFixed(1)}</span>
            <span className="text-muted-foreground text-xs">({shop.reviewsCount || 0} تقييم)</span>
          </div>
        )}

        {/* إحصائيات */}
        <div className="flex gap-4 pt-3 border-t">
          {shop.productsCount !== undefined && (
            <div className="flex-1 text-center">
              <div className="text-xl font-bold text-primary">{shop.productsCount}</div>
              <div className="text-xs text-muted-foreground">منتج</div>
            </div>
          )}
          {shop.servicesCount !== undefined && (
            <div className="flex-1 text-center">
              <div className="text-xl font-bold text-primary">{shop.servicesCount}</div>
              <div className="text-xs text-muted-foreground">خدمة</div>
            </div>
          )}
        </div>
      </CardContent>

      <CardFooter className="p-4 pt-0">
        <Button className="w-full gap-2" size="sm" variant="outline">
          <ExternalLink className="h-4 w-4" />
          زيارة المتجر
        </Button>
      </CardFooter>
    </Card>
  );
}

// ==================== PRODUCT CARD ====================
interface ProductCardProps {
  product: {
    id: string;
    name: string;
    description?: string;
    price: number;
    currency?: string;
    images?: string[];
    category?: { name: string };
    shop?: {
      name: string;
      logoImage?: string;
    };
    stock?: number;
    rating?: number;
    reviewsCount?: number;
    discount?: number;
    isNew?: boolean;
    isFeatured?: boolean;
  };
  viewMode?: 'grid' | 'list';
}

export function ProductCard({ product, viewMode = 'grid' }: ProductCardProps) {
  const router = useRouter();
  const discountedPrice = product.discount 
    ? product.price * (1 - product.discount / 100) 
    : product.price;

  if (viewMode === 'list') {
    return (
      <Card 
        className="hover:shadow-lg transition-all cursor-pointer group"
        onClick={() => router.push(`/product/${product.id}`)}
      >
        <div className="flex flex-col sm:flex-row">
          {/* صورة المنتج */}
          <div className="relative w-full sm:w-56 h-56 overflow-hidden bg-white">
            {product.images && product.images[0] ? (
              <img 
                src={product.images[0]} 
                alt={product.name}
                className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-300 p-4"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center">
                <ShoppingBag className="h-16 w-16 text-white opacity-50" />
              </div>
            )}

            {/* التخفيض */}
            {product.discount && product.discount > 0 && (
              <div className="absolute top-2 right-2">
                <Badge className="bg-red-500 text-white text-lg px-3 py-1 shadow-lg">
                  -{product.discount}%
                </Badge>
              </div>
            )}

            {/* جديد */}
            {product.isNew && (
              <div className="absolute top-2 left-2">
                <Badge className="bg-blue-500 text-white gap-1">
                  <Zap className="h-3 w-3" />
                  جديد
                </Badge>
              </div>
            )}
          </div>

          {/* المحتوى */}
          <CardContent className="flex-1 p-4 sm:p-6">
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1">
                <h3 className="text-xl font-bold mb-1 group-hover:text-primary transition-colors">
                  {product.name}
                </h3>
                {product.category && (
                  <Badge variant="secondary" className="text-xs mb-2">
                    {product.category.name}
                  </Badge>
                )}
              </div>
              <div className="text-left">
                {product.discount && product.discount > 0 && (
                  <div className="text-sm text-muted-foreground line-through mb-1">
                    {product.price} {product.currency || 'جنيه'}
                  </div>
                )}
                <div className="text-2xl font-bold text-green-600">
                  {discountedPrice.toFixed(2)}
                </div>
                <div className="text-xs text-muted-foreground">
                  {product.currency || 'جنيه'}
                </div>
              </div>
            </div>

            {product.description && (
              <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                {product.description}
              </p>
            )}

            {/* المتجر */}
            {product.shop && (
              <div className="flex items-center gap-2 mb-3 p-2 bg-muted/50 rounded-lg">
                {product.shop.logoImage && (
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={product.shop.logoImage} />
                    <AvatarFallback>{product.shop.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                )}
                <div className="text-sm font-medium">{product.shop.name}</div>
              </div>
            )}

            {/* المعلومات */}
            <div className="flex flex-wrap gap-3 text-sm">
              {product.rating && (
                <div className="flex items-center gap-1 text-yellow-600">
                  <Star className="h-4 w-4 fill-current" />
                  <span>{product.rating.toFixed(1)}</span>
                  <span className="text-muted-foreground">({product.reviewsCount || 0})</span>
                </div>
              )}
              {product.stock !== undefined && (
                <div className="flex items-center gap-1">
                  <Package className="h-4 w-4 text-muted-foreground" />
                  <span className={product.stock > 0 ? "text-green-600" : "text-red-600"}>
                    {product.stock > 0 ? `متوفر (${product.stock})` : 'غير متوفر'}
                  </span>
                </div>
              )}
            </div>
          </CardContent>
        </div>
      </Card>
    );
  }

  // Grid View
  return (
    <Card 
      className="hover:shadow-xl transition-all cursor-pointer group overflow-hidden"
      onClick={() => router.push(`/product/${product.id}`)}
    >
      {/* صورة المنتج */}
      <div className="relative h-56 overflow-hidden bg-white">
        {product.images && product.images[0] ? (
          <img 
            src={product.images[0]} 
            alt={product.name}
            className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-300 p-4"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center">
            <ShoppingBag className="h-16 w-16 text-white opacity-50" />
          </div>
        )}

        {/* Badges */}
        <div className="absolute top-2 right-2 flex flex-col gap-2">
          {product.discount && product.discount > 0 && (
            <Badge className="bg-red-500 text-white text-sm px-2 py-1 shadow-lg">
              -{product.discount}%
            </Badge>
          )}
          {product.isNew && (
            <Badge className="bg-blue-500 text-white gap-1">
              <Zap className="h-3 w-3" />
              جديد
            </Badge>
          )}
          {product.isFeatured && (
            <Badge className="bg-purple-500 text-white gap-1">
              <Award className="h-3 w-3" />
              مميز
            </Badge>
          )}
        </div>

        {/* أيقونات التفاعل */}
        <div className="absolute top-2 left-2 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button size="icon" variant="secondary" className="h-8 w-8 shadow-lg">
            <Heart className="h-4 w-4" />
          </Button>
          <Button size="icon" variant="secondary" className="h-8 w-8 shadow-lg">
            <Share2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <CardContent className="p-4">
        {/* الفئة */}
        {product.category && (
          <Badge variant="secondary" className="text-xs mb-2">
            {product.category.name}
          </Badge>
        )}

        {/* الاسم */}
        <h3 className="text-base font-bold mb-2 group-hover:text-primary transition-colors line-clamp-2 min-h-[3rem]">
          {product.name}
        </h3>

        {/* السعر */}
        <div className="mb-3">
          {product.discount && product.discount > 0 && (
            <div className="text-xs text-muted-foreground line-through mb-1">
              {product.price} {product.currency || 'جنيه'}
            </div>
          )}
          <div className="text-2xl font-bold text-green-600">
            {discountedPrice.toFixed(2)} <span className="text-sm font-normal">{product.currency || 'جنيه'}</span>
          </div>
        </div>

        {/* التقييم والمخزون */}
        <div className="flex items-center justify-between text-sm mb-3">
          {product.rating && (
            <div className="flex items-center gap-1">
              <Star className="h-4 w-4 fill-yellow-500 text-yellow-500" />
              <span className="font-semibold">{product.rating.toFixed(1)}</span>
              <span className="text-muted-foreground text-xs">({product.reviewsCount || 0})</span>
            </div>
          )}
          {product.stock !== undefined && (
            <div className={cn(
              "text-xs font-medium",
              product.stock > 0 ? "text-green-600" : "text-red-600"
            )}>
              {product.stock > 0 ? 'متوفر' : 'غير متوفر'}
            </div>
          )}
        </div>

        {/* المتجر */}
        {product.shop && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            {product.shop.logoImage && (
              <Avatar className="h-5 w-5">
                <AvatarImage src={product.shop.logoImage} />
              </Avatar>
            )}
            <span className="line-clamp-1">{product.shop.name}</span>
          </div>
        )}
      </CardContent>

      <CardFooter className="p-4 pt-0">
        <Button className="w-full gap-2" size="sm" disabled={product.stock === 0}>
          <ShoppingBag className="h-4 w-4" />
          {product.stock === 0 ? 'غير متوفر' : 'أضف للسلة'}
        </Button>
      </CardFooter>
    </Card>
  );
}

