# 05 — Remove Payload CMS

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Delete Payload, its admin route group, collections, access rules, hooks, preview plumbing, generated types, one-off scripts and six npm packages, so that `next build` succeeds with no database or Blob credentials and the route table is fully static apart from the contact verification endpoint.

**Architecture:** After chunks 02–04 nothing under `src/app/(app)/` imports Payload. Everything that remains is admin-side and goes in one commit series. `next.config.ts` loses `withPayload` and the Blob image domain; `tsconfig.json` and `vitest.config.ts` lose the `@payload-config` alias; `sharp` moves to devDependencies (Next bundles its own for image optimisation; the content scripts still need it); `package-lock.json` is committed from here on.

**Tech Stack:** none new.

---

## Prerequisites

- Chunks 02, 03 and 04 all merged to `main`.
- Confirm before branching:

```bash
git checkout main && git pull
grep -rln "@payloadcms\|from 'payload'\|from \"payload\"\|payload-types\|draftMode\|LivePreviewToolbar" src scripts | sort
```

Expected: only paths under `src/app/(payload)/`, `src/collections/`, `src/access/`, `src/payload.config.ts`, `src/payload-types.ts`, `src/app/(app)/api/{preview,live-preview,exit-preview}/`, `src/components/layout/LivePreviewToolbar.tsx`, `src/components/layout/index.tsx`, `src/__tests__/components/layout/LivePreviewToolbar.test.tsx`, `src/__tests__/collections/`, `scripts/`. Anything else is a leftover from an earlier chunk; fix it on this branch first.

## Start

```bash
git checkout -b chunk-05-remove-payload
```

## File structure

| Path | Change |
|---|---|
| `src/app/(payload)/` (layout, custom.scss, admin pages, importMap, REST + GraphQL routes) | **Delete** |
| `src/payload.config.ts`, `src/payload-types.ts` | **Delete** |
| `src/collections/` (10 collections, `blocks/`, `hooks/`) | **Delete** |
| `src/access/index.ts` | **Delete** |
| `src/components/admin/` (PayloadLogo, PayloadIcon) | **Delete** |
| `src/styles/payload-admin.css` | **Delete** |
| `src/app/(app)/api/preview/`, `api/live-preview/`, `api/exit-preview/` | **Delete** |
| `src/components/layout/LivePreviewToolbar.tsx`, `src/__tests__/components/layout/LivePreviewToolbar.test.tsx` | **Delete** |
| `src/components/layout/index.tsx` | Modify: drop the `LivePreviewToolbar` export |
| `src/__tests__/collections/` (revalidation, slug) | **Delete** |
| `scripts/reset-db.js`, `scripts/migrate-projects-to-lexical.ts`, `scripts/export/` (preflight, dump, convert-projects, parity) | **Delete** |
| `dev.db` | **Delete** (`git rm`) |
| `next.config.ts` | Rewrite: no `withPayload`, no `images.domains` |
| `tsconfig.json`, `vitest.config.ts` | Modify: drop `@payload-config` |
| `package.json` | Modify: remove 6 deps + 4 scripts; `sharp` → devDependencies |
| `.gitignore` | Modify: stop ignoring `package-lock.json` |
| `package-lock.json` | **Commit** |

Kept: `scripts/content/image.ts` (durable), `tsx` (runs it), `@tailwindcss/typography`, `src/lib/turnstile.ts` and `api/contact/verify`.

---

### Task 1: Delete Payload source

- [ ] **Step 1: Delete**

```bash
git rm -r "src/app/(payload)" \
          src/payload.config.ts src/payload-types.ts \
          src/collections src/access src/components/admin src/styles/payload-admin.css \
          "src/app/(app)/api/preview" "src/app/(app)/api/live-preview" "src/app/(app)/api/exit-preview" \
          src/components/layout/LivePreviewToolbar.tsx src/__tests__/components/layout/LivePreviewToolbar.test.tsx \
          src/__tests__/collections \
          scripts/reset-db.js scripts/migrate-projects-to-lexical.ts scripts/export \
          dev.db
```

- [ ] **Step 2: Barrel**

In `src/components/layout/index.tsx` remove `export { LivePreviewToolbar } from "./LivePreviewToolbar";`

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "chore(payload): delete admin route group, config, collections, preview plumbing"
```

### Task 2: Config

**Files:**
- Rewrite: `next.config.ts`
- Modify: `tsconfig.json`, `vitest.config.ts`

- [ ] **Step 1: `next.config.ts`**

Keep every redirect that chunks 03, 04 (and 06, if it somehow landed first) added; only the wrapper and the image domain change. The result looks like this (redirect list shown as of chunks 03 + 04):

```ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60 * 60 * 24 * 365, // 1 year
  },
  experimental: {
    optimizePackageImports: ['@/components'],
  },
  async redirects() {
    return [
      {
        source: '/:path*',
        has: [{ type: 'host', value: 'v2-benwozak.vercel.app' }],
        destination: 'https://www.benwozak.dev/:path*',
        permanent: true,
      },
      { source: '/resume', destination: '/', permanent: true },
      { source: '/blog', destination: '/', permanent: true },
      { source: '/blog/:slug*', destination: '/', permanent: true },
    ]
  },
};

export default nextConfig;
```

- [ ] **Step 2: `tsconfig.json` paths**

```json
    "paths": {
      "@/*": ["./src/*"]
    }
```

(`include` was already cleaned in chunk 03.)

- [ ] **Step 3: `vitest.config.ts` alias**

```ts
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },
```

- [ ] **Step 4: Commit**

```bash
git add next.config.ts tsconfig.json vitest.config.ts
git commit -m "chore(payload): drop withPayload, blob image domain and @payload-config alias"
```

### Task 3: Dependencies and scripts

**Files:**
- Modify: `package.json`, `.gitignore`

- [ ] **Step 1: Remove packages**

```bash
npm uninstall payload @payloadcms/db-sqlite @payloadcms/next @payloadcms/richtext-lexical @payloadcms/storage-vercel-blob graphql
npm uninstall sharp && npm install -D sharp
```

If chunk 01 installed `@libsql/client` or `@vercel/blob` explicitly: `npm uninstall @libsql/client @vercel/blob`.

- [ ] **Step 2: Remove scripts**

Delete these four lines from `package.json` `scripts`: `payload:migrate`, `payload:migrate:fresh`, `payload:generate:types`, `db:reset`. The `scripts` block should now be:

```json
  "scripts": {
    "dev": "next dev --turbopack",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "test": "vitest",
    "test:ui": "vitest --ui",
    "test:run": "vitest run",
    "test:coverage": "vitest --coverage",
    "content:check": "vitest run src/__tests__/lib"
  },
```

- [ ] **Step 3: Commit the lockfile**

In `.gitignore` delete the line `package-lock.json` (leave `yarn.lock` ignored). Then:

```bash
rm -rf node_modules package-lock.json
npm install
git add .gitignore package.json package-lock.json
git commit -m "chore(payload): remove Payload packages; commit package-lock.json"
```

- [ ] **Step 4: Local env cleanup**

Remove from `.env` (not committed): `DATABASE_URI`, `DATABASE_AUTH_TOKEN`, `PAYLOAD_SECRET`, `PAYLOAD_DB_PUSH`, `BLOB_READ_WRITE_TOKEN`, `REVALIDATION_SECRET`, `NEXT_PUBLIC_SITE_URL`, `YAKPDF_API_KEY`, `YAKPDF_HOST`. Keep `NEXT_PUBLIC_KEY`, `NEXT_PUBLIC_SERVICE_ID`, `NEXT_PUBLIC_TEMPLATE_ID`, `NEXT_PUBLIC_TURNSTILE_SITE_KEY`, `TURNSTILE_SECRET_KEY`. (Vercel's copies are removed in chunk 09, after the deploy is proven.)

### Task 4: Prove the site needs nothing external

- [ ] **Step 1: Grep**

```bash
grep -rniE "payload|@payload-config|draftMode|revalidateTag|revalidatePath|unstable_cache|libsql|vercel-blob|lexical|generateSlug" src scripts next.config.ts tsconfig.json vitest.config.ts package.json
```

Expected: no output.

- [ ] **Step 2: Build with no `.env` at all**

```bash
mv .env .env.bak
npm run build
mv .env.bak .env
```

Expected: build succeeds. In the route table every page is `○` (Static) or `●` (SSG); only `/api/contact/verify` and `/robots.txt` are `ƒ` (Dynamic).

- [ ] **Step 3: Old admin and API URLs are gone**

```bash
npm run dev &
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3000/admin            # 404
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3000/api/graphql      # 404
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3000/api/media/file/x # 404
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3000/projects         # 200
```

- [ ] **Step 4: Tests and baseline**

```bash
npm run test:run
```

Then run the failing-set check from `00`. The deleted `LivePreviewToolbar`, `revalidation` and `slug` tests leave the baseline; regenerate `planning/baseline-test-failures.txt` and commit it.

```bash
git add planning/baseline-test-failures.txt
git commit -m "test: refresh failure baseline after Payload removal"
```

---

## Verification checklist

- [ ] `npx tsc --noEmit`, `npm run lint`, `npm run build` (with `.env` moved away) clean
- [ ] No new test failures; baseline refreshed
- [ ] `du -sh node_modules` is noticeably smaller than before (sanity signal, no target number)
- [ ] Vercel preview: `/`, `/projects`, each `/projects/<slug>`, `/contact` render; `/admin` is 404
- [ ] **Vercel env vars are still set** — do not remove them here (chunk 09)

## Done when

PR `chunk-05-remove-payload` → `main` is open and green, merged, and the production deploy is verified.

## Out of scope / deferred

- Removing Vercel env vars, the Blob store, the Turso database: chunk 09.
- Dead non-Payload components (Services, Pitch, TechnologyShowcase, WebTechnology), `components.json`, README/CLAUDE.md: chunk 08.
- `skills-lock.json` lists a `payload` agent skill; it is tooling metadata, not app code. Leave it or drop the entry in chunk 08.

## Hand-off log

_(append dated notes here)_
