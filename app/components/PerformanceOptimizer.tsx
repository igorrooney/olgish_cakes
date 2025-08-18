"use client";

import { useEffect } from "react";

// Type declarations for Performance API
interface PerformanceEventTiming extends PerformanceEntry {
  processingStart: number;
  startTime: number;
}

interface LayoutShift extends PerformanceEntry {
  value: number;
  hadRecentInput: boolean;
}

interface PerformanceOptimizerProps {
  pageType?: "home" | "product" | "service" | "content";
  priority?: "high" | "medium" | "low";
}

export function PerformanceOptimizer({
  pageType = "content",
  priority = "medium",
}: PerformanceOptimizerProps) {
  useEffect(() => {
    // Performance monitoring and optimization
    if (typeof window !== "undefined") {
      // Preload critical resources based on page type
      if (pageType === "home") {
        preloadCriticalResources();
      }

      // Optimize for mobile performance
      if (window.innerWidth <= 768) {
        optimizeForMobile();
      }

      // Monitor Core Web Vitals
      monitorCoreWebVitals();

      // Optimize images based on connection speed
      optimizeImagesForConnection();
    }
  }, [pageType, priority]);

  const preloadCriticalResources = () => {
    // Preload critical CSS and fonts
    const criticalResources = [
      "/fonts/alice-v20-latin-regular.woff2",
      "/images/olgish-cakes-logo-bakery-brand.png",
    ];

    criticalResources.forEach(resource => {
      const link = document.createElement("link");
      link.rel = "preload";
      link.href = resource;
      link.as = resource.includes(".woff2") ? "font" : "image";
      link.crossOrigin = "anonymous";
      document.head.appendChild(link);
    });
  };

  const optimizeForMobile = () => {
    // Reduce animations on mobile for better performance
    document.documentElement.style.setProperty("--animation-duration", "0.2s");

    // Optimize touch targets
    document.documentElement.style.setProperty("--touch-target-size", "44px");
  };

  const monitorCoreWebVitals = () => {
    if ("performance" in window) {
      // Monitor Largest Contentful Paint (LCP)
      const observer = new PerformanceObserver(list => {
        const entries = list.getEntries();
        entries.forEach(entry => {
          if (entry.entryType === "largest-contentful-paint") {
            console.log("LCP:", entry.startTime);

            // Send to analytics if LCP is poor
            if (entry.startTime > 2500) {
              console.warn("Poor LCP detected:", entry.startTime);
            }
          }
        });
      });

      observer.observe({ entryTypes: ["largest-contentful-paint"] });

      // Monitor First Input Delay (FID)
      const fidObserver = new PerformanceObserver(list => {
        const entries = list.getEntries();
        entries.forEach(entry => {
          if (entry.entryType === "first-input") {
            const fidEntry = entry as PerformanceEventTiming;
            console.log("FID:", fidEntry.processingStart - fidEntry.startTime);

            // Send to analytics if FID is poor
            if (fidEntry.processingStart - fidEntry.startTime > 100) {
              console.warn("Poor FID detected:", fidEntry.processingStart - fidEntry.startTime);
            }
          }
        });
      });

      fidObserver.observe({ entryTypes: ["first-input"] });

      // Monitor Cumulative Layout Shift (CLS)
      let clsValue = 0;
      const clsObserver = new PerformanceObserver(list => {
        const entries = list.getEntries();
        entries.forEach(entry => {
          if (entry.entryType === "layout-shift") {
            const clsEntry = entry as LayoutShift;
            if (!clsEntry.hadRecentInput) {
              clsValue += clsEntry.value;
              console.log("CLS:", clsValue);

              // Send to analytics if CLS is poor
              if (clsValue > 0.1) {
                console.warn("Poor CLS detected:", clsValue);
              }
            }
          }
        });
      });

      clsObserver.observe({ entryTypes: ["layout-shift"] });
    }
  };

  const optimizeImagesForConnection = () => {
    if ("connection" in navigator) {
      const connection = (navigator as any).connection;

      if (connection.effectiveType === "slow-2g" || connection.effectiveType === "2g") {
        // Reduce image quality for slow connections
        document.documentElement.style.setProperty("--image-quality", "low");
        document.documentElement.style.setProperty("--lazy-loading", "aggressive");
      } else if (connection.effectiveType === "3g") {
        // Medium quality for 3G
        document.documentElement.style.setProperty("--image-quality", "medium");
        document.documentElement.style.setProperty("--lazy-loading", "moderate");
      } else {
        // High quality for fast connections
        document.documentElement.style.setProperty("--image-quality", "high");
        document.documentElement.style.setProperty("--lazy-loading", "lazy");
      }
    }
  };

  return null; // This component doesn't render anything
}
