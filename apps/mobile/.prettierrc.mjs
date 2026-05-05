export default {
  arrowParens: "always",
  bracketSpacing: true,
  jsxSingleQuote: false,
  quoteProps: "as-needed",
  singleQuote: false,
  semi: true,
  printWidth: 100,
  useTabs: false,
  tabWidth: 2,
  trailingComma: "all",
  plugins: ["@trivago/prettier-plugin-sort-imports"],
  importOrder: [
    "^@/styles/unistyles$",
    "^react$",
    "^react-native$",
    "^@/styles/unistyles$",
    "^@/assets/(.*)$",
    "^@/(.*)$",
    "^[./]",
    ".*",
  ],
  overrides: [
    {
      files: "entrypoint.js",
      options: {
        plugins: [],
      },
    },
  ],
};
