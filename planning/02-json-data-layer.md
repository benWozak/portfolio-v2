# 02 — JSON data layer: make the site read `content/projects/`

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Every projects route renders from `content/projects/*.json` through a synchronous loader, while Payload is still installed and still serves the admin, blog and resume. After this chunk no public route queries Payload for projects.

**Architecture:** `src/lib/projects/index.ts` imports the static `projectFiles` map from `content/projects/index.ts`, validates each entry with `parseProject` at module init (so a bad file fails `next build`), sorts by `order`, and exposes `getProjects`, `getProjectSlugs`, `getProjectBySlug`, `getFeaturedProject`, `getAdjacentProjects`. No `fs`, no `unstable_cache`, no `draftMode`. The `Project` type in `src/types/index.ts` switches to the new shape, which forces the few component edits (`media.*` → `image.*`) and the deletion of the video components. The detail page gets an interim rewrite that drops Lexical, draft mode and live preview; its visual redesign is chunk 07.

**Tech Stack:** Next.js 15 static generation (`generateStaticParams` + `dynamicParams = false`), Vitest.

---

## Prerequisites

- Chunk 01 merged into the base branch: `content/projects/index.ts` exists and `npx vitest run src/__tests__/lib` passes.
- Base branch: same as chunk 01 (`main` for pre-flight (a), `audit-improvements` for (b)).

## Start

```bash
git checkout <base> && git pull
git checkout -b chunk-02-json-data-layer
```

## File structure

| Path | Change | Responsibility |
|---|---|---|
| `src/lib/projects/index.ts` | **Create** | Loader API over `content/projects`. Pure, synchronous, no Next imports. |
| `src/__tests__/lib/projects.test.ts` | **Create** | Content-level tests (index complete, slugs unique, one featured, images exist, API behaviour). |
| `src/types/index.ts` | Modify | Re-export the new type; drop the old `Project`, `ProjectMedia`, `TechStack` definitions. |
| `src/components/content/projects/ProjectCard.tsx` | Modify (3 lines) | `media.*` → `image.*`. |
| `src/components/content/projects/ProjectsGrid.tsx` | Modify (1 line) | key by slug. |
| `src/app/(app)/page.tsx` | Modify | Read from the loader. |
| `src/app/(app)/projects/page.tsx`, `web/page.tsx`, `native/page.tsx` | Modify | Read from the loader (routes themselves go in chunk 06). |
| `src/app/(app)/projects/[slug]/page.tsx` | **Rewrite** (interim) | No Lexical, no draft mode, no preview toolbar, no video. |
| `src/app/(app)/sitemap.ts` | Modify | Projects half reads from the loader; blog half unchanged until chunk 04. |
| `src/components/content/projects/MediaContainer.tsx` | **Delete** | Video-only. |
| `src/components/ui/VideoLoader.tsx`, `src/__tests__/components/ui/VideoLoader.test.tsx` | **Delete** | Only MediaContainer used it. |
| `src/components/ui/index.tsx` | Modify | Drop the `VideoLoader` export. |
| `src/utils/hooks/useIntersectionObserver.ts` | **Delete** | Only MediaContainer used it. |
| `src/utils/hooks/index.ts` | Modify | Drop the `useIntersectionObserver` export. |
| `src/utils/getProjects.ts`, `src/utils/getBase64.ts` | **Delete** | Replaced by the loader; blur is precomputed. |
| `src/__tests__/utils/transformPayloadProject.test.ts` | **Delete** | Tests a deleted function. |
| `scripts/export/parity.ts` | **Create** | Offline diff of loader output vs the chunk 01 dump. Deleted in chunk 05. |
| `package.json` | Modify | Remove `plaiceholder`; add `content:check` script. |

Not touched here: `src/collections/`, `src/access/`, `src/payload.config.ts`, `src/app/(payload)/`, the preview API routes, `LivePreviewToolbar` (resume still uses it until chunk 03; deleted in 05).

---

### Task 1: Loader (TDD)

**Files:**
- Create: `src/lib/projects/index.ts`
- Test: `src/__tests__/lib/projects.test.ts`

- [ ] **Step 1: Write the failing tests**

```ts
// src/__tests__/lib/projects.test.ts
import { describe, it, expect } from 'vitest'
import { existsSync, readdirSync } from 'node:fs'
import path from 'node:path'
import {
  getAdjacentProjects,
  getFeaturedProject,
  getProjectBySlug,
  getProjectSlugs,
  getProjects,
} from '@/lib/projects'

const CONTENT_DIR = path.join(process.cwd(), 'content', 'projects')
const PUBLIC_DIR = path.join(process.cwd(), 'public')

describe('content/projects integrity', () => {
  it('indexes every JSON file in content/projects', () => {
    const files = readdirSync(CONTENT_DIR)
      .filter((f) => f.endsWith('.json'))
      .map((f) => f.replace(/\.json$/, ''))
      .sort()
    expect([...getProjectSlugs()].sort()).toEqual(files)
  })

  it('has at least one project', () => {
    expect(getProjects().length).toBeGreaterThan(0)
  })

  it('has unique slugs', () => {
    const slugs = getProjectSlugs()
    expect(new Set(slugs).size).toBe(slugs.length)
  })

  it('has exactly one featured project', () => {
    expect(getProjects().filter((p) => p.featured)).toHaveLength(1)
  })

  it('every image file exists under public/', () => {
    for (const p of getProjects()) {
      expect(existsSync(path.join(PUBLIC_DIR, p.image.src)), `${p.slug}: ${p.image.src}`).toBe(true)
    }
  })
})

describe('loader API', () => {
  it('getProjects is sorted by order ascending and returns copies', () => {
    const a = getProjects()
    const orders = a.map((p) => p.order)
    expect(orders).toEqual([...orders].sort((x, y) => x - y))
    a.pop()
    expect(getProjects().length).toBe(orders.length)
  })

  it('getProjectBySlug round-trips and returns undefined for unknown slugs', () => {
    const first = getProjects()[0]
    expect(getProjectBySlug(first.slug)?.name).toBe(first.name)
    expect(getProjectBySlug('does-not-exist')).toBeUndefined()
  })

  it('getFeaturedProject returns the featured one', () => {
    expect(getFeaturedProject()?.featured).toBe(true)
  })

  it('getAdjacentProjects walks the ordered list with nulls at the ends', () => {
    const all = getProjects()
    const first = getAdjacentProjects(all[0].slug)
    const last = getAdjacentProjects(all[all.length - 1].slug)
    expect(first.prev).toBeNull()
    expect(last.next).toBeNull()
    if (all.length > 1) {
      expect(first.next?.slug).toBe(all[1].slug)
      expect(last.prev?.slug).toBe(all[all.length - 2].slug)
    }
    expect(getAdjacentProjects('does-not-exist')).toEqual({ prev: null, next: null })
  })
})
```

- [ ] **Step 2: Run to verify failure**

```bash
npx vitest run src/__tests__/lib/projects.test.ts
```

Expected: FAIL, `Cannot find module '@/lib/projects'`.

- [ ] **Step 3: Implement the loader**

```ts
// src/lib/projects/index.ts
// Single source of project content for the site. Reads the static import map in
// content/projects/index.ts, validates every file once at module init (a bad file
// fails `next build`), and exposes a tiny synchronous API. No Next imports.
import { projectFiles } from '../../../content/projects'
import { parseProject } from './schema'
import type { Project } from '../../types/project'

const PROJECTS: readonly Project[] = Object.entries(projectFiles)
  .map(([slug, raw]) => parseProject(raw, `content/projects/${slug}.json`, slug))
  .sort((a, b) => a.order - b.order || a.name.localeCompare(b.name))

export function getProjects(): Project[] {
  return [...PROJECTS]
}

export function getProjectSlugs(): string[] {
  return PROJECTS.map((p) => p.slug)
}

export function getProjectBySlug(slug: string): Project | undefined {
  return PROJECTS.find((p) => p.slug === slug)
}

/** The project flagged `featured`; falls back to the first by order so the index page never has an empty hero. */
export function getFeaturedProject(): Project | undefined {
  return PROJECTS.find((p) => p.featured) ?? PROJECTS[0]
}

export function getAdjacentProjects(slug: string): { prev: Project | null; next: Project | null } {
  const i = PROJECTS.findIndex((p) => p.slug === slug)
  if (i === -1) return { prev: null, next: null }
  return { prev: PROJECTS[i - 1] ?? null, next: PROJECTS[i + 1] ?? null }
}

export { parseProject, ProjectValidationError } from './schema'
```

- [ ] **Step 4: Run to verify pass**

```bash
npx vitest run src/__tests__/lib/projects.test.ts
```

Expected: PASS. If "exactly one featured" fails, fix the content (chunk 01 Task 6 Step 3), not the test.

- [ ] **Step 5: Add the `content:check` script and commit**

In `package.json` `scripts`, add:

```json
"content:check": "vitest run src/__tests__/lib"
```

```bash
npm run content:check
git add src/lib/projects/index.ts src/__tests__/lib/projects.test.ts package.json
git commit -m "feat(content): synchronous projects loader over content/projects"
```

### Task 2: Switch the shared `Project` type

**Files:**
- Modify: `src/types/index.ts`
- Modify: `src/components/content/projects/ProjectCard.tsx:17,45,46`
- Modify: `src/components/content/projects/ProjectsGrid.tsx:33`
- Delete: `src/components/content/projects/MediaContainer.tsx`, `src/components/ui/VideoLoader.tsx`, `src/__tests__/components/ui/VideoLoader.test.tsx`, `src/utils/hooks/useIntersectionObserver.ts`
- Modify: `src/components/ui/index.tsx`, `src/utils/hooks/index.ts`

- [ ] **Step 1: Replace `src/types/index.ts`**

```ts
// src/types/index.ts
export * from './project';

// Re-export YakPDF types (resume-only; removed in chunk 03)
export * from './yakpdf';
```

- [ ] **Step 2: Fix ProjectCard**

Line 17: `project.media.blurDataURL ||` → `project.image.blurDataURL ||`
Line 45: `src={project.media.staticImage}` → `src={project.image.src}`
Line 46: `alt={project.media.alt || project.name}` → `alt={project.image.alt}`

- [ ] **Step 3: Fix ProjectsGrid**

Line 33: `key={project.id || index}` → `key={project.slug}`

- [ ] **Step 4: Delete the video components and their barrel lines**

```bash
git rm src/components/content/projects/MediaContainer.tsx \
       src/components/ui/VideoLoader.tsx \
       src/__tests__/components/ui/VideoLoader.test.tsx \
       src/utils/hooks/useIntersectionObserver.ts
```

In `src/components/ui/index.tsx` remove `export { VideoLoader } from "./VideoLoader";`
In `src/utils/hooks/index.ts` remove `export { useIntersectionObserver } from "./useIntersectionObserver";`

- [ ] **Step 5: Type-check**

```bash
npx tsc --noEmit
```

Expected: errors only in `src/utils/getProjects.ts` and `src/app/(app)/projects/[slug]/page.tsx` (both handled next). Any other error means a consumer was missed; fix it.

- [ ] **Step 6: Commit**

```bash
git add -A src/types src/components src/utils/hooks
git commit -m "refactor(projects): switch Project type to content schema, drop video components"
```

### Task 3: Swap the index routes and sitemap onto the loader

**Files:**
- Modify: `src/app/(app)/page.tsx`, `src/app/(app)/projects/page.tsx`, `src/app/(app)/projects/web/page.tsx`, `src/app/(app)/projects/native/page.tsx`, `src/app/(app)/sitemap.ts`

- [ ] **Step 1: Home page**

Replace `import { getProjects } from "@/utils/getProjects";` with `import { getProjects } from "@/lib/projects";` and the fetch line with:

```tsx
  const projects = getProjects().slice(0, 2);
```

(`Home` may stay `async`; nothing else changes.)

- [ ] **Step 2: `/projects`, `/projects/web`, `/projects/native`**

Same import swap in all three. Bodies become:

```tsx
// projects/page.tsx
export default function ProjectsPage() {
  const projects = getProjects();
  return <ProjectsGrid projects={projects} />;
}
```

```tsx
// projects/web/page.tsx
export default function WebProjectsPage() {
  const projects = getProjects().filter((project) => project.type === "web");
  return <ProjectsGrid projects={projects} />;
}
```

```tsx
// projects/native/page.tsx
export default function MobileProjectsPage() {
  const projects = getProjects().filter((project) => project.type === "native");
  return <ProjectsGrid projects={projects} />;
}
```

- [ ] **Step 3: Sitemap**

```ts
// src/app/(app)/sitemap.ts
import type { MetadataRoute } from 'next'
import { getPublishedPosts } from '@/utils/getBlog'
import { getProjects } from '@/lib/projects'

const BASE_URL = 'https://benwozak.dev'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes = [
    '',
    '/projects',
    '/projects/web',
    '/projects/native',
    '/blog',
    '/resume',
    '/contact',
  ].map((route) => ({
    url: `${BASE_URL}${route}`,
    lastModified: new Date(),
  }))

  const projects = getProjects()

  // Never fail the build over a sitemap data fetch
  const posts = await getPublishedPosts().catch(() => [])

  return [
    ...staticRoutes,
    ...projects.map((project) => ({
      url: `${BASE_URL}/projects/${project.slug}`,
      lastModified: project.updatedAt ? new Date(project.updatedAt) : new Date(),
    })),
    ...posts.map((post) => ({
      url: `${BASE_URL}/blog/${post.slug}`,
      lastModified: post.updatedAt ? new Date(post.updatedAt) : new Date(),
    })),
  ]
}
```

- [ ] **Step 4: Commit**

```bash
git add "src/app/(app)/page.tsx" "src/app/(app)/projects" "src/app/(app)/sitemap.ts"
git commit -m "refactor(projects): index routes and sitemap read from content loader"
```

### Task 4: Interim detail page

**Files:**
- Rewrite: `src/app/(app)/projects/[slug]/page.tsx`

This keeps the current two-column look but removes Lexical, draft mode, the preview toolbar and video, renders `keyTakeaways` as a list, renders extra `sections` as plain paragraphs, and hides empty tech-stack groups. Chunk 07 replaces it entirely; do not polish.

- [ ] **Step 1: Replace the file**

```tsx
// src/app/(app)/projects/[slug]/page.tsx
import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SectionHeading } from "@/components/layout/section/SectionHeading";
import { BackButton } from "@/components/ui/BackButton";
import { getProjectBySlug, getProjectSlugs } from "@/lib/projects";

type Params = Promise<{ slug: string }>;

export const dynamicParams = false;

export function generateStaticParams() {
  return getProjectSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const project = getProjectBySlug(slug);
  if (!project) return { title: "Project not found" };
  return {
    title: project.seo?.title ?? `${project.name} | Projects`,
    description: project.seo?.description ?? project.description,
    openGraph: { images: [project.image.src] },
  };
}

const PARAGRAPH = "text-gray-600 dark:text-gray-300 leading-relaxed whitespace-pre-line";
const HEADING = "text-2xl font-semibold mb-4";

export default async function ProjectPage({ params }: { params: Params }) {
  const { slug } = await params;
  const project = getProjectBySlug(slug);
  if (!project) notFound();

  const stackGroups = [
    ["Frontend", project.techStack.frontend],
    ["Backend", project.techStack.backend],
    ["Other", project.techStack.other],
  ] as const;

  return (
    <div className="container mx-auto px-4">
      <SectionHeading title={project.name} />
      <BackButton />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <Image
            src={project.image.src}
            alt={project.image.alt}
            width={project.image.width}
            height={project.image.height}
            placeholder="blur"
            blurDataURL={project.image.blurDataURL}
            priority
            sizes="(max-width: 1024px) 100vw, 66vw"
            className="rounded-md w-full h-auto"
          />

          <section>
            <h2 className={HEADING}>Overview</h2>
            <p className={PARAGRAPH}>{project.overview}</p>
          </section>
          <section>
            <h2 className={HEADING}>Challenge</h2>
            <p className={PARAGRAPH}>{project.challenge}</p>
          </section>
          <section>
            <h2 className={HEADING}>Solution</h2>
            <p className={PARAGRAPH}>{project.solution}</p>
          </section>
          <section>
            <h2 className={HEADING}>Key Takeaways</h2>
            <ul className="list-disc pl-5 space-y-2 text-gray-600 dark:text-gray-300">
              {project.keyTakeaways.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </section>
          {project.sections?.map((section) => (
            <section key={section.heading}>
              <h2 className={HEADING}>{section.heading}</h2>
              <p className={PARAGRAPH}>{section.body}</p>
            </section>
          ))}
        </div>

        <aside className="lg:col-span-1">
          <div className="sticky top-20 space-y-4">
            <section>
              <h2 className={HEADING}>Tech Stack</h2>
              <div className="space-y-6">
                {stackGroups
                  .filter(([, items]) => items.length > 0)
                  .map(([label, items]) => (
                    <div key={label}>
                      <h3 className="font-medium text-gray-900 dark:text-gray-100">{label}</h3>
                      <ul className="space-y-1">
                        {items.map((tech) => (
                          <li key={tech} className="text-gray-600 dark:text-gray-300 text-sm">
                            • {tech}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
              </div>
            </section>

            <section>
              <div className="space-y-3">
                {project.liveUrl && (
                  <Link
                    href={project.liveUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="focus-ring block w-full bg-primary-500 text-primary-foreground px-4 py-3 rounded-md hover:bg-primary-600 transition-colors text-center font-medium"
                  >
                    Live Demo
                  </Link>
                )}
                {project.githubUrl && (
                  <Link
                    href={project.githubUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="focus-ring block w-full bg-secondary-400 dark:bg-secondary-600 text-foreground px-4 py-3 rounded-md hover:bg-secondary-600 hover:dark:bg-secondary-800 transition-colors text-center font-medium"
                  >
                    View Code
                  </Link>
                )}
              </div>
              {!project.githubUrl && (
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mt-4 italic">
                  I do not own the rights to the code for this project.
                </p>
              )}
            </section>
          </div>
        </aside>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Delete the old data path and the blur helper**

```bash
git rm src/utils/getProjects.ts src/utils/getBase64.ts src/__tests__/utils/transformPayloadProject.test.ts
npm uninstall plaiceholder
```

- [ ] **Step 3: Type-check and build**

```bash
npx tsc --noEmit
npm run build
```

Expected: clean. In the build route table, `/projects/[slug]` lists one static path per project (`●` SSG).

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "refactor(projects): interim detail page on content loader; remove Payload projects path"
```

### Task 5: Parity check against the dump (offline)

**Files:**
- Create: `scripts/export/parity.ts`

- [ ] **Step 1: Write the script**

```ts
// scripts/export/parity.ts
// Offline: compares what the site now serves (content/projects via the loader)
// with the raw Payload dump from chunk 01. Run before any hand edits are forgotten.
//   npx tsx scripts/export/parity.ts --from scripts/backups/<stamp>
// Deleted in chunk 05.
import path from 'node:path'
import { getProjects } from '../../src/lib/projects'
import { loadDumpProjects } from './convert-projects'

const squash = (s: string) => s.replace(/\s+/g, ' ').trim()

async function main() {
  const i = process.argv.indexOf('--from')
  const from = i === -1 ? undefined : process.argv[i + 1]
  if (!from) throw new Error('usage: --from scripts/backups/<stamp>')

  const dump = await loadDumpProjects(from)
  const site = getProjects()
  let mismatches = 0
  const report = (slug: string, field: string, a: unknown, b: unknown) => {
    mismatches++
    console.log(`✗ ${slug}.${field}\n    dump: ${JSON.stringify(a)}\n    site: ${JSON.stringify(b)}`)
  }

  for (const d of dump) {
    const s = site.find((p) => p.slug === d.slug)
    if (!s) {
      report(d.slug, '(missing)', d.name, undefined)
      continue
    }
    const pairs: Array<[string, unknown, unknown]> = [
      ['name', d.name, s.name],
      ['type', d.type, s.type],
      ['status', d.status, s.status],
      ['description', squash(d.description), squash(s.description)],
      ['overview', squash(d.overview), squash(s.overview)],
      ['challenge', squash(d.challenge), squash(s.challenge)],
      ['solution', squash(d.solution), squash(s.solution)],
      ['keyTakeaways', d.keyTakeaways.map(squash), s.keyTakeaways.map(squash)],
      ['techStack', d.techStack, s.techStack],
      ['liveUrl', d.liveUrl, s.liveUrl],
      ['githubUrl', d.githubUrl, s.githubUrl],
      ['order', d.order, s.order],
      ['image', d.imageFilename.toLowerCase().replace(/\s+/g, '-'), path.basename(s.image.src)],
    ]
    for (const [field, a, b] of pairs) {
      if (JSON.stringify(a) !== JSON.stringify(b)) report(d.slug, field, a, b)
    }
  }
  for (const s of site) if (!dump.find((d) => d.slug === s.slug)) report(s.slug, '(extra on site)', undefined, s.name)

  console.log(mismatches ? `\n${mismatches} mismatch(es)` : `\n✓ ${site.length} projects match the dump`)
  process.exit(mismatches ? 1 : 0)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
```

- [ ] **Step 2: Run it**

```bash
npx tsx scripts/export/parity.ts --from scripts/backups/<stamp>
```

Expected: `✓ N projects match the dump`. Intentional hand edits from chunk 01 (split takeaways, featured flag, slug renames) show up as mismatches: confirm each is intentional, then move on. `featured` is deliberately not compared.

- [ ] **Step 3: Commit**

```bash
git add scripts/export/parity.ts
git commit -m "chore(export): parity check between content/projects and the Payload dump"
```

### Task 6: Manual comparison against production

- [ ] **Step 1: Run dev and compare**

```bash
npm run dev
```

Open side by side with `https://www.benwozak.dev`: `/`, `/projects`, `/projects/web`, `/projects/native`, and each `/projects/<slug>`. Same projects, same order, same images, same text. The detail page loses the video and gains a bulleted Key Takeaways; everything else should read identically.

- [ ] **Step 2: Confirm nothing requests Payload for projects**

With dev running, `curl -s http://localhost:3000/projects | grep -c "/api/media/file"` → `0`.

---

## Verification checklist

- [ ] `npx tsc --noEmit`, `npm run lint`, `npm run build` clean
- [ ] `npm run test:run` + failing-set check: no new failures; baseline regenerated (the deleted `transformPayloadProject` and `VideoLoader` tests leave it)
- [ ] `grep -rn "utils/getProjects\|MediaContainer\|VideoLoader\|useIntersectionObserver\|getBase64\|plaiceholder" src package.json` → nothing
- [ ] `grep -rn "@payloadcms" src --include=*.tsx --include=*.ts -l` → only files under `src/app/(payload)/` and `src/payload.config.ts`
- [ ] Parity script passes (or every mismatch is logged as intentional)
- [ ] Vercel preview deployment renders all project routes

## Done when

- PR `chunk-02-json-data-layer` is open and green.
- **Pre-flight path (b) only:** after this PR merges into `audit-improvements`, open the PR `audit-improvements → main`. The public site no longer queries Payload for projects, so the missing columns cannot break a page. Verify the production deploy, then every later chunk branches from `main`.

## Out of scope / deferred

- Removing `/projects/web` and `/projects/native`: chunk 06.
- Markdown rendering, case-study layout, prev/next navigation: chunk 07.
- Deleting `scripts/export/`, `LivePreviewToolbar`, preview API routes: chunk 05.

## Hand-off log

**2026-10-21 (Claude): code done, stacked on chunk 01, waiting on the production dump.**

- **Branch.** `chunk-02-json-data-layer` is cut from `chunk-01-export-content`, not from a merged base. Chunk 01 can't finish until the owner runs `preflight.ts` and `dump.ts`. When chunk 01 gains its content commit, rebase this branch onto it. The PR base follows the 00 merge path.
- **Verified against throwaway content.** `content/` and `public/projects/` were generated from a synthetic two-project fixture, using the converter's own output. Nothing from that fixture is committed. Results on that content:
  - Lint and `tsc` are clean.
  - The build passes, and `/projects/[slug]` is `●` SSG with one path per project.
  - `content:check` passes: 28 tests.
- **Failing-set check.** Total tests went from 576 to 552: 9 new loader tests, minus the 33 in the deleted `VideoLoader` and `transformPayloadProject` files.
  - The set check shows no new failures and none gone. The deleted files had no failing tests.
  - I regenerated the baseline and it came out byte-identical, so there's nothing to commit.
- **Checklist greps.** The removed-code grep finds nothing. The `@payloadcms` grep also lists `src/utils/lexicalRenderer.tsx` and `src/components/content/blog/BlogContent.tsx`. Both matches are commented-out type imports in blog code, which is chunk 04's job, so the intent is met.
- **Task 4 Step 4.** Staged by explicit path instead of `git add -A`, so the throwaway content couldn't be swept in.
- **Task 5.** I smoke-tested `parity.ts` on the fixture. It passes when the content matches, and it flags a hand-edited name and an extra takeaway as two mismatches with exit code 1.
- **Task 6 Step 2.** Ran against `next start` on the production build, not `next dev`, which avoids any dev-mode schema push.
  - `/`, `/projects`, `/projects/web`, `/projects/native` and both detail pages returned 200 with zero `/api/media/file` references.
  - An unknown slug returned 404, as `dynamicParams = false` should make it.
  - The sitemap lists both project URLs.
- **Still pending, all needing real content (after chunk 01 Phase C):**
  - re-run `content:check` and the build
  - run `parity.ts --from scripts/backups/<stamp>`
  - do the Task 6 Step 1 side-by-side against production
  - check the Vercel preview, which needs a push; ask the owner first
  - open the PR
