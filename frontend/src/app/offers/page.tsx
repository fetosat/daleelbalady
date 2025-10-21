'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Tag, 
  Calendar,
  MapPin,
  Star,
  Users,
  Clock,
  Gift,
  TrendingUp,
  Filter,
  Search,
  ExternalLink,
  Sparkles,
  Crown,
  Zap
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { OfferService, Offer } from '@/services/offerService';
import { toast } from 'sonner';

const OffersPage: React.FC = () => {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [filteredOffers, setFilteredOffers] = useState<Offer[]>([]);

  useEffect(() => {
    fetchOffers();
  }, []);

  useEffect(() => {
    filterOffers();
  }, [offers, searchTerm, selectedCategory]);

  const fetchOffers = async () => {
    try {
      setLoading(true);
      const response = await OfferService.getOffers();
      setOffers(response.offers);
    } catch (error) {
      console.error('فشل في جلب العروض:', error);
      toast.error('فشل في جلب العروض');
    } finally {
      setLoading(false);
    }
  };

  const filterOffers = () => {
    let filtered = offers;

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(offer => offer.category === selectedCategory);
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(offer => 
        offer.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        offer.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        offer.provider.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredOffers(filtered);
  };

  const getOfferTypeIcon = (type: string) => {
    switch (type) {
      case 'PERCENTAGE':
        return <Tag className="h-4 w-4 text-green-600" />;
      case 'FIXED_AMOUNT':
        return <Gift className="h-4 w-4 text-blue-600" />;
      case 'BUY_ONE_GET_ONE':
        return <Users className="h-4 w-4 text-purple-600" />;
      default:
        return <Sparkles className="h-4 w-4 text-yellow-600" />;
    }
  };

  const getOfferTypeText = (type: string, value: number) => {
    switch (type) {
      case 'PERCENTAGE':
        return `خصم ${value}%`;
      case 'FIXED_AMOUNT':
        return `خصم ${value} جنيه`;
      case 'BUY_ONE_GET_ONE':
        return 'اشتري واحد واحصل على آخر';
      default:
        return 'عرض خاص';
    }
  };

  const getOfferBadgeVariant = (type: string) => {
    switch (type) {
      case 'PERCENTAGE':
        return 'default';
      case 'FIXED_AMOUNT':
        return 'secondary';
      case 'BUY_ONE_GET_ONE':
        return 'outline';
      default:
        return 'default';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ar-EG', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const isOfferExpired = (endDate: string) => {
    return new Date(endDate) < new Date();
  };

  const isOfferExpiringSoon = (endDate: string) => {
    const daysDiff = Math.ceil((new Date(endDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
    return daysDiff <= 7 && daysDiff > 0;
  };

  const getUniqueCategories = () => {
    const categories = [...new Set(offers.map(offer => offer.category))];
    return categories;
  };

  const getActiveOffers = () => filteredOffers.filter(offer => !isOfferExpired(offer.endDate));
  const getExpiredOffers = () => filteredOffers.filter(offer => isOfferExpired(offer.endDate));
  const getFeaturedOffers = () => filteredOffers.filter(offer => offer.featured && !isOfferExpired(offer.endDate));

  if (loading) {
    return (
      <div className="min-h-screen bg-stone-50 py-8 dark:bg-stone-950">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-stone-600">جاري تحميل العروض...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50 dark:bg-stone-950 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Tag className="h-8 w-8 text-blue-600" />
            <h1 className="text-3xl font-bold">العروض والخصومات</h1>
          </div>
          <p className="text-stone-600">اكتشف أحدث العروض والخصومات الحصرية</p>
        </div>

        {/* Search and Filter */}
        <div className="mb-6 space-y-4 bg-white dark:bg-stone-900 p-4 rounded-lg shadow-sm">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="h-4 w-4 absolute left-3 top-3 text-stone-400" />
                <Input 
                  placeholder="البحث في العروض..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <select 
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-3 py-2 border rounded-md bg-white dark:bg-stone-900 text-sm"
              >
                <option value="all">جميع الفئات</option>
                {getUniqueCategories().map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Offers Tabs */}
        <Tabs defaultValue="active" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="active" className="flex items-center gap-2">
              <Zap className="h-4 w-4" />
              العروض النشطة ({getActiveOffers().length})
            </TabsTrigger>
            <TabsTrigger value="featured" className="flex items-center gap-2">
              <Crown className="h-4 w-4" />
              العروض المميزة ({getFeaturedOffers().length})
            </TabsTrigger>
            <TabsTrigger value="expired" className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              العروض المنتهية ({getExpiredOffers().length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="active" className="space-y-4">
            {getActiveOffers().length === 0 ? (
              <div className="text-center py-12">
                <Tag className="h-16 w-16 mx-auto mb-4 text-stone-300" />
                <p className="text-stone-500">لا توجد عروض نشطة حالياً</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {getActiveOffers().map(offer => (
                  <OfferCard key={offer.id} offer={offer} />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="featured" className="space-y-4">
            {getFeaturedOffers().length === 0 ? (
              <div className="text-center py-12">
                <Crown className="h-16 w-16 mx-auto mb-4 text-stone-300" />
                <p className="text-stone-500">لا توجد عروض مميزة حالياً</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {getFeaturedOffers().map(offer => (
                  <OfferCard key={offer.id} offer={offer} featured />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="expired" className="space-y-4">
            {getExpiredOffers().length === 0 ? (
              <div className="text-center py-12">
                <Clock className="h-16 w-16 mx-auto mb-4 text-stone-300" />
                <p className="text-stone-500">لا توجد عروض منتهية</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {getExpiredOffers().map(offer => (
                  <OfferCard key={offer.id} offer={offer} expired />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

interface OfferCardProps {
  offer: Offer;
  featured?: boolean;
  expired?: boolean;
}

const OfferCard: React.FC<OfferCardProps> = ({ offer, featured = false, expired = false }) => {
  const isExpired = expired || new Date(offer.endDate) < new Date();
  const isExpiringSoon = !isExpired && Math.ceil((new Date(offer.endDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)) <= 7;

  const getOfferTypeIcon = (type: string) => {
    switch (type) {
      case 'PERCENTAGE':
        return <Tag className="h-4 w-4 text-green-600" />;
      case 'FIXED_AMOUNT':
        return <Gift className="h-4 w-4 text-blue-600" />;
      case 'BUY_ONE_GET_ONE':
        return <Users className="h-4 w-4 text-purple-600" />;
      default:
        return <Sparkles className="h-4 w-4 text-yellow-600" />;
    }
  };

  const getOfferTypeText = (type: string, value: number) => {
    switch (type) {
      case 'PERCENTAGE':
        return `خصم ${value}%`;
      case 'FIXED_AMOUNT':
        return `خصم ${value} جنيه`;
      case 'BUY_ONE_GET_ONE':
        return 'اشتري واحد واحصل على آخر';
      default:
        return 'عرض خاص';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ar-EG', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <Card className={`relative overflow-hidden transition-all hover:shadow-lg ${
      featured ? 'ring-2 ring-yellow-400 shadow-lg' : ''
    } ${isExpired ? 'opacity-60' : ''}`}>
      {featured && (
        <div className="absolute top-2 right-2 bg-yellow-400 text-yellow-900 px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1">
          <Crown className="h-3 w-3" />
          مميز
        </div>
      )}

      {isExpiringSoon && !isExpired && (
        <div className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1">
          <Clock className="h-3 w-3" />
          ينتهي قريباً
        </div>
      )}

      {isExpired && (
        <div className="absolute top-2 left-2 bg-stone-500 text-white px-2 py-1 rounded-full text-xs font-medium">
          منتهي
        </div>
      )}

      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <CardTitle className="text-lg leading-tight">{offer.title}</CardTitle>
            <div className="flex items-center gap-2 text-sm text-stone-600">
              <MapPin className="h-3 w-3" />
              {offer.provider.name}
            </div>
          </div>
          <Badge variant={isExpired ? 'secondary' : 'default'} className="flex items-center gap-1">
            {getOfferTypeIcon(offer.offerType)}
            {getOfferTypeText(offer.offerType, offer.discountValue)}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <p className="text-sm text-stone-600 line-clamp-2">{offer.description}</p>

        <div className="space-y-2 text-xs text-stone-500">
          <div className="flex items-center gap-2">
            <Calendar className="h-3 w-3" />
            <span>من {formatDate(offer.startDate)} إلى {formatDate(offer.endDate)}</span>
          </div>
          
          {offer.usageLimit && (
            <div className="flex items-center gap-2">
              <Users className="h-3 w-3" />
              <span>محدود بـ {offer.usageLimit} استخدام</span>
            </div>
          )}

          {offer.category && (
            <Badge variant="outline" className="text-xs">
              {offer.category}
            </Badge>
          )}
        </div>

        {offer.terms && (
          <>
            <Separator />
            <div className="text-xs text-stone-500">
              <p className="font-medium mb-1">الشروط والأحكام:</p>
              <p className="line-clamp-2">{offer.terms}</p>
            </div>
          </>
        )}

        <div className="flex gap-2 pt-2">
          <Button 
            size="sm" 
            className="flex-1"
            disabled={isExpired}
          >
            {isExpired ? 'عرض منتهي' : 'عرض التفاصيل'}
          </Button>
          
          {offer.provider.website && (
            <Button 
              size="sm" 
              variant="outline"
              className="px-3"
              onClick={() => window.open(offer.provider.website, '_blank')}
            >
              <ExternalLink className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default OffersPage;
