// Performance optimization utilities for Core Web Vitals

export interface ImageOptimizationOptions {
  priority?: boolean;
  loading?: 'lazy' | 'eager';
  sizes?: string;
  quality?: number;
  placeholder?: 'blur' | 'empty';
  blurDataURL?: string;
}

export const imageOptimization = {
  // Generate responsive image sizes for different breakpoints
  generateSizes: (isHero: boolean = false) => {
    if (isHero) {
      return '(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 70vw';
    }
    return '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw';
  },

  // Generate blur placeholder for images
  generateBlurDataURL: (width: number = 10, height: number = 10) => {
    const canvas = typeof window !== 'undefined' ? document.createElement('canvas') : null;
    if (!canvas) return '';
    
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) return '';
    
    // Create a simple gradient blur
    const gradient = ctx.createLinearGradient(0, 0, width, height);
    gradient.addColorStop(0, '#f3f4f6');
    gradient.addColorStop(1, '#e5e7eb');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);
    
    return canvas.toDataURL('image/jpeg', 0.1);
  },

  // Preload critical images
  preloadCriticalImages: (imageUrls: string[]) => {
    if (typeof window === 'undefined') return;
    
    imageUrls.forEach((url) => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'image';
      link.href = url;
      document.head.appendChild(link);
    });
  },

  // Lazy load images with intersection observer
  setupLazyLoading: () => {
    if (typeof window === 'undefined') return;
    
    const images = document.querySelectorAll('img[data-src]');
    if (images.length === 0) return;
    
    const imageObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const img = entry.target as HTMLImageElement;
          img.src = img.dataset.src || '';
          img.classList.remove('lazy');
          imageObserver.unobserve(img);
        }
      });
    }, {
      rootMargin: '50px 0px', // Start loading 50px before image comes into view
      threshold: 0.01
    });
    
    images.forEach((img) => imageObserver.observe(img));
  }
};

export const fontOptimization = {
  // Preload critical fonts
  preloadFonts: (fontUrls: string[]) => {
    if (typeof window === 'undefined') return;
    
    fontUrls.forEach((url) => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'font';
      link.type = 'font/woff2';
      link.crossOrigin = 'anonymous';
      link.href = url;
      document.head.appendChild(link);
    });
  },

  // Optimize font display
  optimizeFontDisplay: () => {
    if (typeof window === 'undefined') return;
    
    // Add font-display: swap to all font faces
    const style = document.createElement('style');
    style.textContent = `
      @font-face {
        font-family: 'Alice';
        font-display: swap;
      }
    `;
    document.head.appendChild(style);
  }
};

export const resourceOptimization = {
  // Preload critical resources
  preloadCriticalResources: () => {
    if (typeof window === 'undefined') return;
    
    const criticalResources: Array<{ href: string; as: string; type?: string; crossOrigin?: string }> = [
      { href: '/images/olgish-cakes-logo-bakery-brand.png', as: 'image' },
      { href: '/android-chrome-192x192.png', as: 'image' }
      // Font loading is handled automatically by Next.js next/font/google
    ];
    
    criticalResources.forEach((resource) => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.href = resource.href;
      link.as = resource.as;
      if (resource.type) link.type = resource.type;
      if (resource.crossOrigin) link.crossOrigin = resource.crossOrigin;
      document.head.appendChild(link);
    });
  },

  // Defer non-critical resources
  deferNonCriticalResources: () => {
    if (typeof window === 'undefined') return;
    
    // Defer loading of non-critical scripts
    const scripts = document.querySelectorAll('script[data-defer]');
    scripts.forEach((script) => {
      script.setAttribute('defer', '');
    });
  }
};

export const performanceMonitoring = {
  // Monitor Core Web Vitals
  monitorWebVitals: (callback: (metric: any) => void) => {
    if (typeof window === 'undefined') return;
    
    import('web-vitals').then(({ onCLS, onINP, onFCP, onLCP, onTTFB }) => {
      onCLS(callback);
      onINP(callback); // INP replaced FID in web-vitals v3+
      onFCP(callback);
      onLCP(callback);
      onTTFB(callback);
    });
  },

  // Performance budget monitoring
  checkPerformanceBudget: () => {
    if (typeof window === 'undefined') return;
    
    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    const paint = performance.getEntriesByType('paint');
    
    const metrics = {
      fcp: paint.find(entry => entry.name === 'first-contentful-paint')?.startTime || 0,
      lcp: 0, // Will be set by LCP observer
      fid: 0, // Will be set by FID observer
      cls: 0, // Will be set by CLS observer
      ttfb: navigation.responseStart - navigation.requestStart,
      domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
      loadComplete: navigation.loadEventEnd - navigation.loadEventStart
    };
    
    // Performance budget thresholds
    const budget = {
      fcp: 1800, // 1.8s
      lcp: 2500, // 2.5s
      fid: 100,  // 100ms
      cls: 0.1,  // 0.1
      ttfb: 600, // 600ms
      domContentLoaded: 1000, // 1s
      loadComplete: 2000 // 2s
    };
    
    // Check against budget
    Object.entries(metrics).forEach(([key, value]) => {
      if (value > budget[key as keyof typeof budget]) {
        console.warn(`Performance budget exceeded for ${key}: ${value}ms (budget: ${budget[key as keyof typeof budget]}ms)`);
      }
    });
    
    return metrics;
  }
};

// Initialize all optimizations
export const initializePerformanceOptimizations = () => {
  if (typeof window === 'undefined') return;
  
  // Run optimizations when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      imageOptimization.setupLazyLoading();
      resourceOptimization.preloadCriticalResources();
      fontOptimization.optimizeFontDisplay();
      resourceOptimization.deferNonCriticalResources();
    });
  } else {
    imageOptimization.setupLazyLoading();
    resourceOptimization.preloadCriticalResources();
    fontOptimization.optimizeFontDisplay();
    resourceOptimization.deferNonCriticalResources();
  }
};
