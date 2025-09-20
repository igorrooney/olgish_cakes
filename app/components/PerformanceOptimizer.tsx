"use client";

import { useEffect } from "react";

export function PerformanceOptimizer() {
  useEffect(() => {
    // Preload critical resources
    const preloadCriticalImages = () => {
      const criticalImages = [
        "/images/olgish-cakes-logo-bakery-brand.png",
        "/images/hero-cake.jpg",
        "/images/cake-hero-banner.jpg",
      ];

      criticalImages.forEach((src) => {
        const link = document.createElement("link");
        link.rel = "preload";
        link.as = "image";
        link.href = src;
        link.crossOrigin = "anonymous";
        document.head.appendChild(link);
      });
    };

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
    preloadCriticalImages();
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

// Critical CSS inlining component
export function CriticalCSS() {
  return (
    <style
      dangerouslySetInnerHTML={{
        __html: `
          /* Critical above-the-fold styles */
          body { margin: 0; font-family: system-ui, -apple-system, sans-serif; }
          .container { max-width: 1200px; margin: 0 auto; padding: 0 1rem; }
          .hero { min-height: 60vh; display: flex; align-items: center; }
          .btn { padding: 0.75rem 1.5rem; border: none; border-radius: 0.5rem; cursor: pointer; }
          .btn-primary { background: #2E3192; color: white; }
          
          /* Prevent layout shift */
          img { max-width: 100%; height: auto; }
          .lazy { opacity: 0; transition: opacity 0.3s; }
          .lazy.loaded { opacity: 1; }
          
          /* Smooth scrolling */
          html { scroll-behavior: smooth; }
          
          /* Performance optimizations */
          * { box-sizing: border-box; }
          .gpu-accelerated { transform: translateZ(0); will-change: transform; }
        `,
      }}
    />
  );
}