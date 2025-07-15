"use client";

import { BackButton } from "@/app/components/BackButton";
import { CakeImageGallery } from "@/app/components/CakeImageGallery";
import { DesignSelector, DesignType } from "@/app/components/DesignSelector";
import { TrustpilotReviews } from "@/app/components/TrustpilotReviews";
import { designTokens } from "@/lib/design-system";
import {
  AllergenChip,
  BodyText,
  Container as DesignContainer,
  DisplayHeading,
  IngredientChip,
  PriceDisplay,
  StyledAccordion,
} from "@/lib/ui-components";
import { Cake } from "@/types/cake";
import { RichTextRenderer } from "@/app/components/RichTextRenderer";
import { Box, Button, Chip, Divider, Grid, Paper, Typography } from "@mui/material";
import { useState } from "react";
import { OrderModal } from "./OrderModal";
import Link from "next/link";

const { colors, typography, spacing, borderRadius, shadows } = designTokens;

interface PageProps {
  cake: Cake;
}

export function CakePageClient({ cake }: PageProps) {
  const [designType, setDesignType] = useState<DesignType>("standard");
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const hasIndividualDesigns = Boolean(cake.designs?.individual?.length);
  const currentPrice = designType === "standard" ? cake.pricing.standard : cake.pricing.individual;

  const handleDesignTypeChange = (newDesignType: DesignType) => {
    setDesignType(newDesignType);
  };

  return (
    <main role="main" aria-label={`${cake.name} product details`}>
      <DesignContainer
        component="article"
        sx={{ maxWidth: "1200px", mx: "auto", py: { xs: 5, md: 10 }, px: { xs: 4, md: 8 } }}
      >
        {/* Product Title */}
        <DisplayHeading
          component="h1"
          sx={{
            mb: spacing["3xl"],
            textAlign: "center",
            px: { xs: spacing.lg, md: spacing["4xl"] },
          }}
        >
          {cake.name}
        </DisplayHeading>

        <Grid container spacing={{ xs: 6, md: 12 }} sx={{ mb: spacing["5xl"] }}>
          {/* Product Images */}
          <Grid item xs={12} md={6}>
            <section aria-label="Product images">
              <CakeImageGallery
                designs={cake.designs}
                name={cake.name}
                designType={designType}
                onDesignTypeChange={handleDesignTypeChange}
                hideDesignSelector
              />
            </section>
          </Grid>

          {/* Product Details */}
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
                borderRadius: 1.5,
                boxShadow: shadows.lg,
                border: `1px solid ${colors.border.light}`,
                display: "flex",
                flexDirection: "column",
                gap: 2.5,
                minWidth: 0,
              }}
            >
              {/* Price Section */}
              <section aria-label="Pricing information">
                <PriceDisplay
                  price={currentPrice}
                  size="medium"
                  sx={{ ml: 5, fontSize: typography.fontSize["5xl"] }}
                />
                <Typography
                  component="p"
                  fontSize={typography.fontSize.sm}
                  sx={{ color: colors.grey[500], ml: 5 }}
                  aria-label="Baking information"
                >
                  Freshly Baked to Order
                </Typography>
              </section>

              {/* Design Selector */}
              {hasIndividualDesigns && (
                <section aria-label="Design options">
                  <Box sx={{ mb: 2 }}>
                    <DesignSelector
                      hasIndividualDesigns={hasIndividualDesigns}
                      onChange={setDesignType}
                      value={designType}
                    />
                  </Box>
                </section>
              )}

              {/* Key Features */}
              <Paper
                component="section"
                aria-label="Product description"
                elevation={0}
                sx={{
                  p: 2,
                  mb: 2,
                }}
              >
                <Box
                  sx={{
                    textAlign: "left",
                    fontSize: typography.fontSize.lg,
                  }}
                >
                  {cake.shortDescription && cake.shortDescription.length > 0 ? (
                    <RichTextRenderer
                      value={cake.shortDescription}
                      variant="body2"
                      sx={{
                        textAlign: "left",
                        fontSize: typography.fontSize.lg,
                      }}
                    />
                  ) : (
                    <Typography
                      component="p"
                      variant="body2"
                      sx={{
                        textAlign: "center",
                        fontStyle: "italic",
                        color: colors.text.secondary,
                        fontSize: typography.fontSize.lg,
                      }}
                    >
                      Freshly baked to order with free UK delivery and gift note included.
                    </Typography>
                  )}
                </Box>
              </Paper>

              {/* Order Button */}
              <Box component="section" aria-label="Ordering" sx={{ my: 2 }}>
                <Button
                  variant="contained"
                  size="large"
                  onClick={() => setIsOrderModalOpen(true)}
                  aria-label={`Order ${cake.name} now`}
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
                    "&:hover": {
                      backgroundColor: colors.primary.dark,
                      transform: "translateY(-2px)",
                      boxShadow: shadows.lg,
                    },
                  }}
                >
                  Order Now
                </Button>
              </Box>

              {/* Collapsible Sections */}
              <Box component="section" aria-label="Product details" sx={{ mt: 2 }}>
                {/* Description Accordion */}
                <StyledAccordion title="About This Cake" sx={{ mb: 1 }}>
                  <Box sx={{ fontSize: typography.fontSize.base, lineHeight: 1.7 }}>
                    <RichTextRenderer value={cake.description} />
                  </Box>
                </StyledAccordion>

                {/* Ingredients Accordion */}
                <StyledAccordion title="Ingredients" sx={{ mb: 1 }}>
                  <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mb: 2 }}>
                    {cake.ingredients.map((ingredient, index) => (
                      <IngredientChip key={index} label={ingredient} />
                    ))}
                  </Box>

                  {cake.allergens && cake.allergens.length > 0 && (
                    <>
                      <Divider sx={{ my: 2 }} />
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
                        {cake.allergens.map((allergen, index) => (
                          <AllergenChip key={index} label={allergen} />
                        ))}
                      </Box>
                    </>
                  )}
                </StyledAccordion>

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
      </DesignContainer>

      {/* Related Cakes Section for SEO */}
      <Box
        component="section"
        aria-label="Related cakes"
        sx={{
          py: { xs: 6, md: 10 },
          px: { xs: 4, md: 8 },
          backgroundColor: colors.background.subtle,
        }}
      >
        <DesignContainer>
          <Box
            sx={{
              textAlign: "center",
              maxWidth: "600px",
              mx: "auto",
            }}
          >
            <Typography
              component="h2"
              variant="h3"
              sx={{
                mb: spacing.lg,
                fontWeight: typography.fontWeight.bold,
                color: colors.text.primary,
              }}
            >
              Explore More Ukrainian Cakes
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
              Discover our complete collection of traditional Ukrainian cakes, each made with
              authentic recipes and premium ingredients.
            </Typography>

            <Button
              component={Link}
              href="/cakes"
              variant="outlined"
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
              }}
            >
              Browse All Cakes
            </Button>
          </Box>
        </DesignContainer>
      </Box>

      <TrustpilotReviews productName={cake.name} />

      <OrderModal
        open={isOrderModalOpen}
        onClose={() => setIsOrderModalOpen(false)}
        cake={cake}
        designType={designType}
        onDesignTypeChange={handleDesignTypeChange}
      />
    </main>
  );
}
