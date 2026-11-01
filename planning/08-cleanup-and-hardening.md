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
| `src/app/(app)/projects/professional/page.tsx`, `personal/page.tsx` | Modify: per-page `openGraph` |
| `src/lib/projects/schema.ts`, `src/__tests__/lib/schema.test.ts` | Modify: reject reserved slugs |
| `scripts/content/new-project.ts` | **Create** |
| `docs/adding-a-project.md`, `CLAUDE.md`, `.env.example` | **Create** |
| `.gitignore` | Modify: `!.env.example` |
| `README.md`, `src/__tests__/README.md` | **Rewrite** |
| `src/__tests__/setup.ts` | Modify: `motion.h1`, `motion.p` in the framer-motion mock; strip `next/image`-only props in the image mock |
| Failing test files (see Task 6) | Fix or delete |
| `planning/baseline-test-failures.txt` | **Delete** once empty |
| `planning/00-overview-and-preflight.md` | Modify: note that the failing-set workflow ended with chunk 08 |

### Stale items removed from the original doc

- `src/utils/functions/animations.ts`: already deleted by chunk 06.
- "Delete `src/__tests__/components/content/` if empty": it now holds ten live test files from chunks 06 and 07. Do not touch.
- The `payload|resume|blog` verification grep: `blog` legitimately appears in `Footer.test.tsx` fixture data and `SectionHeading.test.tsx`, and `resume`/`blog` appear in `next.config.ts` redirects. The gate is now `payload` only.

---

### Task 0: `/robots.txt`

**Files:**
- Move: `src/app/(app)/robots.ts` → `src/app/robots.ts`

- [ ] **Step 1: Move**

```bash
git mv "src/app/(app)/robots.ts" src/app/robots.ts
```

No content change. The file imports `next/headers` and returns a per-host rule set, so it stays dynamic (`ƒ`).

- [ ] **Step 2: Verify**

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

- [ ] **Step 1: Verify each candidate has no consumer**

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

- [ ] **Step 2: Delete**

```bash
git rm src/components/content/Services.tsx src/components/content/Pitch.tsx src/components/content/TechnologyShowcase.tsx \
       src/components/content/contact/index.tsx \
       src/components/ui/WebTechnology.tsx src/__tests__/components/ui/WebTechnology.test.tsx \
       "src/app/(app)/about/page.tsx" src/lib/motion.ts
```

- [ ] **Step 3: Barrels**

`src/components/content/index.tsx` becomes:

```ts
export { Socials } from "./Socials";
export { About } from "./About";
export { Experience } from "./Experience";
export { Projects } from "./projects";
```

In `src/components/ui/index.tsx` remove `export { WebTechnology } from "./WebTechnology";`.

In `src/app/(app)/page.tsx` remove the `// Pitch` comment and the `{/* <Pitch /> */}` line.

- [ ] **Step 4: CSS**

In `src/app/(app)/globals.css`, inside `@layer utilities`, delete the `/* Line clamp utilities */` comment with the `.line-clamp-2` and `.line-clamp-3` rules, and the `/* Blog content specific styles */` comment with every `.blog-content…` rule that follows it. Keep `.h-screen-dvh` and anything after the blog block.

- [ ] **Step 5: `CTAButton`**

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

- [ ] **Step 6: Type-check, lint, tests**

```bash
rm -rf .next && npx tsc --noEmit && npm run lint
npm run test:run 2>&1 | tail -5
```

Expected: tsc and lint clean; the failing set unchanged except the deleted WebTechnology file (it was not in the baseline).

Owner commit suggestion: `chore: remove unrendered components, dead CSS and CTAButton leftovers`

### Task 2: Dependencies, config, prebuild

- [ ] **Step 1: Confirm the animate plugin and cva are unused**

```bash
grep -rnE "animate-in|animate-out|fade-in-|fade-out-|slide-in-from|slide-out-to|zoom-in-|zoom-out-|spin-in|spin-out" src --include='*.tsx' --include='*.ts' --include='*.css'
grep -rn "class-variance-authority" src
```

Expected: nothing for both. (`animate-pulse`, `animate-fadeIn`, `animate-orbit` and `animate-shimmer` are Tailwind core or custom keyframes in `tailwind.config.ts`, not this plugin.)

- [ ] **Step 2: Remove**

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

- [ ] **Step 3: `prebuild`**

In `package.json` `scripts`, add before `"build"`:

```json
"prebuild": "npm run content:check",
```

npm runs `prebuild` automatically before `build`, locally and on Vercel (Vercel installs devDependencies, so `vitest` is present). `content:check` is `vitest run src/__tests__/lib`, which validates every `content/projects/*.json`, the index, the one-featured-per-type rule and the image files.

- [ ] **Step 4: Verify**

```bash
rm -rf .next && npm run build 2>&1 | head -20
```

Expected: the `content:check` run appears first (all `src/__tests__/lib` files pass), then the Next build, same route table as before.

Owner commit suggestion: `chore: drop unused deps and shadcn config; run content:check before build`

### Task 3: Metadata

**Files:**
- Create: `src/lib/site.ts`
- Modify: `src/app/(app)/layout.tsx`, `src/app/(app)/projects/[slug]/page.tsx`, `src/app/(app)/projects/professional/page.tsx`, `src/app/(app)/projects/personal/page.tsx`

- [ ] **Step 1: Constants**

```ts
// src/lib/site.ts
// One home for the strings the metadata blocks repeat. Next replaces a nested
// `openGraph` object wholesale per segment, so every page that sets one has to
// restate siteName, locale and the fallback image; import them from here.
export const SITE_URL = "https://benwozak.dev";
export const SITE_NAME = "Ben Wozaks Portfolio";
export const SITE_IMAGE = {
  url: `${SITE_URL}/BW_logo.svg`,
  width: 1200,
  height: 630,
  alt: "Ben Wozak - Software Developer",
};
```

The `SITE_NAME` value is unchanged by owner decision.

- [ ] **Step 2: Root layout**

In `src/app/(app)/layout.tsx`:
- `import { SITE_IMAGE, SITE_NAME, SITE_URL } from "@/lib/site";`
- `metadataBase: new URL(`${SITE_URL}/`)`
- `openGraph.url: `${SITE_URL}/``, `openGraph.siteName: SITE_NAME`, `openGraph.images: [SITE_IMAGE]`
- `twitter.images: [SITE_IMAGE.url]`
- **Delete** the `creator: "@your_twitter_handle",` line inside `twitter`. Keep the top-level `creator: "Ben Wozak"`.
- Everything else (titles, descriptions, keywords, robots) stays.

- [ ] **Step 3: Project page**

In `src/app/(app)/projects/[slug]/page.tsx` import `SITE_NAME` and replace the literal `siteName: "Ben Wozaks Portfolio"` with `siteName: SITE_NAME`. Keep the comment above the block.

- [ ] **Step 4: Group pages**

Both group pages currently export only `title` and `description`, so they inherit the root `openGraph` (home title and URL). In each, extend the export:

```ts
import { SITE_IMAGE, SITE_NAME } from "@/lib/site";

export const metadata: Metadata = {
  title: group.heading,
  description: group.intro,
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    locale: "en_US",
    url: group.href,
    title: group.heading,
    description: group.intro,
    images: [SITE_IMAGE],
  },
};
```

`group.href` is `/projects/professional` or `/projects/personal`; `metadataBase` makes it absolute.

- [ ] **Step 5: Verify**

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
- Modify: `src/lib/projects/schema.ts`, `src/__tests__/lib/schema.test.ts`
- Create: `scripts/content/new-project.ts`
- Modify: `package.json` (script)

- [ ] **Step 1: Failing test for reserved slugs**

In `src/__tests__/lib/schema.test.ts`, next to the existing slug-format test, add (adapt the fixture helper the file already uses):

```ts
it.each(['professional', 'personal', 'web', 'native'])('rejects the reserved slug "%s"', (slug) => {
  expect(() => parseProject({ ...validProject, slug, image: { ...validProject.image, src: `/projects/${slug}/x.png` } }, 'test')).toThrow(/reserved/)
})
```

Run `npx vitest run src/__tests__/lib/schema.test.ts`. Expected: the four new cases fail (no error thrown).

- [ ] **Step 2: Implement**

In `src/lib/projects/schema.ts`, after `const SLUG_RE = …`:

```ts
// Shadowed by a static page (/projects/professional, /projects/personal) or a
// redirect (/projects/web, /projects/native) in next.config.ts.
export const RESERVED_SLUGS = ['professional', 'personal', 'web', 'native'] as const
```

and after the `SLUG_RE` check inside `parseProject`:

```ts
  if ((RESERVED_SLUGS as readonly string[]).includes(slug)) fail('slug', `is reserved (${RESERVED_SLUGS.join(', ')})`)
```

Run the schema test again. Expected: all pass.

- [ ] **Step 3: Write the script**

```ts
// scripts/content/new-project.ts
// Scaffolds a project: copies the image into public/projects/<slug>/, computes
// dimensions + blur, writes content/projects/<slug>.json with empty text fields,
// and prints the two lines to add to content/projects/index.ts.
//
//   npm run content:new -- --slug my-app --image ~/Desktop/my-app.png
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import path from 'node:path'
import { RESERVED_SLUGS } from '../../src/lib/projects/schema'
import { describeImage, toPublicFilename } from './image'

const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

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

  const buffer = await readFile(imagePath)
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
    keyTakeaways: [],
  }
  await writeFile(jsonPath, JSON.stringify(skeleton, null, 2) + '\n')

  const ident = slug.replace(/-([a-z0-9])/g, (_, c: string) => c.toUpperCase())
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

`schema.ts` is already kept free of Next imports so that `scripts/content` can import it under `tsx` (see its header comment).

- [ ] **Step 4: Add the npm script**

```json
"content:new": "tsx scripts/content/new-project.ts"
```

- [ ] **Step 5: Smoke-test it, then throw the result away**

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

- [ ] **Step 1: `docs/adding-a-project.md`**

````markdown
# Adding or editing a project

Content lives in `content/projects/<slug>.json`; images in `public/projects/<slug>/`.
There is no CMS. Edit the JSON, commit, push; Vercel rebuilds the site. `npm run build`
runs `content:check` first, so a broken file fails the deploy rather than shipping.

## New project

1. `npm run content:new -- --slug my-app --image ~/Desktop/my-app.png`
2. Paste the two printed lines into `content/projects/index.ts`.
3. Fill in the empty fields in `content/projects/my-app.json` (schema below).
4. `npm run content:check` must pass.
5. `npm run dev` and open `/projects/my-app`.

## Schema

| Field | Type | Notes |
|---|---|---|
| `slug` | string | Must equal the file name. Lowercase kebab-case. Becomes the URL. `professional`, `personal`, `web` and `native` are reserved. |
| `name` | string | |
| `type` | `"professional"` \| `"personal"` | Drives the two group pages and the prev/next links, which stay within a type. |
| `status` | `"In Progress"` \| `"Prototype"` \| `"Live"` \| `"Archived"` | Badge on cards and on the detail page. |
| `featured` | boolean | Exactly one `true` per `type`; it is that group's row on the home page. |
| `order` | integer | Lower first, within the type. |
| `description` | string | One or two plain sentences; cards and the meta description. No Markdown. |
| `techStack.frontend/backend/other` | string[] | Chips. The detail page merges the three lists and de-duplicates. |
| `liveUrl`, `githubUrl` | string \| null | Absolute http(s) URLs. `githubUrl: null` shows the "I do not own the rights" note. |
| `image` | object | Written by the script. `alt` is required and also feeds `og:image:alt`; describe the screenshot. |
| `overview`, `challenge`, `solution` | string (Markdown) | Paragraphs separated by blank lines. Links, bold, code, lists and tables allowed. |
| `keyTakeaways` | string[] (inline Markdown) | One idea per item. Rendered inside a list item, so no paragraphs or headings. |
| `sections` | `[{ heading, body }]` (optional) | Extra Markdown sections after Key Takeaways. Use distinct headings. |
| `seo.title` | string (optional) | **Full** `<title>` override. Without it the title is `<name> \| Ben Wozak`. |
| `seo.description` | string (optional) | Overrides the meta description. |
| `updatedAt` | ISO date (optional) | Sitemap `lastModified`. |

## Markdown rules

- Rendered by `react-markdown` with GitHub-flavoured Markdown. Raw HTML is shown as text, not rendered.
- Links: `http(s)://` and `mailto:` only. External links open in a new tab.
- Keep each block (`overview`, `challenge`, `solution`, a section body) under roughly two
  screens of text. Sections fade in when 30% of them is visible, so a block taller than about
  three viewports would never appear.

## Replacing an image

Run `content:new` into a scratch slug to get the new `image` block, copy the block and the
file into the real project, delete the scratch files.
````

- [ ] **Step 2: `CLAUDE.md`**

````markdown
# portfolio-v2

Personal portfolio for Ben Wozak at https://benwozak.dev. Static Next.js site; no CMS, no database.

## Stack

Next.js 15 App Router + React 19, TypeScript strict, Tailwind 3.4 (HSL tokens in `src/app/(app)/globals.css`), framer-motion, next-themes, Vitest + Testing Library. Deployed on Vercel. Node 22, npm, `package-lock.json` is committed.

## Commands

- `npm run dev` / `npm run build` / `npm run start`
- `npm run lint`, `npx tsc --noEmit` (run `rm -rf .next` first; stale route type stubs cause false errors)
- `npm run test:run` (all; must be green), `npm run content:check` (content integrity; also runs as `prebuild`)
- `npm run content:new -- --slug <slug> --image <path>` scaffolds a project

## Content model

- Projects: `content/projects/<slug>.json` + `public/projects/<slug>/`, loaded by `src/lib/projects/` and validated by `src/lib/projects/schema.ts`. See `docs/adding-a-project.md`.
- Everything else (hero, about, experience, socials, nav) is hard-coded in `src/components/`.
- Markdown in project text is rendered by `src/components/content/markdown/Markdown.tsx` (react-markdown + remark-gfm, server component, no raw HTML).
- Site-wide metadata strings live in `src/lib/site.ts`. A page that sets `openGraph` replaces the root block wholesale, so restate `siteName`, `locale`, `url` and `images`.

## Conventions

- Interactive elements use the `.focus-ring` utility.
- Motion: `MotionConfig reducedMotion="user"` is global. Entrance pattern is `AnimatedSection` (fades in at 30% in view) + `itemVariants`.
- Tests live in `src/__tests__/`, mirrored by path. `src/__tests__/setup.ts` mocks next/navigation, next/image, next/link and framer-motion; add any new `motion.*` element to that mock or the component renders `undefined`.
- Env vars: only EmailJS (`NEXT_PUBLIC_KEY`, `NEXT_PUBLIC_SERVICE_ID`, `NEXT_PUBLIC_TEMPLATE_ID`) and Turnstile (`NEXT_PUBLIC_TURNSTILE_SITE_KEY`, `TURNSTILE_SECRET_KEY`). See `.env.example`.

## Working with the owner

- **The owner commits.** Do not run `git add`, `git commit` or `git stash`. `git rm` / `git mv` are fine. Hand off with the list of changed files and a suggested commit message.
- **Ask before pushing or opening a PR.** Never merge; the owner merges and verifies production.
- **The owner runs anything that touches production services** (Vercel env vars, Vercel Blob, Turso). Prepare the command, mark it **OWNER RUNS**, and stop.
- `scripts/backups/` contains personal data from the old CMS. Never stage, commit or print it.
- `.env*` files hold secrets. Never print their values and never commit them (`.env.example` is the only tracked one).
- The Vercel CLI is not logged in here. Ask the owner for a build log before reproducing a deploy failure locally.
- Larger pieces of work are planned in `planning/` (one doc per chunk, `planning/README.md` is the index). Record decisions and hand-off notes in the chunk doc.

## History

Until 2026 the site ran on Payload CMS (Turso + Vercel Blob). The removal is documented in `planning/`.
````

- [ ] **Step 3: `.env.example` and `.gitignore`**

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

- [ ] **Step 4: `README.md`**

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
npm run lint && npx tsc --noEmit && npm run test:run && npm run build
```

`npm run build` runs the content integrity tests first.
````

- [ ] **Step 5: `src/__tests__/README.md`**

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

- `setup.ts` mocks `next/navigation`, `next/link`, `next/image` and `framer-motion`. When a component uses a `motion.<tag>` that is not in the mock, add it there.
- `../test-utils.tsx` wraps `render` with the providers.
- `lib/` holds the content integrity tests: schema, index, featured-per-type, adjacency, image files on disk.
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

- [ ] **Step 1: Mocks**

In `src/__tests__/setup.ts`:

```ts
vi.mock('next/image', () => ({
  default: ({ priority, blurDataURL, placeholder, fill, ...props }: any) => {
    return React.createElement('img', { ...props, alt: props.alt })
  },
}))
```

and add `h1: 'h1'`, `h2: 'h2'`, `p: 'p'`, `nav: 'nav'`, `header: 'header'` to the `motion` object (harmless where unused; covers the elements the layout components use).

- [ ] **Step 2: Run and list**

```bash
npm run test:run 2>&1 | grep -E "^ (FAIL|×|✗)" | sort | uniq -c | sort -rn
```

- [ ] **Step 3: Triage each failing file**

For each remaining failure: if it tests behaviour the component still has, fix the assertion (stale class names from chunk 06/07, duplicate roles, test ids). If it tests behaviour that no longer exists, delete the test case; delete the file only if nothing in it is worth keeping. Record each deletion in the hand-off log with one line of reasoning. Also silence the `Globe.test.tsx` unhandled errors at their source (mock `cobe` if that is where they come from).

- [ ] **Step 4: Remove the baseline**

```bash
npm run test:run 2>&1 | tail -4      # 0 failed
git rm planning/baseline-test-failures.txt
```

In `planning/00-overview-and-preflight.md`, under "Failing-set check", add one line at the top: "**Retired in chunk 08:** the suite is green and the baseline file is deleted. `npm run test:run` must pass; the `comm` workflow below is history." Leave the rest for the record.

Owner commit suggestion: `test: fix stale mocks and assertions; suite green; retire the failure baseline`

---

## Verification checklist

- [ ] `rm -rf .next && npx tsc --noEmit`, `npm run lint`, `npm run build`, `npm run test:run` all clean; `test:run` reports 0 failed
- [ ] `npm run content:check` passes and is visible at the top of `npm run build`
- [ ] `grep -rn "payload" src --include='*.ts' --include='*.tsx' -il` → empty
- [ ] `grep -rn "tailwindcss-animate\|class-variance-authority\|@your_twitter_handle" . --exclude-dir=node_modules --exclude-dir=.next --exclude-dir=planning` → empty
- [ ] `ls docs/adding-a-project.md CLAUDE.md .env.example src/lib/site.ts src/app/robots.ts` all present; `planning/baseline-test-failures.txt` gone
- [ ] `next start -p 3100`: `/robots.txt` 200; `/`, `/contact`, both group pages and all four project pages 200; `/about` 404; `/resume`, `/blog/x`, `/projects/web` still 308
- [ ] No `scripts/backups/` or `.env` (other than `.env.example`) in `git status`
- [ ] Vercel preview renders every route and `/robots.txt`

## Done when

PR `chunk-08-cleanup` → `main` is open, green, merged, production verified (including `https://benwozak.dev/robots.txt`).

## Out of scope / deferred

- Flattening `src/app/(app)/` into `src/app/`: low value, nonzero risk; leave it.
- Deleting Vercel env vars, Blob store, Turso: chunk 09.
- `AnimatedSection` threshold and reduced-motion behaviour: owner chose to leave animations as they are.
- Image `alt` text content edits: owner chose to leave content as it is.
- `siteName` wording: unchanged by owner decision.

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

**2026-10-31 — Plan revised before execution.** Checked every assumption against `main` at `c377d8e` (07 merged). Removed the stale `animations.ts` and empty-test-dir steps, narrowed the verification grep to `payload`, added Task 0 and the carried-in items above, recorded the owner's seven decisions in the table at the top.
