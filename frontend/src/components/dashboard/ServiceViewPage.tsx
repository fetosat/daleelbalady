import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { 
  ArrowRight, 
  Star, 
  MapPin, 
  Clock, 
  DollarSign, 
  Phone, 
  Mail, 
  Globe, 
  Calendar,
  Users,
  Award,
  Shield,
  Edit,
  Eye,
  Share2,
  Bookmark,
  MessageCircle,
  PhoneCall,
  CheckCircle,
  XCircle,
  AlertTriangle
} from 'lucide-react';
import api, { services } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

interface ServiceData {
  id: string;
  vid?: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  duration?: string;
  durationMins: number;
  city?: string;
  locationLat?: number;
  locationLon?: number;
  available: boolean;
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
  reviews: Review[];
  avgRating: number;
  reviewsCount: number;
  coverImage?: string;
  logoImage?: string;
  images?: string[];
  category?: {
    id: string;
    name: string;
    slug: string;
  };
  subCategory?: {
    id: string;
    name: string;
    slug: string;
  };
  ownerUser?: {
    id: string;
    name: string;
    profilePic?: string;
    isVerified: boolean;
    phone?: string;
    email?: string;
    bio?: string;
  };
  shop?: {
    id: string;
    name: string;
    slug: string;
    description?: string;
    city?: string;
    phone?: string;
    isVerified: boolean;
    _count?: {
      services: number;
      products: number;
      reviews: number;
    };
  };
  stats: {
    totalBookings: number;
    avgRating: number;
    totalReviews: number;
    availability: string;
    isVerified: boolean;
    memberSince: string;
  };
}

interface Review {
  id: string;
  rating: number;
  comment: string;
  isVerified: boolean;
  createdAt: string;
  user: {
    id: string;
    name: string;
    profilePic?: string;
    isVerified: boolean;
  };
}

interface ServiceViewPageProps {
  serviceId: string;
  onClose: () => void;
  onEdit?: () => void;
}

export default function ServiceViewPage({ serviceId, onClose, onEdit }: ServiceViewPageProps) {
  const [service, setService] = useState<ServiceData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (serviceId) {
      fetchServiceData();
    }
  }, [serviceId]);

  const fetchServiceData = async () => {
    try {
      setIsLoading(true);
      console.log('🔍 Fetching service data for ID:', serviceId);
      
      const response = await services.getById(serviceId);
      
      if (response.success) {
        setService(response.service);
        console.log('✅ Service data fetched:', response.service);
      } else {
        throw new Error(response.message || 'Failed to fetch service');
      }
    } catch (error: any) {
      console.error('❌ Error fetching service:', error);
      toast({
        title: 'خطأ',
        description: error.response?.data?.message || 'فشل في تحميل بيانات الخدمة',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getRatingStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star 
        key={i} 
        className={`h-4 w-4 ${
          i < rating ? 'text-yellow-400 fill-current' : 'text-stone-300'
        }`} 
      />
    ));
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ar-EG', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getStatusIcon = (available: boolean) => {
    return available ? 
      <CheckCircle className="h-4 w-4 text-green-500" /> : 
      <XCircle className="h-4 w-4 text-red-500" />;
  };

  const getStatusColor = (available: boolean) => {
    return available ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ar-EG', {
      style: 'currency',
      currency: 'EGP',
      minimumFractionDigits: 0
    }).format(amount);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">جارٍ تحميل بيانات الخدمة...</p>
        </div>
      </div>
    );
  }

  if (!service) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="max-w-md mx-auto">
          <CardContent className="p-8 text-center">
            <AlertTriangle className="h-12 w-12 text-orange-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">لم يتم العثور على الخدمة</h3>
            <p className="text-muted-foreground mb-4">
              الخدمة المطلوبة غير موجودة أو تم حذفها
            </p>
            <Button onClick={onClose} variant="outline">
              <ArrowRight className="h-4 w-4 mr-2" />
              العودة
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="min-h-screen bg-background p-6"
    >
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Button onClick={onClose} variant="outline" size="sm">
              <ArrowRight className="h-4 w-4 mr-2" />
              العودة
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-foreground">{service.name}</h1>
              <p className="text-muted-foreground">تفاصيل الخدمة</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <Share2 className="h-4 w-4 mr-2" />
              مشاركة
            </Button>
            <Button variant="outline" size="sm">
              <Bookmark className="h-4 w-4 mr-2" />
              حفظ
            </Button>
            {onEdit && (
              <Button onClick={onEdit} size="sm">
                <Edit className="h-4 w-4 mr-2" />
                تعديل
              </Button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Service Images */}
            {(service.coverImage || service.images?.length > 0) && (
              <Card>
                <CardContent className="p-0">
                  <div className="relative">
                    {service.coverImage ? (
                      <img 
                        src={service.coverImage.startsWith('http') 
                          ? service.coverImage 
                          : `${process.env.REACT_APP_API_URL || 'https://api.daleelbalady.com/api'}${service.coverImage.startsWith('/') ? service.coverImage : '/' + service.coverImage}`
                        }
                        alt={service.name}
                        className="w-full h-64 object-cover rounded-t-lg"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = `https://via.placeholder.com/600x256/e2e8f0/64748b?text=${encodeURIComponent('صورة غير متاحة')}`;
                        }}
                      />
                    ) : service.images?.[0] && (
                      <img 
                        src={(() => {
                          const image = service.images[0];
                          return image.startsWith('http') 
                            ? image 
                            : `${process.env.REACT_APP_API_URL || 'https://api.daleelbalady.com/api'}${image.startsWith('/') ? image : '/' + image}`;
                        })()} 
                        alt={service.name}
                        className="w-full h-64 object-cover rounded-t-lg"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = `https://via.placeholder.com/600x256/e2e8f0/64748b?text=${encodeURIComponent('صورة غير متاحة')}`;
                        }}
                      />
                    )}
                    
                    {/* Gallery thumbnails */}
                    {service.images && service.images.length > 1 && (
                      <div className="absolute bottom-4 right-4 flex gap-2">
                        {service.images.slice(1, 4).map((image, index) => (
                          <img 
                            key={index}
                            src={image.startsWith('http') 
                              ? image 
                              : `${process.env.REACT_APP_API_URL || 'https://api.daleelbalady.com/api'}${image.startsWith('/') ? image : '/' + image}`
                            } 
                            alt={`${service.name} ${index + 2}`}
                            className="w-12 h-12 object-cover rounded border-2 border-white shadow-md cursor-pointer hover:scale-110 transition-transform"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.src = `https://via.placeholder.com/48x48/e2e8f0/64748b?text=${index + 2}`;
                            }}
                          />
                        ))}
                        {service.images.length > 4 && (
                          <div className="w-12 h-12 bg-black/50 rounded border-2 border-white shadow-md flex items-center justify-center text-white text-xs font-bold">
                            +{service.images.length - 4}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Service Details Card */}
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-2xl mb-2">{service.name}</CardTitle>
                    <CardDescription className="text-base">
                      {service.description}
                    </CardDescription>
                  </div>
                  <Badge className={getStatusColor(service.available)}>
                    {getStatusIcon(service.available)}
                    <span className="mr-1">
                      {service.available ? 'متاحة' : 'غير متاحة'}
                    </span>
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Service Info */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-muted/50 rounded-lg">
                    <DollarSign className="h-6 w-6 text-green-600 mx-auto mb-2" />
                    <p className="font-semibold text-lg">{service.price} {service.currency}</p>
                    <p className="text-xs text-muted-foreground">السعر</p>
                  </div>
                  <div className="text-center p-4 bg-muted/50 rounded-lg">
                    <Clock className="h-6 w-6 text-blue-600 mx-auto mb-2" />
                    <p className="font-semibold text-lg">{service.durationMins} دقيقة</p>
                    <p className="text-xs text-muted-foreground">المدة</p>
                  </div>
                  <div className="text-center p-4 bg-muted/50 rounded-lg">
                    <Calendar className="h-6 w-6 text-purple-600 mx-auto mb-2" />
                    <p className="font-semibold text-lg">{service.stats.totalBookings}</p>
                    <p className="text-xs text-muted-foreground">الحجوزات</p>
                  </div>
                  <div className="text-center p-4 bg-muted/50 rounded-lg">
                    <Star className="h-6 w-6 text-yellow-600 mx-auto mb-2" />
                    <p className="font-semibold text-lg">{service.avgRating}</p>
                    <p className="text-xs text-muted-foreground">التقييم</p>
                  </div>
                </div>

                {/* Categories */}
                {(service.category || service.subCategory) && (
                  <div>
                    <h3 className="font-semibold mb-2">التصنيف</h3>
                    <div className="flex gap-2">
                      {service.category && (
                        <Badge variant="secondary">{service.category.name}</Badge>
                      )}
                      {service.subCategory && (
                        <Badge variant="outline">{service.subCategory.name}</Badge>
                      )}
                    </div>
                  </div>
                )}

                {/* Location */}
                {service.city && (
                  <div>
                    <h3 className="font-semibold mb-2">الموقع</h3>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <MapPin className="h-4 w-4" />
                      <span>{service.city}</span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Reviews Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>التقييمات والمراجعات</span>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center">
                      {getRatingStars(Math.floor(service.avgRating))}
                    </div>
                    <span className="font-medium">{service.avgRating}</span>
                    <span className="text-muted-foreground">({service.reviewsCount} مراجعة)</span>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {service.reviews && service.reviews.length > 0 ? (
                  <div className="space-y-4">
                    {service.reviews.slice(0, 5).map((review) => (
                      <div key={review.id} className="border-b pb-4">
                        <div className="flex items-start gap-3">
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={review.user.profilePic} />
                            <AvatarFallback>
                              {review.user.name.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-medium">{review.user.name}</span>
                              {review.user.isVerified && (
                                <CheckCircle className="h-4 w-4 text-green-500" />
                              )}
                              <div className="flex items-center">
                                {getRatingStars(review.rating)}
                              </div>
                            </div>
                            <p className="text-muted-foreground text-sm mb-2">
                              {formatDate(review.createdAt)}
                            </p>
                            {review.comment && (
                              <p className="text-foreground">{review.comment}</p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <MessageCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">لا توجد مراجعات حتى الآن</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Provider/Shop Info */}
            {(service.ownerUser || service.shop) && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">
                    {service.shop ? 'المتجر' : 'مقدم الخدمة'}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {service.shop ? (
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-12 w-12">
                          <AvatarFallback>
                            {service.shop.name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <h3 className="font-semibold flex items-center gap-2">
                            {service.shop.name}
                            {service.shop.isVerified && (
                              <Shield className="h-4 w-4 text-green-500" />
                            )}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            {service.shop.description}
                          </p>
                        </div>
                      </div>
                      
                      {service.shop.city && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <MapPin className="h-4 w-4" />
                          <span>{service.shop.city}</span>
                        </div>
                      )}
                      
                      {service.shop.phone && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Phone className="h-4 w-4" />
                          <span>{service.shop.phone}</span>
                        </div>
                      )}
                      
                      {service.shop._count && (
                        <div className="grid grid-cols-3 gap-2 text-center text-sm">
                          <div>
                            <p className="font-medium">{service.shop._count.services}</p>
                            <p className="text-muted-foreground">خدمات</p>
                          </div>
                          <div>
                            <p className="font-medium">{service.shop._count.products}</p>
                            <p className="text-muted-foreground">منتجات</p>
                          </div>
                          <div>
                            <p className="font-medium">{service.shop._count.reviews}</p>
                            <p className="text-muted-foreground">مراجعات</p>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : service.ownerUser ? (
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={service.ownerUser.profilePic} />
                          <AvatarFallback>
                            {service.ownerUser.name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <h3 className="font-semibold flex items-center gap-2">
                            {service.ownerUser.name}
                            {service.ownerUser.isVerified && (
                              <Shield className="h-4 w-4 text-green-500" />
                            )}
                          </h3>
                          {service.ownerUser.bio && (
                            <p className="text-sm text-muted-foreground">
                              {service.ownerUser.bio}
                            </p>
                          )}
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        {service.ownerUser.phone && (
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Phone className="h-4 w-4" />
                            <span>{service.ownerUser.phone}</span>
                          </div>
                        )}
                        {service.ownerUser.email && (
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Mail className="h-4 w-4" />
                            <span>{service.ownerUser.email}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ) : null}
                  
                  <Separator className="my-4" />
                  
                  <div className="flex gap-2">
                    <Button size="sm" className="flex-1">
                      <PhoneCall className="h-4 w-4 mr-2" />
                      اتصال
                    </Button>
                    <Button variant="outline" size="sm" className="flex-1">
                      <MessageCircle className="h-4 w-4 mr-2" />
                      رسالة
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Service Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">إحصائيات الخدمة</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">تاريخ الإنشاء</span>
                    <span className="font-medium">
                      {formatDate(service.createdAt)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">آخر تحديث</span>
                    <span className="font-medium">
                      {formatDate(service.updatedAt)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">الحالة</span>
                    <Badge className={getStatusColor(service.available)}>
                      {service.available ? 'نشطة' : 'معطلة'}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">التحقق</span>
                    <div className="flex items-center gap-1">
                      {service.isVerified ? (
                        <>
                          <Shield className="h-4 w-4 text-green-500" />
                          <span className="text-green-600 text-sm">محقق</span>
                        </>
                      ) : (
                        <span className="text-muted-foreground text-sm">غير محقق</span>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <Card>
              <CardContent className="p-4">
                <div className="space-y-2">
                  <Button className="w-full" size="lg">
                    <Calendar className="h-4 w-4 mr-2" />
                    احجز الآن
                  </Button>
                  <Button variant="outline" className="w-full">
                    <Eye className="h-4 w-4 mr-2" />
                    عرض في الموقع العام
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
