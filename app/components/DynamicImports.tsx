"use client";

import dynamic from "next/dynamic";
import { Suspense } from "react";
import { Box, CircularProgress } from "@/lib/mui-optimization";

// Loading component for dynamic imports
function DynamicLoading() {
  return (
    <Box display="flex" justifyContent="center" alignItems="center" p={2}>
      <CircularProgress size={24} />
    </Box>
  );
}

// Dynamic imports for heavy components
export const DynamicContactForm = dynamic(
  () => import("./ContactForm").then(mod => ({ default: mod.ContactForm })),
  {
    loading: DynamicLoading,
    ssr: false, // Disable SSR for forms to reduce bundle size
  }
);

export const DynamicQuoteForm = dynamic(
  () => import("../get-custom-quote/QuoteForm").then(mod => ({ default: mod.QuoteForm })),
  {
    loading: DynamicLoading,
    ssr: false,
  }
);

export const DynamicCakeImageGallery = dynamic(
  () => import("./CakeImageGallery").then(mod => ({ default: mod.CakeImageGallery })),
  {
    loading: DynamicLoading,
    ssr: true,
  }
);

export const DynamicTestimonialsList = dynamic(
  () => import("../testimonials/TestimonialsList").then(mod => ({ default: mod.TestimonialsList })),
  {
    loading: DynamicLoading,
    ssr: true,
  }
);

export const DynamicCookieConsent = dynamic(
  () => import("./CookieConsent").then(mod => ({ default: mod.default })),
  {
    loading: () => null, // No loading indicator for cookie consent
    ssr: false,
  }
);

export const DynamicDevTools = dynamic(
  () => import("./DevTools").then(mod => ({ default: mod.DevTools })),
  {
    loading: () => null,
    ssr: false,
  }
);

// Wrapper component for dynamic imports with Suspense
export function DynamicComponentWrapper({
  children,
  fallback = <DynamicLoading />,
}: {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}) {
  return <Suspense fallback={fallback}>{children}</Suspense>;
}
