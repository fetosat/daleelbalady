'use client';

import React, { useEffect, useRef, useState } from 'react';
import dynamic from 'next/dynamic';

// Dynamic import with no SSR to prevent hydration issues
const DynamicMapContainer = dynamic(
  () => import('react-leaflet').then((mod) => mod.MapContainer),
  { 
    ssr: false,
    loading: () => <div className="w-full h-full bg-muted animate-pulse rounded" />
  }
);

const DynamicTileLayer = dynamic(
  () => import('react-leaflet').then((mod) => mod.TileLayer),
  { ssr: false }
);

const DynamicMarker = dynamic(
  () => import('react-leaflet').then((mod) => mod.Marker),
  { ssr: false }
);

const DynamicPopup = dynamic(
  () => import('react-leaflet').then((mod) => mod.Popup),
  { ssr: false }
);

const DynamicCircle = dynamic(
  () => import('react-leaflet').then((mod) => mod.Circle),
  { ssr: false }
);

interface LeafletMapWrapperProps {
  center: [number, number];
  zoom: number;
  className?: string;
  scrollWheelZoom?: boolean;
  zoomControl?: boolean;
  style?: React.CSSProperties;
  children?: React.ReactNode;
}

/**
 * A wrapper around MapContainer that prevents double-initialization
 * by using dynamic imports and proper client-side rendering guards
 */
export default function LeafletMapWrapper({
  center,
  zoom,
  className = "w-full h-full",
  scrollWheelZoom = true,
  zoomControl = true,
  style,
  children,
  ...props
}: LeafletMapWrapperProps) {
  const [isMounted, setIsMounted] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Double-check that we're on the client and DOM is ready
    if (typeof window !== 'undefined' && containerRef.current) {
      const timer = setTimeout(() => setIsMounted(true), 100);
      return () => clearTimeout(timer);
    }
  }, []);

  // Don't render until we're sure we're client-side and mounted
  if (!isMounted || typeof window === 'undefined') {
    return (
      <div 
        ref={containerRef}
        className={className}
        style={style}
      >
        <div className="w-full h-full bg-muted animate-pulse rounded flex items-center justify-center">
          <div className="text-muted-foreground text-sm">Loading map...</div>
        </div>
      </div>
    );
  }

  return (
    <div ref={containerRef} className={className} style={style}>
      <DynamicMapContainer
        center={center}
        zoom={zoom}
        scrollWheelZoom={scrollWheelZoom}
        zoomControl={zoomControl}
        className="w-full h-full"
        {...props}
      >
        {children}
      </DynamicMapContainer>
    </div>
  );
}

// Export dynamic components for use in children
export {
  DynamicTileLayer as TileLayer,
  DynamicMarker as Marker, 
  DynamicPopup as Popup,
  DynamicCircle as Circle
};
