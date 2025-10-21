import { motion } from 'framer-motion';
import { CheckCircle, Loader2 } from 'lucide-react';

interface LoadingAnimationProps {
  isLoading: boolean;
  isSuccess?: boolean;
  message?: string;
  successMessage?: string;
}

export const LoadingAnimation = ({ 
  isLoading, 
  isSuccess = false, 
  message = "Loading...", 
  successMessage = "Success!" 
}: LoadingAnimationProps) => {
  if (!isLoading && !isSuccess) return null;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      transition={{ duration: 0.3 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
    >
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="bg-white dark:bg-stone-800 rounded-2xl p-8 shadow-2xl max-w-sm w-full mx-4"
      >
        <div className="flex flex-col items-center space-y-4">
          {isSuccess ? (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ 
                type: "spring", 
                stiffness: 200, 
                damping: 15,
                delay: 0.2 
              }}
            >
              <CheckCircle className="w-16 h-16 text-green-500" />
            </motion.div>
          ) : (
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ 
                duration: 1, 
                repeat: Infinity, 
                ease: "linear" 
              }}
            >
              <Loader2 className="w-16 h-16 text-green-500" />
            </motion.div>
          )}
          
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-lg font-medium text-stone-900 dark:text-white text-center"
          >
            {isSuccess ? successMessage : message}
          </motion.p>
          
          {isLoading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="w-full bg-stone-200 dark:bg-stone-700 rounded-full h-2"
            >
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: "100%" }}
                transition={{ 
                  duration: 2, 
                  ease: "easeInOut",
                  repeat: Infinity,
                  repeatType: "reverse"
                }}
                className="bg-green-500 h-2 rounded-full"
              />
            </motion.div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};

// Pulse animation for buttons
export const PulseButton = ({ children, isLoading, ...props }: any) => {
  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      animate={isLoading ? { 
        boxShadow: [
          "0 0 0 0 rgba(34, 197, 94, 0.4)",
          "0 0 0 10px rgba(34, 197, 94, 0)",
          "0 0 0 0 rgba(34, 197, 94, 0)"
        ]
      } : {}}
      transition={isLoading ? {
        boxShadow: {
          duration: 1.5,
          repeat: Infinity,
          ease: "easeInOut"
        }
      } : {}}
      {...props}
    >
      {children}
    </motion.button>
  );
};
