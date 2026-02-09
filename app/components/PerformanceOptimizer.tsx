"use client";

import { useEffect } from "react";

export function PerformanceOptimizer() {
  useEffect(() => {
    // Note: Next.js Image component with priority prop handles preloading efficiently
    // Manual preloading is not needed and can cause "unused preload" warnings
    // Critical images are handled by Next.js Image's built-in optimization

    // Optimize scroll performance
    const optimizeScroll = () => {
      let ticking = false;

      const updateScrollPosition = () => {
        // Use requestAnimationFrame for smooth scrolling
        if (!ticking) {
          requestAnimationFrame(() => {
            ticking = false;
          });
          ticking = true;
        }
      };

      window.addEventListener("scroll", updateScrollPosition, { passive: true });

      return () => {
        window.removeEventListener("scroll", updateScrollPosition);
      };
    };

    // Optimize image loading
    const optimizeImages = () => {
      const images = document.querySelectorAll("img[data-src]");

      const imageObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const img = entry.target as HTMLImageElement;
            img.src = img.dataset.src || "";
            img.classList.remove("lazy");
            imageObserver.unobserve(img);
          }
        });
      }, {
        rootMargin: "50px 0px",
        threshold: 0.01,
      });

      images.forEach((img) => imageObserver.observe(img));

      return () => {
        images.forEach((img) => imageObserver.unobserve(img));
      };
    };

    // Initialize optimizations
    const cleanupScroll = optimizeScroll();
    const cleanupImages = optimizeImages();

    // Cleanup on unmount
    return () => {
      cleanupScroll();
      cleanupImages();
    };
  }, []);

  return null;
}
