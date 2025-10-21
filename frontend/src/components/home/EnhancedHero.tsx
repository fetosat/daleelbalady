'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { LayoutTextFlip } from '@/components/ui/layout-text-flip';
import { 
  ArrowRight, 
  Sparkles, 
  MapPin, 
  Search,
  ChevronDown,
  Star,
  Users,
  TrendingUp
} from 'lucide-react';

// Animated gradient background component
const AnimatedGradient = () => {
  return (
    <div className="absolute inset-0 overflow-hidden">
      <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/30 to-purple-600/30 rounded-full blur-3xl animate-pulse" />
      <div className="absolute top-20 -left-40 w-96 h-96 bg-gradient-to-br from-green-400/30 to-teal-600/30 rounded-full blur-3xl animate-pulse delay-1000" />
      <div className="absolute bottom-20 right-20 w-72 h-72 bg-gradient-to-br from-pink-400/20 to-yellow-600/20 rounded-full blur-3xl animate-pulse delay-2000" />
    </div>
  );
};

// Floating particles component
const FloatingParticles = () => {
  const particles = Array.from({ length: 20 }, (_, i) => i);
  
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map((i) => (
        <motion.div
          key={i}
          className="absolute w-2 h-2 bg-gradient-to-br from-blue-400 to-green-400 rounded-full opacity-60"
          initial={{
            x: Math.random() * window.innerWidth,
            y: window.innerHeight + 20
          }}
          animate={{
            y: -20,
            x: Math.random() * window.innerWidth,
          }}
          transition={{
            duration: Math.random() * 15 + 10,
            repeat: Infinity,
            ease: "linear",
            delay: Math.random() * 5
          }}
        />
      ))}
    </div>
  );
};

// Enhanced text with glow effect
const GlowingText: React.FC<{ text: string; className?: string }> = ({ text, className }) => {
  return (
    <motion.div
      className="relative"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
    >
      {/* Glow effect */}
      <span className={`absolute inset-0 blur-2xl opacity-50 ${className}`}>
        {text}
      </span>
      {/* Main text */}
      <span className={`relative ${className}`}>
        {text}
      </span>
    </motion.div>
  );
};

// Animated stats badge
const StatsBadge: React.FC<{ icon: any; value: string; label: string }> = ({ icon: Icon, value, label }) => {
  return (
    <motion.div
      className="flex items-center gap-3 bg-white/10 dark:bg-black/20 backdrop-blur-md rounded-full px-4 py-2 border border-white/20"
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.05 }}
      transition={{ duration: 0.3 }}
    >
      <div className="p-2 bg-gradient-to-br from-blue-500 to-green-500 rounded-full">
        <Icon className="w-4 h-4 text-white" />
      </div>
      <div>
        <div className="text-lg font-bold text-white">{value}</div>
        <div className="text-xs text-white/80">{label}</div>
      </div>
    </motion.div>
  );
};

interface EnhancedHeroProps {
  categoryNames: string[];
}

const EnhancedHero: React.FC<EnhancedHeroProps> = ({ categoryNames }) => {
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-blue-600 via-purple-600 to-green-600 dark:from-blue-900 dark:via-purple-900 dark:to-green-900">
      {/* Background effects */}
      <AnimatedGradient />
      <FloatingParticles />
      
      {/* Grid pattern overlay */}
      <div className="absolute inset-0 bg-grid-white/5 bg-[size:50px_50px]" />
      
      {/* Main content */}
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8">
        {/* Stats badges */}
        <motion.div 
          className="absolute top-8 left-8 hidden lg:block"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
        >
          <StatsBadge icon={Users} value="10,000+" label="مستخدم نشط" />
        </motion.div>
        
        <motion.div 
          className="absolute top-8 right-8 hidden lg:block"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.6 }}
        >
          <StatsBadge icon={Star} value="4.9/5" label="تقييم العملاء" />
        </motion.div>
        
        <motion.div 
          className="absolute bottom-8 left-8 hidden lg:block"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.7 }}
        >
          <StatsBadge icon={TrendingUp} value="500+" label="متجر مشارك" />
        </motion.div>

        {/* Central content */}
        <div className="text-center max-w-5xl mx-auto">
          {/* Animated badge */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 text-white text-sm mb-8"
          >
            <Sparkles className="w-4 h-4" />
            <span>منصة التوفير الأولى في مصر</span>
          </motion.div>

          {/* Main heading */}
          <GlowingText
            text="مرحباً بك في دليل بلدي"
            className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-6"
          />

          {/* Dynamic text */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="mb-8"
          >
            <div className="text-xl sm:text-2xl md:text-3xl text-white/90">
              <LayoutTextFlip
                text="اعثر على "
                words={categoryNames}
                suffix="بالقرب منك"
                duration={2500}
              />
            </div>
          </motion.div>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="text-lg sm:text-xl text-white/80 mb-10 max-w-2xl mx-auto"
          >
            انضم إلى آلاف العائلات واستمتع بخصومات حصرية في أكثر من 500 متجر ومطعم وعيادة في جميع أنحاء الجمهورية
          </motion.p>

          {/* Search bar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.6 }}
            className="max-w-2xl mx-auto mb-8"
          >
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-green-400 rounded-full blur-xl opacity-50 group-hover:opacity-70 transition-opacity" />
              <div className="relative flex items-center bg-white/95 backdrop-blur-sm rounded-full shadow-2xl p-2">
                <MapPin className="w-5 h-5 text-stone-500 mr-3 ml-4" />
                <input
                  type="text"
                  placeholder="ابحث عن متاجر أو خدمات بالقرب منك..."
                  className="flex-1 bg-transparent outline-none text-stone-800 placeholder-stone-500 py-3"
                />
                <Button className="bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 text-white rounded-full px-6 py-3">
                  <Search className="w-5 h-5 ml-2" />
                  بحث
                </Button>
              </div>
            </div>
          </motion.div>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.6 }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
          >
            <Button
              asChild
              size="lg"
              className="group relative bg-white text-blue-600 hover:bg-stone-100 text-lg px-8 py-6 shadow-2xl overflow-hidden"
            >
              <Link href="/signup">
                <span className="relative z-10 flex items-center gap-2">
                  ابدأ الآن - مجاناً
                  <ArrowRight className="w-5 h-5 group-hover:transtone-x-1 transition-transform" />
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-green-600 opacity-0 group-hover:opacity-10 transition-opacity" />
              </Link>
            </Button>
            
            <Button
              asChild
              variant="outline"
              size="lg"
              className="border-2 border-white text-white hover:bg-white/10 text-lg px-8 py-6 backdrop-blur"
            >
              <Link href="/login">
                تسجيل الدخول
              </Link>
            </Button>
          </motion.div>

          {/* Popular categories */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.6 }}
            className="mt-12 flex flex-wrap gap-3 justify-center"
          >
            {categoryNames.slice(0, 6).map((category, index) => (
              <motion.div
                key={category}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.8 + index * 0.1 }}
                whileHover={{ scale: 1.05 }}
                className="px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full border border-white/20 text-white text-sm cursor-pointer hover:bg-white/20 transition-colors"
              >
                {category}
              </motion.div>
            ))}
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          className="absolute bottom-8 left-1/2 transform -transtone-x-1/2"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1, duration: 0.6 }}
        >
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
            className="text-white/60 cursor-pointer hover:text-white/80 transition-colors"
          >
            <ChevronDown className="w-8 h-8" />
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default EnhancedHero;
