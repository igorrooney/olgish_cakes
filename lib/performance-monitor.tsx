/**
 * Performance monitoring utilities for tracking Core Web Vitals improvements
 */

import { useEffect } from "react";

interface PerformanceMetrics {
  fcp?: number;
  lcp?: number;
  fid?: number;
  cls?: number;
  inp?: number;
  ttfb?: number;
}

export function usePerformanceMonitor() {
  useEffect(() => {
    if (typeof window === "undefined") return;

    const metrics: PerformanceMetrics = {};

    // Track First Contentful Paint
    const observer = new PerformanceObserver(list => {
      for (const entry of list.getEntries()) {
        if (entry.name === "first-contentful-paint") {
          metrics.fcp = entry.startTime;
        }
      }
    });

    observer.observe({ entryTypes: ["paint"] });

    // Track Largest Contentful Paint
    const lcpObserver = new PerformanceObserver(list => {
      const entries = list.getEntries();
      const lastEntry = entries[entries.length - 1];
      metrics.lcp = lastEntry.startTime;
    });

    lcpObserver.observe({ entryTypes: ["largest-contentful-paint"] });

    // Track Cumulative Layout Shift
    let clsScore = 0;
    const clsObserver = new PerformanceObserver(list => {
      for (const entry of list.getEntries()) {
        if (!entry.hadRecentInput) {
          clsScore += (entry as any).value;
        }
      }
      metrics.cls = clsScore;
    });

    clsObserver.observe({ entryTypes: ["layout-shift"] });

    // Track Time to First Byte
    const navEntry = performance.getEntriesByType("navigation")[0] as PerformanceNavigationTiming;
    if (navEntry) {
      metrics.ttfb = navEntry.responseStart - navEntry.requestStart;
    }

    // Report metrics to analytics after page load
    const reportMetrics = () => {
      if (window.gtag && Object.keys(metrics).length > 0) {
        window.gtag("event", "web_vitals", {
          custom_map: {
            fcp: metrics.fcp,
            lcp: metrics.lcp,
            cls: metrics.cls,
            ttfb: metrics.ttfb,
          },
        });
      }
    };

    // Report metrics after a delay to ensure accuracy
    setTimeout(reportMetrics, 3000);

    return () => {
      observer.disconnect();
      lcpObserver.disconnect();
      clsObserver.disconnect();
    };
  }, []);
}

// Component to track interaction performance
export function InteractionMonitor({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    if (typeof window === "undefined") return;

    let interactionStart = 0;

    const trackInteractionStart = () => {
      interactionStart = performance.now();
    };

    const trackInteractionEnd = () => {
      if (interactionStart > 0) {
        const duration = performance.now() - interactionStart;

        // Track slow interactions (>100ms)
        if (duration > 100 && window.gtag) {
          window.gtag("event", "slow_interaction", {
            duration: Math.round(duration),
            interaction_type: "user_interaction",
          });
        }

        interactionStart = 0;
      }
    };

    document.addEventListener("pointerdown", trackInteractionStart);
    document.addEventListener("pointerup", trackInteractionEnd);
    document.addEventListener("keydown", trackInteractionStart);
    document.addEventListener("keyup", trackInteractionEnd);

    return () => {
      document.removeEventListener("pointerdown", trackInteractionStart);
      document.removeEventListener("pointerup", trackInteractionEnd);
      document.removeEventListener("keydown", trackInteractionStart);
      document.removeEventListener("keyup", trackInteractionEnd);
    };
  }, []);

  return <>{children}</>;
}

// Hook for measuring component render time
export function useRenderTimeMonitor(componentName: string) {
  useEffect(() => {
    const startTime = performance.now();

    return () => {
      const renderTime = performance.now() - startTime;

      // Track slow component renders (>16ms)
      if (renderTime > 16 && typeof window !== "undefined" && window.gtag) {
        window.gtag("event", "slow_render", {
          component: componentName,
          render_time: Math.round(renderTime),
        });
      }
    };
  }, [componentName]);
}
