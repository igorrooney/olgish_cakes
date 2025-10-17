import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";
import nextPlugin from "@next/eslint-plugin-next";
import prettierPlugin from "eslint-plugin-prettier";
import prettierConfig from "eslint-config-prettier";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    files: ["**/*.{js,jsx,ts,tsx}"],
    plugins: {
      "@next/next": nextPlugin,
      prettier: prettierPlugin,
    },
    rules: {
      ...nextPlugin.configs.recommended.rules,
      ...prettierConfig.rules,
      "prettier/prettier": ["error"],
      // Custom rules from .eslintrc.json
      "react/no-unescaped-entities": "off",
      "react/display-name": "warn",
      "react-hooks/exhaustive-deps": "warn",
      "@next/next/no-img-element": "warn",
      "@next/next/no-page-custom-font": "warn",
      "jsx-a11y/alt-text": "warn",
    },
  },
];

export default eslintConfig;
