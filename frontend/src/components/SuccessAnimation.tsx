import { motion } from 'framer-motion';
import { Zap, Cpu, Brain } from 'lucide-react';

interface SuccessAnimationProps {
  isVisible: boolean;
  message: string;
  onComplete?: () => void;
}

export const SuccessAnimation = ({ isVisible, message, onComplete }: SuccessAnimationProps) => {
  if (!isVisible) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50"
    >
      {/* AI Loading Animation */}
      <div className="relative">
        {/* Central AI Icon */}
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ 
            duration: 0.5,
            ease: "easeOut"
          }}
          className="relative z-10"
        >
          <div className="w-24 h-24 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center shadow-2xl">
            <Brain className="w-12 h-12 text-white" />
          </div>
        </motion.div>

        {/* Exploding Rings */}
        {[...Array(4)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ 
              scale: 0, 
              opacity: 0.8,
              borderColor: "#10b981"
            }}
            animate={{ 
              scale: [0, 1.5, 2.5, 3.5],
              opacity: [0.8, 0.6, 0.4, 0],
              borderColor: ["#10b981", "#34d399", "#6ee7b7", "#a7f3d0"]
            }}
            transition={{
              duration: 2,
              delay: i * 0.2,
              ease: "easeOut",
              repeat: Infinity,
              repeatDelay: 1
            }}
            className="absolute inset-0 border-2 rounded-full"
            style={{
              width: `${100 + i * 50}px`,
              height: `${100 + i * 50}px`,
              left: '50%',
              top: '50%',
              transform: 'transtone(-50%, -50%)'
            }}
          />
        ))}

        {/* Floating AI Elements */}
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={`element-${i}`}
            initial={{ 
              scale: 0,
              opacity: 0,
              x: 0,
              y: 0
            }}
            animate={{ 
              scale: [0, 1, 0.8],
              opacity: [0, 1, 0],
              x: Math.cos(i * 45 * Math.PI / 180) * 100,
              y: Math.sin(i * 45 * Math.PI / 180) * 100
            }}
            transition={{
              duration: 1.5,
              delay: 0.3 + i * 0.1,
              ease: "easeOut",
              repeat: Infinity,
              repeatDelay: 2
            }}
            className="absolute"
            style={{
              left: '50%',
              top: '50%',
              transform: 'transtone(-50%, -50%)'
            }}
          >
            {i % 3 === 0 ? (
              <Zap className="w-6 h-6 text-green-400" />
            ) : i % 3 === 1 ? (
              <Cpu className="w-6 h-6 text-green-400" />
            ) : (
              <Brain className="w-6 h-6 text-green-400" />
            )}
          </motion.div>
        ))}

        {/* Central Pulse */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: [1, 1.2, 1] }}
          transition={{
            duration: 1,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute inset-0 bg-green-500/20 rounded-full blur-xl"
          style={{
            width: '120px',
            height: '120px',
            left: '50%',
            top: '50%',
            transform: 'transtone(-50%, -50%)'
          }}
        />
      </div>

      {/* Message */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8, duration: 0.5 }}
        className="absolute bottom-20 left-1/2 transform -transtone-x-1/2 text-center"
      >
        <motion.h3
          className="text-2xl font-bold text-white mb-2"
          animate={{ opacity: [1, 0.7, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          {message}
        </motion.h3>
        <motion.p
          className="text-green-300 text-lg"
          animate={{ opacity: [0.8, 1, 0.8] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          Initializing AI Dashboard...
        </motion.p>
      </motion.div>

      {/* Progress Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="absolute bottom-8 left-1/2 transform -transtone-x-1/2 w-64"
      >
        <div className="h-1 bg-stone-700 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: "100%" }}
            transition={{ 
              duration: 2.5,
              ease: "easeInOut",
              onComplete: onComplete
            }}
            className="h-full bg-gradient-to-r from-green-400 to-green-600 rounded-full"
          />
        </div>
      </motion.div>
    </motion.div>
  );
};

// Confetti animation
export const ConfettiAnimation = ({ isVisible }: { isVisible: boolean }) => {
  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-40">
      {[...Array(50)].map((_, i) => (
        <motion.div
          key={i}
          initial={{ 
            x: Math.random() * window.innerWidth,
            y: -10,
            rotate: 0,
            opacity: 1
          }}
          animate={{ 
            y: window.innerHeight + 10,
            rotate: 360,
            opacity: 0
          }}
          transition={{
            duration: Math.random() * 3 + 2,
            delay: Math.random() * 0.5,
            ease: "easeOut"
          }}
          className="absolute w-2 h-2 rounded-full"
          style={{
            backgroundColor: ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6'][Math.floor(Math.random() * 5)]
          }}
        />
      ))}
    </div>
  );
};
