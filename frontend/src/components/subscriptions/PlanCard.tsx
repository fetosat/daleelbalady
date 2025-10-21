'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Check, Star, Loader2, CreditCard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export interface PlanCardProps {
  id: string;
  name: string;
  price: number;
  period: string;
  features: string[];
  icon?: React.ElementType;
  gradient?: string;
  color?: string;
  popular?: boolean;
  badge?: string;
  isCurrentPlan?: boolean;
  isLoading?: boolean;
  disabled?: boolean;
  onSelect: (planId: string) => void;
  index?: number;
  isRTL?: boolean;
  currency?: string;
  buttonText?: string;
  currentPlanText?: string;
  priceNote?: string;
}

export const PlanCard: React.FC<PlanCardProps> = ({
  id,
  name,
  price,
  period,
  features,
  icon: Icon,
  gradient = 'from-blue-100 to-blue-200',
  color = 'text-blue-600',
  popular = false,
  badge,
  isCurrentPlan = false,
  isLoading = false,
  disabled = false,
  onSelect,
  index = 0,
  isRTL = false,
  currency = 'EGP',
  buttonText = 'Subscribe Now',
  currentPlanText = 'Current Plan',
  priceNote,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ 
        delay: index * 0.1,
        duration: 0.5,
        ease: 'easeOut'
      }}
      whileHover={{ 
        scale: disabled ? 1 : 1.02,
        transition: { duration: 0.2 }
      }}
      className="relative h-full"
    >
      {/* Popular Badge */}
      {popular && (
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: index * 0.1 + 0.3 }}
          className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-10"
        >
          <Badge className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-4 py-1 shadow-lg">
            <Star className={cn("h-3 w-3", isRTL ? "ml-1" : "mr-1")} fill="currentColor" />
            {isRTL ? 'الأكثر شعبية' : 'Most Popular'}
          </Badge>
        </motion.div>
      )}
      
      <Card 
        className={cn(
          'h-full transition-all duration-300 hover:shadow-2xl',
          popular && 'ring-2 ring-green-500/50 shadow-green-500/20',
          isCurrentPlan && 'ring-2 ring-blue-500 shadow-blue-500/20 bg-blue-50/50 dark:bg-blue-950/20',
          disabled && 'opacity-70 cursor-not-allowed'
        )}
      >
        <CardHeader className="text-center pb-4">
          {/* Icon */}
          {Icon && (
            <motion.div 
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: index * 0.1 + 0.2, type: 'spring' }}
              className={cn(
                'mx-auto w-16 h-16 rounded-full bg-gradient-to-r flex items-center justify-center mb-4 shadow-lg',
                gradient
              )}
            >
              <Icon className={cn('h-8 w-8', color)} />
            </motion.div>
          )}
          
          {/* Plan Name */}
          <CardTitle className="text-xl font-bold text-foreground mb-2">
            {name}
          </CardTitle>
          
          {/* Badge */}
          {badge && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: index * 0.1 + 0.4, type: 'spring' }}
            >
              <Badge className="mx-auto bg-gradient-to-r from-yellow-400 to-orange-400 text-black">
                {badge}
              </Badge>
            </motion.div>
          )}
          
          {/* Current Plan Badge */}
          {isCurrentPlan && (
            <motion.div
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ repeat: Infinity, duration: 2 }}
            >
              <Badge className="mx-auto bg-blue-500 text-white mt-2">
                {currentPlanText}
              </Badge>
            </motion.div>
          )}
          
          {/* Price */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: index * 0.1 + 0.3 }}
            className="flex items-center justify-center gap-2 mt-4"
          >
            <span className={cn(
              'text-4xl font-bold',
              popular ? 'text-green-600 dark:text-green-400' : 'text-foreground'
            )}>
              {price.toLocaleString()} {currency}
            </span>
            <span className="text-muted-foreground text-sm">
              {period}
            </span>
          </motion.div>
          
          {/* Price Note */}
          {priceNote && (
            <p className="text-sm text-muted-foreground mt-2">
              {priceNote}
            </p>
          )}
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Features List */}
          <ul className="space-y-3">
            {features.map((feature, i) => (
              <motion.li
                key={i}
                initial={{ opacity: 0, x: isRTL ? 20 : -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 + 0.5 + i * 0.05 }}
                className={cn(
                  "flex items-start gap-3",
                  isRTL && "flex-row-reverse text-right"
                )}
              >
                <div className="w-5 h-5 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Check className="h-3 w-3 text-green-600 dark:text-green-400" />
                </div>
                <span className="text-muted-foreground text-sm leading-relaxed">
                  {feature}
                </span>
              </motion.li>
            ))}
          </ul>

          {/* Action Button */}
          <motion.div
            whileHover={{ scale: disabled ? 1 : 1.02 }}
            whileTap={{ scale: disabled ? 1 : 0.98 }}
          >
            <Button 
              className={cn(
                'w-full mt-6 transition-all duration-200',
                popular && !isCurrentPlan && 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700',
                isCurrentPlan && 'bg-blue-500 hover:bg-blue-600'
              )}
              variant={price === 0 ? (isCurrentPlan ? "default" : "outline") : (popular ? "default" : "outline")}
              onClick={() => onSelect(id)}
              disabled={disabled || isLoading || (isCurrentPlan && price === 0)}
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  {isRTL ? 'جاري المعالجة...' : 'Processing...'}
                </div>
              ) : isCurrentPlan && price === 0 ? (
                <>
                  <Check className={cn("h-4 w-4", isRTL ? "ml-2" : "mr-2")} />
                  {currentPlanText}
                </>
              ) : (
                <>
                  <CreditCard className={cn("h-4 w-4", isRTL ? "ml-2" : "mr-2")} />
                  {buttonText}
                </>
              )}
            </Button>
          </motion.div>
          
          {/* Current Plan Note */}
          {isCurrentPlan && price !== 0 && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: index * 0.1 + 0.6 }}
              className="text-xs text-center text-blue-600 dark:text-blue-400 mt-2"
            >
              ✨ {isRTL ? 'هذه خطتك الحالية' : 'This is your current plan'}
            </motion.p>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};

