'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { ArrowRight, Users } from 'lucide-react';
import { Card } from '@/components/ui/card';

interface SubCategory {
  id: string;
  name: string;
  slug: string;
  serviceCount?: number;
}

interface SubCategoryGridProps {
  subcategories: SubCategory[];
  categorySlug: string;
  loading?: boolean;
}

const getSubCategoryGradient = (index: number) => {
  const gradients = [
    'from-blue-400 to-blue-600',
    'from-purple-400 to-purple-600',
    'from-green-400 to-green-600',
    'from-orange-400 to-orange-600',
    'from-pink-400 to-pink-600',
    'from-teal-400 to-teal-600',
    'from-cyan-400 to-cyan-600',
    'from-indigo-400 to-indigo-600',
  ];
  return gradients[index % gradients.length];
};

export const SubCategoryGrid: React.FC<SubCategoryGridProps> = ({
  subcategories,
  categorySlug,
  loading
}) => {
  const router = useRouter();

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {[...Array(6)].map((_, i) => (
          <Card key={i} className="h-40 animate-pulse bg-stone-200 dark:bg-stone-800" />
        ))}
      </div>
    );
  }

  if (subcategories.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-stone-500">لا توجد تصنيفات فرعية متاحة</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {subcategories.map((sub, index) => (
        <motion.div
          key={sub.id}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: index * 0.05 }}
          whileHover={{ scale: 1.05, y: -5 }}
        >
          <Card
            onClick={() => router.push(`/find/${categorySlug}/${sub.slug}`)}
            className="relative h-40 overflow-hidden cursor-pointer border-none shadow-md hover:shadow-xl transition-all group"
          >
            {/* Background Gradient */}
            <div className={`absolute inset-0 bg-gradient-to-br ${getSubCategoryGradient(index)} opacity-90 group-hover:opacity-100 transition-opacity`} />
            
            {/* Pattern Overlay */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute inset-0" style={{
                backgroundImage: `repeating-linear-gradient(45deg, white 0, white 1px, transparent 0, transparent 50%)`
              }} />
            </div>

            {/* Content */}
            <div className="relative h-full flex flex-col justify-between p-6 text-white">
              <div className="flex items-start justify-between">
                <h3 className="text-xl font-bold drop-shadow-lg">{sub.name}</h3>
                {sub.serviceCount && sub.serviceCount > 0 && (
                  <div className="bg-white/20 backdrop-blur-sm px-2 py-1 rounded-full flex items-center gap-1">
                    <Users className="h-3 w-3" />
                    <span className="text-xs font-medium">{sub.serviceCount}</span>
                  </div>
                )}
              </div>
              
              <div className="flex items-center gap-2 text-sm font-semibold group-hover:gap-3 transition-all">
                <span>عرض الخدمات</span>
                <ArrowRight className="h-4 w-4 group-hover:transtone-x-1 transition-transform" />
              </div>
            </div>

            {/* Shine Effect */}
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 transtone-x-[-100%] group-hover:transtone-x-[100%] transition-transform duration-700" />
            </div>
          </Card>
        </motion.div>
      ))}
    </div>
  );
};

export default SubCategoryGrid;

