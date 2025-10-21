import { useEffect, useState, useCallback } from 'react'

// Dynamic imports to avoid build-time errors
let nextRouter: any = null
let reactRouterNavigate: any = null
let reactRouterLocation: any = null

// Try to import Next.js router
try {
  const next = require('next/navigation')
  nextRouter = next.useRouter
} catch {}

// Try to import React Router
try {
  const rr = require('react-router-dom')
  reactRouterNavigate = rr.useNavigate
  reactRouterLocation = rr.useLocation
} catch {}

// Compatibility hook for navigation
export function useNavigate() {
  const [router, setRouter] = useState<any>(null)
  const [rrNavigate, setRrNavigate] = useState<any>(null)

  useEffect(() => {
    // Try Next.js router
    if (nextRouter) {
      try {
        const r = nextRouter()
        setRouter(r)
        return
      } catch {}
    }
    
    // Try React Router
    if (reactRouterNavigate) {
      try {
        const nav = reactRouterNavigate()
        setRrNavigate(() => nav)
      } catch {}
    }
  }, [])

  return useCallback((path: string) => {
    if (router) {
      router.push(path)
    } else if (rrNavigate) {
      rrNavigate(path)
    } else if (typeof window !== 'undefined') {
      window.location.href = path
    }
  }, [router, rrNavigate])
}

// Compatibility hook for location
export function useLocation() {
  const [location, setLocation] = useState(() => {
    if (typeof window !== 'undefined') {
      return {
        pathname: window.location.pathname,
        search: window.location.search,
        hash: window.location.hash,
        state: null,
        key: 'default'
      }
    }
    return {
      pathname: '/',
      search: '',
      hash: '',
      state: null,
      key: 'default'
    }
  })

  useEffect(() => {
    // Try React Router
    if (reactRouterLocation) {
      try {
        const loc = reactRouterLocation()
        setLocation(loc)
      } catch {}
    }
  }, [])

  return location
}
