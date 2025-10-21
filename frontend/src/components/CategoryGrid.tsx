'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { ArrowRight, TrendingUp } from 'lucide-react';
import { Card } from '@/components/ui/card';

interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  serviceCount?: number;
  subCategoryCount?: number;
}

interface CategoryGridProps {
  categories: Category[];
  loading?: boolean;
}

// Category icons mapping based on Arabic names
const getCategoryIcon = (name: string, slug: string) => {
  // Match by Arabic name or slug
  const nameL = name.toLowerCase();
  const slugL = slug.toLowerCase();
  
  if (nameL.includes('طب') || nameL.includes('صح') || slugL.includes('medical')) return '🏭'; // Medical
  if (nameL.includes('سيار') || nameL.includes('مركب') || slugL.includes('car') || slugL.includes('auto')) return '🚗'; // Automotive
  if (nameL.includes('قانون') || nameL.includes('محام') || slugL.includes('legal') || slugL.includes('law')) return '⚖️'; // Legal
  if (nameL.includes('هندس') || slugL.includes('engineer')) return '🏭'; // Engineering
  if (nameL.includes('حرف') || nameL.includes('فني') || slugL.includes('craft')) return '🔨'; // Crafts
  if (nameL.includes('عقار') || slugL.includes('real-estate') || slugL.includes('property')) return '🏞️'; // Real Estate
  if (nameL.includes('مطعم') || nameL.includes('طعام') || slugL.includes('restaurant') || slugL.includes('food')) return '🍽️'; // Restaurants
  if (nameL.includes('تعليم') || slugL.includes('education')) return '🎓'; // Education
  if (nameL.includes('تجميل') || slugL.includes('beauty')) return '💅'; // Beauty
  if (nameL.includes('رياض') || slugL.includes('sport') || slugL.includes('gym')) return '⚽'; // Sports
  if (nameL.includes('تكنولوج') || slugL.includes('tech')) return '💻'; // Technology
  if (nameL.includes('فندق') || slugL.includes('hotel')) return '🏛️'; // Hotels
  
  return '📂'; // Default folder
};

// Gradient colors for each category
const getCategoryGradient = (index: number) => {
  const gradients = [
    'from-blue-500 to-cyan-500',
    'from-purple-500 to-pink-500',
    'from-green-500 to-emerald-500',
    'from-orange-500 to-red-500',
    'from-indigo-500 to-blue-500',
    'from-yellow-500 to-orange-500',
    'from-teal-500 to-green-500',
    'from-rose-500 to-pink-500',
  ];
  return gradients[index % gradients.length];
};

export const CategoryGrid: React.FC<CategoryGridProps> = ({ categories, loading }) => {
  const router = useRouter();

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {[...Array(8)].map((_, i) => (
          <Card key={i} className="h-64 animate-pulse bg-stone-200 dark:bg-stone-800" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {categories.map((category, index) => (
        <motion.div
          key={category.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: index * 0.05 }}
          whileHover={{ y: -8, scale: 1.02 }}
          className="group"
        >
          <Card
            onClick={() => router.push(`/find/${category.slug}`)}
            className="relative h-64 overflow-hidden cursor-pointer border-none shadow-lg hover:shadow-2xl transition-all duration-300"
          >
            {/* Background Gradient */}
            <div className={`absolute inset-0 bg-gradient-to-br ${getCategoryGradient(index)} opacity-90 group-hover:opacity-100 transition-opacity`} />
            
            {/* Pattern Overlay */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute inset-0" style={{
                backgroundImage: `radial-gradient(circle at 20% 50%, white 0%, transparent 50%),
                                 radial-gradient(circle at 80% 80%, white 0%, transparent 50%)`
              }} />
            </div>

            {/* Content */}
            <div className="relative h-full flex flex-col justify-between p-6 text-white">
              {/* Icon */}
              <div className="flex items-start justify-between">
                <motion.div
                  className="text-6xl"
                  whileHover={{ scale: 1.2, rotate: 10 }}
                  transition={{ type: 'spring', stiffness: 300 }}
                >
                  {getCategoryIcon(category.name, category.slug)}
                </motion.div>
                
                {/* Stats Badge */}
                {category.serviceCount !== undefined && category.serviceCount > 0 && (
                  <div className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full flex items-center gap-1">
                    <TrendingUp className="h-3 w-3" />
                    <span className="text-xs font-medium">{category.serviceCount}</span>
                  </div>
                )}
              </div>

              {/* Info */}
              <div>
                <h3 className="text-2xl font-bold mb-2 drop-shadow-lg">
                  {category.name}
                </h3>
                
                {category.description && (
                  <p className="text-sm text-white/90 line-clamp-2 mb-3 drop-shadow">
                    {category.description}
                  </p>
                )}

                {/* Subcategories Count */}
                {category.subCategoryCount !== undefined && category.subCategoryCount > 0 && (
                  <p className="text-xs text-white/80 mb-3">
                    {category.subCategoryCount} تصنيف فرعي
                  </p>
                )}

                {/* Action Button */}
                <div className="flex items-center gap-2 text-sm font-semibold group-hover:gap-3 transition-all">
                  <span>استكشف</span>
                  <ArrowRight className="h-4 w-4 group-hover:transtone-x-1 transition-transform" />
                </div>
              </div>
            </div>

            {/* Shine Effect on Hover */}
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 transtone-x-[-100%] group-hover:transtone-x-[100%] transition-transform duration-1000" />
            </div>
          </Card>
        </motion.div>
      ))}
    </div>
  );
};

export default CategoryGrid;

