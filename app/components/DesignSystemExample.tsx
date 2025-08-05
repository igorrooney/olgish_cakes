// Example component demonstrating the Ukrainian Design System usage
// This component shows how to use the design tokens and UI components

import React from "react";
import Link from "next/link";
import { Grid, Box } from "@/lib/mui-optimization";
import { designTokens } from "@/lib/design-system";
import {
  DisplayHeading,
  SectionHeading,
  BodyText,
  PrimaryButton,
  SecondaryButton,
  OutlineButton,
  ProductCard,
  FeatureCard,
  StyledTextField,
  IngredientChip,
  AllergenChip,
  CategoryChip,
  PriceDisplay,
  Container,
  Section,
  StyledAccordion,
  RatingBadge,
  ContactInfo,
  StyledDivider,
} from "@/lib/ui-components";
import {
  CakeOutlinedIcon,
  LocalShippingIcon,
  StarIcon,
  EmailIcon,
  PhoneIcon,
  FavoriteIcon,
} from "@/lib/mui-optimization";

const { colors, spacing } = designTokens;

export function DesignSystemExample() {
  return (
    <Container>
      <Section>
        {/* Typography Examples */}
        <Box sx={{ mb: spacing["4xl"] }}>
          <DisplayHeading sx={{ mb: spacing.xl, textAlign: "center" }}>
            Ukrainian Design System
          </DisplayHeading>

          <SectionHeading sx={{ mb: spacing.lg }}>Typography & Colors</SectionHeading>

          <BodyText sx={{ mb: spacing.lg }}>
            This example demonstrates the Ukrainian-inspired design system with traditional colors,
            typography, and components. The design uses Ukrainian blue (#005BBB) and yellow
            (#FFD700) as primary colors, with warm honey and cream tones for backgrounds.
          </BodyText>
        </Box>

        {/* Button Examples */}
        <Box sx={{ mb: spacing["4xl"] }}>
          <SectionHeading sx={{ mb: spacing.lg }}>Button Components</SectionHeading>

          <Box sx={{ display: "flex", gap: spacing.md, flexWrap: "wrap", mb: spacing.lg }}>
            <PrimaryButton>Primary Button</PrimaryButton>
            <SecondaryButton>Secondary Button</SecondaryButton>
            <OutlineButton>Outline Button</OutlineButton>
          </Box>
        </Box>

        {/* Card Examples */}
        <Box sx={{ mb: spacing["4xl"] }}>
          <SectionHeading sx={{ mb: spacing.lg }}>Card Components</SectionHeading>

          <Grid container spacing={spacing.lg}>
            <Grid item xs={12} md={6}>
              <ProductCard>
                <Box sx={{ textAlign: "center" }}>
                  <CakeOutlinedIcon
                    sx={{ fontSize: "3rem", color: colors.primary.main, mb: spacing.md }}
                  />
                  <SectionHeading sx={{ mb: spacing.sm }}>Honey Cake</SectionHeading>
                  <BodyText sx={{ mb: spacing.lg }}>
                    Traditional Ukrainian honey cake with layers of sweet honey and cream.
                  </BodyText>
                  <PriceDisplay price={24.99} size="large" />
                </Box>
              </ProductCard>
            </Grid>

            <Grid item xs={12} md={6}>
              <FeatureCard
                icon={<LocalShippingIcon />}
                title="Free UK Delivery"
                description="All orders include free delivery across the United Kingdom with tracking."
              />
            </Grid>
          </Grid>
        </Box>

        {/* Form Elements */}
        <Box sx={{ mb: spacing["4xl"] }}>
          <SectionHeading sx={{ mb: spacing.lg }}>Form Elements</SectionHeading>

          <Grid container spacing={spacing.lg}>
            <Grid item xs={12} md={6}>
              <StyledTextField
                fullWidth
                label="Email Address"
                placeholder="Enter your email"
                sx={{ mb: spacing.md }}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <Box sx={{ mb: spacing.md }}>
                <BodyText sx={{ mb: spacing.sm, fontWeight: "medium" }}>Ingredients:</BodyText>
                <Box sx={{ display: "flex", flexWrap: "wrap", gap: spacing.sm }}>
                  <IngredientChip label="Honey" />
                  <IngredientChip label="Flour" />
                  <IngredientChip label="Eggs" />
                  <IngredientChip label="Butter" />
                </Box>
              </Box>

              <Box sx={{ mb: spacing.md }}>
                <BodyText sx={{ mb: spacing.sm, fontWeight: "medium" }}>Allergens:</BodyText>
                <Box sx={{ display: "flex", flexWrap: "wrap", gap: spacing.sm }}>
                  <AllergenChip label="Gluten" />
                  <AllergenChip label="Dairy" />
                </Box>
              </Box>

              <Box>
                <BodyText sx={{ mb: spacing.sm, fontWeight: "medium" }}>Categories:</BodyText>
                <Box sx={{ display: "flex", flexWrap: "wrap", gap: spacing.sm }}>
                  <CategoryChip label="Traditional" />
                  <CategoryChip label="Honey" />
                  <CategoryChip label="Ukrainian" />
                </Box>
              </Box>
            </Grid>
          </Grid>
        </Box>

        {/* Accordion Examples */}
        <Box sx={{ mb: spacing["4xl"] }}>
          <SectionHeading sx={{ mb: spacing.lg }}>Accordion Components</SectionHeading>

          <StyledAccordion title="About Our Cakes" sx={{ mb: spacing.sm }}>
            <BodyText>
              Our cakes are made using traditional Ukrainian recipes passed down through
              generations. Each cake is baked fresh to order using the finest ingredients.
            </BodyText>
          </StyledAccordion>

          <StyledAccordion title="Delivery Information">
            <BodyText sx={{ mb: spacing.md }}>
              We offer free UK delivery on all orders. Delivery typically takes 3-5 working days.
            </BodyText>
            <BodyText>
              For guaranteed delivery on a specific date, please contact us directly.
            </BodyText>
          </StyledAccordion>
        </Box>

        {/* Contact Information */}
        <Box sx={{ mb: spacing["4xl"] }}>
          <SectionHeading sx={{ mb: spacing.lg }}>Contact Information</SectionHeading>

          <Grid container spacing={spacing.lg}>
            <Grid item xs={12} md={6}>
              <Link
                href="mailto:hello@olgishcakes.co.uk"
                style={{ textDecoration: "none", color: "inherit" }}
                aria-label="Email us at hello@olgishcakes.co.uk"
              >
                <ContactInfo icon={<EmailIcon />} text="hello@olgishcakes.co.uk" />
              </Link>
            </Grid>
            <Grid item xs={12} md={6}>
              <Link
                href="tel:+447867218194"
                style={{ textDecoration: "none", color: "inherit" }}
                aria-label="Call us at +44 786 721 8194"
              >
                <ContactInfo icon={<PhoneIcon />} text="+44 786 721 8194" />
              </Link>
            </Grid>
          </Grid>
        </Box>

        {/* Rating Example */}
        <Box sx={{ mb: spacing["4xl"] }}>
          <SectionHeading sx={{ mb: spacing.lg }}>Rating & Reviews</SectionHeading>

          <Box sx={{ display: "flex", alignItems: "center", gap: spacing.md }}>
            <RatingBadge rating={5} />
            <BodyText>Excellent! 5-star rating from our customers</BodyText>
          </Box>
        </Box>

        <StyledDivider />

        {/* Color Palette Display */}
        <Box sx={{ mt: spacing["4xl"] }}>
          <SectionHeading sx={{ mb: spacing.lg }}>Ukrainian Color Palette</SectionHeading>

          <Grid container spacing={spacing.md}>
            <Grid item xs={6} md={2}>
              <Box
                sx={{
                  height: 100,
                  backgroundColor: colors.ukrainian.blue,
                  borderRadius: spacing.sm,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "white",
                  fontWeight: "bold",
                  mb: spacing.sm,
                }}
              >
                Blue
              </Box>
              <BodyText sx={{ fontSize: "0.875rem", textAlign: "center" }}>
                {colors.ukrainian.blue}
              </BodyText>
            </Grid>

            <Grid item xs={6} md={2}>
              <Box
                sx={{
                  height: 100,
                  backgroundColor: colors.ukrainian.yellow,
                  borderRadius: spacing.sm,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: colors.text.primary,
                  fontWeight: "bold",
                  mb: spacing.sm,
                }}
              >
                Yellow
              </Box>
              <BodyText sx={{ fontSize: "0.875rem", textAlign: "center" }}>
                {colors.ukrainian.yellow}
              </BodyText>
            </Grid>

            <Grid item xs={6} md={2}>
              <Box
                sx={{
                  height: 100,
                  backgroundColor: colors.ukrainian.honey,
                  borderRadius: spacing.sm,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "white",
                  fontWeight: "bold",
                  mb: spacing.sm,
                }}
              >
                Honey
              </Box>
              <BodyText sx={{ fontSize: "0.875rem", textAlign: "center" }}>
                {colors.ukrainian.honey}
              </BodyText>
            </Grid>

            <Grid item xs={6} md={2}>
              <Box
                sx={{
                  height: 100,
                  backgroundColor: colors.ukrainian.cream,
                  borderRadius: spacing.sm,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: colors.text.primary,
                  fontWeight: "bold",
                  mb: spacing.sm,
                  border: `1px solid ${colors.border.light}`,
                }}
              >
                Cream
              </Box>
              <BodyText sx={{ fontSize: "0.875rem", textAlign: "center" }}>
                {colors.ukrainian.cream}
              </BodyText>
            </Grid>

            <Grid item xs={6} md={2}>
              <Box
                sx={{
                  height: 100,
                  backgroundColor: colors.ukrainian.berry,
                  borderRadius: spacing.sm,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "white",
                  fontWeight: "bold",
                  mb: spacing.sm,
                }}
              >
                Berry
              </Box>
              <BodyText sx={{ fontSize: "0.875rem", textAlign: "center" }}>
                {colors.ukrainian.berry}
              </BodyText>
            </Grid>
          </Grid>
        </Box>
      </Section>
    </Container>
  );
}
