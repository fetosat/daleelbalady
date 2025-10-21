import { useState, useEffect } from 'react';

interface DeviceInfo {
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  isIOS: boolean;
  isAndroid: boolean;
  isTouchDevice: boolean;
  screenSize: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  connectionSpeed: 'slow' | 'medium' | 'fast';
  isLowPowerMode: boolean;
  preferredMotion: 'full' | 'reduced';
}

export function useDeviceOptimization(): DeviceInfo {
  const [deviceInfo, setDeviceInfo] = useState<DeviceInfo>({
    isMobile: false,
    isTablet: false,
    isDesktop: true,
    isIOS: false,
    isAndroid: false,
    isTouchDevice: false,
    screenSize: 'lg',
    connectionSpeed: 'fast',
    isLowPowerMode: false,
    preferredMotion: 'full'
  });

  useEffect(() => {
    const detectDevice = () => {
      const width = window.innerWidth;
      const userAgent = navigator.userAgent.toLowerCase();
      
      // Detect device type
      const isMobile = width < 768;
      const isTablet = width >= 768 && width < 1024;
      const isDesktop = width >= 1024;
      
      // Detect OS
      const isIOS = /iphone|ipad|ipod/.test(userAgent);
      const isAndroid = /android/.test(userAgent);
      
      // Detect touch capability
      const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
      
      // Detect screen size
      let screenSize: 'xs' | 'sm' | 'md' | 'lg' | 'xl' = 'lg';
      if (width < 375) screenSize = 'xs';
      else if (width < 640) screenSize = 'sm';
      else if (width < 768) screenSize = 'md';
      else if (width < 1024) screenSize = 'lg';
      else screenSize = 'xl';
      
      // Detect connection speed (if available)
      let connectionSpeed: 'slow' | 'medium' | 'fast' = 'fast';
      if ('connection' in navigator) {
        const connection = (navigator as any).connection;
        if (connection?.effectiveType) {
          if (connection.effectiveType === 'slow-2g' || connection.effectiveType === '2g') {
            connectionSpeed = 'slow';
          } else if (connection.effectiveType === '3g') {
            connectionSpeed = 'medium';
          }
        }
      }
      
      // Detect low power mode (battery API if available)
      let isLowPowerMode = false;
      if ('getBattery' in navigator) {
        (navigator as any).getBattery().then((battery: any) => {
          isLowPowerMode = battery.level < 0.2 && !battery.charging;
        });
      }
      
      // Detect motion preference
      const preferredMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
        ? 'reduced' 
        : 'full';
      
      setDeviceInfo({
        isMobile,
        isTablet,
        isDesktop,
        isIOS,
        isAndroid,
        isTouchDevice,
        screenSize,
        connectionSpeed,
        isLowPowerMode,
        preferredMotion
      });
    };
    
    detectDevice();
    window.addEventListener('resize', detectDevice);
    
    return () => {
      window.removeEventListener('resize', detectDevice);
    };
  }, []);
  
  return deviceInfo;
}

// Performance optimization hook
export function usePerformanceOptimization() {
  const device = useDeviceOptimization();
  
  const shouldReduceMotion = 
    device.preferredMotion === 'reduced' || 
    device.connectionSpeed === 'slow' ||
    device.isLowPowerMode;
    
  const shouldUseLowQualityImages = 
    device.connectionSpeed === 'slow' ||
    device.isLowPowerMode;
    
  const shouldLazyLoad = 
    device.isMobile ||
    device.connectionSpeed !== 'fast';
    
  const maxAnimationDuration = 
    shouldReduceMotion ? 200 : 
    device.isMobile ? 300 : 
    500;
    
  return {
    shouldReduceMotion,
    shouldUseLowQualityImages,
    shouldLazyLoad,
    maxAnimationDuration,
    device
  };
}

// Viewport hook for optimized rendering
export function useViewportOptimization() {
  const [isInViewport, setIsInViewport] = useState<Set<string>>(new Set());
  
  const observe = (elementId: string, threshold = 0.1) => {
    useEffect(() => {
      const element = document.getElementById(elementId);
      if (!element) return;
      
      const observer = new IntersectionObserver(
        ([entry]) => {
          setIsInViewport(prev => {
            const newSet = new Set(prev);
            if (entry.isIntersecting) {
              newSet.add(elementId);
            } else {
              newSet.delete(elementId);
            }
            return newSet;
          });
        },
        { threshold }
      );
      
      observer.observe(element);
      
      return () => {
        observer.disconnect();
      };
    }, [elementId, threshold]);
  };
  
  return {
    isInViewport,
    observe,
    isVisible: (elementId: string) => isInViewport.has(elementId)
  };
}

// Touch gestures hook
export function useTouchGestures(elementRef: React.RefObject<HTMLElement>) {
  const [gesture, setGesture] = useState<'none' | 'swipe-left' | 'swipe-right' | 'swipe-up' | 'swipe-down'>('none');
  
  useEffect(() => {
    if (!elementRef.current) return;
    
    let startX = 0;
    let startY = 0;
    let endX = 0;
    let endY = 0;
    
    const handleTouchStart = (e: TouchEvent) => {
      startX = e.touches[0].clientX;
      startY = e.touches[0].clientY;
    };
    
    const handleTouchEnd = (e: TouchEvent) => {
      endX = e.changedTouches[0].clientX;
      endY = e.changedTouches[0].clientY;
      
      const deltaX = endX - startX;
      const deltaY = endY - startY;
      const threshold = 50;
      
      if (Math.abs(deltaX) > Math.abs(deltaY)) {
        if (deltaX > threshold) {
          setGesture('swipe-right');
        } else if (deltaX < -threshold) {
          setGesture('swipe-left');
        }
      } else {
        if (deltaY > threshold) {
          setGesture('swipe-down');
        } else if (deltaY < -threshold) {
          setGesture('swipe-up');
        }
      }
      
      setTimeout(() => setGesture('none'), 100);
    };
    
    const element = elementRef.current;
    element.addEventListener('touchstart', handleTouchStart);
    element.addEventListener('touchend', handleTouchEnd);
    
    return () => {
      element.removeEventListener('touchstart', handleTouchStart);
      element.removeEventListener('touchend', handleTouchEnd);
    };
  }, [elementRef]);
  
  return gesture;
}

// Scroll position hook with throttling
export function useScrollPosition() {
  const [scrollPosition, setScrollPosition] = useState({
    x: 0,
    y: 0,
    direction: 'none' as 'up' | 'down' | 'none'
  });
  
  useEffect(() => {
    let lastScrollY = window.scrollY;
    let ticking = false;
    
    const updateScrollPosition = () => {
      const currentScrollY = window.scrollY;
      const direction = currentScrollY > lastScrollY ? 'down' : 'up';
      
      setScrollPosition({
        x: window.scrollX,
        y: currentScrollY,
        direction
      });
      
      lastScrollY = currentScrollY;
      ticking = false;
    };
    
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(updateScrollPosition);
        ticking = true;
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);
  
  return scrollPosition;
}
