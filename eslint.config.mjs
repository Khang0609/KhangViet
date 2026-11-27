import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    files: ["**/*.ts", "**/*.tsx"],
    rules: {
      "@typescript-eslint/no-explicit-any": "error",
      "@typescript-eslint/ban-ts-comment": [
        "error",
        {
          "ts-ignore": true,
          "ts-nocheck": true,
          "ts-expect-error": "allow-with-description",
        },
      ],
      "no-restricted-syntax": [
        "error",
        {
          selector:
            "Literal[value=/\\b(bg-gradient-|flex-shrink-|flex-grow-|ring-offset-)/]",
          message:
            "Use Tailwind CSS v4 syntax (bg-linear-*, shrink-*, grow-*, outline-*/inset-ring-*).",
        },
        {
          selector:
            "Literal[value=/(bg|text|border|ring|outline|fill|stroke|from|via|to)-\\[var\\(/]",
          message:
            "Use Tailwind CSS v4 CSS-variable syntax: bg-(--var), text-(--var), border-(--var).",
        },
        {
          selector:
            "Literal[value=/\\brounded(-[trbl]{1,2})?-\\[(8|12|16|24)px\\]/]",
          message:
            "Use standard Tailwind v4 radius tokens (rounded-lg, rounded-xl, rounded-2xl, rounded-3xl) instead of arbitrary px values.",
        },
        {
          selector:
            "Literal[value=/(bg|text|border|ring|outline|fill|stroke)-\\[#[fF]58633\\]/]",
          message:
            "Use the Tailwind v4 @theme token (bg-brand, text-brand, border-brand) instead of arbitrary-[#f58633].",
        },
      ],
    },
  },
  {
    files: ["app/**/*.ts", "app/**/*.tsx", "components/**/*.ts", "components/**/*.tsx"],
    rules: {
      "no-restricted-imports": [
        "warn",
        {
          paths: [
            {
              name: "react",
              importNames: ["useEffect"],
              message:
                "Avoid raw useEffect in UI components; encapsulate side-effects in apps/web/hooks/.",
            },
          ],
        },
      ],
    },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    ".agents/**",
    ".gemini/**",
    ".venv/**",
    "scripts/**",
  ]),
]);

export default eslintConfig;
