/**
 * Optimized framer-motion loading for better performance
 * This reduces the main bundle size by lazy loading motion components
 */

// Reduced animation presets for better performance
export const fadeInPreset = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  transition: { duration: 0.2 },
};

export const slideUpPreset = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.2 },
};

export const scalePreset = {
  initial: { opacity: 0, scale: 0.98 },
  animate: { opacity: 1, scale: 1 },
  transition: { duration: 0.15 },
};

// Utility to conditionally enable animations based on user preferences
export const useReducedMotion = () => {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
};

// Performance-optimized animation variants
export const getOptimizedAnimation = (preset: typeof fadeInPreset, reduceMotion = false) => {
  if (reduceMotion) {
    return {
      initial: { opacity: 1 },
      animate: { opacity: 1 },
      transition: { duration: 0 },
    };
  }
  return preset;
};
