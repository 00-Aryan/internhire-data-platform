import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

export default defineConfig([
  {
    files: ["src/**/*.{ts,tsx}", "app/**/*.{ts,tsx}"],
  },

  ...nextVitals,
  ...nextTs,

  globalIgnores([
    ".next/**",
    "node_modules/**",
    "dist/**",
    "build/**",

    // 👇 ignore non-product code
    "prisma/**",
    "scripts/**",
  ]),
]);
