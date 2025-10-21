import { useEffect, useState } from 'react'

// Dynamic imports to avoid build-time errors
let nextParams: any = null
let reactRouterParams: any = null

// Try to import Next.js params
try {
  const next = require('next/navigation')
  nextParams = next.useParams
} catch {}

// Try to import React Router params
try {
  const rr = require('react-router-dom')
  reactRouterParams = rr.useParams
} catch {}

// Compatibility hook that works with both Next.js and React Router
export function useParams<T = Record<string, string>>(): T {
  const [params, setParams] = useState<T>(() => {
    // Initialize with window params if available (for dynamic imports)
    if (typeof window !== 'undefined' && (window as any).__nextjsParams) {
      return (window as any).__nextjsParams as T
    }
    return {} as T
  })

  useEffect(() => {
    // Function to update params
    const updateParams = () => {
      // Try Next.js first
      if (nextParams) {
        try {
          const p = nextParams()
          setParams(p as T)
          return
        } catch {}
      }
      
      // Try React Router
      if (reactRouterParams) {
        try {
          const p = reactRouterParams()
          setParams(p as T)
          return
        } catch {}
      }
      
      // Fallback to window params if available
      if (typeof window !== 'undefined' && (window as any).__nextjsParams) {
        setParams((window as any).__nextjsParams as T)
      }
    }

    updateParams()

    // Poll for window params updates (needed for dynamic imports)
    if (typeof window !== 'undefined') {
      const interval = setInterval(() => {
        if ((window as any).__nextjsParams) {
          setParams((window as any).__nextjsParams as T)
          clearInterval(interval)
        }
      }, 50)

      // Clean up after 2 seconds
      setTimeout(() => clearInterval(interval), 2000)

      return () => clearInterval(interval)
    }
  }, [])

  return params
}
