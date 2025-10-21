'use client';
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useParams } from '@/hooks/useRouterParams';
import { useNavigate, useLocation } from '@/lib/router-compat';
import { createLoginUrl, getCurrentRedirectUrl } from '@/lib/redirect-utils';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/lib/auth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/components/ui/use-toast';
import { Navbar } from '@/components/Navbar';
import {
  ArrowLeft,
  User,
  Mail,
  Phone,
  Calendar,
  MapPin,
  Star,
  Store,
  Briefcase,
  MessageSquare,
  Heart,
  CheckCircle,
  Crown,
  Globe,
  Clock,
  Package,
  ShoppingBag,
  TrendingUp,
  Award,
  Users,
  Eye,
  BookOpen,
  DollarSign,
  Activity,
  Zap,
  Shield,
  Verified,
  ExternalLink,
  Share2,
  Building2,
  Target,
  ThumbsUp,
  MessageCircle,
  FileText,
  Settings,
  MoreHorizontal,
  Filter,
  Search,
  ArrowRight,
  Flag,
  UserCheck,
  Copy,
  Check,
  Link as LinkIcon,
  ShoppingCart,
  Plus
} from 'lucide-react';
import { StarDisplay } from '@/components/StarRating';
import { useUserProfileTitle } from '@/hooks/useDocumentTitle';

interface UserData {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  profilePic?: string;
  coverImage?: string;
  bio?: string;
  isVerified: boolean;
  verifiedBadge?: string;
  role: string;
  createdAt: string;
  shops: Shop[];
  services: ServiceType[];
  products: Product[];
  reviews: ReviewType[];
  stats: {
    totalShops: number;
    totalServices: number;
    totalProducts: number;
    totalReviews: number;
    totalBookings: number;
    totalReactions: number;
    isVerified: boolean;
    verifiedBadge?: string;
    memberSince: string;
    avgRating: number;
    analytics: {
      profileViews: number;
      serviceViews: number;
      shopViews: number;
      contactClicks: number;
      emailClicks: number;
      phoneClicks: number;
      messagesSent: number;
      messagesReceived: number;
      totalBookings: number;
      totalOrders: number;
      avgResponseTime: number | null;
      successRate: number | null;
      reviewsGiven: number;
      reviewsReceived: number;
      reactionsGiven: number;
      reactionsReceived: number;
    };
  };
}

interface Shop {
  id: string;
  name: string;
  slug?: string;
  description?: string;
  city?: string;
  phone?: string;
  email?: string;
  isVerified: boolean;
  createdAt: string;
  _count: {
    services: number;
    products: number;
    reviews: number;
  };
  products?: Product[];
}

interface Product {
  id: string;
  vid: string;
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
    vid: string;
    name: string;
    slug: string;
  };
  _count: {
    reviews: number;
  };
}

interface ServiceType {
  id: string;
  translation?: {
    name_en?: string;
    name_ar?: string;
    description_en?: string;
    description_ar?: string;
  };
  price?: number;
  currency?: string;
  city?: string;
  available: boolean;
  durationMins?: number;
  phone?: string;
  createdAt: string;
  _count?: {
    bookings: number;
    reviews: number;
  };
  reviews?: ReviewType[];
}

interface ReviewType {
  id: string;
  rating: number;
  comment?: string;
  createdAt: string;
  service?: {
    id: string;
    translation?: {
      name_en?: string;
      name_ar?: string;
    };
  };
  shop?: {
    id: string;
    name: string;
  };
}

const UserProfile = () => {
  const params = useParams();
  const id = params.id as string;
  const navigate = useNavigate();
  const location = useLocation();
  const { t, i18n } = useTranslation();
  const authContext = useAuth();
  const { user: currentUser } = authContext;
  
  // Log auth context for debugging
  useEffect(() => {
    console.log('🔐 UserProfile - Auth context:', { 
      authContext,
      currentUser,
      hasUser: !!currentUser,
      userId: currentUser?.id 
    });
  }, [authContext, currentUser]);

  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [servicesFilter, setServicesFilter] = useState('all');
  const [productsFilter, setProductsFilter] = useState('all');
  const [cartSummary, setCartSummary] = useState<{ itemCount: number; total: number } | null>(null);
  const [messageLoading, setMessageLoading] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [shareSuccess, setShareSuccess] = useState(false);
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [showClaimModal, setShowClaimModal] = useState(false);

  const isRTL = i18n.language === 'ar';

  // Set dynamic document title
  useUserProfileTitle(user?.name);

  // Get navigation context from location state or URL params
  const searchQuery = location.state?.searchQuery || new URLSearchParams(location.search).get('q');
  const fromSearch = location.state?.fromSearch || searchQuery;

  // Dynamic breadcrumb generation
  const getBreadcrumbs = () => {
    const breadcrumbs: Array<{ label: string; href: string; current?: boolean }> = [
      {
        label: isRTL ? 'الرئيسية' : 'Home',
        href: '/'
      }
    ];

    if (fromSearch && searchQuery) {
      breadcrumbs.push({
        label: isRTL ? `نتائج البحث: "${searchQuery}"` : `Search: "${searchQuery}"`,
        href: `/search?q=${encodeURIComponent(searchQuery)}`
      });
    }

    breadcrumbs.push({
      label: user?.name || (isRTL ? 'ملف المستخدم' : 'User Profile'),
      href: '',
      current: true
    });

    return breadcrumbs;
  };

  useEffect(() => {
    const fetchUser = async () => {
      if (!id) {
        setError('Invalid user ID');
        setLoading(false);
        return;
      }
      try {
        const response = await fetch(`/api/users/${id}`);

        if (!response.ok) {
          throw new Error('User not found');
        }

        const data = await response.json();

        if (data.success) {
          setUser(data.user);

          // Track profile view
          await trackAnalyticsEvent('profile-view', id);
        } else {
          throw new Error(data.message || 'Failed to fetch user');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load user profile');
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [id]);

  // Get current user from auth context or localStorage
  useEffect(() => {
    console.log('🔍 UserProfile - Getting currentUserId:', { 
      currentUser, 
      hasCurrentUserId: !!currentUser?.id,
      storedUser: localStorage.getItem('daleel-user'),
      directUserId: localStorage.getItem('userId')
    });
    
    // First priority: use current user from auth context
    if (currentUser?.id) {
      console.log('✅ UserProfile - Using currentUser.id:', currentUser.id);
      setCurrentUserId(currentUser.id);
      fetchCartSummary(currentUser.id);
      return;
    }

    // Fallback: try to get user ID from stored user data
    const storedUser = localStorage.getItem('daleel-user');
    if (storedUser) {
      try {
        const userData = JSON.parse(storedUser);
        console.log('🔍 UserProfile - Parsed stored user:', userData);
        if (userData?.user?.id) {
          console.log('✅ UserProfile - Using stored user.id:', userData.user.id);
          setCurrentUserId(userData.user.id);
          fetchCartSummary(userData.user.id);
          return;
        }
      } catch (error) {
        console.error('Failed to parse stored user data:', error);
      }
    }

    // Last fallback: direct userId lookup
    const userId = localStorage.getItem('userId');
    if (userId) {
      console.log('✅ UserProfile - Using direct userId:', userId);
      setCurrentUserId(userId);
      fetchCartSummary(userId);
    } else {
      console.log('❌ UserProfile - No userId found, setting to null');
      setCurrentUserId(null);
    }
  }, [currentUser]);

  const trackAnalyticsEvent = async (type: string, userId: string) => {
    try {
      const endpoint = {
        'profile-view': '/api/analytics/track-profile-view',
        'contact-click': '/api/analytics/track-contact-click',
        'service-view': '/api/analytics/track-service-view'
      }[type];

      if (endpoint) {
        await fetch(`${endpoint}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ userId })
        });
      }
    } catch (error) {
      console.warn('Failed to track analytics:', error);
    }
  };

  const fetchCartSummary = async (userId: string) => {
    try {
      const response = await fetch(`/api/cart/${userId}/summary`);
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setCartSummary(data.summary);
        }
      }
    } catch (error) {
      console.warn('Failed to fetch cart summary:', error);
    }
  };

  const handleContact = async (type: 'email' | 'phone' | 'contact') => {
    if (user) {
      await trackAnalyticsEvent('contact-click', user.id);

      if (type === 'email' && user.email) {
        window.location.href = `mailto:${user.email}`;
      } else if (type === 'phone' && user.phone) {
        window.location.href = `tel:${user.phone}`;
      }
    }
  };

  const handleSendMessage = async () => {
    if (!currentUserId || !user || currentUserId === user.id) {
      return;
    }

    setMessageLoading(true);
    try {
      // Create or get existing chat
      const response = await fetch('/api/chats', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          initiatorId: currentUserId,
          recipientId: user.id
        })
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          // Navigate to chat page or open chat modal
          navigate(`/chats/${data.chat.id}`);
        }
      }
    } catch (error) {
      console.error('Failed to create chat:', error);
    } finally {
      setMessageLoading(false);
    }
  };

  const handleAddToCart = async (item: { type: 'SERVICE' | 'PRODUCT', id: string }, quantity = 1) => {
    if (!currentUserId) {
      // Redirect to login with current page as redirect URL
      const currentUrl = getCurrentRedirectUrl(location);
      navigate(createLoginUrl(currentUrl));
      return;
    }

    try {
      const response = await fetch(`/api/cart/${currentUserId}/add`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          type: item.type,
          [item.type === 'SERVICE' ? 'serviceId' : 'productId']: item.id,
          quantity
        })
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          // Update cart summary
          await fetchCartSummary(currentUserId);
          // Show success message
          console.log('Item added to cart successfully');
        }
      }
    } catch (error) {
      console.error('Failed to add item to cart:', error);
    }
  };

  const handleReviewReaction = async (reviewId: string, type: 'LIKE' | 'DISLIKE' | 'HELPFUL' | 'NOT_HELPFUL') => {
    if (!currentUserId) {
      const currentUrl = getCurrentRedirectUrl(location);
      navigate(createLoginUrl(currentUrl));
      return;
    }

    try {
      const response = await fetch('/api/reactions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userId: currentUserId,
          reviewId,
          type
        })
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          // Optionally update UI to show new reaction counts
          console.log('Reaction updated successfully');
        }
      }
    } catch (error) {
      console.error('Failed to update reaction:', error);
    }
  };

  const handleBack = () => {
    navigate(-1);
  };

  const handleShare = async () => {
    const shareData = {
      title: `${user?.name} - ${isRTL ? 'دليل بلدي' : 'Daleel Balady'}`,
      text: `${isRTL ? 'تحقق من ملف' : 'Check out'} ${user?.name}${isRTL ? ' على دليل بلدي' : ' on Daleel Balady'}`,
      url: window.location.href
    };

    try {
      if (navigator.share) {
        // Use native share API if available
        await navigator.share(shareData);
      } else {
        // Fallback to clipboard copy
        await navigator.clipboard.writeText(window.location.href);
        setShareSuccess(true);
        toast({
          title: isRTL ? 'تم النسخ!' : 'Copied!',
          description: isRTL ? 'تم نسخ رابط الملف الشخصي إلى الحافظة' : 'Profile link copied to clipboard'
        });
        
        // Hide success message after 3 seconds
        setTimeout(() => setShareSuccess(false), 3000);
      }
    } catch (error) {
      console.error('Failed to share:', error);
      toast({
        title: isRTL ? 'فشل في المشاركة' : 'Share failed',
        description: isRTL ? 'حدث خطأ أثناء المشاركة' : 'An error occurred while sharing',
        variant: 'destructive'
      });
    }
  };

  const handleReportUser = async (reason: string, details: string) => {
    if (!currentUserId || !user) return;

    try {
      const response = await fetch('/api/reports', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('daleel-token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          reporterId: currentUserId,
          reportedUserId: user.id,
          reason,
          details,
          type: 'USER'
        })
      });

      if (response.ok) {
        toast({
          title: isRTL ? 'تم إرسال البلاغ' : 'Report Submitted',
          description: isRTL ? 'شكراً لك على المساعدة في الحفاظ على أمان المجتمع' : 'Thank you for helping keep our community safe'
        });
        setShowReportModal(false);
      } else {
        throw new Error('Failed to submit report');
      }
    } catch (error) {
      toast({
        title: isRTL ? 'فشل في إرسال البلاغ' : 'Report Failed',
        description: isRTL ? 'حدث خطأ أثناء إرسال البلاغ' : 'An error occurred while submitting the report',
        variant: 'destructive'
      });
    }
  };

  const handleClaimAccount = async () => {
    if (!currentUserId || !user) return;

    try {
      const response = await fetch('/api/users/claim', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('daleel-token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          claimantId: currentUserId,
          targetUserId: user.id
        })
      });

      if (response.ok) {
        toast({
          title: isRTL ? 'تم إرسال طلب المطالبة' : 'Claim Request Submitted',
          description: isRTL ? 'سيتم مراجعة طلبك خلال 1-3 أيام عمل' : 'Your request will be reviewed within 1-3 business days'
        });
        setShowClaimModal(false);
      } else {
        throw new Error('Failed to submit claim');
      }
    } catch (error) {
      toast({
        title: isRTL ? 'فشل في إرسال الطلب' : 'Claim Failed',
        description: isRTL ? 'حدث خطأ أثناء إرسال طلب المطالبة' : 'An error occurred while submitting the claim',
        variant: 'destructive'
      });
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(i18n.language === 'ar' ? 'ar-EG' : 'en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'PROVIDER':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'DELIVERY':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'CUSTOMER':
      default:
        return 'bg-stone-100 text-stone-800 dark:bg-stone-800 dark:text-stone-200';
    }
  };


  useEffect(() => {
    console.log('🔄 UserProfile - Render state:', { 
      messageLoading, 
      currentUserId, 
      profileUserId: user?.id,
      currentUserId_fromAuth: currentUser?.id,
      storedUser: localStorage.getItem('daleel-user'),
      directUserId: localStorage.getItem('userId')
    });
  });
  const getRoleDisplayName = (role: string) => {
    const roles = {
      ADMIN: isRTL ? 'مدير' : 'Admin',
      PROVIDER: isRTL ? 'مقدم خدمة' : 'Service Provider',
      DELIVERY: isRTL ? 'عامل توصيل' : 'Delivery Partner',
      CUSTOMER: isRTL ? 'عميل' : 'Customer'
    };
    return roles[role as keyof typeof roles] || role;
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

  if (error || !user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-stone-50 via-white to-blue-50/30 dark:from-stone-950 dark:via-stone-900 dark:to-stone-800/50">
        <Navbar />
        <div className="min-h-screen pt-24 flex items-center justify-center px-6">
          <Card className="max-w-md mx-auto bg-white/90 dark:bg-stone-900/90 backdrop-blur-lg border border-white/20 dark:border-stone-700/20">
            <CardContent className="p-8 text-center">
              <User className="h-16 w-16 text-stone-400 dark:text-stone-500 mx-auto mb-4" />
              <h2 className="text-2xl font-semibold text-stone-900 dark:text-stone-100 mb-2">
                {isRTL ? 'المستخدم غير موجود' : 'User Not Found'}
              </h2>
              <p className="text-stone-600 dark:text-stone-400 mb-6">
                {error || (isRTL ? 'لا يمكن العثور على هذا المستخدم' : 'This user could not be found')}
              </p>
              <Button onClick={handleBack} variant="outline" className="border-stone-300 dark:border-stone-600">
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
      {/* App Navbar */}
      <Navbar />

      {/* Modern Hero Header */}
      <div className="relative pt-20">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/5 via-purple-600/5 to-emerald-600/5 dark:from-stone-800/30 dark:via-stone-700/20 dark:to-stone-600/10" />
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 25% 25%, rgba(59, 130, 246, 0.05) 0%, transparent 50%),
                           radial-gradient(circle at 75% 75%, rgba(147, 51, 234, 0.05) 0%, transparent 50%)`
        }} />

        {/* Navigation Header */}
        <div className="relative bg-white/80 dark:bg-stone-900/80 backdrop-blur-md border-b border-white/20 dark:border-stone-700/30">
          <div className="max-w-7xl mx-auto px-6 py-4">
            {/* Dynamic Breadcrumbs */}
            <Breadcrumb className="mb-4">
              <BreadcrumbList>
                {getBreadcrumbs().map((breadcrumb, index) => {
                  const isLast = index === getBreadcrumbs().length - 1;
                  return (
                    <React.Fragment key={index}>
                      <BreadcrumbItem>
                        {isLast ? (
                          <BreadcrumbPage className="font-medium text-stone-800 dark:text-stone-200">
                            {breadcrumb.label}
                          </BreadcrumbPage>
                        ) : (
                          <BreadcrumbLink asChild>
                            <Link
                              to={breadcrumb.href}
                              className="flex items-center gap-2 hover:text-blue-600 dark:hover:text-stone-300 transition-colors text-stone-600 dark:text-stone-400"
                              state={index === 1 ? { searchQuery } : undefined}
                            >
                              {index === 0 && <Globe className="h-4 w-4" />}
                              {breadcrumb.label}
                            </Link>
                          </BreadcrumbLink>
                        )}
                      </BreadcrumbItem>
                      {!isLast && <BreadcrumbSeparator className="text-stone-400 dark:text-stone-600" />}
                    </React.Fragment>
                  );
                })}
              </BreadcrumbList>
            </Breadcrumb>

            {/* Action Bar */}
            <div className="flex items-center justify-between">
              <Button
                onClick={handleBack}
                variant="ghost"
                className="gap-2 hover:bg-blue-50 dark:hover:bg-stone-800/50 transition-all text-stone-700 dark:text-stone-300"
              >
                <ArrowLeft className={`h-4 w-4 ${isRTL ? 'rotate-180' : ''}`} />
                {isRTL ? 'عودة' : 'Back'}
              </Button>

              <div className="flex items-center gap-3">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="gap-2 border-stone-300 dark:border-stone-600 text-stone-700 dark:text-stone-300"
                  onClick={handleShare}
                >
                  {shareSuccess ? <Check className="h-4 w-4" /> : <Share2 className="h-4 w-4" />}
                  {shareSuccess ? (isRTL ? 'تم النسخ!' : 'Copied!') : (isRTL ? 'مشاركة' : 'Share')}
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="border-stone-300 dark:border-stone-600 text-stone-700 dark:text-stone-300">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuItem 
                      onClick={() => setShowReportModal(true)}
                      className="text-red-600 dark:text-red-400 focus:text-red-600 dark:focus:text-red-400"
                    >
                      <Flag className="h-4 w-4 mr-2" />
                      {isRTL ? 'بلاغ عن المستخدم' : 'Report User'}
                    </DropdownMenuItem>
                    {currentUserId && currentUserId !== user?.id && (
                      <DropdownMenuItem onClick={() => setShowClaimModal(true)}>
                        <UserCheck className="h-4 w-4 mr-2" />
                        {isRTL ? 'مطالبة بالحساب' : 'Claim Account'}
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => window.open(`/user/${user?.id}`, '_blank')}>
                      <LinkIcon className="h-4 w-4 mr-2" />
                      {isRTL ? 'فتح في تبويب جديد' : 'Open in New Tab'}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Hero Profile Section */}
        <div className="relative max-w-7xl mx-auto px-6 pt-8">
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="relative"
          >
            {/* Hero Background Card */}
            <div className="bg-white/90 dark:bg-stone-900/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 dark:border-stone-700/20 overflow-hidden">
              {/* Cover Image or Dynamic Gradient Background */}
              <div className="relative h-48 sm:h-64 overflow-hidden">
                {user.coverImage ? (
                  <>
                    <img
                      src={user.coverImage}
                      alt={`${user.name} cover`}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
                  </>
                ) : (
                  <>
                    <div className="w-full h-full bg-gradient-to-br from-blue-600 via-purple-600 to-emerald-500">
                      <div className="absolute inset-0 bg-black/10" />
                      <div className="absolute inset-0" style={{
                        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='1'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
                      }} />
                    </div>
                  </>
                )}

                {/* Profile Stats Overlay */}
                <div className="absolute top-4 right-4 flex items-center gap-4">
                  <div className="flex items-center gap-2 bg-white/20 backdrop-blur-md rounded-full px-3 py-1.5">
                    <Eye className="h-4 w-4 text-white" />
                    <span className="text-sm font-medium text-white">{user.stats.analytics?.profileViews || 0}</span>
                  </div>
                  {cartSummary && (
                    <div className="flex items-center gap-2 bg-white/20 backdrop-blur-md rounded-full px-3 py-1.5">
                      <ShoppingBag className="h-4 w-4 text-white" />
                      <span className="text-sm font-medium text-white">{cartSummary.itemCount}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Profile Content */}
              <div className="relative px-8 pb-8">
                {/* Avatar and Quick Actions */}
                <div className="flex flex-col lg:flex-row items-start lg:items-end gap-6 -mt-20">
                  <div className="relative">
                    <motion.div
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: 0.2, duration: 0.5 }}
                    >
                      <Avatar className="h-40 w-40 border-6 border-white dark:border-stone-800 shadow-2xl">
                        <AvatarImage src={user.profilePic} alt={user.name} className="object-cover" />
                        <AvatarFallback className="text-4xl font-bold bg-gradient-to-br from-blue-600 to-purple-600 text-white">
                          {user.name.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                    </motion.div>

                    {/* Status Indicators */}
                    <div className="absolute -bottom-2 -right-2 flex gap-2">
                      {user.isVerified && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ delay: 0.4, type: "spring" }}
                          className="bg-blue-500 rounded-full p-2 shadow-lg"
                        >
                          <Verified className="h-6 w-6 text-white" />
                        </motion.div>
                      )}
                      {user.verifiedBadge && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ delay: 0.5, type: "spring" }}
                          className="bg-yellow-500 rounded-full p-2 shadow-lg"
                        >
                          <Crown className="h-6 w-6 text-white" />
                        </motion.div>
                      )}
                    </div>
                  </div>

                  {/* Profile Info and Actions */}
                  <div className="flex-1 min-w-0 pt-4">
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.3, duration: 0.5 }}
                    >
                      {/* Name and Title */}
                      <div className="mb-6">
                        <h1 className="text-4xl lg:text-5xl font-bold text-stone-900 dark:text-stone-100 mb-2 leading-tight">
                          {user.name}
                        </h1>
                        <div className="flex flex-wrap items-center gap-3 mb-4">
                          <Badge className={`${getRoleBadgeColor(user.role)} text-base px-4 py-1.5`}>
                            <Briefcase className="h-4 w-4 mr-2" />
                            {getRoleDisplayName(user.role)}
                          </Badge>
                          {user.isVerified && (
                            <Badge className="bg-blue-100 text-blue-800 dark:bg-stone-800 dark:text-stone-200 text-base px-4 py-1.5">
                              <Shield className="h-4 w-4 mr-2" />
                              {isRTL ? 'موثق' : 'Verified Provider'}
                            </Badge>
                          )}
                          {user.stats.avgRating > 4.5 && (
                            <Badge className="bg-yellow-100 text-yellow-800 dark:bg-stone-700 dark:text-yellow-300 text-base px-4 py-1.5">
                              <Award className="h-4 w-4 mr-2" />
                              {isRTL ? 'متميز' : 'Top Rated'}
                            </Badge>
                          )}
                        </div>

                        {user.bio && (
                          <p className="text-lg text-stone-700 dark:text-stone-300 leading-relaxed max-w-3xl">
                            {user.bio}
                          </p>
                        )}
                      </div>

                      {/* Contact Information Grid */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                        {user.email && (
                          <div className="flex items-center gap-3 p-3 bg-stone-50 dark:bg-stone-800 rounded-xl">
                            <div className="w-10 h-10 bg-blue-100 dark:bg-stone-700 rounded-lg flex items-center justify-center">
                              <Mail className="h-5 w-5 text-blue-600 dark:text-stone-300" />
                            </div>
                            <div>
                              <p className="text-sm text-stone-500 dark:text-stone-400">{isRTL ? 'البريد الإلكتروني' : 'Email'}</p>
                              <p className="font-medium text-stone-900 dark:text-stone-100">{user.email}</p>
                            </div>
                          </div>
                        )}

                        {user.phone && (
                          <div className="flex items-center gap-3 p-3 bg-stone-50 dark:bg-stone-800 rounded-xl">
                            <div className="w-10 h-10 bg-green-100 dark:bg-stone-700 rounded-lg flex items-center justify-center">
                              <Phone className="h-5 w-5 text-green-600 dark:text-stone-300" />
                            </div>
                            <div>
                              <p className="text-sm text-stone-500 dark:text-stone-400">{isRTL ? 'الهاتف' : 'Phone'}</p>
                              <p className="font-medium text-stone-900 dark:text-stone-100">{user.phone}</p>
                            </div>
                          </div>
                        )}

                        <div className="flex items-center gap-3 p-3 bg-stone-50 dark:bg-stone-800 rounded-xl">
                          <div className="w-10 h-10 bg-purple-100 dark:bg-stone-700 rounded-lg flex items-center justify-center">
                            <Calendar className="h-5 w-5 text-purple-600 dark:text-stone-300" />
                          </div>
                          <div>
                            <p className="text-sm text-stone-500 dark:text-stone-400">{isRTL ? 'عضو منذ' : 'Member Since'}</p>
                            <p className="font-medium text-stone-900 dark:text-stone-100">{formatDate(user.createdAt)}</p>
                          </div>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex flex-wrap gap-4">
                        <Button
                          size="lg"
                          className="bg-blue-600 hover:bg-blue-700 text-white gap-2"
                          onClick={!currentUserId ? () => {
                            const currentUrl = getCurrentRedirectUrl(location);
                            navigate(createLoginUrl(currentUrl));
                          } : handleSendMessage}
                          disabled={messageLoading || currentUserId === user.id}
                        >
                          <MessageCircle className="h-5 w-5" />
                          {messageLoading 
                            ? (isRTL ? 'إرسال...' : 'Sending...') 
                            : !currentUserId 
                            ? (isRTL ? 'تسجيل الدخول للمراسلة' : 'Login to Message')
                            : currentUserId === user.id
                            ? (isRTL ? 'لا يمكن مراسلة نفسك' : 'Cannot Message Yourself')
                            : (isRTL ? 'إرسال رسالة' : 'Send Message')}
                        </Button>
                        <Button
                          size="lg"
                          variant="outline"
                          className="gap-2"
                          onClick={() => handleContact('phone')}
                          disabled={!user.phone}
                        >
                          <Phone className="h-5 w-5" />
                          {isRTL ? 'اتصال' : 'Call Now'}
                        </Button>
                        <Button 
                          size="lg" 
                          variant="outline" 
                          className="gap-2"
                          onClick={() => {
                            setActiveTab('services');
                            // Scroll to services section
                            setTimeout(() => {
                              const servicesSection = document.querySelector('[value="services"]')?.closest('.space-y-8');
                              if (servicesSection) {
                                servicesSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
                              }
                            }, 100);
                          }}
                        >
                          <BookOpen className="h-5 w-5" />
                          {isRTL ? 'عرض الخدمات' : 'View Services'}
                        </Button>
                      </div>
                    </motion.div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Enhanced Analytics Dashboard */}
        <div className="max-w-7xl mx-auto px-6 py-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
          >
            {/* Total Shops */}
            <Card className="group hover:shadow-xl transition-all duration-300 border-0 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-blue-500 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Store className="h-6 w-6 text-white" />
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                      {user.stats.totalShops}
                    </div>
                    <div className="text-sm font-medium text-blue-600/70 dark:text-blue-400/70">
                      {isRTL ? 'متجر' : 'Shops'}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-sm text-blue-600/60 dark:text-blue-400/60">
                  <TrendingUp className="h-4 w-4" />
                  <span>{user.stats.analytics?.shopViews || 0} {isRTL ? 'مشاهدة' : 'views'}</span>
                </div>
              </CardContent>
            </Card>

            {/* Total Services */}
            <Card className="group hover:shadow-xl transition-all duration-300 border-0 bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-900/20 dark:to-emerald-800/20">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-emerald-500 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Briefcase className="h-6 w-6 text-white" />
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">
                      {user.stats.totalServices}
                    </div>
                    <div className="text-sm font-medium text-emerald-600/70 dark:text-emerald-400/70">
                      {isRTL ? 'خدمة' : 'Services'}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-sm text-emerald-600/60 dark:text-emerald-400/60">
                  <Activity className="h-4 w-4" />
                  <span>{user.stats.analytics?.serviceViews || 0} {isRTL ? 'مشاهدة' : 'views'}</span>
                </div>
              </CardContent>
            </Card>

            {/* Total Reviews */}
            <Card className="group hover:shadow-xl transition-all duration-300 border-0 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-purple-500 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                    <MessageSquare className="h-6 w-6 text-white" />
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                      {user.stats.totalReviews}
                    </div>
                    <div className="text-sm font-medium text-purple-600/70 dark:text-purple-400/70">
                      {isRTL ? 'تقييم' : 'Reviews'}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-sm text-purple-600/60 dark:text-purple-400/60">
                  <ThumbsUp className="h-4 w-4" />
                  <span>{user.stats.analytics?.reactionsReceived || 0} {isRTL ? 'تفاعل' : 'reactions'}</span>
                </div>
              </CardContent>
            </Card>

            {/* Average Rating */}
            <Card className="group hover:shadow-xl transition-all duration-300 border-0 bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-900/20 dark:to-amber-800/20">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-amber-500 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Star className="h-6 w-6 text-white" />
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold text-amber-600 dark:text-amber-400">
                      {user.stats.avgRating > 0 ? user.stats.avgRating.toFixed(1) : '0.0'}
                    </div>
                    <div className="text-sm font-medium text-amber-600/70 dark:text-amber-400/70">
                      {isRTL ? 'تقييم متوسط' : 'Avg Rating'}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-4 w-4 ${i < Math.floor(user.stats.avgRating) ? 'text-amber-500 fill-amber-500' : 'text-amber-200 dark:text-amber-700'}`}
                    />
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Enhanced Tabs Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.6 }}
          >
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
              <div className="bg-white/60 dark:bg-stone-900/60 backdrop-blur-lg rounded-2xl p-2 shadow-lg border border-white/20 dark:border-stone-700/20">
                <TabsList className="grid w-full grid-cols-5 gap-2 bg-transparent p-0">
                  <TabsTrigger
                    value="overview"
                    className="data-[state=active]:bg-white dark:data-[state=active]:bg-stone-800 data-[state=active]:shadow-lg transition-all duration-300 rounded-xl py-3 px-4 flex items-center gap-2 text-stone-600 dark:text-stone-400 data-[state=active]:text-stone-900 dark:data-[state=active]:text-stone-100"
                  >
                    <User className="h-4 w-4" />
                    <span className="hidden sm:inline">{isRTL ? 'نظرة عامة' : 'Overview'}</span>
                  </TabsTrigger>
                  <TabsTrigger
                    value="services"
                    className="data-[state=active]:bg-white dark:data-[state=active]:bg-stone-800 data-[state=active]:shadow-lg transition-all duration-300 rounded-xl py-3 px-4 flex items-center gap-2 text-stone-600 dark:text-stone-400 data-[state=active]:text-stone-900 dark:data-[state=active]:text-stone-100"
                  >
                    <Briefcase className="h-4 w-4" />
                    <span className="hidden sm:inline">{isRTL ? 'الخدمات' : 'Services'}</span>
                  </TabsTrigger>
                  <TabsTrigger
                    value="shops"
                    className="data-[state=active]:bg-white dark:data-[state=active]:bg-stone-800 data-[state=active]:shadow-lg transition-all duration-300 rounded-xl py-3 px-4 flex items-center gap-2 text-stone-600 dark:text-stone-400 data-[state=active]:text-stone-900 dark:data-[state=active]:text-stone-100"
                  >
                    <Store className="h-4 w-4" />
                    <span className="hidden sm:inline">{isRTL ? 'المتاجر' : 'Shops'}</span>
                  </TabsTrigger>
                  <TabsTrigger
                    value="products"
                    className="data-[state=active]:bg-white dark:data-[state=active]:bg-stone-800 data-[state=active]:shadow-lg transition-all duration-300 rounded-xl py-3 px-4 flex items-center gap-2 text-stone-600 dark:text-stone-400 data-[state=active]:text-stone-900 dark:data-[state=active]:text-stone-100"
                  >
                    <Package className="h-4 w-4" />
                    <span className="hidden sm:inline">{isRTL ? 'المنتجات' : 'Products'}</span>
                  </TabsTrigger>
                  <TabsTrigger
                    value="reviews"
                    className="data-[state=active]:bg-white dark:data-[state=active]:bg-stone-800 data-[state=active]:shadow-lg transition-all duration-300 rounded-xl py-3 px-4 flex items-center gap-2 text-stone-600 dark:text-stone-400 data-[state=active]:text-stone-900 dark:data-[state=active]:text-stone-100"
                  >
                    <MessageSquare className="h-4 w-4" />
                    <span className="hidden sm:inline">{isRTL ? 'التقييمات' : 'Reviews'}</span>
                  </TabsTrigger>
                </TabsList>
              </div>

              <TabsContent value="overview" className="space-y-8">
                {/* Quick Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <Card className="bg-gradient-to-br from-indigo-50 to-indigo-100 dark:from-indigo-900/20 dark:to-indigo-800/20 border-0">
                    <CardContent className="p-6 text-center">
                      <div className="w-12 h-12 bg-indigo-500 rounded-full flex items-center justify-center mx-auto mb-3">
                        <Activity className="h-6 w-6 text-white" />
                      </div>
                      <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400 mb-1">
                        {user.stats.totalBookings}
                      </div>
                      <div className="text-sm text-indigo-600/70 dark:text-indigo-400/70">
                        {isRTL ? 'حجز مؤكد' : 'Total Bookings'}
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-gradient-to-br from-cyan-50 to-cyan-100 dark:from-cyan-900/20 dark:to-cyan-800/20 border-0">
                    <CardContent className="p-6 text-center">
                      <div className="w-12 h-12 bg-cyan-500 rounded-full flex items-center justify-center mx-auto mb-3">
                        <Users className="h-6 w-6 text-white" />
                      </div>
                      <div className="text-2xl font-bold text-cyan-600 dark:text-cyan-400 mb-1">
                        {user.stats.analytics?.totalOrders || 0}
                      </div>
                      <div className="text-sm text-cyan-600/70 dark:text-cyan-400/70">
                        {isRTL ? 'طلب' : 'Orders'}
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-gradient-to-br from-rose-50 to-rose-100 dark:from-rose-900/20 dark:to-rose-800/20 border-0">
                    <CardContent className="p-6 text-center">
                      <div className="w-12 h-12 bg-rose-500 rounded-full flex items-center justify-center mx-auto mb-3">
                        <Target className="h-6 w-6 text-white" />
                      </div>
                      <div className="text-2xl font-bold text-rose-600 dark:text-rose-400 mb-1">
                        {user.stats.analytics?.successRate ? `${user.stats.analytics.successRate}%` : 'N/A'}
                      </div>
                      <div className="text-sm text-rose-600/70 dark:text-rose-400/70">
                        {isRTL ? 'معدل النجاح' : 'Success Rate'}
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-900/20 dark:to-emerald-800/20 border-0">
                    <CardContent className="p-6 text-center">
                      <div className="w-12 h-12 bg-emerald-500 rounded-full flex items-center justify-center mx-auto mb-3">
                        <Zap className="h-6 w-6 text-white" />
                      </div>
                      <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mb-1">
                        {user.stats.analytics?.avgResponseTime ? `${Math.floor(user.stats.analytics.avgResponseTime / 60)}h ${user.stats.analytics.avgResponseTime % 60}m` : 'N/A'}
                      </div>
                      <div className="text-sm text-emerald-600/70 dark:text-emerald-400/70">
                        {isRTL ? 'وقت الاستجابة' : 'Response Time'}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Featured Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Recent Services */}
                  {user.services.length > 0 && (
                    <Card className="bg-white/60 dark:bg-stone-900/60 backdrop-blur-lg border border-white/20 dark:border-stone-700/20">
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <CardTitle className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-900 rounded-lg flex items-center justify-center">
                              <Briefcase className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                            </div>
                            {isRTL ? 'الخدمات المميزة' : 'Featured Services'}
                          </CardTitle>
                          <Button variant="ghost" size="sm" className="gap-2" onClick={() => setActiveTab('services')}>
                            {isRTL ? 'عرض الكل' : 'View All'}
                            <ArrowRight className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {user.services.slice(0, 3).map((service, index) => (
                          <motion.div
                            key={service.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="group flex items-center gap-4 p-4 rounded-xl bg-stone-50/50 dark:bg-stone-800/50 hover:bg-white dark:hover:bg-stone-800 transition-all duration-300 cursor-pointer border border-transparent hover:border-emerald-200 dark:hover:border-emerald-800"
                            onClick={() => navigate(`/service/${service.id}`)}
                          >
                            <div className="w-12 h-12 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-xl flex items-center justify-center text-white font-bold text-lg">
                              {(isRTL ? service.translation?.name_ar : service.translation?.name_en)?.charAt(0) || 'S'}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="font-semibold text-stone-900 dark:text-stone-100 truncate group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                                {isRTL ? service.translation?.name_ar : service.translation?.name_en}
                              </div>
                              <div className="text-sm text-stone-500 dark:text-stone-400 truncate">
                                {service.city} {service.price && `• ${service.price} ${service.currency || 'EGP'}`}
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              {service.available && (
                                <Badge className="bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200 text-xs">
                                  {isRTL ? 'متاح' : 'Available'}
                                </Badge>
                              )}
                              <ExternalLink className="h-4 w-4 text-stone-400 group-hover:text-emerald-500 transition-colors" />
                            </div>
                          </motion.div>
                        ))}
                      </CardContent>
                    </Card>
                  )}

                  {/* Recent Reviews with Enhanced Design */}
                  {user.reviews.length > 0 && (
                    <Card className="bg-white/60 dark:bg-stone-900/60 backdrop-blur-lg border border-white/20 dark:border-stone-700/20">
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <CardTitle className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-amber-100 dark:bg-amber-900 rounded-lg flex items-center justify-center">
                              <Star className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                            </div>
                            {isRTL ? 'آخر التقييمات' : 'Latest Reviews'}
                          </CardTitle>
                          <Button variant="ghost" size="sm" className="gap-2" onClick={() => setActiveTab('reviews')}>
                            {isRTL ? 'عرض الكل' : 'View All'}
                            <ArrowRight className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {user.reviews.slice(0, 3).map((review, index) => (
                          <motion.div
                            key={review.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="p-4 rounded-xl bg-stone-50/50 dark:bg-stone-800/50 border border-stone-100 dark:border-stone-700"
                          >
                            <div className="flex items-start gap-3 mb-3">
                              <div className="w-8 h-8 bg-gradient-to-br from-purple-400 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
                                U
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <div className="flex items-center">
                                    {[...Array(5)].map((_, i) => (
                                      <Star
                                        key={i}
                                        className={`h-4 w-4 ${i < review.rating ? 'text-amber-500 fill-amber-500' : 'text-stone-300 dark:text-stone-600'}`}
                                      />
                                    ))}
                                  </div>
                                  <span className="text-sm text-stone-500 dark:text-stone-400">
                                    {formatDate(review.createdAt)}
                                  </span>
                                </div>
                                {review.comment && (
                                  <p className="text-sm text-stone-700 dark:text-stone-300 leading-relaxed">
                                    {review.comment}
                                  </p>
                                )}
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </CardContent>
                    </Card>
                  )}
                </div>
              </TabsContent>

              {/* Enhanced Services Tab */}
              <TabsContent value="services" className="space-y-6">
                {/* Services Filter and Search */}
                <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                  <div className="flex items-center gap-3">
                    <h3 className="text-2xl font-bold text-stone-900 dark:text-stone-100">
                      {isRTL ? 'الخدمات' : 'Services'}
                    </h3>
                    <Badge variant="secondary" className="text-sm">
                      {user.services.length}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -transtone-y-1/2 h-4 w-4 text-stone-400" />
                      <input
                        type="text"
                        placeholder={isRTL ? 'ابحث في الخدمات...' : 'Search services...'}
                        className="pl-10 pr-4 py-2 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-stone-900 dark:text-stone-100"
                      />
                    </div>
                    <Button variant="outline" size="sm" className="gap-2">
                      <Filter className="h-4 w-4" />
                      {isRTL ? 'فيلتر' : 'Filter'}
                    </Button>
                  </div>
                </div>

                {user.services.length > 0 ? (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {user.services.map((service, index) => (
                      <motion.div
                        key={service.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        <Card 
                          className="group hover:shadow-2xl transition-all duration-500 bg-white/80 dark:bg-stone-900/80 backdrop-blur-lg border border-white/20 dark:border-stone-700/20 overflow-hidden cursor-pointer"
                          onClick={() => navigate(`/service/${service.id}`)}
                        >
                          <CardContent className="p-0">
                            {/* Service Header */}
                            <div className="relative p-6 bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-blue-900/20 dark:to-indigo-900/20">
                              <div className="flex items-start justify-between mb-4">
                                <div className="flex items-center gap-4">
                                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center text-white text-xl font-bold shadow-lg">
                                    {(isRTL ? service.translation?.name_ar : service.translation?.name_en)?.charAt(0) || 'S'}
                                  </div>
                                  <div>
                                    <h4 className="text-xl font-bold text-stone-900 dark:text-stone-100 mb-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                      {isRTL ? service.translation?.name_ar : service.translation?.name_en}
                                    </h4>
                                    <div className="flex items-center gap-2">
                                      {service.available ? (
                                        <Badge className="bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200">
                                          <Activity className="h-3 w-3 mr-1" />
                                          {isRTL ? 'متاح' : 'Available'}
                                        </Badge>
                                      ) : (
                                        <Badge variant="secondary">
                                          <Clock className="h-3 w-3 mr-1" />
                                          {isRTL ? 'غير متاح' : 'Unavailable'}
                                        </Badge>
                                      )}
                                      {service.city && (
                                        <Badge variant="outline">
                                          <MapPin className="h-3 w-3 mr-1" />
                                          {service.city}
                                        </Badge>
                                      )}
                                    </div>
                                  </div>
                                </div>
                                {service.price && (
                                  <div className="text-right">
                                    <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                                      {service.price} {service.currency || 'EGP'}
                                    </div>
                                    {service.durationMins && (
                                      <div className="text-sm text-stone-500 dark:text-stone-400">
                                        {service.durationMins} {isRTL ? 'دقيقة' : 'mins'}
                                      </div>
                                    )}
                                  </div>
                                )}
                              </div>

                              {service.translation?.description_en && (
                                <p className="text-stone-600 dark:text-stone-400 leading-relaxed line-clamp-2">
                                  {isRTL ? service.translation.description_ar : service.translation.description_en}
                                </p>
                              )}
                            </div>

                            {/* Service Stats and Actions */}
                            <div className="p-6">
                              <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-4">
                                  {service._count && (
                                    <>
                                      <div className="flex items-center gap-1 text-sm text-stone-500 dark:text-stone-400">
                                        <Calendar className="h-4 w-4" />
                                        <span>{service._count.bookings} {isRTL ? 'حجز' : 'bookings'}</span>
                                      </div>
                                      <div className="flex items-center gap-1 text-sm text-stone-500 dark:text-stone-400">
                                        <MessageSquare className="h-4 w-4" />
                                        <span>{service._count.reviews} {isRTL ? 'تقييم' : 'reviews'}</span>
                                      </div>
                                    </>
                                  )}
                                  {service.phone && (
                                    <div className="flex items-center gap-1 text-sm text-stone-500 dark:text-stone-400">
                                      <Phone className="h-4 w-4" />
                                      <span>{service.phone}</span>
                                    </div>
                                  )}
                                </div>
                              </div>

                              <div className="flex items-center gap-3">
                                <Button
                                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleAddToCart({ type: 'SERVICE', id: service.id });
                                  }}
                                  disabled={!service.available || !currentUserId}
                                >
                                  <ShoppingBag className="h-4 w-4 mr-2" />
                                  {isRTL ? 'إضافة للسلة' : 'Add to Cart'}
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    trackAnalyticsEvent('service-view', service.id);
                                  }}
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleContact('phone');
                                  }}
                                  disabled={!user.phone}
                                >
                                  <Phone className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <Card className="p-12 text-center bg-white/60 dark:bg-stone-900/60 backdrop-blur-lg border border-white/20 dark:border-stone-700/20">
                    <div className="w-16 h-16 bg-stone-100 dark:bg-stone-800 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Briefcase className="h-8 w-8 text-stone-400 dark:text-stone-500" />
                    </div>
                    <h3 className="text-xl font-semibold text-stone-900 dark:text-stone-100 mb-2">
                      {isRTL ? 'لا توجد خدمات' : 'No Services Found'}
                    </h3>
                    <p className="text-stone-500 dark:text-stone-400">
                      {isRTL ? 'لم يقم هذا المزود بإضافة أي خدمات بعد' : 'This provider hasn\'t added any services yet'}
                    </p>
                  </Card>
                )}
              </TabsContent>

              {/* Enhanced Products Tab */}
              <TabsContent value="products" className="space-y-6">
                {/* Products Header and Search */}
                <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                  <div className="flex items-center gap-3">
                    <h3 className="text-2xl font-bold text-stone-900 dark:text-white">
                      {isRTL ? 'المنتجات' : 'Products'}
                    </h3>
                    <Badge variant="secondary" className="text-sm">
                      {user.shops.reduce((total, shop) => total + (shop._count?.products || 0), 0)}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -transtone-y-1/2 h-4 w-4 text-stone-400" />
                      <input
                        type="text"
                        placeholder={isRTL ? 'ابحث في المنتجات...' : 'Search products...'}
                        className="pl-10 pr-4 py-2 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      />
                    </div>
                    <Button variant="outline" size="sm" className="gap-2">
                      <Filter className="h-4 w-4" />
                      {isRTL ? 'فيلتر' : 'Filter'}
                    </Button>
                  </div>
                </div>

                {user.shops.some(shop => shop.products && shop.products.length > 0) ? (
                  <div className="space-y-8">
                    {user.shops.filter(shop => shop.products && shop.products.length > 0).map((shop) => (
                      <div key={shop.id} className="space-y-6">
                        {/* Shop Header */}
                        <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-2xl border border-purple-100 dark:border-purple-800">
                          <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center text-white text-lg font-bold">
                            {shop.name.charAt(0).toUpperCase()}
                          </div>
                          <div className="flex-1">
                            <h4 className="text-xl font-bold text-stone-900 dark:text-white">
                              {shop.name}
                            </h4>
                            <div className="flex items-center gap-2 text-sm text-stone-600 dark:text-stone-400">
                              <Building2 className="h-4 w-4" />
                              <span>{shop.city}</span>
                              <span>•</span>
                              <span>{shop.products?.length || 0} {isRTL ? 'منتج' : 'products'}</span>
                              {shop.isVerified && (
                                <>
                                  <span>•</span>
                                  <Badge className="bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200 text-xs">
                                    <Verified className="h-3 w-3 mr-1" />
                                    {isRTL ? 'موثق' : 'Verified'}
                                  </Badge>
                                </>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Products Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                          {shop.products?.map((product, index) => (
                            <motion.div
                              key={product.id}
                              initial={{ opacity: 0, scale: 0.9 }}
                              animate={{ opacity: 1, scale: 1 }}
                              transition={{ delay: index * 0.1 }}
                            >
                              <Card className="group hover:shadow-2xl transition-all duration-500 bg-white/90 dark:bg-stone-900/90 backdrop-blur-lg border border-white/20 dark:border-stone-700/20 overflow-hidden cursor-pointer">
                                <div onClick={() => navigate(`/product/${product.id}`)}>
                                  <CardContent className="p-0">
                                  {/* Product Image Placeholder */}
                                  <div className="relative h-48 bg-gradient-to-br from-stone-100 to-stone-200 dark:from-stone-800 dark:to-stone-700 flex items-center justify-center">
                                    <Package className="h-16 w-16 text-stone-400" />

                                    {/* Stock Status Overlay */}
                                    <div className="absolute top-3 right-3">
                                      {product.stock > 0 ? (
                                        <Badge className="bg-emerald-500 text-white shadow-lg">
                                          {isRTL ? 'متوفر' : 'In Stock'}
                                        </Badge>
                                      ) : (
                                        <Badge className="bg-red-500 text-white shadow-lg">
                                          {isRTL ? 'نفد' : 'Out of Stock'}
                                        </Badge>
                                      )}
                                    </div>

                                    {/* Price Badge */}
                                    <div className="absolute top-3 left-3">
                                      <div className="bg-white/90 dark:bg-stone-900/90 backdrop-blur-md rounded-full px-3 py-1 shadow-lg">
                                        <span className="text-lg font-bold text-purple-600 dark:text-purple-400">
                                          {product.price} {product.currency || 'EGP'}
                                        </span>
                                      </div>
                                    </div>
                                  </div>

                                  {/* Product Info */}
                                  <div className="p-6">
                                    <div className="mb-4">
                                      <h5 className="text-lg font-bold text-stone-900 dark:text-white mb-2 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors line-clamp-2">
                                        {product.name}
                                      </h5>
                                      {product.description && (
                                        <p className="text-sm text-stone-600 dark:text-stone-400 line-clamp-3">
                                          {product.description}
                                        </p>
                                      )}
                                    </div>

                                    {/* Product Details */}
                                    <div className="flex items-center justify-between mb-4">
                                      <div className="flex items-center gap-4 text-sm">
                                        {product.sku && (
                                          <div className="flex items-center gap-1 text-stone-500 dark:text-stone-400">
                                            <FileText className="h-4 w-4" />
                                            <span>{product.sku}</span>
                                          </div>
                                        )}
                                        <div className="flex items-center gap-1 text-stone-500 dark:text-stone-400">
                                          <Package className="h-4 w-4" />
                                          <span>{product.stock} {isRTL ? 'قطعة' : 'pcs'}</span>
                                        </div>
                                      </div>
                                      {product.isActive ? (
                                        <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 text-xs">
                                          <Activity className="h-3 w-3 mr-1" />
                                          {isRTL ? 'نشط' : 'Active'}
                                        </Badge>
                                      ) : (
                                        <Badge variant="secondary" className="text-xs">
                                          {isRTL ? 'غير نشط' : 'Inactive'}
                                        </Badge>
                                      )}
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="flex items-center gap-3">
                                      <Button
                                        className="flex-1 bg-purple-600 hover:bg-purple-700 text-white"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleAddToCart({ type: 'PRODUCT', id: product.id });
                                        }}
                                        disabled={product.stock === 0 || !currentUserId}
                                      >
                                        <ShoppingBag className="h-4 w-4 mr-2" />
                                        {isRTL ? 'أضف للسلة' : 'Add to Cart'}
                                      </Button>
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          window.open(`/product/${product.id}`, '_blank');
                                        }}
                                      >
                                        <Eye className="h-4 w-4" />
                                      </Button>
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleContact('email');
                                        }}
                                        disabled={!user.email}
                                      >
                                        <Mail className="h-4 w-4" />
                                      </Button>
                                    </div>
                                  </div>
                                  </CardContent>
                                </div>
                              </Card>
                            </motion.div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <Card className="p-12 text-center bg-white/60 dark:bg-stone-900/60 backdrop-blur-lg border border-white/20 dark:border-stone-700/20">
                    <div className="w-16 h-16 bg-stone-100 dark:bg-stone-800 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Package className="h-8 w-8 text-stone-400" />
                    </div>
                    <h3 className="text-xl font-semibold text-stone-900 dark:text-white mb-2">
                      {isRTL ? 'لا توجد منتجات' : 'No Products Found'}
                    </h3>
                    <p className="text-stone-500 dark:text-stone-400">
                      {isRTL ? 'لم يقم هذا المزود بإضافة أي منتجات بعد' : 'This provider hasn\'t added any products yet'}
                    </p>
                  </Card>
                )}
              </TabsContent>

              {/* Enhanced Shops Tab */}
              <TabsContent value="shops" className="space-y-6">
                <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between mb-8">
                  <div className="flex items-center gap-3">
                    <h3 className="text-2xl font-bold text-stone-900 dark:text-white">
                      {isRTL ? 'المتاجر' : 'Shops'}
                    </h3>
                    <Badge variant="secondary" className="text-sm">
                      {user.shops.length}
                    </Badge>
                  </div>
                  {currentUserId === user?.id && (
                    <Button 
                      className="gap-2 bg-blue-600 hover:bg-blue-700"
                      onClick={() => navigate('/dashboard/shops')}
                    >
                      <Plus className="h-4 w-4" />
                      {isRTL ? 'أضف متجر جديد' : 'Add New Shop'}
                    </Button>
                  )}
                </div>

                {user.shops.length > 0 ? (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {user.shops.map((shop, index) => (
                      <motion.div
                        key={shop.id}
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1, duration: 0.5 }}
                      >
                        <Card className="group hover:shadow-2xl transition-all duration-500 bg-white/90 dark:bg-stone-900/90 backdrop-blur-lg border border-white/20 dark:border-stone-700/20 overflow-hidden">
                          <CardContent className="p-0">
                            {/* Shop Header */}
                            <div className="relative p-6 bg-gradient-to-br from-indigo-50 to-purple-100 dark:from-indigo-900/30 dark:to-purple-900/30">
                              <div className="flex items-start justify-between mb-4">
                                <div className="flex items-center gap-4">
                                  <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                                    {shop.name.charAt(0).toUpperCase()}
                                  </div>
                                  <div>
                                    <h4 className="text-xl font-bold text-stone-900 dark:text-white mb-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                                      {shop.name}
                                    </h4>
                                    <div className="flex items-center gap-2 mb-2">
                                      {shop.isVerified ? (
                                        <Badge className="bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200">
                                          <Verified className="h-3 w-3 mr-1" />
                                          {isRTL ? 'موثق' : 'Verified'}
                                        </Badge>
                                      ) : (
                                        <Badge variant="secondary">
                                          <Clock className="h-3 w-3 mr-1" />
                                          {isRTL ? 'قيد المراجعة' : 'Pending'}
                                        </Badge>
                                      )}
                                      <Badge variant="outline">
                                        <MapPin className="h-3 w-3 mr-1" />
                                        {shop.city}
                                      </Badge>
                                    </div>
                                    {shop.description && (
                                      <p className="text-sm text-stone-600 dark:text-stone-400 leading-relaxed line-clamp-2">
                                        {shop.description}
                                      </p>
                                    )}
                                  </div>
                                </div>
                                <div className="text-right">
                                  <div className="text-sm text-stone-500 dark:text-stone-400">
                                    {isRTL ? 'عضو منذ' : 'Since'}
                                  </div>
                                  <div className="text-sm font-medium text-stone-900 dark:text-white">
                                    {formatDate(shop.createdAt)}
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* Shop Stats */}
                            <div className="p-6">
                              <div className="grid grid-cols-3 gap-4 mb-6">
                                <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
                                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-2">
                                    <Briefcase className="h-4 w-4 text-white" />
                                  </div>
                                  <div className="text-lg font-bold text-blue-600 dark:text-blue-400">
                                    {shop._count.services}
                                  </div>
                                  <div className="text-xs text-blue-600/70 dark:text-blue-400/70">
                                    {isRTL ? 'خدمة' : 'Services'}
                                  </div>
                                </div>

                                <div className="text-center p-3 bg-purple-50 dark:bg-purple-900/20 rounded-xl">
                                  <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center mx-auto mb-2">
                                    <Package className="h-4 w-4 text-white" />
                                  </div>
                                  <div className="text-lg font-bold text-purple-600 dark:text-purple-400">
                                    {shop._count.products}
                                  </div>
                                  <div className="text-xs text-purple-600/70 dark:text-purple-400/70">
                                    {isRTL ? 'منتج' : 'Products'}
                                  </div>
                                </div>

                                <div className="text-center p-3 bg-amber-50 dark:bg-amber-900/20 rounded-xl">
                                  <div className="w-8 h-8 bg-amber-500 rounded-full flex items-center justify-center mx-auto mb-2">
                                    <MessageSquare className="h-4 w-4 text-white" />
                                  </div>
                                  <div className="text-lg font-bold text-amber-600 dark:text-amber-400">
                                    {shop._count.reviews}
                                  </div>
                                  <div className="text-xs text-amber-600/70 dark:text-amber-400/70">
                                    {isRTL ? 'تقييم' : 'Reviews'}
                                  </div>
                                </div>
                              </div>

                              {/* Contact Information */}
                              {(shop.phone || shop.email) && (
                                <div className="space-y-2 mb-6">
                                  {shop.phone && (
                                    <div className="flex items-center gap-3 text-sm text-stone-600 dark:text-stone-400">
                                      <Phone className="h-4 w-4" />
                                      <span>{shop.phone}</span>
                                    </div>
                                  )}
                                  {shop.email && (
                                    <div className="flex items-center gap-3 text-sm text-stone-600 dark:text-stone-400">
                                      <Mail className="h-4 w-4" />
                                      <span>{shop.email}</span>
                                    </div>
                                  )}
                                </div>
                              )}

                              {/* Action Buttons */}
                              <div className="flex items-center gap-3">
                                <Button 
                                  className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white"
                                  onClick={() => navigate(`/shop/${shop.slug || shop.id}`)}
                                >
                                  <Store className="h-4 w-4 mr-2" />
                                  {isRTL ? 'عرض المتجر' : 'View Shop'}
                                </Button>
                                <Button variant="outline" size="sm">
                                  <Settings className="h-4 w-4" />
                                </Button>
                                <Button variant="outline" size="sm">
                                  <Share2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <Card className="p-12 text-center bg-white/60 dark:bg-stone-900/60 backdrop-blur-lg border border-white/20 dark:border-stone-700/20">
                    <div className="w-16 h-16 bg-stone-100 dark:bg-stone-800 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Store className="h-8 w-8 text-stone-400" />
                    </div>
                    <h3 className="text-xl font-semibold text-stone-900 dark:text-white mb-2">
                      {isRTL ? 'لا توجد متاجر' : 'No Shops Found'}
                    </h3>
                    <p className="text-stone-500 dark:text-stone-400 mb-6">
                      {currentUserId === user?.id ? 
                        (isRTL ? 'ابدأ بإنشاء متجرك الأول وعرض خدماتك ومنتجاتك' : 'Start by creating your first shop to showcase your services and products')
                        : (isRTL ? 'لم يقم هذا المستخدم بإنشاء أي متاجر بعد' : 'This user hasn\'t created any shops yet')
                      }
                    </p>
                    {currentUserId === user?.id && (currentUser?.role === 'SHOP_OWNER' || currentUser?.role === 'PROVIDER') && (
                      <Button className="gap-2" onClick={() => navigate('/dashboard/shops')}>
                        <Plus className="h-4 w-4" />
                        {isRTL ? 'أنشئ متجرك الأول' : 'Create Your First Shop'}
                      </Button>
                    )}
                  </Card>
                )}
              </TabsContent>

              {/* Enhanced Reviews Tab */}
              <TabsContent value="reviews" className="space-y-6">
                <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between mb-8">
                  <div className="flex items-center gap-3">
                    <h3 className="text-2xl font-bold text-stone-900 dark:text-white">
                      {isRTL ? 'التقييمات' : 'Reviews'}
                    </h3>
                    <Badge variant="secondary" className="text-sm">
                      {user.reviews.length}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-3">
                    <Button variant="outline" size="sm" className="gap-2">
                      <Filter className="h-4 w-4" />
                      {isRTL ? 'فيلتر بالتقييم' : 'Filter by Rating'}
                    </Button>
                    <Button variant="outline" size="sm" className="gap-2">
                      <Calendar className="h-4 w-4" />
                      {isRTL ? 'فيلتر بالتاريخ' : 'Filter by Date'}
                    </Button>
                  </div>
                </div>

                {user.reviews.length > 0 ? (
                  <div className="space-y-6">
                    {user.reviews.map((review, index) => (
                      <motion.div
                        key={review.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        <Card className="group hover:shadow-xl transition-all duration-300 bg-white/80 dark:bg-stone-900/80 backdrop-blur-lg border border-white/20 dark:border-stone-700/20">
                          <CardContent className="p-6">
                            <div className="flex items-start gap-4">
                              {/* Review Avatar */}
                              <div className="w-12 h-12 bg-gradient-to-br from-indigo-400 to-purple-600 rounded-full flex items-center justify-center text-white text-lg font-bold flex-shrink-0">
                                U
                              </div>

                              {/* Review Content */}
                              <div className="flex-1 min-w-0">
                                {/* Review Header */}
                                <div className="flex items-start justify-between mb-3">
                                  <div>
                                    <div className="flex items-center gap-3 mb-2">
                                      <div className="flex items-center">
                                        {[...Array(5)].map((_, i) => (
                                          <Star
                                            key={i}
                                            className={`h-5 w-5 ${i < review.rating ? 'text-amber-500 fill-amber-500' : 'text-stone-300 dark:text-stone-600'}`}
                                          />
                                        ))}
                                      </div>
                                      <Badge className="bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200">
                                        {review.rating}.0
                                      </Badge>
                                      <span className="text-sm text-stone-500 dark:text-stone-400">
                                        {formatDate(review.createdAt)}
                                      </span>
                                    </div>
                                    {/* Service or Shop Context */}
                                    {review.service && (
                                      <div className="flex items-center gap-2 mb-2">
                                        <Briefcase className="h-4 w-4 text-blue-500" />
                                        <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
                                          {isRTL ? review.service.translation?.name_ar : review.service.translation?.name_en}
                                        </span>
                                      </div>
                                    )}
                                    {review.shop && (
                                      <div className="flex items-center gap-2 mb-2">
                                        <Store className="h-4 w-4 text-purple-500" />
                                        <span className="text-sm font-medium text-purple-600 dark:text-purple-400">
                                          {review.shop.name}
                                        </span>
                                      </div>
                                    )}
                                  </div>

                                  {/* Review Actions */}
                                  <div className="flex items-center gap-2">
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => handleReviewReaction(review.id, 'HELPFUL')}
                                      disabled={!currentUserId}
                                      className="hover:bg-green-50 hover:text-green-600"
                                    >
                                      <ThumbsUp className="h-4 w-4" />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => handleReviewReaction(review.id, 'LIKE')}
                                      disabled={!currentUserId}
                                      className="hover:bg-blue-50 hover:text-blue-600"
                                    >
                                      <Heart className="h-4 w-4" />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => handleSendMessage()}
                                      disabled={!currentUserId}
                                      className="hover:bg-purple-50 hover:text-purple-600"
                                    >
                                      <MessageCircle className="h-4 w-4" />
                                    </Button>
                                  </div>
                                </div>

                                {/* Review Comment */}
                                {review.comment && (
                                  <div className="bg-stone-50/50 dark:bg-stone-800/50 rounded-xl p-4 mb-4">
                                    <p className="text-stone-700 dark:text-stone-300 leading-relaxed">
                                      {review.comment}
                                    </p>
                                  </div>
                                )}

                                {/* Review Tags */}
                                <div className="flex items-center gap-2">
                                  <Badge variant="outline" className="text-xs">
                                    <MessageSquare className="h-3 w-3 mr-1" />
                                    {isRTL ? 'تقييم مفصل' : 'Detailed Review'}
                                  </Badge>
                                  {review.rating >= 4 && (
                                    <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 text-xs">
                                      <ThumbsUp className="h-3 w-3 mr-1" />
                                      {isRTL ? 'إيجابي' : 'Positive'}
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <Card className="p-12 text-center bg-white/60 dark:bg-stone-900/60 backdrop-blur-lg border border-white/20 dark:border-stone-700/20">
                    <div className="w-16 h-16 bg-stone-100 dark:bg-stone-800 rounded-full flex items-center justify-center mx-auto mb-4">
                      <MessageSquare className="h-8 w-8 text-stone-400" />
                    </div>
                    <h3 className="text-xl font-semibold text-stone-900 dark:text-white mb-2">
                      {isRTL ? 'لا توجد تقييمات' : 'No Reviews Yet'}
                    </h3>
                    <p className="text-stone-500 dark:text-stone-400">
                      {isRTL ? 'لم يضع هذا المستخدم أي تقييمات بعد' : 'This user hasn\'t written any reviews yet'}
                    </p>
                  </Card>
                )}
              </TabsContent>
            </Tabs>
          </motion.div>
        </div>
      </div>
      
      {/* Report User Modal */}
      <Dialog open={showReportModal} onOpenChange={setShowReportModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Flag className="h-5 w-5 text-red-500" />
              {isRTL ? 'بلاغ عن المستخدم' : 'Report User'}
            </DialogTitle>
            <DialogDescription>
              {isRTL ? 'رجاءاً اختر سبب البلاغ وصف المشكلة' : 'Please select a reason and describe the issue'}
            </DialogDescription>
          </DialogHeader>
          <ReportModal 
            onSubmit={handleReportUser}
            onCancel={() => setShowReportModal(false)}
            isRTL={isRTL}
          />
        </DialogContent>
      </Dialog>
      
      {/* Claim Account Modal */}
      <Dialog open={showClaimModal} onOpenChange={setShowClaimModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UserCheck className="h-5 w-5 text-blue-500" />
              {isRTL ? 'مطالبة بالحساب' : 'Claim Account'}
            </DialogTitle>
            <DialogDescription>
              {isRTL ? 'هل هذا حسابك؟ يمكنك المطالبة به للحصول على إمكانية الوصول' : 'Is this your account? You can claim it to get access'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="text-sm text-stone-600 dark:text-stone-400">
              {isRTL ? 'سيتم مراجعة طلبك والتحقق من هويتك قبل منحك الوصول للحساب' : 'Your request will be reviewed and your identity verified before granting access'}
            </div>
          </div>
          <DialogFooter className="flex gap-2">
            <Button variant="outline" onClick={() => setShowClaimModal(false)}>
              {isRTL ? 'إلغاء' : 'Cancel'}
            </Button>
            <Button onClick={handleClaimAccount} className="bg-blue-600 hover:bg-blue-700">
              {isRTL ? 'إرسال الطلب' : 'Submit Claim'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

// Report Modal Component
interface ReportModalProps {
  onSubmit: (reason: string, details: string) => void;
  onCancel: () => void;
  isRTL: boolean;
}

const ReportModal: React.FC<ReportModalProps> = ({ onSubmit, onCancel, isRTL }) => {
  const [reason, setReason] = useState('');
  const [details, setDetails] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const reasons = [
    { value: 'spam', label: isRTL ? 'سبام أو محتوى غير مرغوب فيه' : 'Spam or unwanted content' },
    { value: 'inappropriate', label: isRTL ? 'محتوى غير لائق' : 'Inappropriate content' },
    { value: 'fake', label: isRTL ? 'حساب وهمي أو مزيف' : 'Fake or misleading account' },
    { value: 'harassment', label: isRTL ? 'تحرش أو تنمر' : 'Harassment or bullying' },
    { value: 'other', label: isRTL ? 'أخرى' : 'Other' }
  ];

  const handleSubmit = async () => {
    if (!reason.trim() || !details.trim()) return;
    
    setIsSubmitting(true);
    await onSubmit(reason, details);
    setIsSubmitting(false);
  };

  return (
    <div className="space-y-4 py-4">
      <div>
        <label className="block text-sm font-medium mb-2">
          {isRTL ? 'سبب البلاغ' : 'Reason for report'}
        </label>
        <Select value={reason} onValueChange={setReason}>
          <SelectTrigger>
            <SelectValue placeholder={isRTL ? 'اختر سبباً' : 'Select a reason'} />
          </SelectTrigger>
          <SelectContent>
            {reasons.map(r => (
              <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      <div>
        <label className="block text-sm font-medium mb-2">
          {isRTL ? 'تفاصيل إضافية' : 'Additional details'}
        </label>
        <Textarea
          value={details}
          onChange={(e) => setDetails(e.target.value)}
          placeholder={isRTL ? 'صف المشكلة بالتفصيل...' : 'Describe the issue in detail...'}
          rows={3}
        />
      </div>
      
      <DialogFooter className="flex gap-2">
        <Button variant="outline" onClick={onCancel} disabled={isSubmitting}>
          {isRTL ? 'إلغاء' : 'Cancel'}
        </Button>
        <Button 
          onClick={handleSubmit} 
          disabled={!reason.trim() || !details.trim() || isSubmitting}
          className="bg-red-600 hover:bg-red-700"
        >
          {isSubmitting ? (isRTL ? 'جاري الإرسال...' : 'Submitting...') : (isRTL ? 'إرسال البلاغ' : 'Submit Report')}
        </Button>
      </DialogFooter>
    </div>
  );
};

export default UserProfile;
