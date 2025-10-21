"use client";

import React, { useEffect, useState } from 'react';

interface NoSSRProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

/**
 * Component that only renders on the client-side to prevent hydration mismatches
 * for components that have different server and client behavior
 */
export const NoSSR: React.FC<NoSSRProps> = ({ 
  children, 
  fallback = null 
}) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Suppress hydration warnings for expected differences
  if (!mounted) {
    return <div suppressHydrationWarning>{fallback}</div>;
  }

  return <div suppressHydrationWarning>{children}</div>;
};
