"use client";

import { useState, useEffect, memo, useMemo, useCallback } from "react";
import {
  Box,
  IconButton,
  ImageList,
  ImageListItem,
  Typography,
  ArrowBackIcon,
  ArrowForwardIcon,
} from "@/lib/mui-optimization";
import { AccessibleIconButton , TouchTargetWrapper} from "@/lib/ui-components";
import Image from "next/image";
import { urlFor } from "@/sanity/lib/image";
import { CakeDesigns } from "@/types/cake";
import { DesignSelector, DesignType } from "./DesignSelector";
import { designTokens } from "@/lib/design-system";

const { colors } = designTokens;

interface CakeImageGalleryProps {
  designs: CakeDesigns;
  name: string;
  designType: DesignType;
  onDesignTypeChange: (type: DesignType) => void;
  hideDesignSelector?: boolean;
}

const CakeImageGallery = memo(function CakeImageGallery({
  designs,
  name,
  designType,
  onDesignTypeChange,
  hideDesignSelector = false,
}: CakeImageGalleryProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const hasIndividualDesigns = Boolean(designs?.individual?.length);
  const standardImages = useMemo(() => designs?.standard || [], [designs?.standard]);
  const individualImages = useMemo(() => designs?.individual || [], [designs?.individual]);

  // Memoize images
  const allImages = useMemo(
    () => [...standardImages, ...individualImages],
    [standardImages, individualImages]
  );
  const galleryImages = useMemo(
    () => allImages.filter((_, index) => index !== currentImageIndex),
    [allImages, currentImageIndex]
  );
  const currentImage = allImages[currentImageIndex];

  // Reset image index when design type changes
  useEffect(() => {
    if (designType === "standard") {
      setCurrentImageIndex(0);
    } else {
      setCurrentImageIndex(standardImages.length);
    }
  }, [designType, standardImages.length]);

  // Memoize handlers
  const handlePrevious = useCallback(() => {
    const newIndex = currentImageIndex === 0 ? allImages.length - 1 : currentImageIndex - 1;

    // Update design type if needed
    if (newIndex < standardImages.length) {
      if (designType !== "standard") {
        onDesignTypeChange("standard");
      }
    } else {
      if (designType !== "individual") {
        onDesignTypeChange("individual");
      }
    }

    setCurrentImageIndex(newIndex);
  }, [currentImageIndex, allImages.length, designType, standardImages.length, onDesignTypeChange]);

  const handleNext = useCallback(() => {
    const newIndex = currentImageIndex === allImages.length - 1 ? 0 : currentImageIndex + 1;

    // Update design type if needed
    if (newIndex < standardImages.length) {
      if (designType !== "standard") {
        onDesignTypeChange("standard");
      }
    } else {
      if (designType !== "individual") {
        onDesignTypeChange("individual");
      }
    }

    setCurrentImageIndex(newIndex);
  }, [currentImageIndex, allImages.length, designType, standardImages.length, onDesignTypeChange]);

  const handleDesignChange = useCallback(
    (newDesign: DesignType) => {
      if (newDesign === designType) return;
      onDesignTypeChange(newDesign);
    },
    [designType, onDesignTypeChange]
  );

  const handleThumbnailClick = useCallback(
    (index: number) => {
      // Update design type if needed
      if (index < standardImages.length) {
        if (designType !== "standard") {
          onDesignTypeChange("standard");
        }
      } else {
        if (designType !== "individual") {
          onDesignTypeChange("individual");
        }
      }

      setCurrentImageIndex(index);
    },
    [designType, onDesignTypeChange, standardImages.length]
  );

  if (!designs?.standard || designs.standard.length === 0) {
    return (
      <Box
        sx={{
          height: { xs: 400, md: 600 },
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          bgcolor: "grey.100",
          borderRadius: "35px",
          mb: 3,
        }}
      >
        <Typography variant="body1" color="text.secondary">
          No image available
        </Typography>
      </Box>
    );
  }

  return (
    <section aria-label="Cake image gallery" role="region">
      {hasIndividualDesigns && !hideDesignSelector && (
        <Box sx={{ mb: 3, borderRadius: "35px" }}>
          <DesignSelector
            hasIndividualDesigns={hasIndividualDesigns}
            onChange={handleDesignChange}
            value={designType}
          />
        </Box>
      )}
      <Box
        sx={{
          position: "relative",
          height: { xs: 400, md: 600 },
          overflow: "hidden",
          boxShadow: 4,
          mb: 3,
          borderRadius: "35px",
        }}
        aria-label="Main cake image"
        role="img"
      >
        <Image
          src={urlFor(currentImage).width(800).height(800).url()}
          alt={
            currentImage.alt ||
            `${name} - Ukrainian ${designType} cake design by Olgish Cakes in Leeds`
          }
          fill
          style={{ objectFit: "cover" }}
          sizes="(max-width: 640px) 100vw, (max-width: 1200px) 50vw, 33vw"
          placeholder="blur"
          blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
          priority
        />
        <Box
          sx={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            px: 2,
            opacity: 0,
            transition: "opacity 0.2s",
            borderRadius: "35px",
            "&:hover": {
              opacity: 1,
              bgcolor: "rgba(0, 0, 0, 0.03)",
            },
          }}
        >
          <AccessibleIconButton
            onClick={handlePrevious}
            ariaLabel="View previous image"
            title="View previous image"
            sx={{
              bgcolor: "rgba(255, 255, 255, 0.9)",
              borderRadius: "35px",
              "&:hover": {
                bgcolor: "rgba(255, 255, 255, 1)",
              },
            }}
          >
            <ArrowBackIcon />
          </AccessibleIconButton>
          <AccessibleIconButton
            onClick={handleNext}
            ariaLabel="View next image"
            title="View next image"
            sx={{
              bgcolor: "rgba(255, 255, 255, 0.9)",
              borderRadius: "35px",
              "&:hover": {
                bgcolor: "rgba(255, 255, 255, 1)",
              },
            }}
          >
            <ArrowForwardIcon />
          </AccessibleIconButton>
        </Box>
      </Box>

      {galleryImages.length > 0 && (
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "repeat(2, 1fr)",
              sm: "repeat(3, 1fr)",
              md: "repeat(4, 1fr)",
              lg: "repeat(5, 1fr)",
            },
            gap: 2,
            width: "100%",
          }}
        >
          {galleryImages.map((image, index) => {
            const originalIndex = index >= currentImageIndex ? index + 1 : index;

            return (
              <Box
                key={index}
                sx={{
                  position: "relative",
                  aspectRatio: "1",
                  borderRadius: 1,
                  overflow: "hidden",
                  cursor: "pointer",
                  minHeight: "44px", // WCAG touch target requirement
                  minWidth: "44px", // WCAG touch target requirement
                  "&:hover": {
                    opacity: 0.8,
                    transform: "scale(1.02)",
                  },
                  transition: "opacity 0.2s ease, transform 0.2s ease",
                  // Ensure proper focus state for accessibility
                  "&:focus": {
                    outline: `2px solid ${colors.primary.main}`,
                    outlineOffset: "2px",
                  },
                }}
                onClick={() => handleThumbnailClick(originalIndex)}
                role="button"
                tabIndex={0}
                aria-label={`View ${name} image ${index + 2}`}
                onKeyDown={e => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    handleThumbnailClick(originalIndex);
                  }
                }}
              >
                <Image
                  src={urlFor(image).width(400).height(400).url()}
                  alt={
                    image.alt ||
                    `${name} - Ukrainian cake gallery view ${index + 2} by Olgish Cakes`
                  }
                  fill
                  style={{ objectFit: "cover" }}
                  sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 20vw"
                />
              </Box>
            );
          })}
        </Box>
      )}
    </section>
  );
});

export { CakeImageGallery };
