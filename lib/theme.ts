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
    fontFamily: "var(--font-inter), sans-serif",
    h1: {
      fontSize: "2.5rem",
      fontWeight: 700,
      color: "#2D2D2D",
    },
    h2: {
      fontSize: "2rem",
      fontWeight: 600,
      color: "#2D2D2D",
    },
    h3: {
      fontSize: "1.75rem",
      fontWeight: 600,
      color: "#2D2D2D",
    },
    body1: {
      fontSize: "1rem",
      lineHeight: 1.5,
      color: "#2D2D2D",
    },
    fontFamilyMonospace: "var(--font-roboto-mono), monospace",
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: "none",
          fontWeight: 600,
          padding: "8px 24px",
        },
        contained: {
          boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
          "&:hover": {
            boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
          transition: "transform 0.2s ease-in-out",
          "&:hover": {
            transform: "translateY(-4px)",
          },
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
