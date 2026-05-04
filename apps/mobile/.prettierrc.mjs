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
    "^react$",
    "^react-native$",
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
