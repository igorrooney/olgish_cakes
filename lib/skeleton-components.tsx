/**
 * Reusable skeleton components for consistent loading states
 */

import { Box, Card, CardContent, Skeleton } from "@mui/material";
import { memo } from "react";

interface TestimonialSkeletonProps {
  showImage?: boolean;
  variant?: "compact" | "full";
}

export const TestimonialSkeleton = memo(function TestimonialSkeleton({
  showImage = true,
  variant = "full",
}: TestimonialSkeletonProps) {
  return (
    <Card
      sx={{
        height: "100%",
        p: variant === "full" ? 3 : 2,
        borderRadius: "12px",
        background: "linear-gradient(to bottom right, #ffffff, #faf7f5)",
      }}
    >
      <CardContent className="space-y-4">
        {showImage && (
          <Skeleton
            variant="rectangular"
            width="100%"
            height={variant === "full" ? 256 : 128}
            animation="wave"
            sx={{
              borderRadius: "8px",
              mb: 2,
            }}
          />
        )}

        {/* Header with name and source */}
        <div className="flex items-center justify-between">
          <Skeleton
            variant="text"
            width="60%"
            height={variant === "full" ? 32 : 24}
            animation="wave"
          />
          <Skeleton
            variant="rectangular"
            width={80}
            height={24}
            animation="wave"
            sx={{ borderRadius: "12px" }}
          />
        </div>

        {/* Rating and date */}
        <div className="flex items-center space-x-2">
          <Skeleton variant="rectangular" width={120} height={24} animation="wave" />
          <Skeleton variant="text" width={80} height={20} animation="wave" />
        </div>

        {/* Testimonial text */}
        <Skeleton
          variant="text"
          width="100%"
          height={variant === "full" ? 60 : 40}
          animation="wave"
        />
      </CardContent>
    </Card>
  );
});

interface CakeCardSkeletonProps {
  variant?: "featured" | "catalog";
}

export const CakeCardSkeleton = memo(function CakeCardSkeleton({
  variant = "catalog",
}: CakeCardSkeletonProps) {
  return (
    <Card
      sx={{
        height: "100%",
        borderRadius: "12px",
        overflow: "hidden",
      }}
    >
      {/* Image skeleton */}
      <Skeleton
        variant="rectangular"
        width="100%"
        height={variant === "featured" ? 300 : 250}
        animation="wave"
      />

      <CardContent sx={{ p: variant === "featured" ? 3 : 2 }}>
        {/* Title */}
        <Skeleton
          variant="text"
          width="80%"
          height={variant === "featured" ? 32 : 28}
          animation="wave"
          sx={{ mb: 1 }}
        />

        {/* Description */}
        <Skeleton
          variant="text"
          width="100%"
          height={variant === "featured" ? 48 : 40}
          animation="wave"
          sx={{ mb: 2 }}
        />

        {/* Price and button */}
        <div className="flex items-center justify-between">
          <Skeleton variant="text" width="40%" height={24} animation="wave" />
          <Skeleton
            variant="rectangular"
            width={100}
            height={36}
            animation="wave"
            sx={{ borderRadius: "8px" }}
          />
        </div>
      </CardContent>
    </Card>
  );
});

interface ImageSkeletonProps {
  width?: string | number;
  height?: string | number;
  borderRadius?: string;
}

export const ImageSkeleton = memo(function ImageSkeleton({
  width = "100%",
  height = 200,
  borderRadius = "8px",
}: ImageSkeletonProps) {
  return (
    <Skeleton
      variant="rectangular"
      width={width}
      height={height}
      animation="wave"
      sx={{
        borderRadius,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#f5f5f5",
      }}
    />
  );
});

interface PageSkeletonProps {
  sections?: number;
}

export const PageSkeleton = memo(function PageSkeleton({ sections = 3 }: PageSkeletonProps) {
  return (
    <Box sx={{ p: 3 }}>
      {/* Page title */}
      <Skeleton variant="text" width="40%" height={48} animation="wave" sx={{ mb: 3 }} />

      {/* Page subtitle */}
      <Skeleton variant="text" width="60%" height={24} animation="wave" sx={{ mb: 4 }} />

      {/* Content sections */}
      {Array.from({ length: sections }, (_, index) => (
        <Box key={index} sx={{ mb: 4 }}>
          <Skeleton
            variant="rectangular"
            width="100%"
            height={200}
            animation="wave"
            sx={{ borderRadius: "8px", mb: 2 }}
          />
          <Skeleton variant="text" width="100%" height={60} animation="wave" />
        </Box>
      ))}
    </Box>
  );
});

// Grid layout skeleton for testimonials/cake grids
interface GridSkeletonProps {
  items?: number;
  columns?: { xs: number; md: number };
  itemComponent?: React.ComponentType;
}

export const GridSkeleton = memo(function GridSkeleton({
  items = 6,
  columns = { xs: 1, md: 2 },
  itemComponent: ItemComponent = TestimonialSkeleton,
}: GridSkeletonProps) {
  return (
    <Box
      sx={{
        display: "grid",
        gap: 2,
        gridTemplateColumns: {
          xs: `repeat(${columns.xs}, 1fr)`,
          md: `repeat(${columns.md}, 1fr)`,
        },
      }}
    >
      {Array.from({ length: items }, (_, index) => (
        <ItemComponent key={index} />
      ))}
    </Box>
  );
});
