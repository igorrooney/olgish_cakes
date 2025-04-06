"use client";

import { createTheme } from "@mui/material/styles";

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
      main: "#005BBB", // Ukrainian blue - representing the national color
      light: "#4D8FD1",
      dark: "#003D7A",
    },
    secondary: {
      main: "#FFD700", // Ukrainian yellow - representing the national color
      light: "#FFE44D",
      dark: "#B39700",
    },
    background: {
      default: "#FFF8E7", // Light honey color - inspired by Honey Cake
      paper: "#FFFFFF",
    },
    text: {
      primary: "#2D2D2D",
      secondary: "#666666",
    },
    ukrainian: {
      blue: "#005BBB", // Traditional Ukrainian blue
      yellow: "#FFD700", // Traditional Ukrainian yellow
      honey: "#D4A76A", // Honey Cake color
      cream: "#FFF5E6", // Cream color for Kyiv Cake
      berry: "#8B0000", // Deep berry color for traditional Ukrainian desserts
    },
  },
  typography: {
    fontFamily: "var(--font-inter), system-ui, -apple-system, sans-serif",
    h1: {
      fontFamily: "var(--font-playfair-display), serif",
      fontWeight: 600,
      fontSize: "3rem",
      lineHeight: 1.2,
      letterSpacing: "-0.02em",
      color: "#2D2D2D",
    },
    h2: {
      fontFamily: "var(--font-playfair-display), serif",
      fontWeight: 600,
      fontSize: "2.25rem",
      lineHeight: 1.3,
      letterSpacing: "-0.01em",
      color: "#2D2D2D",
    },
    h3: {
      fontFamily: "var(--font-playfair-display), serif",
      fontWeight: 600,
      fontSize: "1.875rem",
      lineHeight: 1.4,
      color: "#2D2D2D",
    },
    h4: {
      fontFamily: "var(--font-playfair-display), serif",
      fontWeight: 600,
      fontSize: "1.5rem",
      lineHeight: 1.4,
      color: "#2D2D2D",
    },
    h5: {
      fontFamily: "var(--font-playfair-display), serif",
      fontWeight: 600,
      fontSize: "1.25rem",
      lineHeight: 1.4,
      color: "#2D2D2D",
    },
    h6: {
      fontFamily: "var(--font-playfair-display), serif",
      fontWeight: 600,
      fontSize: "1rem",
      lineHeight: 1.4,
      color: "#2D2D2D",
    },
    body1: {
      fontSize: "1rem",
      lineHeight: 1.6,
      color: "#2D2D2D",
    },
    body2: {
      fontSize: "0.875rem",
      lineHeight: 1.6,
      color: "#666666",
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: "none",
          borderRadius: "8px",
          padding: "8px 24px",
          fontSize: "1rem",
          fontWeight: 500,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: "12px",
          boxShadow: "0px 4px 20px rgba(0, 0, 0, 0.08)",
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: "#FFFFFF",
          color: "#2D2D2D",
          boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
        },
      },
    },
  },
});
