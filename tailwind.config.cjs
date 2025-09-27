/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./sanity/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Ukrainian brand colors - WCAG AA compliant
        ukrainian: {
          blue: "#2E3192",
          yellow: "#FEF102",
          honey: "#D4A76A",
          cream: "#FFF5E6",
          berry: "#8B0000",
        },
        // Primary colors
        primary: {
          50: "#F0F6FF",
          100: "#E0EDFF",
          200: "#C7DBFF",
          300: "#A5C4FF",
          400: "#82A3FF",
          500: "#4A4DB0", // Updated tone for WCAG AA
          600: "#2E3192", // Main primary (brand)
          700: "#1F2368",
          800: "#1B1E59", // Dark primary
          900: "#002F5D",
        },
        // Status colors - WCAG AA compliant
        success: {
          50: "#F0FDF4",
          100: "#DCFCE7",
          200: "#BBF7D0",
          300: "#86EFAC",
          400: "#4ADE80",
          500: "#1D8348", // WCAG AA compliant
          600: "#16A34A",
          700: "#15803D",
          800: "#166534",
          900: "#14532D",
        },
        error: {
          50: "#FEF2F2",
          100: "#FEE2E2",
          200: "#FECACA",
          300: "#FCA5A5",
          400: "#F87171",
          500: "#D04436", // WCAG AA compliant
          600: "#DC2626",
          700: "#B91C1C",
          800: "#991B1B",
          900: "#7F1D1D",
        },
        warning: {
          50: "#FFFBEB",
          100: "#FEF3C7",
          200: "#FDE68A",
          300: "#FCD34D",
          400: "#FBBF24",
          500: "#F39C12",
          600: "#D97706",
          700: "#867100", // WCAG AA compliant dark secondary
          800: "#92400E",
          900: "#78350F",
        },
        info: {
          50: "#EFF6FF",
          100: "#DBEAFE",
          200: "#BFDBFE",
          300: "#93C5FD",
          400: "#60A5FA",
          500: "#2A7AAF", // WCAG AA compliant
          600: "#2563EB",
          700: "#1D4ED8",
          800: "#1E40AF",
          900: "#1E3A8A",
        },
      },
    },
  },
  plugins: [require("daisyui")],
  daisyui: {
    themes: [
      {
        olgish: {
          primary: "#2E3192",
          secondary: "#FEF102",
          accent: "#D4A76A",
          neutral: "#1f2937",
          "base-100": "#ffffff",
          "base-200": "#f9fafb",
          "base-300": "#f3f4f6",
          info: "#2563eb",
          success: "#16a34a",
          warning: "#d97706",
          error: "#dc2626",
        },
      },
    ],
  },
  // Ensure responsive classes are not purged in development
  safelist: [
    "flex-col",
    "flex-row",
    "sm:flex-row",
    "md:flex-row",
    "lg:flex-row",
    "xl:flex-row",
    "sm:flex-col",
    "md:flex-col",
    "lg:flex-col",
    "xl:flex-col",
  ],
};
