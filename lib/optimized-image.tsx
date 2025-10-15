/**
 * Optimized image component for better Core Web Vitals performance
 */

import Image from "next/image";
import { useState, useCallback, memo, useEffect } from "react";
import { Box } from "@mui/material";

interface OptimizedImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  fill?: boolean;
  sizes?: string;
  priority?: boolean;
  className?: string;
  onLoad?: () => void;
  onError?: () => void;
  placeholder?: "blur" | "empty";
  blurDataURL?: string;
  quality?: number;
}

export const OptimizedImage = memo(function OptimizedImage({
  src,
  alt,
  width,
  height,
  fill = false,
  sizes = "(max-width: 768px) 100vw, 50vw",
  priority = false,
  className,
  onLoad,
  onError,
  placeholder = "blur",
  blurDataURL = "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q==",
  quality = 85,
}: OptimizedImageProps) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  const handleLoad = useCallback(() => {
    setImageLoaded(true);
    onLoad?.();
  }, [onLoad]);

  const handleError = useCallback(() => {
    setImageError(true);
    onError?.();
  }, [onError]);

  if (imageError) {
    return (
      <Box
        sx={{
          width: fill ? "100%" : width,
          height: fill ? "100%" : height,
          backgroundColor: "#f5f5f5",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#666",
          fontSize: "14px",
        }}
        className={className}
      >
        Image unavailable
      </Box>
    );
  }

  const imageProps = {
    src,
    alt,
    onLoad: handleLoad,
    onError: handleError,
    className,
    quality,
    placeholder,
    blurDataURL,
    loading: priority ? ("eager" as const) : ("lazy" as const),
    ...(fill
      ? {
          fill: true,
          sizes,
        }
      : {
          width,
          height,
        }),
  };

  return (
    <>
      <Image {...imageProps} alt={alt} />
      {!imageLoaded && (
        <Box
          sx={{
            position: fill ? "absolute" : "static",
            inset: fill ? 0 : undefined,
            width: fill ? "100%" : width,
            height: fill ? "100%" : height,
            backgroundColor: "#f5f5f5",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1,
          }}
        >
          <Box
            sx={{
              width: 20,
              height: 20,
              border: "2px solid #e0e0e0",
              borderTop: "2px solid #2196f3",
              borderRadius: "50%",
              animation: "spin 1s linear infinite",
              "@keyframes spin": {
                "0%": { transform: "rotate(0deg)" },
                "100%": { transform: "rotate(360deg)" },
              },
            }}
          />
        </Box>
      )}
    </>
  );
});

// Higher-order component for intersection observer based lazy loading
export function withIntersectionObserver<T extends { src: string }>(
  Component: React.ComponentType<T>
) {
  return memo(function IntersectionObserverWrapper(props: T) {
    const [isVisible, setIsVisible] = useState(false);
    const [ref, setRef] = useState<HTMLDivElement | null>(null);

    const observerCallback = useCallback((entries: IntersectionObserverEntry[]) => {
      const [entry] = entries;
      if (entry.isIntersecting) {
        setIsVisible(true);
      }
    }, []);

    useEffect(() => {
      if (!ref) return;

      const observer = new IntersectionObserver(observerCallback, {
        threshold: 0.1,
        rootMargin: "50px",
      });

      observer.observe(ref);

      return () => observer.disconnect();
    }, [ref, observerCallback]);

    return (
      <div ref={setRef}>
        {isVisible ? (
          <Component {...props} />
        ) : (
          <Box
            sx={{
              width: "100%",
              height: 200,
              backgroundColor: "#f5f5f5",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            Loading...
          </Box>
        )}
      </div>
    );
  });
}

export const LazyOptimizedImage = withIntersectionObserver(OptimizedImage);
