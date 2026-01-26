"use client";

import { useState, useEffect } from "react";
import { breakpoints } from "@/lib/breakpoints";

/**
 * Hook to detect if the screen is desktop size (>= small-laptop breakpoint)
 * Returns true for desktop, false for mobile and tablet
 */
export function useIsDesktop() {
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    // Check if window is available (client-side)
    if (typeof window === "undefined") {
      return;
    }

    // Check initial size
    const checkIsDesktop = () => {
      // Use small-laptop breakpoint as the cutoff
      // Desktop: >= small-laptop
      // Mobile/Tablet: < small-laptop
      setIsDesktop(window.innerWidth >= breakpoints["small-laptop"]);
    };

    // Check on mount
    checkIsDesktop();

    // Add resize listener
    window.addEventListener("resize", checkIsDesktop);

    // Cleanup
    return () => {
      window.removeEventListener("resize", checkIsDesktop);
    };
  }, []);

  return isDesktop;
}
