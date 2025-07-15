"use client";

import { Card, CardContent, Typography, Button, Box, Chip } from "@mui/material";
import Image from "next/image";
import Link from "next/link";
import { Cake, blocksToText } from "@/types/cake";
import { RichTextRenderer } from "./RichTextRenderer";
import { urlFor } from "@/sanity/lib/image";
import { useState, memo, useMemo, useCallback } from "react";
import { designTokens } from "@/lib/design-system";
import { ProductCard, CategoryChip, PriceDisplay, OutlineButton } from "@/lib/ui-components";

const { colors, typography, spacing, borderRadius, shadows } = designTokens;

interface CakeCardProps {
  cake: Cake;
  variant?: "featured" | "catalog";
}

const CakeCard = memo(function CakeCard({ cake, variant = "catalog" }: CakeCardProps): JSX.Element {
  const [isHovered, setIsHovered] = useState(false);
  const price = cake.pricing?.standard || 0;

  // Memoize expensive computations
  const mainImage = useMemo(() => {
    // First try to use the dedicated mainImage field from studio
    if (cake.mainImage?.asset?._ref) {
      return cake.mainImage;
    }
    // Fallback to designs.standard array
    return (
      cake.designs?.standard?.find(img => img.isMain && img.asset?._ref) ||
      cake.designs?.standard?.find(img => img.asset?._ref) ||
      cake.designs?.standard?.[0]
    );
  }, [cake.mainImage, cake.designs?.standard]);

  const placeholderUrl = useMemo(() => {
    return `https://placehold.co/600x400/e2e8f0/1e293b?text=${encodeURIComponent(
      `${cake.name}\n${cake.category}`
    )}`;
  }, [cake.name, cake.category]);

  const imageUrl = useMemo(() => {
    return mainImage?.asset?._ref ? urlFor(mainImage).width(800).height(800).url() : placeholderUrl;
  }, [mainImage, placeholderUrl]);

  // Generate SEO-optimized alt text
  const imageAltText = useMemo(() => {
    const baseAlt = `${cake.name} - ${cake.category} honey cake`;
    const description =
      cake.shortDescription && cake.shortDescription.length > 0
        ? ` - ${blocksToText(cake.shortDescription)}`
        : "";
    const location = " by Olgish Cakes in Leeds";
    return `${baseAlt}${description}${location}`;
  }, [cake.name, cake.category, cake.shortDescription]);

  // Generate structured data for the cake card
  const structuredData = useMemo(
    () => ({
      "@context": "https://schema.org",
      "@type": "Product",
      name: cake.name,
      description: cake.shortDescription
        ? blocksToText(cake.shortDescription)
        : `${cake.name} - Traditional Ukrainian honey cake`,
      category: cake.category || "Ukrainian Honey Cake",
      brand: {
        "@type": "Brand",
        name: "Olgish Cakes",
      },
      offers: {
        "@type": "Offer",
        price: price,
        priceCurrency: "GBP",
        availability: "https://schema.org/InStock",
        url: `https://olgishcakes.co.uk/cakes/${cake.slug.current}`,
      },
    }),
    [cake, price]
  );

  // Memoize event handlers
  const handleMouseEnter = useCallback(() => setIsHovered(true), []);
  const handleMouseLeave = useCallback(() => setIsHovered(false), []);

  return (
    <ProductCard
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
      role="article"
      aria-label={`Cake card for ${cake.name}`}
      itemScope
      itemType="https://schema.org/Product"
    >
      {/* Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredData),
        }}
      />

      {/* Image Container with Overlay */}
      <Link
        href={`/cakes/${cake.slug.current}`}
        style={{ textDecoration: "none" }}
        aria-label={`View details for ${cake.name}`}
        itemProp="url"
      >
        <Box
          sx={{
            position: "relative",
            aspectRatio: "1",
            overflow: "hidden",
            backgroundColor: colors.background.subtle,
          }}
          role="img"
          aria-label={imageAltText}
        >
          <Image
            src={imageUrl}
            alt={imageAltText}
            fill
            style={{
              objectFit: "cover",
              transition: "transform 0.3s ease-in-out, filter 0.3s ease-in-out",
              transform: isHovered ? "scale(1.05)" : "scale(1)",
              filter: isHovered ? "brightness(0.95)" : "brightness(1)",
            }}
            sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
            priority={variant === "featured"}
            placeholder="blur"
            blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
            loading={variant === "featured" ? "eager" : "lazy"}
            itemProp="image"
          />

          {/* Elegant Gradient Overlay */}
          <Box
            sx={{
              position: "absolute",
              inset: 0,
              background: "linear-gradient(to top, rgba(0,0,0,0.5), transparent, transparent)",
              opacity: isHovered ? 1 : 0,
              transition: "opacity 0.3s ease-in-out",
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
          <CategoryChip
            label={cake.category || "Honey Cake"}
            aria-label={`Category: ${cake.category || "Honey Cake"}`}
          />
          <PriceDisplay
            price={price}
            size="large"
            label="From"
            itemProp="offers"
            itemScope
            itemType="https://schema.org/Offer"
          />
        </Box>

        {/* Title */}
        <Typography
          variant="h6"
          component="h3"
          itemProp="name"
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

        {/* Short Description for SEO */}
        {cake.shortDescription && (
          <Typography
            variant="body2"
            itemProp="description"
            sx={{
              color: colors.text.secondary,
              lineHeight: typography.lineHeight.relaxed,
              overflow: "hidden",
              textOverflow: "ellipsis",
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              minHeight: "2.5rem",
            }}
          >
            {blocksToText(cake.shortDescription)}
          </Typography>
        )}

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
          aria-label={`Order ${cake.name} now`}
        >
          Order Now
        </OutlineButton>
      </CardContent>
    </ProductCard>
  );
});

export default CakeCard;
