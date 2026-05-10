// UI Components Library using Ukrainian Design System
// This file provides pre-styled components using our design tokens

import React, {
  forwardRef,
  type ElementType,
  type MouseEventHandler,
  type ReactElement,
  type ReactNode,
} from "react";
import {
  Button,
  Card,
  TextField,
  Chip,
  Typography,
  Box,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  IconButton,
  Badge,
  Divider,
} from "@/lib/daisy-ui";
import {
  ShoppingCartIcon,
  FavoriteIcon,
  StarIcon,
  ExpandMoreIcon,
} from "@/lib/daisy-ui";
import { designTokens } from "./design-system";
import { getPriceValidUntil } from "@/app/utils/seo";

const { colors, typography, spacing, borderRadius, shadows, components } = designTokens;

type SxProps = Record<string, unknown> | Array<Record<string, unknown>>;
type ButtonComponentProps = React.ComponentProps<typeof Button>;
type CardComponentProps = React.ComponentProps<typeof Card>;
type TextFieldComponentProps = Omit<React.ComponentProps<typeof TextField>, "size" | "sx"> & {
  sx?: SxProps;
  size?: string | number;
};
type ChipComponentProps = React.ComponentProps<typeof Chip>;
type TypographyComponentProps = React.ComponentProps<typeof Typography>;
type BoxComponentProps = React.ComponentProps<typeof Box>;
type AccordionComponentProps = React.ComponentProps<typeof Accordion>;
type BadgeComponentProps = React.ComponentProps<typeof Badge>;
type DividerComponentProps = React.ComponentProps<typeof Divider>;
type StyledIconElement = ReactElement<{ sx?: SxProps }>;
type FeatureCardProps = CardComponentProps & {
  icon: StyledIconElement;
  title: ReactNode;
  description: ReactNode;
};
type PriceDisplayProps = BoxComponentProps & {
  price: number;
  size?: "small" | "medium" | "large" | "xlarge";
  label?: string;
};
type RatingBadgeProps = BadgeComponentProps & {
  rating: ReactNode;
};
type ActionButtonProps = ButtonComponentProps & {
  onClick?: MouseEventHandler<HTMLElement>;
};
type IconButtonPassThroughProps = {
  className?: string;
  disabled?: boolean;
  id?: string;
  onClick?: MouseEventHandler<HTMLElement>;
  rel?: string;
  target?: string;
  type?: "button" | "submit" | "reset";
};
type AccessibleIconButtonProps = IconButtonPassThroughProps & {
  children: ReactNode;
  ariaLabel: string;
  title?: string;
  component?: ElementType;
  href?: string;
  sx?: SxProps;
};
type FavoriteButtonProps = IconButtonPassThroughProps & {
  isFavorite: boolean;
  title?: string;
  component?: ElementType;
  href?: string;
  sx?: SxProps;
};
type ContactInfoProps = BoxComponentProps & {
  icon: StyledIconElement;
  text: string;
  href?: string;
};

const mergeSx = (sx?: SxProps): Record<string, unknown> => {
  if (!sx) return {};
  if (Array.isArray(sx)) return Object.assign({}, ...sx);
  return sx;
};

// Button Components
export const PrimaryButton = ({ children, sx, ...props }: ButtonComponentProps) => (
  <Button
    variant="contained"
    sx={{
      minHeight: "44px", // WCAG touch target requirement
      minWidth: "44px", // WCAG touch target requirement
      py: 1.5, // 12px vertical padding
      px: 3, // 12px horizontal padding
      borderRadius: borderRadius.lg,
      backgroundColor: colors.primary.main,
      color: colors.primary.contrast,
      fontWeight: typography.fontWeight.semibold,
      fontSize: typography.fontSize.base,
      textTransform: "none",
      boxShadow: shadows.md,
      transition: "all 0.2s ease-in-out",
      "&:hover": {
        backgroundColor: colors.primary.dark,
        transform: "translateY(-1px)",
        boxShadow: shadows.lg,
      },
      "&:active": {
        transform: "translateY(0px)",
      },
      "&:focus": {
        outline: `2px solid ${colors.primary.main}`,
        outlineOffset: "2px",
      },
      ...mergeSx(sx),
    }}
    {...props}
  >
    {children}
  </Button>
);

export const SecondaryButton = ({ children, sx, ...props }: ButtonComponentProps) => (
  <Button
    variant="contained"
    sx={{
      minHeight: "44px", // WCAG touch target requirement
      minWidth: "44px", // WCAG touch target requirement
      py: 1.5, // 12px vertical padding
      px: 3, // 12px horizontal padding
      borderRadius: borderRadius.lg,
      backgroundColor: colors.secondary.main,
      color: colors.secondary.contrast,
      fontWeight: typography.fontWeight.semibold,
      fontSize: typography.fontSize.base,
      textTransform: "none",
      boxShadow: shadows.md,
      transition: "all 0.2s ease-in-out",
      "&:hover": {
        backgroundColor: colors.secondary.dark,
        transform: "translateY(-1px)",
        boxShadow: shadows.lg,
      },
      "&:active": {
        transform: "translateY(0px)",
      },
      "&:focus": {
        outline: `2px solid ${colors.secondary.main}`,
        outlineOffset: "2px",
      },
      ...mergeSx(sx),
    }}
    {...props}
  >
    {children}
  </Button>
);

export const OutlineButton = ({ children, sx, ...props }: ButtonComponentProps) => (
  <Button
    variant="outlined"
    sx={{
      minHeight: "44px", // WCAG touch target requirement
      minWidth: "44px", // WCAG touch target requirement
      py: 1.5, // 12px vertical padding
      px: 3, // 12px horizontal padding
      borderRadius: borderRadius.lg,
      borderColor: colors.primary.main,
      color: colors.primary.main,
      fontWeight: typography.fontWeight.semibold,
      fontSize: typography.fontSize.base,
      textTransform: "none",
      transition: "all 0.2s ease-in-out",
      "&:hover": {
        backgroundColor: colors.primary.main,
        color: colors.primary.contrast,
        transform: "translateY(-1px)",
        boxShadow: shadows.md,
      },
      "&:active": {
        transform: "translateY(0px)",
      },
      "&:focus": {
        outline: `2px solid ${colors.primary.main}`,
        outlineOffset: "2px",
      },
      ...mergeSx(sx),
    }}
    {...props}
  >
    {children}
  </Button>
);

// Card Components
export const ProductCard = ({ children, sx, ...props }: CardComponentProps) => (
  <Card
    sx={{
      ...components.card,
      ...mergeSx(sx),
    }}
    {...props}
  >
    {children}
  </Card>
);

export const FeatureCard = ({ icon, title, description, sx, ...props }: FeatureCardProps) => (
  <Card
    sx={{
      ...components.card,
      textAlign: "center",
      padding: spacing.lg,
      ...mergeSx(sx),
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
export const StyledTextField = ({ sx, size, ...props }: TextFieldComponentProps) => (
  <TextField
    size={typeof size === "number" ? size : undefined}
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
      ...mergeSx(sx),
    }}
    {...props}
  />
);

// Chip Components
export const IngredientChip = ({ label, sx, ...props }: ChipComponentProps) => (
  <Chip
    label={label}
    sx={{
      ...components.chip,
      backgroundColor: colors.background.subtle,
      color: colors.text.primary,
      fontWeight: typography.fontWeight.medium,
      minHeight: "44px", // WCAG touch target requirement for interactive chips
      padding: "8px 16px", // Ensure adequate padding
      ...mergeSx(sx),
    }}
    {...props}
  />
);

export const AllergenChip = ({ label, sx, ...props }: ChipComponentProps) => (
  <Chip
    label={label}
    sx={{
      ...components.chip,
      backgroundColor: "#fdf2f2",
      color: colors.error.main,
      fontWeight: typography.fontWeight.semibold,
      border: `1px solid #fecaca`,
      minHeight: "44px", // WCAG touch target requirement for interactive chips
      padding: "8px 16px", // Ensure adequate padding
      ...mergeSx(sx),
    }}
    {...props}
  />
);

export const CategoryChip = ({ label, sx, ...props }: ChipComponentProps) => (
  <Chip
    label={label}
    sx={{
      ...components.chip,
      backgroundColor: colors.primary.main,
      color: colors.primary.contrast,
      fontWeight: typography.fontWeight.medium,
      minHeight: "44px", // WCAG touch target requirement for interactive chips
      padding: "8px 16px", // Ensure adequate padding
      ...mergeSx(sx),
    }}
    {...props}
  />
);

// Typography Components
export const DisplayHeading = ({ children, sx, ...props }: TypographyComponentProps) => (
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
      ...mergeSx(sx),
    }}
    {...props}
  >
    {children}
  </Typography>
);

export const SectionHeading = ({ children, sx, ...props }: TypographyComponentProps) => (
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
      ...mergeSx(sx),
    }}
    {...props}
  >
    {children}
  </Typography>
);

export const CardHeading = ({ children, sx, ...props }: TypographyComponentProps) => (
  <Typography
    variant="h3"
    sx={{
      fontFamily: typography.fontFamily.display,
      fontWeight: typography.fontWeight.semibold,
      color: colors.text.primary,
      fontSize: typography.fontSize.xl,
      lineHeight: typography.lineHeight.tight,
      ...mergeSx(sx),
    }}
    {...props}
  >
    {children}
  </Typography>
);

export const BodyText = ({ children, sx, ...props }: TypographyComponentProps) => (
  <Typography
    variant="body1"
    sx={{
      color: colors.text.primary,
      lineHeight: typography.lineHeight.relaxed,
      ...mergeSx(sx),
    }}
    {...props}
  >
    {children}
  </Typography>
);

// Layout Components
export const Container = ({ children, sx, ...props }: BoxComponentProps) => (
  <Box
    sx={{
      maxWidth: "1200px",
      margin: "0 auto",
      padding: {
        xs: spacing.md,
        md: spacing.lg,
      },
      ...mergeSx(sx),
    }}
    {...props}
  >
    {children}
  </Box>
);

export const Section = ({ children, sx, ...props }: BoxComponentProps) => (
  <Box
    component="section"
    sx={{
      padding: {
        xs: `${spacing.xl} 0`,
        md: `${spacing["2xl"]} 0`,
      },
      ...mergeSx(sx),
    }}
    {...props}
  >
    {children}
  </Box>
);

// Accordion Component
export const StyledAccordion = ({ title, children, sx, ...props }: AccordionComponentProps & { title: ReactNode }) => (
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
      ...mergeSx(sx),
    }}
    {...props}
  >
    <AccordionSummary
      expandIcon={<ExpandMoreIcon />}
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
}: PriceDisplayProps) => {
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
        ...mergeSx(props.sx),
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
      <meta itemProp="priceValidUntil" content={getPriceValidUntil(30)} />
    </Box>
  );
};

// Rating Badge Component
export const RatingBadge = ({ rating, sx, ...props }: RatingBadgeProps) => (
  <Badge
    badgeContent={rating}
    sx={{
      "& .MuiBadge-badge": {
        backgroundColor: colors.primary.main,
        color: colors.primary.contrast,
        fontWeight: typography.fontWeight.semibold,
        fontSize: typography.fontSize.sm,
        minWidth: "44px", // WCAG touch target requirement
        height: "44px", // WCAG touch target requirement
        borderRadius: "22px", // Half of height for perfect circle
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "8px 12px", // Ensure adequate padding around content
      },
      ...mergeSx(sx),
    }}
    {...props}
  >
    <StarIcon sx={{ color: colors.warning.main, fontSize: "1.2rem" }} />
  </Badge>
);

// Action Button Components
export const AddToCartButton = ({ onClick, sx, ...props }: ActionButtonProps) => (
  <Button
    variant="contained"
    startIcon={<ShoppingCartIcon />}
    onClick={onClick}
    sx={{
      minHeight: "44px", // WCAG touch target requirement
      minWidth: "44px", // WCAG touch target requirement
      py: 1.5, // 12px vertical padding
      px: 3, // 12px horizontal padding
      backgroundColor: colors.primary.main,
      color: colors.primary.contrast,
      fontWeight: typography.fontWeight.medium,
      borderRadius: borderRadius.lg,
      textTransform: "none",
      transition: "all 0.2s ease-in-out",
      "&:hover": {
        backgroundColor: colors.primary.dark,
        transform: "translateY(-1px)",
        boxShadow: shadows.md,
      },
      "&:active": {
        transform: "translateY(0px)",
      },
      "&:focus": {
        outline: `2px solid ${colors.primary.main}`,
        outlineOffset: "2px",
      },
      ...mergeSx(sx),
    }}
    {...props}
  >
    Add to Cart
  </Button>
);

// Accessible IconButton Component with WCAG touch target compliance
export const AccessibleIconButton = forwardRef<HTMLElement, AccessibleIconButtonProps>((function AccessibleIconButton({
  children,
  ariaLabel,
  title,
  component,
  href,
  sx,
  ...props
}, ref) {
  const iconButtonStyles = {
    minWidth: "48px", // WCAG touch target requirement with extra padding
    minHeight: "48px", // WCAG touch target requirement with extra padding
    width: "48px", // Ensure consistent size
    height: "48px", // Ensure consistent size
    padding: "12px", // Ensure adequate padding around icon (48px - 24px = 24px for icon)
    borderRadius: borderRadius.md,
    transition: "all 0.2s ease-in-out",
    "&:hover": {
      backgroundColor: colors.background.subtle,
      transform: "scale(1.05)",
    },
    "&:active": {
      transform: "scale(0.95)",
    },
    "&:focus": {
      outline: `2px solid ${colors.primary.main}`,
      outlineOffset: "2px",
    },
    // Ensure proper spacing between multiple icon buttons
    "& + &": {
      marginLeft: spacing.sm,
    },
    ...mergeSx(sx),
  };

  // If used as a link, ensure aria-label is properly applied
  if (component === "a" || href) {
    return (
      <IconButton
        ref={ref}
        component={component || "a"}
        href={href}
        aria-label={ariaLabel}
        title={title || ariaLabel}
        sx={iconButtonStyles}
        {...props}
      >
        {children}
      </IconButton>
    );
  }

  // Default button behavior
  return (
    <IconButton
      ref={ref}
      aria-label={ariaLabel}
      title={title || ariaLabel}
      sx={iconButtonStyles}
      {...props}
    >
      {children}
    </IconButton>
  );
}));

AccessibleIconButton.displayName = 'AccessibleIconButton';

export const FavoriteButton = ({ isFavorite, onClick, sx, ...props }: FavoriteButtonProps) => (
  <AccessibleIconButton
    onClick={onClick}
    ariaLabel={isFavorite ? "Remove from favorites" : "Add to favorites"}
    sx={{
      color: isFavorite ? colors.error.main : colors.text.secondary,
      "&:hover": {
        color: isFavorite ? colors.error.dark : colors.text.primary,
      },
      ...mergeSx(sx),
    }}
    {...props}
  >
    <FavoriteIcon />
  </AccessibleIconButton>
);

// Contact Info Component
export const ContactInfo = ({ icon, text, href, sx, ...props }: ContactInfoProps) => {
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
        ...mergeSx(sx),
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

// Touch Target Wrapper Component for ensuring proper spacing
export const TouchTargetWrapper = ({ children, sx, ...props }: BoxComponentProps) => (
  <Box
    sx={{
      minHeight: "44px", // WCAG touch target requirement
      minWidth: "44px", // WCAG touch target requirement
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: spacing.sm, // Ensure adequate spacing
      "& > *": {
        // Ensure child elements don't exceed touch target
        maxWidth: "100%",
        maxHeight: "100%",
      },
      ...mergeSx(sx),
    }}
    {...props}
  >
    {children}
  </Box>
);

// Divider Component
export const StyledDivider = ({ sx, ...props }: DividerComponentProps) => (
  <Divider
    sx={{
      borderColor: colors.border.light,
      margin: `${spacing.lg} 0`,
      ...mergeSx(sx),
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

  // Touch Targets
  TouchTargetWrapper,

  // Misc
  StyledDivider,
};

export default UIComponents;
