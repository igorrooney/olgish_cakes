"use client";

import { Box, Typography } from "@/lib/mui-optimization";
import { memo } from "react";
import Image from "next/image";

interface PlaceholderImageProps {
  name: string;
  className?: string;
}

const PlaceholderImage = memo(function PlaceholderImage({
  name,
  className = "",
}: PlaceholderImageProps) {
  return (
    <Box
      className={`flex items-center justify-center bg-gray-100 ${className}`}
      sx={{
        backgroundColor: "rgba(0, 0, 0, 0.05)",
        minHeight: "200px",
        position: "relative",
      }}
      aria-label={`Placeholder image for ${name}`}
      role="img"
    >
      <Image
        src="/images/placeholder-cake.jpg"
        alt={`Placeholder for ${name}`}
        fill
        style={{ objectFit: "cover", zIndex: 0, opacity: 0.3 }}
        sizes="(max-width: 640px) 100vw, (max-width: 1200px) 50vw, 33vw"
        placeholder="blur"
        blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
      />
      <Typography
        variant="body1"
        className="text-gray-400 text-center px-4"
        sx={{
          fontSize: "0.875rem",
          lineHeight: 1.5,
          position: "relative",
          zIndex: 1,
        }}
      >
        {name}
      </Typography>
    </Box>
  );
});

export default PlaceholderImage;
