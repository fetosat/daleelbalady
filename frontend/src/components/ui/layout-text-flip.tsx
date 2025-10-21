"use client";
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

export const LayoutTextFlip = ({
  text = "Build Amazing",
  suffix = "",
  words = ["Landing Pages", "Component Blocks", "Page Sections", "3D Shaders"],
  duration = 3000,
}: {
  text: string;
  words: string[];
  suffix?: string;
  duration?: number;
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted || words.length === 0) return;
    
    // Start animation after a short delay to ensure smooth hydration
    const startDelay = setTimeout(() => {
      const interval = setInterval(() => {
        setCurrentIndex((prevIndex) => (prevIndex + 1) % words.length);
      }, duration);
      
      return () => clearInterval(interval);
    }, 100);

    return () => {
      clearTimeout(startDelay);
    };
  }, [words.length, duration, mounted]);

  return (
    <div className="flex items-center justify-center flex-row min-w- gap-2">
      <motion.span
        layoutId="subtaext"
        className="text-base font-bold tracking-tight drop-shadow-lg md:text-4xl"
      >
        {text}
      </motion.span>

      <motion.span
        layout
        className="relative w-fit overflow-hidden rounded-md border border-transparent bg-white px-2 py-1 font-sans text-base font-bold tracking-tight text-black shadow-sm ring shadow-black/10 ring-black/10 drop-shadow-lg md:text-4xl dark:bg-neutral-900 dark:text-white dark:shadow-sm dark:ring-1 dark:shadow-white/10 dark:ring-white/10"
      >
        <AnimatePresence mode="popLayout">
          <motion.span
            key={mounted ? currentIndex : 'initial'}
            initial={{ y: mounted ? -40 : 0, filter: mounted ? "blur(10px)" : "blur(0px)" }}
            animate={{
              y: 0,
              filter: "blur(0px)",
            }}
            exit={{ y: 50, filter: "blur(10px)", opacity: 0 }}
            transition={{
              duration: mounted ? 0.5 : 0,
            }}
            className={cn("inline-block whitespace-nowrap")}
          >
            {words.length > 0 ? words[currentIndex] || words[0] : "..."}
          </motion.span>
        </AnimatePresence>
      </motion.span>

      <motion.span
        className="text-base font-bold tracking-tight drop-shadow-lg md:text-4xl"
      >
        {suffix}
      </motion.span>

    </div>
  );
};
