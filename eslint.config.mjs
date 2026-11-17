import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    rules: {
      // پارامترهایی که عمداً استفاده نمی‌شوند با _ شروع می‌شوند
      "@typescript-eslint/no-unused-vars": [
        "warn",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
      // پروژه App Router است و پوشهٔ pages ندارد؛ این قاعده کاربرد ندارد
      "@next/next/no-html-link-for-pages": "off",
    },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // 👇 خروجی‌های build و کدهای تولیدشده بررسی نمی‌شوند
    "**/.next/**",
    "**/dist/**",
    "apps/api/dist/**",
    "apps/api/src/generated/**",
    "apps/api/prisma/migrations/**",
    "apps/api/uploads/**",
    "node_modules/**",
    "**/node_modules/**",
    "next.config.ts",
  ]),
]);

export default eslintConfig;
