'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowRight, ChevronRight, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import AdvancedSearch from '@/components/AdvancedSearch';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface SubCategory {
  id: string;
  name: string;
  slug: string;
  _count?: {
    Service: number;
  };
}

interface Category {
  id: string;
  name: string;
  slug: string;
  subcategories: SubCategory[];
}

export default function CategoryPage() {
  const params = useParams();
  const router = useRouter();
  const categorySlug = params?.category as string;

  const [category, setCategory] = useState<Category | null>(null);
  const [selectedSubcategoryId, setSelectedSubcategoryId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCategory = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(
          `/api/categories/${categorySlug}`
        );

        if (!response.ok) {
          throw new Error('فشل في تحميل التصنيف');
        }

        const data = await response.json();
        setCategory(data);
      } catch (err) {
        console.error('Error fetching category:', err);
        setError(err instanceof Error ? err.message : 'حدث خطأ أثناء تحميل البيانات');
      } finally {
        setLoading(false);
      }
    };

    if (categorySlug) {
      fetchCategory();
    }
  }, [categorySlug]);

  const handleBack = () => {
    router.push('/find');
  };

  const handleSubcategoryChange = (value: string) => {
    if (value === 'all') {
      setSelectedSubcategoryId(null);
    } else {
      setSelectedSubcategoryId(value);
    }
  };

  if (error) {
    return (
      <div className="min-h-screen bg-stone-50 dark:bg-stone-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 text-lg mb-4">{error}</p>
          <Button onClick={handleBack} variant="outline">
            <ArrowRight className="ml-2 h-4 w-4" />
            العودة للتصنيفات
          </Button>
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

  if (!category) {
    return null;
  }

  return (
    <div className="min-h-screen bg-stone-50 dark:bg-stone-900">
      {/* Compact Header */}
      <div className="bg-white pt-16 dark:bg-stone-800 shadow-sm border-b dark:border-stone-700 sticky top-0 z-50">
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
              onClick={handleBack}
              className="text-stone-500 hover:text-stone-700 dark:text-stone-400 dark:hover:text-stone-300 transition-colors"
            >
              البحث
            </button>
            <ChevronRight className="h-4 w-4 text-stone-400 rotate-180" />
            <span className="text-stone-900 dark:text-white font-medium">
              {category.name}
            </span>
          </div>

          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            {/* Title & Back Button */}
            <div className="flex items-center gap-3">
              <Button
                onClick={handleBack}
                variant="outline"
                size="sm"
                className="shrink-0"
              >
                <ArrowRight className="h-4 w-4 ml-1" />
                عودة
              </Button>
              <div>
                <h1 className="text-xl font-bold text-stone-900 dark:text-white">
                  {category.name}
                </h1>
                <p className="text-xs text-stone-600 dark:text-stone-400">
                  {category.subcategories.length} تصنيف فرعي
                </p>
              </div>
            </div>

            {/* Subcategory Filter */}
            {category.subcategories.length > 0 && (
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-stone-500 shrink-0" />
                <Select
                  value={selectedSubcategoryId || 'all'}
                  onValueChange={handleSubcategoryChange}
                >
                  <SelectTrigger className="w-full md:w-[280px] h-9 text-sm">
                    <SelectValue placeholder="جميع التصنيفات الفرعية" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>التصنيفات الفرعية</SelectLabel>
                      <SelectItem value="all">
                        <span className="font-medium">جميع التصنيفات</span>
                      </SelectItem>
                      {category.subcategories.map((sub) => (
                        <SelectItem key={sub.id} value={sub.id}>
                          <div className="flex items-center justify-between w-full">
                            <span>{sub.name}</span>
                            {sub._count?.Service && (
                              <span className="text-xs text-stone-500 mr-2">
                                ({sub._count.Service})
                              </span>
                            )}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Full Screen Content - AdvancedSearch with filters */}
      <div className="h-[calc(100vh-130px)]">
        <AdvancedSearch
          initialCategory={category.id}
          initialSubCategory={selectedSubcategoryId || undefined}
          key={`${category.id}-${selectedSubcategoryId || 'all'}`} // Force re-render on filter change
        />
      </div>
    </div>
  );
}

