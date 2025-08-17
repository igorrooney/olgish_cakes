/**
 * Optimized framer-motion loading for better performance
 * This reduces the main bundle size by lazy loading motion components
 */

import dynamic from "next/dynamic";

// Lazy load motion components with low priority
export const LazyMotionDiv = dynamic(
  () => import("framer-motion").then(mod => mod.motion.div),
  {
    loading: () => <div />,
    ssr: false,
  }
);

export const LazyMotionSection = dynamic(
  () => import("framer-motion").then(mod => mod.motion.section),
  {
    loading: () => <section />,
    ssr: false,
  }
);

export const LazyMotionCard = dynamic(
  () => import("framer-motion").then(mod => ({ default: mod.motion.create })),
  {
    loading: () => ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
    ssr: false,
  }
);

// Reduced animation presets for better performance
export const fadeInPreset = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  transition: { duration: 0.2 }
};

export const slideUpPreset = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.2 }
};

export const scalePreset = {
  initial: { opacity: 0, scale: 0.98 },
  animate: { opacity: 1, scale: 1 },
  transition: { duration: 0.15 }
};

// Utility to conditionally enable animations based on user preferences
export const useReducedMotion = () => {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
};

// Performance-optimized animation variants
export const getOptimizedAnimation = (preset: typeof fadeInPreset) => {
  const reduceMotion = useReducedMotion();
  if (reduceMotion) {
    return {
      initial: { opacity: 1 },
      animate: { opacity: 1 },
      transition: { duration: 0 }
    };
  }
  return preset;
};
