# 07 — Projects detail redesign: long-scroll case study

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking. Task 1 is a design pass that uses the `frontend-design` skill and needs the owner in the loop; do not skip it.

**Goal:** Rewrite `/projects/[slug]` as a long-scroll case study: hero image and title, a meta strip (status, type, stack chips, links), Overview / Challenge / Solution sections rendered from Markdown, Key Takeaways as a callout list, any extra sections, and previous/next project navigation. Markdown rendering lands here, so content strings may start using inline Markdown after this chunk.

**Architecture:** The page stays a server component. `Markdown` (server, `react-markdown` + `remark-gfm`, no raw HTML) renders the text fields. Thin client `Reveal` wrappers accept `children` so server-rendered Markdown passes through framer-motion entrance animations. Each block gets its own `AnimatedSection` so a long page never waits on a single in-view threshold. The hero image is not animated (LCP).

**Tech Stack:** `react-markdown@^10`, `remark-gfm@^4`, `@tailwindcss/typography` (already installed), framer-motion, Vitest + Testing Library.

---

## Prerequisites

- Chunk 06 merged to `main` (primitives `ProjectImage`, `TechChips`, `ProjectLinks`, token `Badge`, extended framer-motion mock).

## Start

```bash
git checkout main && git pull
git checkout -b chunk-07-projects-detail
```

## Design decisions

Task 1 confirms or changes these with the owner. Until it does, these **defaults apply**; record the final answers here before Task 3.

| Topic | Default |
|---|---|
| Hero | Constrained to `max-w-5xl` (not full-bleed): badges row, `<h1>` name (`text-3xl lg:text-5xl font-bold`), description as a lede (`text-lg lg:text-xl text-gray-600 dark:text-gray-300`), then the image at full container width with `rounded-xl`, `priority`, `sizes="(max-width: 1024px) 100vw, 1024px"`. |
| Meta strip | Below the hero, `max-w-5xl`, a bordered band (`border-y border-secondary-300/60 dark:border-secondary-700/60 py-6`), responsive grid: Status · Type · Stack (chips grouped Frontend / Backend / Other with small uppercase labels) · Links. Rendered as a `<dl>`. |
| Body | `max-w-3xl mx-auto space-y-16`. Each section: eyebrow-less `<h2>` using the `SectionHeading` bar style (`w-8 h-0.5 bg-primary` + uppercase tracking) and `prose` body. |
| Key Takeaways | `<aside>` callout: `rounded-xl bg-secondary-bg p-6 lg:p-8`, heading "Key Takeaways", `<ul>` with teal markers; items rendered with inline Markdown. |
| Extra sections | Same treatment as the body sections, in order, after takeaways. |
| Pagination | `<nav aria-label="More projects">` at the bottom, two cards side by side on `md+` (Previous / Next with name and type), single column on mobile; missing side renders an empty cell. "All projects" link centred below. |
| Motion | Hero static. Each body block wrapped in `AnimatedSection` with children in `Reveal`. Nothing on hover except link underline. |
| Typography | `prose prose-neutral dark:prose-invert` with CSS variables mapped to tokens (links primary, bullets secondary). |
| BackButton | Removed; pagination plus the header nav replace it. |

## File structure

| Path | Change | Responsibility |
|---|---|---|
| `src/components/content/markdown/Markdown.tsx` | **Create** (server) | `react-markdown` wrapper; block and `inline` variants; link handling. |
| `src/__tests__/components/content/markdown/Markdown.test.tsx` | **Create** | |
| `src/components/content/projects/case-study/Reveal.tsx` | **Create** (client) | `motion.div` with `itemVariants`, accepts `children`. |
| `src/components/content/projects/case-study/CaseStudyHero.tsx` | **Create** | Badges, h1, lede, image. |
| `src/components/content/projects/case-study/MetaStrip.tsx` | **Create** | `<dl>` of status/type/stack/links. |
| `src/components/content/projects/case-study/CaseStudySection.tsx` | **Create** | `<section aria-labelledby>` + styled h2 + children. |
| `src/components/content/projects/case-study/KeyTakeaways.tsx` | **Create** | Callout list with inline Markdown. |
| `src/components/content/projects/case-study/ProjectPagination.tsx` | **Create** | Prev/next nav. |
| `src/__tests__/components/content/projects/case-study/*.test.tsx` | **Create** | MetaStrip, KeyTakeaways, ProjectPagination. |
| `src/app/(app)/projects/[slug]/page.tsx` | **Rewrite** | Composes the above. |
| `src/app/(app)/globals.css` | Modify | `prose` token overrides. |
| `src/components/ui/BackButton.tsx`, `src/__tests__/components/ui/BackButton.test.tsx` | **Delete** | Only the detail page used it. |
| `package.json` | Modify | add `react-markdown`, `remark-gfm` |

---

### Task 1: Design pass (with the owner)

- [ ] **Step 1: Load context:** `planning/00-overview-and-preflight.md`, the filled-in Design decisions table in `planning/06-projects-index-redesign.md` (so the two pages match), this doc's table, `src/app/(app)/globals.css`, the interim `src/app/(app)/projects/[slug]/page.tsx`, and one real `content/projects/<slug>.json` to see the actual text lengths.
- [ ] **Step 2: Invoke the `frontend-design` skill**, propose two or three treatments for hero + meta strip and for the takeaways callout within the defaults, settle them with the owner.
- [ ] **Step 3: Write the answers into the Design decisions table** and commit:

```bash
git add planning/07-projects-detail-redesign.md
git commit -m "docs(planning): record project detail design decisions"
```

### Task 2: Markdown renderer (TDD)

**Files:**
- Create: `src/components/content/markdown/Markdown.tsx`
- Test: `src/__tests__/components/content/markdown/Markdown.test.tsx`

- [ ] **Step 1: Install**

```bash
npm install react-markdown@^10 remark-gfm@^4
```

- [ ] **Step 2: Failing test**

```tsx
// src/__tests__/components/content/markdown/Markdown.test.tsx
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Markdown } from '@/components/content/markdown/Markdown'

describe('Markdown', () => {
  it('renders paragraphs, emphasis and GFM strikethrough', () => {
    const { container } = render(<Markdown>{'Hello **world** and ~~gone~~.\n\nSecond.'}</Markdown>)
    expect(container.querySelectorAll('p')).toHaveLength(2)
    expect(container.querySelector('strong')?.textContent).toBe('world')
    expect(container.querySelector('del')?.textContent).toBe('gone')
  })

  it('opens external links in a new tab with rel, and keeps internal links plain', () => {
    render(<Markdown>{'[ext](https://example.com) and [int](/projects/demo)'}</Markdown>)
    const ext = screen.getByRole('link', { name: 'ext' })
    expect(ext).toHaveAttribute('target', '_blank')
    expect(ext).toHaveAttribute('rel', 'noopener noreferrer')
    const int = screen.getByRole('link', { name: 'int' })
    expect(int).toHaveAttribute('href', '/projects/demo')
    expect(int).not.toHaveAttribute('target')
  })

  it('does not render raw HTML', () => {
    const { container } = render(<Markdown>{'<script>alert(1)</script> text'}</Markdown>)
    expect(container.querySelector('script')).toBeNull()
  })

  it('inline variant renders no wrapping paragraph', () => {
    const { container } = render(<Markdown inline>{'Use **bold** here'}</Markdown>)
    expect(container.querySelector('p')).toBeNull()
    expect(container.querySelector('strong')?.textContent).toBe('bold')
  })

  it('wraps block output in prose', () => {
    const { container } = render(<Markdown>{'x'}</Markdown>)
    expect(container.firstElementChild?.className).toMatch(/\bprose\b/)
  })
})
```

- [ ] **Step 3: Run, expect failure** — `npx vitest run src/__tests__/components/content/markdown`

- [ ] **Step 4: Implement**

```tsx
// src/components/content/markdown/Markdown.tsx
// Server component. Renders first-party Markdown from content/projects. No raw
// HTML (react-markdown escapes it unless rehype-raw is added; it is not).
import Link from "next/link";
import ReactMarkdown, { type Components } from "react-markdown";
import remarkGfm from "remark-gfm";
import { cn } from "@/lib/utils";

const components: Components = {
  a: ({ href = "", children }) => {
    if (/^https?:\/\//.test(href)) {
      return (
        <a href={href} target="_blank" rel="noopener noreferrer" className="focus-ring rounded-sm">
          {children}
        </a>
      );
    }
    return (
      <Link href={href} className="focus-ring rounded-sm">
        {children}
      </Link>
    );
  },
};

interface Props {
  children: string;
  /** Render without block wrappers (no <p>); for list items and short labels. */
  inline?: boolean;
  className?: string;
}

export function Markdown({ children, inline = false, className }: Props) {
  if (inline) {
    return (
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={components} disallowedElements={["p"]} unwrapDisallowed>
        {children}
      </ReactMarkdown>
    );
  }
  return (
    <div className={cn("prose prose-neutral max-w-none dark:prose-invert", className)}>
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
        {children}
      </ReactMarkdown>
    </div>
  );
}
```

- [ ] **Step 5: `prose` token overrides** — append to `src/app/(app)/globals.css` inside `@layer components` (or at the end of the file if that layer block is far away):

```css
/* Typography plugin → design tokens */
.prose {
  --tw-prose-links: hsl(var(--primary));
  --tw-prose-invert-links: hsl(var(--primary));
  --tw-prose-bullets: hsl(var(--secondary-500));
  --tw-prose-invert-bullets: hsl(var(--secondary-500));
  --tw-prose-counters: hsl(var(--secondary-700));
  --tw-prose-invert-counters: hsl(var(--secondary-500));
  --tw-prose-quote-borders: hsl(var(--primary));
  --tw-prose-invert-quote-borders: hsl(var(--primary));
}
.prose a {
  text-decoration-thickness: 1px;
  text-underline-offset: 3px;
}
```

(Confirm the exact token names `--primary`, `--secondary-500`, `--secondary-700` exist in `:root` of `globals.css`; they do as of chunk 00.)

- [ ] **Step 6: Run, expect pass; commit**

```bash
npx vitest run src/__tests__/components/content/markdown
git add -A
git commit -m "feat(content): Markdown renderer (react-markdown + remark-gfm) with token prose"
```

### Task 3: Case-study components (TDD where behaviour exists)

**Files:**
- Create: `src/components/content/projects/case-study/{Reveal,CaseStudyHero,MetaStrip,CaseStudySection,KeyTakeaways,ProjectPagination}.tsx`
- Test: `src/__tests__/components/content/projects/case-study/{MetaStrip,KeyTakeaways,ProjectPagination}.test.tsx`

- [ ] **Step 1: Failing tests**

```tsx
// src/__tests__/components/content/projects/case-study/ProjectPagination.test.tsx
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ProjectPagination } from '@/components/content/projects/case-study/ProjectPagination'
import type { Project } from '@/types'

const p = (slug: string, name: string) => ({ slug, name, type: 'web' }) as Project

describe('ProjectPagination', () => {
  it('links prev and next', () => {
    render(<ProjectPagination prev={p('a', 'Alpha')} next={p('b', 'Beta')} />)
    const nav = screen.getByRole('navigation', { name: /more projects/i })
    expect(nav).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /previous.*alpha/i })).toHaveAttribute('href', '/projects/a')
    expect(screen.getByRole('link', { name: /next.*beta/i })).toHaveAttribute('href', '/projects/b')
    expect(screen.getByRole('link', { name: /all projects/i })).toHaveAttribute('href', '/projects')
  })

  it('omits a missing side', () => {
    render(<ProjectPagination prev={null} next={p('b', 'Beta')} />)
    expect(screen.queryByRole('link', { name: /previous/i })).toBeNull()
    expect(screen.getByRole('link', { name: /next.*beta/i })).toBeInTheDocument()
  })
})
```

```tsx
// src/__tests__/components/content/projects/case-study/KeyTakeaways.test.tsx
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { KeyTakeaways } from '@/components/content/projects/case-study/KeyTakeaways'

describe('KeyTakeaways', () => {
  it('renders one list item per takeaway with inline markdown', () => {
    render(<KeyTakeaways items={['Ship **early**', 'Measure']} />)
    expect(screen.getByRole('complementary', { name: /key takeaways/i })).toBeInTheDocument()
    expect(screen.getAllByRole('listitem')).toHaveLength(2)
    expect(screen.getByText('early').tagName).toBe('STRONG')
  })
})
```

```tsx
// src/__tests__/components/content/projects/case-study/MetaStrip.test.tsx
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MetaStrip } from '@/components/content/projects/case-study/MetaStrip'
import type { Project } from '@/types'

const project = {
  slug: 'x', name: 'X', type: 'native', status: 'Professional', featured: false, order: 1, description: 'd',
  techStack: { frontend: ['React Native'], backend: [], other: ['Expo'] }, liveUrl: null, githubUrl: null,
  image: { src: '/projects/x/x.png', alt: 'x', width: 1, height: 1, blurDataURL: 'data:image/webp;base64,AA==' },
  overview: 'o', challenge: 'c', solution: 's', keyTakeaways: ['k'],
} as Project

describe('MetaStrip', () => {
  it('shows status, type and only non-empty stack groups', () => {
    render(<MetaStrip project={project} />)
    expect(screen.getByText('Professional')).toBeInTheDocument()
    expect(screen.getByText('native')).toBeInTheDocument()
    expect(screen.getByRole('list', { name: /frontend/i })).toBeInTheDocument()
    expect(screen.queryByRole('list', { name: /backend/i })).toBeNull()
    expect(screen.getByRole('list', { name: /other/i })).toBeInTheDocument()
  })

  it('shows the rights note when there is no code link', () => {
    render(<MetaStrip project={project} />)
    expect(screen.getByText(/do not own the rights/i)).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Run, expect failure** — `npx vitest run src/__tests__/components/content/projects/case-study`

- [ ] **Step 3: Implement**

```tsx
// src/components/content/projects/case-study/Reveal.tsx
"use client";

import { motion } from "framer-motion";
import { itemVariants } from "@/components/layout/section/AnimatedSection";

export function Reveal({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <motion.div variants={itemVariants} className={className}>
      {children}
    </motion.div>
  );
}
```

```tsx
// src/components/content/projects/case-study/CaseStudyHero.tsx
import { Badge } from "@/components/ui/Badge";
import type { Project } from "@/types";
import { ProjectImage } from "../ProjectImage";

export function CaseStudyHero({ project }: { project: Project }) {
  return (
    <header className="mx-auto mb-10 max-w-5xl">
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <Badge status={project.status} />
        <Badge status={project.type} />
      </div>
      <h1 className="text-3xl font-bold tracking-tight lg:text-5xl">{project.name}</h1>
      <p className="mt-4 max-w-3xl text-lg text-gray-600 dark:text-gray-300 lg:text-xl">{project.description}</p>
      <ProjectImage
        image={project.image}
        sizes="(max-width: 1024px) 100vw, 1024px"
        priority
        className="mt-8 w-full rounded-xl shadow-md"
      />
    </header>
  );
}
```

```tsx
// src/components/content/projects/case-study/MetaStrip.tsx
import type { Project } from "@/types";
import { Badge } from "@/components/ui/Badge";
import { ProjectLinks } from "../ProjectLinks";
import { TechChips } from "../TechChips";

const LABEL = "text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400";

export function MetaStrip({ project }: { project: Project }) {
  const groups = [
    ["Frontend", project.techStack.frontend],
    ["Backend", project.techStack.backend],
    ["Other", project.techStack.other],
  ] as const;
  return (
    <dl className="mx-auto mb-16 grid max-w-5xl grid-cols-2 gap-6 border-y border-secondary-300/60 py-6 dark:border-secondary-700/60 lg:grid-cols-4">
      <div>
        <dt className={LABEL}>Status</dt>
        <dd className="mt-2"><Badge status={project.status} /></dd>
      </div>
      <div>
        <dt className={LABEL}>Type</dt>
        <dd className="mt-2"><Badge status={project.type} /></dd>
      </div>
      <div className="col-span-2 lg:col-span-1">
        <dt className={LABEL}>Stack</dt>
        <dd className="mt-2 space-y-2">
          {groups
            .filter(([, items]) => items.length > 0)
            .map(([label, items]) => (
              <TechChips key={label} items={items} label={label} />
            ))}
        </dd>
      </div>
      <div className="col-span-2 lg:col-span-1">
        <dt className={LABEL}>Links</dt>
        <dd className="mt-2">
          <ProjectLinks liveUrl={project.liveUrl} githubUrl={project.githubUrl} size="sm" showRightsNote />
        </dd>
      </div>
    </dl>
  );
}
```

```tsx
// src/components/content/projects/case-study/CaseStudySection.tsx
interface Props {
  id: string;
  heading: string;
  children: React.ReactNode;
}

export function CaseStudySection({ id, heading, children }: Props) {
  return (
    <section aria-labelledby={id}>
      <div className="mb-6 flex items-center gap-4">
        <span aria-hidden className="h-0.5 w-8 rounded-full bg-primary lg:h-1 lg:w-12" />
        <h2 id={id} className="text-2xl font-bold uppercase tracking-wider">
          {heading}
        </h2>
      </div>
      {children}
    </section>
  );
}
```

```tsx
// src/components/content/projects/case-study/KeyTakeaways.tsx
import { Markdown } from "@/components/content/markdown/Markdown";

export function KeyTakeaways({ items }: { items: string[] }) {
  return (
    <aside aria-labelledby="key-takeaways" className="rounded-xl bg-secondary-bg p-6 lg:p-8">
      <h2 id="key-takeaways" className="mb-4 text-xl font-bold uppercase tracking-wider">
        Key Takeaways
      </h2>
      <ul className="space-y-3">
        {items.map((item) => (
          <li key={item} className="flex gap-3 text-gray-700 dark:text-gray-200">
            <span aria-hidden className="mt-2 h-2 w-2 flex-none rounded-full bg-secondary-500" />
            <span>
              <Markdown inline>{item}</Markdown>
            </span>
          </li>
        ))}
      </ul>
    </aside>
  );
}
```

```tsx
// src/components/content/projects/case-study/ProjectPagination.tsx
import Link from "next/link";
import type { Project } from "@/types";

interface Props {
  prev: Project | null;
  next: Project | null;
}

function Cell({ project, direction }: { project: Project; direction: "Previous" | "Next" }) {
  const align = direction === "Next" ? "text-right items-end" : "";
  return (
    <Link
      href={`/projects/${project.slug}`}
      className={`focus-ring flex flex-col gap-1 rounded-lg bg-secondary-bg p-5 transition-colors hover:bg-secondary-200/60 dark:hover:bg-secondary-800/60 ${align}`}
    >
      <span className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">{direction} project</span>
      <span className="text-lg font-semibold">{project.name}</span>
      <span className="sr-only">, {project.type}</span>
    </Link>
  );
}

export function ProjectPagination({ prev, next }: Props) {
  return (
    <nav aria-label="More projects" className="mx-auto mt-20 max-w-5xl">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div>{prev && <Cell project={prev} direction="Previous" />}</div>
        <div>{next && <Cell project={next} direction="Next" />}</div>
      </div>
      <div className="mt-8 text-center">
        <Link href="/projects" className="focus-ring rounded-sm font-semibold text-primary-500 hover:underline">
          All projects
        </Link>
      </div>
    </nav>
  );
}
```

- [ ] **Step 4: Run, expect pass; commit**

```bash
npx vitest run src/__tests__/components/content/projects/case-study
git add -A
git commit -m "feat(projects): case-study hero, meta strip, sections, takeaways, pagination"
```

### Task 4: The page

**Files:**
- Rewrite: `src/app/(app)/projects/[slug]/page.tsx`
- Delete: `src/components/ui/BackButton.tsx`, `src/__tests__/components/ui/BackButton.test.tsx`

- [ ] **Step 1: Replace the page**

```tsx
// src/app/(app)/projects/[slug]/page.tsx
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AnimatedSection } from "@/components/layout/section/AnimatedSection";
import { Markdown } from "@/components/content/markdown/Markdown";
import { CaseStudyHero } from "@/components/content/projects/case-study/CaseStudyHero";
import { CaseStudySection } from "@/components/content/projects/case-study/CaseStudySection";
import { KeyTakeaways } from "@/components/content/projects/case-study/KeyTakeaways";
import { MetaStrip } from "@/components/content/projects/case-study/MetaStrip";
import { ProjectPagination } from "@/components/content/projects/case-study/ProjectPagination";
import { Reveal } from "@/components/content/projects/case-study/Reveal";
import { getAdjacentProjects, getProjectBySlug, getProjectSlugs } from "@/lib/projects";

type Params = Promise<{ slug: string }>;

export const dynamicParams = false;

export function generateStaticParams() {
  return getProjectSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const project = getProjectBySlug(slug);
  if (!project) return { title: "Project not found" };
  const title = project.seo?.title ?? `${project.name} | Projects`;
  const description = project.seo?.description ?? project.description;
  return {
    title,
    description,
    openGraph: { title, description, images: [{ url: project.image.src, width: project.image.width, height: project.image.height, alt: project.image.alt }] },
    twitter: { card: "summary_large_image", title, description, images: [project.image.src] },
  };
}

export default async function ProjectPage({ params }: { params: Params }) {
  const { slug } = await params;
  const project = getProjectBySlug(slug);
  if (!project) notFound();
  const { prev, next } = getAdjacentProjects(slug);

  const sections = [
    { id: "overview", heading: "Overview", body: project.overview },
    { id: "challenge", heading: "Challenge", body: project.challenge },
    { id: "solution", heading: "Solution", body: project.solution },
  ];

  return (
    <>
      <CaseStudyHero project={project} />
      <MetaStrip project={project} />

      <div className="mx-auto max-w-3xl space-y-16">
        {sections.map((s) => (
          <AnimatedSection key={s.id}>
            <Reveal>
              <CaseStudySection id={s.id} heading={s.heading}>
                <Markdown>{s.body}</Markdown>
              </CaseStudySection>
            </Reveal>
          </AnimatedSection>
        ))}

        <AnimatedSection>
          <Reveal>
            <KeyTakeaways items={project.keyTakeaways} />
          </Reveal>
        </AnimatedSection>

        {project.sections?.map((s, i) => (
          <AnimatedSection key={s.heading}>
            <Reveal>
              <CaseStudySection id={`extra-${i}`} heading={s.heading}>
                <Markdown>{s.body}</Markdown>
              </CaseStudySection>
            </Reveal>
          </AnimatedSection>
        ))}
      </div>

      <ProjectPagination prev={prev} next={next} />
    </>
  );
}
```

- [ ] **Step 2: Delete BackButton**

```bash
grep -rn "BackButton" src | grep -v "ui/BackButton\|__tests__"      # expect: nothing
git rm src/components/ui/BackButton.tsx src/__tests__/components/ui/BackButton.test.tsx
```

- [ ] **Step 3: Verify**

```bash
npx tsc --noEmit
npm run lint
npm run build          # /projects/[slug] ● SSG with one path per project
npm run dev
```

In the browser for each project: one `<h1>`; the hero image is the LCP element and has no layout shift; sections fade in as you scroll (and appear immediately with reduced motion emulated); Tab order is badges-free: links in the meta strip → body links → pagination; the page's `<title>` and `og:image` are right (view source).

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "feat(projects): long-scroll case study detail page; remove BackButton"
```

### Task 5: Let content use Markdown

- [ ] **Step 1:** Update `docs/adding-a-project.md` if it exists already (chunk 08 creates it otherwise) and the hand-off log: `overview`, `challenge`, `solution`, `sections[].body` and `keyTakeaways[]` may now contain Markdown.
- [ ] **Step 2 (optional, owner's call):** Edit one real project's JSON to add a link or emphasis, confirm it renders, commit as `content: …`.

---

## Verification checklist

- [ ] `npx tsc --noEmit`, `npm run lint`, `npm run build` clean
- [ ] `npm run test:run` + failing-set check from `00`: no new failures; baseline regenerated (BackButton test leaves it) and committed
- [ ] `grep -rn "BackButton\|whitespace-pre-line" src` → nothing
- [ ] Lighthouse (mobile) on a project page: Accessibility ≥ 95, Performance ≥ 90, zero CLS
- [ ] Vercel preview: every `/projects/<slug>` renders; prev/next wrap correctly at both ends (first has no Previous, last has no Next)

## Done when

PR `chunk-07-projects-detail` → `main` open, green, merged, production verified. Design decisions table filled in.

## Out of scope / deferred

- Dead-code sweep, docs, CLAUDE.md: chunk 08.

## Hand-off log

_(append dated notes here)_
