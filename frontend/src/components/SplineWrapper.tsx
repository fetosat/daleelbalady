import { useEffect, useState, useRef } from 'react';
import { Loader2 } from 'lucide-react';
import Image from 'next/image';
import heroImage from '@/assets/hero-ai.jpg';

interface SplineWrapperProps {
  onLoad?: (splineApp: any) => void;
  onError?: (error: any) => void;
  scene: string;
  className?: string;
}

export function SplineWrapper({ onLoad, onError, scene, className = '' }: SplineWrapperProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [SplineComponent, setSplineComponent] = useState<any>(null);
  const mountRef = useRef(false);

  useEffect(() => {
    if (mountRef.current) return;
    mountRef.current = true;

    // Dynamically load Spline only on client-side
    const loadSpline = async () => {
      try {
        // Check if we're on the client side
        if (typeof window === 'undefined') {
          setIsLoading(false);
          setHasError(true);
          return;
        }

        // Add retry logic for chunk loading
        let retries = 3;
        let lastError: any;
        
        while (retries > 0) {
          try {
            const { default: Spline } = await import('@splinetool/react-spline');
            setSplineComponent(() => Spline);
            setIsLoading(false);
            return;
          } catch (chunkError) {
            lastError = chunkError;
            retries--;
            if (retries > 0) {
              // Wait before retry
              await new Promise(resolve => setTimeout(resolve, 1000));
            }
          }
        }
        
        // If all retries failed
        throw lastError;
      } catch (error) {
        console.warn('Spline loading failed, using fallback image:', error);
        setHasError(true);
        setIsLoading(false);
        // Don't call onError for chunk loading failures to prevent error propagation
        if (onError && !(error instanceof Error && error.message?.includes('chunk'))) {
          onError(error);
        }
      }
    };

    loadSpline();
  }, [onError]);

  const handleSplineLoad = (splineApp: any) => {
    try {
      if (onLoad) {
        onLoad(splineApp);
      }
    } catch (error) {
      console.error('Spline onLoad error:', error);
      setHasError(true);
      if (onError) {
        onError(error);
      }
    }
  };

  const handleSplineError = (error: any) => {
    console.error('Spline component error:', error);
    setHasError(true);
    if (onError) {
      onError(error);
    }
  };

  if (isLoading) {
    return (
      <div className={`w-full h-full flex items-center justify-center ${className}`}>
        <Loader2 className="w-8 h-8 animate-spin text-green-500" />
      </div>
    );
  }

  if (hasError || !SplineComponent) {
    return (
      <div className={`relative w-full h-full flex items-center justify-center ${className}`}>
        <Image
          src={heroImage}
          alt="AI Assistant"
          className="object-cover rounded-2xl"
          fill
          sizes="100vw"
          priority
        />
      </div>
    );
  }

  return (
    <div className={className}>
      <SplineComponent
        scene={scene}
        onLoad={handleSplineLoad}
        onError={handleSplineError}
      />
    </div>
  );
}
