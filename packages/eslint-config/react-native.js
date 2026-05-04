import js from "@eslint/js";
import stylistic from "@stylistic/eslint-plugin";
import pluginQuery from "@tanstack/eslint-plugin-query";
import love from "eslint-config-love";
import importPlugin from "eslint-plugin-import";
import prettier from "eslint-plugin-prettier";
import pluginReact from "eslint-plugin-react";
import pluginReactHooks from "eslint-plugin-react-hooks";
import globals from "globals";
import tseslint from "typescript-eslint";

/**
 * A shared ESLint configuration for React Native (Expo) apps.
 *
 * @type {import("eslint").Linter.Config[]}
 */
export const reactNativeConfig = [
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    ignores: [
      "**/*.config.*",
      "**/.prettierrc.*",
      "**/expo-env.d.ts",
      "**/package.json",
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
    ...pluginReact.configs.flat.recommended,
    languageOptions: {
      ...pluginReact.configs.flat.recommended.languageOptions,
      globals: {
        ...globals.browser,
        ...globals.es2021,
      },
    },
  },
  {
    plugins: {
      love,
      "react-hooks": pluginReactHooks,
      "@stylistic": stylistic,
      prettier,
      importPlugin,
      "@typescript-eslint": tseslint.plugin,
      ...pluginQuery.configs["flat/recommended"],
    },

    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      parser: tseslint.parser,
      parserOptions: {
        projectService: true,
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
