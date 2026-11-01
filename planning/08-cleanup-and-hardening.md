# 08 — Cleanup and hardening

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development to implement this plan task-by-task (fresh implementer per task, spec review, then code-quality review). Steps use checkbox (`- [ ]`) syntax for tracking. **Nobody but the owner runs `git add`, `git commit` or `git stash`.** `git rm` and `git mv` are allowed; they stage only the deletion or rename.

**Goal:** Remove everything the overhaul orphaned, fix the stale config and metadata, document the new content workflow, give future sessions a `CLAUDE.md`, and get the test suite green with no baseline file.

**Architecture:** Grep-before-delete for every dead file. A small `scripts/content/new-project.ts` helper plus `docs/adding-a-project.md` make "add a project" a five-minute job without a CMS. `content:check` runs as `prebuild`, so a broken content file fails the Vercel build instead of only failing locally. `README.md` and `CLAUDE.md` describe the site as it is now.

**Tech Stack:** none new.

---

## Prerequisites

- Chunks 05, 06 and 07 merged to `main` (07 landed as `c377d8e`).

## Start

```bash
git checkout main && git pull
git checkout -b chunk-08-cleanup
```

## Commit policy

Owner's instruction for this chunk (2026-10-31): the orchestrator commits and pushes to `chunk-08-cleanup` after each task passes both reviews. Implementers and reviewers still never run `git add`, `git commit` or `git stash`. The owner reviews a single PR at the end and merges it himself.

## Decisions (2026-10-31, owner)

| Topic | Decision |
|---|---|
| Twitter `creator: "@your_twitter_handle"` | Delete the line. There is no handle; it is a `create-next-app` placeholder. |
| `siteName: "Ben Wozaks Portfolio"` | **Leave the string as it is.** Lift it into one constant so the three places that repeat it cannot drift, but do not change its value. |
| `AnimatedSection` (in-view threshold, reduced motion) | **Leave the animations alone.** No `amount` prop, no `useReducedMotion`. Put a length guideline in `docs/adding-a-project.md` instead. |
| `content:check` on deploy | Yes: add a `prebuild` script. |
| `planning/baseline-test-failures.txt` | Delete it once the suite is green. A plain green `npm run test:run` is the gate from then on. |
| Thin image `alt` text (e.g. `"CFMF"`) | Leave content as it is. |
| `CLAUDE.md` | Repo facts **plus** a "Working with the owner" section (commits, production services, pushing, PII). |

## File structure

| Path | Change |
|---|---|
| `src/app/(app)/robots.ts` → `src/app/robots.ts` | **Move** (route groups hide `robots.ts`; `/robots.txt` 404s today) |
| `src/components/content/Services.tsx`, `Pitch.tsx`, `TechnologyShowcase.tsx` | **Delete** (never rendered) |
| `src/components/content/contact/index.tsx` | **Delete** (`Contact` barrel wrapper; `/contact` imports `ContactForm` directly) |
| `src/components/content/index.tsx` | Modify: drop the four exports above |
| `src/components/ui/WebTechnology.tsx`, `src/__tests__/components/ui/WebTechnology.test.tsx` | **Delete** (only TechnologyShowcase used it) |
| `src/components/ui/index.tsx` | Modify: drop `WebTechnology` |
| `src/app/(app)/about/page.tsx` | **Delete** (returns `notFound()`; `/about` was never linked) |
| `src/app/(app)/page.tsx` | Modify: drop the commented-out `Pitch` lines |
| `src/lib/motion.ts` | **Delete** (no importers) |
| `src/app/(app)/globals.css` | Modify: drop `.line-clamp-2`, `.line-clamp-3` (Tailwind 3.4 core) and every `.blog-content` rule (no users; `/blog` redirects) |
| `src/components/ui/CTAButton.tsx` | Modify: drop the commented smooth-scroll block, the unused `onClick` prop and the non-Tailwind `text-md` class |
| `components.json` | **Delete** (shadcn config, nothing installed, wrong CSS path) |
| `tailwind.config.ts` | Modify: drop `./src/pages/**` glob and the `tailwindcss-animate` plugin |
| `package.json` | Modify: remove `class-variance-authority`, `tailwindcss-animate`; add `content:new` and `prebuild` scripts |
| `src/lib/site.ts` | **Create**: `SITE_URL`, `SITE_NAME`, `SITE_IMAGE` |
| `src/app/(app)/layout.tsx` | Modify: use the constants; delete the twitter `creator` line |
| `src/app/(app)/projects/[slug]/page.tsx` | Modify: use `SITE_NAME` |
| `src/app/(app)/projects/professional/page.tsx`, `personal/page.tsx` | Modify: per-page `openGraph` and `twitter` |
| `src/app/(app)/contact/layout.tsx` | **Create**: metadata for the client-only contact page |
| `src/app/(app)/sitemap.ts`, `src/app/robots.ts` | Modify: host from `SITE_URL` |
| `src/lib/projects/schema.ts`, `src/__tests__/lib/projectSchema.test.ts` | Modify: reject reserved slugs |
| `scripts/content/new-project.ts` | **Create** |
| `docs/adding-a-project.md`, `CLAUDE.md`, `.env.example` | **Create** |
| `.gitignore` | Modify: `!.env.example` |
| `README.md`, `src/__tests__/README.md` | **Rewrite** |
| `src/__tests__/setup.ts` | Modify: `motion.h1`, `motion.p` in the framer-motion mock; strip `next/image`-only props in the image mock |
| Failing test files (see Task 6) | Fix or delete |
| `planning/baseline-test-failures.txt` | **Delete** once empty |
| `planning/00-overview-and-preflight.md` | Modify: note that the failing-set workflow ended with chunk 08 |
| `src/app/(app)/globals.css` (Task 7) | Modify: drop the unused keyframes and `.animate-*` / `body.animation-complete` rules after the utilities block |
| `tailwind.config.ts` (Task 7) | Modify: drop the unused `shimmer` and `fadeIn` animation + keyframes; keep `orbit` |
| `src/components/ui/CTAButton.tsx`, `src/__tests__/components/ui/CTAButton.test.tsx` (Task 7) | Modify: drop `"use client"` and two no-op span classes; adjust assertions |
| `src/app/(app)/{layout.tsx,not-found.tsx,globals.css,fonts/}` → `src/app/` (Task 8) | **Move** so Next's `/_not-found` renders the branded page inside the layout for every unmatched URL |
| `src/app/not-found.tsx` (Task 8) | Modify: `metadata.title` "Page not found" |

**Execution order:** 0, 1, 2, 3, 4, 5, 7, 8, then 6 last (the green-suite gate).

### Stale items removed from the original doc

- `src/utils/functions/animations.ts`: already deleted by chunk 06.
- "Delete `src/__tests__/components/content/` if empty": it now holds ten live test files from chunks 06 and 07. Do not touch.
- The `payload|resume|blog` verification grep: `blog` legitimately appears in `Footer.test.tsx` fixture data and `SectionHeading.test.tsx`, and `resume`/`blog` appear in `next.config.ts` redirects. The gate is now `payload` only.

---

### Task 0: `/robots.txt`

**Files:**
- Move: `src/app/(app)/robots.ts` → `src/app/robots.ts`

- [x] **Step 1: Move**

```bash
git mv "src/app/(app)/robots.ts" src/app/robots.ts
```

No content change. The file imports `next/headers` and returns a per-host rule set, so it stays dynamic (`ƒ`).

- [x] **Step 2: Verify**

```bash
rm -rf .next && npm run build 2>&1 | grep -E "robots|sitemap"
```

Expected: a `ƒ /robots.txt` line (and the existing `○ /sitemap.xml`). Then:

```bash
npx next start -p 3100 & PID=$!; sleep 3
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3100/robots.txt   # 200
curl -s http://localhost:3100/robots.txt                                      # User-Agent: * / Allow: / / Sitemap: …
kill $PID
```

Owner commit suggestion: `fix(seo): move robots.ts to the app root so /robots.txt resolves`

### Task 1: Dead code

- [x] **Step 1: Verify each candidate has no consumer**

```bash
for f in Services Pitch TechnologyShowcase WebTechnology "lib/motion" "content/contact\"" "components/content\"" "blog-content" "line-clamp-3"; do
  echo "== $f"; grep -rn "$f" src --include='*.ts' --include='*.tsx' | grep -v __tests__ | grep -v "^src/components/content/index.tsx\|^src/components/ui/index.tsx"
done
```

Expected (checked 2026-10-31 on `c377d8e`):
- `Services`: its own file plus two commented lines in `about/page.tsx` (deleted below).
- `Pitch`: its own file plus two commented lines in `src/app/(app)/page.tsx` (cleaned below).
- `TechnologyShowcase`, `WebTechnology`: their own files only (WebTechnology is imported by TechnologyShowcase, which goes too).
- `lib/motion`, `content/contact"`, `blog-content`, `line-clamp-3`: nothing.
- `components/content"`: `src/app/(app)/page.tsx` importing `Projects, About, Experience`, plus the about page comment.

`line-clamp-2` is used by `ProjectCard.tsx` and keeps working from Tailwind core after the CSS rule goes.

If anything else appears, that file is still live; keep it and note it in the hand-off log.

- [x] **Step 2: Delete**

```bash
git rm src/components/content/Services.tsx src/components/content/Pitch.tsx src/components/content/TechnologyShowcase.tsx \
       src/components/content/contact/index.tsx \
       src/components/ui/WebTechnology.tsx src/__tests__/components/ui/WebTechnology.test.tsx \
       "src/app/(app)/about/page.tsx" src/lib/motion.ts
```

- [x] **Step 3: Barrels**

`src/components/content/index.tsx` becomes:

```ts
export { Socials } from "./Socials";
export { About } from "./About";
export { Experience } from "./Experience";
export { Projects } from "./projects";
```

In `src/components/ui/index.tsx` remove `export { WebTechnology } from "./WebTechnology";`.

In `src/app/(app)/page.tsx` remove the `// Pitch` comment and the `{/* <Pitch /> */}` line.

- [x] **Step 4: CSS**

In `src/app/(app)/globals.css`, inside `@layer utilities`, delete the `/* Line clamp utilities */` comment with the `.line-clamp-2` and `.line-clamp-3` rules, and the `/* Blog content specific styles */` comment with every `.blog-content…` rule that follows it. Keep `.h-screen-dvh` and anything after the blog block.

- [x] **Step 5: `CTAButton`**

`src/components/ui/CTAButton.tsx` becomes:

```tsx
"use client";
import React from "react";
import Link from "next/link";

interface CTAButtonProps {
  href: string;
  children: React.ReactNode;
  className?: string;
  type?: "primary" | "secondary";
  /** Open in a new tab with rel="noopener noreferrer" and an sr-only hint. */
  external?: boolean;
}

export function CTAButton({
  href,
  children,
  className = "",
  type = "primary",
  external = false,
}: CTAButtonProps) {
  const buttonStyles =
    type === "primary"
      ? `
      bg-primary text-primary-foreground
      after:bg-secondary-700
    `
      : `
      bg-transparent border border-neutral-800 text-neutral-800
      dark:border-neutral-200 dark:text-neutral-200
      after:bg-secondary-700
      transition-colors duration-300
      hover:border-transparent
    `;

  return (
    <Link
      href={href}
      {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      className={`
        group font-semibold focus-ring
        relative flex justify-center items-center rounded-md
        overflow-hidden cursor-pointer
        after:content-["_"] after:absolute after:h-full
        after:w-0 after:right-0
        after:transition-all after:duration-300 after:ease-in-out
        after:z-10
        hover:after:right-auto hover:after:left-0 hover:after:w-full
        ${buttonStyles}
        ${className}
      `}
    >
      <span
        className="
        relative w-full text-center transition-all duration-300
        hover:text-primary-foreground hover:border-primary-foreground z-20 px-8 py-2 lg:px-16 lg:py-2 lg:text-lg
        "
      >
        {children}
        {external && <span className="sr-only"> (opens in a new tab)</span>}
      </span>
    </Link>
  );
}
```

Only removals: the `useSmoothScroll` import comment, the `onClick` prop and its commented handler, the `// onClick={handleClick}` line, `text-md`, and a trailing space after `duration-300`. Run `npx vitest run src/__tests__/components/ui/CTAButton.test.tsx`; if a test passes `onClick`, delete that test case (it tested a prop that never did anything).

- [x] **Step 6: Type-check, lint, tests**

```bash
rm -rf .next && npx tsc --noEmit && npm run lint
npm run test:run 2>&1 | tail -5
```

Expected: tsc and lint clean; the failing set unchanged except the deleted WebTechnology file (it was not in the baseline).

Owner commit suggestion: `chore: remove unrendered components, dead CSS and CTAButton leftovers`

### Task 2: Dependencies, config, prebuild

- [x] **Step 1: Confirm the animate plugin and cva are unused**

```bash
grep -rnE "animate-in|animate-out|fade-in-|fade-out-|slide-in-from|slide-out-to|zoom-in-|zoom-out-|spin-in|spin-out" src --include='*.tsx' --include='*.ts' --include='*.css'
grep -rn "class-variance-authority" src
```

Expected: nothing for both. (`animate-pulse` and `animate-orbit` are Tailwind core or a project keyframe in `tailwind.config.ts`, not this plugin. The config's `shimmer` and `fadeIn` entries are unused and go in Task 7.)

- [x] **Step 2: Remove**

```bash
npm uninstall class-variance-authority tailwindcss-animate
git rm components.json
```

`npm uninstall` is the surgical route: it prunes those two subtrees from `package-lock.json` and leaves every other pin alone. Check afterwards:

```bash
grep -c '"node_modules/next"' package-lock.json          # 1
grep -n '"version": "15.4.11"' package-lock.json | head -1 # next unchanged
grep -n "tailwindcss-animate\|class-variance-authority" package.json package-lock.json   # nothing
```

In `tailwind.config.ts`: delete `"./src/pages/**/*.{js,ts,jsx,tsx,mdx}"` from `content` and change the `plugins` line to:

```ts
  plugins: [require("@tailwindcss/typography")],
```

- [x] **Step 3: `prebuild`**

In `package.json` `scripts`, add before `"build"`:

```json
"prebuild": "npm run content:check",
```

npm runs `prebuild` automatically before `build`, locally and on Vercel (Vercel installs devDependencies, so `vitest` is present). `content:check` is `vitest run src/__tests__/lib`, which validates every `content/projects/*.json`, the index, the one-featured-per-type rule and the image files.

- [x] **Step 4: Verify**

```bash
rm -rf .next && npm run build 2>&1 | head -20
```

Expected: the `content:check` run appears first (all `src/__tests__/lib` files pass), then the Next build, same route table as before.

Owner commit suggestion: `chore: drop unused deps and shadcn config; run content:check before build`

### Task 3: Metadata

**Files:**
- Create: `src/lib/site.ts`
- Modify: `src/app/(app)/layout.tsx`, `src/app/(app)/projects/[slug]/page.tsx`, `src/app/(app)/projects/professional/page.tsx`, `src/app/(app)/projects/personal/page.tsx`

- [x] **Step 1: Constants**

```ts
// src/lib/site.ts
// One home for the strings the metadata blocks repeat. Next replaces a nested
// `openGraph` or `twitter` object wholesale per segment, so a page that sets one
// restates everything: openGraph needs type, siteName, locale, url, title,
// description and images; twitter needs card, title, description and images.
export const SITE_URL = "https://benwozak.dev";
export const SITE_NAME = "Ben Wozaks Portfolio";
export const SITE_LOCALE = "en_US";
export const SITE_IMAGE = {
  url: `${SITE_URL}/BW_logo.svg`,
  width: 1200,
  height: 630,
  alt: "Ben Wozak - Software Developer",
};
```

The `SITE_NAME` value is unchanged by owner decision.

- [x] **Step 2: Root layout**

In `src/app/(app)/layout.tsx`:
- `import { SITE_IMAGE, SITE_NAME, SITE_URL } from "@/lib/site";`
- `metadataBase: new URL(`${SITE_URL}/`)`
- `openGraph.url: `${SITE_URL}/``, `openGraph.siteName: SITE_NAME`, `openGraph.images: [SITE_IMAGE]`
- `openGraph.locale: SITE_LOCALE`; `twitter.images: [SITE_IMAGE]` (a descriptor, so `twitter:image:alt` is emitted)
- **Delete** the `creator: "@your_twitter_handle",` line inside `twitter`. Keep the top-level `creator: "Ben Wozak"`.
- Everything else (titles, descriptions, keywords, robots) stays.

- [x] **Step 3: Project page**

In `src/app/(app)/projects/[slug]/page.tsx` import `SITE_NAME` and replace the literal `siteName: "Ben Wozaks Portfolio"` with `siteName: SITE_NAME`, `locale: "en_US"` with `locale: SITE_LOCALE`, and `twitter.images: [project.image.src]` with `twitter.images: [image]`. Keep the comment above the block.

- [x] **Step 4: Group pages**

Both group pages currently export only `title` and `description`, so they inherit the root `openGraph` (home title and URL). In each, extend the export:

```ts
import { SITE_IMAGE, SITE_LOCALE, SITE_NAME } from "@/lib/site";

export const metadata: Metadata = {
  title: group.heading,
  description: group.intro,
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    locale: SITE_LOCALE,
    url: group.href,
    title: group.heading,
    description: group.intro,
    images: [SITE_IMAGE],
  },
  twitter: {
    card: "summary_large_image",
    title: group.heading,
    description: group.intro,
    images: [SITE_IMAGE],
  },
};
```

`group.href` is `/projects/professional` or `/projects/personal`; `metadataBase` makes it absolute. The `twitter` block is needed too: without it the pages inherited the home page's Twitter title and description (found in review).

- [x] **Step 4b: `/contact` metadata (from review).** `contact/page.tsx` is `"use client"` and cannot export metadata, so `src/app/(app)/contact/layout.tsx` (a pass-through layout) carries title "Contact", a description, `openGraph` and `twitter`. The description is drafted copy for the owner to approve: "Get in touch about a project, a role or a collaboration."

- [x] **Step 4c: one host (from review).** `src/app/(app)/sitemap.ts` sets `BASE_URL = SITE_URL`; `src/app/robots.ts` uses `SITE_URL` for `host` and the `Sitemap:` line.

- [x] **Step 5: Verify**

```bash
rm -rf .next && npm run build >/dev/null && npx next start -p 3100 & PID=$!; sleep 3
for p in / /projects/professional /projects/personal /projects/calgary-folk-fest; do
  echo "== $p"; curl -s http://localhost:3100$p | grep -oE '<meta (property|name)="(og:(url|title|site_name|type)|twitter:creator)"[^>]*>'
done
kill $PID
```

Expected: `og:url` differs per page and is absolute; `og:site_name` is `Ben Wozaks Portfolio` everywhere; no `twitter:creator` anywhere; group pages carry their own `og:title`.

Owner commit suggestion: `chore(seo): site constants, per-page Open Graph on group pages, drop placeholder twitter handle`

### Task 4: Reserved slugs and the new-project helper

**Files:**
- Modify: `src/lib/projects/schema.ts`, `src/__tests__/lib/projectSchema.test.ts`
- Create: `scripts/content/new-project.ts`
- Modify: `package.json` (script)

- [x] **Step 1: Failing test for reserved slugs**

In `src/__tests__/lib/projectSchema.test.ts`, next to the existing slug-format test, add (adapt the fixture helper the file already uses):

```ts
it.each(['professional', 'personal', 'web', 'native'])('rejects the reserved slug "%s"', (slug) => {
  expect(() => parseProject({ ...valid, slug, image: { ...valid.image, src: `/projects/${slug}/x.png` } }, 'test')).toThrow(/reserved/)
})
```

Run `npx vitest run src/__tests__/lib/projectSchema.test.ts`. Expected: the four new cases fail (no error thrown).

- [x] **Step 2: Implement**

In `src/lib/projects/schema.ts`, export `SLUG_RE` (same value; the script reuses it) and add after it:

```ts
// Shadowed by a static group page (/projects/<type>) or a legacy redirect
// (/projects/web, /projects/native) in next.config.ts.
export const RESERVED_SLUGS = [...PROJECT_TYPES, 'web', 'native'] as const
```

and after the `SLUG_RE` check inside `parseProject`:

```ts
  if ((RESERVED_SLUGS as readonly string[]).includes(slug)) fail('slug', `is reserved (${RESERVED_SLUGS.join(', ')})`)
```

Run the schema test again. Expected: all pass.

- [x] **Step 3: Write the script**

```ts
// scripts/content/new-project.ts
// Scaffolds a project: copies the image into public/projects/<slug>/, computes
// dimensions + blur, writes content/projects/<slug>.json with empty text fields,
// and prints the two lines to add to content/projects/index.ts.
//
//   npm run content:new -- --slug my-app --image ~/Desktop/my-app.png
//
// --image is resolved from where you run the command (npm passes that as
// INIT_CWD); the output always goes under the repo root.
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import path from 'node:path'
import { RESERVED_SLUGS, SLUG_RE } from '../../src/lib/projects/schema'
import type { Project } from '../../src/types/project'
import { describeImage, toPublicFilename } from './image'

async function main() {
  const args = process.argv.slice(2)
  const flag = (name: string) => {
    const i = args.indexOf(name)
    return i === -1 ? undefined : args[i + 1]
  }
  const slug = flag('--slug')
  const imagePath = flag('--image')
  if (!slug || !imagePath) throw new Error('usage: --slug <kebab-slug> --image <path-to-image>')
  if (!SLUG_RE.test(slug)) throw new Error('slug must be lowercase kebab-case, e.g. my-app')
  if ((RESERVED_SLUGS as readonly string[]).includes(slug)) {
    throw new Error(`"${slug}" is reserved (${RESERVED_SLUGS.join(', ')})`)
  }

  const jsonPath = path.join('content', 'projects', `${slug}.json`)
  if (existsSync(jsonPath)) throw new Error(`${jsonPath} already exists`)

  const buffer = await readFile(path.resolve(process.env.INIT_CWD ?? process.cwd(), imagePath))
  const meta = await describeImage(buffer)
  const file = toPublicFilename(path.basename(imagePath))
  const publicDir = path.join('public', 'projects', slug)
  await mkdir(publicDir, { recursive: true })
  await writeFile(path.join(publicDir, file), buffer)

  const skeleton = {
    slug,
    name: '',
    type: 'personal',
    status: 'Prototype',
    featured: false,
    order: 99,
    description: '',
    techStack: { frontend: [], backend: [], other: [] },
    liveUrl: null,
    githubUrl: null,
    image: { src: `/projects/${slug}/${file}`, alt: '', width: meta.width, height: meta.height, blurDataURL: meta.blurDataURL },
    overview: '',
    challenge: '',
    solution: '',
    keyTakeaways: [''],
    updatedAt: new Date().toISOString(),
  } satisfies Project
  await writeFile(jsonPath, JSON.stringify(skeleton, null, 2) + '\n')

  const camel = slug.replace(/-([a-z0-9])/g, (_, c: string) => c.toUpperCase())
  const ident = /^\d/.test(camel) ? `_${camel}` : camel
  console.log(`wrote ${jsonPath}`)
  console.log(`wrote ${path.join(publicDir, file)} (${meta.width}x${meta.height})`)
  console.log(`\nAdd to content/projects/index.ts:\n  import ${ident} from './${slug}.json'\n  '${slug}': ${ident},`)
  console.log(`\nThen fill in the empty fields and run: npm run content:check`)
}

main().catch((e) => {
  console.error(e instanceof Error ? e.message : e)
  process.exit(1)
})
```

`schema.ts` is already kept free of Next imports so that `scripts/content` can import it under `tsx` (see its header comment). Review-driven details in the file above: `keyTakeaways: ['']` rather than `[]` because `parseProject` accepts an empty array but rejects an empty string, so `content:check` forces the field to be filled; `updatedAt` is stamped so the sitemap gets a real date; `satisfies Project` keeps the skeleton in step with the type; the image path resolves against `INIT_CWD`; a digit-leading slug gets a `_` prefix on its import identifier.

Also in this task (TDD, from the review): `toPublicFilename` in `scripts/content/image.ts` becomes

```ts
export function toPublicFilename(filename: string): string {
  return filename.trim().toLowerCase().replace(/[^a-z0-9.]+/g, '-').replace(/-+(?=\.)|^-+|-+$/g, '')
}
```

with cases in `src/__tests__/scripts/image.test.ts` for `'My Shot #1 (Final).PNG'` → `'my-shot-1-final.png'` and `'Screenshot 2026-10-31 at 9.41.12 PM.png'` → `'screenshot-2026-10-31-at-9.41.12-pm.png'`. A raw `#` or space in the file name would otherwise break the image URL.

- [x] **Step 4: Add the npm script**

```json
"content:new": "tsx scripts/content/new-project.ts"
```

- [x] **Step 5: Smoke-test it, then throw the result away**

```bash
npm run content:new -- --slug web --image public/android-chrome-512x512.png        # exits 1: "web" is reserved
npm run content:new -- --slug zz-smoke --image public/android-chrome-512x512.png   # writes two files
npm run content:check          # fails: zz-smoke is not indexed and has empty fields — expected
rm -rf content/projects/zz-smoke.json public/projects/zz-smoke
npm run content:check          # passes again
git status --short             # no zz-smoke leftovers
```

Owner commit suggestion: `feat(content): reserved-slug check and new-project scaffolding script`

### Task 5: Docs

**Files:**
- Create: `docs/adding-a-project.md`, `CLAUDE.md`, `.env.example`
- Rewrite: `README.md`, `src/__tests__/README.md`
- Modify: `.gitignore`

- [x] **Step 1: `docs/adding-a-project.md`**

````markdown
# Adding or editing a project

Content lives in `content/projects/<slug>.json`; images in `public/projects/<slug>/`.
There is no CMS. Edit the JSON, commit, push; Vercel rebuilds the site. `npm run build`
runs `content:check` first, so a broken file fails the deploy rather than shipping.

## New project

1. `npm run content:new -- --slug my-app --image ~/Desktop/my-app.png`
   The image path is relative to where you run the command. The file name is lower-cased; each run of characters other than a–z, 0–9 and `.` becomes one hyphen, and hyphens at the ends or before the extension are dropped.
2. Paste the two printed lines into `content/projects/index.ts`: the `import` at the top, the entry inside `projectFiles`.
3. Fill in the empty fields in `content/projects/my-app.json` (schema below). The skeleton
   has one empty takeaway on purpose: `content:check` refuses empty strings, so it cannot be
   forgotten. Also check the defaults the script picks: `type: "personal"`, `status: "Prototype"`, `featured: false`, `order: 99`, `githubUrl: null` (which shows the rights note).
4. `npm run content:check` must pass.
5. `npm run dev` and open `/projects/my-app`.

## Schema

| Field | Type | Notes |
|---|---|---|
| `slug` | string | Must equal the file name. Lowercase kebab-case. Becomes the URL. `professional`, `personal`, `web` and `native` are reserved. |
| `name` | string | |
| `type` | `"professional"` \| `"personal"` | Drives the two group pages and the prev/next links, which stay within a type. |
| `status` | `"In Progress"` \| `"Prototype"` \| `"Live"` \| `"Archived"` | Shown on cards, home rows and the detail page. |
| `featured` | boolean | At most one `true` per `type` (`content:check` enforces it); that project is the group's row on the home page. With none, the lowest `order` is used. |
| `order` | integer | Lower first, within the type. |
| `description` | string | One or two plain sentences; cards and the meta description. No Markdown. |
| `techStack.frontend/backend/other` | string[] | Chips. The detail page merges the three lists and de-duplicates. |
| `liveUrl`, `githubUrl` | string \| null | Absolute http(s) URLs. `githubUrl: null` shows the "I do not own the rights" note. |
| `image` | object | Written by the script. `alt` is required and also feeds `og:image:alt`; describe the screenshot. |
| `overview`, `challenge`, `solution` | string (Markdown) | Paragraphs separated by blank lines. Links, bold, code, lists and tables allowed. |
| `keyTakeaways` | string[] (inline Markdown) | At least one. One idea per item. Rendered inside a list item, so no paragraphs or headings. |
| `sections` | `[{ heading, body }]` (optional) | Extra Markdown sections after Key Takeaways. Use distinct headings. |
| `seo.title` | string (optional) | **Full** `<title>` override. Without it the title is `<name> \| Ben Wozak`. |
| `seo.description` | string (optional) | Overrides the meta description. |
| `updatedAt` | ISO date (optional) | Sitemap `lastModified`; without it the sitemap uses the build time. The script stamps it; update it when you edit. |

## Markdown rules

- Rendered by `react-markdown` with GitHub-flavoured Markdown. Raw HTML is shown as text, not rendered.
- Links: absolute `http(s)://` URLs (open in a new tab), site paths such as `/projects/other-slug` or `#anchor` (client-side navigation), and `mailto:`. Other schemes such as `tel:` are stripped, leaving a dead link.
- Keep each block (`overview`, `challenge`, `solution`, a section body) under roughly two
  phone screens of text. Sections fade in when 30% of them is visible, so a block taller than about
  three viewports would never appear.

## Replacing an image

Run `content:new` into a scratch slug to get the new `image` block. Copy the block into the real project, change `/projects/<scratch>/` in `src` to `/projects/<slug>/` and put back the real `alt` (the scratch one is empty). Move the file into `public/projects/<slug>/`, bump `updatedAt`, then delete `content/projects/<scratch>.json`, `public/projects/<scratch>/` and the old image. `content:check` fails until all of that is done.
````

- [x] **Step 2: `CLAUDE.md`**

````markdown
# portfolio-v2

Personal portfolio for Ben Wozak at https://benwozak.dev. Statically generated Next.js site plus one route handler that verifies Turnstile; no CMS, no database.

## Stack

Next.js 15 App Router + React 19, TypeScript strict, Tailwind 3.4 (HSL tokens in `src/app/globals.css`), framer-motion, next-themes, Vitest + Testing Library. Deployed on Vercel. Node 22, npm, `package-lock.json` is committed.

## Commands

- `npm run dev` / `npm run build` / `npm run start`
- `npm run lint`, `npx tsc --noEmit` (run `rm -rf .next` first; stale route type stubs cause false errors)
- `npm run test:run` (all; must be green), `npm run content:check` (content integrity; also runs as `prebuild`, locally and on Vercel)
- `npm run content:new -- --slug <slug> --image <path>` scaffolds a project

## Content model

- Projects: `content/projects/<slug>.json` + `public/projects/<slug>/`, loaded by `src/lib/projects/` and validated by `src/lib/projects/schema.ts`. See `docs/adding-a-project.md`.
- Everything else (hero, about, experience, socials, nav) is hard-coded in `src/components/`.
- Markdown in project text is rendered by `src/components/content/markdown/Markdown.tsx` (react-markdown + remark-gfm, server component, no raw HTML).
- Site-wide metadata strings live in `src/lib/site.ts`. A page that sets `openGraph` or `twitter` replaces the root block wholesale, so restate `type`, `siteName`, `locale`, `url`, `title`, `description` and `images` in `openGraph`, and `card`, `title`, `description` and `images` in `twitter`. A `"use client"` page cannot export metadata; give it a `layout.tsx` (see `src/app/(app)/contact/layout.tsx`).

## Conventions

- Interactive elements use the `.focus-ring` utility.
- Motion: `MotionConfig reducedMotion="user"` is global. Entrance pattern is `AnimatedSection` (fades in at 30% in view) + `itemVariants`.
- Tests live in `src/__tests__/`, mirrored by path. `src/__tests__/setup.ts` mocks next/navigation, next/image, next/link and framer-motion; the framer-motion mock renders any `motion.<tag>` as the plain tag via a Proxy, so new elements need no mock changes. The content tests in `src/__tests__/lib/` declare `@vitest-environment node` (one reads the filesystem, none needs a DOM); under jsdom with `NODE_ENV=production` (Vercel) a `node:` import resolves to nothing.
- `src/lib/projects/schema.ts` and `scripts/content/*` must stay free of Next imports; the scripts run under `tsx`.
- Env vars: only EmailJS (`NEXT_PUBLIC_KEY`, `NEXT_PUBLIC_SERVICE_ID`, `NEXT_PUBLIC_TEMPLATE_ID`) and Turnstile (`NEXT_PUBLIC_TURNSTILE_SITE_KEY`, `TURNSTILE_SECRET_KEY`). See `.env.example`.

## Working with the owner

- **Ask how commits should be handled before starting a piece of work.** The default is that the owner commits: leave the tree uncommitted and hand off the list of changed files with a suggested message. Subagents never run `git add`, `git commit` or `git stash` in any mode; `git rm` / `git mv` are fine.
- **Ask before pushing or opening a PR.** Never merge; the owner merges and verifies production.
- **The owner runs anything that touches production services** (Vercel settings and env vars, Vercel Blob, Turso). Prepare the command, mark it **OWNER RUNS**, and stop.
- `scripts/backups/` contains personal data from the old CMS. Never stage, commit or print it.
- `.env*` files hold secrets. Never print their values and never commit them (`.env.example` is the only tracked one).
- The Vercel CLI is not logged in here. Ask the owner for the build log before reproducing a deploy failure locally.
- Larger pieces of work are planned in `planning/` (one doc per chunk; `planning/README.md` is the index). Record decisions and hand-off notes in the chunk doc.

## History

Until 2026 the site ran on Payload CMS (Turso + Vercel Blob). The removal is documented in `planning/`.
````

- [x] **Step 3: `.env.example` and `.gitignore`**

```
# EmailJS (contact form, browser-side)
NEXT_PUBLIC_KEY=
NEXT_PUBLIC_SERVICE_ID=
NEXT_PUBLIC_TEMPLATE_ID=

# Cloudflare Turnstile (contact form captcha)
NEXT_PUBLIC_TURNSTILE_SITE_KEY=
TURNSTILE_SECRET_KEY=
```

`.gitignore` line 38 is `.env*`; add `!.env.example` on the next line. Confirm with `git check-ignore -v .env.example` (prints nothing) and `git check-ignore -v .env` (prints the `.env*` rule).

- [x] **Step 4: `README.md`**

````markdown
# benwozak.dev

Personal portfolio. Static Next.js 15 site deployed on Vercel.

## Develop

```bash
npm install
cp .env.example .env   # fill in EmailJS + Turnstile keys for the contact form
npm run dev
```

## Content

Projects are JSON files in `content/projects/` with images in `public/projects/`.
See [docs/adding-a-project.md](docs/adding-a-project.md).

## Checks

```bash
rm -rf .next && npm run lint && npx tsc --noEmit && npm run test:run && npm run build
```

`npm run build` runs the content integrity tests first.
````

- [x] **Step 5: `src/__tests__/README.md`**

Rewrite; the current file cites tests that no longer exist (Button variants, LinkButton, useSmoothScroll) and omits the content tests.

````markdown
# Tests

Vitest + Testing Library (jsdom). Files mirror `src/` by path.

```bash
npm test               # watch
npm run test:run       # all, once; must be green
npm run content:check  # src/__tests__/lib only: content/projects integrity (also runs as prebuild)
npm run test:coverage
```

## Layout

- `setup.ts` mocks `next/navigation`, `next/link`, `next/image` and `framer-motion`. Its framer-motion mock renders any `motion.<tag>` as the plain tag.
- `../test-utils.tsx` wraps `render` with `ThemeProvider`.
- `lib/` holds the content integrity tests: schema, index, featured-per-type, adjacency, image files on disk. They declare `@vitest-environment node` (no DOM needed, and Node builtins do not resolve under jsdom when `NODE_ENV=production`).
- `scripts/` tests the content tooling in `scripts/content/`.
- `utils/` tests the hooks in `src/utils/`.
- `components/` holds component tests, grouped as the source is.

## Conventions

- Query by role or label, not test id, unless there is no accessible handle.
- Test behaviour visible to a user, not class names, unless the class is the behaviour (e.g. `sr-only`, `hidden md:block`).
- One `describe` per component; one `it` per behaviour.
````

Owner commit suggestion: `docs: README, CLAUDE.md, env example, adding-a-project guide, tests README`

### Task 6: Green test suite, no baseline

**Files:**
- Modify: `src/__tests__/setup.ts`, failing test files
- Delete: `planning/baseline-test-failures.txt`
- Modify: `planning/00-overview-and-preflight.md`

Known state on `c377d8e`: 38 failures in the baseline across Header (3), ThemeToggle (1), Hero (27), TechOrbit (4), AnimatedSection (1), SectionHeading (2). `Globe.test.tsx` passes but logs unhandled errors. Root causes found so far:
- Hero: `Hero.tsx` uses `motion.h1` and `motion.p`; the framer-motion mock lacks both, so React renders `undefined` ("Element type is invalid"). One mock edit should clear most of the 27.
- Header: "Found multiple elements with the role navigation" (desktop and mobile navs both render; the test needs `getAllByRole` or a name).
- TechOrbit: duplicate `data-testid="orbiting-circles"`.
- The `next/image` mock spreads `priority`, `blurDataURL`, `placeholder` and `fill` onto `<img>`, which React warns about on every render.

- [x] **Step 1: Mocks**

In `src/__tests__/setup.ts`:

```ts
vi.mock('next/image', () => ({
  default: ({ priority, blurDataURL, placeholder, fill, ...props }: any) => {
    return React.createElement('img', { ...props, alt: props.alt })
  },
}))
```

and replace the hand-listed `motion` object with `motion: new Proxy({}, { get: (_, tag) => tag as string })`, so any `motion.<tag>` renders as the plain tag and new elements never need mock changes (the first version listed `h1`, `h2`, `p`, `nav`, `header`; the review preferred the Proxy).

- [x] **Step 2: Run and list**

```bash
npm run test:run 2>&1 | grep -E "^ (FAIL|×|✗)" | sort | uniq -c | sort -rn
```

- [x] **Step 3: Triage each failing file**

For each remaining failure: if it tests behaviour the component still has, fix the assertion (stale class names from chunk 06/07, duplicate roles, test ids). If it tests behaviour that no longer exists, delete the test case; delete the file only if nothing in it is worth keeping. Record each deletion in the hand-off log with one line of reasoning. Also silence the `Globe.test.tsx` unhandled errors at their source (mock `cobe` if that is where they come from).

- [x] **Step 4: Remove the baseline**

```bash
npm run test:run 2>&1 | tail -4      # 0 failed
git rm planning/baseline-test-failures.txt
```

In `planning/00-overview-and-preflight.md`, under "Failing-set check", add one line at the top: "**Retired in chunk 08:** the suite is green and the baseline file is deleted. `npm run test:run` must pass; the `comm` workflow below is history." Leave the rest for the record.

Owner commit suggestion: `test: fix stale mocks and assertions; suite green; retire the failure baseline`

### Task 7: Leftover CSS and `CTAButton` follow-ups (from the Task 1 review)

**Files:**
- Modify: `src/app/(app)/globals.css`, `tailwind.config.ts`, `src/components/ui/CTAButton.tsx`, `src/__tests__/components/ui/CTAButton.test.tsx`

- [x] **Step 1: Confirm nothing uses the animation leftovers**

```bash
grep -rn "animate-fade-in\|animate-fade-up\|animate-bounce-horizontal\|animation-complete\|animate-shimmer\|animate-fadeIn\|fadeUp\|bounce-horizontal" src --include='*.tsx' --include='*.ts' | grep -v globals.css
```

Expected: nothing (checked 2026-10-31).

- [x] **Step 2: `globals.css`**

Everything after the `@layer utilities { .h-screen-dvh … }` block is dead: `@keyframes shimmer`, `@keyframes fadeIn`, the commented-out second `fadeIn`, `@keyframes fadeUp`, `@keyframes bounce-horizontal`, `.animate-bounce-horizontal`, `.animate-fade-in`, `.animate-fade-up`, the second `@layer utilities` block that redefines those two, and both `body…animation-complete` rules. Delete from the blank line after that utilities block to the end of the file, so the file ends with:

```css
@layer utilities {
  .h-screen-dvh {
    height: 100vh;
    height: 100dvh;
  }
}
```

Confirm with `tail -8 src/app/globals.css` and `grep -c "@keyframes" src/app/globals.css` (expected 0).

- [x] **Step 3: `tailwind.config.ts`**

In `theme.extend.animation` keep only `orbit`; in `theme.extend.keyframes` keep only `orbit`. Remove the `shimmer` and `fadeIn` entries from both. Do not reformat the rest of the file.

- [x] **Step 4: `CTAButton`**

In `src/components/ui/CTAButton.tsx`:
- delete the `"use client";` line (the component has no hooks, handlers or browser APIs; `next/link` renders in server components, and two callers, `ContactCTA` and `ProjectLinks`, are server trees);
- in the inner `<span>` class string remove `lg:py-2` (duplicates `py-2`) and `hover:border-primary-foreground` (a span with no border).

In `src/__tests__/components/ui/CTAButton.test.tsx` remove those two class names from any `toHaveClass` list that asserts them (around lines 186 and 202). Nothing else changes.

- [x] **Step 4b: `keyTakeaways` must have at least one item (from the docs fact-check)**

`strArray` accepts `[]`, so a project with no takeaways passes `content:check` and renders an empty "Key Takeaways" box; `docs/adding-a-project.md` already says "At least one". TDD: in `src/__tests__/lib/projectSchema.test.ts` add

```ts
it('rejects an empty keyTakeaways array', () => {
  expect(() => parseProject({ ...valid, keyTakeaways: [] }, 'test')).toThrow(/at least one/)
})
```

run it (fails), then in `src/lib/projects/schema.ts` directly after `const keyTakeaways = strArray(r, 'keyTakeaways', 'keyTakeaways')` add

```ts
  if (keyTakeaways.length === 0) fail('keyTakeaways', 'must have at least one item')
```

and run again (passes). Also fix the header comment of `src/lib/site.ts` so it says which fields go where:

```ts
// One home for the strings the metadata blocks repeat. Next replaces a nested
// `openGraph` or `twitter` object wholesale per segment, so a page that sets one
// restates everything: openGraph needs type, siteName, locale, url, title,
// description and images; twitter needs card, title, description and images.
```

- [x] **Step 5: Verify**

```bash
npx vitest run src/__tests__/components/ui/CTAButton.test.tsx src/__tests__/lib    # 19/19 and 33 schema tests
rm -rf .next && npx tsc --noEmit && npm run lint && npm run build 2>&1 | tail -25
```

Then under `next start -p 3100`: `/` and `/projects/calgary-folk-fest` return 200 and contain `Visit live site` or the hero's CTA text; `/contact` returns 200.

Commit suggestion: `chore: remove unused animation CSS and keyframes; CTAButton as a server component`

### Task 8: Branded 404 for unknown URLs (from the Task 1 review)

**Files:**
- Move: `src/app/(app)/layout.tsx`, `not-found.tsx`, `globals.css`, `fonts/` → `src/app/`
- Modify: `src/app/layout.tsx` (one import path, one comment), `src/app/not-found.tsx` (metadata), `CLAUDE.md` (one path)
- Modify (Step 0, from the Task 7 review): `src/components/content/projects/case-study/CaseStudySidebar.tsx`, `src/__tests__/components/content/projects/case-study/CaseStudySidebar.test.tsx`

- [x] **Step 0: Hide the empty "Stack" row (TDD).** `TechChips` returns null for no items, so a project with all three `techStack` arrays empty shows a bare "Stack" label (the same empty-box bug Task 7 fixed for Key Takeaways). Test first:

```tsx
it('omits the Stack row when the project has no tech stack', () => {
  render(<CaseStudySidebar project={{ ...project, techStack: { frontend: [], backend: [], other: [] } }} />)
  expect(screen.queryByText('Stack')).toBeNull()
  expect(screen.queryByRole('list', { name: /tech stack/i })).toBeNull()
  expect(screen.getByText('Status')).toBeInTheDocument()   // the other rows stay
})
```

then in `CaseStudySidebar.tsx` compute `const stack = stackItems(project.techStack);` next to `const group = …` and wrap the Stack row in `{stack.length > 0 && ( … <TechChips items={stack} /> … )}`.

**Why.** Checked 2026-10-31 under `next start`: `/about`, `/definitely-not-a-page` and `/projects/nope` all returned Next's built-in unstyled "404: This page could not be found." The branded `not-found.tsx` never rendered in production because it and the root layout sat inside the `(app)` route group: Next's `/_not-found` route for unmatched URLs uses the **root-level** `app/layout.tsx` + `app/not-found.tsx`, and a group's `not-found.tsx` only serves `notFound()` calls made inside that group.

**Approach that was tried and rejected (spec review, with minimal-app experiments A–E in the scratchpad):** a catch-all `src/app/(app)/[...missing]/page.tsx` calling `notFound()`, plus dropping `dynamicParams = false` on `/projects/[slug]`. It returns 404, but a `notFound()` thrown from a page with no Suspense boundary above it makes React's server renderer fail the shell; Next then serves `<html id="__next_error__">` with an empty body and the branded page exists only in the RSC payload, rendered client-side. No-JS clients get a blank page, and every random URL writes a cache entry. The same happens with a root layout (experiment B), so it is the mechanism, not the group, that is wrong.

**What works (experiment D):** real root files. Next then server-renders `/_not-found` inside the layout for every unmatched URL, including unknown project slugs when `dynamicParams = false` stays.

- [x] **Step 1: Move the root pieces out of the group**

```bash
git mv "src/app/(app)/layout.tsx" src/app/layout.tsx
git mv "src/app/(app)/not-found.tsx" src/app/not-found.tsx
git mv "src/app/(app)/globals.css" src/app/globals.css
git mv "src/app/(app)/fonts" src/app/fonts
```

The `(app)` group keeps the pages, `sitemap.ts`, `contact/`, `projects/`, `api/`; a group without a layout is fine. In `src/app/layout.tsx`: `import "../../styles/normalization.css"` → `import "../styles/normalization.css"`; `./globals.css` and `./fonts/…` stay. Add a comment above the imports explaining why the layout lives at the root (see the file). `src/app/(app)/projects/[slug]/page.tsx` keeps `export const dynamicParams = false;` unchanged.

- [x] **Step 2: Title for the 404**

In `src/app/not-found.tsx` add `export const metadata: Metadata = { title: "Page not found" };` so the tab reads "Page not found | Ben Wozak" instead of the home title.

- [x] **Step 3: Docs**

`CLAUDE.md`: `src/app/(app)/globals.css` → `src/app/globals.css`.

- [x] **Step 4: Verify**

```bash
rm -rf .next && npm run build 2>&1 | grep -vE "^\s*$" | tail -22
```

Expected: `○ /_not-found` present, no catch-all, the four project slugs still `●`, `ƒ /robots.txt` and `ƒ /api/contact/verify` unchanged. Under `next start -p 3100`, for `/about`, `/definitely-not-a-page`, `/projects/nope`, `/nope?x=1`: status 404, **rendered** markup contains the branded paragraph (`grep -o '<p[^>]*>Well, this is awkward'`, which excludes the escaped RSC payload), `<header` present, `<title>` "Page not found | Ben Wozak". `/projects/web` → 308; the 200 pages have paragraph count 0; `/robots.txt`, `/sitemap.xml` → 200; `/api/contact/verify` → 405.

Commit suggestion: `fix(404): root layout and not-found out of the route group so unknown URLs render the branded page`

---

## Verification checklist

- [x] `rm -rf .next && npx tsc --noEmit`, `npm run lint`, `npm run build`, `npm run test:run` all clean; `test:run` reports 0 failed
- [x] `npm run content:check` passes and is visible at the top of `npm run build`
- [x] `grep -rn "payload" src --include='*.ts' --include='*.tsx' -il` → empty
- [x] `grep -rn "tailwindcss-animate\|class-variance-authority\|@your_twitter_handle" . --exclude-dir=node_modules --exclude-dir=.next --exclude-dir=planning` → empty
- [x] `ls docs/adding-a-project.md CLAUDE.md .env.example src/lib/site.ts src/app/robots.ts` all present; `planning/baseline-test-failures.txt` gone
- [x] `next start -p 3100`: `/robots.txt` 200; `/`, `/contact`, both group pages and all four project pages 200; `/about`, `/nope` and `/projects/nope` 404 **with the branded "Well, this is awkward" page in the server-rendered HTML, not just the RSC payload**; `/resume`, `/blog/x`, `/projects/web` still 308
- [x] `grep -c "@keyframes" src/app/globals.css` → 0; `grep -n "use client" src/components/ui/CTAButton.tsx` → nothing
- [x] No `scripts/backups/` or `.env` (other than `.env.example`) in `git status`
- [ ] Vercel preview renders every route and `/robots.txt`

## Done when

PR `chunk-08-cleanup` → `main` is open, green, merged, production verified (including `https://benwozak.dev/robots.txt`).

## Out of scope / deferred

- Flattening `src/app/(app)/` into `src/app/`: low value, nonzero risk; leave it. (Task 8 moved only the root pieces, `layout.tsx`, `not-found.tsx`, `globals.css` and `fonts/`, because Next needs them at the app root for `/_not-found`; the pages stay in the group.)
- Deleting Vercel env vars, Blob store, Turso: chunk 09.
- `AnimatedSection` threshold and reduced-motion behaviour: owner chose to leave animations as they are.
- Image `alt` text content edits: owner chose to leave content as it is.
- `siteName` wording: unchanged by owner decision.

### Follow-ups surfaced by the chunk 08 reviews (not done here)

- **Header mobile overlay a11y** (`Header.tsx`): no `role="dialog"`/`aria-modal`/name, toggle has no `aria-controls`, no focus move, trap, Escape or focus return; the overlay `<nav>` is the only unlabelled nav. The Header tests scope the overlay via the close button's parent until the component exposes a role or name.
- **Theme hydration mismatch** (`ThemeToggle.tsx`, `Logo.tsx`): `theme ?? "system"` renders the System icon on the server, but next-themes 0.4 already has the stored theme on the client's first render, so a returning user hydrates a different icon/src. Use a `mounted` guard as next-themes recommends. The components' "undefined until mounted" comments are wrong.
- **Dropdown trigger** (`Dropdown.tsx`) is an icon-only button with no accessible name.
- **404 page design** (`src/app/not-found.tsx`): `fixed inset-0 z-50` paints over the header while its links stay focusable; no `h1`. Let it sit in `<main>`.
- **Share image**: `BW_logo.svg` is an SVG (not rendered by X/Facebook/LinkedIn) with a declared 1200×630 that does not match its portrait viewBox. A real PNG is a one-line swap in `SITE_IMAGE`.
- **`SITE_URL` apex vs www**: production 308s to `www`; decide the canonical host (owner).
- **`engines`**: vitest 4 / vite 7 need Node ≥ 20.19; no `engines` field declares it.
- **`toPublicFilename`** turns a name with no ASCII letters or digits into a dotfile; accented letters are dropped rather than transliterated.
- **404 robots tags**: the 404 page emits Next's `noindex` alongside the root layout's `index, follow`; add `robots: { index: false }` to `not-found.tsx`'s metadata. Harmless with the 404 status.
- **`NoFallbackError`** log line for `/projects/<unknown>` under `next start` (Next 15.4 noise with `dynamicParams = false`).

## Hand-off log

_(append dated notes here)_

**2026-10-30 (from chunk 05)**
- **Add a task: fix `/robots.txt`.** It returns 404 locally and on production.
  - **Cause.** `src/app/(app)/robots.ts` sits in a route group, and Next only recognises `robots.ts` at the app root, so it never appears in the build's route table.
  - **Fix.** `git mv "src/app/(app)/robots.ts" src/app/robots.ts`, then confirm that `/robots.txt` shows as `ƒ` in `npm run build` and returns 200 under `next start`. → **Task 0.**

- 2026-10-31 (carried in from 06) — Reserved slugs: a project slug of `professional`, `personal`, `web` or `native` would be shadowed by a static page or a redirect. → **Task 4** (schema and script).
- 2026-10-31 (carried in from 06) — The group pages inherit the root layout's `openGraph` block (home title and URL). → **Task 3 Step 4.**
- 2026-10-31 (carried in from 06) — `content:check` is a manual gate: `next build` does not run it. → **Task 2 Step 3** (`prebuild`).
- 2026-10-31 (carried in from 06) — `globals.css` hand-defines `.line-clamp-2`/`.line-clamp-3` → **Task 1 Step 4.** The `next/image` test mock spreads `priority`/`blurDataURL` onto `<img>` → **Task 6 Step 1.**
- 2026-10-31 (carried in from 07) — `docs/adding-a-project.md` semantics (`seo.title` absolute, Markdown fields, http(s)/mailto only, distinct headings) → **Task 5 Step 1.**
- 2026-10-31 (carried in from 07) — `AnimatedSection` 30% threshold vs very tall sections → owner: leave the animation; a length guideline is in `docs/adding-a-project.md` instead.
- 2026-10-31 (carried in from 07) — Reduced motion still fades → owner: leave as is.
- 2026-10-31 (carried in from 07) — `siteName` repeated in two files → **Task 3** lifts it into `src/lib/site.ts`; value unchanged by owner decision. Thin `alt` text → owner: leave content.
- 2026-10-31 (carried in from 07) — `CTAButton` leftovers → **Task 1 Step 5.**

**2026-10-31 — Execution log.**
- Task 0 done inline (`d47d5fe`): `/robots.txt` is `ƒ` in the route table and returns 200 under `next start`.
- Task 1 done (`0adc807`), implementer + spec review + quality review. Spec reviewer confirmed `CTAButton.tsx` byte-identical to the plan and the eight deletions exact. One deviation folded in: the CTAButton test asserted the removed `text-md` class (which never existed in the compiled CSS), so that one assertion was dropped. Quality reviewer diffed the compiled Tailwind output: only utilities used solely by the deleted components disappeared; `.blog-content` was never emitted; `.line-clamp-2` still comes from core. Its findings became **Task 7** (dead animation CSS at the end of `globals.css`, unused `shimmer`/`fadeIn` in `tailwind.config.ts`, `CTAButton` needs no `"use client"`, two no-op span classes) and **Task 8** (every unknown URL, including `/projects/nope`, gets Next's unstyled built-in 404 because the root layout and `not-found.tsx` live inside the `(app)` group; confirmed under `next start`).

- Task 2 done (`a016faa`), implementer + both reviews. Spec reviewer compared the lockfile package by package: only the two subtrees removed, 72 `dev: true` flips (tailwind's deps were held in prod by `tailwindcss-animate`'s peer dependency), `next` 15.4.11 unchanged. Quality reviewer compiled the CSS with and without the plugin: the plugin only ever added unused animation-timing rules. `npm ci --dry-run` on the new lockfile is clean. **Owner check after the first deploy:** the Vercel build log must show `> prebuild` and the 50 vitest tests before `next build`. Noted, not done: an `engines` field (vitest 4 / vite 7 need Node ≥20.19; Vercel's current Node versions all qualify); the stray `~/package-lock.json` outside the repo that makes Next warn about multiple lockfiles locally.

- Task 3 done (`0e21b4d`), implementer + both reviews + one fix pass. Beyond the plan text, the quality reviewer (who ran Next's own `accumulateMetadata` on the segment chain) found that the group pages still inherited the home page's **Twitter** card, so both now set `twitter` too; `twitter.images` passes descriptors everywhere so `twitter:image:alt` is emitted; `SITE_LOCALE` joined `site.ts`; `sitemap.ts` and `robots.ts` take their host from `SITE_URL`; and `/contact` (a client page, so it could not export metadata) got `src/app/(app)/contact/layout.tsx` with title "Contact" and a drafted description **the owner should approve or reword**: "Get in touch about a project, a role or a collaboration." **Owner decisions, open:** (1) `SITE_URL` is the apex `https://benwozak.dev`, but production 308s to `www`, so every `og:url`, sitemap `<loc>` and the robots `Sitemap:` line points at a redirect; either set `SITE_URL` to the www host (one-line change now) or make the apex primary in Vercel. (2) The share image `BW_logo.svg` is an SVG (X, Facebook and LinkedIn do not render SVG `og:image`) and its declared 1200×630 does not match its portrait viewBox; a real 1200×630 PNG at `public/og.png` would be a one-line swap in `SITE_IMAGE`. Project pages are unaffected (own screenshots).
- Task 4 done (`66d0081`), implementer + both reviews + one fix pass. TDD evidence recorded (4 failing → 32 passing). Review-driven: `keyTakeaways: ['']` so the skeleton cannot pass `content:check` unfilled; `SLUG_RE` exported and shared; `RESERVED_SLUGS` derived from `PROJECT_TYPES`; `toPublicFilename` now strips every URL-unsafe character (a `#` in a screenshot name would have broken the image URL), with two new tests; `--image` resolved against `INIT_CWD`; `updatedAt` stamped; `satisfies Project`; digit-leading slugs get a `_` identifier prefix. Not done (rare): a file name with no ASCII letters or digits becomes a dotfile (`スクリーンショット.png` → `.png`); accented letters are dropped rather than transliterated.
- Task 5 done (`7d05e71`), implementer + one fact-check review (every claim in the five docs checked against code) + one fix pass. Corrections worth knowing: `featured` is **at most** one per type (zero falls back to the lowest `order`), not exactly one; Markdown links also allow site-relative paths and `#anchors` through `next/link`, and `tel:` is stripped to a dead link; the "Replacing an image" recipe needed the `src` prefix and `alt` steps or `content:check` would fail; the metadata-restating list needed `type` and `card`. The review also found that `strArray` accepts `[]` for `keyTakeaways`, so the "At least one" the docs promise was not enforced → **Task 7 Step 4b**. The docs' code blocks in this plan are mirrored from the committed files.
- Task 7 done (`3fac3e4`), implementer + both reviews. Quality reviewer compiled Tailwind for HEAD and the working tree: only the removed rules disappear; `animate-orbit` still used by `orbiting-circles.tsx`. `CTAButton` importers classified (two server trees, two client trees); none passes a function prop, so dropping `"use client"` only removes a client boundary. Review-driven: the `site.ts` comment now says which fields go to `openGraph` and which to `twitter`; the empty-`techStack` "Stack" row became **Task 8 Step 0**.
- Task 8 done (`a2d729d`), implementer + both reviews + one rework. The first implementation (catch-all + `dynamicParams` removed) matched the plan but the spec reviewer proved with five minimal Next 15.4.11 apps that a `notFound()` thrown from a page yields the empty `__next_error__` shell (client-rendered 404, blank without JS) and a cache entry per random URL; the quality reviewer reached the same conclusion from the Next source. Reworked to option D: `layout.tsx`, `not-found.tsx`, `globals.css` and `fonts/` moved to `src/app/`; `/_not-found` is now a static, server-rendered branded page inside the layout with title "Page not found | Ben Wozak"; CSS and font hashes identical before and after the move. **Owner notes:** (1) `next start` logs `Internal: NoFallbackError` for `/projects/<unknown>`; pre-existing Next 15.4 noise from `dynamicParams = false`, response is correct; may appear in Vercel function logs. (2) The 404 design itself is unchanged and worth a later look: `fixed inset-0 z-50` paints over the header while its links stay focusable, and the page has no `h1` (the "404" is an `h2`). Letting it sit in `<main>` would fix both.
- Task 6 done (`bb9200e`), implementer (opus) + both reviews + one fix pass. After the two mock fixes alone, 12 of 38 failures remained; 10 fixed, 2 deleted. Deleted with reasons: AnimatedSection "applies default className when none provided" (`toHaveClass('')` means "has at least one class"; the default is `""`), SectionHeading "handles title with only whitespace" (`toHaveTextContent` normalises whitespace, so it could never pass, and a blank heading is not wanted behaviour). Notable corrections: the Header logo/nav-item close tests were silent no-ops (their `.closest('.fixed')` matched the header itself and an `if` guard hid it); TechOrbit outer/inner orbits never pass `reverse`, so the mock omits the attribute (`not.toHaveAttribute('data-reverse','true')`); ThemeToggle renders `theme ?? "system"` by design. One component change: `globe.tsx` clears its fade-in timer on unmount (the 8 unhandled errors). The quality reviewer confirmed no assertion was weakened. Fix pass: duplicate Hero test removed, close-button test parity, framer-motion mock is now a Proxy (any `motion.<tag>` → plain tag), a Globe regression test, ThemeToggle test hygiene. Baseline file deleted; `planning/00` notes the retirement. Component issues the tests surfaced are listed under "Follow-ups".
- **Vercel preview build of `a016faa` failed in `prebuild`** (owner pasted the log): `projects.test.ts` → `Error: No such built-in module: node:` after Vite warned that `node:fs`/`node:path` were "externalized for browser compatibility". Root cause, traced in Vite's resolver and reproduced locally with `NODE_ENV=production npm run content:check`: Vercel sets `NODE_ENV=production`; under the jsdom environment Vite externalises Node builtins for the browser, and in production mode it returns an empty external id instead of `__vite-browser-external:node:fs`, so the import resolves to nothing. Not a Node-version issue. **Fix (hotfix commit, orchestrator):** the three `src/__tests__/lib/*.test.ts` files declare `// @vitest-environment node` (they only read the filesystem) and `setup.ts` wraps its `window` mocks in `typeof window !== 'undefined'`. Verified: 45/45 under `NODE_ENV=production`, full suite unchanged at 38 pre-existing failures. **Owner check:** the next Vercel build of the branch should show `> prebuild` passing.

**2026-10-31 — Final whole-branch review (`main`..`bb9200e`): ready for PR.** Every checklist line passed except the Vercel preview, which sits behind SSO and is the owner's to check. Extras verified: `NODE_ENV=production content:check` passes; `og:url`/`twitter:title` page-specific everywhere; sitemap lists the same 8 URLs as `main`; fonts and CSS load after the layout move; six plan code blocks byte-identical to the files; lockfile diff is the two removed subtrees plus `dev` flags; no secrets or backups in any commit. Vercel statuses: success on every branch commit except `a016faa` (the prebuild break fixed by `70f4c1b`). Open for the owner: `SITE_URL` apex vs www; the 404 page's conflicting robots tags (follow-up). Reviewer suggests a squash merge so `a016faa` does not stay as a red commit on `main`.

**State for the owner.** Branch `chunk-08-cleanup`, 12 commits on `main` (`c377d8e`), all pushed; PR opened from this branch. Nothing is left uncommitted. `planning/README.md` still shows 08 unticked: tick it after the merge. After merge, verify production: `https://www.benwozak.dev/robots.txt` returns 200 (it is 404 today) and a typo URL shows the branded 404.

**2026-10-31 — Plan revised before execution.** Checked every assumption against `main` at `c377d8e` (07 merged). Removed the stale `animations.ts` and empty-test-dir steps, narrowed the verification grep to `payload`, added Task 0 and the carried-in items above, recorded the owner's seven decisions in the table at the top.
