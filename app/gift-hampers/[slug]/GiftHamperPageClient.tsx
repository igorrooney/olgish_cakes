"use client";

import { Box, Grid, Typography, Button, Container } from "@/lib/mui-optimization";
import { useState } from "react";
import {
  PriceDisplay,
  DisplayHeading,
  StyledAccordion,
  IngredientChip,
  AllergenChip,
} from "@/lib/ui-components";
import { RichTextRenderer } from "@/app/components/RichTextRenderer";
import { HamperImageGallery } from "@/app/components/HamperImageGallery";
import { GiftHamperOrderModal } from "./GiftHamperOrderModal";
import { GiftHamper } from "@/types/giftHamper";
import { designTokens } from "@/lib/design-system";
import Link from "next/link";

const { colors, typography, spacing, shadows } = designTokens;

interface GiftHamperPageClientProps {
  hamper: GiftHamper;
}

export function GiftHamperPageClient({ hamper }: GiftHamperPageClientProps) {
  const primaryImage = hamper.images?.find(img => img.isMain) || hamper.images?.[0];
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);

  return (
    <>
      <Container
        component="article"
        sx={{ maxWidth: "1200px", mx: "auto", py: { xs: 5, md: 10 }, px: { xs: 4, md: 8 } }}
      >
        {/* Title */}
        <DisplayHeading
          component="h1"
          sx={{
            mb: spacing["3xl"],
            textAlign: "center",
            px: { xs: spacing.lg, md: spacing["4xl"] },
          }}
        >
          {hamper.name}
        </DisplayHeading>

        <Grid container spacing={{ xs: 6, md: 12 }} sx={{ mb: spacing["5xl"] }}>
          {/* Gallery */}
          <Grid item xs={12} md={6}>
            <section aria-label="Product images">
              <HamperImageGallery name={hamper.name} images={hamper.images} />
            </section>
          </Grid>

          {/* Sidebar */}
          <Grid item xs={12} md={6}>
            <Box
              component="aside"
              aria-label="Product information and ordering"
              sx={{
                position: "sticky",
                top: 0,
                px: 2.5,
                py: 2.5,
                pl: 3,
                pr: 3,
                mr: { xs: 1, md: 2 },
                backgroundColor: colors.background.paper,
                borderRadius: "35px",
                boxShadow: shadows.lg,
                border: `1px solid ${colors.border.light}`,
                display: "flex",
                flexDirection: "column",
                gap: 2.5,
                minWidth: 0,
              }}
            >
              {/* Price */}
              <section aria-label="Pricing information">
                <PriceDisplay price={hamper.price} size="xlarge" sx={{ ml: 5 }} />
                <Typography
                  component="p"
                  fontSize={typography.fontSize.sm}
                  sx={{ color: colors.grey[500], ml: 5 }}
                >
                  Curated and packed with care
                </Typography>
              </section>

              {/* Short description */}
              {hamper.shortDescription && hamper.shortDescription.length > 0 && (
                <section aria-label="Key features">
                  <RichTextRenderer value={hamper.shortDescription} variant="body2" />
                </section>
              )}

              {/* Order button */}
              <Box component="section" aria-label="Ordering" sx={{ my: 2 }}>
                <Button
                  variant="contained"
                  size="large"
                  aria-label={`Order ${hamper.name} now`}
                  sx={{
                    backgroundColor: colors.primary.main,
                    color: colors.primary.contrast,
                    textTransform: "none",
                    fontWeight: typography.fontWeight.semibold,
                    fontSize: typography.fontSize.lg,
                    px: 3,
                    py: 1.5,
                    borderRadius: 1.5,
                    width: "100%",
                    transition: "all 0.2s ease-in-out",
                    boxShadow: shadows.md,
                    "&:hover": { backgroundColor: colors.primary.dark },
                  }}
                  onClick={() => setIsOrderModalOpen(true)}
                >
                  Order Now
                </Button>
              </Box>

              {/* Details accordions (match cake page layout) */}
              <Box component="section" aria-label="Product details" sx={{ mt: 2 }}>
                {/* Description Accordion */}
                {hamper.description && (
                  <StyledAccordion title="About This Hamper" sx={{ mb: 1 }}>
                    <Box sx={{ fontSize: typography.fontSize.base, lineHeight: 1.7 }}>
                      <RichTextRenderer value={hamper.description} />
                    </Box>
                  </StyledAccordion>
                )}

                {/* Ingredients Accordion */}
                {hamper.ingredients && hamper.ingredients.length > 0 && (
                  <StyledAccordion title="Ingredients" sx={{ mb: 1 }}>
                    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mb: 2 }}>
                      {hamper.ingredients.map((ingredient, index) => (
                        <IngredientChip key={index} label={ingredient} />
                      ))}
                    </Box>

                    {hamper.allergens && hamper.allergens.length > 0 && (
                      <>
                        <Typography
                          component="h4"
                          variant="h6"
                          sx={{
                            mb: 1,
                            color: colors.error.main,
                            fontWeight: typography.fontWeight.semibold,
                          }}
                        >
                          Allergens
                        </Typography>
                        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                          {hamper.allergens.map((allergen, index) => (
                            <AllergenChip key={index} label={allergen} />
                          ))}
                        </Box>
                      </>
                    )}
                  </StyledAccordion>
                )}

                {/* Delivery Accordion */}
                <StyledAccordion title="Delivery">
                  <Typography
                    component="p"
                    variant="body1"
                    sx={{ mb: 1, fontSize: typography.fontSize.base }}
                  >
                    We aim to ship orders within 2-3 working days.
                  </Typography>
                  <Typography
                    component="p"
                    variant="body1"
                    sx={{ fontSize: typography.fontSize.base }}
                  >
                    We offer free UK delivery on all orders. For guaranteed delivery on a specific
                    day, please contact us directly.
                  </Typography>
                </StyledAccordion>
              </Box>
            </Box>
          </Grid>
        </Grid>
      </Container>

      {/* Related Hampers Section for SEO */}
      <Box
        component="section"
        aria-label="Related gift hampers"
        sx={{
          py: { xs: 6, md: 10 },
          px: { xs: 4, md: 8 },
          backgroundColor: colors.background.subtle,
        }}
      >
        <Container>
          <Box sx={{ textAlign: "center", maxWidth: "600px", mx: "auto" }}>
            <Typography
              component="h2"
              variant="h3"
              sx={{
                mb: spacing.lg,
                fontWeight: typography.fontWeight.bold,
                color: colors.text.primary,
              }}
            >
              Explore More Gift Hampers
            </Typography>
            <Typography
              component="p"
              variant="body1"
              sx={{
                mb: spacing["2xl"],
                color: colors.text.secondary,
                fontSize: typography.fontSize.lg,
                lineHeight: 1.6,
              }}
            >
              Discover our curated range of luxury Ukrainian gift hampers, thoughtfully assembled
              for every occasion.
            </Typography>
            <Link href="/gift-hampers" style={{ textDecoration: 'none' }}>
              <Button variant="outlined"
              size="large"
              sx={{
                borderColor: colors.primary.main,
                color: colors.primary.main,
                borderWidth: 2,
                px: 4,
                py: 1.5,
                fontSize: typography.fontSize.lg,
                fontWeight: typography.fontWeight.semibold,
                borderRadius: 2,
                textTransform: "none",
                transition: "all 0.3s ease-in-out",
                "&:hover": {
                  backgroundColor: colors.primary.main,
                  color: colors.primary.contrast,
                  borderColor: colors.primary.main,
                  transform: "translateY(-2px)",
                  boxShadow: shadows.lg,
                },
              }}>
              Browse All Gift Hampers
            </Button>
            </Link>
          </Box>
        </Container>
      </Box>

      <GiftHamperOrderModal
        open={isOrderModalOpen}
        onClose={() => setIsOrderModalOpen(false)}
        hamper={hamper}
      />
    </>
  );
}
