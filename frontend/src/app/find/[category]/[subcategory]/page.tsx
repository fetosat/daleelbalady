'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowRight, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import AdvancedSearch from '@/components/AdvancedSearch';

interface SubCategory {
  id: string;
  name: string;
  slug: string;
  category: {
    id: string;
    name: string;
    slug: string;
  };
}

export default function SubCategoryPage() {
  const params = useParams();
  const router = useRouter();
  const categorySlug = params?.category as string;
  const subcategorySlug = params?.subcategory as string;

  const [subcategory, setSubcategory] = useState<SubCategory | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSubcategory = async () => {
      try {
        setLoading(true);
        setError(null);

        console.log('Fetching subcategory:', { categorySlug, subcategorySlug });

        // Use the dedicated subcategory endpoint
        const response = await fetch(
          `https://api.daleelbalady.com/api/categories/${categorySlug}/${subcategorySlug}`
        );

        if (!response.ok) {
          // If the dedicated endpoint fails, fall back to fetching category data
          console.warn('Dedicated endpoint failed, falling back to category endpoint');
          
          const categoryResponse = await fetch(
            `https://api.daleelbalady.com/api/categories/${categorySlug}`
          );

          if (!categoryResponse.ok) {
            throw new Error('فشل في تحميل التصنيف');
          }

          const categoryData = await categoryResponse.json();
          
          console.log('Category data:', categoryData);
          console.log('Looking for subcategory slug:', subcategorySlug);
          console.log('Available subcategories:', categoryData.subcategories);
          
          const matchingSubcategory = categoryData.subcategories?.find(
            (sub: any) => sub.slug === subcategorySlug
          );

          if (!matchingSubcategory) {
            console.error('Subcategory not found!');
            console.error('Category slug:', categorySlug);
            console.error('Subcategory slug:', subcategorySlug);
            console.error('Available subcategories:', categoryData.subcategories?.map((s: any) => s.slug));
            throw new Error(`التصنيف الفرعي غير موجود: ${subcategorySlug}`);
          }

          setSubcategory({
            ...matchingSubcategory,
            category: {
              id: categoryData.id,
              name: categoryData.name,
              slug: categoryData.slug,
            },
          });
        } else {
          // Use data from dedicated endpoint
          const subcategoryData = await response.json();
          console.log('Subcategory data:', subcategoryData);
          setSubcategory(subcategoryData);
        }
      } catch (err) {
        console.error('Error fetching subcategory:', err);
        setError(err instanceof Error ? err.message : 'حدث خطأ أثناء تحميل البيانات');
      } finally {
        setLoading(false);
      }
    };

    if (categorySlug && subcategorySlug) {
      fetchSubcategory();
    }
  }, [categorySlug, subcategorySlug]);

  const handleBackToCategory = () => {
    router.push(`/find/${categorySlug}`);
  };

  const handleBackToFind = () => {
    router.push('/find');
  };

  if (error) {
    return (
      <div className="min-h-screen bg-stone-50 dark:bg-stone-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 text-lg mb-4">{error}</p>
          <div className="flex gap-3 justify-center">
            <Button onClick={handleBackToCategory} variant="outline">
              <ArrowRight className="ml-2 h-4 w-4" />
              العودة للتصنيف
            </Button>
            <Button onClick={handleBackToFind} variant="outline">
              <ArrowRight className="ml-2 h-4 w-4" />
              العودة للبحث
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-stone-50 dark:bg-stone-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-stone-600 dark:text-stone-400">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  if (!subcategory) {
    return null;
  }

  return (
    <div className="min-h-screen bg-stone-50 dark:bg-stone-900">
      {/* Compact Header */}
      <div className="bg-white dark:bg-stone-800 shadow-sm border-b dark:border-stone-700">
        <div className="container mx-auto px-4 py-3">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm mb-2 flex-wrap">
            <button
              onClick={() => router.push('/')}
              className="text-stone-500 hover:text-stone-700 dark:text-stone-400 dark:hover:text-stone-300 transition-colors"
            >
              الرئيسية
            </button>
            <ChevronRight className="h-4 w-4 text-stone-400 rotate-180" />
            <button
              onClick={handleBackToFind}
              className="text-stone-500 hover:text-stone-700 dark:text-stone-400 dark:hover:text-stone-300 transition-colors"
            >
              البحث
            </button>
            <ChevronRight className="h-4 w-4 text-stone-400 rotate-180" />
            <button
              onClick={handleBackToCategory}
              className="text-stone-500 hover:text-stone-700 dark:text-stone-400 dark:hover:text-stone-300 transition-colors"
            >
              {subcategory.category.name}
            </button>
            <ChevronRight className="h-4 w-4 text-stone-400 rotate-180" />
            <span className="text-stone-900 dark:text-white font-medium">
              {subcategory.name}
            </span>
          </div>

          {/* Compact Title & Back Button */}
          <div className="flex items-center gap-3">
            <Button
              onClick={handleBackToCategory}
              variant="outline"
              size="sm"
              className="shrink-0"
            >
              <ArrowRight className="h-4 w-4 ml-1" />
              عودة
            </Button>
            <div>
              <h1 className="text-xl font-bold text-stone-900 dark:text-white">
                {subcategory.name}
              </h1>
            </div>
          </div>
        </div>
      </div>

      {/* Full Screen Content - AdvancedSearch with filters */}
      <div className="h-[calc(100vh-120px)]">
        <AdvancedSearch
          initialCategory={subcategory.category.id}
          initialSubcategory={subcategory.id}
          hideCategoryFilters={true}
        />
      </div>
    </div>
  );
}

