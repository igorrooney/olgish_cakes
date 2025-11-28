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
        // Figma design tokens - Primary colors
        primary: {
          50: "#ECECF9",
          100: "#D8D9F3",
          200: "#B1B3E7",
          400: "#6467CE",
          500: "#2E3192",
          700: "#252774",
          800: "#181A4E",
        },
        // Accent colors from Figma
        accent: {
          50: "#FFEBE5",
          200: "#FFAF99",
        },
        // Base colors from Figma
        base: {
          100: "#FFF5E6", // amber-50 background
          200: "#FFF5E6",
          300: "#E5E6E6",
          content: "#1F2937",
        },
        // Ukrainian brand colors - kept for compatibility
        ukrainian: {
          blue: "#2E3192",
          yellow: "#FEF102",
          honey: "#D4A76A",
          cream: "#FFF5E6",
          berry: "#8B0000",
        },
        // Status colors - WCAG AA compliant
        success: {
          50: "#F0FDF4",
          100: "#DCFCE7",
          200: "#BBF7D0",
          300: "#86EFAC",
          400: "#4ADE80",
          500: "#219653", // From Figma Green 1
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
          500: "#D04436",
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
          700: "#867100",
          800: "#92400E",
          900: "#78350F",
        },
        info: {
          50: "#EFF6FF",
          100: "#DBEAFE",
          200: "#BFDBFE",
          300: "#93C5FD",
          400: "#60A5FA",
          500: "#2A7AAF",
          600: "#2563EB",
          700: "#1D4ED8",
          800: "#1E40AF",
          900: "#1E3A8A",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        display: ["'Comic Sans MS'", "'Chalkboard SE'", "'Comic Neue'", "cursive", "system-ui", "sans-serif"],
        body: ["var(--font-alice)", "Georgia", "serif"],
        moreSugar: ["var(--font-more-sugar)", "cursive", "fantasy"],
      },
      fontSize: {
        xs: ["12px", { lineHeight: "16px" }],
        sm: ["14px", { lineHeight: "20px" }],
        base: ["16px", { lineHeight: "22px" }],
        xl: ["20px", { lineHeight: "28px" }],
        "2xl": ["24px", { lineHeight: "40px" }],
      },
      spacing: {
        0: "0px",
        1: "4px",
        2: "8px",
        3: "12px",
        4: "16px",
        5: "20px",
        6: "24px",
        8: "32px",
        10: "40px",
        12: "48px",
      },
      borderRadius: {
        btn: "8px",
        box: "16px",
        rounded: "1000px",
      },
      boxShadow: {
        sm: "0px 1px 2px 0px rgba(0, 0, 0, 0.05)",
        btn: "0px 1px 2px 0px rgba(0, 0, 0, 0.05)",
        xl: "0px 8px 10px -6px rgba(0, 0, 0, 0.1), 0px 20px 25px -5px rgba(0, 0, 0, 0.1)",
      },
      screens: {
        mobile: "390px",
        tablet: "1024px",
        "small-laptop": "1280px",
        "large-laptop": "1512px",
      },
    },
  },
  plugins: [],
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
    "text-primary-400",
  ],
};
