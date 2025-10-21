"use client";

import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface GradientTextProps {
  text: string;
  className?: string;
  delay?: number;
  gradient?: string;
  shimmer?: boolean;
}

export const GradientText: React.FC<GradientTextProps> = ({ 
  text, 
  className = "", 
  delay = 0,
  gradient = "from-blue-600 via-purple-600 to-green-600",
  shimmer = true
}) => {
  return (
    <motion.div
      initial={{ 
        opacity: 0, 
        y: 30,
        filter: "blur(10px)"
      }}
      animate={{ 
        opacity: 1, 
        y: 0,
        filter: "blur(0px)"
      }}
      transition={{
        duration: 1,
        delay,
        ease: "easeOut"
      }}
      className={cn("relative", className)}
    >
      {/* Glow effect background */}
      <div 
        className={cn(
          "absolute inset-0 blur-2xl opacity-30 py-5",
        )}
        style={{
          transform: 'scale(1.2)',
        }}
        suppressHydrationWarning
      >
        <div className="w-full h-full" suppressHydrationWarning>{text}</div>
      </div>

      {/* Main text */}
      <div className={cn(
        "relative z-10 bg-gradient-to-r bg-clip-text py-5 text-transparent font-bold ",
        gradient,
        shimmer && "bg-[length:200%_200%]"
      )} suppressHydrationWarning>
        {text}
      </div>

   
    </motion.div>
  );
};

export const AnimatedCounter: React.FC<{ 
  value: number; 
  suffix?: string; 
  className?: string;
  delay?: number;
}> = ({ value, suffix = "", className = "", delay = 0 }) => {
  const [count, setCount] = React.useState(0);
  const [mounted, setMounted] = React.useState(false);

  // Ensure consistent rendering between server and client
  React.useEffect(() => {
    setMounted(true);
  }, []);

  React.useEffect(() => {
    if (!mounted) return;
    
    const timer = setTimeout(() => {
      const duration = 2000;
      const startTime = Date.now();
      
      const updateCount = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const easeOutProgress = 1 - Math.pow(1 - progress, 3);
        setCount(Math.floor(value * easeOutProgress));
        
        if (progress < 1) {
          requestAnimationFrame(updateCount);
        }
      };
      
      updateCount();
    }, delay);

    return () => clearTimeout(timer);
  }, [value, delay, mounted]);

  // Show static value during SSR to prevent hydration mismatch
  const displayValue = mounted ? count : 0;

  return (
    <motion.span
      initial={{ opacity: 0, scale: 0.5 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, delay: mounted ? delay / 1000 : 0 }}
      className={className}
    >
      {displayValue.toLocaleString()}{suffix}
    </motion.span>
  );
};
