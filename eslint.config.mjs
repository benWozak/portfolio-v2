// Flat config (the ESLint 9 default; ESLint 10 drops .eslintrc). eslint-config-next 16 ships flat presets:
// core-web-vitals (Next + React + hooks + a11y rules) and typescript (typescript-eslint).
import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

export default defineConfig([
  ...nextVitals,
  ...nextTs,
  globalIgnores([".next/**", ".vercel/**", "out/**", "build/**", "coverage/**", "next-env.d.ts"]),
  {
    rules: {
      // Carried over from .eslintrc.json: test mocks and a couple of window/catch casts use `any` on purpose.
      "@typescript-eslint/no-explicit-any": "off",
    },
  },
]);
