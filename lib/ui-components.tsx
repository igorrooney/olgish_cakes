// UI Components Library using Ukrainian Design System
// This file provides pre-styled components using our design tokens

import React from "react";
import {
  Button,
  Card,
  CardContent,
  TextField,
  Chip,
  Typography,
  Box,
  Paper,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  IconButton,
  Badge,
  Divider,
} from "@mui/material";
import {
  ShoppingCart,
  Favorite,
  Star,
  ExpandMore,
  ArrowForward,
  LocalShipping,
  Cake,
  Email,
  Phone,
} from "@mui/icons-material";
import { designTokens } from "./design-system";

const { colors, typography, spacing, borderRadius, shadows, components } = designTokens;

// Button Components
export const PrimaryButton = ({ children, ...props }: any) => (
  <Button
    variant="contained"
    sx={{
      ...components.button.primary,
      ...props.sx,
    }}
    {...props}
  >
    {children}
  </Button>
);

export const SecondaryButton = ({ children, ...props }: any) => (
  <Button
    variant="contained"
    sx={{
      ...components.button.secondary,
      ...props.sx,
    }}
    {...props}
  >
    {children}
  </Button>
);

export const OutlineButton = ({ children, ...props }: any) => (
  <Button
    variant="outlined"
    sx={{
      ...components.button.outline,
      ...props.sx,
    }}
    {...props}
  >
    {children}
  </Button>
);

// Card Components
export const ProductCard = ({ children, ...props }: any) => (
  <Card
    sx={{
      ...components.card,
      ...props.sx,
    }}
    {...props}
  >
    {children}
  </Card>
);

export const FeatureCard = ({ icon, title, description, ...props }: any) => (
  <Card
    sx={{
      ...components.card,
      textAlign: "center",
      padding: spacing.lg,
      ...props.sx,
    }}
    {...props}
  >
    <Box sx={{ mb: spacing.md }}>
      {React.cloneElement(icon, {
        sx: {
          fontSize: "3rem",
          color: colors.primary.main,
        },
      })}
    </Box>
    <Typography
      variant="h6"
      sx={{
        fontFamily: typography.fontFamily.display,
        fontWeight: typography.fontWeight.semibold,
        color: colors.text.primary,
        mb: spacing.sm,
      }}
    >
      {title}
    </Typography>
    <Typography
      variant="body2"
      sx={{
        color: colors.text.secondary,
        lineHeight: typography.lineHeight.relaxed,
      }}
    >
      {description}
    </Typography>
  </Card>
);

// Input Components
export const StyledTextField = ({ ...props }: any) => (
  <TextField
    sx={{
      "& .MuiOutlinedInput-root": {
        borderRadius: borderRadius.lg,
        "& fieldset": {
          borderColor: colors.border.medium,
        },
        "&:hover fieldset": {
          borderColor: colors.border.dark,
        },
        "&.Mui-focused fieldset": {
          borderColor: colors.primary.main,
        },
      },
      "& .MuiOutlinedInput-input": {
        padding: `${spacing.md} ${spacing.lg}`,
        fontSize: typography.fontSize.base,
        color: colors.text.primary,
      },
      ...props.sx,
    }}
    {...props}
  />
);

// Chip Components
export const IngredientChip = ({ label, ...props }: any) => (
  <Chip
    label={label}
    sx={{
      ...components.chip,
      backgroundColor: colors.background.subtle,
      color: colors.text.primary,
      fontWeight: typography.fontWeight.medium,
      ...props.sx,
    }}
    {...props}
  />
);

export const AllergenChip = ({ label, ...props }: any) => (
  <Chip
    label={label}
    sx={{
      ...components.chip,
      backgroundColor: "#fdf2f2",
      color: colors.error.main,
      fontWeight: typography.fontWeight.semibold,
      border: `1px solid #fecaca`,
      ...props.sx,
    }}
    {...props}
  />
);

export const CategoryChip = ({ label, ...props }: any) => (
  <Chip
    label={label}
    sx={{
      ...components.chip,
      backgroundColor: colors.primary.main,
      color: colors.primary.contrast,
      fontWeight: typography.fontWeight.medium,
      ...props.sx,
    }}
    {...props}
  />
);

// Typography Components
export const DisplayHeading = ({ children, ...props }: any) => (
  <Typography
    variant="h1"
    sx={{
      fontFamily: typography.fontFamily.display,
      fontWeight: typography.fontWeight.bold,
      color: colors.text.primary,
      fontSize: {
        xs: typography.fontSize["3xl"],
        md: typography.fontSize["5xl"],
      },
      lineHeight: typography.lineHeight.tight,
      letterSpacing: typography.letterSpacing.tight,
      ...props.sx,
    }}
    {...props}
  >
    {children}
  </Typography>
);

export const SectionHeading = ({ children, ...props }: any) => (
  <Typography
    variant="h2"
    sx={{
      fontFamily: typography.fontFamily.display,
      fontWeight: typography.fontWeight.semibold,
      color: colors.text.primary,
      fontSize: {
        xs: typography.fontSize["2xl"],
        md: typography.fontSize["4xl"],
      },
      lineHeight: typography.lineHeight.tight,
      ...props.sx,
    }}
    {...props}
  >
    {children}
  </Typography>
);

export const CardHeading = ({ children, ...props }: any) => (
  <Typography
    variant="h3"
    sx={{
      fontFamily: typography.fontFamily.display,
      fontWeight: typography.fontWeight.semibold,
      color: colors.text.primary,
      fontSize: typography.fontSize.xl,
      lineHeight: typography.lineHeight.tight,
      ...props.sx,
    }}
    {...props}
  >
    {children}
  </Typography>
);

export const BodyText = ({ children, ...props }: any) => (
  <Typography
    variant="body1"
    sx={{
      fontFamily: typography.fontFamily.primary,
      fontSize: typography.fontSize.base,
      lineHeight: typography.lineHeight.relaxed,
      color: colors.text.primary,
      ...props.sx,
    }}
    {...props}
  >
    {children}
  </Typography>
);

// Layout Components
export const Container = ({ children, ...props }: any) => (
  <Box
    sx={{
      maxWidth: "1200px",
      margin: "0 auto",
      padding: {
        xs: `0 ${spacing.md}`,
        md: `0 ${spacing.lg}`,
      },
      ...props.sx,
    }}
    {...props}
  >
    {children}
  </Box>
);

export const Section = ({ children, ...props }: any) => (
  <Box
    sx={{
      padding: {
        xs: `${spacing["2xl"]} 0`,
        md: `${spacing["4xl"]} 0`,
      },
      ...props.sx,
    }}
    {...props}
  >
    {children}
  </Box>
);

// Accordion Components
export const StyledAccordion = ({ title, children, ...props }: any) => (
  <Accordion
    elevation={0}
    sx={{
      backgroundColor: colors.background.subtle,
      border: `1px solid ${colors.border.light}`,
      borderRadius: borderRadius.lg,
      mb: spacing.sm,
      "&:before": {
        display: "none",
      },
      ...props.sx,
    }}
    {...props}
  >
    <AccordionSummary
      expandIcon={<ExpandMore sx={{ color: colors.text.primary }} />}
      sx={{
        "& .MuiAccordionSummary-content": {
          margin: `${spacing.sm} 0`,
        },
      }}
    >
      <Typography
        variant="h6"
        sx={{
          fontWeight: typography.fontWeight.semibold,
          color: colors.text.primary,
          fontSize: typography.fontSize.lg,
        }}
      >
        {title}
      </Typography>
    </AccordionSummary>
    <AccordionDetails sx={{ pt: 0 }}>{children}</AccordionDetails>
  </Accordion>
);

// Price Display Component
export const PriceDisplay = ({ price, size = "large", ...props }: any) => (
  <Typography
    variant={size === "large" ? "h2" : "h4"}
    sx={{
      fontFamily: typography.fontFamily.display,
      fontWeight: typography.fontWeight.bold,
      color: colors.primary.main,
      fontSize:
        size === "large"
          ? {
              xs: typography.fontSize["3xl"],
              md: typography.fontSize["4xl"],
            }
          : typography.fontSize["2xl"],
      ...props.sx,
    }}
    {...props}
  >
    £{price}
  </Typography>
);

// Badge Components
export const RatingBadge = ({ rating, ...props }: any) => (
  <Badge
    badgeContent={rating}
    sx={{
      "& .MuiBadge-badge": {
        backgroundColor: colors.secondary.main,
        color: colors.secondary.contrast,
        fontWeight: typography.fontWeight.semibold,
      },
      ...props.sx,
    }}
    {...props}
  >
    <Star sx={{ color: colors.secondary.main }} />
  </Badge>
);

// Action Button Components
export const AddToCartButton = ({ onClick, ...props }: any) => (
  <PrimaryButton
    startIcon={<ShoppingCart />}
    onClick={onClick}
    sx={{
      width: "100%",
      py: spacing.md,
      ...props.sx,
    }}
    {...props}
  >
    Add to Cart
  </PrimaryButton>
);

export const FavoriteButton = ({ isFavorite, onClick, ...props }: any) => (
  <IconButton
    onClick={onClick}
    sx={{
      color: isFavorite ? colors.error.main : colors.text.secondary,
      "&:hover": {
        color: colors.error.main,
        backgroundColor: colors.background.subtle,
      },
      ...props.sx,
    }}
    {...props}
  >
    <Favorite />
  </IconButton>
);

// Contact Components
export const ContactInfo = ({ icon, text, ...props }: any) => (
  <Box
    sx={{
      display: "flex",
      alignItems: "center",
      gap: spacing.sm,
      color: colors.text.secondary,
      ...props.sx,
    }}
    {...props}
  >
    {React.cloneElement(icon, {
      sx: {
        fontSize: "1.25rem",
        color: colors.primary.main,
      },
    })}
    <Typography
      variant="body2"
      sx={{
        color: colors.text.secondary,
        fontWeight: typography.fontWeight.medium,
      }}
    >
      {text}
    </Typography>
  </Box>
);

// Divider Component
export const StyledDivider = ({ ...props }: any) => (
  <Divider
    sx={{
      borderColor: colors.border.light,
      margin: `${spacing.lg} 0`,
      ...props.sx,
    }}
    {...props}
  />
);

// Export all components
export const UIComponents = {
  // Buttons
  PrimaryButton,
  SecondaryButton,
  OutlineButton,
  AddToCartButton,
  FavoriteButton,

  // Cards
  ProductCard,
  FeatureCard,

  // Inputs
  StyledTextField,

  // Chips
  IngredientChip,
  AllergenChip,
  CategoryChip,

  // Typography
  DisplayHeading,
  SectionHeading,
  CardHeading,
  BodyText,
  PriceDisplay,

  // Layout
  Container,
  Section,

  // Accordions
  StyledAccordion,

  // Badges
  RatingBadge,

  // Contact
  ContactInfo,

  // Misc
  StyledDivider,
};

export default UIComponents;
