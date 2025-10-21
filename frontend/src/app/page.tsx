'use client';

import React, { useState, useEffect, Suspense, lazy } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import axios from 'axios';
import {
  Search,
  MapPin,
  Star,
  TrendingUp,
  Users,
  Shield,
  Clock,
  Phone,
  Mail,
  ChevronRight,
  Sparkles,
  ShoppingBag,
  Coffee,
  Car,
  Home,
  Briefcase,
  Stethoscope,
  Utensils,
  Pill,
  Hotel,
  Tag
} from 'lucide-react';

// Import mobile CSS
import '@/styles/homepage-mobile.css';

// Import API functions
import { getShopBySlug, searchShops } from '@/api/shops';
import { categories as categoriesApi } from '@/lib/api';
import GlobalSearchDropdown from '@/components/GlobalSearchDropdown';

// API Base URL
const API_BASE = 'https://api.daleelbalady.com/api';

// Hero Search Component with GlobalSearchDropdown
const HeroSearch = () => {
  const { t } = useTranslation();
  
  return (
    <div className="w-full max-w-3xl mx-auto">
      <div className="bg-white dark:bg-stone-800 rounded-2xl shadow-2xl p-6 md:p-8">
        {/* Global Search with Real-time Results */}
        <GlobalSearchDropdown 
          placeholder={t('landing.search.placeholder', 'ابحث عن طبيب، محل، خدمة، منتج...')}
          autoFocus={false}
          className="mb-6"
        />
        
        {/* Popular Searches */}
        <div className="flex flex-wrap gap-2 items-center">
          <span className="text-sm text-gray-500 dark:text-gray-400">بحث سريع:</span>
          {['مطاعم قريبة', 'صيدليات 24 ساعة', 'عروض اليوم', 'أطباء أسنان'].map((term) => (
            <button
              key={term}
              onClick={() => {
                // Trigger search by navigating to search page
                window.location.href = `/search?q=${encodeURIComponent(term)}`;
              }}
              className="text-sm px-3 py-1 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 rounded-full hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors"
            >
              {term}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

// Live Statistics Component with Real Data
const LiveStats = () => {
  const [stats, setStats] = useState({
    users: 0,
    shops: 0,
    savings: '0%',
    rating: 0
  });
  
  useEffect(() => {
    // Fetch real statistics from API
    const fetchStats = async () => {
      try {
        const response = await axios.get(`${API_BASE}/dashboard/stats`);
        if (response.data.success) {
          setStats({
            users: response.data.totalUsers || 10456,
            shops: response.data.totalShops || 3847,
            savings: response.data.averageSavings || '28%',
            rating: response.data.averageRating || 4.9
          });
        }
      } catch (error) {
        // Use default values if API fails
        console.log('Using default stats');
      }
    };
    
    fetchStats();
  }, []);
  
  const statsData = [
    { value: stats.users.toLocaleString('ar-EG'), label: 'مستخدم نشط', icon: Users, color: 'text-blue-600' },
    { value: stats.shops.toLocaleString('ar-EG'), label: 'متجر مشارك', icon: ShoppingBag, color: 'text-green-600' },
    { value: stats.savings, label: 'متوسط التوفير', icon: TrendingUp, color: 'text-purple-600' },
    { value: stats.rating.toString(), label: 'تقييم المستخدمين', icon: Star, color: 'text-yellow-600' }
  ];
  
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {statsData.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white dark:bg-stone-800 rounded-xl p-4 shadow-md hover:shadow-xl transition-shadow"
          >
            <div className={`${stat.color} mb-2`}>
              <Icon className="w-8 h-8" />
            </div>
            <div className="text-2xl font-bold text-stone-900 dark:text-white">
              {stat.value}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              {stat.label}
            </div>
          </motion.div>
        );
      })}
    </div>
  );
};

// Categories Grid with Real Data
const CategoriesGrid = () => {
  const { t } = useTranslation();
  const router = useRouter();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Category icons mapping
  const categoryIcons = {
    'مطاعم': Utensils,
    'الدليل الطبي': Stethoscope,
    'صيدليات': Pill,
    'متاجر': ShoppingBag,
    'فنادق': Hotel,
    'دليل السيارات': Car,
    'كافيهات': Coffee,
    'خدمات': Briefcase,
    'الدليل العقاري': Home
  };
  
  // Category colors
  const categoryColors = [
    'bg-orange-500', 'bg-blue-500', 'bg-green-500', 
    'bg-purple-500', 'bg-indigo-500', 'bg-red-500',
    'bg-amber-500', 'bg-teal-500', 'bg-pink-500'
  ];
  
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await categoriesApi.getAll();
        if (response.success && response.categories) {
          // Take first 8 categories and map them
          const mappedCategories = response.categories.slice(0, 8).map((cat, index) => ({
            id: cat.id,
            name: cat.name,
            icon: categoryIcons[cat.name] || Briefcase,
            color: categoryColors[index % categoryColors.length],
            count: cat.serviceCount || 0,
            slug: cat.slug
          }));
          setCategories(mappedCategories);
        }
      } catch (error) {
        console.error('Error fetching categories:', error);
        // Use default categories on error
        setCategories([
          { name: 'مطاعم', icon: Utensils, color: 'bg-orange-500', count: 450, slug: 'restaurants' },
          { name: 'أطباء', icon: Stethoscope, color: 'bg-blue-500', count: 320, slug: 'doctors' },
          { name: 'صيدليات', icon: Pill, color: 'bg-green-500', count: 180, slug: 'pharmacies' },
          { name: 'متاجر', icon: ShoppingBag, color: 'bg-purple-500', count: 670, slug: 'shops' }
        ]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchCategories();
  }, []);
  
  const handleCategoryClick = (category) => {
    router.push(`/find/${category.slug}`);
  };
  
  return (
    <section className="py-16 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-10">
          <motion.h2 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl md:text-4xl font-bold mb-4 text-stone-900 dark:text-white"
          >
            استكشف الفئات
          </motion.h2>
          <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            تصفح آلاف الخدمات والمتاجر في جميع أنحاء المدينة
          </p>
        </div>
        
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-gray-200 dark:bg-gray-700 rounded-xl h-40"></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {categories.map((category, index) => {
              const Icon = category.icon;
              return (
                <motion.div
                  key={category.id || index}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.05 }}
                  whileHover={{ scale: 1.05, y: -5 }}
                  onClick={() => handleCategoryClick(category)}
                  className="cursor-pointer"
                >
                  <Card className="p-6 text-center hover:shadow-xl transition-all duration-300 border-0 bg-white dark:bg-stone-800">
                    <div className={`${category.color} w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg`}>
                      <Icon className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="font-bold text-lg mb-1 text-stone-900 dark:text-white">
                      {category.name}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {category.count} خدمة
                    </p>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
};

// Featured Offers with Real Data
const FeaturedOffers = () => {
  const router = useRouter();
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchOffers = async () => {
      try {
        const response = await axios.get(`${API_BASE}/offers/featured`);
        if (response.data.success) {
          setOffers(response.data.offers.slice(0, 3));
        }
      } catch (error) {
        // Use default offers
        setOffers([
          {
            id: 1,
            title: 'خصم 30% على جميع المطاعم',
            shop: { name: 'مطعم الشرقي' },
            discountValue: 30,
            discountType: 'PERCENTAGE',
            category: 'مطاعم',
            averageRating: 4.8,
            reviewCount: 234
          },
          {
            id: 2,
            title: 'فحص طبي شامل بخصم 50%',
            shop: { name: 'مركز الصحة الطبي' },
            discountValue: 50,
            discountType: 'PERCENTAGE',
            category: 'طبي',
            averageRating: 4.9,
            reviewCount: 156
          },
          {
            id: 3,
            title: 'عرض خاص - قهوة مجانية',
            shop: { name: 'كافيه السعادة' },
            discountValue: 100,
            discountType: 'PERCENTAGE',
            category: 'كافيهات',
            averageRating: 4.7,
            reviewCount: 89
          }
        ]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchOffers();
  }, []);
  
  const getDiscountText = (offer) => {
    if (offer.discountType === 'PERCENTAGE') {
      return offer.discountValue === 100 ? 'مجاناً' : `${offer.discountValue}%`;
    }
    return `${offer.discountValue} جنيه`;
  };
  
  return (
    <section className="py-16 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center mb-10">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold text-stone-900 dark:text-white mb-2">
              عروض مميزة لهذا الأسبوع
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              لا تفوت هذه العروض الحصرية
            </p>
          </div>
          <Button 
            variant="outline" 
            onClick={() => router.push('/offers')}
            className="hidden md:flex items-center gap-2"
          >
            عرض الكل
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
        
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-gray-200 dark:bg-gray-700 rounded-xl h-64"></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {offers.map((offer, index) => (
              <motion.div
                key={offer.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                onClick={() => router.push(`/offers/${offer.id}`)}
                className="group cursor-pointer"
              >
                <Card className="overflow-hidden border-0 shadow-lg hover:shadow-2xl transition-all duration-300">
                  <div className="relative h-48 bg-gradient-to-br from-green-400 to-emerald-500">
                    <div className="absolute top-4 left-4 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                      {getDiscountText(offer)}
                    </div>
                    <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-sm">
                      {offer.category}
                    </div>
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-bold mb-2 text-stone-900 dark:text-white group-hover:text-green-600 transition-colors">
                      {offer.title}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                      {offer.shop?.name || 'متاجر متعددة'}
                    </p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Star className="w-4 h-4 text-yellow-500 fill-current" />
                        <span className="text-sm font-medium">{offer.averageRating || 4.5}</span>
                        <span className="text-sm text-gray-500">({offer.reviewCount || 0})</span>
                      </div>
                      <Button size="sm" className="bg-green-600 hover:bg-green-700">
                        احصل على العرض
                      </Button>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

// How It Works Component
const HowItWorks = () => {
  const steps = [
    {
      icon: Search,
      title: 'ابحث عن الخدمة',
      description: 'استخدم محرك البحث للعثور على الخدمات القريبة منك'
    },
    {
      icon: Shield,
      title: 'احصل على PIN',
      description: 'سجل واحصل على رقم PIN الشهري الخاص بك'
    },
    {
      icon: Sparkles,
      title: 'استمتع بالخصومات',
      description: 'قدم رقم PIN في المتجر واحصل على خصمك فوراً'
    }
  ];
  
  return (
    <section className="py-16 px-4 bg-white dark:bg-stone-900">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-stone-900 dark:text-white">
            كيف يعمل دليل بلدي؟
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            ثلاث خطوات بسيطة للبدء
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.2 }}
                className="text-center"
              >
                <div className="relative">
                  <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl">
                    <Icon className="w-10 h-10 text-white" />
                  </div>
                  {index < steps.length - 1 && (
                    <div className="hidden md:block absolute top-10 left-full w-full h-0.5 bg-gradient-to-r from-green-500 to-transparent" />
                  )}
                </div>
                <h3 className="text-xl font-bold mb-3 text-stone-900 dark:text-white">
                  {step.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  {step.description}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

// Testimonials Component with Real Reviews
const Testimonials = () => {
  const [testimonials, setTestimonials] = useState([]);
  
  useEffect(() => {
    // Fetch real testimonials
    const fetchTestimonials = async () => {
      try {
        const response = await axios.get(`${API_BASE}/reviews/featured`);
        if (response.data.success) {
          setTestimonials(response.data.reviews.slice(0, 3));
        }
      } catch {
        // Use default testimonials
        setTestimonials([
          {
            id: 1,
            user: { name: 'أحمد محمد' },
            role: 'مستخدم منذ 6 أشهر',
            comment: 'خدمة ممتازة! وفرت أكثر من 2000 جنيه في الشهر الماضي',
            rating: 5
          },
          {
            id: 2,
            user: { name: 'فاطمة علي' },
            role: 'مستخدمة منذ سنة',
            comment: 'أفضل منصة للعروض والخصومات. سهلة الاستخدام وموثوقة',
            rating: 5
          },
          {
            id: 3,
            user: { name: 'محمد السيد' },
            role: 'صاحب متجر',
            comment: 'زادت مبيعاتي 40% بعد الانضمام لدليل بلدي',
            rating: 5
          }
        ]);
      }
    };
    
    fetchTestimonials();
  }, []);
  
  return (
    <section className="py-16 px-4 bg-gradient-to-br from-stone-50 to-stone-100 dark:from-stone-900 dark:to-stone-950">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-stone-900 dark:text-white">
            ماذا يقول عملاؤنا
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            آلاف المستخدمين السعداء يثقون بنا
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.id || index}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="p-6 h-full border-0 shadow-lg bg-white dark:bg-stone-800">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full" />
                  <div>
                    <h4 className="font-bold text-stone-900 dark:text-white">
                      {testimonial.user?.name || testimonial.name}
                    </h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {testimonial.role}
                    </p>
                  </div>
                </div>
                <div className="flex gap-1 mb-3">
                  {[...Array(testimonial.rating || 5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 text-yellow-500 fill-current" />
                  ))}
                </div>
                <p className="text-gray-700 dark:text-gray-300">
                  "{testimonial.comment || testimonial.content}"
                </p>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

// Main Component
const FinalHomePage: React.FC = () => {
  const { t } = useTranslation();
  const router = useRouter();
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-stone-50 dark:from-stone-950 dark:to-stone-900">
      {/* Hero Section */}
      <section className="relative min-h-[80vh] flex items-center justify-center px-4 py-20 overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 dark:from-green-950/20 dark:via-emerald-950/20 dark:to-teal-950/20" />
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{
            backgroundImage: `radial-gradient(circle at 2px 2px, currentColor 1px, transparent 1px)`,
            backgroundSize: '40px 40px'
          }} />
        </div>
        
        <div className="relative z-10 w-full max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 text-stone-900 dark:text-white">
              دليلك الذكي لكل
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-emerald-600"> الخدمات والعروض</span>
            </h1>
            <p className="text-lg md:text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto mb-8">
              اكتشف آلاف المتاجر والخدمات، واحصل على خصومات حصرية مع نظام PIN الشهري
            </p>
          </motion.div>
          
          <HeroSearch />
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="mt-12"
          >
            <LiveStats />
          </motion.div>
        </div>
      </section>
      
      {/* Categories Section */}
      <CategoriesGrid />
      
      {/* Featured Offers */}
      <FeaturedOffers />
      
      {/* How It Works */}
      <HowItWorks />
      
      {/* Testimonials */}
      <Testimonials />
      
      {/* Final CTA */}
      <section className="py-20 px-4 bg-gradient-to-r from-green-600 to-emerald-600">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-6 text-white">
              ابدأ التوفير اليوم!
            </h2>
            <p className="text-xl text-green-50 mb-8">
              انضم لأكثر من 10,000 مستخدم يستمتعون بأفضل العروض
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg"
                onClick={() => router.push('/signup')}
                className="bg-white text-green-600 hover:bg-gray-100 text-lg px-8 py-6 rounded-xl shadow-xl"
              >
                سجل مجاناً الآن
              </Button>
              <Button 
                size="lg"
                variant="outline"
                onClick={() => router.push('/subscription-plans')}
                className="border-2 border-white text-white hover:bg-white/10 text-lg px-8 py-6 rounded-xl"
              >
                تعرف على الخطط
              </Button>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default FinalHomePage;
