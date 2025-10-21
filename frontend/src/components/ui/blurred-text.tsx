"use client";

import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface BlurredTextProps {
  text: string;
  className?: string;
  delay?: number;
}

export const BlurredText: React.FC<BlurredTextProps> = ({ 
  text, 
  className = "", 
  delay = 0 
}) => {
  return (
    <motion.div
      initial={{ 
        opacity: 0, 
        filter: "blur(10px)",
        y: 20
      }}
      animate={{ 
        opacity: 1, 
        filter: "blur(0px)",
        y: 0
      }}
      transition={{
        duration: 0.8,
        delay,
        ease: "easeOut"
      }}
      className={cn(
        "transition-all duration-300",
        className
      )}
    >
      {text}
    </motion.div>
  );
};
