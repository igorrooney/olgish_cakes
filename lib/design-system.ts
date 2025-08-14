// Ukrainian Design System for Olgish Cakes
// Inspired by Ukrainian culture and traditional colors

export const colors = {
  // Primary Ukrainian Colors
  ukrainian: {
    blue: "#2E3192", // Traditional Ukrainian blue
    yellow: "#FEF102", // Traditional Ukrainian yellow
    honey: "#D4A76A", // Honey Cake color
    cream: "#FFF5E6", // Cream color for Kyiv Cake
    berry: "#8B0000", // Deep berry color for traditional desserts
  },

  // Semantic Colors
  primary: {
    main: "#2E3192",
    light: "#1E4A73", // Balanced tone for WCAG AA compliance with dark text
    dark: "#003D7A",
    contrast: "#FFFFFF",
  },
  secondary: {
    main: "#FEF102",
    light: "#FFE44D",
    dark: "#867100", // Darkened for better contrast with white text (4.8:1)
    contrast: "#2D2D2D",
  },

  // Background Colors
  background: {
    default: "#FFF8E7", // Light honey color
    paper: "#FFFFFF",
    subtle: "#FFF5E6", // Cream
    warm: "#FEF9F0", // Very light honey
  },

  // Text Colors
  text: {
    primary: "#2D2D2D",
    secondary: "#666666",
    disabled: "#999999",
    inverse: "#FFFFFF",
  },

  // Status Colors
  success: {
    main: "#1D8348", // Darkened for WCAG AA compliance (4.78:1 with white)
    light: "#6FCF97",
    dark: "#1E8449",
  },
  warning: {
    main: "#F39C12",
    light: "#F7DC6F",
    dark: "#D68910",
  },
  error: {
    main: "#D04436", // Darkened for WCAG AA compliance (4.6:1 with white)
    light: "#F1948A",
    dark: "#C0392B",
  },
  info: {
    main: "#2A7AAF", // Darkened for WCAG AA compliance (4.67:1 with white)
    light: "#85C1E9",
    dark: "#2874A6",
  },

  // Neutral Colors
  grey: {
    50: "#FAFAFA",
    100: "#F5F5F5",
    200: "#EEEEEE",
    300: "#E0E0E0",
    400: "#BDBDBD",
    500: "#9E9E9E",
    600: "#757575",
    700: "#616161",
    800: "#424242",
    900: "#212121",
  },

  // Border Colors
  border: {
    light: "#E0E0E0",
    medium: "#BDBDBD",
    dark: "#757575",
  },
} as const;

export const typography = {
  fontFamily: {
    primary: "var(--font-playfair-display), Georgia, serif",
    display: "var(--font-playfair-display), Georgia, serif",
    mono: "ui-monospace, SFMono-Regular, 'SF Mono', Consolas, 'Liberation Mono', Menlo, monospace",
  },

  fontSize: {
    xs: "0.75rem", // 12px
    sm: "0.875rem", // 14px
    base: "1rem", // 16px
    lg: "1.125rem", // 18px
    xl: "1.25rem", // 20px
    "2xl": "1.5rem", // 24px
    "3xl": "1.875rem", // 30px
    "4xl": "2.25rem", // 36px
    "5xl": "3rem", // 48px
    "6xl": "3.75rem", // 60px
  },

  fontWeight: {
    light: 300,
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
    extrabold: 800,
  },

  lineHeight: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.75,
    loose: 2,
  },

  letterSpacing: {
    tight: "-0.025em",
    normal: "0em",
    wide: "0.025em",
    wider: "0.05em",
  },
} as const;

export const spacing = {
  xs: "0.25rem", // 4px
  sm: "0.5rem", // 8px
  md: "1rem", // 16px
  lg: "1.5rem", // 24px
  xl: "2rem", // 32px
  "2xl": "3rem", // 48px
  "3xl": "4rem", // 64px
  "4xl": "6rem", // 96px
  "5xl": "8rem", // 128px
} as const;

export const borderRadius = {
  none: "0",
  sm: "0.125rem", // 2px
  base: "0.25rem", // 4px
  md: "0.375rem", // 6px
  lg: "0.5rem", // 8px
  xl: "0.75rem", // 12px
  "2xl": "1rem", // 16px
  "3xl": "1.5rem", // 24px
  full: "9999px",
} as const;

export const shadows = {
  sm: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
  base: "0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)",
  md: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
  lg: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
  xl: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
  "2xl": "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
  inner: "inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)",
  none: "none",
} as const;

export const breakpoints = {
  xs: "0px",
  sm: "600px",
  md: "900px",
  lg: "1200px",
  xl: "1536px",
} as const;

// Component-specific design tokens
export const components = {
  button: {
    primary: {
      backgroundColor: colors.primary.main,
      color: colors.primary.contrast,
      border: "none",
      borderRadius: borderRadius.lg,
      padding: `${spacing.md} ${spacing.xl}`,
      fontSize: typography.fontSize.base,
      fontWeight: typography.fontWeight.semibold,
      textTransform: "none",
      transition: "all 0.2s ease-in-out",
      "&:hover": {
        backgroundColor: colors.primary.dark,
        transform: "translateY(-1px)",
        boxShadow: shadows.md,
      },
      "&:active": {
        transform: "translateY(0)",
      },
    },
    secondary: {
      backgroundColor: colors.secondary.main,
      color: colors.secondary.contrast,
      border: "none",
      borderRadius: borderRadius.lg,
      padding: `${spacing.md} ${spacing.xl}`,
      fontSize: typography.fontSize.base,
      fontWeight: typography.fontWeight.semibold,
      textTransform: "none",
      transition: "all 0.2s ease-in-out",
      "&:hover": {
        backgroundColor: colors.secondary.dark,
        transform: "translateY(-1px)",
        boxShadow: shadows.md,
      },
    },
    outline: {
      backgroundColor: "transparent",
      color: colors.primary.main,
      border: `2px solid ${colors.primary.main}`,
      borderRadius: borderRadius.lg,
      padding: `${spacing.md} ${spacing.xl}`,
      fontSize: typography.fontSize.base,
      fontWeight: typography.fontWeight.semibold,
      textTransform: "none",
      transition: "all 0.2s ease-in-out",
      "&:hover": {
        backgroundColor: colors.primary.main,
        color: colors.primary.contrast,
      },
    },
  },

  card: {
    backgroundColor: colors.background.paper,
    borderRadius: borderRadius.xl,
    boxShadow: shadows.base,
    padding: spacing.lg,
    border: `1px solid ${colors.border.light}`,
    transition: "all 0.2s ease-in-out",
    "&:hover": {
      boxShadow: shadows.lg,
      transform: "translateY(-2px)",
    },
  },

  input: {
    backgroundColor: colors.background.paper,
    border: `1px solid ${colors.border.medium}`,
    borderRadius: borderRadius.md,
    padding: `${spacing.md} ${spacing.lg}`,
    fontSize: typography.fontSize.base,
    color: colors.text.primary,
    transition: "all 0.2s ease-in-out",
    "&:focus": {
      outline: "none",
      borderColor: colors.primary.main,
      boxShadow: `0 0 0 3px ${colors.primary.light}20`,
    },
    "&:hover": {
      borderColor: colors.border.dark,
    },
  },

  chip: {
    backgroundColor: colors.background.subtle,
    color: colors.text.primary,
    borderRadius: borderRadius.full,
    padding: `${spacing.xs} ${spacing.md}`,
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    border: `1px solid ${colors.border.light}`,
  },
} as const;

// Layout tokens
export const layout = {
  container: {
    maxWidth: "1200px",
    padding: `0 ${spacing.lg}`,
    margin: "0 auto",
  },

  section: {
    padding: `${spacing["4xl"]} 0`,
  },

  grid: {
    gap: spacing.lg,
  },
} as const;

// Animation tokens
export const animation = {
  duration: {
    fast: "0.15s",
    normal: "0.3s",
    slow: "0.5s",
  },

  easing: {
    ease: "ease",
    easeIn: "ease-in",
    easeOut: "ease-out",
    easeInOut: "ease-in-out",
  },

  transitions: {
    fast: "all 0.15s ease-in-out",
    normal: "all 0.3s ease-in-out",
    slow: "all 0.5s ease-in-out",
  },
} as const;

// Z-index scale
export const zIndex = {
  dropdown: 1000,
  sticky: 1020,
  fixed: 1030,
  modalBackdrop: 1040,
  modal: 1050,
  popover: 1060,
  tooltip: 1070,
} as const;

// Export all design tokens
export const designTokens = {
  colors,
  typography,
  spacing,
  borderRadius,
  shadows,
  breakpoints,
  components,
  layout,
  animation,
  zIndex,
} as const;

export default designTokens;

