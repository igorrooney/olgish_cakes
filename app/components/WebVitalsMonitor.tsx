'use client'

import { useEffect } from 'react'

interface WebVitalsMetric {
  name: string
  value: number
  delta: number
  id: string
  navigationType: string
}

export function WebVitalsMonitor() {
  useEffect(() => {
    // Only run in production
    if (process.env.NODE_ENV !== 'production') return

    let cancelled = false

    // Core Web Vitals monitoring
    const reportWebVitals = (metric: WebVitalsMetric) => {
      // Send to analytics service (Google Analytics, Vercel Analytics, etc.)
      if (typeof window !== 'undefined' && window.gtag) {
        window.gtag('event', metric.name, {
          event_category: 'Web Vitals',
          event_label: metric.id,
          value: Math.round(metric.name === 'CLS' ? metric.value * 1000 : metric.value),
          non_interaction: true
        })
      }
    }

    void import('web-vitals')
      .then(({ onCLS, onINP, onFCP, onLCP, onTTFB }) => {
        if (cancelled) {
          return
        }

        onCLS(reportWebVitals)
        onINP(reportWebVitals) // INP replaced FID in web-vitals v3+
        onFCP(reportWebVitals)
        onLCP(reportWebVitals)
        onTTFB(reportWebVitals)
      })
      .catch((error) => {
        console.warn('Failed to load web-vitals:', error)
      })

    return () => {
      cancelled = true
    }
  }, [])

  return null
}

// Performance optimization utilities
export const performanceOptimizations = {
  // Debounce function for performance
  debounce: <T extends (...args: unknown[]) => unknown>(func: T, wait: number) => {
    let timeout: NodeJS.Timeout
    return function executedFunction(...args: Parameters<T>) {
      const later = () => {
        clearTimeout(timeout)
        func(...args)
      }
      clearTimeout(timeout)
      timeout = setTimeout(later, wait)
    }
  },

  // Throttle function for performance
  throttle: <T extends (...args: unknown[]) => unknown>(func: T, limit: number) => {
    let inThrottle: boolean
    return function executedFunction(this: unknown, ...args: Parameters<T>) {
      if (!inThrottle) {
        func.apply(this, args)
        inThrottle = true
        setTimeout(() => {
          inThrottle = false
        }, limit)
      }
    }
  },

  // Check if element is in viewport
  isInViewport: (element: Element) => {
    const rect = element.getBoundingClientRect()
    return (
      rect.top >= 0 &&
      rect.left >= 0 &&
      rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
      rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    )
  }
}
