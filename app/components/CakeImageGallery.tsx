"use client";

import { useState } from "react";
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
}

export function CakeImageGallery({
  designs,
  name,
  designType,
  onDesignTypeChange,
}: CakeImageGalleryProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const hasIndividualDesigns = Boolean(designs?.individual?.length);
  const images = designType === "standard" ? designs?.standard || [] : designs?.individual || [];

  const handlePrevious = () => {
    setCurrentImageIndex(prev => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentImageIndex(prev => (prev === images.length - 1 ? 0 : prev + 1));
  };

  const handleDesignChange = (newDesign: DesignType) => {
    onDesignTypeChange(newDesign);
    setCurrentImageIndex(0); // Reset to first image when changing design type
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

  const currentImage = images[currentImageIndex];
  const galleryImages = images.filter((_, index) => index !== currentImageIndex);

  return (
    <>
      {hasIndividualDesigns && (
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
          {galleryImages.map((image, index) => (
            <ImageListItem
              key={index}
              sx={{
                cursor: "pointer",
                "&:hover": {
                  opacity: 0.8,
                },
              }}
              onClick={() => setCurrentImageIndex(images.indexOf(image))}
            >
              <Image
                src={urlFor(image).width(400).height(400).url()}
                alt={image.alt || `${name} view ${index + 2}`}
                fill
                style={{ objectFit: "cover" }}
              />
            </ImageListItem>
          ))}
        </ImageList>
      )}
    </>
  );
}
