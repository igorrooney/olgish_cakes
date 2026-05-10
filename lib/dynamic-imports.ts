/**
 * Centralized dynamic imports for better code splitting and performance
 */

import React from "react";
import dynamic from "next/dynamic";

// Lazy load heavy components
export const LazyContactForm = dynamic(
  () => import("@/app/components/ContactForm").then(mod => ({ default: mod.ContactForm })),
  {
    loading: () =>
      React.createElement(
        "div",
        { className: "animate-pulse bg-gray-200 h-64 rounded-lg" },
        "Loading form..."
      ),
    ssr: false,
  }
);

export const LazyOrderModal = dynamic(
  () => import("@/app/cakes/[slug]/OrderModal").then(mod => ({ default: mod.OrderModal })),
  {
    loading: () => React.createElement("div", null, "Loading order form..."),
    ssr: false,
  }
);

export const LazyTrustpilotReviews = dynamic(
  () =>
    import("@/app/components/TrustpilotReviews").then(mod => ({ default: mod.TrustpilotReviews })),
  {
    loading: () =>
      React.createElement(
        "div",
        { className: "bg-gray-100 h-32 rounded-lg animate-pulse" },
        "Loading reviews..."
      ),
    ssr: false,
  }
);

export const LazyAnimatedWrapper = dynamic(() => import("@/app/components/AnimatedWrapper"), {
  loading: () => React.createElement("div", null),
  ssr: false,
});

export const LazyDaisyComponents = {
  Rating: dynamic(() => import("@/lib/daisy-ui").then(mod => ({ default: mod.Rating })), {
    loading: () =>
      React.createElement("div", { className: "h-6 w-24 bg-gray-100 rounded animate-pulse" }),
    ssr: false,
  }),
  Accordion: dynamic(() => import("@/lib/daisy-ui").then(mod => ({ default: mod.Accordion })), {
    loading: () =>
      React.createElement("div", { className: "h-16 bg-gray-100 rounded animate-pulse" }),
    ssr: false,
  }),
  AccordionSummary: dynamic(
    () => import("@/lib/daisy-ui").then(mod => ({ default: mod.AccordionSummary })),
    {
      loading: () =>
        React.createElement("div", { className: "h-12 bg-gray-100 rounded animate-pulse" }),
      ssr: false,
    }
  ),
  AccordionDetails: dynamic(
    () => import("@/lib/daisy-ui").then(mod => ({ default: mod.AccordionDetails })),
    {
      loading: () =>
        React.createElement("div", { className: "h-8 bg-gray-100 rounded animate-pulse" }),
      ssr: false,
    }
  ),
};
