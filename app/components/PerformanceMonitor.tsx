"use client";

import { useEffect, useRef } from "react";

interface PerformanceMetrics {
  menuOpenTime: number;
  menuCloseTime: number;
  submenuToggleTime: number;
  navigationTime: number;
}

export function usePerformanceMonitor() {
  const metricsRef = useRef<PerformanceMetrics>({
    menuOpenTime: 0,
    menuCloseTime: 0,
    submenuToggleTime: 0,
    navigationTime: 0,
  });

  const startTimer = (metric: keyof PerformanceMetrics) => {
    const startTime = performance.now();
    return () => {
      const endTime = performance.now();
      metricsRef.current[metric] = endTime - startTime;

      // Log performance metrics in development
      if (process.env.NODE_ENV === "development") {
        console.warn(`Performance: ${metric} took ${metricsRef.current[metric].toFixed(2)}ms`);
      }

      // Send to analytics if available
      if (typeof window !== "undefined" && (window as any).gtag) {
        (window as any).gtag("event", "timing_complete", {
          name: metric,
          value: Math.round(metricsRef.current[metric]),
          event_category: "Mobile Menu Performance",
        });
      }
    };
  };

  const getMetrics = () => metricsRef.current;

  return {
    startTimer,
    getMetrics,
  };
}
