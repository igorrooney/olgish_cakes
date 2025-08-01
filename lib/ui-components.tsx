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
      color: colors.text.primary,
      lineHeight: typography.lineHeight.relaxed,
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
        xs: spacing.md,
        md: spacing.lg,
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
    component="section"
    sx={{
      padding: {
        xs: `${spacing.xl} 0`,
        md: `${spacing["2xl"]} 0`,
      },
      ...props.sx,
    }}
    {...props}
  >
    {children}
  </Box>
);

// Accordion Component
export const StyledAccordion = ({ title, children, ...props }: any) => (
  <Accordion
    sx={{
      "&:before": {
        display: "none",
      },
      boxShadow: "none",
      border: `1px solid ${colors.border.light}`,
      borderRadius: borderRadius.lg,
      mb: spacing.sm,
      "&:last-child": {
        mb: 0,
      },
      "&.Mui-expanded": {
        margin: `${spacing.sm} 0`,
      },
    }}
    {...props}
  >
    <AccordionSummary
      expandIcon={<ExpandMore />}
      sx={{
        "& .MuiAccordionSummary-content": {
          margin: `${spacing.md} 0`,
        },
      }}
    >
      <Typography
        variant="h6"
        sx={{
          fontFamily: typography.fontFamily.display,
          fontWeight: typography.fontWeight.semibold,
          color: colors.text.primary,
        }}
      >
        {title}
      </Typography>
    </AccordionSummary>
    <AccordionDetails
      sx={{
        padding: `${spacing.md} ${spacing.lg}`,
        paddingTop: 0,
      }}
    >
      {children}
    </AccordionDetails>
  </Accordion>
);

// Price Display Component with SEO enhancements
export const PriceDisplay = ({
  price,
  size = "large" as const,
  label = "",
  ...props
}: {
  price: number;
  size?: "small" | "medium" | "large" | "xlarge";
  label?: string;
  [key: string]: any;
}) => {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-GB", {
      style: "currency",
      currency: "GBP",
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(price);
  };

  const priceText = formatPrice(price);
  const sizeStyles = {
    small: {
      fontSize: typography.fontSize.base,
      fontWeight: typography.fontWeight.medium,
    },
    medium: {
      fontSize: typography.fontSize.lg,
      fontWeight: typography.fontWeight.semibold,
    },
    large: {
      fontSize: typography.fontSize["3xl"],
      fontWeight: typography.fontWeight.bold,
    },
    xlarge: {
      fontSize: typography.fontSize["5xl"],
      fontWeight: typography.fontWeight.bold,
    },
  } as const;

  return (
    <Box
      sx={{
        ...props.sx,
      }}
      {...props}
    >
      {label && (
        <Typography
          variant="caption"
          sx={{
            color: colors.text.secondary,
            fontSize: typography.fontSize.lg,
            fontWeight: typography.fontWeight.medium,
            mb: spacing.xs,
          }}
        >
          {label}{" "}
        </Typography>
      )}
      <Typography
        component="span"
        itemProp="price"
        content={price.toString()}
        sx={{
          color: colors.primary.main,
          ...sizeStyles[size],
          fontFamily: typography.fontFamily.display,
        }}
      >
        {priceText}
      </Typography>
      <meta itemProp="priceCurrency" content="GBP" />
      <meta itemProp="availability" content="https://schema.org/InStock" />
    </Box>
  );
};

// Rating Badge Component
export const RatingBadge = ({ rating, ...props }: any) => (
  <Badge
    badgeContent={rating}
    sx={{
      "& .MuiBadge-badge": {
        backgroundColor: colors.primary.main,
        color: colors.primary.contrast,
        fontWeight: typography.fontWeight.semibold,
        fontSize: typography.fontSize.sm,
        minWidth: "20px",
        height: "20px",
        borderRadius: "10px",
      },
      ...props.sx,
    }}
    {...props}
  >
    <Star sx={{ color: colors.warning.main, fontSize: "1.2rem" }} />
  </Badge>
);

// Action Button Components
export const AddToCartButton = ({ onClick, ...props }: any) => (
  <Button
    variant="contained"
    startIcon={<ShoppingCart />}
    onClick={onClick}
    sx={{
      backgroundColor: colors.primary.main,
      color: colors.primary.contrast,
      "&:hover": {
        backgroundColor: colors.primary.dark,
      },
      fontWeight: typography.fontWeight.medium,
      ...props.sx,
    }}
    {...props}
  >
    Add to Cart
  </Button>
);

export const FavoriteButton = ({ isFavorite, onClick, ...props }: any) => (
  <IconButton
    onClick={onClick}
    sx={{
      color: isFavorite ? colors.error.main : colors.text.secondary,
      "&:hover": {
        color: isFavorite ? colors.error.dark : colors.text.primary,
      },
      ...props.sx,
    }}
    aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
    {...props}
  >
    <Favorite />
  </IconButton>
);

// Contact Info Component
export const ContactInfo = ({ icon, text, href, ...props }: any) => {
  const isPhone = text?.includes("+44") || text?.includes("phone");
  const isEmail = text?.includes("@") || text?.includes("email");

  const getHref = () => {
    if (href) return href;
    if (isPhone) return `tel:${text}`;
    if (isEmail) return `mailto:${text}`;
    return undefined;
  };

  const linkHref = getHref();
  const Component = linkHref ? "a" : "div";

  // Generate accessible label for screen readers
  const getAccessibleLabel = () => {
    if (isPhone) return `Call ${text}`;
    if (isEmail) return `Email ${text}`;
    return text;
  };

  return (
    <Box
      component={Component}
      href={linkHref}
      aria-label={linkHref ? getAccessibleLabel() : undefined}
      title={linkHref ? getAccessibleLabel() : undefined}
      sx={{
        display: "flex",
        alignItems: "center",
        gap: spacing.sm,
        textDecoration: "none",
        color: "inherit",
        cursor: linkHref ? "pointer" : "default",
        transition: "color 0.2s ease",
        "&:hover": linkHref
          ? {
              color: colors.primary.main,
            }
          : {},
        ...props.sx,
      }}
      {...props}
    >
      {React.cloneElement(icon, {
        sx: {
          color: colors.primary.main,
          fontSize: "1.5rem",
        },
      })}
      <Typography
        variant="body2"
        sx={{
          color: "inherit",
          fontWeight: typography.fontWeight.medium,
        }}
      >
        {text}
      </Typography>
    </Box>
  );
};

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
