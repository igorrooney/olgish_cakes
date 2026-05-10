"use client";

import { memo, useMemo, useState, useCallback } from "react";
import Image from "next/image";
import { Box } from "@/lib/daisy-ui";
import { AccessibleIconButton } from "@/lib/ui-components";
import { getSanityCdnImageUrl } from "@/lib/utils/image-url";
// Import icons directly for better HMR support
import { ArrowBackIcon } from "@/lib/daisy-ui";
import { ArrowForwardIcon } from "@/lib/daisy-ui";
import { urlFor } from "@/sanity/lib/image";
import { GiftHamperImage } from "@/types/giftHamper";

import { colors } from "@/lib/design-system";
interface HamperImageGalleryProps {
  name: string;
  images?: GiftHamperImage[];
}

export const HamperImageGallery = memo(function HamperImageGallery({
  name,
  images = [],
}: HamperImageGalleryProps) {
  const allImages = useMemo(() => {
    const safeImages: GiftHamperImage[] = Array.isArray(images) ? images : [];
    const byMain = [...safeImages].sort((a, b) => Number(b.isMain) - Number(a.isMain));
    return byMain;
  }, [images]);

  const [index, setIndex] = useState(0);
  const current = allImages[index];
  const rawCurrentImageUrl = urlFor(current).url();
  const currentImageUrl = getSanityCdnImageUrl(rawCurrentImageUrl, {
    width: 960,
    height: 960,
    fit: "crop",
    quality: 80,
  }) ?? rawCurrentImageUrl;

  const handlePrev = useCallback(() => {
    setIndex(prev => (prev === 0 ? allImages.length - 1 : prev - 1));
  }, [allImages.length]);

  const handleNext = useCallback(() => {
    setIndex(prev => (prev === allImages.length - 1 ? 0 : prev + 1));
  }, [allImages.length]);

  if (!current) {
    return null;
  }

  return (
    <section aria-label="Hamper image gallery" role="region">
      <Box
        sx={{
          position: "relative",
          height: { xs: 400, md: 600 },
          overflow: "hidden",
          borderRadius: "35px",
          boxShadow: 4,
          mb: 3,
        }}
        role="img"
        aria-label={`${name} image`}
      >
        <Image
          src={currentImageUrl}
          alt={current.alt || `${name} product image`}
          fill
          style={{ objectFit: "cover" }}
          sizes="(max-width: 640px) 100vw, (max-width: 1200px) 50vw, 33vw"
          priority
          placeholder="blur"
          blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
        />
        {allImages.length > 1 && (
          <Box
            sx={{
              position: "absolute",
              inset: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              px: 2,
            }}
          >
            <AccessibleIconButton ariaLabel="Previous image" onClick={handlePrev}>
              <ArrowBackIcon />
            </AccessibleIconButton>
            <AccessibleIconButton ariaLabel="Next image" onClick={handleNext}>
              <ArrowForwardIcon />
            </AccessibleIconButton>
          </Box>
        )}
      </Box>
      {allImages.length > 1 && (
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "repeat(3, 1fr)", sm: "repeat(5, 1fr)" },
            gap: 8,
          }}
        >
          {allImages.map((img, i) => {
            const rawThumbnailUrl = urlFor(img).url();
            const thumbnailUrl = getSanityCdnImageUrl(rawThumbnailUrl, {
              width: 360,
              height: 360,
              fit: "crop",
              quality: 76,
            }) ?? rawThumbnailUrl;

            return (
              <Box
                key={i}
                sx={{
                  position: "relative",
                  aspectRatio: "1",
                  borderRadius: 2,
                  overflow: "hidden",
                  cursor: "pointer",
                  outline: i === index ? `2px solid ${colors.primary.main}` : "none",
                }}
                onClick={() => setIndex(i)}
              >
                <Image
                  src={thumbnailUrl}
                  alt={img.alt || `${name} thumbnail ${i + 1}`}
                  fill
                  style={{ objectFit: "cover" }}
                />
              </Box>
            );
          })}
        </Box>
      )}
    </section>
  );
});
