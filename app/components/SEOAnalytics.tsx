"use client";

import { useEffect } from "react";

// Type declarations for Performance API
interface PerformanceEventTiming extends PerformanceEntry {
  processingStart: number;
  startTime: number;
}

interface SEOAnalyticsProps {
  pageType: string;
  pageTitle: string;
  pageUrl: string;
  keywords?: string[];
  category?: string;
}

export function SEOAnalytics({
  pageType,
  pageTitle,
  pageUrl,
  keywords = [],
  category,
}: SEOAnalyticsProps) {
  useEffect(() => {
    // Track page view for SEO analytics
    trackPageView();

    // Track user engagement metrics
    trackUserEngagement();

    // Track Core Web Vitals
    trackCoreWebVitals();

    // Track scroll depth
    trackScrollDepth();

    // Track time on page
    trackTimeOnPage();
  }, [pageType, pageTitle, pageUrl]);

  const trackPageView = () => {
    // Send page view data to analytics
    if (typeof window !== "undefined" && (window as any).gtag) {
      (window as any).gtag("config", "G-XXXXXXXXXX", {
        page_title: pageTitle,
        page_location: pageUrl,
        custom_map: {
          custom_dimension1: pageType,
          custom_dimension2: category,
          custom_dimension3: keywords.join(","),
        },
      });
    }
  };

  const trackUserEngagement = () => {
    let startTime = Date.now();
    let maxScrollDepth = 0;
    let isPageVisible = true;

    // Track scroll depth
    const handleScroll = () => {
      const scrollTop = window.pageYOffset;
      const docHeight = document.body.scrollHeight - window.innerHeight;
      const scrollPercent = (scrollTop / docHeight) * 100;

      if (scrollPercent > maxScrollDepth) {
        maxScrollDepth = scrollPercent;
      }
    };

    // Track page visibility
    const handleVisibilityChange = () => {
      isPageVisible = !document.hidden;
    };

    // Track user interactions
    const handleUserInteraction = () => {
      // Track clicks, form submissions, etc.
      if (typeof window !== "undefined" && (window as any).gtag) {
        (window as any).gtag("event", "user_interaction", {
          event_category: "engagement",
          event_label: pageType,
          value: 1,
        });
      }
    };

    // Add event listeners
    window.addEventListener("scroll", handleScroll);
    document.addEventListener("visibilitychange", handleVisibilityChange);
    document.addEventListener("click", handleUserInteraction);
    document.addEventListener("submit", handleUserInteraction);

    // Cleanup
    return () => {
      window.removeEventListener("scroll", handleScroll);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      document.removeEventListener("click", handleUserInteraction);
      document.removeEventListener("submit", handleUserInteraction);
    };
  };

  const trackCoreWebVitals = () => {
    if ("performance" in window) {
      // Track LCP (Largest Contentful Paint)
      const lcpObserver = new PerformanceObserver(list => {
        const entries = list.getEntries();
        entries.forEach(entry => {
          if (entry.entryType === "largest-contentful-paint") {
            const lcp = entry.startTime;

            // Send to analytics
            if (typeof window !== "undefined" && (window as any).gtag) {
              (window as any).gtag("event", "core_web_vitals", {
                event_category: "web_vitals",
                event_label: "LCP",
                value: Math.round(lcp),
                custom_parameter: {
                  page_type: pageType,
                  page_url: pageUrl,
                },
              });
            }
          }
        });
      });

      lcpObserver.observe({ entryTypes: ["largest-contentful-paint"] });

      // Track FID (First Input Delay)
      const fidObserver = new PerformanceObserver(list => {
        const entries = list.getEntries();
        entries.forEach(entry => {
          if (entry.entryType === "first-input") {
            const fidEntry = entry as PerformanceEventTiming;
            const fid = fidEntry.processingStart - fidEntry.startTime;

            // Send to analytics
            if (typeof window !== "undefined" && (window as any).gtag) {
              (window as any).gtag("event", "core_web_vitals", {
                event_category: "web_vitals",
                event_label: "FID",
                value: Math.round(fid),
                custom_parameter: {
                  page_type: pageType,
                  page_url: pageUrl,
                },
              });
            }
          }
        });
      });

      fidObserver.observe({ entryTypes: ["first-input"] });

      // Track CLS (Cumulative Layout Shift)
      let clsValue = 0;
      const clsObserver = new PerformanceObserver(list => {
        const entries = list.getEntries();
        entries.forEach(entry => {
          if (entry.entryType === "layout-shift" && !(entry as any).hadRecentInput) {
            clsValue += (entry as any).value;

            // Send to analytics when CLS is significant
            if (clsValue > 0.1) {
              if (typeof window !== "undefined" && (window as any).gtag) {
                (window as any).gtag("event", "core_web_vitals", {
                  event_category: "web_vitals",
                  event_label: "CLS",
                  value: Math.round(clsValue * 1000) / 1000,
                  custom_parameter: {
                    page_type: pageType,
                    page_url: pageUrl,
                  },
                });
              }
            }
          }
        });
      });

      clsObserver.observe({ entryTypes: ["layout-shift"] });
    }
  };

  const trackScrollDepth = () => {
    let maxScrollDepth = 0;
    let scrollEvents = 0;

    const handleScroll = () => {
      const scrollTop = window.pageYOffset;
      const docHeight = document.body.scrollHeight - window.innerHeight;
      const scrollPercent = (scrollTop / docHeight) * 100;

      if (scrollPercent > maxScrollDepth) {
        maxScrollDepth = scrollPercent;
        scrollEvents++;

        // Track significant scroll milestones
        if (scrollPercent >= 25 && scrollEvents === 1) {
          trackScrollMilestone(25);
        } else if (scrollPercent >= 50 && scrollEvents === 1) {
          trackScrollMilestone(50);
        } else if (scrollPercent >= 75 && scrollEvents === 1) {
          trackScrollMilestone(75);
        } else if (scrollPercent >= 90 && scrollEvents === 1) {
          trackScrollMilestone(90);
        }
      }
    };

    const trackScrollMilestone = (milestone: number) => {
      if (typeof window !== "undefined" && (window as any).gtag) {
        (window as any).gtag("event", "scroll_depth", {
          event_category: "engagement",
          event_label: `${milestone}%_scroll`,
          value: milestone,
          custom_parameter: {
            page_type: pageType,
            page_url: pageUrl,
            scroll_depth: milestone,
          },
        });
      }
    };

    window.addEventListener("scroll", handleScroll);

    return () => window.removeEventListener("scroll", handleScroll);
  };

  const trackTimeOnPage = () => {
    const startTime = Date.now();

    const sendTimeOnPage = () => {
      const timeOnPage = Date.now() - startTime;

      if (typeof window !== "undefined" && (window as any).gtag) {
        (window as any).gtag("event", "time_on_page", {
          event_category: "engagement",
          event_label: pageType,
          value: Math.round(timeOnPage / 1000), // Convert to seconds
          custom_parameter: {
            page_type: pageType,
            page_url: pageUrl,
            time_on_page_seconds: Math.round(timeOnPage / 1000),
          },
        });
      }
    };

    // Track when user leaves the page
    window.addEventListener("beforeunload", sendTimeOnPage);

    // Track when page becomes hidden
    document.addEventListener("visibilitychange", () => {
      if (document.hidden) {
        sendTimeOnPage();
      }
    });

    return () => {
      window.removeEventListener("beforeunload", sendTimeOnPage);
    };
  };

  return null; // This component doesn't render anything
}
