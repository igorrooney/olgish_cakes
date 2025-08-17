/**
 * Centralized dynamic imports for better code splitting and performance
 */

import dynamic from "next/dynamic";

// Lazy load heavy components
export const LazyContactForm = dynamic(
  () => import("@/app/components/ContactForm").then(mod => ({ default: mod.ContactForm })),
  {
    loading: () => <div className="animate-pulse bg-gray-200 h-64 rounded-lg">Loading form...</div>,
    ssr: false,
  }
);

export const LazyOrderModal = dynamic(
  () => import("@/app/cakes/[slug]/OrderModal").then(mod => ({ default: mod.OrderModal })),
  {
    loading: () => <div>Loading order form...</div>,
    ssr: false,
  }
);

export const LazyTrustpilotReviews = dynamic(
  () => import("@/app/components/TrustpilotReviews").then(mod => ({ default: mod.TrustpilotReviews })),
  {
    loading: () => <div className="bg-gray-100 h-32 rounded-lg animate-pulse">Loading reviews...</div>,
    ssr: false,
  }
);

export const LazyAnimatedWrapper = dynamic(
  () => import("@/app/components/AnimatedWrapper"),
  {
    loading: () => <div />,
    ssr: false,
  }
);

// Lazy load framer-motion for better initial bundle size
export const LazyMotion = {
  div: dynamic(() => import("framer-motion").then(mod => mod.motion.div), {
    loading: () => <div />,
    ssr: false,
  }),
  section: dynamic(() => import("framer-motion").then(mod => mod.motion.section), {
    loading: () => <section />,
    ssr: false,
  }),
  create: dynamic(() => import("framer-motion").then(mod => mod.motion.create), {
    loading: () => ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
    ssr: false,
  }),
};

// Optimized MUI component loading
export const LazyMuiComponents = {
  Pagination: dynamic(() => import("@mui/material/Pagination"), {
    loading: () => <div className="h-12 bg-gray-100 rounded animate-pulse" />,
    ssr: false,
  }),
  Rating: dynamic(() => import("@mui/material/Rating"), {
    loading: () => <div className="h-6 w-24 bg-gray-100 rounded animate-pulse" />,
    ssr: false,
  }),
  Accordion: dynamic(() => import("@mui/material/Accordion"), {
    loading: () => <div className="h-16 bg-gray-100 rounded animate-pulse" />,
    ssr: false,
  }),
  AccordionSummary: dynamic(() => import("@mui/material/AccordionSummary"), {
    loading: () => <div className="h-12 bg-gray-100 rounded animate-pulse" />,
    ssr: false,
  }),
  AccordionDetails: dynamic(() => import("@mui/material/AccordionDetails"), {
    loading: () => <div className="h-8 bg-gray-100 rounded animate-pulse" />,
    ssr: false,
  }),
};
