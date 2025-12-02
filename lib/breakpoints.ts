/**
 * Breakpoint values matching Tailwind config screens
 * These should be kept in sync with tailwind.config.cjs
 */
export const breakpoints = {
  mobile: 390,
  tablet: 1024,
  "small-laptop": 1280,
  "large-laptop": 1512,
} as const;

/**
 * Get the pixel value for a breakpoint
 */
export function getBreakpointValue(breakpoint: keyof typeof breakpoints): number {
  return breakpoints[breakpoint];
}


