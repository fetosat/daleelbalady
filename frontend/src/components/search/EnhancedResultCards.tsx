'use client'

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Star, MapPin, Phone, Mail, Clock, DollarSign, 
  ShoppingBag, Package, User, Store, Award, 
  CheckCircle, Heart, Share2, ExternalLink,
  Users, Calendar, TrendingUp, MessageCircle,
  BadgeCheck, Shield, Zap, Tag, Eye, Navigation,
  Bookmark, Bell, Check, Copy, Facebook, Twitter,
  Linkedin, WhatsApp, Download, X, AlertCircle,
  ThumbsUp, Sparkles, Timer, Activity, TrendingDown,
  ArrowRight, Plus, Minus, Info
} from 'lucide-react';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator 
} from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

// ==================== HELPER FUNCTIONS ====================

/**
 * حساب المسافة بين نقطتين
 */
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // نصف قطر الأرض بالكيلومتر
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

/**
 * تنسيق المسافة
 */
function formatDistance(distance: number): string {
  if (distance < 1) {
    return `${Math.round(distance * 1000)} متر`;
  }
  return `${distance.toFixed(1)} كم`;
}

/**
 * مشاركة على Social Media
 */
function shareToSocial(platform: string, url: string, title: string) {
  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);
  
  const urls = {
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
    twitter: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
    whatsapp: `https://wa.me/?text=${encodedTitle}%20${encodedUrl}`,
  };
  
  const shareUrl = urls[platform as keyof typeof urls];
  if (shareUrl) {
    window.open(shareUrl, '_blank', 'width=600,height=400');
  }
}

// ==================== SMART BADGES ====================

interface SmartBadgesProps {
  rating?: number;
  reviewsCount?: number;
  responseTime?: number; // in minutes
  totalSales?: number;
  isVerified?: boolean;
  isFeatured?: boolean;
  viewsCount?: number;
  lastActive?: string;
}

function SmartBadges({ 
  rating, 
  reviewsCount, 
  responseTime, 
  totalSales,
  isVerified,
  isFeatured,
  viewsCount,
  lastActive 
}: SmartBadgesProps) {
  const badges = [];

  // Top Rated
  if (rating && rating >= 4.5 && reviewsCount && reviewsCount >= 10) {
    badges.push(
      <TooltipProvider key="top-rated">
        <Tooltip>
          <TooltipTrigger asChild>
            <Badge className="bg-yellow-500 text-white gap-1">
              <Award className="h-3 w-3" />
              أعلى تقييم
            </Badge>
          </TooltipTrigger>
          <TooltipContent>
            <p>{rating.toFixed(1)} نجوم من {reviewsCount} تقييم</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  // Fast Response
  if (responseTime && responseTime <= 60) {
    badges.push(
      <TooltipProvider key="fast-response">
        <Tooltip>
          <TooltipTrigger asChild>
            <Badge className="bg-green-500 text-white gap-1">
              <Zap className="h-3 w-3" />
              رد سريع
            </Badge>
          </TooltipTrigger>
          <TooltipContent>
            <p>يرد خلال {responseTime} دقيقة</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  // Best Seller
  if (totalSales && totalSales >= 100) {
    badges.push(
      <TooltipProvider key="best-seller">
        <Tooltip>
          <TooltipTrigger asChild>
            <Badge className="bg-purple-500 text-white gap-1">
              <TrendingUp className="h-3 w-3" />
              الأكثر مبيعاً
            </Badge>
          </TooltipTrigger>
          <TooltipContent>
            <p>{totalSales} عملية بيع</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  // Popular
  if (viewsCount && viewsCount >= 1000) {
    badges.push(
      <TooltipProvider key="popular">
        <Tooltip>
          <TooltipTrigger asChild>
            <Badge className="bg-orange-500 text-white gap-1">
              <Eye className="h-3 w-3" />
              شائع
            </Badge>
          </TooltipTrigger>
          <TooltipContent>
            <p>{viewsCount.toLocaleString()} مشاهدة</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  // Active Now
  if (lastActive) {
    const minutesAgo = Math.floor((Date.now() - new Date(lastActive).getTime()) / 60000);
    if (minutesAgo <= 30) {
      badges.push(
        <TooltipProvider key="active">
          <Tooltip>
            <TooltipTrigger asChild>
              <Badge className="bg-green-500 text-white gap-1 animate-pulse">
                <Activity className="h-3 w-3" />
                نشط الآن
              </Badge>
            </TooltipTrigger>
            <TooltipContent>
              <p>نشط منذ {minutesAgo} دقيقة</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    }
  }

  return <div className="flex flex-wrap gap-1">{badges.slice(0, 3)}</div>;
}

// ==================== QUICK ACTIONS ====================

interface QuickActionsProps {
  itemId: string;
  itemName: string;
  itemUrl: string;
  onSave?: () => void;
  onShare?: () => void;
  onCompare?: () => void;
  canBook?: boolean;
  canBuy?: boolean;
  onBook?: () => void;
  onBuy?: () => void;
}

function QuickActions({ 
  itemId, 
  itemName, 
  itemUrl,
  onSave, 
  onShare,
  onCompare,
  canBook,
  canBuy,
  onBook,
  onBuy
}: QuickActionsProps) {
  const [isSaved, setIsSaved] = useState(false);
  const [isSharing, setIsSharing] = useState(false);

  const handleSave = () => {
    setIsSaved(!isSaved);
    toast.success(isSaved ? 'تم الإزالة من المحفوظات' : 'تم الحفظ بنجاح');
    onSave?.();
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(itemUrl);
    toast.success('تم نسخ الرابط');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="absolute top-2 left-2 flex flex-col gap-2"
    >
      {/* Save Button */}
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              size="icon"
              variant="secondary"
              className={cn(
                "h-9 w-9 shadow-lg backdrop-blur-sm transition-all",
                isSaved && "bg-red-500 hover:bg-red-600 text-white"
              )}
              onClick={(e) => {
                e.stopPropagation();
                handleSave();
              }}
            >
              <Heart className={cn("h-4 w-4", isSaved && "fill-current")} />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="left">
            <p>{isSaved ? 'إزالة من المحفوظات' : 'حفظ'}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      {/* Share Menu */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
          <Button size="icon" variant="secondary" className="h-9 w-9 shadow-lg backdrop-blur-sm">
            <Share2 className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent side="left" align="start">
          <DropdownMenuItem onClick={(e) => {
            e.stopPropagation();
            shareToSocial('facebook', itemUrl, itemName);
          }}>
            <Facebook className="h-4 w-4 mr-2" />
            فيسبوك
          </DropdownMenuItem>
          <DropdownMenuItem onClick={(e) => {
            e.stopPropagation();
            shareToSocial('twitter', itemUrl, itemName);
          }}>
            <Twitter className="h-4 w-4 mr-2" />
            تويتر
          </DropdownMenuItem>
          <DropdownMenuItem onClick={(e) => {
            e.stopPropagation();
            shareToSocial('whatsapp', itemUrl, itemName);
          }}>
            <WhatsApp className="h-4 w-4 mr-2" />
            واتساب
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={(e) => {
            e.stopPropagation();
            handleCopyLink();
          }}>
            <Copy className="h-4 w-4 mr-2" />
            نسخ الرابط
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Compare Button */}
      {onCompare && (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                size="icon"
                variant="secondary"
                className="h-9 w-9 shadow-lg backdrop-blur-sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onCompare();
                  toast.success('تمت الإضافة للمقارنة');
                }}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="left">
              <p>إضافة للمقارنة</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}
    </motion.div>
  );
}

// ==================== ENHANCED USER CARD ====================

interface EnhancedUserCardProps {
  user: {
    id: string;
    name: string;
    profilePic?: string;
    bio?: string;
    city?: string;
    locationLat?: number;
    locationLon?: number;
    isVerified?: boolean;
    role?: string;
    rating?: number;
    reviewsCount?: number;
    servicesCount?: number;
    shopsCount?: number;
    memberSince?: string;
    responseTime?: number;
    lastActive?: string;
    viewsCount?: number;
    completedJobs?: number;
  };
  userLocation?: { lat: number; lon: number };
  viewMode?: 'grid' | 'list';
  onCompare?: () => void;
}

export function EnhancedUserCard({ user, userLocation, viewMode = 'grid', onCompare }: EnhancedUserCardProps) {
  const router = useRouter();
  const [isHovered, setIsHovered] = useState(false);

  // حساب المسافة
  const distance = userLocation && user.locationLat && user.locationLon
    ? calculateDistance(userLocation.lat, userLocation.lon, user.locationLat, user.locationLon)
    : null;

  const getRoleBadge = (role?: string) => {
    switch (role) {
      case 'PROVIDER':
        return { label: 'مزود خدمة', color: 'bg-blue-500', icon: <Users className="h-3 w-3" /> };
      case 'BUSINESS':
        return { label: 'صاحب عمل', color: 'bg-purple-500', icon: <Store className="h-3 w-3" /> };
      case 'PROFESSIONAL':
        return { label: 'محترف', color: 'bg-green-500', icon: <Award className="h-3 w-3" /> };
      default:
        return { label: 'مستخدم', color: 'bg-stone-500', icon: <User className="h-3 w-3" /> };
    }
  };

  const roleBadge = getRoleBadge(user.role);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      whileHover={{ y: -5 }}
    >
      <Card 
        className="hover:shadow-2xl transition-all cursor-pointer group overflow-hidden relative"
        onClick={() => router.push(`/listing/${user.id}`)}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Quick Actions */}
        <AnimatePresence>
          {isHovered && (
            <QuickActions
              itemId={user.id}
              itemName={user.name}
              itemUrl={`https://daleelbalady.com/listing/${user.id}`}
              onCompare={onCompare}
            />
          )}
        </AnimatePresence>

        {/* Header مع صورة */}
        <div className="relative h-48 overflow-hidden bg-gradient-to-br from-blue-500 via-purple-600 to-pink-500">
          <motion.div
            animate={{ scale: isHovered ? 1.1 : 1 }}
            transition={{ duration: 0.3 }}
            className="h-full w-full"
          >
            <Avatar className="w-full h-full rounded-none">
              <AvatarImage 
                src={user.profilePic} 
                alt={user.name} 
                className="object-cover"
              />
              <AvatarFallback className="text-6xl rounded-none bg-transparent text-white">
                {user.name.charAt(0)}
              </AvatarFallback>
            </Avatar>
          </motion.div>
          
          {/* Overlay Gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
          
          {/* Smart Badges */}
          <div className="absolute top-2 right-2">
            <SmartBadges
              rating={user.rating}
              reviewsCount={user.reviewsCount}
              responseTime={user.responseTime}
              isVerified={user.isVerified}
              viewsCount={user.viewsCount}
              lastActive={user.lastActive}
            />
          </div>

          {/* Role Badge */}
          <div className="absolute bottom-2 left-2">
            <Badge className={cn("gap-1 shadow-lg", roleBadge.color, "text-white")}>
              {roleBadge.icon}
              {roleBadge.label}
            </Badge>
          </div>

          {/* Verification Badge */}
          {user.isVerified && (
            <div className="absolute bottom-2 right-2">
              <Badge className="bg-green-500 text-white gap-1 shadow-lg">
                <BadgeCheck className="h-3 w-3" />
                موثق
              </Badge>
            </div>
          )}
        </div>

        <CardContent className="p-4">
          {/* الاسم والتقييم */}
          <div className="mb-3">
            <h3 className="text-lg font-bold mb-1 group-hover:text-primary transition-colors line-clamp-1">
              {user.name}
            </h3>
            
            <div className="flex items-center gap-2 flex-wrap">
              {user.rating && (
                <div className="flex items-center gap-1 text-sm">
                  <Star className="h-4 w-4 fill-yellow-500 text-yellow-500" />
                  <span className="font-semibold">{user.rating.toFixed(1)}</span>
                  <span className="text-muted-foreground text-xs">({user.reviewsCount || 0})</span>
                </div>
              )}
              
              {user.completedJobs && (
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <CheckCircle className="h-3 w-3 text-green-500" />
                  <span>{user.completedJobs} عمل مكتمل</span>
                </div>
              )}
            </div>
          </div>

          {/* الوصف */}
          {user.bio && (
            <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
              {user.bio}
            </p>
          )}

          {/* المعلومات */}
          <div className="flex flex-wrap gap-2 text-sm text-muted-foreground mb-3">
            {user.city && (
              <div className="flex items-center gap-1">
                <MapPin className="h-4 w-4" />
                <span>{user.city}</span>
                {distance && (
                  <span className="text-xs text-primary font-medium">
                    ({formatDistance(distance)})
                  </span>
                )}
              </div>
            )}
            
            {user.memberSince && (
              <div className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                <span className="text-xs">
                  عضو منذ {new Date(user.memberSince).getFullYear()}
                </span>
              </div>
            )}
          </div>

          {/* إحصائيات */}
          <div className="flex gap-3 pt-3 border-t">
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
            {user.reviewsCount !== undefined && (
              <div className="flex-1 text-center">
                <div className="text-xl font-bold text-primary">{user.reviewsCount}</div>
                <div className="text-xs text-muted-foreground">تقييم</div>
              </div>
            )}
          </div>
        </CardContent>

        <CardFooter className="p-4 pt-0 flex gap-2">
          <Button 
            className="flex-1 gap-2" 
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              router.push(`/listing/${user.id}`);
            }}
          >
            عرض الملف
            <ArrowRight className="h-4 w-4" />
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            className="gap-1"
            onClick={(e) => {
              e.stopPropagation();
              toast.info('سيتم فتح المحادثة قريباً');
            }}
          >
            <MessageCircle className="h-4 w-4" />
          </Button>
        </CardFooter>

        {/* Shine Effect on Hover */}
        <AnimatePresence>
          {isHovered && (
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: '200%' }}
              transition={{ duration: 0.6, ease: 'easeInOut' }}
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none"
            />
          )}
        </AnimatePresence>
      </Card>
    </motion.div>
  );
}

// Export other card types with similar enhancements...
// (ServiceCard, ShopCard, ProductCard would follow the same pattern)

