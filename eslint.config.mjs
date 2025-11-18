import js from "@eslint/js";
import tseslint from "typescript-eslint";
import prettier from "eslint-config-prettier";
import react from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";
import globals from "globals";

const eslintConfig = [
  // Global ignores
  {
    ignores: [
      "**/node_modules/**",
      "**/.next/**",
      "**/dist/**",
      "**/build/**",
      "**/coverage/**",
      "**/.turbo/**",
      "**/out/**",
      "**/*.config.js",
      "**/*.config.mjs",
      "**/*.config.cjs",
      "**/.sanity/**",
      "**/backups/**",
      "**/public/**", // Service workers and public scripts
      "**/scripts/**", // Build-time scripts
    ],
  },

  // JavaScript/TypeScript files - use strict recommended rules
  js.configs.recommended,
  ...tseslint.configs.recommended,
  prettier,

  {
    files: ["**/*.{js,jsx,ts,tsx,mjs,cjs}"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
      globals: {
        ...globals.browser,
        ...globals.node,
        ...globals.es2021,
      },
    },
    plugins: {
      react,
      "react-hooks": reactHooks,
    },
    settings: {
      react: {
        version: "detect",
      },
    },
    rules: {
      // TypeScript-specific rules - strict for new code
      "@typescript-eslint/no-unused-vars": ["warn", { argsIgnorePattern: "^_", varsIgnorePattern: "^_" }],
      "@typescript-eslint/no-explicit-any": "warn", // TODO: Fix 333 instances gradually
      "@typescript-eslint/no-empty-function": "off",
      "@typescript-eslint/no-require-imports": "warn",
      
      // React rules
      "react/no-unescaped-entities": "off",
      "react/display-name": "warn",
      "react-hooks/exhaustive-deps": "warn",
      "react-hooks/rules-of-hooks": "error", // Keep as error - critical
      
      // General rules
      "no-console": ["warn", { allow: ["warn", "error"] }],
      "prefer-const": "warn",
      "no-unused-vars": "off", // Using @typescript-eslint/no-unused-vars instead
      "no-empty": ["warn", { "allowEmptyCatch": false }],
      
      // Structured data compliance: Catch string prices in offer objects
      // This rule helps prevent Google Merchant Center errors
      "no-restricted-syntax": [
        "warn",
        {
          selector: 'ObjectExpression > Property[key.name="price"] > Literal[value.type="string"]',
          message: '⚠️ Price in structured data offers must be numeric (not a string). Use formatStructuredDataPrice() from lib/utils/price-formatting.ts or ensure price is a number literal.',
        },
      ],
    },
  },

  // Test files - more lenient rules
  {
    files: ["**/__tests__/**/*", "**/*.test.{js,jsx,ts,tsx}", "**/*.spec.{js,jsx,ts,tsx}", "**/jest.setup.cjs", "**/jest.config.cjs"],
    rules: {
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-unused-vars": "off",
      "@typescript-eslint/no-require-imports": "off",
      "no-console": "off",
      "react/display-name": "off", // Mock components don't need display names
    },
  },

  // Scripts - allow console
  {
    files: ["scripts/**/*"],
    rules: {
      "no-console": "off",
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-require-imports": "off",
    },
  },
];

export default eslintConfig;
