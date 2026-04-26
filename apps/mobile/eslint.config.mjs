import { FlatCompat } from "@eslint/eslintrc";
import js from "@eslint/js";
import stylistic from "@stylistic/eslint-plugin";
import pluginQuery from "@tanstack/eslint-plugin-query";
import love from "eslint-config-love";
import importPlugin from "eslint-plugin-import";
import prettier from "eslint-plugin-prettier";
import react from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";
import globals from "globals";
import path from "node:path";
import { fileURLToPath } from "node:url";
import tseslint from "typescript-eslint";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
  allConfig: js.configs.all,
});

export default [
  {
    ignores: [
      "**/eslint.config.mjs",
      "**/*.config.*",
      "**/.prettierrc.*",
      "**/expo-env.d.ts",
      "**/package.json",
      "**/package-lock.json",
      "**/yarn.lock",
      "**/bun.lock",
      "**/pnpm-lock.yaml",
      "**/android/**",
      "**/ios/**",
      "**/coverage/**",
      "**/scripts/**",
    ],
  },
  {
    files: ["**/*.{ts,tsx,js,jsx,mjs,cjs,mts,cts}"],
    ignores: [
      "**/eslint.config.mjs",
      "**/*.config.*",
      "**/.prettierrc.*",
      "**/expo-env.d.ts",
    ],
  },
  ...compat.extends("plugin:react/recommended"),
  {
    plugins: {
      love,
      react,
      "react-hooks": reactHooks,
      "@stylistic": stylistic,
      prettier,
      importPlugin,
      "@typescript-eslint": tseslint.plugin,
      ...pluginQuery.configs["flat/recommended"],
    },

    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.es2021,
      },

      ecmaVersion: "latest",
      sourceType: "module",

      parser: tseslint.parser,

      parserOptions: {
        projectService: true,
        tsconfigRootDir: __dirname,
      },
    },

    settings: {
      react: {
        version: "detect",
      },
    },

    rules: {
      "prettier/prettier": "error",
      "@typescript-eslint/strict-boolean-expressions": "off",
      "@typescript-eslint/explicit-function-return-type": "off",
      "react/react-in-jsx-scope": "off",
      "react/jsx-uses-react": "off",
      "@typescript-eslint/consistent-type-definitions": ["error", "type"],
      "react/jsx-boolean-value": "error",
      "react/jsx-curly-brace-presence": "error",
      "no-nested-ternary": "error",
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "off",
      "@typescript-eslint/ban-ts-comment": [
        "error",
        {
          "ts-expect-error": "allow-with-description",
          minimumDescriptionLength: 3,
        },
      ],

      "object-shorthand": "warn",

      "@typescript-eslint/no-unused-vars": [
        "warn",
        {
          varsIgnorePattern: "^_",
          argsIgnorePattern: "^_",
          caughtErrors: "none",
        },
      ],

      "@typescript-eslint/no-misused-promises": [
        "error",
        {
          checksVoidReturn: false,
        },
      ],

      "@typescript-eslint/no-floating-promises": "off",
    },
  },
];
