"use client";

import { useCallback } from "react";

interface AnalyticsEvent {
  event: string;
  category: string;
  action: string;
  label?: string;
  value?: number;
}

export function useAnalytics() {
  const trackEvent = useCallback((eventData: AnalyticsEvent) => {
    // Google Analytics 4 event tracking
    if (typeof window !== "undefined" && (window as any).gtag) {
      (window as any).gtag("event", eventData.event, {
        event_category: eventData.category,
        event_label: eventData.label,
        value: eventData.value,
      });
    }

    // Console logging for development - intentionally empty for now
  }, []);

  const trackMobileMenuInteraction = useCallback(
    (action: string, label?: string) => {
      trackEvent({
        event: "mobile_menu_interaction",
        category: "Navigation",
        action,
        label,
      });
    },
    [trackEvent]
  );

  const trackNavigation = useCallback(
    (from: string, to: string) => {
      trackEvent({
        event: "navigation",
        category: "User Journey",
        action: "page_navigation",
        label: `${from} -> ${to}`,
      });
    },
    [trackEvent]
  );

  return {
    trackEvent,
    trackMobileMenuInteraction,
    trackNavigation,
  };
}
