"use client";

import { designTokens } from "@/lib/design-system";
import { Box, Typography } from "@/lib/daisy-ui";
import { OutlineButton, PriceDisplay, ProductCard } from "@/lib/ui-components";
import { getSanityCdnImageUrl } from "@/lib/utils/image-url";
import { urlFor } from "@/sanity/lib/image";
import { blocksToText } from "@/types/cake";
import { GiftHamper } from "@/types/giftHamper";
import Image from "next/image";
import Link from "next/link";
import { memo, useCallback, useMemo, useState } from "react";

const { colors, typography, spacing } = designTokens;

interface GiftHamperCardProps {
  hamper: GiftHamper;
  variant?: "featured" | "catalog";
}

const GiftHamperCard = memo(function GiftHamperCard({
  hamper,
  variant = "catalog",
}: GiftHamperCardProps): React.JSX.Element {
  const [isHovered, setIsHovered] = useState(false);
  const price = hamper.price || 0;

  const mainImage = useMemo(() => {
    const fromGallery = hamper.images?.find(img => img.isMain) || hamper.images?.[0];
    return fromGallery;
  }, [hamper.images]);

  const placeholderUrl = useMemo(() => {
    return `https://placehold.co/600x400/e2e8f0/1e293b?text=${encodeURIComponent(
      `${hamper.name}\n${hamper.category ?? "Gift Hamper"}`
    )}`;
  }, [hamper.name, hamper.category]);

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

  const imageAltText = useMemo(() => {
    const baseAlt = `${hamper.name} - ${hamper.category ?? "gift hamper"}`;
    const description =
      hamper.shortDescription && hamper.shortDescription.length > 0
        ? ` - ${blocksToText(hamper.shortDescription)}`
        : "";
    const location = " by Olgish Cakes in Leeds";
    return `${baseAlt}${description}${location}`;
  }, [hamper.name, hamper.category, hamper.shortDescription]);

  const handleMouseEnter = useCallback(() => setIsHovered(true), []);
  const handleMouseLeave = useCallback(() => setIsHovered(false), []);

  return (
    <ProductCard
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      sx={{ height: "100%", display: "flex", flexDirection: "column", overflow: "hidden" }}
      role="article"
      aria-label={`Gift hamper card for ${hamper.name}`}
    >
      <Link
        href={`/cakes-by-post/${hamper.slug?.current || hamper._id}`}
        style={{ textDecoration: "none" }}
        aria-label={`View details for ${hamper.name}`}
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
            sizes="(max-width: 640px) calc(100vw - 2rem), (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
            priority={variant === "featured"}
            placeholder="blur"
            blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
            loading={variant === "featured" ? "eager" : "lazy"}
          />

          <Box
            sx={{
              position: "absolute",
              inset: 0,
              background: "linear-gradient(to top, rgba(0,0,0,0.5), transparent, transparent)",
              opacity: isHovered ? 1 : 0,
              transition: "opacity 0.3s ease-in-out",
            }}
          />
        </Box>
      </Link>

      <Box
        sx={{
          flexGrow: 1,
          display: "flex",
          flexDirection: "column",
          p: spacing.lg,
          gap: spacing.md,
        }}
      >
        <Box sx={{ mb: spacing.xs }}>
          <PriceDisplay
            price={price}
            size="large"
            label="From"
          />
        </Box>

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
            "&:hover": { color: colors.text.primary },
            transition: "color 0.3s ease-in-out",
          }}
        >
          {hamper.name}
        </Typography>

        <Link href={`/cakes-by-post/${hamper.slug?.current || hamper._id}`} style={{ textDecoration: 'none', display: 'block' }}>
          <OutlineButton
            sx={{
              mt: "auto",
              py: spacing.md,
              width: "100%",
              fontWeight: typography.fontWeight.medium,
            }}
            aria-label={`Order ${hamper.name} now`}
          >
            Order Now
          </OutlineButton>
        </Link>
      </Box>
    </ProductCard>
  );
});

export default GiftHamperCard;
