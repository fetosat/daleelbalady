'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

export interface Tab {
  id: string;
  label: string;
  icon?: LucideIcon;
}

export interface SubscriptionTabsProps {
  tabs: Tab[];
  activeTab: string;
  onChange: (tabId: string) => void;
  isRTL?: boolean;
  className?: string;
}

export const SubscriptionTabs: React.FC<SubscriptionTabsProps> = ({
  tabs,
  activeTab,
  onChange,
  isRTL = false,
  className,
}) => {
  return (
    <div className={cn("flex justify-center", className)}>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="inline-flex items-center gap-2 bg-muted/50 backdrop-blur-sm p-1.5 rounded-full shadow-lg border border-border/50"
      >
        {tabs.map((tab, index) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <motion.div
              key={tab.id}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
              className="relative"
            >
              <Button
                variant={isActive ? "default" : "ghost"}
                size="lg"
                onClick={() => onChange(tab.id)}
                className={cn(
                  "rounded-full px-6 py-3 transition-all duration-300 relative overflow-hidden",
                  isActive 
                    ? "bg-gradient-to-r from-primary to-primary/80 text-primary-foreground shadow-lg hover:shadow-xl" 
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/80",
                  isRTL && "flex-row-reverse"
                )}
              >
                {/* Active Background Animation */}
                {isActive && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute inset-0 bg-gradient-to-r from-primary to-primary/80 rounded-full"
                    initial={false}
                    transition={{
                      type: "spring",
                      stiffness: 500,
                      damping: 30,
                    }}
                  />
                )}

                {/* Content */}
                <span className="relative z-10 flex items-center gap-2 font-medium">
                  {Icon && (
                    <motion.div
                      animate={isActive ? { 
                        rotate: [0, -10, 10, -10, 0],
                        scale: [1, 1.1, 1]
                      } : {}}
                      transition={{ duration: 0.5 }}
                    >
                      <Icon className="h-4 w-4" />
                    </motion.div>
                  )}
                  {tab.label}
                </span>

                {/* Hover Effect */}
                {!isActive && (
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-primary/10 to-primary/5 rounded-full"
                    initial={{ opacity: 0 }}
                    whileHover={{ opacity: 1 }}
                    transition={{ duration: 0.2 }}
                  />
                )}
              </Button>

              {/* Active Indicator Dot */}
              {isActive && (
                <motion.div
                  layoutId="indicator"
                  className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-primary rounded-full"
                  initial={false}
                  transition={{
                    type: "spring",
                    stiffness: 500,
                    damping: 30,
                  }}
                />
              )}
            </motion.div>
          );
        })}
      </motion.div>
    </div>
  );
};

// Preset tab configurations
export const presetTabs = {
  userAndProvider: (isRTL: boolean): Tab[] => [
    {
      id: 'user',
      label: isRTL ? 'خطط المستخدمين' : 'User Plans',
      icon: require('lucide-react').User,
    },
    {
      id: 'provider',
      label: isRTL ? 'خطط مقدمي الخدمات' : 'Provider Plans',
      icon: require('lucide-react').Store,
    },
  ],

  billingCycle: (isRTL: boolean): Tab[] => [
    {
      id: 'monthly',
      label: isRTL ? 'شهري' : 'Monthly',
      icon: require('lucide-react').Calendar,
    },
    {
      id: 'yearly',
      label: isRTL ? 'سنوي' : 'Yearly',
      icon: require('lucide-react').CalendarCheck,
    },
  ],
};

