import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { ReviewForm } from './ReviewForm';
import { StarDisplay, StarRating } from './StarRating';
import { Navbar } from './Navbar';
import reviewAPI from '../services/reviewAPI';

interface LegalServiceViewProps {
    selectedResult: any;
    onBack: () => void;
    chatQuery: string;
    onChatQueryChange: (value: string) => void;
    onChatSubmit: () => void;
    handleKeyPress: (e: React.KeyboardEvent) => void;
    handleBookAppointment: () => void;
    handleCallNow: () => void;
    getDisplayName: (result: any, isRTL: boolean) => string;
    getDisplayDescription: (result: any, isRTL: boolean) => string;
    getDisplayRating: (result: any) => number;
    getReviewsCount: (result: any) => number;
    getAddress: (result: any) => string;
    getPhoneNumber: (result: any) => string;
    showBookingModal: boolean;
    setShowBookingModal: (show: boolean) => void;
    availableSlots: any[];
    isLoadingSlots: boolean;
    selectedDate: string;
    selectedTimeSlot: any;
    bookingNotes: string;
    bookingError: string;
    isCreatingBooking: boolean;
    handleDateChange: (date: string) => void;
    handleTimeSlotSelect: (slot: any) => void;
    setBookingNotes: (notes: string) => void;
    handleCreateBooking: () => void;
    // Add calendar functionality
    selectedCalendarDate?: number | null;
    handleCalendarDateClick?: (dayNum: number) => void;
    // New functionality
    handleScrollToBooking?: () => void;
    handleChatNow?: () => void;
}

export function LegalServiceView({
    selectedResult,
    onBack,
    chatQuery,
    onChatQueryChange,
    onChatSubmit,
    handleKeyPress,
    handleBookAppointment,
    handleCallNow,
    getDisplayName,
    getDisplayDescription,
    getDisplayRating,
    getReviewsCount,
    getAddress,
    getPhoneNumber,
    showBookingModal,
    setShowBookingModal,
    availableSlots,
    isLoadingSlots,
    selectedDate,
    selectedTimeSlot,
    bookingNotes,
    bookingError,
    isCreatingBooking,
    handleDateChange,
    handleTimeSlotSelect,
    setBookingNotes,
    handleCreateBooking,
    selectedCalendarDate,
    handleCalendarDateClick,
    handleScrollToBooking,
    handleChatNow
}: LegalServiceViewProps) {
    const { t, i18n } = useTranslation();
    const isRTL = i18n.language === 'ar';
    
    // Add state for booking card highlighting
    const [highlightBookingCard, setHighlightBookingCard] = useState(false);
    
    // Enhanced scroll to booking with highlighting
    const enhancedScrollToBooking = () => {
        const bookingCard = document.getElementById('booking-card');
        if (bookingCard) {
            // Scroll to the booking card
            bookingCard.scrollIntoView({ 
                behavior: 'smooth', 
                block: 'center' 
            });
            
            // Trigger highlighting after scroll
            setTimeout(() => {
                setHighlightBookingCard(true);
                
                // Remove highlighting after 3 seconds
                setTimeout(() => {
                    setHighlightBookingCard(false);
                }, 3000);
            }, 800);
        }
        
        // Also call the original handler if provided
        if (handleScrollToBooking) {
            handleScrollToBooking();
        }
    };
    
    // Review state
    const [reviews, setReviews] = useState([]);
    const [reviewStats, setReviewStats] = useState(null);
    const [isLoadingReviews, setIsLoadingReviews] = useState(false);
    const [showReviewForm, setShowReviewForm] = useState(false);
    const [reviewFormRating, setReviewFormRating] = useState(0);
    const [reviewFormComment, setReviewFormComment] = useState('');
    const [reviewError, setReviewError] = useState('');
    const [isSubmittingReview, setIsSubmittingReview] = useState(false);
    const [currentReviewPage, setCurrentReviewPage] = useState(1);
    
    // Load reviews when component mounts
    useEffect(() => {
        if (selectedResult?.id) {
            loadReviews();
        }
    }, [selectedResult?.id]);
    
    const loadReviews = async () => {
        if (!selectedResult?.id) return;
        
        setIsLoadingReviews(true);
        try {
            const response = await reviewAPI.getReviews({
                serviceId: selectedResult.id,
                productId: undefined,
                shopId: undefined,
                page: currentReviewPage,
                limit: 5,
                rating: undefined
            });
            
            setReviews(response.reviews);
            setReviewStats(response.statistics);
        } catch (error) {
            console.error('Error loading reviews:', error);
            // Fallback to mock data on error
            setReviews([
                { 
                    id: '1', 
                    rating: 5, 
                    comment: i18n.language === 'ar' ? 'محامي ممتاز ومتمكن، ساعدني كثيراً في قضيتي وكان متعاوناً جداً' : 'Excellent lawyer who is very competent. Helped me a lot with my case and was very cooperative.', 
                    author: { id: 'user123', name: 'Client 123', isVerified: true },
                    createdAt: new Date().toISOString()
                },
                { 
                    id: '2', 
                    rating: 5, 
                    comment: i18n.language === 'ar' ? 'مكتب محاماة محترف والمحامي متخصص ولديه خبرة كبيرة. أنصح به بشدة' : 'Professional law firm with specialized and experienced lawyer. Highly recommend.', 
                    author: { id: 'user456', name: 'Client 456', isVerified: true },
                    createdAt: new Date().toISOString()
                }
            ]);
            setReviewStats({
                totalReviews: 2,
                averageRating: 5.0,
                ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 2 }
            });
        } finally {
            setIsLoadingReviews(false);
        }
    };
    
    const handleReviewSubmit = async () => {
        if (reviewFormRating === 0) {
            setReviewError(i18n.language === 'ar' ? 'يرجى اختيار تقييم' : 'Please select a rating');
            return;
        }
        
        if (!reviewAPI.isAuthenticated()) {
            setReviewError(i18n.language === 'ar' ? 'يجب تسجيل الدخول لإضافة تقييم' : 'Please log in to add a review');
            return;
        }
        
        setIsSubmittingReview(true);
        setReviewError('');
        
        try {
            await reviewAPI.createReview({
                serviceId: selectedResult.id,
                productId: undefined,
                shopId: undefined,
                rating: reviewFormRating,
                comment: reviewFormComment.trim() || undefined
            });
            
            // Reset form
            setReviewFormRating(0);
            setReviewFormComment('');
            setShowReviewForm(false);
            
            // Reload reviews
            loadReviews();
            
            // Show success message
            alert(i18n.language === 'ar' ? 'تم إرسال التقييم بنجاح!' : 'Review submitted successfully!');
        } catch (error) {
            console.error('Error submitting review:', error);
            setReviewError(error instanceof Error ? error.message : 'Failed to submit review');
        } finally {
            setIsSubmittingReview(false);
        }
    };

    return (
        <>
            {/* Navigation Bar - Fixed at top */}
            <Navbar />
            
            <div className="min-h-screen bg-gradient-to-br from-amber-50/30 via-white to-blue-50/30 dark:from-zinc-900 dark:via-zinc-800 dark:to-zinc-900">
            
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="min-h-screen pb-32 pt-20 relative"
            >
            {/* Extended Background Pattern - Full Page */}
            <div className="fixed inset-0 -z-10 bg-gradient-to-r from-amber-600 via-yellow-500 to-blue-600 dark:from-amber-950 dark:via-yellow-800 dark:to-blue-950 overflow-hidden">
                <div className="absolute inset-0 opacity-20">
                    <div className="w-full h-full" style={{
                        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='4'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                        backgroundRepeat: 'repeat'
                    }}></div>
                </div>
            </div>
            
            {/* Hero Section - Full Width */}
            <div className="relative w-full py-5 bg-gradient-to-r from-amber-600 via-yellow-500 to-blue-600 dark:from-amber-950 dark:via-yellow-800 dark:to-blue-950 overflow-hidden">
                <div className="absolute inset-0 opacity-20">
                    <div className="w-full h-full" style={{
                        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='4'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                        backgroundRepeat: 'repeat'
                    }}></div>
                </div>
                {/* Back Button - Floating */}
                <motion.button
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    onClick={onBack}
                    className="absolute top-6 left-6 z-10 bg-white/10 backdrop-blur-md border border-white/20 text-white px-4 py-2 rounded-full hover:bg-white/20 transition-all duration-300 flex items-center gap-2 group"
                >
                    <motion.span 
                        className="text-xl group-hover:-transtone-x-1 transition-transform" 
                        whileHover={{ x: -3 }}
                    >
                        ←
                    </motion.span>
                    <span className="font-medium">{i18n.language === 'ar' ? 'عودة' : 'Back'}</span>
                </motion.button>

                {/* Hero Content */}
                <div className="relative z-10 max-w-7xl mx-auto px-6 h-full flex items-center">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center w-full">
                        {/* Left Content */}
                        <motion.div 
                            initial={{ opacity: 0, x: -50 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.2 }}
                            className="text-white"
                        >
                            <div className="flex items-center gap-3 mb-4">
                                <span className="text-4xl">⚖️</span>
                                <span className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-medium">
                                    {selectedResult.shop?.name || (i18n.language === 'ar' ? 'مكتب محاماة' : 'Law Firm')}
                                </span>
                            </div>
                            <h1 className="text-5xl lg:text-6xl font-bold mb-6 leading-tight">
                                {getDisplayName(selectedResult, isRTL)}
                            </h1>
                            <p className="text-xl mb-8 text-amber-100 leading-relaxed">
                                {getDisplayDescription(selectedResult, isRTL) || (i18n.language === 'ar' ? 'محامي متخصص في تقديم أفضل الخدمات القانونية للعملاء' : 'Legal expert dedicated to providing the best legal services for clients')}
                            </p>
                            <div className="flex flex-wrap gap-4">
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={enhancedScrollToBooking}
                                    className="bg-white text-amber-600 dark:text-black px-8 py-4 rounded-full font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-3"
                                >
                                    📅 {i18n.language === 'ar' ? 'احجز استشارة' : 'Book Consultation'}
                                </motion.button>
                                
                                {/* Chat Button */}
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={handleChatNow || (() => console.log('Chat clicked'))}
                                    className="bg-transparent border-2 border-white text-white px-8 py-4 rounded-full font-semibold text-lg hover:bg-white hover:text-blue-600 transition-all duration-300 flex items-center gap-3"
                                >
                                    💬 {i18n.language === 'ar' ? 'محادثة' : 'Chat Now'}
                                </motion.button>
                                
                                {getPhoneNumber(selectedResult) && (
                                    <motion.button
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={handleCallNow}
                                        className="bg-transparent border-2 border-white text-white px-8 py-4 rounded-full font-semibold text-lg hover:bg-white hover:text-amber-600 transition-all duration-300 flex items-center gap-3"
                                    >
                                        📞 {i18n.language === 'ar' ? 'اتصل الآن' : 'Call Now'}
                                    </motion.button>
                                )}
                            </div>
                        </motion.div>

                        {/* Right Content - Stats Cards */}
                        <motion.div 
                            className="grid grid-cols-2 gap-4"
                            initial={{ opacity: 0, x: 50 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.4 }}
                        >
                            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 text-white text-center">
                                <div className="text-3xl font-bold mb-2">{getDisplayRating(selectedResult) > 0 ? getDisplayRating(selectedResult) : '4.9'}</div>
                                <div className="text-amber-100 flex items-center justify-center gap-1">
                                    ⭐ {i18n.language === 'ar' ? 'تقييم' : 'Rating'}
                                </div>
                            </div>
                            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 text-white text-center">
                                <div className="text-3xl font-bold mb-2">{getReviewsCount(selectedResult) || '200+'}</div>
                                <div className="text-amber-100 flex items-center justify-center gap-1">
                                    👥 {i18n.language === 'ar' ? 'عملاء' : 'Clients'}
                                </div>
                            </div>
                            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 text-white text-center">
                                <div className="text-3xl font-bold mb-2">15+</div>
                                <div className="text-amber-100 flex items-center justify-center gap-1">
                                    📅 {i18n.language === 'ar' ? 'سنوات خبرة' : 'Years Exp'}
                                </div>
                            </div>
                            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 text-white text-center">
                                <div className="text-3xl font-bold mb-2">24/7</div>
                                <div className="text-amber-100 flex items-center justify-center gap-1">
                                    ⚖️ {i18n.language === 'ar' ? 'متوفر' : 'Available'}
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </div>

            {/* Main Content Area - Full Width Magazine Style */}
            <div className="max-w-7xl mx-auto px-6 py-16">
                
                {/* Quick Info Banner */}
                <motion.div 
                    className="bg-white/80 dark:bg-zinc-800/80 backdrop-blur-xl rounded-3xl p-8 mb-12 border border-zinc-100/50 dark:border-zinc-700/50 shadow-2xl"
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                >
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
                        <div className="flex items-center gap-4">
                            <div className="w-16 h-16 bg-gradient-to-br from-amber-100 to-yellow-100 dark:from-amber-800 dark:to-yellow-800 rounded-2xl flex items-center justify-center shadow-lg">
                                <span className="text-3xl">📍</span>
                            </div>
                            <div>
                                <h3 className="font-semibold text-zinc-800 dark:text-white">{i18n.language === 'ar' ? 'العنوان' : 'Location'}</h3>
                                <p className="text-zinc-600 dark:text-zinc-300">{getAddress(selectedResult)}</p>
                            </div>
                        </div>
                        {getPhoneNumber(selectedResult) && (
                            <div className="flex items-center gap-4">
                                <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-800 dark:to-purple-800 rounded-2xl flex items-center justify-center shadow-lg">
                                    <span className="text-3xl">📞</span>
                                </div>
                                <div>
                                    <h3 className="font-semibold text-zinc-800 dark:text-white">{i18n.language === 'ar' ? 'الهاتف' : 'Phone'}</h3>
                                    <p className="text-zinc-600 dark:text-zinc-300">{getPhoneNumber(selectedResult)}</p>
                                </div>
                            </div>
                        )}
                        <div className="flex items-center gap-4">
                            <div className="w-16 h-16 bg-gradient-to-br from-amber-100 to-orange-100 dark:from-amber-800 dark:to-orange-800 rounded-2xl flex items-center justify-center shadow-lg">
                                <span className="text-3xl">🕒</span>
                            </div>
                            <div>
                                <h3 className="font-semibold text-zinc-800 dark:text-white">{i18n.language === 'ar' ? 'مواعيد العمل' : 'Working Hours'}</h3>
                                <p className="text-zinc-600 dark:text-zinc-300">{i18n.language === 'ar' ? '9:00 ص - 6:00 م' : '9:00 AM - 6:00 PM'}</p>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Two Column Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                    {/* Left Column - Main Content */}
                    <motion.div 
                        className="lg:col-span-2 space-y-12"
                        initial={{ opacity: 0, x: -30 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.8 }}
                    >
                        {/* About Lawyer Section */}
                        <div className="bg-white/90 dark:bg-zinc-800/90 backdrop-blur-xl rounded-3xl border border-zinc-100/50 dark:border-zinc-700/50 shadow-2xl overflow-hidden">
                            {/* Section Header */}
                            <div className="bg-gradient-to-r from-amber-500/10 to-blue-500/10 dark:from-amber-600/20 dark:to-blue-600/20 px-8 py-6 border-b border-zinc-100/50 dark:border-zinc-700/50">
                                <h2 className="text-3xl font-bold text-zinc-800 dark:text-white flex items-center gap-3">
                                    👨‍⚖️ {i18n.language === 'ar' ? 'نبذة عن المحامي' : 'About the Lawyer'}
                                </h2>
                            </div>
                            
                            <div className="p-8">
                                <div className="prose prose-lg max-w-none dark:prose-invert">
                                    <p className="text-zinc-600 dark:text-zinc-300 leading-relaxed mb-6">
                                        {i18n.language === 'ar' 
                                            ? `المحامي ${getDisplayName(selectedResult, isRTL)} هو محامي متخصص ذو خبرة واسعة في مجال القانون. حاصل على شهادات متقدمة في تخصصه ولديه سجل حافل بالنجاحات القانونية. يتميز بالدقة في التعامل مع القضايا والحرص على تقديم أفضل خدمة قانونية ممكنة لعملائه.`
                                            : `Attorney ${getDisplayName(selectedResult, isRTL)} is a highly experienced legal specialist with extensive expertise in their field. They hold advanced certifications and have a proven track record of legal excellence. Known for precision in handling cases and commitment to providing the highest quality legal services possible.`
                                        }
                                    </p>
                                    
                                    {/* Professional Highlights */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                                        <div className="bg-gradient-to-br from-amber-50 to-yellow-50 dark:from-amber-900/20 dark:to-yellow-900/20 p-6 rounded-2xl border border-amber-100 dark:border-amber-800/30">
                                            <h4 className="font-semibold text-zinc-800 dark:text-white mb-3 flex items-center gap-2">
                                                🎓 {i18n.language === 'ar' ? 'المؤهلات' : 'Qualifications'}
                                            </h4>
                                            <ul className="space-y-2 text-zinc-600 dark:text-zinc-300">
                                                <li>• {i18n.language === 'ar' ? 'بكالوريوس حقوق' : 'Bachelor of Law (LL.B)'}</li>
                                                <li>• {i18n.language === 'ar' ? 'عضو نقابة المحامين' : 'Bar Association Member'}</li>
                                                <li>• {i18n.language === 'ar' ? 'ماجستير في القانون التجاري' : 'Master in Commercial Law'}</li>
                                            </ul>
                                        </div>
                                        <div className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 p-6 rounded-2xl border border-blue-100 dark:border-blue-800/30">
                                            <h4 className="font-semibold text-zinc-800 dark:text-white mb-3 flex items-center gap-2">
                                                🏆 {i18n.language === 'ar' ? 'الإنجازات' : 'Achievements'}
                                            </h4>
                                            <ul className="space-y-2 text-zinc-600 dark:text-zinc-300">
                                                <li>• {i18n.language === 'ar' ? 'أكثر من 500 قضية منجزة' : '500+ Successful Cases'}</li>
                                                <li>• {i18n.language === 'ar' ? 'معدل نجاح 95%' : '95% Success Rate'}</li>
                                                <li>• {i18n.language === 'ar' ? 'جائزة التميز القانوني' : 'Legal Excellence Award'}</li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Services & Specialties Section */}
                        <div className="bg-white/90 dark:bg-zinc-800/90 backdrop-blur-xl rounded-3xl border border-zinc-100/50 dark:border-zinc-700/50 shadow-2xl overflow-hidden">
                            <div className="bg-gradient-to-r from-blue-500/10 to-amber-500/10 dark:from-blue-600/20 dark:to-amber-600/20 px-8 py-6 border-b border-zinc-100/50 dark:border-zinc-700/50">
                                <h2 className="text-3xl font-bold text-zinc-800 dark:text-white flex items-center gap-3">
                                    ⚖️ {i18n.language === 'ar' ? 'الخدمات القانونية' : 'Legal Services'}
                                </h2>
                            </div>
                            
                            <div className="p-8">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                                    {[
                                        { 
                                            icon: '📋', 
                                            title: i18n.language === 'ar' ? 'القانون التجاري' : 'Commercial Law',
                                            desc: i18n.language === 'ar' ? 'تأسيس الشركات والعقود التجارية' : 'Company formation and commercial contracts'
                                        },
                                        { 
                                            icon: '🏠', 
                                            title: i18n.language === 'ar' ? 'القانون العقاري' : 'Real Estate Law',
                                            desc: i18n.language === 'ar' ? 'بيع وشراء العقارات والنزاعات العقارية' : 'Property transactions and real estate disputes'
                                        },
                                        { 
                                            icon: '👨‍👩‍👧‍👦', 
                                            title: i18n.language === 'ar' ? 'قانون الأسرة' : 'Family Law',
                                            desc: i18n.language === 'ar' ? 'الطلاق والحضانة والنفقة' : 'Divorce, custody, and alimony cases'
                                        },
                                        { 
                                            icon: '⚖️', 
                                            title: i18n.language === 'ar' ? 'القضايا المدنية' : 'Civil Cases',
                                            desc: i18n.language === 'ar' ? 'النزاعات المدنية والتعويضات' : 'Civil disputes and compensation claims'
                                        }
                                    ].map((service, index) => (
                                        <motion.div
                                            key={index}
                                            className="group p-6 bg-gradient-to-br from-zinc-50 to-white dark:from-zinc-700/50 dark:to-zinc-800/50 rounded-2xl border border-zinc-100 dark:border-zinc-600/30 hover:shadow-lg transition-all duration-300"
                                            whileHover={{ scale: 1.02, y: -2 }}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: 0.9 + index * 0.1 }}
                                        >
                                            <div className="flex items-start gap-4">
                                                <div className="text-4xl group-hover:scale-110 transition-transform">{service.icon}</div>
                                                <div>
                                                    <h3 className="text-lg font-semibold text-zinc-800 dark:text-white mb-2">{service.title}</h3>
                                                    <p className="text-zinc-600 dark:text-zinc-300 text-sm leading-relaxed">{service.desc}</p>
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                                
                                {/* Legal Approach */}
                                <div className="bg-gradient-to-r from-amber-50 to-blue-50 dark:from-amber-900/10 dark:to-blue-900/10 p-8 rounded-2xl border border-amber-100 dark:border-amber-800/30">
                                    <h3 className="text-xl font-bold text-zinc-800 dark:text-white mb-4 flex items-center gap-2">
                                        ✨ {i18n.language === 'ar' ? 'منهجية العمل' : 'Legal Approach'}
                                    </h3>
                                    <p className="text-zinc-600 dark:text-zinc-300 leading-relaxed">
                                        {i18n.language === 'ar'
                                            ? 'نتبع منهجية شاملة في التعامل مع القضايا القانونية تركز على العميل كأساس، مع التركيز على الحلول الوقائية والدفاع الفعال. نستخدم أحدث الأساليب القانونية مع ضمان أعلى معايير الأمانة والمهنية.'
                                            : 'We follow a comprehensive, client-centered approach to legal matters, focusing on preventive solutions and effective defense. We use the latest legal methods while ensuring the highest standards of integrity and professionalism.'
                                        }
                                    </p>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Right Column - Sidebar */}
                    <motion.div 
                        className="lg:col-span-1 space-y-8"
                        initial={{ opacity: 0, x: 30 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 1.0 }}
                    >
                        <div className="sticky top-8 space-y-8">
                            {/* Booking Card */}
                            <div 
                                id="booking-card"
                                className={`bg-gradient-to-br from-amber-50 to-blue-50 dark:from-amber-900/20 dark:to-blue-900/20 backdrop-blur-xl rounded-3xl p-6 shadow-xl transition-all duration-700 ${
                                    highlightBookingCard 
                                        ? 'border-4 border-blue-500 shadow-2xl shadow-blue-300/60 dark:shadow-blue-800/60 scale-105 ring-4 ring-blue-200/50 dark:ring-blue-700/50' 
                                        : 'border border-amber-100/50 dark:border-amber-800/30'
                                }`}
                            >
                                <h3 className={`text-xl font-bold text-zinc-800 dark:text-white mb-4 flex items-center gap-2 transition-all duration-500 ${
                                    highlightBookingCard ? 'text-blue-700 dark:text-blue-400 scale-105' : ''
                                }`}>
                                    📅 {i18n.language === 'ar' ? 'احجز استشارتك' : 'Book Your Consultation'}
                                    {highlightBookingCard && (
                                        <motion.span
                                            initial={{ opacity: 0, scale: 0 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            className="ml-2 text-blue-500"
                                        >
                                            ✨
                                        </motion.span>
                                    )}
                                </h3>
                                
                                {/* Calendar View */}
                                <div className="mb-6">
                                    <div className="grid grid-cols-7 gap-1 mb-4">
                                        {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, index) => (
                                            <div key={index} className="text-center text-xs font-semibold text-zinc-500 dark:text-zinc-400 p-2">
                                                {day}
                                            </div>
                                        ))}
                                    </div>
                                    <div className="grid grid-cols-7 gap-1">
                                        {Array.from({ length: 35 }, (_, i) => {
                                            const dayNum = i - 6; // Start from a Sunday
                                            const isCurrentMonth = dayNum > 0 && dayNum <= 30;
                                            const today = new Date().getDate();
                                            const isToday = dayNum === today;
                                            const isPastDate = dayNum < today;
                                            const hasSlots = !isPastDate && isCurrentMonth; // All future dates have potential slots
                                            const isSelected = selectedCalendarDate === dayNum;
                                            
                                            return (
                                                <motion.button
                                                    key={i}
                                                    whileHover={isCurrentMonth && !isPastDate ? { scale: 1.1 } : {}}
                                                    whileTap={isCurrentMonth && !isPastDate ? { scale: 0.9 } : {}}
                                                    onClick={() => handleCalendarDateClick && handleCalendarDateClick(dayNum)}
                                                    className={`
                                                        aspect-square p-1 text-xs font-medium rounded-lg transition-all duration-200 cursor-pointer
                                                        ${!isCurrentMonth ? 'text-zinc-300 dark:text-zinc-700' : ''}
                                                        ${isToday ? 'bg-blue-500 text-white ring-2 ring-blue-300' : ''}
                                                        ${isSelected && !isToday ? 'bg-amber-500 text-white ring-2 ring-amber-300' : ''}
                                                        ${hasSlots && !isToday && !isSelected ? 'bg-amber-100 text-amber-700 hover:bg-amber-200 dark:bg-amber-900/30 dark:text-amber-400' : ''}
                                                        ${isPastDate ? 'text-zinc-300 dark:text-zinc-600 cursor-not-allowed' : ''}
                                                        ${!hasSlots && !isToday && !isSelected && !isPastDate && isCurrentMonth ? 'text-zinc-400 dark:text-zinc-600' : ''}
                                                    `}
                                                    disabled={!isCurrentMonth || isPastDate}
                                                >
                                                    {isCurrentMonth ? dayNum : ''}
                                                    {hasSlots && isCurrentMonth && !isPastDate && (
                                                        <div className="w-1 h-1 bg-amber-500 rounded-full mx-auto mt-0.5"></div>
                                                    )}
                                                </motion.button>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* Available Time Slots */}
                                {selectedDate && (
                                    <div className="mb-6">
                                        <h4 className="font-semibold text-zinc-700 dark:text-zinc-300 mb-3 flex items-center gap-2">
                                            🕒 {i18n.language === 'ar' ? `المواعيد المتاحة - ${selectedDate}` : `Available Times - ${selectedDate}`}
                                        </h4>
                                        {isLoadingSlots ? (
                                            <div className="flex items-center justify-center py-4">
                                                <motion.div
                                                    animate={{ rotate: 360 }}
                                                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                                    className="w-6 h-6 border-2 border-amber-500 border-t-transparent rounded-full"
                                                />
                                                <span className="ml-2 text-sm text-zinc-600 dark:text-zinc-400">
                                                    {i18n.language === 'ar' ? 'جاري تحميل المواعيد...' : 'Loading slots...'}
                                                </span>
                                            </div>
                                        ) : availableSlots.length > 0 ? (
                                            <div className="grid grid-cols-2 gap-2">
                                                {availableSlots.map((slot, index) => {
                                                    const isSelected = selectedTimeSlot?.start === slot.start && selectedTimeSlot?.end === slot.end;
                                                    return (
                                                        <motion.button
                                                            key={`${slot.start}-${slot.end}`}
                                                            whileHover={{ scale: 1.05 }}
                                                            whileTap={{ scale: 0.95 }}
                                                            onClick={() => handleTimeSlotSelect(slot)}
                                                            className={`p-3 rounded-xl border-2 text-sm font-medium transition-all duration-200 ${
                                                                isSelected
                                                                    ? 'border-amber-500 bg-amber-500 text-white'
                                                                    : 'bg-white/70 dark:bg-zinc-700/50 border-amber-200 dark:border-amber-700/50 text-zinc-700 dark:text-zinc-300 hover:bg-amber-100 dark:hover:bg-amber-900/30 hover:border-amber-300'
                                                            }`}
                                                            initial={{ opacity: 0, y: 10 }}
                                                            animate={{ opacity: 1, y: 0 }}
                                                            transition={{ delay: 0.1 + index * 0.05 }}
                                                        >
                                                            🕒 {slot.start} - {slot.end}
                                                        </motion.button>
                                                    );
                                                })}
                                            </div>
                                        ) : (
                                            <div className="text-center py-4 text-zinc-500 dark:text-zinc-400 text-sm">
                                                {i18n.language === 'ar' ? 'لا توجد مواعيد متاحة في هذا التاريخ' : 'No available slots for this date'}
                                            </div>
                                        )}
                                    </div>
                                )}
                                
                                {/* Default message when no date is selected */}
                                {!selectedDate && (
                                    <div className="mb-6">
                                        <h4 className="font-semibold text-zinc-700 dark:text-zinc-300 mb-3 flex items-center gap-2">
                                            🕒 {i18n.language === 'ar' ? 'المواعيد المتاحة' : 'Available Times'}
                                        </h4>
                                        <div className="text-center py-4 text-zinc-500 dark:text-zinc-400 text-sm">
                                            {i18n.language === 'ar' ? 'اختر تاريخ من التقويم أعلاه' : 'Select a date from the calendar above'}
                                        </div>
                                    </div>
                                )}

                                {/* Book Button - Opens modal with pre-filled data */}
                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() => {
                                        // If user has selected date/time from calendar, open modal with pre-filled data
                                        if (selectedDate && selectedTimeSlot) {
                                            setShowBookingModal(true);
                                        } else {
                                            // Otherwise use the default behavior
                                            handleBookAppointment();
                                        }
                                    }}
                                    disabled={!selectedDate || !selectedTimeSlot}
                                    className={`w-full py-4 rounded-2xl font-semibold transition-all duration-300 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl ${
                                        selectedDate && selectedTimeSlot
                                            ? 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white'
                                            : 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white opacity-50 cursor-not-allowed'
                                    }`}
                                >
                                    {selectedDate && selectedTimeSlot ? (
                                        <>
                                            ✨ {i18n.language === 'ar' ? 'تأكيد الحجز' : 'Confirm Booking'}
                                        </>
                                    ) : (
                                        <>
                                            🕒 {i18n.language === 'ar' ? 'اختر التاريخ والوقت' : 'Select Date & Time'}
                                        </>
                                    )}
                                </motion.button>
                            </div>

                            {/* Law Firm Info */}
                            <motion.div 
                                className="bg-white/90 dark:bg-zinc-800/90 backdrop-blur-xl rounded-3xl p-6 border border-zinc-100/50 dark:border-zinc-700/50 shadow-xl"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.8 }}
                            >
                                <h3 className="text-lg font-bold text-zinc-800 dark:text-white mb-4 flex items-center gap-2">
                                    ⚖️ {i18n.language === 'ar' ? 'معلومات المكتب' : 'Law Firm Info'}
                                </h3>
                                <div className="space-y-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 bg-amber-100 dark:bg-amber-900/30 rounded-lg flex items-center justify-center">
                                            <span className="text-sm">🕒</span>
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                                                {i18n.language === 'ar' ? 'ساعات العمل' : 'Working Hours'}
                                            </p>
                                            <p className="text-xs text-zinc-600 dark:text-zinc-400">
                                                {i18n.language === 'ar' ? '9:00 ص - 6:00 م' : '9:00 AM - 6:00 PM'}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                                            <span className="text-sm">💳</span>
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                                                {i18n.language === 'ar' ? 'أتعاب الاستشارة' : 'Consultation Fee'}
                                            </p>
                                            <p className="text-xs text-zinc-600 dark:text-zinc-400">
                                                {selectedResult.price ? `${selectedResult.price} ${selectedResult.currency || 'EGP'}` : (i18n.language === 'ar' ? 'يحدد عند الحجز' : 'TBD at booking')}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                                            <span className="text-sm">📄</span>
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                                                {i18n.language === 'ar' ? 'الخدمات' : 'Services'}
                                            </p>
                                            <p className="text-xs text-zinc-600 dark:text-zinc-400">
                                                {i18n.language === 'ar' ? 'استشارات وقضايا' : 'Consultation & Cases'}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        </div>
                    </motion.div>
                </div>
                
                {/* Full Width Reviews Section */}
                <motion.div
                    className="max-w-7xl mx-auto px-6 py-12"
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.2 }}
                >
                    <div className="bg-white/90 dark:bg-zinc-800/90 backdrop-blur-xl rounded-3xl border border-zinc-100/50 dark:border-zinc-700/50 shadow-2xl overflow-hidden">
                        <div className="bg-gradient-to-r from-yellow-500/10 to-orange-500/10 dark:from-yellow-600/20 dark:to-orange-600/20 px-8 py-6 border-b border-zinc-100/50 dark:border-zinc-700/50">
                            <h2 className="text-3xl font-bold text-zinc-800 dark:text-white flex items-center gap-3">
                                ⭐ {i18n.language === 'ar' ? 'آراء العملاء' : 'Client Reviews & Testimonials'}
                            </h2>
                        </div>
                        
                        <div className="p-8">
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                {/* Write Review Section */}
                                <div className="bg-gradient-to-br from-amber-50 to-blue-50 dark:from-amber-900/10 dark:to-blue-900/10 p-6 rounded-2xl border border-amber-100 dark:border-amber-800/30">
                                    {!showReviewForm ? (
                                        <>
                                            <h3 className="text-xl font-semibold text-zinc-800 dark:text-white mb-4 flex items-center gap-2">
                                                ✍️ {i18n.language === 'ar' ? 'شارك تجربتك' : 'Share Your Experience'}
                                            </h3>
                                            
                                            {reviewStats && (
                                                <div className="mb-6">
                                                    <div className="flex items-center gap-4 mb-3">
                                                        <div className="flex items-center gap-2">
                                                            <StarDisplay rating={reviewStats.averageRating} size="lg" />
                                                            <span className="text-2xl font-bold text-zinc-800 dark:text-white">
                                                                {reviewStats.averageRating.toFixed(1)}
                                                            </span>
                                                        </div>
                                                        <div className="text-zinc-600 dark:text-zinc-400">
                                                            {reviewStats.totalReviews} {i18n.language === 'ar' ? 'تقييم' : 'reviews'}
                                                        </div>
                                                    </div>
                                                    
                                                    {/* Rating Distribution */}
                                                    <div className="space-y-2">
                                                        {[5, 4, 3, 2, 1].map(rating => {
                                                            const count = reviewStats.ratingDistribution[rating] || 0;
                                                            const percentage = reviewStats.totalReviews > 0 
                                                                ? (count / reviewStats.totalReviews) * 100 
                                                                : 0;
                                                            
                                                            return (
                                                                <div key={rating} className="flex items-center gap-2 text-sm">
                                                                    <span className="w-8 text-zinc-600 dark:text-zinc-400">{rating}⭐</span>
                                                                    <div className="flex-1 bg-zinc-200 dark:bg-zinc-700 rounded-full h-2">
                                                                        <div 
                                                                            className="bg-yellow-400 h-2 rounded-full transition-all duration-500"
                                                                            style={{ width: `${percentage}%` }}
                                                                        />
                                                                    </div>
                                                                    <span className="w-8 text-xs text-zinc-500 dark:text-zinc-400">{count}</span>
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                </div>
                                            )}
                                            
                                            <motion.button
                                                whileHover={{ scale: 1.02 }}
                                                whileTap={{ scale: 0.98 }}
                                                onClick={() => setShowReviewForm(true)}
                                                className="w-full px-6 py-3 bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-xl font-semibold hover:from-amber-600 hover:to-amber-700 transition-all duration-300"
                                            >
                                                {i18n.language === 'ar' ? 'كتابة تقييم' : 'Write a Review'}
                                            </motion.button>
                                        </>
                                    ) : (
                                        <>
                                            <h3 className="text-xl font-semibold text-zinc-800 dark:text-white mb-4 flex items-center gap-2">
                                                ✍️ {i18n.language === 'ar' ? 'إضافة تقييم' : 'Add Your Review'}
                                            </h3>
                                            
                                            {/* Star Rating */}
                                            <div className="mb-4">
                                                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                                                    {i18n.language === 'ar' ? 'التقييم' : 'Rating'}
                                                </label>
                                                <StarRating
                                                    rating={reviewFormRating}
                                                    onRatingChange={setReviewFormRating}
                                                    size="lg"
                                                    showText
                                                />
                                            </div>
                                            
                                            {/* Comment */}
                                            <div className="mb-4">
                                                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                                                    {i18n.language === 'ar' ? 'التعليق (اختياري)' : 'Comment (Optional)'}
                                                </label>
                                                <textarea
                                                    value={reviewFormComment}
                                                    onChange={(e) => setReviewFormComment(e.target.value)}
                                                    placeholder={i18n.language === 'ar' ? 'اكتب تجربتك مع المحامي...' : 'Write about your experience with the lawyer...'}
                                                    className="w-full p-4 border border-zinc-200 dark:border-zinc-600 rounded-xl bg-white/70 dark:bg-zinc-700/50 focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all resize-none text-zinc-800 dark:text-white"
                                                    rows={4}
                                                    maxLength={1000}
                                                />
                                                <div className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 text-right">
                                                    {reviewFormComment.length}/1000
                                                </div>
                                            </div>
                                            
                                            {/* Error Message */}
                                            <AnimatePresence>
                                                {reviewError && (
                                                    <motion.div
                                                        initial={{ opacity: 0, height: 0 }}
                                                        animate={{ opacity: 1, height: 'auto' }}
                                                        exit={{ opacity: 0, height: 0 }}
                                                        className="mb-4 p-3 bg-red-100 dark:bg-red-900/20 border border-red-300 dark:border-red-700 rounded-xl text-red-700 dark:text-red-400 text-sm"
                                                    >
                                                        {reviewError}
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                            
                                            {/* Auth Notice */}
                                            {!reviewAPI.isAuthenticated() && (
                                                <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-xl">
                                                    <p className="text-sm text-blue-700 dark:text-blue-300">
                                                        {i18n.language === 'ar' ? 'يجب تسجيل الدخول لإضافة تقييم' : 'Please log in to add a review'}
                                                    </p>
                                                </div>
                                            )}
                                            
                                            {/* Action Buttons */}
                                            <div className="flex gap-3">
                                                <motion.button
                                                    whileHover={{ scale: 1.02 }}
                                                    whileTap={{ scale: 0.98 }}
                                                    onClick={() => {
                                                        setShowReviewForm(false);
                                                        setReviewFormRating(0);
                                                        setReviewFormComment('');
                                                        setReviewError('');
                                                    }}
                                                    className="flex-1 px-6 py-3 bg-zinc-200 dark:bg-zinc-700 text-zinc-800 dark:text-white rounded-xl font-semibold hover:bg-zinc-300 dark:hover:bg-zinc-600 transition-colors"
                                                >
                                                    {i18n.language === 'ar' ? 'إلغاء' : 'Cancel'}
                                                </motion.button>
                                                <motion.button
                                                    whileHover={reviewFormRating > 0 && !isSubmittingReview ? { scale: 1.02 } : {}}
                                                    whileTap={reviewFormRating > 0 && !isSubmittingReview ? { scale: 0.98 } : {}}
                                                    onClick={handleReviewSubmit}
                                                    disabled={reviewFormRating === 0 || isSubmittingReview || !reviewAPI.isAuthenticated()}
                                                    className={`flex-1 px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
                                                        reviewFormRating === 0 || isSubmittingReview || !reviewAPI.isAuthenticated()
                                                            ? 'bg-zinc-300 dark:bg-zinc-600 text-zinc-500 dark:text-zinc-400 cursor-not-allowed'
                                                            : 'bg-gradient-to-r from-amber-500 to-amber-600 text-white hover:from-amber-600 hover:to-amber-700'
                                                    }`}
                                                >
                                                    {isSubmittingReview ? (
                                                        <div className="flex items-center justify-center gap-2">
                                                            <motion.div
                                                                animate={{ rotate: 360 }}
                                                                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                                                className="w-4 h-4 border-2 border-current border-t-transparent rounded-full"
                                                            />
                                                            <span>{i18n.language === 'ar' ? 'جاري الإرسال...' : 'Submitting...'}</span>
                                                        </div>
                                                    ) : (
                                                        i18n.language === 'ar' ? 'إرسال التقييم' : 'Submit Review'
                                                    )}
                                                </motion.button>
                                            </div>
                                        </>
                                    )}
                                </div>
                                
                                {/* Reviews List */}
                                <div className="space-y-4">
                                    {isLoadingReviews ? (
                                        <div className="flex items-center justify-center py-8">
                                            <Loader2 className="h-6 w-6 animate-spin text-amber-500" />
                                            <span className="ml-2 text-zinc-600 dark:text-zinc-400">
                                                {i18n.language === 'ar' ? 'جاري تحميل التقييمات...' : 'Loading reviews...'}
                                            </span>
                                        </div>
                                    ) : reviews.length > 0 ? (
                                        reviews.map((review, index) => (
                                            <motion.div
                                                key={review.id}
                                                className="p-6 bg-white/70 dark:bg-zinc-700/30 rounded-2xl border border-zinc-100 dark:border-zinc-600/30 shadow-sm"
                                                initial={{ opacity: 0, x: 20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: index * 0.1 }}
                                                whileHover={{ scale: 1.01 }}
                                            >
                                                <div className="flex items-start gap-4">
                                                    <div className="w-12 h-12 bg-gradient-to-br from-amber-100 to-blue-100 dark:from-amber-800 dark:to-blue-800 rounded-full flex items-center justify-center flex-shrink-0">
                                                        <span className="text-lg font-semibold text-amber-600 dark:text-amber-400">
                                                            {(review.author?.name || 'User').charAt(0).toUpperCase()}
                                                        </span>
                                                    </div>
                                                    <div className="flex-1">
                                                        <div className="flex items-center justify-between mb-2">
                                                            <div className="flex items-center gap-2">
                                                                <span className="font-semibold text-zinc-800 dark:text-white">
                                                                    {review.author?.name || (i18n.language === 'ar' ? 'عميل' : 'Client')}
                                                                </span>
                                                                {(review.author?.isVerified || review.isVerified) && (
                                                                    <span className="bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 text-xs px-2 py-1 rounded-full font-medium">
                                                                        ✅ {i18n.language === 'ar' ? 'موثق' : 'Verified'}
                                                                    </span>
                                                                )}
                                                            </div>
                                                            <div className="flex items-center gap-1">
                                                                <StarDisplay rating={review.rating} size="sm" showNumber={false} />
                                                            </div>
                                                        </div>
                                                        <p className="text-zinc-600 dark:text-zinc-300 leading-relaxed mb-2">
                                                            {review.comment || (i18n.language === 'ar' ? 'تقييم بدون تعليق' : 'No comment provided')}
                                                        </p>
                                                        <div className="text-xs text-zinc-400 dark:text-zinc-500">
                                                            {new Date(review.createdAt).toLocaleDateString(i18n.language === 'ar' ? 'ar-EG' : 'en-US')}
                                                        </div>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        ))
                                    ) : (
                                        <div className="text-center py-8 text-zinc-500 dark:text-zinc-400">
                                            <span className="text-4xl mb-4 block">💭</span>
                                            <p className="text-lg font-medium mb-2">
                                                {i18n.language === 'ar' ? 'لا توجد تقييمات بعد' : 'No reviews yet'}
                                            </p>
                                            <p className="text-sm">
                                                {i18n.language === 'ar' ? 'كن أول من يشارك تجربته!' : 'Be the first to share your experience!'}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>
            
            {/* Bottom Chat Input */}
            <motion.div
                initial={{ y: 100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 1.4 }}
                className="fixed bottom-6 left-6 right-6 max-w-4xl mx-auto z-40"
            >
                <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-amber-500/10 via-white/30 to-blue-500/10 dark:from-amber-500/5 dark:via-zinc-800/90 dark:to-blue-500/5 backdrop-blur-xl rounded-full border border-amber-200/30 dark:border-amber-700/30 shadow-2xl" />
                    <input
                        type="text"
                        placeholder={i18n.language === 'ar' ? 'اسأل عن المحامي أو احجز استشارة...' : 'Ask about the lawyer or book a consultation...'}
                        value={chatQuery}
                        onChange={(e) => onChatQueryChange(e.target.value)}
                        onKeyPress={handleKeyPress}
                        className="relative w-full px-8 py-5 rounded-full bg-transparent border-none focus:outline-none focus:ring-0 transition-all duration-300 text-text-primary placeholder:text-text-muted/70 text-lg font-medium"
                        style={{ textAlign: isRTL ? 'right' : 'left' }}
                    />
                </div>
            </motion.div>

            {/* Booking Modal */}
            {showBookingModal && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-6"
                    onClick={() => setShowBookingModal(false)}
                >
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        onClick={(e) => e.stopPropagation()}
                        className="bg-white/95 dark:bg-zinc-800/95 backdrop-blur-md rounded-3xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
                    >
                        <div className="text-center mb-6">
                            <h3 className="text-2xl font-bold text-zinc-800 dark:text-white mb-2">
                                {i18n.language === 'ar' ? 'احجز استشارة' : 'Book Consultation'}
                            </h3>
                            {selectedDate && selectedTimeSlot && (
                                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-3">
                                    <p className="text-sm text-blue-700 dark:text-blue-300 font-medium">
                                        ✨ {i18n.language === 'ar' 
                                            ? `تم اختيار: ${selectedDate} في ${selectedTimeSlot.start}-${selectedTimeSlot.end}`
                                            : `Pre-selected: ${selectedDate} at ${selectedTimeSlot.start}-${selectedTimeSlot.end}`
                                        }
                                    </p>
                                </div>
                            )}
                        </div>

                        {selectedResult && (
                            <div className="mb-6 p-4 bg-zinc-50 dark:bg-zinc-700/50 rounded-xl">
                                <h4 className="font-semibold text-zinc-800 dark:text-white mb-2">
                                    {getDisplayName(selectedResult, isRTL)}
                                </h4>
                                <p className="text-sm text-zinc-600 dark:text-zinc-400">
                                    {getAddress(selectedResult)}
                                </p>
                            </div>
                        )}

                        <div className="space-y-6 mb-6">
                            {/* Date Selection */}
                            <div>
                                <label className="block text-zinc-800 dark:text-white font-semibold mb-2">
                                    {i18n.language === 'ar' ? 'التاريخ' : 'Date'}
                                </label>
                                <input
                                    type="date"
                                    value={selectedDate}
                                    onChange={(e) => handleDateChange(e.target.value)}
                                    min={new Date().toISOString().split('T')[0]}
                                    className="w-full px-4 py-3 rounded-xl bg-zinc-50 dark:bg-zinc-700 border border-zinc-200 dark:border-zinc-600 text-zinc-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500/30"
                                />
                            </div>

                            {/* Time Slots - Show if pre-selected or if loading new slots */}
                            {selectedTimeSlot ? (
                                <div>
                                    <label className="block text-zinc-800 dark:text-white font-semibold mb-2">
                                        🎆 {i18n.language === 'ar' ? 'الوقت المحدد' : 'Selected Time'}
                                    </label>
                                    <div className="bg-amber-50 dark:bg-amber-900/20 border-2 border-amber-300 dark:border-amber-600 rounded-xl p-4">
                                        <div className="flex items-center justify-center gap-2">
                                            <span className="text-2xl">🕒</span>
                                            <span className="text-lg font-semibold text-amber-700 dark:text-amber-400">
                                                {selectedTimeSlot.start} - {selectedTimeSlot.end}
                                            </span>
                                        </div>
                                        <p className="text-center text-sm text-amber-600 dark:text-amber-400 mt-2">
                                            {i18n.language === 'ar' ? 'تم اختيار هذا الوقت من التقويم' : 'This time was selected from the calendar'}
                                        </p>
                                        <button
                                            onClick={() => handleTimeSlotSelect(null)}
                                            className="w-full mt-3 px-4 py-2 text-sm text-amber-700 dark:text-amber-400 hover:bg-amber-100 dark:hover:bg-amber-900/30 rounded-lg transition-colors"
                                        >
                                            {i18n.language === 'ar' ? 'غير الوقت' : 'Change Time'}
                                        </button>
                                    </div>
                                </div>
                            ) : isLoadingSlots ? (
                                <div>
                                    <label className="block text-zinc-800 dark:text-white font-semibold mb-2">
                                        {i18n.language === 'ar' ? 'المواعيد المتاحة' : 'Available Times'}
                                    </label>
                                    <div className="flex items-center justify-center py-8">
                                        <Loader2 className="h-6 w-6 animate-spin text-amber-500" />
                                        <span className="ml-2 text-zinc-600 dark:text-zinc-400">
                                            {i18n.language === 'ar' ? 'جاري تحميل المواعيد...' : 'Loading available slots...'}
                                        </span>
                                    </div>
                                </div>
                            ) : availableSlots.length > 0 ? (
                                <div>
                                    <label className="block text-zinc-800 dark:text-white font-semibold mb-2">
                                        {i18n.language === 'ar' ? 'اختر وقت الاستشارة' : 'Select Consultation Time'}
                                    </label>
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                        {availableSlots.map((slot) => (
                                            <motion.button
                                                key={`${slot.start}-${slot.end}`}
                                                whileHover={{ scale: 1.05 }}
                                                whileTap={{ scale: 0.95 }}
                                                onClick={() => handleTimeSlotSelect(slot)}
                                                className="p-3 rounded-xl border-2 font-medium transition-all duration-300 border-zinc-200 dark:border-zinc-600 text-zinc-600 dark:text-zinc-400 hover:border-amber-500/50 hover:text-amber-600 dark:hover:text-amber-400"
                                            >
                                                🕒 {slot.start} - {slot.end}
                                            </motion.button>
                                        ))}
                                    </div>
                                </div>
                            ) : selectedDate ? (
                                <div>
                                    <label className="block text-zinc-800 dark:text-white font-semibold mb-2">
                                        {i18n.language === 'ar' ? 'المواعيد المتاحة' : 'Available Times'}
                                    </label>
                                    <div className="text-center py-8 text-zinc-500 dark:text-zinc-400">
                                        😔 {i18n.language === 'ar' ? 'لا توجد مواعيد متاحة في هذا التاريخ' : 'No available slots for this date'}
                                    </div>
                                </div>
                            ) : null}

                            {/* Notes */}
                            <div>
                                <label className="block text-zinc-800 dark:text-white font-semibold mb-2">
                                    {i18n.language === 'ar' ? 'ملاحظات' : 'Notes'}
                                </label>
                                <textarea
                                    rows={3}
                                    value={bookingNotes}
                                    onChange={(e) => setBookingNotes(e.target.value)}
                                    placeholder={i18n.language === 'ar' ? 'موضوع الاستشارة أو أي ملاحظات إضافية...' : 'Consultation topic or any additional notes...'}
                                    className="w-full px-4 py-3 rounded-xl bg-zinc-50 dark:bg-zinc-700 border border-zinc-200 dark:border-zinc-600 text-zinc-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500/30 resize-none"
                                />
                            </div>
                        </div>

                        {/* Error Message */}
                        {bookingError && (
                            <div className="mb-4 p-3 bg-red-100 border border-red-300 rounded-xl text-red-700 text-sm">
                                {bookingError}
                            </div>
                        )}

                        <div className="flex gap-4">
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => setShowBookingModal(false)}
                                className="flex-1 bg-zinc-100 dark:bg-zinc-700 text-zinc-800 dark:text-white py-3 rounded-xl font-semibold hover:bg-zinc-200 dark:hover:bg-zinc-600 transition-colors"
                            >
                                {i18n.language === 'ar' ? 'إلغاء' : 'Cancel'}
                            </motion.button>
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={handleCreateBooking}
                                disabled={!selectedTimeSlot || isCreatingBooking}
                                className={`flex-1 py-3 rounded-xl font-semibold transition-colors flex items-center justify-center gap-2 ${!selectedTimeSlot || isCreatingBooking
                                    ? 'bg-zinc-300 dark:bg-zinc-600 text-zinc-500 dark:text-zinc-400 cursor-not-allowed'
                                    : 'bg-amber-500 text-white hover:bg-amber-600'
                                }`}
                            >
                                {isCreatingBooking ? (
                                    <>
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                        {i18n.language === 'ar' ? 'جاري الحجز...' : 'Booking...'}
                                    </>
                                ) : (
                                    i18n.language === 'ar' ? 'تأكيد الحجز' : 'Confirm Booking'
                                )}
                            </motion.button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </motion.div>
            </div>
        </>
    );
}
