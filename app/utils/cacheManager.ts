import { clearCache, invalidateCache } from "./fetchCakes";

// Development cache management utilities
export class CacheManager {
  private static instance: CacheManager;
  private cacheClearInterval: NodeJS.Timeout | null = null;

  static getInstance(): CacheManager {
    if (!CacheManager.instance) {
      CacheManager.instance = new CacheManager();
    }
    return CacheManager.instance;
  }

  // Auto-clear cache in development every 30 seconds
  startAutoCacheClear(): void {
    const shouldAutoClear = process.env.NODE_ENV === "development" &&
      process.env.NEXT_PUBLIC_AGGRESSIVE_CACHE_CLEAR === "true";

    if (shouldAutoClear) {
      this.cacheClearInterval = setInterval(() => {
        clearCache();
      }, 30 * 1000); // Every 30 seconds
    }
  }

  // Stop auto cache clearing
  stopAutoCacheClear(): void {
    if (this.cacheClearInterval) {
      clearInterval(this.cacheClearInterval);
      this.cacheClearInterval = null;
    }
  }

  // Manual cache clear
  async clearAllCache(): Promise<void> {
    await invalidateCache();

    // Force clear browser cache by adding timestamp to URLs
    if (typeof window !== 'undefined') {
      // Clear localStorage cache
      const keys = Object.keys(localStorage);
      keys.forEach(key => {
        if (key.includes('cache') || key.includes('Cache')) {
          localStorage.removeItem(key);
        }
      });

      // Clear sessionStorage cache
      const sessionKeys = Object.keys(sessionStorage);
      sessionKeys.forEach(key => {
        if (key.includes('cache') || key.includes('Cache')) {
          sessionStorage.removeItem(key);
        }
      });

    }
  }

  // Clear specific pattern
  async clearCachePattern(pattern: string): Promise<void> {
    await invalidateCache(pattern);
  }

  // Get cache status
  getCacheStatus(): { isAutoClearing: boolean; interval: number | null } {
    return {
      isAutoClearing: this.cacheClearInterval !== null,
      interval: this.cacheClearInterval ? 30000 : null,
    };
  }
}

// Export singleton instance
export const cacheManager = CacheManager.getInstance();

// Development helper - start auto cache clearing
if (process.env.NODE_ENV === "development" && process.env.NEXT_PUBLIC_AGGRESSIVE_CACHE_CLEAR === "true") {
  cacheManager.startAutoCacheClear();
}
