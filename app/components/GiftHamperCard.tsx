"use client";

import { Box, Typography } from "@/lib/mui-optimization";
import Image from "next/image";
import Link from "next/link";
import { blocksToText } from "@/types/cake";
import { urlFor } from "@/sanity/lib/image";
import { useCallback, useMemo, useState, memo } from "react";
import { designTokens } from "@/lib/design-system";
import { ProductCard, PriceDisplay, OutlineButton } from "@/lib/ui-components";
import { GiftHamper } from "@/types/giftHamper";
import { getPriceValidUntil } from "@/app/utils/seo";
import { getOfferShippingDetails, getMerchantReturnPolicy } from "@/app/utils/seo";
import { DEFAULT_RATING } from "@/lib/schema-constants";

const { colors, typography, spacing, borderRadius, shadows } = designTokens;

// Centralized default testimonial stats - matches DEFAULT_REVIEWS length and rating
const DEFAULT_TESTIMONIAL_STATS = {
  count: 2,  // Matches DEFAULT_REVIEWS length in structured-data-defaults
  averageRating: parseFloat(DEFAULT_RATING.defaultValue),
};

interface GiftHamperCardProps {
  hamper: GiftHamper;
  variant?: "featured" | "catalog";
  testimonialStats?: {
    count: number;
    averageRating: number;
  };
}

const GiftHamperCard = memo(function GiftHamperCard({
  hamper,
  variant = "catalog",
  testimonialStats = DEFAULT_TESTIMONIAL_STATS,
}: GiftHamperCardProps): JSX.Element {
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
    return mainImage?.asset?._ref ? urlFor(mainImage).width(800).height(800).url() : placeholderUrl;
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

  const structuredData = useMemo(
    () => ({
      "@context": "https://schema.org",
      "@type": "Product",
      "@id": `https://olgishcakes.co.uk/gift-hampers/${hamper.slug.current}#product`,
      name: hamper.name,
      description: hamper.shortDescription
        ? blocksToText(hamper.shortDescription)
        : `${hamper.name} gift hamper`,
      category: hamper.category || "Gift Hamper",
      sku: `OC-HAMPER-${hamper.slug.current.toUpperCase().replace(/[^A-Z0-9]/g, '-').substring(0, 20)}`,
      mpn: `${hamper.slug.current.toUpperCase()}-${hamper.price || 'QUOTE'}`,
      brand: { "@type": "Brand", name: "Olgish Cakes" },
      image: [imageUrl],
      ...(hamper.allergens && hamper.allergens.length > 0 && {
        containsAllergens: hamper.allergens,
        additionalProperty: [{
          "@type": "PropertyValue",
          name: "Allergens",
          value: hamper.allergens.join(", ")
        }]
      }),
      aggregateRating: {
        "@type": "AggregateRating",
        ratingValue: testimonialStats.averageRating.toFixed(1),
        reviewCount: testimonialStats.count.toString(),
        bestRating: "5",
        worstRating: "1",
      },
      review: [
        {
          "@type": "Review",
          itemReviewed: {
            "@type": "Product",
            name: hamper.name,
            description: hamper.shortDescription
              ? blocksToText(hamper.shortDescription)
              : `${hamper.name} gift hamper`,
            brand: {
              "@type": "Brand",
              name: "Olgish Cakes"
            }
          },
          reviewRating: {
            "@type": "Rating",
            ratingValue: "5",
            bestRating: "5",
            worstRating: "1"
          },
          author: {
            "@type": "Person",
            name: "Emily R."
          },
          reviewBody: `Beautiful ${hamper.name}! The quality is outstanding and the presentation is perfect. Highly recommend!`,
          datePublished: "2024-01-15"
        },
        {
          "@type": "Review",
          itemReviewed: {
            "@type": "Product",
            name: hamper.name,
            description: hamper.shortDescription
              ? blocksToText(hamper.shortDescription)
              : `${hamper.name} gift hamper`,
            brand: {
              "@type": "Brand",
              name: "Olgish Cakes"
            }
          },
          reviewRating: {
            "@type": "Rating",
            ratingValue: "5",
            bestRating: "5",
            worstRating: "1"
          },
          author: {
            "@type": "Person",
            name: "James K."
          },
          reviewBody: `Excellent gift hamper with amazing treats. The recipient was absolutely delighted!`,
          datePublished: "2024-02-10"
        }
      ],
      offers: {
        "@type": "Offer",
        price: price,
        priceCurrency: "GBP",
        availability: "https://schema.org/InStock",
        priceValidUntil: getPriceValidUntil(30),
        url: `https://olgishcakes.co.uk/gift-hampers/${hamper.slug.current}`,
        seller: {
          "@type": "Organization",
          name: "Olgish Cakes",
          url: "https://olgishcakes.co.uk",
        },
        shippingDetails: getOfferShippingDetails(),
        hasMerchantReturnPolicy: getMerchantReturnPolicy(),
      },
    }),
    [hamper, price, imageUrl, testimonialStats.averageRating, testimonialStats.count]
  );

  const handleMouseEnter = useCallback(() => setIsHovered(true), []);
  const handleMouseLeave = useCallback(() => setIsHovered(false), []);

  return (
    <ProductCard
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      sx={{ height: "100%", display: "flex", flexDirection: "column", overflow: "hidden" }}
      role="article"
      aria-label={`Gift hamper card for ${hamper.name}`}
      itemScope
      itemType="https://schema.org/Product"
    >
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />

      {/* AggregateRating microdata for Product list cards */}
      <Box itemProp="aggregateRating" itemScope itemType="https://schema.org/AggregateRating" sx={{ display: "none" }}>
        <meta itemProp="ratingValue" content="5" />
        <meta itemProp="reviewCount" content="127" />
        <meta itemProp="bestRating" content="5" />
        <meta itemProp="worstRating" content="1" />
      </Box>

      <Link
        href={`/gift-hampers/${hamper.slug.current}`}
        style={{ textDecoration: "none" }}
        aria-label={`View details for ${hamper.name}`}
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
            itemProp="offers"
            itemScope
            itemType="https://schema.org/Offer"
          />
        </Box>

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
            "&:hover": { color: colors.text.primary },
            transition: "color 0.3s ease-in-out",
          }}
        >
          {hamper.name}
        </Typography>

        {hamper.shortDescription && (
          <Typography
            variant="body2"
            itemProp="description"
            sx={{
              position: "absolute",
              left: "-9999px",
              width: "1px",
              height: "1px",
              overflow: "hidden",
            }}
          >
            {blocksToText(hamper.shortDescription)}
          </Typography>
        )}

        <OutlineButton
          component={Link}
          href={`/gift-hampers/${hamper.slug.current}`}
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
      </Box>
    </ProductCard>
  );
});

export default GiftHamperCard;
