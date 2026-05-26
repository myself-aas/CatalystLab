import js from "@eslint/js";

export default [
  {
    ignores: [".next/", "**/.next/", "dist/", "node_modules/", "build/"],
  },
  js.configs.recommended,
  {
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
    },
    rules: {
      "no-unused-vars": "off",
      "no-undef": "off",
    }
  }
];
