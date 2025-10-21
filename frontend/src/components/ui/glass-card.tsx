"use client";

import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  glow?: boolean;
  tilt?: boolean;
}

export const GlassCard: React.FC<GlassCardProps> = ({ 
  children, 
  className = "",
  hover = true,
  glow = true,
  tilt = false
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true }}
      whileHover={hover ? { 
        y: -8, 
        scale: 1.02,
        rotateX: tilt ? 5 : 0,
        rotateY: tilt ? 5 : 0,
      } : {}}
      transition={{
        duration: 0.6,
        ease: "easeOut"
      }}
      className={cn(
        "group relative overflow-hidden rounded-3xl",
        "backdrop-blur-xl bg-white/10 dark:bg-black/10",
        "border border-white/20 dark:border-white/10",
        "shadow-2xl",
        hover && "hover:shadow-4xl",
        "transition-all duration-500",
        className
      )}
      style={{
        transformStyle: tilt ? 'preserve-3d' : undefined,
      }}
    >
      {/* Animated gradient background */}
      {glow && (
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 via-purple-500/20 to-green-500/20 blur-xl" />
        </div>
      )}
      
      {/* Glass border effect */}
      <div className="absolute inset-0 rounded-3xl">
        <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-white/20 via-transparent to-transparent" />
        <div className="absolute inset-0 rounded-3xl bg-gradient-to-tl from-white/10 via-transparent to-transparent" />
      </div>

      {/* Content */}
      <div className="relative z-10 p-6">
        {children}
      </div>

      {/* Hover light effect */}
      {hover && (
        <motion.div
          className="absolute -top-40 -right-40 w-80 h-80 rounded-full bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700"
          animate={{
            rotate: 360,
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear"
          }}
        />
      )}
    </motion.div>
  );
};

export const FeatureGlassCard: React.FC<{
  icon: React.ReactNode;
  title: string;
  description: string;
  index: number;
}> = ({ icon, title, description, index }) => {
  return (
    <GlassCard
      hover={true}
      glow={true}
      tilt={true}
      className="h-full"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay: index * 0.1 }}
        className="text-center"
      >
        {/* Animated icon container */}
        <motion.div
          whileHover={{ 
            rotate: [0, -10, 10, -10, 0],
            scale: 1.1
          }}
          transition={{ duration: 0.6 }}
          className="relative mx-auto w-16 h-16 mb-6"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-green-500 rounded-2xl shadow-lg" />
          <div className="absolute inset-0 bg-white/20 rounded-2xl backdrop-blur-sm" />
          <div className="relative z-10 w-full h-full flex items-center justify-center text-white">
            {icon}
          </div>
        </motion.div>

        {/* Title with gradient */}
        <motion.h3
          className="text-xl font-bold mb-4 bg-gradient-to-r from-stone-900 to-stone-700 dark:from-white dark:to-stone-300 bg-clip-text text-transparent"
          whileHover={{ scale: 1.05 }}
        >
          {title}
        </motion.h3>

        {/* Description */}
        <p className="text-stone-600 dark:text-stone-400 leading-relaxed">
          {description}
        </p>
      </motion.div>
    </GlassCard>
  );
};
