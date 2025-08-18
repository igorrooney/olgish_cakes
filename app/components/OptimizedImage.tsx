"use client";

import Image from "next/image";
import { useState, useEffect } from "react";
import { Box, Skeleton } from "@mui/material";

interface OptimizedImageProps {
  src: string;
  alt: string;
  width: number;
  height: number;
  priority?: boolean;
  className?: string;
  sizes?: string;
  quality?: number;
  placeholder?: "blur" | "empty";
  blurDataURL?: string;
  onLoad?: () => void;
  onError?: () => void;
  loading?: "lazy" | "eager";
  decoding?: "async" | "sync" | "auto";
  fetchPriority?: "high" | "low" | "auto";
}

export function OptimizedImage({
  src,
  alt,
  width,
  height,
  priority = false,
  className,
  sizes,
  quality = 85,
  placeholder = "empty",
  blurDataURL,
  onLoad,
  onError,
  loading = "lazy",
  decoding = "async",
  fetchPriority = "auto",
}: OptimizedImageProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [imageSrc, setImageSrc] = useState(src);

  useEffect(() => {
    // Optimize image source based on device and connection
    optimizeImageSource();
  }, [src]);

  const optimizeImageSource = () => {
    if (typeof window !== "undefined") {
      const isRetina = window.devicePixelRatio > 1;
      const isMobile = window.innerWidth <= 768;

      // Adjust quality based on device capabilities
      if (isRetina && !isMobile) {
        // High quality for retina displays
        setImageSrc(src.replace(/\.(jpg|jpeg|png|webp)/, "@2x.$1"));
      } else if (isMobile) {
        // Lower quality for mobile devices
        setImageSrc(src.replace(/\.(jpg|jpeg|png|webp)/, "-mobile.$1"));
      } else {
        setImageSrc(src);
      }
    }
  };

  const handleLoad = () => {
    setIsLoading(false);
    onLoad?.();
  };

  const handleError = () => {
    setHasError(true);
    setIsLoading(false);
    onError?.();

    // Fallback to original source
    if (imageSrc !== src) {
      setImageSrc(src);
    }
  };

  // Generate structured data for the image
  const generateImageSchema = () => {
    return {
      "@context": "https://schema.org",
      "@type": "ImageObject",
      contentUrl: imageSrc,
      name: alt,
      description: alt,
      width: width,
      height: height,
      encodingFormat: imageSrc.split(".").pop()?.toUpperCase() || "JPEG",
      uploadDate: new Date().toISOString(),
      creator: {
        "@type": "Organization",
        name: "Olgish Cakes",
        url: "https://olgishcakes.co.uk",
      },
    };
  };

  if (hasError) {
    return (
      <Box
        sx={{
          width,
          height,
          backgroundColor: "#f5f5f5",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#666",
          fontSize: "0.875rem",
        }}
      >
        Image not available
      </Box>
    );
  }

  return (
    <>
      {/* Structured Data for Image */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(generateImageSchema()),
        }}
      />

      <Box sx={{ position: "relative", width, height }}>
        {isLoading && (
          <Skeleton
            variant="rectangular"
            width={width}
            height={height}
            animation="wave"
            sx={{
              position: "absolute",
              top: 0,
              left: 0,
              zIndex: 1,
            }}
          />
        )}

        <Image
          src={imageSrc}
          alt={alt}
          width={width}
          height={height}
          priority={priority}
          className={className}
          sizes={sizes}
          quality={quality}
          placeholder={placeholder}
          blurDataURL={blurDataURL}
          onLoad={handleLoad}
          onError={handleError}
          loading={loading}
          decoding={decoding}
          fetchPriority={fetchPriority}
          style={{
            opacity: isLoading ? 0 : 1,
            transition: "opacity 0.3s ease-in-out",
            objectFit: "cover",
          }}
          // SEO attributes
          itemProp="image"
          itemScope
          itemType="https://schema.org/ImageObject"
        />
      </Box>
    </>
  );
}
