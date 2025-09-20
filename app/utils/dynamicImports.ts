// Dynamic imports utility - temporarily disabled for build
// import dynamic from "next/dynamic";
// import { ComponentType } from "react";

// Optimized dynamic imports for better performance
export const dynamicImports = {
  // Heavy components that should be loaded on demand
  // CakeImageGallery: dynamic(() => import("@/app/components/CakeImageGallery"), {
  //   loading: () => <div className="animate-pulse bg-gray-200 h-64 rounded" />,
  //   ssr: false,
  // }),
  
  // ContactForm: dynamic(() => import("@/app/components/ContactForm"), {
  //   loading: () => <div className="animate-pulse bg-gray-200 h-48 rounded" />,
  //   ssr: false,
  // }),
  
  // TrustpilotReviews: dynamic(() => import("@/app/components/TrustpilotReviews"), {
  //   loading: () => <div className="animate-pulse bg-gray-200 h-32 rounded" />,
  //   ssr: false,
  // }),
  
  // Blog components
  // BlogClient: dynamic(() => import("@/app/blog/BlogClient"), {
  //   loading: () => <div className="animate-pulse bg-gray-200 h-64 rounded" />,
  //   ssr: false,
  // }),
  
  // Admin components
  // AdminGuard: dynamic(() => import("@/app/components/AdminGuard"), {
  //   loading: () => <div className="animate-pulse bg-gray-200 h-32 rounded" />,
  //   ssr: false,
  // }),
};

// Utility function for creating optimized dynamic imports
// export function createOptimizedImport<T = any>(
//   importFn: () => Promise<{ default: ComponentType<T> }>,
//   options: {
//     loading?: ComponentType;
//     ssr?: boolean;
//     delay?: number;
//   } = {}
// ) {
//   return dynamic(importFn, {
//     loading: options.loading || (() => <div className="animate-pulse bg-gray-200 h-32 rounded" />),
//     ssr: options.ssr ?? false,
//     ...options,
//   });
// }

// Preload critical components
export function preloadComponents() {
  if (typeof window !== "undefined") {
    // Preload components that are likely to be needed
    // import("@/app/components/Header");
    // import("@/app/components/Footer");
    // import("@/app/components/CakeCard");
  }
}
