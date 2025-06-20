/** @type {import('prettier').Config & import('prettier-plugin-tailwindcss').PluginOptions} */
export default {
  importOrder: [
    "^react$",
    "^(next/(.*)$)|^(next$)",
    "<THIRD_PARTY_MODULES>",
    "^@/app/(.*)$",
    "^@/widget/(.*)$",
    "^@/module/(.*)$",
    "^@/shared/(.*)$",
    "([.](png|jpg|jpeg|svg))$",
    "^[./]",
  ],
  importOrderParserPlugins: ["typescript", "jsx", "decorators-legacy"],
  plugins: [
    "prettier-plugin-tailwindcss",
    "@trivago/prettier-plugin-sort-imports",
  ],
};
