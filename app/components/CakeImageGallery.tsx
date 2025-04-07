"use client";

import { useState, useEffect } from "react";
import { Box, IconButton, ImageList, ImageListItem, Typography } from "@mui/material";
import { ArrowBack, ArrowForward } from "@mui/icons-material";
import Image from "next/image";
import { urlFor } from "@/sanity/lib/image";
import { CakeDesigns } from "@/types/cake";
import { DesignSelector, DesignType } from "./DesignSelector";

interface CakeImageGalleryProps {
  designs: CakeDesigns;
  name: string;
  designType: DesignType;
  onDesignTypeChange: (type: DesignType) => void;
  hideDesignSelector?: boolean;
}

export function CakeImageGallery({
  designs,
  name,
  designType,
  onDesignTypeChange,
  hideDesignSelector = false,
}: CakeImageGalleryProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const hasIndividualDesigns = Boolean(designs?.individual?.length);
  const standardImages = designs?.standard || [];
  const individualImages = designs?.individual || [];

  // Always keep the same order of images
  const allImages = [...standardImages, ...individualImages];

  // Reset image index when design type changes
  useEffect(() => {
    if (designType === "standard") {
      setCurrentImageIndex(0);
    } else {
      setCurrentImageIndex(standardImages.length);
    }
  }, [designType, standardImages.length]);

  const handlePrevious = () => {
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
  };

  const handleNext = () => {
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
  };

  const handleDesignChange = (newDesign: DesignType) => {
    if (newDesign === designType) return;
    onDesignTypeChange(newDesign);
  };

  const handleThumbnailClick = (index: number) => {
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
  };

  if (!designs?.standard || designs.standard.length === 0) {
    return (
      <Box
        sx={{
          height: { xs: 400, md: 600 },
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          bgcolor: "grey.100",
          borderRadius: 2,
          mb: 3,
        }}
      >
        <Typography variant="h6" color="text.secondary">
          No image available
        </Typography>
      </Box>
    );
  }

  const currentImage = allImages[currentImageIndex];
  const galleryImages = allImages.filter((_, index) => index !== currentImageIndex);

  return (
    <>
      {hasIndividualDesigns && !hideDesignSelector && (
        <Box sx={{ mb: 3 }}>
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
          borderRadius: 2,
          overflow: "hidden",
          boxShadow: 4,
          mb: 3,
        }}
      >
        <Image
          src={urlFor(currentImage).width(800).height(800).url()}
          alt={currentImage.alt || name}
          fill
          style={{ objectFit: "cover" }}
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
            "&:hover": {
              opacity: 1,
              bgcolor: "rgba(0, 0, 0, 0.03)",
            },
          }}
        >
          <IconButton
            onClick={handlePrevious}
            sx={{
              bgcolor: "rgba(255, 255, 255, 0.9)",
              "&:hover": {
                bgcolor: "rgba(255, 255, 255, 1)",
              },
            }}
          >
            <ArrowBack />
          </IconButton>
          <IconButton
            onClick={handleNext}
            sx={{
              bgcolor: "rgba(255, 255, 255, 0.9)",
              "&:hover": {
                bgcolor: "rgba(255, 255, 255, 1)",
              },
            }}
          >
            <ArrowForward />
          </IconButton>
        </Box>
      </Box>

      {galleryImages.length > 0 && (
        <ImageList
          sx={{
            width: "100%",
            height: 200,
            borderRadius: 2,
            overflow: "hidden",
          }}
          cols={3}
          rowHeight={200}
          gap={8}
        >
          {galleryImages.map((image, index) => {
            const originalIndex = index >= currentImageIndex ? index + 1 : index;

            return (
              <ImageListItem
                key={index}
                sx={{
                  cursor: "pointer",
                  "&:hover": {
                    opacity: 0.8,
                  },
                }}
                onClick={() => handleThumbnailClick(originalIndex)}
              >
                <Image
                  src={urlFor(image).width(400).height(400).url()}
                  alt={image.alt || `${name} view ${index + 2}`}
                  fill
                  style={{ objectFit: "cover" }}
                />
              </ImageListItem>
            );
          })}
        </ImageList>
      )}
    </>
  );
}
