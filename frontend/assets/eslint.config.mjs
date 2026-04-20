import globals from "globals";
import { defineConfig, globalIgnores } from "eslint/config";
import react from "eslint-plugin-react";
import js from "@eslint/js";
import eslintConfigPrettier from "eslint-config-prettier/flat";

const COMMON_IGNORES = [
  "node_modules/",
  "dist/",
  "**/dist/",
  "build/",
  "**/i18n/",
  "**/res/**/i18n/",
  "**/res/**/conf/",
  "**/*.xml",
  "**/*.json",
  "**/**/**/locale",
  "**/**/**/locale/",
  "*.less",
  "**/**/**/**/**/lang/",
  "*.css",
  "**/*.html",
  "**/plugin_doc.html",
  "**/webpack.config.js",
  "**/webpack.config.*",
  "*.md",
  "**/*.md",
  ".prettierignore",
  "package.json",
  "**/package.json",
  "pnpm-lock.yaml",
  "**/pnpm-lock.yaml",
  "pnpm-workspace.yaml",
  "**/pnpm-workspace.yaml",
  "package-lock.json",
  "**/package-lock.json",
  "*.xsd",
  "**/*.xsd",
  "webpack-commons.js",
  "**/webpack-commons.js",
  "*.min.js",
  "**/*.min.js",
  "*.map",
  "**/*.map",
  "*.js.map",
  "**/*.js.map",
  "vendor/",
  "**/vendor/",
  "lib/",
  "**/lib/",
];

export default defineConfig([
  globalIgnores(COMMON_IGNORES),
  {
    plugins: {
      js,
      react,
      eslintConfigPrettier,
    },
    files: ["**/*.{js,mjs,cjs,jsx,ts,tsx}"],

    languageOptions: {
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
      globals: {
        ...globals.browser,
      },
    },
    rules: {
      ...js.configs.recommended.rules,
      // ...react.configs.recommended.rules,
      // ...eslintConfigPrettier.rules,
    },
  },
]);
