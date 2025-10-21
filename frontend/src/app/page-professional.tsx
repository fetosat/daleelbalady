'use client';

import React, { useState, useEffect, Suspense, lazy } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  MapPin,
  Star,
  TrendingUp,
  Users,
  Shield,
  Award,
  Clock,
  Phone,
  Mail,
  ChevronRight,
  Sparkles,
  Heart,
  ShoppingBag,
  Coffee,
  Car,
  Home,
  Briefcase,
  Stethoscope,
  GraduationCap,
  Utensils,
  Pill,
  Fuel,
  Hotel,
  Scissors,
  Camera
} from 'lucide-react';

// Import mobile CSS
import '@/styles/homepage-mobile.css';

// Category Icons Mapping
const categoryIcons: { [key: string]: any } = {
  'أطباء': Stethoscope,
  'مطاعم': Utensils,
  'صيدليات': Pill,
  'متاجر': ShoppingBag,
  'فنادق': Hotel,
  'خدمات': Briefcase,
  'تعليم': GraduationCap,
  'سيارات': Car,
  'عقارات': Home,
  'كافيهات': Coffee,
  'صالونات': Scissors,
  'تصوير': Camera
};

// Hero Search Component
const HeroSearch = () => {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  
  return (
    <div className="w-full max-w-3xl mx-auto">
      <div className="bg-white dark:bg-stone-800 rounded-2xl shadow-2xl p-6 md:p-8">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              type="text"
              placeholder={t('landing.search.placeholder', 'ابحث عن خدمة، متجر، أو عرض...')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-6 text-lg border-0 bg-gray-50 dark:bg-stone-700 rounded-xl"
            />
          </div>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-4 py-3 text-base bg-gray-50 dark:bg-stone-700 rounded-xl border-0 focus:ring-2 focus:ring-green-500"
          >
            <option value="">كل الفئات</option>
            <option value="restaurants">مطاعم</option>
            <option value="doctors">أطباء</option>
            <option value="pharmacies">صيدليات</option>
            <option value="shops">متاجر</option>
          </select>
          <Button 
            size="lg"
            className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-xl px-8 py-6 text-lg font-semibold shadow-lg"
          >
            <Search className="w-5 h-5 ml-2" />
            {t('landing.search.button', 'بحث')}
          </Button>
        </div>
        
        {/* Popular Searches */}
        <div className="mt-6 flex flex-wrap gap-2">
          <span className="text-sm text-gray-500 dark:text-gray-400">بحث سريع:</span>
          {['مطاعم قريبة', 'صيدليات 24 ساعة', 'عروض اليوم', 'أطباء أسنان'].map((term) => (
            <button
              key={term}
              onClick={() => setSearchQuery(term)}
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

// Statistics Component
const LiveStats = () => {
  const stats = [
    { value: '12,456', label: 'مستخدم نشط', icon: Users, color: 'text-blue-600' },
    { value: '3,847', label: 'متجر مشارك', icon: ShoppingBag, color: 'text-green-600' },
    { value: '28%', label: 'متوسط التوفير', icon: TrendingUp, color: 'text-purple-600' },
    { value: '4.9', label: 'تقييم المستخدمين', icon: Star, color: 'text-yellow-600' }
  ];
  
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {stats.map((stat, index) => {
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

// Categories Grid Component
const CategoriesGrid = () => {
  const { t } = useTranslation();
  const categories = [
    { name: 'مطاعم', icon: Utensils, color: 'bg-orange-500', count: 450 },
    { name: 'أطباء', icon: Stethoscope, color: 'bg-blue-500', count: 320 },
    { name: 'صيدليات', icon: Pill, color: 'bg-green-500', count: 180 },
    { name: 'متاجر', icon: ShoppingBag, color: 'bg-purple-500', count: 670 },
    { name: 'فنادق', icon: Hotel, color: 'bg-indigo-500', count: 95 },
    { name: 'سيارات', icon: Car, color: 'bg-red-500', count: 230 },
    { name: 'كافيهات', icon: Coffee, color: 'bg-amber-500', count: 156 },
    { name: 'خدمات', icon: Briefcase, color: 'bg-teal-500', count: 410 }
  ];
  
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
        
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {categories.map((category, index) => {
            const Icon = category.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ scale: 1.05, y: -5 }}
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
      </div>
    </section>
  );
};

// Featured Offers Component
const FeaturedOffers = () => {
  const offers = [
    {
      id: 1,
      title: 'خصم 30% على جميع المطاعم',
      shop: 'مطعم الشرقي',
      discount: '30%',
      category: 'مطاعم',
      image: '/api/placeholder/400/250',
      rating: 4.8,
      reviews: 234
    },
    {
      id: 2,
      title: 'فحص طبي شامل بخصم 50%',
      shop: 'مركز الصحة الطبي',
      discount: '50%',
      category: 'طبي',
      image: '/api/placeholder/400/250',
      rating: 4.9,
      reviews: 156
    },
    {
      id: 3,
      title: 'عرض خاص - قهوة مجانية',
      shop: 'كافيه السعادة',
      discount: 'مجاناً',
      category: 'كافيهات',
      image: '/api/placeholder/400/250',
      rating: 4.7,
      reviews: 89
    }
  ];
  
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
          <Button variant="outline" className="hidden md:flex items-center gap-2">
            عرض الكل
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {offers.map((offer, index) => (
            <motion.div
              key={offer.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="group cursor-pointer"
            >
              <Card className="overflow-hidden border-0 shadow-lg hover:shadow-2xl transition-all duration-300">
                <div className="relative h-48 bg-gradient-to-br from-green-400 to-emerald-500">
                  <div className="absolute top-4 left-4 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                    {offer.discount}
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
                    {offer.shop}
                  </p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Star className="w-4 h-4 text-yellow-500 fill-current" />
                      <span className="text-sm font-medium">{offer.rating}</span>
                      <span className="text-sm text-gray-500">({offer.reviews})</span>
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

// Testimonials Component
const Testimonials = () => {
  const testimonials = [
    {
      name: 'أحمد محمد',
      role: 'مستخدم منذ 6 أشهر',
      content: 'خدمة ممتازة! وفرت أكثر من 2000 جنيه في الشهر الماضي',
      rating: 5,
      avatar: '/api/placeholder/60/60'
    },
    {
      name: 'فاطمة علي',
      role: 'مستخدمة منذ سنة',
      content: 'أفضل منصة للعروض والخصومات. سهلة الاستخدام وموثوقة',
      rating: 5,
      avatar: '/api/placeholder/60/60'
    },
    {
      name: 'محمد السيد',
      role: 'صاحب متجر',
      content: 'زادت مبيعاتي 40% بعد الانضمام لدليل بلدي',
      rating: 5,
      avatar: '/api/placeholder/60/60'
    }
  ];
  
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
              key={index}
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
                      {testimonial.name}
                    </h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {testimonial.role}
                    </p>
                  </div>
                </div>
                <div className="flex gap-1 mb-3">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 text-yellow-500 fill-current" />
                  ))}
                </div>
                <p className="text-gray-700 dark:text-gray-300">
                  "{testimonial.content}"
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
const ProfessionalHomePage: React.FC = () => {
  const { t } = useTranslation();
  
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
                className="bg-white text-green-600 hover:bg-gray-100 text-lg px-8 py-6 rounded-xl shadow-xl"
              >
                سجل مجاناً الآن
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
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

export default ProfessionalHomePage;
