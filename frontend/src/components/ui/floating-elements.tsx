"use client";

import React, { useEffect, useState } from 'react';
import { motion, useAnimation } from 'framer-motion';

interface FloatingElement {
  id: number;
  x: number;
  y: number;
  size: number;
  delay: number;
  duration: number;
  opacity: number;
}

interface FloatingElementsProps {
  count?: number;
  className?: string;
}

export const FloatingElements: React.FC<FloatingElementsProps> = ({ 
  count = 15,
  className = "absolute inset-0 pointer-events-none"
}) => {
  const [elements, setElements] = useState<FloatingElement[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    
    const generateElements = () => {
      const newElements: FloatingElement[] = [];
      // Use deterministic values to prevent hydration mismatch
      const seed = 12345; // Fixed seed for consistent results
      let seedValue = seed;
      
      const seededRandom = () => {
        seedValue = (seedValue * 9301 + 49297) % 233280;
        return seedValue / 233280;
      };
      
      for (let i = 0; i < count; i++) {
        newElements.push({
          id: i,
          x: seededRandom() * 100,
          y: seededRandom() * 100,
          size: seededRandom() * 8 + 2,
          delay: seededRandom() * 5,
          duration: seededRandom() * 8 + 12,
          opacity: seededRandom() * 0.3 + 0.1
        });
      }
      setElements(newElements);
    };

    generateElements();
  }, [count, mounted]);

  if (!mounted) return null;

  return (
    <div className={className}>
      {elements.map((element) => (
        <motion.div
          key={element.id}
          className="absolute rounded-full bg-gradient-to-br from-blue-400/30 to-green-400/30 backdrop-blur-sm"
          style={{
            left: `${element.x}%`,
            top: `${element.y}%`,
            width: `${element.size}px`,
            height: `${element.size}px`,
            opacity: element.opacity,
          }}
          animate={{
            y: [-10, 10, -10],
            x: [-5, 5, -5],
            rotate: [0, 90, 180],
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: element.duration,
            delay: element.delay,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
};

export const ParticleField: React.FC<{ className?: string }> = ({ 
  className = "absolute inset-0 pointer-events-none" 
}) => {
  const [particles, setParticles] = useState<FloatingElement[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    
    const generateParticles = () => {
      const newParticles: FloatingElement[] = [];
      // Use deterministic values to prevent hydration mismatch
      const seed = 54321; // Different seed from FloatingElements
      let seedValue = seed;
      
      const seededRandom = () => {
        seedValue = (seedValue * 9301 + 49297) % 233280;
        return seedValue / 233280;
      };
      
      for (let i = 0; i < 25; i++) {
        newParticles.push({
          id: i,
          x: seededRandom() * 100,
          y: seededRandom() * 100,
          size: seededRandom() * 3 + 1,
          delay: seededRandom() * 8,
          duration: seededRandom() * 15 + 15,
          opacity: seededRandom() * 0.4 + 0.1
        });
      }
      setParticles(newParticles);
    };

    generateParticles();
  }, [mounted]);

  if (!mounted) return null;

  return (
    <div className={className}>
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          className="absolute rounded-full"
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            width: `${particle.size}px`,
            height: `${particle.size}px`,
            background: `radial-gradient(circle, rgba(59, 130, 246, ${particle.opacity}) 0%, rgba(34, 197, 94, ${particle.opacity}) 100%)`,
            boxShadow: `0 0 ${particle.size * 2}px rgba(59, 130, 246, ${particle.opacity * 0.5})`,
          }}
          animate={{
            y: [0, -100, 0],
            opacity: [particle.opacity, particle.opacity * 0.3, particle.opacity],
            scale: [1, 0.5, 1],
          }}
          transition={{
            duration: particle.duration,
            delay: particle.delay,
            repeat: Infinity,
            ease: "linear",
          }}
        />
      ))}
    </div>
  );
};
