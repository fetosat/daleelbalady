'use client';

import React, { useEffect, useState, useRef } from 'react';
import { motion, useInView, useMotionValue, useTransform, animate } from 'framer-motion';
import { 
  Users, 
  ShoppingBag, 
  TrendingUp, 
  Award,
  Store,
  Percent,
  MapPin,
  Clock,
  ChevronRight,
  Star,
  Tag,
  ExternalLink
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import Link from 'next/link';

// Mock data for active users
const mockActiveUsers = [
  { id: 1, name: 'أحمد محمد', avatar: '/avatars/user1.jpg', rating: 4.8, purchases: 25 },
  { id: 2, name: 'فاطمة علي', avatar: '/avatars/user2.jpg', rating: 4.9, purchases: 18 },
  { id: 3, name: 'محمد سعد', avatar: '/avatars/user3.jpg', rating: 4.7, purchases: 32 },
  { id: 4, name: 'نور أحمد', avatar: '/avatars/user4.jpg', rating: 4.8, purchases: 21 },
  { id: 5, name: 'علي حسن', avatar: '/avatars/user5.jpg', rating: 4.6, purchases: 15 }
];

// Mock data for active stores
const mockActiveStores = [
  { id: 1, name: 'مطعم الأصالة', logo: '/stores/restaurant1.jpg', rating: 4.9, category: 'مطاعم' },
  { id: 2, name: 'صيدلية النور', logo: '/stores/pharmacy1.jpg', rating: 4.8, category: 'صيدليات' },
  { id: 3, name: 'محطة شل', logo: '/stores/gas1.jpg', rating: 4.7, category: 'محطات وقود' },
  { id: 4, name: 'معرض الإلكترونيات', logo: '/stores/electronics1.jpg', rating: 4.8, category: 'إلكترونيات' },
  { id: 5, name: 'كافيه المدينة', logo: '/stores/cafe1.jpg', rating: 4.6, category: 'كافيهات' }
];

// Mock data for discount offers
const mockDiscountOffers = [
  { id: 1, provider: 'مطعم الأصالة', discount: '25%', logo: '/stores/restaurant1.jpg', validUntil: '2024-02-15' },
  { id: 2, provider: 'صيدلية النور', discount: '15%', logo: '/stores/pharmacy1.jpg', validUntil: '2024-02-20' },
  { id: 3, provider: 'محطة شل', discount: '200 جنيه', logo: '/stores/gas1.jpg', validUntil: '2024-02-10' },
  { id: 4, provider: 'كافيه المدينة', discount: '30%', logo: '/stores/cafe1.jpg', validUntil: '2024-02-25' },
  { id: 5, provider: 'معرض الإلكترونيات', discount: '10%', logo: '/stores/electronics1.jpg', validUntil: '2024-02-18' }
];

// Mock data for top rated customers
const mockTopRatedCustomers = [
  { id: 1, name: 'أحمد محمد', avatar: '/avatars/user1.jpg', rating: 4.9, reviews: 45 },
  { id: 2, name: 'فاطمة علي', avatar: '/avatars/user2.jpg', rating: 4.8, reviews: 32 },
  { id: 3, name: 'محمد سعد', avatar: '/avatars/user3.jpg', rating: 4.8, reviews: 28 },
  { id: 4, name: 'نور أحمد', avatar: '/avatars/user4.jpg', rating: 4.7, reviews: 35 },
  { id: 5, name: 'علي حسن', avatar: '/avatars/user5.jpg', rating: 4.7, reviews: 22 }
];

interface StatCardProps {
  icon: any;
  value: number;
  suffix?: string;
  label: string;
  delay: number;
  gradientColors: string;
}

interface ImageCardProps {
  title: string;
  data: any[];
  type: 'users' | 'stores' | 'offers' | 'customers';
  delay: number;
  gradientColors: string;
  viewAllLink: string;
};

// ImageCard component for showing data with images
const ImageCard: React.FC<ImageCardProps> = ({ 
  title,
  data,
  type,
  delay,
  gradientColors,
  viewAllLink
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.5 });

  const renderItem = (item: any, index: number) => {
    switch (type) {
      case 'users':
        return (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={isInView ? { opacity: 1, scale: 1 } : {}}
            transition={{ delay: delay + index * 0.1, duration: 0.3 }}
            className="flex items-center gap-2 p-2 rounded-lg hover:bg-stone-50 dark:hover:bg-stone-700/50 transition-colors"
          >
            <Avatar className="h-8 w-8">
              <AvatarImage src={item.avatar} alt={item.name} />
              <AvatarFallback className="text-xs" style={{ background: gradientColors }}>
                {item.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-stone-900 dark:text-stone-100 truncate">{item.name}</p>
              <div className="flex items-center gap-1">
                <Star className="h-3 w-3 text-yellow-400 fill-yellow-400" />
                <span className="text-xs text-stone-500">{item.rating}</span>
              </div>
            </div>
          </motion.div>
        );

      case 'stores':
        return (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={isInView ? { opacity: 1, scale: 1 } : {}}
            transition={{ delay: delay + index * 0.1, duration: 0.3 }}
            className="flex items-center gap-2 p-2 rounded-lg hover:bg-stone-50 dark:hover:bg-stone-700/50 transition-colors"
          >
            <div className="h-8 w-8 rounded-lg overflow-hidden" style={{ background: gradientColors }}>
              <div className="w-full h-full flex items-center justify-center">
                <Store className="h-4 w-4 text-white" />
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-stone-900 dark:text-stone-100 truncate">{item.name}</p>
              <div className="flex items-center gap-1">
                <Badge variant="secondary" className="text-xs px-1 py-0">{item.category}</Badge>
              </div>
            </div>
          </motion.div>
        );

      case 'offers':
        return (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={isInView ? { opacity: 1, scale: 1 } : {}}
            transition={{ delay: delay + index * 0.1, duration: 0.3 }}
            className="flex items-center gap-2 p-2 rounded-lg hover:bg-stone-50 dark:hover:bg-stone-700/50 transition-colors"
          >
            <div className="h-8 w-8 rounded-lg overflow-hidden" style={{ background: gradientColors }}>
              <div className="w-full h-full flex items-center justify-center">
                <Tag className="h-4 w-4 text-white" />
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-stone-900 dark:text-stone-100 truncate">{item.provider}</p>
              <div className="flex items-center gap-1">
                <Badge className="text-xs px-1 py-0" style={{ background: gradientColors }}>{item.discount}</Badge>
              </div>
            </div>
          </motion.div>
        );

      case 'customers':
        return (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={isInView ? { opacity: 1, scale: 1 } : {}}
            transition={{ delay: delay + index * 0.1, duration: 0.3 }}
            className="flex items-center gap-2 p-2 rounded-lg hover:bg-stone-50 dark:hover:bg-stone-700/50 transition-colors"
          >
            <Avatar className="h-8 w-8">
              <AvatarImage src={item.avatar} alt={item.name} />
              <AvatarFallback className="text-xs" style={{ background: gradientColors }}>
                {item.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-stone-900 dark:text-stone-100 truncate">{item.name}</p>
              <div className="flex items-center gap-1">
                <Star className="h-3 w-3 text-yellow-400 fill-yellow-400" />
                <span className="text-xs text-stone-500">{item.rating}</span>
                <span className="text-xs text-stone-400">({item.reviews} تقييم)</span>
              </div>
            </div>
          </motion.div>
        );

      default:
        return null;
    }
  };

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 50 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay }}
      whileHover={{ y: -5 }}
      className="group relative"
    >
      <div className="absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl blur-xl"
           style={{ background: gradientColors }} />
      
      <Card className="relative bg-white/95 dark:bg-stone-800/95 backdrop-blur-sm border border-stone-100 dark:border-stone-700 shadow-xl hover:shadow-2xl transition-all duration-300">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-bold text-stone-900 dark:text-white flex items-center gap-2">
              <motion.div 
                className="p-2 rounded-lg"
                style={{ background: gradientColors }}
                whileHover={{ rotate: [0, -10, 10, -10, 0] }}
                transition={{ duration: 0.5 }}
              >
                {type === 'users' && <Users className="h-4 w-4 text-white" />}
                {type === 'stores' && <Store className="h-4 w-4 text-white" />}
                {type === 'offers' && <Tag className="h-4 w-4 text-white" />}
                {type === 'customers' && <Award className="h-4 w-4 text-white" />}
              </motion.div>
              <span className="text-sm">{title}</span>
            </CardTitle>
            <Link href={viewAllLink}>
              <Button variant="ghost" size="sm" className="text-xs h-7 px-2">
                عرض الكل
                <ChevronRight className="h-3 w-3 mr-1" />
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent className="space-y-1">
          {data.slice(0, 4).map((item, index) => renderItem(item, index))}
          
          {data.length > 4 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={isInView ? { opacity: 1 } : {}}
              transition={{ delay: delay + 0.5, duration: 0.3 }}
              className="text-center pt-2"
            >
              <Link href={viewAllLink}>
                <Button variant="outline" size="sm" className="w-full h-8 text-xs">
                  +{data.length - 4} المزيد
                  <ExternalLink className="h-3 w-3 mr-1" />
                </Button>
              </Link>
            </motion.div>
          )}
        </CardContent>
        
        {/* Animated accent */}
        <motion.div
          className="absolute bottom-0 left-0 right-0 h-1 rounded-b-lg"
          style={{ background: gradientColors }}
          initial={{ scaleX: 0 }}
          animate={isInView ? { scaleX: 1 } : {}}
          transition={{ duration: 1, delay: delay + 0.5 }}
        />
      </Card>
    </motion.div>
  );
};

const StatCard: React.FC<StatCardProps> = ({ 
  icon: Icon, 
  value, 
  suffix = '', 
  label, 
  delay,
  gradientColors 
}) => {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.5 });

  useEffect(() => {
    if (isInView) {
      const controls = animate(0, value, {
        duration: 2,
        delay: delay,
        onUpdate: (value) => {
          setCount(Math.floor(value));
        }
      });

      return () => controls.stop();
    }
  }, [isInView, value, delay]);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 50 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay }}
      whileHover={{ y: -10 }}
      className="group relative"
    >
      <div className="absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl blur-xl"
           style={{ background: gradientColors }} />
      
      <div className="relative bg-white dark:bg-stone-800 rounded-2xl shadow-xl p-6 border border-stone-100 dark:border-stone-700 overflow-hidden">
        {/* Background pattern */}
        <div className="absolute top-0 right-0 w-32 h-32 opacity-5">
          <Icon className="w-full h-full" />
        </div>

        {/* Content */}
        <div className="relative z-10">
          <motion.div 
            className="inline-flex p-3 rounded-xl mb-4"
            style={{ background: gradientColors }}
            whileHover={{ rotate: [0, -10, 10, -10, 0] }}
            transition={{ duration: 0.5 }}
          >
            <Icon className="w-6 h-6 text-white" />
          </motion.div>

          <div className="flex items-baseline gap-1">
            <motion.span 
              className="text-3xl md:text-4xl font-bold bg-gradient-to-r bg-clip-text text-transparent"
              style={{ backgroundImage: gradientColors }}
            >
              {count.toLocaleString('ar-EG')}
            </motion.span>
            {suffix && (
              <span className="text-xl text-stone-600 dark:text-stone-400">{suffix}</span>
            )}
          </div>

          <p className="text-stone-600 dark:text-stone-400 text-sm mt-2">{label}</p>
        </div>

        {/* Animated accent */}
        <motion.div
          className="absolute bottom-0 left-0 right-0 h-1"
          style={{ background: gradientColors }}
          initial={{ scaleX: 0 }}
          animate={isInView ? { scaleX: 1 } : {}}
          transition={{ duration: 1, delay: delay + 0.5 }}
        />
      </div>
    </motion.div>
  );
};

const QuickStats: React.FC = () => {
  const imageCards = [
    {
      title: 'المستخدمين النشطين',
      data: mockActiveUsers,
      type: 'users' as const,
      gradientColors: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      viewAllLink: '/users'
    },
    {
      title: 'المتاجر النشطة',
      data: mockActiveStores,
      type: 'stores' as const,
      gradientColors: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
      viewAllLink: '/shops'
    },
    {
      title: 'عروض الخصم',
      data: mockDiscountOffers,
      type: 'offers' as const,
      gradientColors: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
      viewAllLink: '/offers'
    },
    {
      title: 'العملاء الأعلى تقييماً',
      data: mockTopRatedCustomers,
      type: 'customers' as const,
      gradientColors: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
      viewAllLink: '/top-customers'
    }
  ];

  const stats = [
    {
      icon: Users,
      value: 10000,
      suffix: '+',
      label: 'مستخدم نشط',
      gradientColors: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
    },
    {
      icon: Percent,
      value: 25,
      suffix: '%',
      label: 'متوسط التوفير',
      gradientColors: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)'
    }
  ];

  return (
    <section className="relative py-16 overflow-hidden bg-gradient-to-b from-stone-50 to-white dark:from-stone-900 dark:to-stone-800">
      {/* Background decoration */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-0 w-96 h-96 bg-blue-200/20 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-green-200/20 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <motion.div
            initial={{ scale: 0 }}
            whileInView={{ scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-blue-100 to-green-100 dark:from-blue-900/50 dark:to-green-900/50 text-sm text-stone-700 dark:text-stone-300 mb-4"
          >
            <TrendingUp className="w-4 h-4" />
            <span>اكتشف مجتمعنا النشط</span>
          </motion.div>

          <h2 className="text-2xl md:text-3xl font-bold text-stone-900 dark:text-white mb-3">
            شاهد من ينضم إلى دليل بلدي
          </h2>
          <p className="text-base text-stone-600 dark:text-stone-400 max-w-2xl mx-auto">
            تعرف على مجتمعنا النشط من المستخدمين والمتاجر والعروض الحصرية والعملاء المميزين
          </p>
        </motion.div>

        {/* Image Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-12">
          {imageCards.map((card, index) => (
            <ImageCard
              key={index}
              {...card}
              delay={index * 0.15}
            />
          ))}
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6 mb-12">
          {stats.map((stat, index) => (
            <StatCard
              key={index}
              {...stat}
              delay={index * 0.2}
            />
          ))}
        </div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="text-center"
        >
          <div className="inline-flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-blue-50 to-green-50 dark:from-blue-900/20 dark:to-green-900/20 rounded-full">
            <Clock className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <p className="text-stone-700 dark:text-stone-300 text-sm">
              <span className="font-bold text-blue-600 dark:text-blue-400">يتم إضافة</span> متجر جديد كل 
              <span className="font-bold text-green-600 dark:text-green-400 mx-1">48 ساعة</span>
            </p>
          </div>
        </motion.div>
      </div>

      {/* Animated background elements */}
      <motion.div
        className="absolute top-1/4 left-10 w-16 h-16 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full opacity-10"
        animate={{
          y: [0, -20, 0],
          rotate: [0, 180, 360],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "linear"
        }}
      />
      <motion.div
        className="absolute bottom-1/4 right-10 w-20 h-20 bg-gradient-to-br from-green-400 to-green-600 rounded-full opacity-10"
        animate={{
          y: [0, 20, 0],
          rotate: [360, 180, 0],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: "linear"
        }}
      />
    </section>
  );
};

export default QuickStats;
