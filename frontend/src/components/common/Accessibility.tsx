import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeOff, Volume2, VolumeX, Type, Contrast, Moon, Sun, ArrowUp, Keyboard, MousePointer } from 'lucide-react';

// Skip Links Component
export const SkipLinks: React.FC = () => (
  <div className="sr-only focus-within:not-sr-only">
    <a
      href="#main-content"
      className="fixed top-0 left-0 z-50 bg-blue-600 text-white px-4 py-2 rounded-br-lg focus:outline-none focus:ring-2 focus:ring-blue-300"
    >
      تخطي إلى المحتوى الرئيسي
    </a>
    <a
      href="#navigation"
      className="fixed top-12 left-0 z-50 bg-blue-600 text-white px-4 py-2 rounded-br-lg focus:outline-none focus:ring-2 focus:ring-blue-300"
    >
      تخطي إلى القائمة
    </a>
  </div>
);

// Live Region for Screen Readers
export const LiveRegion: React.FC<{
  message: string;
  politeness?: 'polite' | 'assertive' | 'off';
  atomic?: boolean;
}> = ({ message, politeness = 'polite', atomic = true }) => (
  <div
    className="sr-only"
    aria-live={politeness}
    aria-atomic={atomic}
    role="status"
  >
    {message}
  </div>
);

// Focus Trap Hook
export const useFocusTrap = (isActive: boolean) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isActive || !containerRef.current) return;

    const container = containerRef.current;
    const focusableElements = container.querySelectorAll(
      'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
    );

    const firstElement = focusableElements[0] as HTMLElement;
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

    const handleTabKey = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement?.focus();
        }
      } else {
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement?.focus();
        }
      }
    };

    const handleEscapeKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        // Custom escape handler can be added here
      }
    };

    document.addEventListener('keydown', handleTabKey);
    document.addEventListener('keydown', handleEscapeKey);

    // Focus first element when trap becomes active
    firstElement?.focus();

    return () => {
      document.removeEventListener('keydown', handleTabKey);
      document.removeEventListener('keydown', handleEscapeKey);
    };
  }, [isActive]);

  return containerRef;
};

// Accessibility Settings Context
interface AccessibilitySettings {
  highContrast: boolean;
  largeText: boolean;
  reducedMotion: boolean;
  darkMode: boolean;
  screenReader: boolean;
  keyboardNavigation: boolean;
  fontSize: number;
  announcements: boolean;
}

const defaultSettings: AccessibilitySettings = {
  highContrast: false,
  largeText: false,
  reducedMotion: false,
  darkMode: false,
  screenReader: false,
  keyboardNavigation: false,
  fontSize: 16,
  announcements: true
};

// Accessibility Toolbar
export const AccessibilityToolbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [settings, setSettings] = useState<AccessibilitySettings>(defaultSettings);
  const [liveMessage, setLiveMessage] = useState('');

  useEffect(() => {
    // Load settings from localStorage
    const savedSettings = localStorage.getItem('accessibility-settings');
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings));
    }

    // Apply initial settings to document
    applySettings(settings);
  }, []);

  const updateSetting = useCallback((key: keyof AccessibilitySettings, value: any) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    localStorage.setItem('accessibility-settings', JSON.stringify(newSettings));
    applySettings(newSettings);
    
    // Announce change to screen readers
    setLiveMessage(`تم ${key === 'highContrast' ? 'تفعيل التباين العالي' : 
                    key === 'largeText' ? 'تكبير النص' :
                    key === 'darkMode' ? 'تفعيل الوضع المظلم' :
                    key === 'reducedMotion' ? 'تقليل الحركة' :
                    'تحديث الإعدادات'}`);
  }, [settings]);

  const applySettings = (newSettings: AccessibilitySettings) => {
    const root = document.documentElement;
    
    // High contrast
    root.classList.toggle('high-contrast', newSettings.highContrast);
    
    // Large text
    root.classList.toggle('large-text', newSettings.largeText);
    
    // Reduced motion
    root.classList.toggle('reduced-motion', newSettings.reducedMotion);
    
    // Dark mode
    root.classList.toggle('dark', newSettings.darkMode);
    
    // Font size
    root.style.fontSize = `${newSettings.fontSize}px`;
  };

  const resetSettings = () => {
    setSettings(defaultSettings);
    localStorage.removeItem('accessibility-settings');
    applySettings(defaultSettings);
    setLiveMessage('تم إعادة تعيين إعدادات إمكانية الوصول');
  };

  return (
    <>
      <LiveRegion message={liveMessage} />
      
      {/* Accessibility Button */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-4 right-4 z-40 bg-blue-600 text-white p-3 rounded-full shadow-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-300"
        aria-label="فتح إعدادات إمكانية الوصول"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
      >
        <Eye className="w-6 h-6" />
      </motion.button>

      {/* Accessibility Panel */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-50 z-50"
              onClick={() => setIsOpen(false)}
            />

            {/* Panel */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              className="fixed right-0 top-0 h-full w-80 bg-white shadow-2xl z-50 overflow-y-auto"
              role="dialog"
              aria-labelledby="accessibility-title"
              aria-modal="true"
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 id="accessibility-title" className="text-xl font-bold">
                    إعدادات إمكانية الوصول
                  </h2>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="text-gray-500 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-300 rounded"
                    aria-label="إغلاق الإعدادات"
                  >
                    <EyeOff className="w-6 h-6" />
                  </button>
                </div>

                <div className="space-y-6">
                  {/* Visual Settings */}
                  <div>
                    <h3 className="font-semibold mb-4 flex items-center gap-2">
                      <Eye className="w-5 h-5" />
                      الإعدادات البصرية
                    </h3>
                    
                    <div className="space-y-4">
                      {/* High Contrast */}
                      <label className="flex items-center justify-between">
                        <span className="flex items-center gap-2">
                          <Contrast className="w-4 h-4" />
                          تباين عالي
                        </span>
                        <input
                          type="checkbox"
                          checked={settings.highContrast}
                          onChange={(e) => updateSetting('highContrast', e.target.checked)}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                      </label>

                      {/* Dark Mode */}
                      <label className="flex items-center justify-between">
                        <span className="flex items-center gap-2">
                          {settings.darkMode ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
                          الوضع المظلم
                        </span>
                        <input
                          type="checkbox"
                          checked={settings.darkMode}
                          onChange={(e) => updateSetting('darkMode', e.target.checked)}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                      </label>

                      {/* Large Text */}
                      <label className="flex items-center justify-between">
                        <span className="flex items-center gap-2">
                          <Type className="w-4 h-4" />
                          نص كبير
                        </span>
                        <input
                          type="checkbox"
                          checked={settings.largeText}
                          onChange={(e) => updateSetting('largeText', e.target.checked)}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                      </label>

                      {/* Font Size Slider */}
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          حجم الخط: {settings.fontSize}px
                        </label>
                        <input
                          type="range"
                          min="12"
                          max="24"
                          value={settings.fontSize}
                          onChange={(e) => updateSetting('fontSize', parseInt(e.target.value))}
                          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Motion Settings */}
                  <div>
                    <h3 className="font-semibold mb-4">إعدادات الحركة</h3>
                    
                    <label className="flex items-center justify-between">
                      <span>تقليل الحركة والانتقالات</span>
                      <input
                        type="checkbox"
                        checked={settings.reducedMotion}
                        onChange={(e) => updateSetting('reducedMotion', e.target.checked)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                    </label>
                  </div>

                  {/* Navigation Settings */}
                  <div>
                    <h3 className="font-semibold mb-4 flex items-center gap-2">
                      <Keyboard className="w-5 h-5" />
                      إعدادات التنقل
                    </h3>
                    
                    <div className="space-y-4">
                      <label className="flex items-center justify-between">
                        <span>تنقل بلوحة المفاتيح</span>
                        <input
                          type="checkbox"
                          checked={settings.keyboardNavigation}
                          onChange={(e) => updateSetting('keyboardNavigation', e.target.checked)}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                      </label>

                      <label className="flex items-center justify-between">
                        <span>الإعلانات الصوتية</span>
                        <input
                          type="checkbox"
                          checked={settings.announcements}
                          onChange={(e) => updateSetting('announcements', e.target.checked)}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                      </label>
                    </div>
                  </div>

                  {/* Reset Button */}
                  <button
                    onClick={resetSettings}
                    className="w-full bg-gray-100 text-gray-800 py-3 px-4 rounded-lg hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-300 transition-colors"
                  >
                    إعادة تعيين الإعدادات
                  </button>

                  {/* Keyboard Shortcuts Info */}
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h4 className="font-medium mb-2">اختصارات لوحة المفاتيح:</h4>
                    <ul className="text-sm space-y-1 text-gray-700">
                      <li><kbd className="bg-gray-200 px-1 rounded">Tab</kbd> للتنقل</li>
                      <li><kbd className="bg-gray-200 px-1 rounded">Enter</kbd> للتفعيل</li>
                      <li><kbd className="bg-gray-200 px-1 rounded">Esc</kbd> للإغلاق</li>
                      <li><kbd className="bg-gray-200 px-1 rounded">Alt + A</kbd> لفتح هذه القائمة</li>
                    </ul>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

// Back to Top Button with Accessibility
export const BackToTop: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      if (window.pageYOffset > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener('scroll', toggleVisibility);
    return () => window.removeEventListener('scroll', toggleVisibility);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.button
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          onClick={scrollToTop}
          className="fixed bottom-20 left-4 z-40 bg-gray-800 text-white p-3 rounded-full shadow-lg hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-300"
          aria-label="العودة إلى أعلى الصفحة"
        >
          <ArrowUp className="w-5 h-5" />
        </motion.button>
      )}
    </AnimatePresence>
  );
};

// Accessible Modal Hook
export const useAccessibleModal = (isOpen: boolean) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const previousActiveElement = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (isOpen) {
      previousActiveElement.current = document.activeElement as HTMLElement;
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
      previousActiveElement.current?.focus();
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  return { modalRef, focusTrapRef: useFocusTrap(isOpen) };
};

// Screen Reader Only Text
export const ScreenReaderOnly: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <span className="sr-only">{children}</span>
);

// Accessible Button with Loading State
export const AccessibleButton: React.FC<{
  children: React.ReactNode;
  loading?: boolean;
  disabled?: boolean;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  type?: 'button' | 'submit' | 'reset';
  ariaLabel?: string;
  className?: string;
}> = ({
  children,
  loading = false,
  disabled = false,
  onClick,
  variant = 'primary',
  size = 'md',
  type = 'button',
  ariaLabel,
  className = ''
}) => {
  const variantClasses = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500',
    secondary: 'bg-gray-100 text-gray-900 hover:bg-gray-200 focus:ring-gray-500',
    danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500'
  };

  const sizeClasses = {
    sm: 'px-3 py-2 text-sm',
    md: 'px-4 py-3 text-base',
    lg: 'px-6 py-4 text-lg'
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      aria-label={ariaLabel}
      aria-busy={loading}
      className={`
        inline-flex items-center justify-center gap-2 rounded-lg font-medium
        transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2
        disabled:opacity-50 disabled:cursor-not-allowed
        ${variantClasses[variant]} ${sizeClasses[size]} ${className}
      `}
    >
      {loading && (
        <>
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-4 h-4 border-2 border-current border-t-transparent rounded-full"
          />
          <ScreenReaderOnly>جاري التحميل...</ScreenReaderOnly>
        </>
      )}
      {children}
    </button>
  );
};

export default AccessibilityToolbar;
