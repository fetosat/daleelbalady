'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Filter, Sparkles, Tag } from 'lucide-react';
import CategoryGrid from '@/components/CategoryGrid';
import GlobalSearchDropdown from '@/components/GlobalSearchDropdown';
import { OfferSlider } from '@/components/offers';

interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  serviceCount?: number;
  subCategories?: any[];
}

export default function FindPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [categorySearchTerm, setCategorySearchTerm] = useState('');

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/advanced-search/categories');
      const data = await response.json();
      
      if (data.success && data.categories) {
        // Add subcategory count to each category
        const categoriesWithCounts = data.categories.map((cat: any) => ({
          ...cat,
          subCategoryCount: cat.subCategories?.length || 0
        }));
        setCategories(categoriesWithCounts);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredCategories = categories.filter(cat =>
    categorySearchTerm ? cat.name.toLowerCase().includes(categorySearchTerm.toLowerCase()) : true
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-stone-50 dark:from-stone-950 dark:to-stone-900">
      <div className="container mx-auto px-4 py-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <Sparkles className="h-8 w-8 text-blue-600" />
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              استكشف التصنيفات
            </h1>
          </div>
          <p className="text-lg text-stone-600 dark:text-stone-400 max-w-2xl mx-auto">
            اختر التصنيف المناسب لاحتياجك
          </p>
        </motion.div>

        {/* Global Search Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="max-w-2xl mx-auto mb-8"
        >
          <GlobalSearchDropdown 
            placeholder="ابحث عن طبيب، محل، خدمة، منتج..."
            autoFocus={false}
          />
        </motion.div>

        {/* Category Filter - Optional */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="max-w-md mx-auto mb-12"
        >
          <div className="relative">
            <Filter className="absolute right-3 top-1/2 -transtone-y-1/2 h-4 w-4 text-stone-400" />
            <input
              type="text"
              placeholder="فلتر التصنيفات..."
              value={categorySearchTerm}
              onChange={(e) => setCategorySearchTerm(e.target.value)}
              className="w-full pr-10 pl-4 h-10 text-sm rounded-lg border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
            />
          </div>
        </motion.div>

        {/* Offers Slider Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-12"
        >
          <div className="flex items-center justify-center gap-3 mb-6">
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            >
              <Tag className="h-6 w-6 text-red-500" />
            </motion.div>
            <h2 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-red-600 via-orange-500 to-yellow-500 bg-clip-text text-transparent">
              🔥 عروض حصرية متاحة الآن
            </h2>
          </div>
          
          <div className="max-w-4xl mx-auto">
            <OfferSlider autoPlayDelay={5000} fixedHeight="h-[280px] sm:h-[320px] md:h-[400px]" />
          </div>
        </motion.div>

        {/* Categories Grid */}
        <CategoryGrid categories={filteredCategories} loading={loading} />

        {/* Empty State */}
        {!loading && filteredCategories.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20"
          >
            <Filter className="h-16 w-16 mx-auto mb-4 text-stone-300" />
            <h3 className="text-xl font-semibold text-stone-600 dark:text-stone-400 mb-2">
              لا توجد تصنيفات مطابقة
            </h3>
            <p className="text-stone-500">
              جرب البحث بكلمات مختلفة
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
}
