'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

export interface Feature {
  icon: LucideIcon;
  title: string;
  description: string;
  color?: string;
  gradient?: string;
}

export interface FeatureShowcaseProps {
  features: Feature[];
  isRTL?: boolean;
  title?: string;
  subtitle?: string;
}

export const FeatureShowcase: React.FC<FeatureShowcaseProps> = ({
  features,
  isRTL = false,
  title,
  subtitle,
}) => {
  return (
    <div className="w-full">
      {/* Title Section */}
      {(title || subtitle) && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          {title && (
            <h2 className="text-3xl font-bold text-foreground mb-3">
              {title}
            </h2>
          )}
          {subtitle && (
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              {subtitle}
            </p>
          )}
        </motion.div>
      )}

      {/* Features Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {features.map((feature, index) => {
          const Icon = feature.icon;
          const delay = index * 0.1;

          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ 
                delay,
                duration: 0.5,
                ease: 'easeOut'
              }}
              whileHover={{ 
                y: -8,
                transition: { duration: 0.2 }
              }}
            >
              <Card className="h-full border-2 hover:border-primary/50 transition-all duration-300 hover:shadow-xl bg-gradient-to-br from-background to-muted/20">
                <CardContent className={cn(
                  "p-6 space-y-4",
                  isRTL && "text-right"
                )}>
                  {/* Icon */}
                  <motion.div
                    initial={{ scale: 0, rotate: -180 }}
                    whileInView={{ scale: 1, rotate: 0 }}
                    viewport={{ once: true }}
                    transition={{ 
                      delay: delay + 0.2,
                      type: 'spring',
                      stiffness: 200
                    }}
                    whileHover={{ 
                      rotate: [0, -10, 10, -10, 0],
                      transition: { duration: 0.5 }
                    }}
                    className={cn(
                      'w-14 h-14 rounded-xl flex items-center justify-center shadow-lg',
                      feature.gradient || 'bg-gradient-to-br from-blue-500 to-cyan-500',
                      isRTL ? 'mr-auto' : 'ml-0'
                    )}
                  >
                    <Icon className="h-7 w-7 text-white" />
                  </motion.div>

                  {/* Content */}
                  <div className="space-y-2">
                    <motion.h3
                      initial={{ opacity: 0, x: isRTL ? 20 : -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: delay + 0.3 }}
                      className="text-lg font-semibold text-foreground"
                    >
                      {feature.title}
                    </motion.h3>
                    
                    <motion.p
                      initial={{ opacity: 0 }}
                      whileInView={{ opacity: 1 }}
                      viewport={{ once: true }}
                      transition={{ delay: delay + 0.4 }}
                      className="text-sm text-muted-foreground leading-relaxed"
                    >
                      {feature.description}
                    </motion.p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Decorative Elements */}
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 0.03 }}
        viewport={{ once: true }}
        transition={{ duration: 1 }}
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(circle at 50% 50%, currentColor 1px, transparent 1px)',
          backgroundSize: '24px 24px',
        }}
      />
    </div>
  );
};

// Preset feature configurations for common use cases
export const presetFeatures = {
  providerBenefits: (isRTL: boolean): Feature[] => [
    {
      icon: require('lucide-react').TrendingUp,
      title: isRTL ? 'رؤية محسنة' : 'Enhanced Visibility',
      description: isRTL 
        ? 'ظهور أعلى في نتائج البحث والحصول على مزيد من العملاء'
        : 'Appear higher in search results and get more customers',
      gradient: 'bg-gradient-to-br from-green-500 to-emerald-600',
    },
    {
      icon: require('lucide-react').BarChart3,
      title: isRTL ? 'تحليلات متقدمة' : 'Advanced Analytics',
      description: isRTL 
        ? 'تتبع أدائك برؤى تفصيلية'
        : 'Track your performance with detailed insights',
      gradient: 'bg-gradient-to-br from-blue-500 to-cyan-600',
    },
    {
      icon: require('lucide-react').Headphones,
      title: isRTL ? 'دعم ذو أولوية' : 'Priority Support',
      description: isRTL 
        ? 'احصل على استجابة أسرع ومساعدة مخصصة'
        : 'Get faster response times and dedicated assistance',
      gradient: 'bg-gradient-to-br from-purple-500 to-pink-600',
    },
    {
      icon: require('lucide-react').Award,
      title: isRTL ? 'شارات التحقق' : 'Verified Badges',
      description: isRTL 
        ? 'بناء الثقة مع شارات الأعمال المُحققة'
        : 'Build trust with verified business badges',
      gradient: 'bg-gradient-to-br from-yellow-500 to-orange-600',
    },
  ],
  
  userBenefits: (isRTL: boolean): Feature[] => [
    {
      icon: require('lucide-react').Percent,
      title: isRTL ? 'خصومات حصرية' : 'Exclusive Discounts',
      description: isRTL 
        ? 'احصل على خصومات من آلاف مقدمي الخدمات'
        : 'Get discounts from thousands of service providers',
      gradient: 'bg-gradient-to-br from-red-500 to-rose-600',
    },
    {
      icon: require('lucide-react').Users,
      title: isRTL ? 'خطط عائلية' : 'Family Plans',
      description: isRTL 
        ? 'أضف حتى 5 أفراد من العائلة'
        : 'Add up to 5 family members',
      gradient: 'bg-gradient-to-br from-indigo-500 to-purple-600',
    },
    {
      icon: require('lucide-react').QrCode,
      title: isRTL ? 'بطاقة رقمية' : 'Digital Card',
      description: isRTL 
        ? 'بطاقة رقمية سهلة الاستخدام مع رمز QR'
        : 'Easy-to-use digital card with QR code',
      gradient: 'bg-gradient-to-br from-teal-500 to-cyan-600',
    },
    {
      icon: require('lucide-react').Zap,
      title: isRTL ? 'تفعيل فوري' : 'Instant Activation',
      description: isRTL 
        ? 'ابدأ في الاستفادة من الخصومات فورًا'
        : 'Start benefiting from discounts instantly',
      gradient: 'bg-gradient-to-br from-amber-500 to-yellow-600',
    },
  ],
};

