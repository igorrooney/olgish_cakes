"use client";

import { createTheme } from "@mui/material/styles";
import { designTokens } from "./design-system";

const { colors, typography, spacing, borderRadius, shadows } = designTokens;

declare module "@mui/material/styles" {
  interface Palette {
    ukrainian: {
      blue: string;
      yellow: string;
      honey: string;
      cream: string;
      berry: string;
    };
  }
  interface PaletteOptions {
    ukrainian?: {
      blue?: string;
      yellow?: string;
      honey?: string;
      cream?: string;
      berry?: string;
    };
  }
}

export const theme = createTheme({
  palette: {
    primary: {
      main: colors.primary.main,
      light: colors.primary.light,
      dark: colors.primary.dark,
      contrastText: colors.primary.contrast,
    },
    secondary: {
      main: colors.secondary.main,
      light: colors.secondary.light,
      dark: colors.secondary.dark,
      contrastText: colors.secondary.contrast,
    },
    background: {
      default: colors.background.default,
      paper: colors.background.paper,
    },
    text: {
      primary: colors.text.primary,
      secondary: colors.text.secondary,
    },
    error: {
      main: colors.error.main,
      light: colors.error.light,
      dark: colors.error.dark,
    },
    warning: {
      main: colors.warning.main,
      light: colors.warning.light,
      dark: colors.warning.dark,
    },
    success: {
      main: colors.success.main,
      light: colors.success.light,
      dark: colors.success.dark,
    },
    info: {
      main: colors.info.main,
      light: colors.info.light,
      dark: colors.info.dark,
    },
    ukrainian: {
      blue: colors.ukrainian.blue,
      yellow: colors.ukrainian.yellow,
      honey: colors.ukrainian.honey,
      cream: colors.ukrainian.cream,
      berry: colors.ukrainian.berry,
    },
  },
  typography: {
    fontFamily: typography.fontFamily.primary,
    h1: {
      fontFamily: typography.fontFamily.display,
      fontWeight: typography.fontWeight.bold,
      fontSize: typography.fontSize["5xl"],
      lineHeight: typography.lineHeight.tight,
      letterSpacing: typography.letterSpacing.tight,
      color: colors.text.primary,
    },
    h2: {
      fontFamily: typography.fontFamily.display,
      fontWeight: typography.fontWeight.semibold,
      fontSize: typography.fontSize["4xl"],
      lineHeight: typography.lineHeight.tight,
      letterSpacing: typography.letterSpacing.tight,
      color: colors.text.primary,
    },
    h3: {
      fontFamily: typography.fontFamily.display,
      fontWeight: typography.fontWeight.semibold,
      fontSize: typography.fontSize["3xl"],
      lineHeight: typography.lineHeight.tight,
      color: colors.text.primary,
    },
    h4: {
      fontFamily: typography.fontFamily.display,
      fontWeight: typography.fontWeight.semibold,
      fontSize: typography.fontSize["2xl"],
      lineHeight: typography.lineHeight.tight,
      color: colors.text.primary,
    },
    h5: {
      fontFamily: typography.fontFamily.display,
      fontWeight: typography.fontWeight.semibold,
      fontSize: typography.fontSize.xl,
      lineHeight: typography.lineHeight.tight,
      color: colors.text.primary,
    },
    h6: {
      fontFamily: typography.fontFamily.display,
      fontWeight: typography.fontWeight.semibold,
      fontSize: typography.fontSize.lg,
      lineHeight: typography.lineHeight.tight,
      color: colors.text.primary,
    },
    body1: {
      fontFamily: typography.fontFamily.primary,
      fontSize: typography.fontSize.base,
      lineHeight: typography.lineHeight.relaxed,
      color: colors.text.primary,
    },
    body2: {
      fontFamily: typography.fontFamily.primary,
      fontSize: typography.fontSize.sm,
      lineHeight: typography.lineHeight.relaxed,
      color: colors.text.secondary,
    },
    button: {
      fontFamily: typography.fontFamily.primary,
      fontSize: typography.fontSize.base,
      fontWeight: typography.fontWeight.semibold,
      textTransform: "none",
    },
  },
  spacing: (factor: number) => `${factor * 0.25}rem`, // 4px base unit
  shape: {
    borderRadius: parseInt(borderRadius.lg),
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: "none",
          borderRadius: borderRadius.lg,
          padding: `${spacing.md} ${spacing.xl}`,
          fontSize: typography.fontSize.base,
          fontWeight: typography.fontWeight.semibold,
          transition: "all 0.2s ease-in-out",
          "&:hover": {
            transform: "translateY(-1px)",
            boxShadow: shadows.md,
          },
        },
        contained: {
          backgroundColor: colors.primary.main,
          color: colors.primary.contrast,
          "&:hover": {
            backgroundColor: colors.primary.dark,
          },
        },
        outlined: {
          borderColor: colors.primary.main,
          color: colors.primary.main,
          "&:hover": {
            backgroundColor: colors.primary.main,
            color: colors.primary.contrast,
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: borderRadius.xl,
          boxShadow: shadows.base,
          backgroundColor: colors.background.paper,
          border: `1px solid ${colors.border.light}`,
          transition: "all 0.2s ease-in-out",
          "&:hover": {
            boxShadow: shadows.lg,
            transform: "translateY(-2px)",
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundColor: colors.background.paper,
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          "& .MuiOutlinedInput-root": {
            borderRadius: borderRadius.lg,
            backgroundColor: colors.background.paper,
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
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: borderRadius.full,
          backgroundColor: colors.background.subtle,
          color: colors.text.primary,
          fontWeight: typography.fontWeight.medium,
          border: `1px solid ${colors.border.light}`,
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: colors.background.paper,
          color: colors.text.primary,
          boxShadow: shadows.sm,
        },
      },
    },
    MuiAccordion: {
      styleOverrides: {
        root: {
          backgroundColor: colors.background.subtle,
          border: `1px solid ${colors.border.light}`,
          borderRadius: borderRadius.lg,
          "&:before": {
            display: "none",
          },
        },
      },
    },
    MuiAccordionSummary: {
      styleOverrides: {
        root: {
          "& .MuiAccordionSummary-content": {
            margin: `${spacing.sm} 0`,
          },
        },
      },
    },
  },
});
