import { motion, AnimatePresence } from 'framer-motion';
import { ReactNode, useState, useEffect } from 'react';
import { Brain, Zap, Cpu, Database, Network } from 'lucide-react';

interface AIExplosionTransitionProps {
  isVisible: boolean;
  message: string;
  onComplete?: () => void;
  children?: ReactNode;
}

export const AIExplosionTransition = ({ 
  isVisible, 
  message, 
  onComplete, 
  children 
}: AIExplosionTransitionProps) => {
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    if (isVisible) {
      // Show dashboard content after explosion
      const timer = setTimeout(() => {
        setShowContent(true);
        onComplete?.();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [isVisible, onComplete]);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-50">
      {/* AI Explosion Animation */}
      <motion.div
        initial={{ opacity: 1 }}
        animate={{ opacity: 0 }}
        transition={{ delay: 2.5, duration: 0.5 }}
        className="absolute inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center"
      >
        {/* Central AI Core */}
        <div className="relative">
          {/* Main AI Icon */}
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="relative z-20"
          >
            <div className="w-32 h-32 bg-gradient-to-br from-green-400 via-green-500 to-green-600 rounded-full flex items-center justify-center shadow-2xl border-4 border-green-300">
              <Brain className="w-16 h-16 text-white" />
            </div>
          </motion.div>

          {/* Exploding Energy Rings */}
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={`ring-${i}`}
              initial={{ 
                scale: 0, 
                opacity: 0.9,
                borderColor: "#10b981"
              }}
              animate={{ 
                scale: [0, 2, 4, 6, 8],
                opacity: [0.9, 0.7, 0.5, 0.3, 0],
                borderColor: ["#10b981", "#34d399", "#6ee7b7", "#a7f3d0", "#d1fae5"]
              }}
              transition={{
                duration: 2.5,
                delay: i * 0.15,
                ease: "easeOut",
                repeat: Infinity,
                repeatDelay: 0.5
              }}
              className="absolute border-2 rounded-full"
              style={{
                width: `${120 + i * 80}px`,
                height: `${120 + i * 80}px`,
                left: '50%',
                top: '50%',
                transform: 'transtone(-50%, -50%)'
              }}
            />
          ))}

          {/* Orbiting AI Elements */}
          {[...Array(12)].map((_, i) => (
            <motion.div
              key={`orbit-${i}`}
              initial={{ 
                scale: 0,
                opacity: 0,
                x: 0,
                y: 0
              }}
              animate={{ 
                scale: [0, 1, 0.8, 0],
                opacity: [0, 1, 0.8, 0],
                x: Math.cos(i * 30 * Math.PI / 180) * (150 + i * 20),
                y: Math.sin(i * 30 * Math.PI / 180) * (150 + i * 20)
              }}
              transition={{
                duration: 2,
                delay: 0.5 + i * 0.1,
                ease: "easeOut",
                repeat: Infinity,
                repeatDelay: 1
              }}
              className="absolute"
              style={{
                left: '50%',
                top: '50%',
                transform: 'transtone(-50%, -50%)'
              }}
            >
              {i % 4 === 0 ? (
                <Zap className="w-8 h-8 text-green-400" />
              ) : i % 4 === 1 ? (
                <Cpu className="w-8 h-8 text-green-400" />
              ) : i % 4 === 2 ? (
                <Database className="w-8 h-8 text-green-400" />
              ) : (
                <Network className="w-8 h-8 text-green-400" />
              )}
            </motion.div>
          ))}

          {/* Central Energy Pulse */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: [1, 1.5, 1] }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="absolute inset-0 bg-green-500/30 rounded-full blur-2xl"
            style={{
              width: '160px',
              height: '160px',
              left: '50%',
              top: '50%',
              transform: 'transtone(-50%, -50%)'
            }}
          />

          {/* Energy Particles */}
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={`particle-${i}`}
              initial={{ 
                scale: 0,
                opacity: 0,
                x: 0,
                y: 0
              }}
              animate={{ 
                scale: [0, 1, 0],
                opacity: [0, 1, 0],
                x: (Math.random() - 0.5) * 400,
                y: (Math.random() - 0.5) * 400
              }}
              transition={{
                duration: 1.5,
                delay: Math.random() * 1,
                ease: "easeOut",
                repeat: Infinity,
                repeatDelay: Math.random() * 2
              }}
              className="absolute w-2 h-2 bg-green-400 rounded-full"
              style={{
                left: '50%',
                top: '50%',
                transform: 'transtone(-50%, -50%)'
              }}
            />
          ))}
        </div>

        {/* Status Message */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1, duration: 0.6 }}
          className="absolute bottom-24 left-1/2 transform -transtone-x-1/2 text-center"
        >
          <motion.h2
            className="text-3xl font-bold text-white mb-3"
            animate={{ opacity: [1, 0.8, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            {message}
          </motion.h2>
          <motion.p
            className="text-green-300 text-xl"
            animate={{ opacity: [0.8, 1, 0.8] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            AI Dashboard Initializing...
          </motion.p>
        </motion.div>

        {/* Progress Bar */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          className="absolute bottom-12 left-1/2 transform -transtone-x-1/2 w-80"
        >
          <div className="h-2 bg-stone-800 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: "100%" }}
              transition={{ 
                duration: 2.5,
                ease: "easeInOut"
              }}
              className="h-full bg-gradient-to-r from-green-400 via-green-500 to-green-600 rounded-full"
            />
          </div>
        </motion.div>
      </motion.div>

      {/* Dashboard Content Transition */}
      <AnimatePresence>
        {showContent && (
          <motion.div
            initial={{ 
              scale: 0.8, 
              opacity: 0,
              clipPath: "circle(0% at 50% 50%)"
            }}
            animate={{ 
              scale: 1, 
              opacity: 1,
              clipPath: "circle(150% at 50% 50%)"
            }}
            transition={{ 
              duration: 1,
              ease: "easeInOut"
            }}
            className="absolute inset-0"
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
