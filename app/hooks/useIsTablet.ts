"use client"

import { useState, useEffect } from "react"
import { breakpoints } from "@/lib/breakpoints"

/**
 * Hook to detect if the screen is tablet size (>= tablet and < small-laptop breakpoint)
 * Returns true for tablet, false for mobile or desktop
 */
export function useIsTablet() {
  const [isTablet, setIsTablet] = useState(false)

  useEffect(() => {
    // Check if window is available (client-side)
    if (typeof window === "undefined") {
      return
    }

    // Check initial size
    const checkIsTablet = () => {
      // Tablet: >= 1024px (tablet) and < 1280px (small-laptop)
      const width = window.innerWidth
      setIsTablet(width >= breakpoints.tablet && width < breakpoints["small-laptop"])
    }

    // Check on mount
    checkIsTablet()

    // Add resize listener
    window.addEventListener("resize", checkIsTablet)

    // Cleanup
    return () => {
      window.removeEventListener("resize", checkIsTablet)
    }
  }, [])

  return isTablet
}

