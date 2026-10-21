# 06 — Projects index redesign: featured case study + filterable grid

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking. Task 1 is a design pass that uses the `frontend-design` skill and needs the owner in the loop; do not skip it.

**Goal:** Replace the uniform card grid with a featured case-study block followed by a grid of the remaining projects, filterable by type through a `?type=` search param. The `/projects/web` and `/projects/native` routes become permanent redirects. The home-page projects section reuses the same primitives.

**Architecture:** `/projects` stays a statically generated server page. It renders `FeaturedProject` (server-safe) and, inside `<Suspense>`, `ProjectsBrowser` (client) which reads `useSearchParams`, filters with pure functions from `src/lib/projects/filter.ts`, and renders `ProjectGrid` → `ProjectCard`. Deep links to `?type=native` first paint all projects and filter on hydration; acceptable for four projects and it keeps the route static. New primitives: `ProjectImage`, `TechChips`, `ProjectLinks`; `Badge` keeps its API and is restyled. Chunk 07 reuses all of them.

**Tech Stack:** next/navigation (`useSearchParams`, `useRouter`, `usePathname`), framer-motion (existing `AnimatedSection`/`itemVariants`), `react-icons/si` (`SiGithub`), `lucide-react` (`ExternalLink`), Vitest + Testing Library.

---

## Prerequisites

- Chunk 05 merged to `main` (hard prerequisite: this chunk edits `next.config.ts` and the component tree and must land on a tree with no Payload).

## Start

```bash
git checkout main && git pull
git checkout -b chunk-06-projects-index
```

## Design decisions

Task 1 confirms or changes these with the owner. Until it does, these **defaults apply**; record the final answers here before Task 3.

| Topic | Default |
|---|---|
| Featured block, desktop (`lg+`) | Two columns: image 3/5 left, text 2/5 right (status badge, type badge, name as link, description, all tech chips grouped, live/code links, "Read the case study" CTA). |
| Featured block, mobile | Stacked: image, then text. Image uses `sizes="100vw"`. |
| Card anatomy | 3:2 image with status badge overlay; name (h3, stretched link); type badge; description clamped to 3 lines; up to 4 tech chips + "+N more"; live/code icon links. Hover: shadow + slight image scale (disabled under reduced motion). |
| Filter control | Three `<button aria-pressed>` pills: All (n), Web (n), Native (n). URL `?type=web|native`, no param for All. `router.replace` with `scroll: false`. |
| Featured vs filter | Featured project is excluded from the grid and does not react to the filter. |
| Grid | `grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6`; entrance via existing `AnimatedSection` + `itemVariants`. |
| Home section | Featured block + grid of the next two projects by order + "See all projects" CTA. Section widened from `max-w-4xl` to `max-w-5xl`. |
| Page heading | `/projects` gets an `<h1>` "Projects" via `SectionHeading as="h1"`. |
| Colour | Tokens only: `primary` (orange) for emphasis and the active filter, `secondary` (teal) for chips/accents, `secondary-bg` for card surfaces. |

## File structure

| Path | Change | Responsibility |
|---|---|---|
| `src/lib/projects/filter.ts` | **Create** | Pure: `parseProjectFilter`, `filterProjects`, `countByType`, `FILTER_LABELS`. |
| `src/__tests__/lib/filter.test.ts` | **Create** | |
| `src/components/content/projects/ProjectImage.tsx` | **Create** | `next/image` with the content image's width/height/blur. Server-safe. |
| `src/components/content/projects/TechChips.tsx` | **Create** | `<ul>` of chips with optional `max` + "+N more". Server-safe. |
| `src/components/content/projects/ProjectLinks.tsx` | **Create** | Live / code links, external attrs, `.focus-ring`, the "I do not own the rights" note. Server-safe. |
| `src/components/content/projects/ProjectCard.tsx` | **Rewrite** | Card; no state. |
| `src/components/content/projects/ProjectGrid.tsx` | **Create** | `<ul>` grid of cards. Server-safe (used as the Suspense fallback too). |
| `src/components/content/projects/FeaturedProject.tsx` | **Create** | Featured block. Server-safe. |
| `src/components/content/projects/ProjectFilter.tsx` | **Create** (client) | Pill buttons. |
| `src/components/content/projects/ProjectsBrowser.tsx` | **Create** (client) | Search-param state + filter + live region + grid. |
| `src/components/content/projects/index.tsx` | **Rewrite** (client) | Home section: `{ featured, others }`. |
| `src/components/content/projects/ProjectsGrid.tsx`, `src/utils/functions/animations.ts` | **Delete** | Old grid + its waterfall helper. |
| `src/components/ui/Badge.tsx`, `src/__tests__/components/ui/Badge.test.tsx` | Modify / rewrite test | Same `status` prop; token colours; test behaviour, not class strings. |
| `src/components/layout/section/SectionHeading.tsx` | Modify | `as?: 'h1' \| 'h2'` prop. |
| `src/components/layout/section/index.tsx` | Modify | Actually apply `className` (it is accepted and ignored today). |
| `src/app/(app)/projects/page.tsx` | **Rewrite** | Featured + browser. |
| `src/app/(app)/projects/layout.tsx` | **Rewrite** (server) | Container only. |
| `src/app/(app)/projects/web/page.tsx`, `native/page.tsx` | **Delete** | |
| `src/app/(app)/page.tsx` | Modify | Pass `featured` + `others`. |
| `src/app/(app)/sitemap.ts` | Modify | Drop `/projects/web`, `/projects/native`. |
| `next.config.ts` | Modify | Two redirects. |
| `src/__tests__/setup.ts` | Modify | Extend the framer-motion mock. |
| `src/__tests__/components/content/projects/*.test.tsx` | **Create** | Card, filter, browser tests. |

---

### Task 1: Design pass (with the owner)

- [ ] **Step 1: Load context**

Read `planning/00-overview-and-preflight.md` (decisions), this doc's Design decisions table, `src/app/(app)/globals.css` (tokens), `src/components/content/projects/ProjectCard.tsx`, `src/components/content/blog/BlogCard.tsx` is gone but its `variant="featured"` idea (image `lg:h-full`, `whileHover={{ y: -4 }}`) is the house precedent for a featured card.

- [ ] **Step 2: Invoke the `frontend-design` skill** and produce two or three layout directions for the featured block and the card, within the defaults above. Present them to the owner (text or the brainstorming visual companion if available) and settle: featured layout at `lg` and mobile, card anatomy, filter pill style, hover/entrance motion, home-section composition.

- [ ] **Step 3: Write the answers into the Design decisions table above** (replace the Default column values). Commit:

```bash
git add planning/06-projects-index-redesign.md
git commit -m "docs(planning): record projects index design decisions"
```

### Task 2: Filter logic (TDD)

**Files:**
- Create: `src/lib/projects/filter.ts`
- Test: `src/__tests__/lib/filter.test.ts`

- [ ] **Step 1: Failing test**

```ts
// src/__tests__/lib/filter.test.ts
import { describe, it, expect } from 'vitest'
import { countByType, filterProjects, parseProjectFilter, FILTER_LABELS } from '@/lib/projects/filter'
import type { Project } from '@/types'

const p = (slug: string, type: Project['type']) => ({ slug, type }) as Project
const all = [p('a', 'web'), p('b', 'native'), p('c', 'web')]

describe('parseProjectFilter', () => {
  it.each([
    ['web', 'web'],
    ['native', 'native'],
    [null, 'all'],
    [undefined, 'all'],
    ['', 'all'],
    ['desktop', 'all'],
    ['WEB', 'all'],
  ])('%s -> %s', (input, expected) => {
    expect(parseProjectFilter(input)).toBe(expected)
  })
})

describe('filterProjects', () => {
  it('returns everything for all', () => expect(filterProjects(all, 'all')).toEqual(all))
  it('filters by type', () => expect(filterProjects(all, 'native').map((x) => x.slug)).toEqual(['b']))
})

describe('countByType', () => {
  it('counts all, web and native', () => expect(countByType(all)).toEqual({ all: 3, web: 2, native: 1 }))
})

describe('FILTER_LABELS', () => {
  it('has a label per filter', () => expect(Object.keys(FILTER_LABELS).sort()).toEqual(['all', 'native', 'web']))
})
```

- [ ] **Step 2: Run, expect failure** — `npx vitest run src/__tests__/lib/filter.test.ts`

- [ ] **Step 3: Implement**

```ts
// src/lib/projects/filter.ts
import { PROJECT_TYPES, type Project, type ProjectType } from '../../types/project'

export type ProjectFilter = ProjectType | 'all'

export const FILTER_LABELS: Record<ProjectFilter, string> = { all: 'All', web: 'Web', native: 'Native' }
export const FILTERS: ProjectFilter[] = ['all', ...PROJECT_TYPES]

export function parseProjectFilter(value: string | null | undefined): ProjectFilter {
  return value && (PROJECT_TYPES as readonly string[]).includes(value) ? (value as ProjectType) : 'all'
}

export function filterProjects(projects: Project[], filter: ProjectFilter): Project[] {
  return filter === 'all' ? projects : projects.filter((p) => p.type === filter)
}

export function countByType(projects: Project[]): Record<ProjectFilter, number> {
  const counts: Record<ProjectFilter, number> = { all: projects.length, web: 0, native: 0 }
  for (const p of projects) counts[p.type] += 1
  return counts
}
```

- [ ] **Step 4: Run, expect pass; commit**

```bash
npx vitest run src/__tests__/lib/filter.test.ts
git add src/lib/projects/filter.ts src/__tests__/lib/filter.test.ts
git commit -m "feat(projects): pure filter helpers"
```

### Task 3: Shared primitives

**Files:**
- Create: `ProjectImage.tsx`, `TechChips.tsx`, `ProjectLinks.tsx` (all in `src/components/content/projects/`)
- Modify: `src/components/ui/Badge.tsx`, `src/components/layout/section/SectionHeading.tsx`, `src/components/layout/section/index.tsx`
- Rewrite: `src/__tests__/components/ui/Badge.test.tsx`
- Modify: `src/__tests__/setup.ts`

- [ ] **Step 1: Extend the framer-motion mock** in `src/__tests__/setup.ts` so new elements and hooks work in tests:

```ts
vi.mock('framer-motion', () => ({
  motion: {
    div: 'div',
    span: 'span',
    a: 'a',
    button: 'button',
    li: 'li',
    ul: 'ul',
    ol: 'ol',
    article: 'article',
    section: 'section',
  },
  AnimatePresence: ({ children }: { children: React.ReactNode }) => children,
  MotionConfig: ({ children }: { children: React.ReactNode }) => children,
  useInView: () => true,
  useReducedMotion: () => false,
}))
```

- [ ] **Step 2: `ProjectImage`**

```tsx
// src/components/content/projects/ProjectImage.tsx
import Image from "next/image";
import type { ProjectImage as ProjectImageData } from "@/types";

interface Props {
  image: ProjectImageData;
  sizes: string;
  priority?: boolean;
  className?: string;
}

export function ProjectImage({ image, sizes, priority = false, className }: Props) {
  return (
    <Image
      src={image.src}
      alt={image.alt}
      width={image.width}
      height={image.height}
      sizes={sizes}
      priority={priority}
      placeholder="blur"
      blurDataURL={image.blurDataURL}
      className={className}
    />
  );
}
```

- [ ] **Step 3: `TechChips`**

```tsx
// src/components/content/projects/TechChips.tsx
import { cn } from "@/lib/utils";

interface Props {
  items: string[];
  max?: number;
  label?: string;
  className?: string;
}

export function TechChips({ items, max, label = "Tech stack", className }: Props) {
  if (items.length === 0) return null;
  const shown = max ? items.slice(0, max) : items;
  const hidden = items.length - shown.length;
  return (
    <ul className={cn("flex flex-wrap gap-2", className)} aria-label={label}>
      {shown.map((item) => (
        <li
          key={item}
          className="rounded-full border border-secondary-300 bg-secondary-bg px-2.5 py-0.5 text-xs font-medium text-foreground dark:border-secondary-700"
        >
          {item}
        </li>
      ))}
      {hidden > 0 && (
        <li className="rounded-full px-2.5 py-0.5 text-xs font-medium text-gray-600 dark:text-gray-300">+{hidden} more</li>
      )}
    </ul>
  );
}
```

- [ ] **Step 4: `ProjectLinks`**

```tsx
// src/components/content/projects/ProjectLinks.tsx
import { ExternalLink } from "lucide-react";
import { SiGithub } from "react-icons/si";
import { cn } from "@/lib/utils";

interface Props {
  liveUrl: string | null;
  githubUrl: string | null;
  size?: "sm" | "md";
  showRightsNote?: boolean;
  className?: string;
}

const base =
  "focus-ring inline-flex items-center gap-2 rounded-md font-medium transition-colors";
const sizes = { sm: "px-3 py-1.5 text-sm", md: "px-4 py-2.5 text-base" };

export function ProjectLinks({ liveUrl, githubUrl, size = "md", showRightsNote = false, className }: Props) {
  if (!liveUrl && !githubUrl && !showRightsNote) return null;
  return (
    <div className={cn("flex flex-wrap items-center gap-3", className)}>
      {liveUrl && (
        <a
          href={liveUrl}
          target="_blank"
          rel="noopener noreferrer"
          className={cn(base, sizes[size], "bg-primary-500 text-primary-foreground hover:bg-primary-600")}
        >
          <ExternalLink aria-hidden className="h-4 w-4" />
          Live site
        </a>
      )}
      {githubUrl && (
        <a
          href={githubUrl}
          target="_blank"
          rel="noopener noreferrer"
          className={cn(base, sizes[size], "border border-secondary-400 text-foreground hover:bg-secondary-bg dark:border-secondary-600")}
        >
          <SiGithub aria-hidden className="h-4 w-4" />
          View code
        </a>
      )}
      {showRightsNote && !githubUrl && (
        <p className="text-sm italic text-gray-500 dark:text-gray-400">I do not own the rights to the code for this project.</p>
      )}
    </div>
  );
}
```

- [ ] **Step 5: `Badge`** — keep the `status` prop; move colours onto tokens (values from the design pass; these are the defaults):

```tsx
// src/components/ui/Badge.tsx
import React from "react";
import { cn } from "@/lib/utils";
import type { ProjectStatus, ProjectType } from "@/types";

type BadgeProps = {
  status?: ProjectStatus | ProjectType | string;
  className?: string;
};

const COLORS: Record<string, string> = {
  "In Progress": "bg-amber-100 text-amber-900 dark:bg-amber-900/40 dark:text-amber-200",
  Prototype: "bg-sky-100 text-sky-900 dark:bg-sky-900/40 dark:text-sky-200",
  Professional: "bg-emerald-100 text-emerald-900 dark:bg-emerald-900/40 dark:text-emerald-200",
  web: "bg-primary-500 text-primary-foreground",
  native: "bg-secondary-700 text-primary-foreground",
};
const DEFAULT = "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100";

export function Badge({ status, className }: BadgeProps) {
  const label = status === undefined || status === null ? "" : String(status);
  return (
    <span className={cn("inline-block rounded-full px-2 py-1 text-xs font-medium", COLORS[label] ?? DEFAULT, className)}>
      {label}
    </span>
  );
}
```

Rewrite `src/__tests__/components/ui/Badge.test.tsx` to assert behaviour: renders the text; renders an empty span for no status; applies `className`; distinct statuses get distinct `className` strings; `web` and `native` differ. Delete every assertion on a specific Tailwind colour class.

- [ ] **Step 6: `SectionHeading` `as` prop and `Section` className**

`SectionHeading.tsx` becomes:

```tsx
// src/components/layout/section/SectionHeading.tsx
"use client";
import React from "react";
import { AnimatedSection, itemVariants } from "./AnimatedSection";
import { motion } from "framer-motion";

interface SectionHeadingProps {
  title: string;
  as?: "h1" | "h2";
}

export function SectionHeading({ title, as = "h2" }: SectionHeadingProps) {
  const Tag = as;
  return (
    <AnimatedSection>
      <motion.div className="relative mb-8 flex gap-4 items-center" variants={itemVariants}>
        <div className="w-8 lg:w-16 h-0.5 lg:h-1 rounded-full bg-primary"></div>
        <Tag className="inline-block text-2xl font-bold py-2 lg:px-4 uppercase tracking-wider">{title}</Tag>
      </motion.div>
    </AnimatedSection>
  );
}
```

`SectionHeading.test.tsx` keeps passing (default is still `h2`); add one case asserting `as="h1"` renders an `h1`.

In `section/index.tsx`:

```tsx
import React from "react";
import { cn } from "@/lib/utils";
import { SectionHeading } from "./SectionHeading";

type Props = {
  id: string;
  title: string;
  children: React.ReactNode;
  className?: string;
  as?: "h1" | "h2";
};

export default function Section({ id, title, children, className, as = "h2" }: Props) {
  return (
    <section id={id} className={cn("w-full max-w-4xl mb-16 pt-16", className)}>
      <SectionHeading title={title} as={as} />
      {children}
    </section>
  );
}
```

- [ ] **Step 7: Verify and commit**

```bash
npx tsc --noEmit
npx vitest run src/__tests__/components/ui/Badge.test.tsx src/__tests__/components/layout/section
git add -A
git commit -m "feat(projects): ProjectImage, TechChips, ProjectLinks primitives; token Badge; Section className"
```

### Task 4: `ProjectCard` and `ProjectGrid` (TDD)

**Files:**
- Rewrite: `src/components/content/projects/ProjectCard.tsx`
- Create: `src/components/content/projects/ProjectGrid.tsx`
- Test: `src/__tests__/components/content/projects/ProjectCard.test.tsx`

- [ ] **Step 1: Failing test**

```tsx
// src/__tests__/components/content/projects/ProjectCard.test.tsx
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ProjectCard } from '@/components/content/projects/ProjectCard'
import type { Project } from '@/types'

const project: Project = {
  slug: 'demo-app',
  name: 'Demo App',
  type: 'web',
  status: 'Prototype',
  featured: false,
  order: 1,
  description: 'A demo project.',
  techStack: { frontend: ['Next.js', 'Tailwind'], backend: ['Node'], other: ['Vercel', 'Stripe', 'Sentry'] },
  liveUrl: 'https://demo.example.com',
  githubUrl: null,
  image: { src: '/projects/demo-app/demo.png', alt: 'Demo screenshot', width: 1200, height: 800, blurDataURL: 'data:image/webp;base64,AA==' },
  overview: 'o',
  challenge: 'c',
  solution: 's',
  keyTakeaways: ['k'],
}

describe('ProjectCard', () => {
  it('links the name to the project page', () => {
    render(<ProjectCard project={project} />)
    expect(screen.getByRole('link', { name: 'Demo App' })).toHaveAttribute('href', '/projects/demo-app')
  })

  it('shows status, type, description and image alt', () => {
    render(<ProjectCard project={project} />)
    expect(screen.getByText('Prototype')).toBeInTheDocument()
    expect(screen.getByText('web')).toBeInTheDocument()
    expect(screen.getByText('A demo project.')).toBeInTheDocument()
    expect(screen.getByAltText('Demo screenshot')).toBeInTheDocument()
  })

  it('caps tech chips at four and counts the rest', () => {
    render(<ProjectCard project={project} />)
    const chips = screen.getByRole('list', { name: 'Tech stack' })
    expect(chips.querySelectorAll('li')).toHaveLength(5) // 4 chips + "+2 more"
    expect(screen.getByText('+2 more')).toBeInTheDocument()
  })

  it('renders the live link with external attributes and no code link', () => {
    render(<ProjectCard project={project} />)
    const live = screen.getByRole('link', { name: /live site/i })
    expect(live).toHaveAttribute('target', '_blank')
    expect(live).toHaveAttribute('rel', 'noopener noreferrer')
    expect(screen.queryByRole('link', { name: /view code/i })).toBeNull()
  })
})
```

- [ ] **Step 2: Run, expect failure** — `npx vitest run src/__tests__/components/content/projects/ProjectCard.test.tsx`

- [ ] **Step 3: Implement**

```tsx
// src/components/content/projects/ProjectCard.tsx
import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import type { Project } from "@/types";
import { ProjectImage } from "./ProjectImage";
import { ProjectLinks } from "./ProjectLinks";
import { TechChips } from "./TechChips";

interface Props {
  project: Project;
  priority?: boolean;
}

export function ProjectCard({ project, priority = false }: Props) {
  const stack = [...project.techStack.frontend, ...project.techStack.backend, ...project.techStack.other];
  return (
    <article className="group relative flex h-full flex-col overflow-hidden rounded-lg bg-secondary-bg shadow-md transition-shadow duration-300 hover:shadow-lg focus-within:ring-2 focus-within:ring-primary focus-within:ring-offset-2">
      <div className="relative aspect-[3/2] overflow-hidden">
        <ProjectImage
          image={project.image}
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          priority={priority}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
        />
        <div className="absolute right-2 top-2">
          <Badge status={project.status} />
        </div>
      </div>
      <div className="flex flex-1 flex-col gap-3 p-4">
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-xl font-semibold">
            <Link href={`/projects/${project.slug}`} className="focus:outline-none after:absolute after:inset-0 after:content-['']">
              {project.name}
            </Link>
          </h3>
          <Badge status={project.type} />
        </div>
        <p className="line-clamp-3 text-gray-600 dark:text-gray-200">{project.description}</p>
        <TechChips items={stack} max={4} className="mt-auto" />
        <ProjectLinks liveUrl={project.liveUrl} githubUrl={project.githubUrl} size="sm" className="relative z-10" />
      </div>
    </article>
  );
}
```

The stretched `after:` pseudo-element on the name link makes the whole card clickable while keeping one focusable element; `ProjectLinks` sits above it with `relative z-10`. Focus is shown by `focus-within:ring` on the card.

```tsx
// src/components/content/projects/ProjectGrid.tsx
import type { Project } from "@/types";
import { ProjectCard } from "./ProjectCard";

interface Props {
  projects: Project[];
  priorityCount?: number;
}

export function ProjectGrid({ projects, priorityCount = 0 }: Props) {
  if (projects.length === 0) {
    return <p className="py-12 text-center text-gray-600 dark:text-gray-300">No projects match this filter.</p>;
  }
  return (
    <ul className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
      {projects.map((project, i) => (
        <li key={project.slug}>
          <ProjectCard project={project} priority={i < priorityCount} />
        </li>
      ))}
    </ul>
  );
}
```

- [ ] **Step 4: Run, expect pass; delete the old grid; commit**

```bash
npx vitest run src/__tests__/components/content/projects/ProjectCard.test.tsx
git rm src/components/content/projects/ProjectsGrid.tsx src/utils/functions/animations.ts
git add -A
git commit -m "feat(projects): new ProjectCard and ProjectGrid; drop waterfall grid"
```

(`npx tsc --noEmit` will complain about the pages still importing `ProjectsGrid`; Task 6 fixes them.)

### Task 5: `FeaturedProject`, `ProjectFilter`, `ProjectsBrowser` (TDD for the client pieces)

**Files:**
- Create: `FeaturedProject.tsx`, `ProjectFilter.tsx`, `ProjectsBrowser.tsx` in `src/components/content/projects/`
- Test: `src/__tests__/components/content/projects/ProjectsBrowser.test.tsx`

- [ ] **Step 1: `FeaturedProject`** (layout per Design decisions; this is the default)

```tsx
// src/components/content/projects/FeaturedProject.tsx
import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import type { Project } from "@/types";
import { ProjectImage } from "./ProjectImage";
import { ProjectLinks } from "./ProjectLinks";
import { TechChips } from "./TechChips";

interface Props {
  project: Project;
  headingLevel?: "h2" | "h3";
}

export function FeaturedProject({ project, headingLevel = "h2" }: Props) {
  const Heading = headingLevel;
  const groups = [
    ["Frontend", project.techStack.frontend],
    ["Backend", project.techStack.backend],
    ["Other", project.techStack.other],
  ] as const;
  return (
    <article className="mb-16 grid grid-cols-1 gap-8 overflow-hidden rounded-xl bg-secondary-bg shadow-md lg:grid-cols-5">
      <div className="lg:col-span-3">
        <ProjectImage image={project.image} sizes="(max-width: 1024px) 100vw, 60vw" priority className="h-full w-full object-cover" />
      </div>
      <div className="flex flex-col gap-4 p-6 lg:col-span-2 lg:py-8 lg:pr-8">
        <div className="flex flex-wrap items-center gap-2">
          <Badge status={project.status} />
          <Badge status={project.type} />
          <span className="ml-auto text-xs font-semibold uppercase tracking-wider text-primary-500">Featured</span>
        </div>
        <Heading className="text-2xl font-bold lg:text-3xl">
          <Link href={`/projects/${project.slug}`} className="focus-ring rounded-sm">
            {project.name}
          </Link>
        </Heading>
        <p className="text-gray-600 dark:text-gray-200 lg:text-lg">{project.description}</p>
        <div className="space-y-2">
          {groups
            .filter(([, items]) => items.length > 0)
            .map(([label, items]) => (
              <TechChips key={label} items={items} label={`${label} stack`} />
            ))}
        </div>
        <ProjectLinks liveUrl={project.liveUrl} githubUrl={project.githubUrl} className="mt-auto" />
        <Link href={`/projects/${project.slug}`} className="focus-ring inline-flex items-center gap-1 text-sm font-semibold text-primary-500 hover:underline">
          Read the case study →
        </Link>
      </div>
    </article>
  );
}
```

- [ ] **Step 2: Failing browser test**

```tsx
// src/__tests__/components/content/projects/ProjectsBrowser.test.tsx
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import type { Project } from '@/types'

const replace = vi.fn()
let search = new URLSearchParams()
vi.mock('next/navigation', () => ({
  useRouter: () => ({ replace, push: vi.fn(), prefetch: vi.fn(), back: vi.fn(), forward: vi.fn(), refresh: vi.fn() }),
  usePathname: () => '/projects',
  useSearchParams: () => search,
  useParams: () => ({}),
}))

import { ProjectsBrowser } from '@/components/content/projects/ProjectsBrowser'

const make = (slug: string, type: Project['type']): Project => ({
  slug, name: slug, type, status: 'Prototype', featured: false, order: 1, description: 'd',
  techStack: { frontend: [], backend: [], other: [] }, liveUrl: null, githubUrl: null,
  image: { src: `/projects/${slug}/x.png`, alt: slug, width: 10, height: 10, blurDataURL: 'data:image/webp;base64,AA==' },
  overview: 'o', challenge: 'c', solution: 's', keyTakeaways: ['k'],
})
const projects = [make('alpha', 'web'), make('beta', 'native'), make('gamma', 'web')]

describe('ProjectsBrowser', () => {
  beforeEach(() => {
    replace.mockClear()
    search = new URLSearchParams()
  })

  it('shows all projects and marks All as pressed by default', () => {
    render(<ProjectsBrowser projects={projects} />)
    expect(screen.getAllByRole('article')).toHaveLength(3)
    expect(screen.getByRole('button', { name: /all/i })).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByRole('button', { name: /native/i })).toHaveAttribute('aria-pressed', 'false')
  })

  it('reads the filter from the URL', () => {
    search = new URLSearchParams('type=native')
    render(<ProjectsBrowser projects={projects} />)
    expect(screen.getAllByRole('article')).toHaveLength(1)
    expect(screen.getByRole('button', { name: /native/i })).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByRole('status')).toHaveTextContent('1 project')
  })

  it('writes the filter to the URL without scrolling', () => {
    render(<ProjectsBrowser projects={projects} />)
    fireEvent.click(screen.getByRole('button', { name: /web/i }))
    expect(replace).toHaveBeenCalledWith('/projects?type=web', { scroll: false })
    fireEvent.click(screen.getByRole('button', { name: /all/i }))
    expect(replace).toHaveBeenLastCalledWith('/projects', { scroll: false })
  })

  it('ignores unknown values', () => {
    search = new URLSearchParams('type=desktop')
    render(<ProjectsBrowser projects={projects} />)
    expect(screen.getAllByRole('article')).toHaveLength(3)
  })
})
```

- [ ] **Step 3: Run, expect failure** — `npx vitest run src/__tests__/components/content/projects/ProjectsBrowser.test.tsx`

- [ ] **Step 4: Implement `ProjectFilter` and `ProjectsBrowser`**

```tsx
// src/components/content/projects/ProjectFilter.tsx
"use client";

import { cn } from "@/lib/utils";
import { FILTERS, FILTER_LABELS, type ProjectFilter as Filter } from "@/lib/projects/filter";

interface Props {
  value: Filter;
  counts: Record<Filter, number>;
  onChange: (next: Filter) => void;
}

export function ProjectFilter({ value, counts, onChange }: Props) {
  return (
    <div role="group" aria-label="Filter projects by type" className="mb-8 flex flex-wrap gap-2">
      {FILTERS.map((filter) => {
        const active = filter === value;
        return (
          <button
            key={filter}
            type="button"
            aria-pressed={active}
            onClick={() => onChange(filter)}
            className={cn(
              "focus-ring rounded-full border px-4 py-1.5 text-sm font-medium transition-colors",
              active
                ? "border-primary-500 bg-primary-500 text-primary-foreground"
                : "border-secondary-400 text-foreground hover:bg-secondary-bg dark:border-secondary-600",
            )}
          >
            {FILTER_LABELS[filter]} <span className="opacity-70">({counts[filter]})</span>
          </button>
        );
      })}
    </div>
  );
}
```

```tsx
// src/components/content/projects/ProjectsBrowser.tsx
"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type { Project } from "@/types";
import { countByType, filterProjects, parseProjectFilter, type ProjectFilter as Filter } from "@/lib/projects/filter";
import { ProjectFilter } from "./ProjectFilter";
import { ProjectGrid } from "./ProjectGrid";

interface Props {
  projects: Project[];
}

export function ProjectsBrowser({ projects }: Props) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const active = parseProjectFilter(searchParams.get("type"));
  const visible = filterProjects(projects, active);
  const counts = countByType(projects);

  const setFilter = (next: Filter) => {
    const params = new URLSearchParams(searchParams.toString());
    if (next === "all") params.delete("type");
    else params.set("type", next);
    const query = params.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
  };

  return (
    <div>
      <ProjectFilter value={active} counts={counts} onChange={setFilter} />
      <p role="status" aria-live="polite" className="sr-only">
        {visible.length} {visible.length === 1 ? "project" : "projects"} shown
      </p>
      <ProjectGrid projects={visible} />
    </div>
  );
}
```

- [ ] **Step 5: Run, expect pass; commit**

```bash
npx vitest run src/__tests__/components/content/projects
git add -A
git commit -m "feat(projects): FeaturedProject, ProjectFilter and search-param ProjectsBrowser"
```

### Task 6: Routes, home section, redirects, sitemap

**Files:**
- Rewrite: `src/app/(app)/projects/page.tsx`, `src/app/(app)/projects/layout.tsx`, `src/components/content/projects/index.tsx`
- Delete: `src/app/(app)/projects/web/page.tsx`, `src/app/(app)/projects/native/page.tsx`
- Modify: `src/app/(app)/page.tsx`, `src/app/(app)/sitemap.ts`, `next.config.ts`

- [ ] **Step 1: `/projects` page**

```tsx
// src/app/(app)/projects/page.tsx
import { Suspense } from "react";
import type { Metadata } from "next";
import { SectionHeading } from "@/components/layout/section/SectionHeading";
import { FeaturedProject } from "@/components/content/projects/FeaturedProject";
import { ProjectGrid } from "@/components/content/projects/ProjectGrid";
import { ProjectsBrowser } from "@/components/content/projects/ProjectsBrowser";
import { getFeaturedProject, getProjects } from "@/lib/projects";

export const metadata: Metadata = {
  title: "Projects | Ben Wozak",
  description: "Web and native projects by Ben Wozak: case studies with the problem, the solution and what I learned.",
};

export default function ProjectsPage() {
  const featured = getFeaturedProject();
  const rest = getProjects().filter((p) => p.slug !== featured?.slug);

  return (
    <>
      <SectionHeading title="Projects" as="h1" />
      {featured && <FeaturedProject project={featured} />}
      <section aria-labelledby="more-projects">
        <h2 id="more-projects" className="sr-only">
          More projects
        </h2>
        <Suspense fallback={<ProjectGrid projects={rest} />}>
          <ProjectsBrowser projects={rest} />
        </Suspense>
      </section>
    </>
  );
}
```

- [ ] **Step 2: Layout becomes a server container**

```tsx
// src/app/(app)/projects/layout.tsx
export default function ProjectsLayout({ children }: { children: React.ReactNode }) {
  return <article className="container mx-auto my-16 max-w-6xl px-4 pt-16 lg:py-8">{children}</article>;
}
```

- [ ] **Step 3: Delete the type routes**

```bash
git rm "src/app/(app)/projects/web/page.tsx" "src/app/(app)/projects/native/page.tsx"
```

- [ ] **Step 4: Home section**

```tsx
// src/components/content/projects/index.tsx
"use client";

import { motion } from "framer-motion";
import Section from "../../layout/section";
import { CTAButton } from "../../ui";
import { AnimatedSection, itemVariants } from "../../layout/section/AnimatedSection";
import type { Project } from "@/types";
import { FeaturedProject } from "./FeaturedProject";
import { ProjectGrid } from "./ProjectGrid";

interface ProjectsProps {
  featured: Project;
  others: Project[];
}

export function Projects({ featured, others }: ProjectsProps) {
  return (
    <Section id="projects" title="Recent Work" className="max-w-5xl px-4 md:px-0">
      <AnimatedSection>
        <motion.div variants={itemVariants}>
          <FeaturedProject project={featured} headingLevel="h3" />
        </motion.div>
        <motion.div variants={itemVariants}>
          <ProjectGrid projects={others} />
        </motion.div>
        <motion.div className="mt-8 flex justify-center lg:mt-12" variants={itemVariants}>
          <CTAButton type="secondary" href="/projects" className="w-72">
            See all projects
          </CTAButton>
        </motion.div>
      </AnimatedSection>
    </Section>
  );
}
```

And in `src/app/(app)/page.tsx`:

```tsx
import { getFeaturedProject, getProjects } from "@/lib/projects";
// …
export default function Home() {
  const featured = getFeaturedProject()!;
  const others = getProjects().filter((p) => p.slug !== featured.slug).slice(0, 2);
  return (
    <article className="flex min-h-screen flex-col items-center justify-center">
      <Hero />
      <About />
      <Projects featured={featured} others={others} />
      <Experience />
      <ContactCTA />
    </article>
  );
}
```

(`ProjectGrid` is three columns at `lg`; with two "others" the design pass may prefer `md:grid-cols-2` only on the home page. If so, add a `columns?: 2 | 3` prop to `ProjectGrid`.)

- [ ] **Step 5: Redirects and sitemap**

In `next.config.ts` `redirects()`, add after the existing entries:

```ts
      { source: '/projects/web', destination: '/projects?type=web', permanent: true },
      { source: '/projects/native', destination: '/projects?type=native', permanent: true },
```

In `src/app/(app)/sitemap.ts` remove `'/projects/web'` and `'/projects/native'` from `staticRoutes`.

- [ ] **Step 6: Verify**

```bash
npx tsc --noEmit
npm run lint
npm run build          # /projects is ○ Static; no /projects/web or /projects/native
npm run dev &
curl -sI "http://localhost:3000/projects/web" | grep -i "location"     # /projects?type=web
```

In the browser: `/projects` shows the featured block then the grid; clicking Native updates the URL to `?type=native` without scrolling; reload keeps the filter; Tab reaches every pill, card and link with a visible ring; the home page shows featured + two cards + CTA.

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "feat(projects): featured + filterable index, home section, redirects"
```

### Task 7: Motion and reduced-motion check

- [ ] **Step 1:** In DevTools → Rendering → "Emulate CSS media feature prefers-reduced-motion: reduce", reload `/projects`. Expected: content appears without translate/scale; hover scale on cards is off (`motion-reduce:` classes); filter still works.
- [ ] **Step 2:** If the design pass added any `whileHover` or stagger beyond `itemVariants`, wrap it with `useReducedMotion()` from framer-motion and re-check.

---

## Verification checklist

- [ ] `npx tsc --noEmit`, `npm run lint`, `npm run build` clean
- [ ] `npm run test:run` + failing-set check from `00`: no new failures; baseline regenerated and committed
- [ ] `grep -rn "ProjectsGrid\|functions/animations\|projects/web\|projects/native" src` → only the two redirects in `next.config.ts`
- [ ] Lighthouse (mobile) on `/projects`: Accessibility ≥ 95, no CLS from images (explicit width/height)
- [ ] Vercel preview: `/projects`, `/projects?type=native`, `/projects/web` (redirect), `/` all correct

## Done when

PR `chunk-06-projects-index` → `main` open, green, merged, production verified. Design decisions table filled in.

## Out of scope / deferred

- Detail page: chunk 07 (it reuses `ProjectImage`, `TechChips`, `ProjectLinks`, `Badge`).
- `BackButton` removal: chunk 07.

## Hand-off log

_(append dated notes here)_
