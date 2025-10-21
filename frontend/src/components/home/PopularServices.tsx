'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Stethoscope, 
  Utensils, 
  ShoppingCart, 
  Fuel, 
  Hotel,
  Heart,
  Sparkles,
  TrendingUp,
  Clock,
  MapPin,
  Star,
  ArrowRight,
  ChevronRight,
  Zap
} from 'lucide-react';

interface ServiceCategory {
  id: string;
  name: string;
  icon: any;
  description: string;
  discount: string;
  count: number;
  trending: boolean;
  color: string;
  bgGradient: string;
  popularItems: string[];
}

const ServiceCard: React.FC<{ service: ServiceCategory; index: number }> = ({ service, index }) => {
  const [isHovered, setIsHovered] = useState(false);
  const Icon = service.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      whileHover={{ y: -10 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="group relative"
    >
      <div className={`absolute inset-0 bg-gradient-to-br ${service.bgGradient} opacity-0 group-hover:opacity-20 transition-opacity duration-300 rounded-2xl blur-xl`} />
      
      <div className="relative bg-white dark:bg-stone-800 rounded-2xl shadow-xl overflow-hidden border border-stone-100 dark:border-stone-700">
        {/* Top gradient bar */}
        <div className={`h-1 bg-gradient-to-r ${service.bgGradient}`} />

        {/* Trending badge */}
        {service.trending && (
          <motion.div
            initial={{ x: 100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: index * 0.1 + 0.3 }}
            className="absolute top-4 right-4"
          >
            <Badge className="bg-gradient-to-r from-orange-500 to-red-500 text-white border-0">
              <TrendingUp className="w-3 h-3 mr-1" />
              الأكثر طلباً
            </Badge>
          </motion.div>
        )}

        <div className="p-6">
          {/* Icon and header */}
          <div className="flex items-start gap-4 mb-4">
            <motion.div 
              className={`p-4 rounded-xl bg-gradient-to-br ${service.bgGradient} shadow-lg`}
              animate={isHovered ? { rotate: [0, -10, 10, -10, 0] } : {}}
              transition={{ duration: 0.5 }}
            >
              <Icon className="w-8 h-8 text-white" />
            </motion.div>
            
            <div className="flex-1">
              <h3 className="text-xl font-bold text-stone-900 dark:text-white mb-1">
                {service.name}
              </h3>
              <p className="text-sm text-stone-600 dark:text-stone-400">
                {service.description}
              </p>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="flex items-center gap-2 p-2 bg-stone-50 dark:bg-stone-700/50 rounded-lg">
              <div className={`p-1.5 rounded-full bg-gradient-to-br ${service.bgGradient}`}>
                <Zap className="w-3 h-3 text-white" />
              </div>
              <div>
                <p className="text-xs text-stone-500 dark:text-stone-400">خصم يصل إلى</p>
                <p className="text-sm font-bold text-stone-900 dark:text-white">{service.discount}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2 p-2 bg-stone-50 dark:bg-stone-700/50 rounded-lg">
              <div className={`p-1.5 rounded-full bg-gradient-to-br ${service.bgGradient}`}>
                <MapPin className="w-3 h-3 text-white" />
              </div>
              <div>
                <p className="text-xs text-stone-500 dark:text-stone-400">متوفر في</p>
                <p className="text-sm font-bold text-stone-900 dark:text-white">{service.count} مكان</p>
              </div>
            </div>
          </div>

          {/* Popular items */}
          <div className="mb-4">
            <p className="text-xs text-stone-500 dark:text-stone-400 mb-2">الأكثر شعبية:</p>
            <div className="flex flex-wrap gap-2">
              {service.popularItems.map((item, i) => (
                <motion.span
                  key={i}
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 + i * 0.05 }}
                  className="px-2 py-1 bg-stone-100 dark:bg-stone-700 rounded-full text-xs text-stone-700 dark:text-stone-300"
                >
                  {item}
                </motion.span>
              ))}
            </div>
          </div>

          {/* Action button */}
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Link href={`/find?category=${service.id}`}>
              <Button className={`w-full bg-gradient-to-r ${service.bgGradient} text-white hover:opacity-90 transition-opacity group`}>
                استكشف العروض
                <ChevronRight className="w-4 h-4 mr-2 group-hover:transtone-x-1 transition-transform" />
              </Button>
            </Link>
          </motion.div>
        </div>

        {/* Hover effect overlay */}
        <AnimatePresence>
          {isHovered && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 pointer-events-none"
            >
              <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${service.bgGradient} opacity-10 blur-3xl`} />
              <div className={`absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-br ${service.bgGradient} opacity-10 blur-3xl`} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

const PopularServices: React.FC = () => {
  const services: ServiceCategory[] = [
    {
      id: 'restaurants',
      name: 'المطاعم',
      icon: Utensils,
      description: 'خصومات على أشهر المطاعم والكافيهات',
      discount: '30%',
      count: 150,
      trending: true,
      color: 'text-orange-600',
      bgGradient: 'from-orange-400 to-red-500',
      popularItems: ['بيتزا', 'برجر', 'مأكولات شرقية']
    },
    {
      id: 'medical',
      name: 'الخدمات الطبية',
      icon: Stethoscope,
      description: 'عيادات ومراكز طبية بخصومات مميزة',
      discount: '40%',
      count: 200,
      trending: false,
      color: 'text-blue-600',
      bgGradient: 'from-blue-400 to-cyan-500',
      popularItems: ['كشف طبي', 'تحاليل', 'أشعة']
    },
    {
      id: 'pharmacies',
      name: 'الصيدليات',
      icon: Heart,
      description: 'خصومات على الأدوية ومستحضرات العناية',
      discount: '20%',
      count: 100,
      trending: true,
      color: 'text-green-600',
      bgGradient: 'from-green-400 to-teal-500',
      popularItems: ['أدوية', 'مستحضرات', 'فيتامينات']
    },
    {
      id: 'shopping',
      name: 'التسوق',
      icon: ShoppingCart,
      description: 'عروض على الملابس والإلكترونيات',
      discount: '50%',
      count: 80,
      trending: false,
      color: 'text-purple-600',
      bgGradient: 'from-purple-400 to-pink-500',
      popularItems: ['ملابس', 'إلكترونيات', 'إكسسوارات']
    },
    {
      id: 'fuel',
      name: 'محطات الوقود',
      icon: Fuel,
      description: 'وفر في تعبئة الوقود والخدمات',
      discount: '15%',
      count: 50,
      trending: false,
      color: 'text-yellow-600',
      bgGradient: 'from-yellow-400 to-orange-500',
      popularItems: ['بنزين', 'سولار', 'زيوت']
    },
    {
      id: 'hotels',
      name: 'الفنادق والمنتجعات',
      icon: Hotel,
      description: 'إقامة مميزة بأسعار مخفضة',
      discount: '35%',
      count: 30,
      trending: true,
      color: 'text-indigo-600',
      bgGradient: 'from-indigo-400 to-blue-500',
      popularItems: ['إقامة', 'منتجعات', 'شاليهات']
    }
  ];

  return (
    <section className="relative py-20 overflow-hidden bg-gradient-to-b from-white to-stone-50 dark:from-stone-800 dark:to-stone-900">
      {/* Background decoration */}
      <div className="absolute inset-0">
        <div className="absolute top-20 right-0 w-96 h-96 bg-purple-200/20 rounded-full blur-3xl" />
        <div className="absolute bottom-20 left-0 w-96 h-96 bg-blue-200/20 rounded-full blur-3xl" />
      </div>

      {/* Floating elements */}
      <motion.div
        className="absolute top-10 left-1/4 opacity-10"
        animate={{
          y: [0, -20, 0],
          rotate: [0, 360],
        }}
        transition={{
          duration: 15,
          repeat: Infinity,
          ease: "linear"
        }}
      >
        <Sparkles className="w-16 h-16 text-purple-600" />
      </motion.div>

      <motion.div
        className="absolute bottom-10 right-1/4 opacity-10"
        animate={{
          y: [0, 20, 0],
          rotate: [360, 0],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "linear"
        }}
      >
        <Star className="w-20 h-20 text-yellow-600" />
      </motion.div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <motion.div
            initial={{ scale: 0 }}
            whileInView={{ scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-purple-100 to-blue-100 dark:from-purple-900/50 dark:to-blue-900/50 text-sm text-stone-700 dark:text-stone-300 mb-4"
          >
            <Sparkles className="w-4 h-4" />
            <span>خدمات متنوعة</span>
          </motion.div>

          <h2 className="text-3xl md:text-4xl font-bold text-stone-900 dark:text-white mb-4">
            اكتشف الخدمات الأكثر شعبية
          </h2>
          <p className="text-lg text-stone-600 dark:text-stone-400 max-w-2xl mx-auto">
            تمتع بخصومات حصرية في أكثر من 500 مكان في جميع أنحاء الجمهورية
          </p>

          {/* Quick stats */}
          <div className="flex flex-wrap justify-center gap-6 mt-8">
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="flex items-center gap-2"
            >
              <Clock className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              <span className="text-sm text-stone-700 dark:text-stone-300">
                عروض جديدة <span className="font-bold">يومياً</span>
              </span>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              className="flex items-center gap-2"
            >
              <MapPin className="w-5 h-5 text-green-600 dark:text-green-400" />
              <span className="text-sm text-stone-700 dark:text-stone-300">
                في <span className="font-bold">27 محافظة</span>
              </span>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4 }}
              className="flex items-center gap-2"
            >
              <Star className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
              <span className="text-sm text-stone-700 dark:text-stone-300">
                تقييم <span className="font-bold">4.9/5</span>
              </span>
            </motion.div>
          </div>
        </motion.div>

        {/* Services grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {services.map((service, index) => (
            <ServiceCard key={service.id} service={service} index={index} />
          ))}
        </div>

        {/* CTA section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="text-center mt-16"
        >
          <p className="text-lg text-stone-600 dark:text-stone-400 mb-6">
            هل تريد رؤية جميع الفئات المتاحة؟
          </p>
          <Button
            asChild
            size="lg"
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-xl hover:shadow-2xl transition-all"
          >
            <Link href="/find">
              استكشف جميع العروض
              <ArrowRight className="w-5 h-5 mr-2" />
            </Link>
          </Button>
        </motion.div>
      </div>
    </section>
  );
};

export default PopularServices;
