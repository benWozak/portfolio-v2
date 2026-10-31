# 08 — Cleanup and hardening

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Remove everything the overhaul orphaned, fix the stale config and metadata, document the new content workflow, give future sessions a `CLAUDE.md`, and get the test suite to a clean baseline.

**Architecture:** Grep-before-delete for every dead file. A small `scripts/content/new-project.ts` helper plus `docs/adding-a-project.md` make "add a project" a five-minute job without a CMS. `README.md` and `CLAUDE.md` describe the site as it is now.

**Tech Stack:** none new.

---

## Prerequisites

- Chunks 05, 06 and 07 merged to `main`.

## Start

```bash
git checkout main && git pull
git checkout -b chunk-08-cleanup
```

## File structure

| Path | Change |
|---|---|
| `src/components/content/Services.tsx`, `Pitch.tsx`, `TechnologyShowcase.tsx` | **Delete** (never rendered) |
| `src/components/content/contact/index.tsx` | **Delete** (`Contact` barrel wrapper; `/contact` imports `ContactForm` directly) |
| `src/components/content/index.tsx` | Modify: drop the four exports above |
| `src/components/ui/WebTechnology.tsx`, `src/__tests__/components/ui/WebTechnology.test.tsx` | **Delete** (only TechnologyShowcase used it) |
| `src/components/ui/index.tsx` | Modify: drop `WebTechnology` |
| `src/app/(app)/about/page.tsx` | **Delete** (always 404s; `/about` was never linked) |
| `src/lib/motion.ts` | **Delete** (no importers) |
| `src/utils/functions/animations.ts` | **Delete** if chunk 06 removed its only consumer `ProjectsGrid.tsx` |
| `src/__tests__/components/content/` | **Delete** if still an empty tree |
| `components.json` | **Delete** (shadcn config, nothing installed, wrong CSS path) |
| `tailwind.config.ts` | Modify: drop `./src/pages/**` glob and the `tailwindcss-animate` plugin |
| `package.json` | Modify: remove `class-variance-authority`, `tailwindcss-animate`; add `content:new` script |
| `src/app/(app)/layout.tsx` | Modify: metadata polish |
| `README.md` | **Rewrite** |
| `CLAUDE.md` | **Create** |
| `.env.example` | **Create** |
| `docs/adding-a-project.md` | **Create** |
| `scripts/content/new-project.ts` | **Create** |
| `src/__tests__/README.md` | Modify |
| `planning/baseline-test-failures.txt` | Regenerate (goal: empty) |

---

### Task 1: Dead code

- [ ] **Step 1: Verify each candidate has no consumer, then delete**

```bash
for f in Services Pitch TechnologyShowcase WebTechnology "lib/motion" "functions/animations" "content/contact\"" "components/content\""; do
  echo "== $f"; grep -rn "$f" src --include='*.ts' --include='*.tsx' | grep -v __tests__ | grep -v "^src/components/content/index.tsx\|^src/components/ui/index.tsx"
done
```

Expected: for each name, only the file that defines it (or nothing). `components/content"` should show only `src/app/(app)/page.tsx` importing `Projects, About, Experience`. If something else appears, that file is still live; keep it and note it in the hand-off log.

```bash
git rm src/components/content/Services.tsx src/components/content/Pitch.tsx src/components/content/TechnologyShowcase.tsx \
       src/components/content/contact/index.tsx \
       src/components/ui/WebTechnology.tsx src/__tests__/components/ui/WebTechnology.test.tsx \
       "src/app/(app)/about/page.tsx" src/lib/motion.ts
git rm src/utils/functions/animations.ts        # only if the grep above showed no consumer
rmdir -p src/__tests__/components/content 2>/dev/null || true
```

- [ ] **Step 2: Barrels**

`src/components/content/index.tsx` becomes:

```ts
export { Socials } from "./Socials";
export { About } from "./About";
export { Experience } from "./Experience";
export { Projects } from "./projects";
```

In `src/components/ui/index.tsx` remove `export { WebTechnology } from "./WebTechnology";`.

- [ ] **Step 3: Type-check and commit**

```bash
npx tsc --noEmit
git add -A
git commit -m "chore: remove unrendered components and dead helpers"
```

### Task 2: Dependencies and config

- [ ] **Step 1: Confirm the animate plugin is unused**

```bash
grep -rnE "animate-in|animate-out|fade-in-|fade-out-|slide-in-from|slide-out-to|zoom-in-|zoom-out-|spin-in|spin-out" src --include='*.tsx' --include='*.ts' --include='*.css'
```

Expected: nothing. (`animate-pulse`, `animate-fade-in` and `animate-orbit` are Tailwind core or custom keyframes, not this plugin.)

- [ ] **Step 2: Remove**

```bash
npm uninstall class-variance-authority tailwindcss-animate
git rm components.json
```

In `tailwind.config.ts`: delete `"./src/pages/**/*.{js,ts,jsx,tsx,mdx}"` from `content` and the `require("tailwindcss-animate")` entry from `plugins` (keep `@tailwindcss/typography`).

- [ ] **Step 3: Verify and commit**

```bash
npm run build
git add -A
git commit -m "chore: drop unused deps and shadcn config"
```

### Task 3: Metadata polish

**Files:**
- Modify: `src/app/(app)/layout.tsx` (lines ~37–85)

- [ ] **Step 1: Fix the placeholders**

- `siteName: "Ben Wozaks Portfolio"` → `siteName: "Ben Wozak | Portfolio"`
- `creator: "@your_twitter_handle"` (inside `twitter`): delete the line unless the owner supplies a real handle.
- Keep `metadataBase`, titles and descriptions as they are.

- [ ] **Step 2: Commit**

```bash
git add "src/app/(app)/layout.tsx"
git commit -m "chore(seo): fix site name and remove placeholder twitter handle"
```

### Task 4: New-project helper (TDD-lite)

**Files:**
- Create: `scripts/content/new-project.ts`
- Modify: `package.json` (script)

- [ ] **Step 1: Write the script**

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
  console.error(e)
  process.exit(1)
})
```

- [ ] **Step 2: Add the npm script**

```json
"content:new": "tsx scripts/content/new-project.ts"
```

- [ ] **Step 3: Smoke-test it, then throw the result away**

```bash
npm run content:new -- --slug zz-smoke --image public/android-chrome-512x512.png
npm run content:check          # fails: zz-smoke has empty fields and is not indexed — expected
git clean -fd content/projects/zz-smoke.json public/projects/zz-smoke
npm run content:check          # passes again
```

- [ ] **Step 4: Commit**

```bash
git add scripts/content/new-project.ts package.json
git commit -m "feat(content): new-project scaffolding script"
```

### Task 5: Docs

**Files:**
- Create: `docs/adding-a-project.md`, `CLAUDE.md`, `.env.example`
- Rewrite: `README.md`
- Modify: `src/__tests__/README.md`

- [ ] **Step 1: `docs/adding-a-project.md`**

```markdown
# Adding or editing a project

Content lives in `content/projects/<slug>.json`; images in `public/projects/<slug>/`.
There is no CMS. Edit the JSON, commit, push; Vercel rebuilds the site.

## New project

1. `npm run content:new -- --slug my-app --image ~/Desktop/my-app.png`
2. Paste the two printed lines into `content/projects/index.ts`.
3. Fill in the empty fields in `content/projects/my-app.json` (schema below).
4. `npm run content:check` — must pass.
5. `npm run dev` and open `/projects/my-app`.

## Schema

| Field | Type | Notes |
|---|---|---|
| `slug` | string | Must equal the file name. Lowercase kebab-case. Becomes the URL. |
| `name` | string | |
| `type` | `"professional"` \| `"personal"` | Drives the two group pages. |
| `status` | `"In Progress"` \| `"Prototype"` \| `"Live"` \| `"Archived"` | Badge on cards. |
| `featured` | boolean | At most one `true` per `type`; it is that group's row on the home page. |
| `order` | integer | Lower first. |
| `description` | string | One or two plain sentences; cards + meta description. No Markdown. |
| `techStack.frontend/backend/other` | string[] | Chips. Empty groups are hidden. |
| `liveUrl`, `githubUrl` | string \| null | Absolute URLs. `githubUrl: null` shows the "I do not own the rights" note. |
| `image` | object | Written by the script. `alt` is required; describe the screenshot. |
| `overview`, `challenge`, `solution` | string (Markdown) | Paragraphs separated by blank lines. Links, bold, code, lists allowed. |
| `keyTakeaways` | string[] (inline Markdown) | One idea per item. |
| `sections` | `[{ heading, body }]` (optional) | Extra Markdown sections after Key Takeaways. |
| `seo.title`, `seo.description` | string (optional) | Override the `<title>` and meta description. |
| `updatedAt` | ISO date (optional) | Sitemap `lastModified`. |

## Replacing an image

Run `content:new` into a scratch slug to get the new `image` block, copy the block and the
file into the real project, delete the scratch files.
```

- [ ] **Step 2: `CLAUDE.md`**

```markdown
# portfolio-v2

Personal portfolio for Ben Wozak at https://www.benwozak.dev. Static Next.js site; no CMS, no database.

## Stack
Next.js 15 App Router + React 19, TypeScript strict, Tailwind 3.4 (tokens in `src/app/(app)/globals.css`), framer-motion, next-themes, Vitest 4 + Testing Library. Deployed on Vercel. Node 22, npm, `package-lock.json` is committed.

## Commands
- `npm run dev` / `npm run build` / `npm run start`
- `npm run lint`, `npx tsc --noEmit`
- `npm run test:run` (all), `npm run content:check` (content integrity)
- `npm run content:new -- --slug <slug> --image <path>` scaffolds a project

## Content model
- Projects: `content/projects/<slug>.json` + `public/projects/<slug>/`, loaded by `src/lib/projects/` (validated at build by `src/lib/projects/schema.ts`). See `docs/adding-a-project.md`.
- Everything else (hero, about, experience, socials, nav) is hard-coded in `src/components/`.
- Markdown in project text is rendered by `src/components/content/markdown/Markdown.tsx` (react-markdown + remark-gfm, server component, no raw HTML).

## Conventions
- Interactive elements use the `.focus-ring` utility.
- Motion: `MotionConfig reducedMotion="user"` is global; use `useReducedMotion()` for anything beyond transforms. Entrance pattern is `AnimatedSection` + `itemVariants`.
- Tests live in `src/__tests__/`, mirrored by path. `src/__tests__/setup.ts` mocks next/navigation, next/image, next/link and framer-motion; extend the framer-motion mock when you use a new `motion.*` element.
- Env vars: only EmailJS (`NEXT_PUBLIC_KEY`, `NEXT_PUBLIC_SERVICE_ID`, `NEXT_PUBLIC_TEMPLATE_ID`) and Turnstile (`NEXT_PUBLIC_TURNSTILE_SITE_KEY`, `TURNSTILE_SECRET_KEY`). See `.env.example`.

## History
Until 2026 the site ran on Payload CMS (Turso + Vercel Blob). The removal is documented in `planning/`.
```

- [ ] **Step 3: `.env.example`**

```
# EmailJS (contact form, browser-side)
NEXT_PUBLIC_KEY=
NEXT_PUBLIC_SERVICE_ID=
NEXT_PUBLIC_TEMPLATE_ID=

# Cloudflare Turnstile (contact form captcha)
NEXT_PUBLIC_TURNSTILE_SITE_KEY=
TURNSTILE_SECRET_KEY=
```

`.gitignore` has `.env*`; add `!.env.example` on the next line so the example is tracked.

- [ ] **Step 4: `README.md`**

```markdown
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
```

- [ ] **Step 5: `src/__tests__/README.md`**

Remove any mention of Payload, collections tests, resume tests or `@payload-config`. Add one line: "`npm run content:check` runs the content integrity tests in `src/__tests__/lib/`."

- [ ] **Step 6: Commit**

```bash
git add docs CLAUDE.md .env.example .gitignore README.md src/__tests__/README.md
git commit -m "docs: README, CLAUDE.md, env example, adding-a-project guide"
```

### Task 6: Clean test baseline

- [ ] **Step 1: List what still fails**

```bash
npm run test:run 2>&1 | grep -E "FAIL|✗|×" | sort | uniq -c | sort -rn | head -40
```

- [ ] **Step 2: Triage each failing file**

For each: if it tests a component that still exists, fix the test (usually a stale mock in `setup.ts` or an assertion on classes that changed in chunk 06/07). If it tests behaviour that no longer exists, delete the test file. Commit per file or per group:

```bash
git commit -m "test: fix <file> after <reason>"
```

- [ ] **Step 3: Regenerate the baseline**

Run the baseline command from `00` Task 4. Target: `planning/baseline-test-failures.txt` is empty. If something genuinely cannot be fixed, leave it in the baseline and explain it in the hand-off log.

```bash
git add planning/baseline-test-failures.txt
git commit -m "test: clean baseline"
```

---

## Verification checklist

- [ ] `npx tsc --noEmit`, `npm run lint`, `npm run build`, `npm run test:run` all clean
- [ ] `npm run content:check` passes
- [ ] `grep -rn "payload\|resume\|blog" src --include='*.ts' --include='*.tsx' -il` → empty
- [ ] `ls docs CLAUDE.md .env.example` all present
- [ ] Vercel preview renders every route

## Done when

PR `chunk-08-cleanup` → `main` is open, green, merged, production verified.

## Out of scope / deferred

- Flattening `src/app/(app)/` into `src/app/`: low value, nonzero risk; leave it.
- Deleting Vercel env vars, Blob store, Turso: chunk 09.

## Hand-off log

_(append dated notes here)_

**2026-10-30 (from chunk 05)**
- **Add a task: fix `/robots.txt`.** It returns 404 locally and on production.
  - **Cause.** `src/app/(app)/robots.ts` sits in a route group, and Next only recognises `robots.ts` at the app root, so it never appears in the build's route table.
  - **Fix.** `git mv "src/app/(app)/robots.ts" src/app/robots.ts`, then confirm that `/robots.txt` shows as `ƒ` in `npm run build` and returns 200 under `next start`.

- 2026-10-31 (carried in from 06) — Reserved slugs: a project slug of `professional`, `personal`, `web` or `native` would be shadowed by a static page or a redirect. Have `new-project.ts` or `parseProject` reject them.
- 2026-10-31 (carried in from 06) — The group pages inherit the root layout's `openGraph` block (home title and URL). Add per-page `openGraph` in the metadata pass.
- 2026-10-31 (carried in from 06) — `content:check` is a manual gate: `next build` does not run it, so the 'at least one project per type' rule only fails locally. Consider wiring it into `prebuild` or CI.
- 2026-10-31 (carried in from 06) — `globals.css` still hand-defines `.line-clamp-2`/`.line-clamp-3`, which Tailwind 3.4 provides natively; remove in the cleanup pass. The `next/image` test mock in `src/__tests__/setup.ts` spreads `priority`/`blurDataURL` onto `<img>` and warns; strip those props in the mock.
