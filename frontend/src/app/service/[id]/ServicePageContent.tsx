'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import {
  ArrowLeft,
  Wrench,
  Calendar,
  MapPin,
  Star,
  DollarSign,
  Clock,
  User,
  MessageSquare,
  Heart,
  CheckCircle,
  Info,
} from 'lucide-react';
import { StarDisplay } from '@/components/StarRating';
import CategoryBadge from '@/components/ui/CategoryBadge';
import PriorityIndicator from '@/components/ui/PriorityIndicator';
import AvailabilityStatus from '@/components/ui/AvailabilityStatus';
import FilterTagsBadge from '@/components/ui/FilterTagsBadge';
import { MedicalServiceView } from '@/components/MedicalServiceView';

interface ServiceData {
  id: string;
  name: string;
  description?: string;
  translation?: {
    name_en?: string;
    name_ar?: string;
    description_en?: string;
    description_ar?: string;
  };
  price?: number;
  currency?: string;
  duration?: string;
  durationMins?: number;
  city?: string;
  locationLat?: number;
  locationLon?: number;
  isVerified?: boolean;
  verifiedBadge?: string;
  createdAt: string;
  reviews: any[];
  avgRating?: number;
  reviewsCount?: number;
  design?: {
    id: string;
    name: string;
    description: string;
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
    slug?: string;
    description?: string;
    city?: string;
    locationLat?: number;
    locationLon?: number;
    phone?: string;
    isVerified?: boolean;
  };
  category?: {
    en: string;
    ar: string;
  };
  priority?: number;
  filterTags?: string[];
  metadata?: {
    specialty?: string;
    availability?: string;
    price?: string;
    isRecommended?: boolean;
    isVerified?: boolean;
    categoryCode?: string;
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

interface ServicePageContentProps {
  service: ServiceData;
}

const ServicePageContent: React.FC<ServicePageContentProps> = ({ service }) => {
  console.log('ServicePageContent rendering with service:', service?.id, service?.design?.slug);
  
  const router = useRouter();
  const { t, i18n } = useTranslation();
  
  console.log('ServicePageContent i18n ready:', i18n.isInitialized, 'language:', i18n.language);
  
  const [activeTab, setActiveTab] = useState('overview');
  
  // Medical service view state
  const [chatQuery, setChatQuery] = useState('');
  
  // Booking functionality state
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<{start: string; end: string} | null>(null);
  const [availableSlots, setAvailableSlots] = useState<{start: string; end: string}[]>([]);
  const [isLoadingSlots, setIsLoadingSlots] = useState(false);
  const [bookingNotes, setBookingNotes] = useState('');
  const [bookingError, setBookingError] = useState('');
  const [isCreatingBooking, setIsCreatingBooking] = useState(false);
  
  // Calendar state
  const [selectedCalendarDate, setSelectedCalendarDate] = useState<number | null>(null);

  const isRTL = i18n.language === 'ar';

  const handleBack = () => {
    router.back();
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(i18n.language === 'ar' ? 'ar-EG' : 'en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatPrice = (price: number, currency: string = 'EGP') => {
    if (price === 0) return isRTL ? 'مجاني' : 'Free';
    return isRTL ? `${price} ${currency}` : `${currency} ${price}`;
  };

  const getDisplayName = () => {
    if (service?.translation) {
      return isRTL ? service.translation.name_ar : service.translation.name_en;
    }
    return service?.name || '';
  };

  const getDisplayDescription = () => {
    if (service?.translation) {
      return isRTL ? service.translation.description_ar : service.translation.description_en;
    }
    return service?.description || '';
  };

  // Helper functions for MedicalServiceView compatibility
  const getDisplayNameForResult = (result: any, isRTL: boolean): string => {
    if (result?.translation) {
      return isRTL ? result.translation.name_ar : result.translation.name_en;
    }
    return result?.name || 'Unknown';
  };

  const getDisplayDescriptionForResult = (result: any, isRTL: boolean): string => {
    if (result?.translation) {
      return isRTL ? result.translation.description_ar : result.translation.description_en;
    }
    return result?.description || result?.shop?.description || '';
  };

  const getDisplayRating = (result: any): number => {
    if (result?.avgRating !== null && result?.avgRating !== undefined) {
      return result.avgRating;
    }
    return 0;
  };

  const getReviewsCount = (result: any): number => {
    if (result?.reviewsCount !== null && result?.reviewsCount !== undefined) {
      return result.reviewsCount;
    }
    return result?.reviews?.length || 0;
  };

  const getAddress = (result: any): string => {
    if (result?.address && result.address.trim() !== '') {
      return result.address;
    }
    if (result?.shop?.city && result.shop.city.trim() !== '') {
      return result.shop.city;
    }
    if (result?.city && result.city.trim() !== '') {
      return result.city;
    }
    return isRTL ? 'العنوان غير متاح' : 'Address not available';
  };

  const getPhoneNumber = (result: any): string => {
    return result?.phone || result?.shop?.phone || result?.ownerUser?.phone || '';
  };

  // Medical service view handlers
  const handleChatSubmit = () => {
    console.log('Chat submitted:', chatQuery);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleChatSubmit();
    }
  };

  const handleBookAppointment = () => {
    console.log('Opening booking modal for service:', service?.id);
    setShowBookingModal(true);
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    setSelectedDate(tomorrow.toISOString().split('T')[0]);
    loadAvailableSlots(tomorrow.toISOString().split('T')[0]);
  };
  
  const loadAvailableSlots = async (date: string) => {
    if (!service?.id || !date) return;
    
    setIsLoadingSlots(true);
    setBookingError('');
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const dayOfWeek = new Date(date).getDay();
      const mockSlots = [
        { start: '09:00', end: '09:30' },
        { start: '10:00', end: '10:30' },
        { start: '11:00', end: '11:30' },
        { start: '14:00', end: '14:30' },
        { start: '15:00', end: '15:30' },
        { start: '16:00', end: '16:30' },
      ];
      
      const availableSlots = dayOfWeek === 0 || dayOfWeek === 6 
        ? mockSlots.slice(0, 3)
        : mockSlots;
      
      setAvailableSlots(availableSlots);
      setSelectedTimeSlot(null);
    } catch (error) {
      console.error('Error loading available slots:', error);
      setBookingError(isRTL ? 'خطأ في تحميل المواعيد المتاحة' : 'Error loading available slots');
      setAvailableSlots([]);
    } finally {
      setIsLoadingSlots(false);
    }
  };
  
  const handleDateChange = (date: string) => {
    setSelectedDate(date);
    loadAvailableSlots(date);
  };
  
  const handleTimeSlotSelect = (slot: {start: string; end: string}) => {
    setSelectedTimeSlot(slot);
    setBookingError('');
  };
  
  const handleScrollToBooking = () => {
    const bookingCard = document.getElementById('booking-card');
    if (bookingCard) {
      bookingCard.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'center' 
      });
      
      setTimeout(() => {
        bookingCard.style.transform = 'scale(1.02)';
        bookingCard.style.transition = 'transform 0.3s ease';
        
        setTimeout(() => {
          bookingCard.style.transform = 'scale(1)';
        }, 1000);
      }, 500);
      
      console.log('Scrolled to booking calendar');
    }
  };
  
  const handleChatNow = () => {
    const chatInput = document.querySelector('input[placeholder*="Ask about"], input[placeholder*="اسأل"]') as HTMLInputElement;
    if (chatInput) {
      chatInput.focus();
      chatInput.placeholder = isRTL 
        ? 'اكتب رسالتك للدكتور هنا...' 
        : 'Type your message to the doctor here...';
    }
    console.log('Chat initiated with doctor:', getDisplayNameForResult(service, isRTL));
  };

  const handleCreateBooking = async () => {
    if (!selectedTimeSlot || !selectedDate || !service?.id) {
      setBookingError(isRTL ? 'يرجى اختيار التاريخ والوقت' : 'Please select date and time');
      return;
    }
    
    setIsCreatingBooking(true);
    setBookingError('');
    
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const bookingData = {
        serviceId: service.id,
        date: selectedDate,
        timeSlot: selectedTimeSlot,
        notes: bookingNotes.trim(),
        doctorName: getDisplayNameForResult(service, isRTL),
        clinicAddress: getAddress(service)
      };
      
      console.log('Booking created:', bookingData);
      
      setShowBookingModal(false);
      
      alert(isRTL 
        ? `تم حجز موعدك بنجاح!\n\nالتاريخ: ${selectedDate}\nالوقت: ${selectedTimeSlot.start} - ${selectedTimeSlot.end}\nالدكتور: ${getDisplayNameForResult(service, isRTL)}\n\nسيتم التواصل معك قريباً لتأكيد الموعد.`
        : `Appointment booked successfully!\n\nDate: ${selectedDate}\nTime: ${selectedTimeSlot.start} - ${selectedTimeSlot.end}\nDoctor: ${getDisplayNameForResult(service, isRTL)}\n\nYou will be contacted soon to confirm your appointment.`
      );
      
      setSelectedDate('');
      setSelectedTimeSlot(null);
      setBookingNotes('');
      setAvailableSlots([]);
      
    } catch (error) {
      console.error('Error creating booking:', error);
      setBookingError(isRTL ? 'خطأ في إنشاء الحجز، يرجى المحاولة مرة أخرى' : 'Error creating booking, please try again');
    } finally {
      setIsCreatingBooking(false);
    }
  };
  
  const handleCalendarDateClick = (dayNum: number) => {
    if (dayNum < 1 || dayNum > 31) return;
    
    setSelectedCalendarDate(dayNum);
    
    const currentDate = new Date();
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const selectedDateObj = new Date(year, month, dayNum);
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    selectedDateObj.setHours(0, 0, 0, 0);
    
    if (selectedDateObj < today) {
      console.log('Cannot select past dates');
      return;
    }
    
    const dateString = selectedDateObj.toISOString().split('T')[0];
    setSelectedDate(dateString);
    loadAvailableSlots(dateString);
    
    console.log(`Selected date: ${dateString} (day ${dayNum})`);
  };

  const handleCallNow = () => {
    const phone = getPhoneNumber(service);
    if (phone) {
      window.open(`tel:${phone}`);
    }
  };

  // Check if this is a medical service and render MedicalServiceView
  console.log('ServicePageContent checking medical service:', service?.design?.slug === 'medical');
  
  if (service && service.design?.slug === 'medical') {
    console.log('ServicePageContent rendering MedicalServiceView');
    return (
      <MedicalServiceView
        selectedResult={service}
        onBack={handleBack}
        chatQuery={chatQuery}
        onChatQueryChange={setChatQuery}
        onChatSubmit={handleChatSubmit}
        handleKeyPress={handleKeyPress}
        handleBookAppointment={handleBookAppointment}
        handleCallNow={handleCallNow}
        getDisplayName={getDisplayNameForResult}
        getDisplayDescription={getDisplayDescriptionForResult}
        getDisplayRating={getDisplayRating}
        getReviewsCount={getReviewsCount}
        getAddress={getAddress}
        getPhoneNumber={getPhoneNumber}
        showBookingModal={showBookingModal}
        setShowBookingModal={setShowBookingModal}
        availableSlots={availableSlots}
        isLoadingSlots={isLoadingSlots}
        selectedDate={selectedDate}
        selectedTimeSlot={selectedTimeSlot}
        bookingNotes={bookingNotes}
        bookingError={bookingError}
        isCreatingBooking={isCreatingBooking}
        handleDateChange={handleDateChange}
        handleTimeSlotSelect={handleTimeSlotSelect}
        setBookingNotes={setBookingNotes}
        handleCreateBooking={handleCreateBooking}
        selectedCalendarDate={selectedCalendarDate}
        handleCalendarDateClick={handleCalendarDateClick}
        handleScrollToBooking={handleScrollToBooking}
        handleChatNow={handleChatNow}
      />
    );
  }

  return (
    <div className="min-h-screen pb-16 bg-background">
      {/* Breadcrumbs Section */}
      <div className="bg-background border-b shadow-sm mb-8">
        <div className="max-w-6xl mx-auto px-6 py-4">
          {/* Breadcrumbs */}
          <Breadcrumb className="mb-2">
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link href="/">{isRTL ? 'الرئيسية' : 'Home'}</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>{isRTL ? 'تفاصيل الخدمة' : 'Service Details'}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6">
        {/* Service Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="mb-8 bg-background">
            <CardContent className="p-8">
              <div className="flex flex-col md:flex-row gap-6">
                {/* Service Icon */}
                <div className="flex-shrink-0">
                  <div className="w-24 h-24 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                    <Wrench className="h-12 w-12 text-blue-600 dark:text-blue-400" />
                  </div>
                </div>

                {/* Service Info */}
                <div className="flex-1 space-y-4">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <h1 className="text-3xl font-bold text-text-primary">
                        {getDisplayName()}
                      </h1>
                      
                      {/* AI Category Badge */}
                      {service.category && (
                        <CategoryBadge 
                          category={service.category} 
                          size="default"
                        />
                      )}
                      
                      {service.isVerified && (
                        <Badge className="bg-blue-100 text-blue-800 border-blue-200">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          {isRTL ? 'موثق' : 'Verified'}
                        </Badge>
                      )}
                    </div>

                    {/* AI Specialty Information */}
                    {service.metadata?.specialty && (
                      <p className="text-lg text-blue-600 dark:text-blue-400 mb-2">
                        <Info className="h-4 w-4 inline mr-1" />
                        {service.metadata.specialty}
                      </p>
                    )}

                    {getDisplayDescription() && (
                      <p className="text-text-secondary text-lg leading-relaxed">
                        {getDisplayDescription()}
                      </p>
                    )}

                    {/* Filter Tags Display */}
                    {service.filterTags && service.filterTags.length > 0 && (
                      <div className="mt-3">
                        <FilterTagsBadge 
                          filterTags={service.filterTags}
                          maxDisplay={5}
                          size="md"
                        />
                      </div>
                    )}
                  </div>

                  {/* Key Stats */}
                  <div className="flex flex-wrap gap-6">
                    {service.avgRating && (
                      <div className="flex items-center gap-2">
                        <Star className="h-5 w-5 text-yellow-500 fill-current" />
                        <span className="font-semibold text-lg">{service.avgRating}</span>
                        <span className="text-text-muted">
                          ({service.reviewsCount || 0} {isRTL ? 'تقييم' : 'reviews'})
                        </span>
                      </div>
                    )}

                    {service.price && (
                      <div className="flex items-center gap-2">
                        <DollarSign className="h-5 w-5 text-green-600" />
                        <span className="font-semibold text-lg text-green-600">
                          {formatPrice(service.price, service.currency)}
                        </span>
                      </div>
                    )}

                    {service.duration && (
                      <div className="flex items-center gap-2">
                        <Clock className="h-5 w-5 text-purple-600" />
                        <span className="text-text-secondary">{service.duration}</span>
                      </div>
                    )}

                    {service.city && (
                      <div className="flex items-center gap-2">
                        <MapPin className="h-5 w-5 text-stone-600" />
                        <span className="text-text-secondary">{service.city}</span>
                      </div>
                    )}
                  </div>

                  {/* Availability Status */}
                  {service.metadata?.availability && (
                    <div className="flex items-center gap-2">
                      <AvailabilityStatus
                        availability={service.metadata.availability}
                        size="md"
                      />
                    </div>
                  )}

                  {/* Priority Indicator */}
                  {service.priority && (
                    <div className="flex items-center gap-4">
                      <span className="text-text-muted">
                        {isRTL ? 'مستوى الأولوية:' : 'Priority Level:'}
                      </span>
                      <PriorityIndicator 
                        priority={service.priority}
                        variant="bars"
                        size="md"
                        showLabel={true}
                      />
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col gap-3 min-w-[200px]">
                  <Button size="lg" className="w-full" onClick={handleBookAppointment}>
                    <Calendar className="h-5 w-5 mr-2" />
                    {isRTL ? 'احجز الآن' : 'Book Now'}
                  </Button>
                  
                  <Button variant="outline" size="lg" className="w-full">
                    <MessageSquare className="h-5 w-5 mr-2" />
                    {isRTL ? 'تواصل' : 'Contact'}
                  </Button>
                  
                  <Button variant="ghost" size="lg" className="w-full">
                    <Heart className="h-5 w-5 mr-2" />
                    {isRTL ? 'حفظ' : 'Save'}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Provider Information */}
        {service.ownerUser && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <Card className="mb-8 bg-background">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  {isRTL ? 'مقدم الخدمة' : 'Service Provider'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4">
                  <Avatar className="h-16 w-16">
                    <AvatarImage src={service.ownerUser.profilePic} alt={service.ownerUser.name} />
                    <AvatarFallback>
                      {service.ownerUser.name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-xl font-semibold">{service.ownerUser.name}</h3>
                      {service.ownerUser.isVerified && (
                        <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-200">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          {isRTL ? 'موثق' : 'Verified'}
                        </Badge>
                      )}
                    </div>
                    
                    <Link 
                      href={`/user/${service.ownerUser.id}`}
                      className="text-primary hover:underline"
                    >
                      {isRTL ? 'عرض الملف الشخصي' : 'View Profile'}
                    </Link>
                  </div>

                  <Button variant="outline" asChild>
                    <Link href={`/user/${service.ownerUser.id}`}>
                      {isRTL ? 'زيارة الملف الشخصي' : 'Visit Profile'}
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Service Details Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="overview">{isRTL ? 'نظرة عامة' : 'Overview'}</TabsTrigger>
              <TabsTrigger value="reviews">{isRTL ? 'التقييمات' : 'Reviews'}</TabsTrigger>
              <TabsTrigger value="booking">{isRTL ? 'الحجز' : 'Booking'}</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <Card className="bg-background">
                <CardHeader>
                  <CardTitle>{isRTL ? 'تفاصيل الخدمة' : 'Service Details'}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-semibold text-text-primary mb-2">
                        {isRTL ? 'المواصفات' : 'Specifications'}
                      </h4>
                      <div className="space-y-2">
                        {service.price && (
                          <div className="flex justify-between">
                            <span className="text-text-muted">{isRTL ? 'السعر:' : 'Price:'}</span>
                            <span className="font-medium">{formatPrice(service.price, service.currency)}</span>
                          </div>
                        )}
                        {service.duration && (
                          <div className="flex justify-between">
                            <span className="text-text-muted">{isRTL ? 'المدة:' : 'Duration:'}</span>
                            <span className="font-medium">{service.duration}</span>
                          </div>
                        )}
                        {service.city && (
                          <div className="flex justify-between">
                            <span className="text-text-muted">{isRTL ? 'المدينة:' : 'City:'}</span>
                            <span className="font-medium">{service.city}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="reviews" className="space-y-6">
              <Card className="bg-background">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Star className="h-5 w-5" />
                    {isRTL ? 'التقييمات والمراجعات' : 'Reviews & Ratings'}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {service.reviews && service.reviews.length > 0 ? (
                    <div className="space-y-4">
                      {service.reviews.map((review, index) => (
                        <div key={index} className="border-b pb-4 last:border-b-0">
                          <div className="flex items-start gap-3">
                            <Avatar className="h-10 w-10">
                              <AvatarFallback>
                                {review.user?.name?.charAt(0) || 'U'}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <h5 className="font-medium">{review.user?.name || 'Anonymous'}</h5>
                                <StarDisplay rating={review.rating} size="sm" />
                              </div>
                              <p className="text-text-secondary text-sm">{review.comment}</p>
                              <span className="text-xs text-text-muted">
                                {formatDate(review.createdAt)}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Star className="h-12 w-12 text-stone-400 mx-auto mb-4" />
                      <p className="text-text-muted">
                        {isRTL ? 'لا توجد تقييمات بعد' : 'No reviews yet'}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="booking" className="space-y-6">
              <Card className="bg-background">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    {isRTL ? 'حجز الخدمة' : 'Book Service'}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8">
                    <Calendar className="h-12 w-12 text-stone-400 mx-auto mb-4" />
                    <p className="text-text-muted mb-4">
                      {isRTL ? 'نظام الحجز قادم قريباً' : 'Booking system coming soon'}
                    </p>
                    <Button className="w-full max-w-sm" onClick={handleBookAppointment}>
                      <MessageSquare className="h-4 w-4 mr-2" />
                      {isRTL ? 'تواصل مع مقدم الخدمة' : 'Contact Provider'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </div>
  );
};

export default ServicePageContent;
