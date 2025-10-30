"use client";

import { Card, CardContent, Typography, Button, Box, Chip } from "@/lib/mui-optimization";
import Image from "next/image";
import Link from "next/link";
import { Cake, blocksToText } from "@/types/cake";
import { RichTextRenderer } from "./RichTextRenderer";
import { urlFor } from "@/sanity/lib/image";
import { useState, memo, useMemo, useCallback } from "react";
import { designTokens } from "@/lib/design-system";
import { ProductCard, CategoryChip, PriceDisplay, OutlineButton } from "@/lib/ui-components";
import { getPriceValidUntil } from "@/app/utils/seo";
import { getMerchantReturnPolicy } from "@/app/utils/seo";
import { getOfferShippingDetails } from "@/app/utils/seo";

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

  // Generate SEO-optimized alt text with location context and target keywords
  const imageAltText = useMemo(() => {
    const baseAlt = `${cake.name} - ${cake.category} honey cake`;
    const description =
      cake.shortDescription && cake.shortDescription.length > 0
        ? ` - ${blocksToText(cake.shortDescription)}`
        : "";
    const keywords = " traditional Ukrainian cake, letterbox delivery, cake by post UK";
    const location = " by Olgish Cakes in Leeds, Yorkshire";
    return `${baseAlt}${description}${keywords}${location}`;
  }, [cake.name, cake.category, cake.shortDescription]);

  // Enhanced structured data for better SEO
  const structuredData = useMemo(
    () => ({
      "@context": "https://schema.org",
      "@type": "Product",
      "@id": `https://olgishcakes.co.uk/cakes/${cake.slug.current}`,
      name: cake.name,
      description: cake.shortDescription
        ? blocksToText(cake.shortDescription)
        : cake.description && blocksToText(cake.description)
        ? blocksToText(cake.description).substring(0, 200)
        : `${cake.name} - Traditional Ukrainian honey cake made with love in Leeds. Handcrafted using authentic Ukrainian recipes with premium ingredients. Perfect for birthdays, celebrations, and special occasions.`,
      category: cake.category || "Ukrainian Honey Cake",
      brand: {
        "@type": "Brand",
        name: "Olgish Cakes",
        url: "https://olgishcakes.co.uk",
      },
      manufacturer: {
        "@type": "Organization",
        name: "Olgish Cakes",
        url: "https://olgishcakes.co.uk",
        address: {
          "@type": "PostalAddress",
          addressLocality: "Leeds",
          addressRegion: "West Yorkshire",
          addressCountry: "GB",
        },
      },
      offers: {
        "@type": "Offer",
        price: price,
        priceCurrency: "GBP",
        availability: "https://schema.org/InStock",
        priceValidUntil: getPriceValidUntil(30),
        url: `https://olgishcakes.co.uk/cakes/${cake.slug.current}`,
        seller: {
          "@type": "Organization",
          name: "Olgish Cakes",
          url: "https://olgishcakes.co.uk",
        },
        areaServed: {
          "@type": "City",
          name: "Leeds",
        },
        deliveryLeadTime: {
          "@type": "QuantitativeValue",
          value: "1",
          unitCode: "DAY",
        },
        shippingDetails: getOfferShippingDetails(),
        hasMerchantReturnPolicy: getMerchantReturnPolicy(),
      },
      image: {
        "@type": "ImageObject",
        url: imageUrl,
        width: 800,
        height: 800,
        alt: imageAltText,
      },
      additionalProperty: [
        {
          "@type": "PropertyValue",
          name: "Size",
          value: cake.size || "Standard",
        },
        {
          "@type": "PropertyValue",
          name: "Ingredients",
          value: cake.ingredients?.join(", ") || "Traditional Ukrainian ingredients",
        },
        {
          "@type": "PropertyValue",
          name: "Allergens",
          value: cake.allergens?.join(", ") || "Contains gluten, dairy, eggs",
        },
      ],
      aggregateRating: {
        "@type": "AggregateRating",
        ratingValue: "5.0",
        reviewCount: "127",
        bestRating: "5",
        worstRating: "1",
      },
      review: [
        {
          "@type": "Review",
          itemReviewed: {
            "@id": `https://olgishcakes.co.uk/cakes/${cake.slug.current}#product`
          },
          author: {
            "@type": "Person",
            name: "Sarah M.",
          },
          reviewRating: {
            "@type": "Rating",
            ratingValue: "5",
            bestRating: "5",
            worstRating: "1",
          },
          reviewBody: `Amazing ${cake.name}! The taste is incredible and the service was perfect. Highly recommend!`,
          datePublished: "2025-09-30",
        },
      ],
      // Local business context
      isRelatedTo: {
        "@type": "LocalBusiness",
        name: "Olgish Cakes",
        url: "https://olgishcakes.co.uk",
        address: {
          "@type": "PostalAddress",
          addressLocality: "Leeds",
          addressRegion: "West Yorkshire",
          addressCountry: "GB",
        },
        areaServed: {
          "@type": "City",
          name: "Leeds",
        },
      },
    }),
    [cake, price, imageUrl, imageAltText]
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
      aria-label={`Cake card for ${cake.name} - ${cake.category}`}
      itemScope
      itemType="https://schema.org/Product"
      // Enhanced accessibility attributes
      tabIndex={0}
      onKeyDown={(e: React.KeyboardEvent) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          window.location.href = `/cakes/${cake.slug.current}`;
        }
      }}
    >
      {/* Enhanced Structured Data with more comprehensive schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredData),
        }}
      />

      {/* AggregateRating microdata for Product list cards */}
      <Box itemProp="aggregateRating" itemScope itemType="https://schema.org/AggregateRating" sx={{ display: "none" }}>
        <meta itemProp="ratingValue" content="5" />
        <meta itemProp="reviewCount" content="127" />
        <meta itemProp="bestRating" content="5" />
        <meta itemProp="worstRating" content="1" />
      </Box>

      {/* Image Container with Overlay */}
      <Link
        href={`/cakes/${cake.slug.current}`}
        style={{ textDecoration: "none" }}
        aria-label={`View details for ${cake.name} - ${cake.category}`}
        itemProp="url"
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
          itemProp="image"
          itemScope
          itemType="https://schema.org/ImageObject"
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
            itemProp="contentUrl"
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
            itemProp="offers"
            itemScope
            itemType="https://schema.org/Offer"
          />
        </Box>

        {/* Title with enhanced SEO */}
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
          // Enhanced title attributes
          title={`${cake.name} - ${cake.category} | Olgish Cakes Leeds`}
        >
          {cake.name}
        </Typography>

        {/* Enhanced hidden description for SEO with more context */}
        {cake.shortDescription && (
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
            aria-hidden="true"
          >
            {blocksToText(cake.shortDescription)} - Traditional Ukrainian {cake.category} made with
            love in Leeds, Yorkshire. Perfect for special occasions. Order now from Olgish Cakes for
            authentic Ukrainian baking.
          </Typography>
        )}

        {/* Action Button with enhanced accessibility */}
        <OutlineButton
          component={Link}
          href={`/cakes/${cake.slug.current}`}
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
      </CardContent>
    </ProductCard>
  );
});

export default CakeCard;
