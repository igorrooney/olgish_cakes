"use client";

import { useRef } from "react";

interface PerformanceMetrics {
  menuOpenTime: number;
  menuCloseTime: number;
  submenuToggleTime: number;
  navigationTime: number;
}

type Gtag = (
  command: "event",
  eventName: string,
  params?: Record<string, unknown>
) => void;

type WindowWithGtag = Window & {
  gtag?: Gtag;
};

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
      const gtag = typeof window !== "undefined" ? (window as WindowWithGtag).gtag : undefined;
      if (gtag) {
        gtag("event", "timing_complete", {
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
