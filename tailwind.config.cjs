/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./sanity/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {},
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
  ],
};
