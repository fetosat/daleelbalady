import React, { useEffect } from 'react';
import { motion, AnimatePresence, type Variants } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { usePathname } from 'next/navigation';
import { useChatbox } from '@/contexts/ChatboxContext';

interface FloatingChatboxProps {
  className?: string;
}

export const FloatingChatbox: React.FC<FloatingChatboxProps> = ({ className = '' }) => {
  const { t, i18n } = useTranslation();
  const pathname = usePathname();
  const isRTL = i18n.language === 'ar';
  
  const {
    chatQuery,
    handleChatQueryChange,
    aiMessage,
    isTyping,
    position,
    setPosition,
    isFocused,
    handleChatFocus,
    handleChatBlur,
    handleChatSubmit,
    isAnimating,
    setIsAnimating
  } = useChatbox();

  // Update position based on current route
  useEffect(() => {
    if (pathname === '/') {
      setPosition('hero');
    } else if (pathname.startsWith('/search')) {
      setPosition('search');
    } else {
      setPosition('floating');
    }
  }, [pathname, setPosition]);

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && chatQuery.trim()) {
      handleChatSubmit();
    }
  };

  // Use consistent positioning that can be animated
  const getPositionStyles = () => {
    return {
      position: 'fixed' as const,
      bottom: '24px',
      left: '50%',
      width: '90%',
      maxWidth: '800px',
      // Ensure chatbox is always above the blur overlay (z-[55])
      zIndex: position === 'hero' ? 60 : position === 'search' ? 70 : 60,
    };
  };


  const getAnimationVariants = (): Variants => ({
    initial: {
      opacity: 0,
      scale: 0.7,
      x: '-50%',
      y: 50,
    },
    animate: {
      opacity: 1,
      scale: isFocused ? 1 : 0.8, // Smaller when closed (0.8), full size when open (1)
      x: '-50%', // Always centered horizontally
      y: isFocused ? '-30vh' : 0, // Move up but not to full center (was -50vh)
      transition: {
        type: 'spring' as const,
        damping: 20,
        stiffness: 100,
      },
    },
    exit: {
      opacity: 0,
      scale: 0.7,
      x: '-50%',
      y: 50,
      transition: {
        duration: 0.4,
        ease: [0.55, 0.055, 0.675, 0.19], // Smooth exit curve
      },
    },
  });

  const getChatboxStyles = () => {
    const isHeroPosition = position === 'hero';
    const isSearchPosition = position === 'search';
    
    if (isHeroPosition) {
      return "w-full px-6 py-4 text-lg rounded-full bg-background/90 backdrop-blur-md border border-green-subtle focus:border-green-primary/30 focus:outline-none focus:ring-2 focus:ring-green-glow transition-all duration-500 focus:scale-105 hover:scale-102 text-text-primary placeholder:text-text-muted group-hover:shadow-lg z-20";
    }
    
    return "relative w-full px-6 py-4 bg-background/90 backdrop-blur-md border border-green-subtle rounded-full bg-transparent border-none focus:outline-none focus:ring-0 transition-all duration-300 focus:border-green-primary/30 focus:outline-none focus:ring-2 focus:ring-green-glow transition-all text-text-primary placeholder:text-text-muted/70 text-lg z-20";
  };

  const getBackgroundStyles = () => {
    const isHeroPosition = position === 'hero';
    const isSearchPosition = position === 'search';
    
    if (isSearchPosition) {
      return `absolute inset-0 bg-gradient-to-r from-background/60 via-background/80 to-background/60 backdrop-blur-xl rounded-full border border-white/10 shadow-2xl pointer-events-none transition-all duration-300 ${
        isTyping ? 'animate-pulse border-green-400/50' : ''
      }`;
    }
    
    if (isHeroPosition) {
      return "absolute inset-0 rounded-full bg-gradient-to-r from-green-subtle/10 to-green-subtle/20 opacity-60 group-hover:opacity-80 transition-opacity duration-300 pointer-events-none";
    }
    
    return "absolute inset-0 rounded-full bg-gradient-to-r from-green-subtle/5 to-green-subtle/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none";
  };

  const shouldShowTextOverlay = () => {
    return false; // Disable text overlay for cleaner look at bottom
  };

  const shouldShowAIMessage = () => {
    return (aiMessage || isTyping);
  };

  return (
    <>
      {/* Blur Overlay - appears when chat is focused */}
      <AnimatePresence>
        {isFocused && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-[45] backdrop-blur-md bg-black/20"
            onClick={handleChatBlur}
          />
        )}
      </AnimatePresence>

      <motion.div
        style={getPositionStyles()}
        variants={getAnimationVariants()}
        initial="initial"
        animate="animate"
        className={className}
      >
        <div className="relative group z-10">
        <div className="relative z-10">
          <div className="relative z-10">
            {/* Background for search position */}
            {position === 'search' && (
              <div className={getBackgroundStyles()} />
            )}
            
            <input
              type="text"
              placeholder={t('nav.chatPlaceholder')}
              value={chatQuery}
              onChange={(e) => handleChatQueryChange(e.target.value)}
              onFocus={handleChatFocus}
              onBlur={handleChatBlur}
              onKeyPress={handleKeyPress}
              className={getChatboxStyles()}
              style={{
                textAlign: isRTL ? 'right' : 'left',
                ...(position === 'hero' ? {
                  boxShadow: 'var(--shadow-strong)'
                } : {
                  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1), 0 0 0 1px rgba(255, 255, 255, 0.05)'
                })
              }}
              autoFocus={position === 'search' && isFocused}
            />
            
            {/* Animated text overlay for hero position */}
            {shouldShowTextOverlay() && (
              <motion.div
                initial={false}
                animate={{
                  opacity: chatQuery ? 1 : 0,
                }}
                className="absolute inset-0 px-6 py-4 text-lg text-text-primary pointer-events-none overflow-hidden"
                style={{ textAlign: isRTL ? 'right' : 'left' }}
              >
                <AnimatePresence mode="popLayout">
                  {chatQuery.split('').map((char, i) => (
                    <motion.span
                      key={i}
                      initial={{ opacity: 0, y: -20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{
                        opacity: 0,
                        y: 20,
                        filter: "blur(10px)",
                        transition: { duration: 0.2, ease: "easeOut" }
                      }}
                      transition={{
                        duration: 0.2,
                        delay: i * 0.02,
                        ease: "easeOut"
                      }}
                    >
                      {char}
                    </motion.span>
                  ))}
                </AnimatePresence>
              </motion.div>
            )}
          </div>
          
          {/* Background gradient for hero position */}
          {position === 'hero' && (
            <div className={getBackgroundStyles()} />
          )}

          {/* Subtle glow effect for search position */}
          {position === 'search' && (
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-green-primary/5 via-transparent to-green-primary/5 opacity-50 pointer-events-none" />
          )}

          {/* AI Message Popup */}
          <AnimatePresence>
            {shouldShowAIMessage() && (
              <motion.div
                initial={{ opacity: 0, y: -20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 20, scale: 0.95 }}
                className="absolute -top-24 left-0 right-0 bg-green-primary/10 backdrop-blur-md border border-green-primary/20 rounded-2xl p-4 shadow-lg"
              >
                <div className="flex items-start gap-3">
                  <motion.div
                    className="w-8 h-8 rounded-full bg-green-primary flex items-center justify-center flex-shrink-0"
                    animate={isTyping ? {
                      scale: [1, 1.1, 1],
                      opacity: [1, 0.7, 1],
                    } : {}}
                    transition={{
                      duration: 1,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  >
                    <span className="text-white font-bold text-sm">دب</span>
                  </motion.div>
                  <div className="flex-1 h-full overflow-hidden">
                    {isTyping ? (
                      <div className="flex items-center h-8 gap-1">
                        {[0, 1, 2].map((i) => (
                          <motion.div
                            key={i}
                            animate={{
                              opacity: [0, 1, 0],
                              y: [0, -4, 0]
                            }}
                            transition={{
                              duration: 0.8,
                              delay: i * 0.2,
                              repeat: Infinity,
                              repeatDelay: 0.2
                            }}
                            className="w-2 h-2 bg-green-primary rounded-full"
                          />
                        ))}
                      </div>
                    ) : (
                      <motion.p
                        initial={{ opacity: 0, height: 0 }}
                        animate={{
                          opacity: 1,
                          height: "auto",
                          transition: { duration: 0.3 }
                        }}
                        className="text-text-primary text-lg"
                        style={{ textAlign: isRTL ? 'right' : 'left' }}
                      >
                        {aiMessage.split('').map((char, i) => (
                          <motion.span
                            key={i}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{
                              duration: 0.2,
                              delay: i * 0.02,
                              ease: "easeOut"
                            }}
                          >
                            {char}
                          </motion.span>
                        ))}
                      </motion.p>
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
      </motion.div>
    </>
  );
};
