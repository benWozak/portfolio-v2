# 04 — Remove the blog (frontend only)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Delete every blog route, component, renderer and type from the frontend, add redirects for the old URLs, and leave the Payload collections in place for chunk 05.

**Architecture:** Pure deletion. The blog has no consumers outside its own folder except `sitemap.ts` (one import) and the commented-out nav entry. After this chunk the only `payload-types` importers left are inside `src/app/(payload)/` and `src/collections/`, and `next build` no longer needs the database for static generation.

**Tech Stack:** none new.

---

## Prerequisites

- Chunk 02 merged to `main` (it changed `sitemap.ts`; this chunk edits the same file).
- Independent of chunk 03. Both can be done in one session on two branches; rebase the second on the first before opening its PR.

## Start

```bash
git checkout main && git pull
git checkout -b chunk-04-remove-blog
```

## File structure

| Path | Change |
|---|---|
| `src/app/(app)/blog/page.tsx`, `src/app/(app)/blog/[slug]/page.tsx` | **Delete** |
| `src/components/content/blog/` (BlogCard, BlogContent, BlogMeta, EmptyState, LexicalDebugger, RelatedPosts, index) | **Delete** |
| `src/components/content/blocks/` (AboutSection, ContentBlockRenderer, HeroPartial, index) | **Delete** — only the blog page used content blocks |
| `src/utils/getBlog.ts`, `src/utils/lexicalRenderer.tsx`, `src/utils/readingTime.ts` | **Delete** |
| `src/types/blogPage.ts` | **Delete** |
| `src/app/(app)/sitemap.ts` | Modify: drop posts and `/blog` |
| `src/utils/hooks/useNavigation.ts` | Modify: drop the commented About/Blog entries |
| `next.config.ts` | Modify: redirects `/blog` and `/blog/:slug*` → `/` |

Untouched until chunk 05: `src/collections/{Blog,BlogPage,Categories,Tags,ProfessionalInsights,Tutorials}.ts`, `src/collections/blocks/`, `src/collections/hooks/blogHooks.ts`, `src/payload-types.ts`. Kept: `@tailwindcss/typography` (chunk 07 uses `prose`).

---

### Task 1: Delete blog code

- [ ] **Step 1: Confirm the consumer list is still exactly this**

```bash
grep -rln "content/blog\|content/blocks\|utils/getBlog\|lexicalRenderer\|readingTime\|types/blogPage" src | sort
```

Expected: only files that are themselves in the delete list below, plus `src/app/(app)/sitemap.ts`. Anything else must be handled by hand before deleting.

- [ ] **Step 2: Delete**

```bash
git rm -r "src/app/(app)/blog" \
          src/components/content/blog \
          src/components/content/blocks \
          src/utils/getBlog.ts src/utils/lexicalRenderer.tsx src/utils/readingTime.ts \
          src/types/blogPage.ts
```

- [ ] **Step 3: Commit**

```bash
git commit -m "chore(blog): remove blog routes, components, renderer and types"
```

### Task 2: Sitemap

**Files:**
- Modify: `src/app/(app)/sitemap.ts`

- [ ] **Step 1: Replace the file**

```ts
// src/app/(app)/sitemap.ts
import type { MetadataRoute } from 'next'
import { getProjects } from '@/lib/projects'

const BASE_URL = 'https://benwozak.dev'

export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes = ['', '/projects', '/projects/web', '/projects/native', '/resume', '/contact'].map((route) => ({
    url: `${BASE_URL}${route}`,
    lastModified: new Date(),
  }))

  return [
    ...staticRoutes,
    ...getProjects().map((project) => ({
      url: `${BASE_URL}/projects/${project.slug}`,
      lastModified: project.updatedAt ? new Date(project.updatedAt) : new Date(),
    })),
  ]
}
```

(If chunk 03 already merged, `/resume` is already gone from this list; keep it gone.)

- [ ] **Step 2: Commit**

```bash
git add "src/app/(app)/sitemap.ts"
git commit -m "chore(blog): drop blog entries from sitemap"
```

### Task 3: Navigation and redirects

**Files:**
- Modify: `src/utils/hooks/useNavigation.ts`
- Modify: `next.config.ts`

- [ ] **Step 1: Remove the commented entries from `useNavigation.ts`**

Delete the two commented blocks (`// { href: "/about" … }` and `// { href: "/blog" … }`). The remaining array is `Projects`, `Resume` (until chunk 03 removes it), `Contact`.

- [ ] **Step 2: Add the redirects**

Inside the array returned by `redirects()` in `next.config.ts`, after the existing host redirect object, add:

```ts
      { source: '/blog', destination: '/', permanent: true },
      { source: '/blog/:slug*', destination: '/', permanent: true },
```

- [ ] **Step 3: Verify**

```bash
npx tsc --noEmit
npm run build
```

Expected: clean; the build output no longer lists `/blog` or `/blog/[slug]`.

```bash
npm run dev &   # then, in another shell:
curl -sI http://localhost:3000/blog | head -1            # HTTP/1.1 308
curl -sI http://localhost:3000/blog/anything | head -1   # HTTP/1.1 308
```

- [ ] **Step 4: Commit**

```bash
git add src/utils/hooks/useNavigation.ts next.config.ts
git commit -m "chore(blog): redirect legacy blog URLs"
```

---

## Verification checklist

- [ ] `npx tsc --noEmit`, `npm run lint`, `npm run build` clean
- [ ] `npm run test:run` + failing-set check from `00`: no new failures (no test files are deleted in this chunk)
- [ ] `grep -rln "payload-types" src` → only paths under `src/app/(payload)/` or `src/collections/`
- [ ] `grep -rn "blog" src --include=*.ts --include=*.tsx -il | grep -v "collections\|(payload)\|payload-types"` → empty
- [ ] `/sitemap.xml` on the Vercel preview has no `/blog` URLs
- [ ] `/blog` and `/blog/x` redirect on the preview

## Done when

PR `chunk-04-remove-blog` → `main` is open and green.

## Out of scope / deferred

- Payload Blog/BlogPage/Categories/Tags/ProfessionalInsights/Tutorials collections, `blogHooks.ts`, `collections/blocks/`: chunk 05.
- `collections/revalidation.test.ts` mentions `/blog` paths in its own fixtures: unaffected, deleted in chunk 05.

## Hand-off log

_(append dated notes here)_
