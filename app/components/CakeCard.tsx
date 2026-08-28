"use client";

import { designTokens } from "@/lib/design-system";
import { Box, CardContent, Typography } from "@/lib/daisy-ui";
import { OutlineButton, PriceDisplay, ProductCard } from "@/lib/ui-components";
import { getSanityCdnImageUrl } from "@/lib/utils/image-url";
import { urlFor } from "@/sanity/lib/image";
import { Cake, blocksToText } from "@/types/cake";
import Image from "next/image";
import Link from "next/link";
import { memo, useCallback, useMemo, useState } from "react";

const { colors, typography, spacing, borderRadius, shadows } = designTokens;

interface CakeCardProps {
  cake: Cake;
  variant?: "featured" | "catalog";
}

const CakeCard = memo(function CakeCard({ cake, variant = "catalog" }: CakeCardProps): React.JSX.Element {
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
    if (!mainImage?.asset?._ref) {
      return placeholderUrl;
    }

    const rawImageUrl = urlFor(mainImage).url();

    return getSanityCdnImageUrl(rawImageUrl, {
      width: 560,
      height: 560,
      fit: 'crop',
      quality: 78,
    }) ?? rawImageUrl;
  }, [mainImage, placeholderUrl]);

  // Generate SEO-optimized alt text with location context and target keywords
  const imageAltText = useMemo(() => {
    const baseAlt = `${cake.name} - ${cake.category} honey cake`;
    const description =
      cake.shortDescription && cake.shortDescription.length > 0
        ? ` - ${blocksToText(cake.shortDescription)}`
        : "";
    const location = " by Olgish Cakes in Leeds, Yorkshire";
    return `${baseAlt}${description}${location}`;
  }, [cake.name, cake.category, cake.shortDescription]);

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
      aria-label={`Cake card for ${cake.name} - ${cake.category}`}
      // Enhanced accessibility attributes
      tabIndex={0}
      onKeyDown={(e: React.KeyboardEvent) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          window.location.href = `/cakes/${cake.slug.current}`;
        }
      }}
    >
      {/* Image Container with Overlay */}
      <Link
        href={`/cakes/${cake.slug.current}`}
        style={{ textDecoration: "none" }}
        aria-label={`View details for ${cake.name} - ${cake.category}`}
        // Enhanced link attributes for SEO
        rel="canonical"
        title={`${cake.name} - ${cake.category} | Olgish Cakes Leeds`}
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
          // Enhanced image container attributes
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
            sizes="(max-width: 640px) calc(100vw - 2rem), (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
            priority={variant === "featured"}
            placeholder="blur"
            blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
            loading={variant === "featured" ? "eager" : "lazy"}
            // Enhanced image attributes for SEO
            title={`${cake.name} - ${cake.category} by Olgish Cakes Leeds`}
            decoding="async"
            fetchPriority={variant === "featured" ? "high" : "auto"}
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

          {/* Featured Badge with enhanced accessibility */}
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
              role="status"
              aria-label="Featured cake"
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
            mb: spacing.xs,
          }}
        >
          <PriceDisplay
            price={price}
            size="large"
            label="From"
          />
        </Box>

        {/* Title with enhanced SEO */}
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
          // Enhanced title attributes
          title={`${cake.name} - ${cake.category} | Olgish Cakes Leeds`}
        >
          {cake.name}
        </Typography>

        {/* Action Button with enhanced accessibility */}
        <Link href={`/cakes/${cake.slug.current}`} style={{ textDecoration: 'none', display: 'block' }}>
          <OutlineButton
            sx={{
              mt: "auto",
              py: spacing.md,
              width: "100%",
              fontWeight: typography.fontWeight.medium,
            }}
            aria-label={`Order ${cake.name} now from Olgish Cakes Leeds`}
            // Enhanced button attributes for SEO
            title={`Order ${cake.name} - ${cake.category} | Olgish Cakes Leeds`}
          >
            Order Now
          </OutlineButton>
        </Link>
      </CardContent>
    </ProductCard>
  );
});

export default CakeCard;
