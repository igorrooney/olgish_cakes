"use client";

import { Card, CardContent, Typography, Button, Box, Chip } from "@mui/material";
import Image from "next/image";
import Link from "next/link";
import { Cake } from "../utils/fetchCakes";
import { urlFor } from "@/sanity/lib/image";
import { useState } from "react";
import { designTokens } from "@/lib/design-system";
import { ProductCard, CategoryChip, PriceDisplay, OutlineButton } from "@/lib/ui-components";

const { colors, typography, spacing, borderRadius, shadows } = designTokens;

interface CakeCardProps {
  cake: Cake;
  variant?: "featured" | "catalog";
}

export default function CakeCard({ cake, variant = "catalog" }: CakeCardProps): JSX.Element {
  const [isHovered, setIsHovered] = useState(false);
  const price = cake.pricing?.standard || 0;

  const mainImage =
    cake.designs?.standard?.find(img => img.isMain && img.asset?._ref) ||
    cake.designs?.standard?.find(img => img.asset?._ref) ||
    cake.designs?.standard?.[0];

  const placeholderUrl = `https://placehold.co/600x400/e2e8f0/1e293b?text=${encodeURIComponent(
    `${cake.name}\n${cake.category}`
  )}`;

  const imageUrl = mainImage?.asset?._ref
    ? urlFor(mainImage).width(800).height(800).url()
    : placeholderUrl;

  return (
    <ProductCard
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
    >
      {/* Image Container with Overlay */}
      <Link href={`/cakes/${cake.slug.current}`} style={{ textDecoration: "none" }}>
        <Box
          sx={{
            position: "relative",
            aspectRatio: "1",
            overflow: "hidden",
            backgroundColor: colors.background.subtle,
          }}
        >
          <Image
            src={imageUrl}
            alt={`${cake.name} - ${cake.category} cake by Olgish Cakes`}
            fill
            style={{
              objectFit: "cover",
              transition: "all 0.7s ease-in-out",
              transform: isHovered ? "scale(1.05)" : "scale(1)",
              filter: isHovered ? "brightness(0.95)" : "brightness(1)",
            }}
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            priority={variant === "featured"}
            placeholder="blur"
            blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
          />

          {/* Elegant Gradient Overlay */}
          <Box
            sx={{
              position: "absolute",
              inset: 0,
              background: "linear-gradient(to top, rgba(0,0,0,0.5), transparent, transparent)",
              opacity: isHovered ? 1 : 0,
              transition: "opacity 0.5s ease-in-out",
            }}
          />

          {/* Featured Badge */}
          {variant === "featured" && (
            <Box
              sx={{
                position: "absolute",
                top: spacing.md,
                right: spacing.md,
                backgroundColor: "rgba(255, 255, 255, 0.95)",
                backdropFilter: "blur(4px)",
                px: spacing.md,
                py: spacing.sm,
                borderRadius: borderRadius.full,
                boxShadow: shadows.sm,
                border: `1px solid ${colors.border.light}`,
              }}
            >
              <Typography
                variant="caption"
                sx={{
                  fontWeight: typography.fontWeight.medium,
                  color: colors.text.primary,
                }}
              >
                Featured
              </Typography>
            </Box>
          )}
        </Box>
      </Link>

      {/* Content */}
      <CardContent
        sx={{
          flexGrow: 1,
          display: "flex",
          flexDirection: "column",
          p: spacing.lg,
          gap: spacing.md,
        }}
      >
        {/* Category and Price */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            mb: spacing.xs,
          }}
        >
          <CategoryChip label={cake.category || "Cake"} />
          <PriceDisplay price={price} size="medium" />
        </Box>

        {/* Title */}
        <Typography
          variant="h6"
          component="h3"
          sx={{
            fontFamily: typography.fontFamily.display,
            color: colors.text.primary,
            fontWeight: typography.fontWeight.semibold,
            lineHeight: typography.lineHeight.tight,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
            "&:hover": {
              color: colors.text.primary,
            },
            transition: "color 0.3s ease-in-out",
          }}
        >
          {cake.name}
        </Typography>

        {/* Description */}
        <Typography
          variant="body2"
          sx={{
            color: colors.text.secondary,
            fontStyle: "italic",
            fontWeight: typography.fontWeight.light,
            lineHeight: typography.lineHeight.relaxed,
            minHeight: "3rem",
            overflow: "hidden",
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
          }}
        >
          {cake.shortDescription ||
            cake.description ||
            "A delightful artisanal cake crafted with the finest ingredients"}
        </Typography>

        {/* Action Button */}
        <OutlineButton
          component={Link}
          href={`/cakes/${cake.slug.current}`}
          sx={{
            mt: "auto",
            py: spacing.md,
            width: "100%",
            fontWeight: typography.fontWeight.medium,
          }}
        >
          Order Now
        </OutlineButton>
      </CardContent>
    </ProductCard>
  );
}
