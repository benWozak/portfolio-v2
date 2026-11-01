# 07 — Projects detail redesign: long-scroll case study

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development to implement this plan task-by-task (one implementer, then a spec reviewer, then a code-quality reviewer per task; a whole-branch review at the end). Steps use checkbox (`- [ ]`) syntax for tracking. **Do not commit.** The owner reviews the working tree and commits it himself (see "Commit policy"). Task 1 (design decisions) is complete; every row of the Design decisions table is final and every code block below reflects it.

**Goal:** Rewrite `/projects/[slug]` as a long-scroll case study: a hero (title, lede, image), a sticky right-hand details column on desktop (status, group, stack chips, links), Overview / Challenge / Solution sections rendered from Markdown, Key Takeaways as a callout list, any extra sections, and previous/next navigation that stays within the project's group. Markdown rendering lands here, so content strings may start using inline Markdown after this chunk.

**Architecture:** The page stays a server component. `Markdown` (server, `react-markdown` + `remark-gfm`, no raw HTML) renders the text fields. A thin client `Reveal` wrapper accepts `children` so server-rendered Markdown passes through framer-motion entrance animations. Each body block gets its own `AnimatedSection` so a long page never waits on a single in-view threshold. The hero image is not animated (LCP). On `lg+` the page is a three-column grid: body in the first two columns, the details `<aside>` sticky in the third.

**Tech Stack:** `react-markdown@^10`, `remark-gfm@^4`, `@tailwindcss/typography` (already installed and registered in `tailwind.config.ts`), framer-motion, Vitest + Testing Library.

---

## Prerequisites

- Chunk 06 is on `main` (commit `8a503b8`, 2026-10-31). It provides: `ProjectImage`, `TechChips` (`items`, `max?`, `label?` → `aria-label`, `className?`; plus the `stackItems(stack)` helper), status-only `Badge`, `groups.ts` with `PROJECT_GROUPS[type].{label, heading, intro, href, allLabel, accentText, accentBorder}`, `getProjectsByType`, the extended framer-motion mock in `src/__tests__/setup.ts`, and `src/app/(app)/projects/layout.tsx`, which wraps every projects route (including `[slug]`) in `<article className="container mx-auto my-16 px-4 lg:py-8">`.
- Data model since 06: `type` is `'professional' | 'personal'`; `status` is `'In Progress' | 'Prototype' | 'Live' | 'Archived'`. **`Badge` renders statuses only.** Show the group with `PROJECT_GROUPS[project.type].label`, never `<Badge status={project.type} />`.
- `ProjectLinks` does not exist yet (dropped from 06). Task 4 creates it.
- `/projects` is a permanent redirect to `/projects/professional`. Nothing may link to `/projects` any more; "All …" links go to `PROJECT_GROUPS[type].href`.

## Commit policy

Same as chunk 06: implementers and reviewers **never run `git commit`**. Deletions go through `git rm` (so they are staged); everything else stays unstaged/untracked. The hand-off says exactly what is staged. Push and PR only on the owner's explicit go-ahead. Never stage `scripts/backups/`, `.env` or `.env.payload-legacy`.

## Start

```bash
git checkout main && git pull
git checkout -b chunk-07-projects-detail
```

## Design decisions

All decided with the owner on 2026-10-31 (prev/next scope and the column layout in conversation; hero and column contents from mockups published as artifacts "Case Study Hero Options" and "Case Study Sidebar Options"). The code blocks below are final.

| Topic | Decision |
|---|---|
| Prev/next scope | **Decided.** Previous/next stay within the project's group (professional ↔ professional). `getAdjacentProjects` is rewritten to filter by `type` first. The "All …" link under the pagination goes to the group page and uses `group.allLabel`. |
| Details column | **Decided (option B "open rows").** No meta strip under the hero. On `lg+` the details live in a right-hand column that is sticky (`lg:sticky lg:top-24 lg:self-start`) beside the body; below `lg` the same `<aside>` renders between the hero image and the Overview section. **No box**: the column sits on the page background. A `<dl>` of hairline-divided rows (`divide-y divide-gray-200 dark:divide-gray-700`, the tabs' hairline colours): **Status** (label left, `Badge` right), **Type** (label left, group name right as a link to `group.href` in `group.accentText`), **Stack** (label above a single flat de-duplicated chip row from `stackItems(project.techStack)`, no Frontend / Backend / Other sub-labels). Below the list, after one more hairline, the **links as buttons** in the home-row styles: primary `CTAButton` "Visit live site", secondary `CTAButton` "View source", both opening in a new tab, stacked (`flex-col`, `sm:flex-row lg:flex-col`), then the italic rights note when there is no source link. Rejected: tinted panel with text links (A); actions-first with no labels (C). |
| Hero | **Decided (2026-10-31, option A "editorial stack").** Constrained to the article container: status badge + group link row, `<h1>` name (`text-3xl lg:text-5xl font-bold tracking-tight`), description as a lede (`text-lg lg:text-xl text-gray-600 dark:text-gray-300`), then the image at full container width (`rounded-xl shadow-md`, `priority`, `sizes="(max-width: 1023px) 100vw, (max-width: 1535px) calc(100vw - 2rem), 1504px"`). The image keeps its intrinsic ratio (about 2:1 for the current screenshots), so nothing is cropped and there is no layout shift. The two-column grid starts below the image. Rejected: split hero echoing the home rows (B); image-first with the title in the body column (C). |
| Body | Two of the three grid columns on `lg+`, `space-y-16`. Each section: `<h2>` in the `SectionHeading` bar style (`w-8 lg:w-16 h-0.5 lg:h-1 bg-primary` + uppercase tracking), body in `prose`. |
| Key Takeaways | `<aside>` callout: `rounded-xl bg-secondary-bg p-6 lg:p-8`, heading "Key Takeaways", `<ul>` with teal markers; items rendered with inline Markdown. |
| Extra sections | Same treatment as the body sections, in order, after takeaways. |
| Pagination | `<nav aria-label="More projects">` at the bottom, full width, two cards side by side on `md+` (Previous / Next with name and group label), single column on mobile; a missing side renders an empty cell. `group.allLabel` link centred below, pointing at `group.href`. |
| Motion | Hero static. Each body block wrapped in `AnimatedSection` with children in `Reveal`. The details column is static. Nothing on hover except link underline and the pagination card tint. |
| Typography | `prose prose-neutral dark:prose-invert` with CSS variables mapped to tokens (body and headings → `--foreground`, links → `--primary`, bullets and counters → `--secondary-*`). |
| Heading outline | One `<h1>` (project name). `<h2>`: Overview, Challenge, Solution, Key Takeaways, each extra section, and a visually hidden "Project details" on the sidebar. No `<h3>`. |
| BackButton | Removed; pagination plus the header nav replace it. |

## File structure

| Path | Change | Responsibility |
|---|---|---|
| `src/lib/projects/index.ts` | Modify | `getAdjacentProjects` scoped to the project's type. |
| `src/__tests__/lib/projects.test.ts` | Modify | Replace the adjacency test. |
| `src/components/content/markdown/Markdown.tsx` | **Create** (server) | `react-markdown` wrapper; block and `inline` variants; link handling. |
| `src/__tests__/components/content/markdown/Markdown.test.tsx` | **Create** | |
| `src/app/(app)/globals.css` | Modify | `prose` token overrides. |
| `src/components/ui/CTAButton.tsx` | Modify | `external?: boolean` → `target="_blank" rel="noopener noreferrer"` + sr-only "(opens in a new tab)". |
| `src/__tests__/components/ui/CTAButton.test.tsx` | Modify | Extend the external-link case. |
| `src/components/content/projects/ProjectLinks.tsx` | **Create** | "Visit live site" / "View source" `CTAButton`s + optional rights note. |
| `src/components/content/projects/case-study/Reveal.tsx` | **Create** (client) | `motion.div` with `itemVariants`, accepts `children`. |
| `src/components/content/projects/case-study/CaseStudyHero.tsx` | **Create** | Badge row, h1, lede, image (option A). |
| `src/components/content/projects/case-study/CaseStudySidebar.tsx` | **Create** | Sticky details `<aside>`: hairline rows (status, group, stack) + link buttons (option B). |
| `src/components/content/projects/case-study/CaseStudySection.tsx` | **Create** | `<section aria-labelledby>` + styled h2 + children. |
| `src/components/content/projects/case-study/KeyTakeaways.tsx` | **Create** | Callout list with inline Markdown. |
| `src/components/content/projects/case-study/ProjectPagination.tsx` | **Create** | Prev/next nav + group "All …" link. |
| `src/__tests__/components/content/projects/ProjectLinks.test.tsx` | **Create** | |
| `src/__tests__/components/content/projects/case-study/{CaseStudySidebar,KeyTakeaways,ProjectPagination,CaseStudyHero,CaseStudySection}.test.tsx` | **Create** | |
| `src/app/(app)/projects/[slug]/page.tsx` | **Rewrite** | Composes the above; full `openGraph`/`twitter` metadata. |
| `src/components/ui/BackButton.tsx`, `src/__tests__/components/ui/BackButton.test.tsx` | **Delete** (`git rm`) | Only the detail page used it. |
| `package.json`, `package-lock.json` | Modify | add `react-markdown`, `remark-gfm` (via `npm install`, nothing else changes). |
| `planning/baseline-test-failures.txt` | Regenerate | The two BackButton lines drop out. |

---

### Task 1: Record design decisions (owner, in conversation)

Not a subagent task. Done in the planning session with the owner before execution starts.

- [x] **Step 1: Bank the decisions already made** (2026-10-31): prev/next within group; sticky right column instead of a meta strip; flat stack chips with no sub-labels. Written into the table above.
- [x] **Step 2a: Hero layout** — three mockups compared (artifact "Case Study Hero Options", 2026-10-31); owner chose A, editorial stack. `CaseStudyHero` in Task 4 is final.
- [x] **Step 2b: Details column contents and styling** — three mockups compared (artifact "Case Study Sidebar Options"); owner chose B, open rows with hairlines and link buttons.
- [x] **Step 3: Answers written into the Design decisions table**; `CaseStudySidebar`, `ProjectLinks` and the `CTAButton` change in Task 4 match them. Doc left for the owner to commit.

### Task 2: Group-scoped adjacency (TDD)

**Files:**
- Modify: `src/lib/projects/index.ts:38-42`
- Modify: `src/__tests__/lib/projects.test.ts:85-96`

- [ ] **Step 1: Replace the adjacency test**

Replace the `it('getAdjacentProjects walks the ordered list with nulls at the ends', …)` block with:

```ts
  it('getAdjacentProjects stays within the project type, with nulls at the ends', () => {
    for (const type of PROJECT_TYPES) {
      const group = getProjectsByType(type)
      if (group.length === 0) continue
      const first = getAdjacentProjects(group[0].slug)
      const last = getAdjacentProjects(group[group.length - 1].slug)
      expect(first.prev).toBeNull()
      expect(last.next).toBeNull()
      for (const [i, p] of group.entries()) {
        const { prev, next } = getAdjacentProjects(p.slug)
        expect(prev?.slug ?? null).toBe(group[i - 1]?.slug ?? null)
        expect(next?.slug ?? null).toBe(group[i + 1]?.slug ?? null)
        if (prev) expect(prev.type).toBe(type)
        if (next) expect(next.type).toBe(type)
      }
    }
    expect(getAdjacentProjects('does-not-exist')).toEqual({ prev: null, next: null })
  })
```

- [ ] **Step 2: Run, expect failure** — `npx vitest run src/__tests__/lib/projects.test.ts`. With the current content the global walk gives Calgary Folk Fest (professional) a `next` of tedana-app (personal), so the type assertion fails.

- [ ] **Step 3: Implement**

```ts
/** Previous/next within the same `type`, by `order`. Nulls at the ends and for unknown slugs. */
export function getAdjacentProjects(slug: string): { prev: Project | null; next: Project | null } {
  const current = getProjectBySlug(slug)
  if (!current) return { prev: null, next: null }
  const group = getProjectsByType(current.type)
  const i = group.findIndex((p) => p.slug === slug)
  return { prev: group[i - 1] ?? null, next: group[i + 1] ?? null }
}
```

Update the doc comment at the top of the function; nothing else in the file changes.

- [ ] **Step 4: Run, expect pass** — `npx vitest run src/__tests__/lib` (all three lib files; this is `npm run content:check`).

### Task 3: Markdown renderer (TDD)

**Files:**
- Create: `src/components/content/markdown/Markdown.tsx`
- Test: `src/__tests__/components/content/markdown/Markdown.test.tsx`
- Modify: `src/app/(app)/globals.css` (inside the existing `@layer components` block at the top of the file)

- [ ] **Step 1: Install**

```bash
npm install react-markdown@^10 remark-gfm@^4
git diff --stat package.json package-lock.json    # only these two files; next stays at 15.4.11
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

  it('merges className onto the prose wrapper and keeps the base classes', () => {
    const { container } = render(<Markdown className="mt-4">{'x'}</Markdown>)
    expect(container.firstElementChild).toHaveClass('prose', 'max-w-none', 'dark:prose-invert', 'mt-4')
  })

  it('inline variant keeps the text of every paragraph', () => {
    const { container } = render(<Markdown inline>{'First para.\n\nSecond para.'}</Markdown>)
    expect(container.querySelector('p')).toBeNull()
    expect(container.textContent).toContain('First para.')
    expect(container.textContent).toContain('Second para.')
  })

  it('does not open mailto links in a new tab', () => {
    render(<Markdown>{'[mail](mailto:hi@example.com)'}</Markdown>)
    const link = screen.getByRole('link', { name: 'mail' })
    expect(link).toHaveAttribute('href', 'mailto:hi@example.com')
    expect(link).not.toHaveAttribute('target')
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
  /** Unwrap paragraphs (no <p>); for list items and short labels. Other block elements pass through. */
  inline?: boolean;
  /** Extra classes on the block wrapper; ignored in inline mode (there is no wrapper). */
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

- [ ] **Step 5: `prose` token overrides** — add inside the `@layer components { … }` block at the top of `src/app/(app)/globals.css`, after `.focus-ring`:

```css
  /* Typography plugin → design tokens. Both light and dark (prose-invert) sets. */
  .prose {
    --tw-prose-body: hsl(var(--foreground));
    --tw-prose-invert-body: hsl(var(--foreground));
    --tw-prose-headings: hsl(var(--foreground));
    --tw-prose-invert-headings: hsl(var(--foreground));
    --tw-prose-bold: hsl(var(--foreground));
    --tw-prose-invert-bold: hsl(var(--foreground));
    --tw-prose-links: hsl(var(--primary));
    --tw-prose-invert-links: hsl(var(--primary));
    --tw-prose-bullets: hsl(var(--secondary-500));
    --tw-prose-invert-bullets: hsl(var(--secondary-500));
    /* counters: darker teal on the light background for contrast */
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

`--foreground`, `--primary`, `--secondary-500` and `--secondary-700` are all defined in both the light and dark `:root` blocks of `globals.css`; `--foreground` flips between them, so one set of overrides serves both themes.

- [ ] **Step 6: Run, expect pass** — `npx vitest run src/__tests__/components/content/markdown`

### Task 4: Case-study components (TDD where behaviour exists)

**Files:**
- Modify: `src/components/ui/CTAButton.tsx`, `src/__tests__/components/ui/CTAButton.test.tsx:222-231`
- Create: `src/components/content/projects/ProjectLinks.tsx`
- Create: `src/components/content/projects/case-study/{Reveal,CaseStudyHero,CaseStudySidebar,CaseStudySection,KeyTakeaways,ProjectPagination}.tsx`
- Test: `src/__tests__/components/content/projects/ProjectLinks.test.tsx`
- Test: `src/__tests__/components/content/projects/case-study/{CaseStudySidebar,KeyTakeaways,ProjectPagination,CaseStudyHero,CaseStudySection}.test.tsx`

- [ ] **Step 0: `CTAButton` opens external links in a new tab (TDD)**

Replace the `it('handles external links correctly', …)` case in `src/__tests__/components/ui/CTAButton.test.tsx` with:

```tsx
    it('handles external links correctly', () => {
      render(
        <CTAButton href="https://external.com" external>
          External Link
        </CTAButton>
      )

      const link = screen.getByRole('link', { name: /external link/i })
      expect(link).toHaveAttribute('href', 'https://external.com')
      expect(link).toHaveAttribute('target', '_blank')
      expect(link).toHaveAttribute('rel', 'noopener noreferrer')
      expect(link).toHaveAccessibleName(/opens in a new tab/i)
    })

    it('does not add target or rel without external', () => {
      render(<CTAButton href="/internal">Internal</CTAButton>)
      const link = screen.getByRole('link', { name: 'Internal' })
      expect(link).not.toHaveAttribute('target')
      expect(link).not.toHaveAttribute('rel')
    })
```

Run `npx vitest run src/__tests__/components/ui/CTAButton.test.tsx`, expect the new case to fail. Then in `src/components/ui/CTAButton.tsx`:

```tsx
interface CTAButtonProps {
  href: string;
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  type?: "primary" | "secondary";
  /** Open in a new tab with rel="noopener noreferrer" and an sr-only hint. */
  external?: boolean;
}

export function CTAButton({
  href,
  children,
  className = "",
  // onClick,
  type = "primary",
  external = false,
}: CTAButtonProps) {
```

and on the `<Link>`:

```tsx
    <Link
      href={href}
      {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      // onClick={handleClick}
      className={`
```

and inside the inner `<span>`, after `{children}`:

```tsx
        {children}
        {external && <span className="sr-only"> (opens in a new tab)</span>}
```

Leave the commented-out smooth-scroll code alone (chunk 08 cleans it up). Re-run; expect pass.

- [ ] **Step 1: Failing tests**

```tsx
// src/__tests__/components/content/projects/ProjectLinks.test.tsx
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ProjectLinks } from '@/components/content/projects/ProjectLinks'

describe('ProjectLinks', () => {
  it('renders live and source buttons that open in a new tab', () => {
    render(<ProjectLinks liveUrl="https://example.com" githubUrl="https://github.com/x/y" />)
    const live = screen.getByRole('link', { name: /visit live site/i })
    expect(live).toHaveAttribute('href', 'https://example.com')
    expect(live).toHaveAttribute('target', '_blank')
    expect(live).toHaveAttribute('rel', 'noopener noreferrer')
    expect(screen.getByRole('link', { name: /view source/i })).toHaveAttribute('href', 'https://github.com/x/y')
    expect(screen.queryByText(/do not own the rights/i)).toBeNull()
  })

  it('shows the rights note instead of a source button when asked and there is no code link', () => {
    render(<ProjectLinks liveUrl="https://example.com" githubUrl={null} showRightsNote />)
    expect(screen.queryByRole('link', { name: /view source/i })).toBeNull()
    expect(screen.getByText(/do not own the rights/i)).toBeInTheDocument()
  })

  it('hides the rights note when a source link exists even if asked', () => {
    render(<ProjectLinks liveUrl={null} githubUrl="https://github.com/x/y" showRightsNote />)
    expect(screen.getByRole('link', { name: /view source/i })).toBeInTheDocument()
    expect(screen.queryByText(/do not own the rights/i)).toBeNull()
  })

  it('renders nothing when there are no links and no note', () => {
    const { container } = render(<ProjectLinks liveUrl={null} githubUrl={null} />)
    expect(container).toBeEmptyDOMElement()
  })
})
```

```tsx
// src/__tests__/components/content/projects/case-study/ProjectPagination.test.tsx
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ProjectPagination } from '@/components/content/projects/case-study/ProjectPagination'
import { PROJECT_GROUPS } from '@/components/content/projects/groups'
import type { Project } from '@/types'

const p = (slug: string, name: string) => ({ slug, name, type: 'professional' }) as Project
const group = PROJECT_GROUPS.professional

describe('ProjectPagination', () => {
  it('links prev, next and the group page', () => {
    render(<ProjectPagination prev={p('a', 'Alpha')} next={p('b', 'Beta')} group={group} />)
    expect(screen.getByRole('navigation', { name: /more projects/i })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /previous.*alpha/i })).toHaveAttribute('href', '/projects/a')
    expect(screen.getByRole('link', { name: /next.*beta/i })).toHaveAttribute('href', '/projects/b')
    expect(screen.getByRole('link', { name: /all professional work/i })).toHaveAttribute('href', '/projects/professional')
  })

  it('omits a missing side', () => {
    render(<ProjectPagination prev={null} next={p('b', 'Beta')} group={group} />)
    expect(screen.queryByRole('link', { name: /previous/i })).toBeNull()
    expect(screen.getByRole('link', { name: /next.*beta/i })).toBeInTheDocument()
    expect(screen.getByRole('navigation', { name: /more projects/i }).querySelector('.hidden.md\\:block')).not.toBeNull()
  })
})
```

```tsx
// src/__tests__/components/content/projects/case-study/CaseStudyHero.test.tsx
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { CaseStudyHero } from '@/components/content/projects/case-study/CaseStudyHero'
import type { Project } from '@/types'

const project: Project = {
  slug: 'x', name: 'Project X', type: 'personal', status: 'Prototype', featured: false, order: 1, description: 'A short lede.',
  techStack: { frontend: [], backend: [], other: [] }, liveUrl: null, githubUrl: null,
  image: { src: '/projects/x/x.png', alt: 'Project X screenshot', width: 1, height: 1, blurDataURL: 'data:image/webp;base64,AA==' },
  overview: 'o', challenge: 'c', solution: 's', keyTakeaways: ['k'],
}

describe('CaseStudyHero', () => {
  it('renders the h1, status, group link, lede and image', () => {
    render(<CaseStudyHero project={project} />)
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Project X')
    expect(screen.getByText('Prototype')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Personal' })).toHaveAttribute('href', '/projects/personal')
    expect(screen.getByText('A short lede.')).toBeInTheDocument()
    expect(screen.getByRole('img', { name: 'Project X screenshot' })).toBeInTheDocument()
  })
})
```

```tsx
// src/__tests__/components/content/projects/case-study/CaseStudySection.test.tsx
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { CaseStudySection } from '@/components/content/projects/case-study/CaseStudySection'

describe('CaseStudySection', () => {
  it('is a region named by its h2 and renders children', () => {
    render(<CaseStudySection id="overview" heading="Overview"><p>Body</p></CaseStudySection>)
    const region = screen.getByRole('region', { name: 'Overview' })
    expect(region).toContainElement(screen.getByText('Body'))
    expect(screen.getByRole('heading', { level: 2, name: 'Overview' })).toHaveAttribute('id', 'overview')
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
// src/__tests__/components/content/projects/case-study/CaseStudySidebar.test.tsx
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { CaseStudySidebar } from '@/components/content/projects/case-study/CaseStudySidebar'
import type { Project } from '@/types'

const project: Project = {
  slug: 'x', name: 'X', type: 'personal', status: 'Prototype', featured: false, order: 1, description: 'd',
  techStack: { frontend: ['React Native'], backend: [], other: ['Expo', 'React Native'] },
  liveUrl: 'https://example.com', githubUrl: null,
  image: { src: '/projects/x/x.png', alt: 'x', width: 1, height: 1, blurDataURL: 'data:image/webp;base64,AA==' },
  overview: 'o', challenge: 'c', solution: 's', keyTakeaways: ['k'],
}

describe('CaseStudySidebar', () => {
  it('shows status, links the group page and lists the stack once, flat', () => {
    render(<CaseStudySidebar project={project} />)
    expect(screen.getByRole('complementary', { name: /project details/i })).toBeInTheDocument()
    expect(screen.getByText('Prototype')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Personal' })).toHaveAttribute('href', '/projects/personal')
    const chips = screen.getByRole('list', { name: /tech stack/i })
    expect(chips.querySelectorAll('li')).toHaveLength(2)   // React Native de-duplicated, no group lists
    expect(screen.queryByRole('list', { name: /frontend/i })).toBeNull()
  })

  it('shows the live button and the rights note when there is no code link', () => {
    render(<CaseStudySidebar project={project} />)
    expect(screen.getByRole('link', { name: /visit live site/i })).toHaveAttribute('href', 'https://example.com')
    expect(screen.queryByRole('link', { name: /view source/i })).toBeNull()
    expect(screen.getByText(/do not own the rights/i)).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Run, expect failure** — `npx vitest run src/__tests__/components/content/projects`

- [ ] **Step 3: Implement**

```tsx
// src/components/content/projects/ProjectLinks.tsx
// FINAL (design option B). The two home-row button styles, opening in a new tab.
import { CTAButton } from "@/components/ui/CTAButton";
import { cn } from "@/lib/utils";

interface Props {
  liveUrl: string | null;
  githubUrl: string | null;
  /** Show "I do not own the rights…" when there is no code link. */
  showRightsNote?: boolean;
  className?: string;
}

export function ProjectLinks({ liveUrl, githubUrl, showRightsNote = false, className }: Props) {
  const note = showRightsNote && !githubUrl;
  if (!liveUrl && !githubUrl && !note) return null;

  return (
    <div className={cn("flex flex-col gap-3", className)}>
      {(liveUrl || githubUrl) && (
        <div className="flex flex-col gap-3 sm:flex-row lg:flex-col">
          {liveUrl && (
            <CTAButton href={liveUrl} external>
              Visit live site<span aria-hidden="true">{"\u00a0↗"}</span>
            </CTAButton>
          )}
          {githubUrl && (
            <CTAButton type="secondary" href={githubUrl} external>
              View source<span aria-hidden="true">{"\u00a0↗"}</span>
            </CTAButton>
          )}
        </div>
      )}
      {note && (
        <p className="text-sm italic text-gray-500 dark:text-gray-400">
          I do not own the rights to the code for this project.
        </p>
      )}
    </div>
  );
}
```

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
// FINAL (design option A, 2026-10-31).
import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import { cn } from "@/lib/utils";
import type { Project } from "@/types";
import { PROJECT_GROUPS } from "../groups";
import { ProjectImage } from "../ProjectImage";

export function CaseStudyHero({ project }: { project: Project }) {
  const group = PROJECT_GROUPS[project.type];
  return (
    <header className="mb-12">
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <Badge status={project.status} />
        <Link
          href={group.href}
          className={cn("focus-ring rounded-sm text-xs font-semibold uppercase tracking-widest", group.accentText)}
        >
          {group.label}
        </Link>
      </div>
      <h1 className="text-3xl font-bold tracking-tight lg:text-5xl">{project.name}</h1>
      <p className="mt-4 max-w-3xl text-lg text-gray-600 dark:text-gray-300 lg:text-xl">{project.description}</p>
      <ProjectImage
        image={project.image}
        sizes="(max-width: 1023px) 100vw, (max-width: 1535px) calc(100vw - 2rem), 1504px"
        priority
        className="mt-8 w-full rounded-xl shadow-md"
      />
    </header>
  );
}
```

```tsx
// src/components/content/projects/case-study/CaseStudySidebar.tsx
// FINAL (design option B "open rows"). The page places this in the third grid
// column on lg+, sticky; below lg it sits between the hero and the body.
import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import { cn } from "@/lib/utils";
import type { Project } from "@/types";
import { PROJECT_GROUPS } from "../groups";
import { ProjectLinks } from "../ProjectLinks";
import { TechChips, stackItems } from "../TechChips";

const LABEL = "text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400";
const ROW = "flex items-center justify-between gap-3 py-3 first:pt-0";

export function CaseStudySidebar({ project, className }: { project: Project; className?: string }) {
  const group = PROJECT_GROUPS[project.type];
  return (
    <aside aria-labelledby="project-details" className={className}>
      <h2 id="project-details" className="sr-only">
        Project details
      </h2>
      <dl className="divide-y divide-gray-200 dark:divide-gray-700">
        <div className={ROW}>
          <dt className={LABEL}>Status</dt>
          <dd>
            <Badge status={project.status} />
          </dd>
        </div>
        <div className={ROW}>
          <dt className={LABEL}>Type</dt>
          <dd>
            <Link href={group.href} className={cn("focus-ring rounded-sm font-semibold hover:underline", group.accentText)}>
              {group.label}
            </Link>
          </dd>
        </div>
        <div className="py-3">
          <dt className={cn(LABEL, "mb-2.5")}>Stack</dt>
          <dd>
            <TechChips items={stackItems(project.techStack)} />
          </dd>
        </div>
      </dl>
      <ProjectLinks
        liveUrl={project.liveUrl}
        githubUrl={project.githubUrl}
        showRightsNote
        className="border-t border-gray-200 pt-4 dark:border-gray-700"
      />
    </aside>
  );
}
```

Notes for the implementer: `first:pt-0` removes the top padding on the Status row only; `divide-y` draws the hairlines between the three rows; the links block adds its own top hairline so the column reads as four rows. `TechChips` keeps its default `aria-label="Tech stack"`.

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
        <span aria-hidden="true" className="h-0.5 w-8 rounded-full bg-primary lg:h-1 lg:w-16" />
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
        {items.map((item, i) => (
          <li key={i} className="flex gap-3 text-gray-700 dark:text-gray-200">
            <span aria-hidden="true" className="mt-2 h-2 w-2 flex-none rounded-full bg-secondary-500" />
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
import { cn } from "@/lib/utils";
import type { Project } from "@/types";
import { PROJECT_GROUPS, type ProjectGroup } from "../groups";

interface Props {
  prev: Project | null;
  next: Project | null;
  /** The current project's group; the "All …" link goes to its page. */
  group: ProjectGroup;
}

function Cell({ project, direction }: { project: Project; direction: "Previous" | "Next" }) {
  return (
    <Link
      href={`/projects/${project.slug}`}
      className={cn(
        "focus-ring flex flex-col gap-1 rounded-lg bg-secondary-bg p-5 transition-colors hover:bg-secondary-200/60 dark:hover:bg-secondary-800/60",
        direction === "Next" && "items-end text-right"
      )}
    >
      <span className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
        {direction} project
      </span>
      <span className="text-lg font-semibold">{project.name}</span>
      <span className="sr-only">, {PROJECT_GROUPS[project.type].label}</span>
    </Link>
  );
}

export function ProjectPagination({ prev, next, group }: Props) {
  return (
    <nav aria-label="More projects" className="mt-20">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {/* An empty side keeps its column on md+ but takes no space on mobile. */}
        <div className={cn(!prev && "hidden md:block")}>{prev && <Cell project={prev} direction="Previous" />}</div>
        <div className={cn(!next && "hidden md:block")}>{next && <Cell project={next} direction="Next" />}</div>
      </div>
      <div className="mt-8 text-center">
        <Link href={group.href} className="focus-ring rounded-sm font-semibold text-primary-700 hover:underline dark:text-primary-400">
          {group.allLabel}
        </Link>
      </div>
    </nav>
  );
}
```

- [ ] **Step 4: Run, expect pass** — `npx vitest run src/__tests__/components/content/projects src/__tests__/components/ui/CTAButton.test.tsx`

### Task 5: The page

**Files:**
- Rewrite: `src/app/(app)/projects/[slug]/page.tsx`
- Delete: `src/components/ui/BackButton.tsx`, `src/__tests__/components/ui/BackButton.test.tsx`

- [ ] **Step 1: Replace the page**

The projects layout already supplies `<article className="container mx-auto my-16 px-4 lg:py-8">`, so the page returns a fragment and must **not** add its own container.

```tsx
// src/app/(app)/projects/[slug]/page.tsx
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AnimatedSection } from "@/components/layout/section/AnimatedSection";
import { Markdown } from "@/components/content/markdown/Markdown";
import { PROJECT_GROUPS } from "@/components/content/projects/groups";
import { CaseStudyHero } from "@/components/content/projects/case-study/CaseStudyHero";
import { CaseStudySection } from "@/components/content/projects/case-study/CaseStudySection";
import { CaseStudySidebar } from "@/components/content/projects/case-study/CaseStudySidebar";
import { KeyTakeaways } from "@/components/content/projects/case-study/KeyTakeaways";
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
  const title = project.seo?.title ?? project.name;
  const description = project.seo?.description ?? project.description;
  const image = { url: project.image.src, width: project.image.width, height: project.image.height, alt: project.image.alt };
  return {
    // seo.title is a full <title> override; project.name takes the root "%s | Ben Wozak" template.
    title: project.seo?.title ? { absolute: project.seo.title } : project.name,
    description,
    // Replaces the root layout's openGraph block wholesale, so restate type, siteName, locale and url.
    openGraph: {
      type: "article",
      siteName: "Ben Wozaks Portfolio",
      locale: "en_US",
      url: `/projects/${slug}`,
      title,
      description,
      images: [image],
    },
    twitter: { card: "summary_large_image", title, description, images: [project.image.src] },
  };
}

export default async function ProjectPage({ params }: { params: Params }) {
  const { slug } = await params;
  const project = getProjectBySlug(slug);
  if (!project) notFound();
  const { prev, next } = getAdjacentProjects(slug);
  const group = PROJECT_GROUPS[project.type];

  const sections = [
    { id: "overview", heading: "Overview", body: project.overview },
    { id: "challenge", heading: "Challenge", body: project.challenge },
    { id: "solution", heading: "Solution", body: project.solution },
  ];

  return (
    <>
      <CaseStudyHero project={project} />

      <div className="lg:grid lg:grid-cols-3 lg:gap-12">
        {/* DOM order: details, then the story. Below lg that is also the visual order. */}
        <CaseStudySidebar
          project={project}
          className="mb-12 lg:col-start-3 lg:row-start-1 lg:mb-0 lg:sticky lg:top-24 lg:self-start"
        />

        <div className="space-y-16 lg:col-span-2 lg:col-start-1 lg:row-start-1">
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
            <AnimatedSection key={`${i}-${s.heading}`}>
              <Reveal>
                <CaseStudySection id={`extra-${i}`} heading={s.heading}>
                  <Markdown>{s.body}</Markdown>
                </CaseStudySection>
              </Reveal>
            </AnimatedSection>
          ))}
        </div>
      </div>

      <ProjectPagination prev={prev} next={next} group={group} />
    </>
  );
}
```

Title note: the root layout's title template is `"%s | Ben Wozak"`, so `title: project.name` renders as "Calgary Folk Fest | Ben Wozak". The old `"${name} | Projects"` would have produced a double suffix. `seo.title`, when set, is used verbatim (`{ absolute }`), matching the chunk 08 schema table's "Override the `<title>`". `siteName` repeats the root layout's value (including its missing apostrophe) so the two stay identical; chunk 08's SEO pass fixes both.

- [ ] **Step 2: Delete BackButton**

```bash
grep -rn "BackButton" src | grep -v "ui/BackButton\|__tests__"      # expect: nothing (the page no longer imports it)
git rm src/components/ui/BackButton.tsx src/__tests__/components/ui/BackButton.test.tsx
```

`src/components/ui/index.tsx` never exported `BackButton`, so the barrel needs no change.

- [ ] **Step 3: Verify**

```bash
rm -rf .next && npx tsc --noEmit
npx next lint
npm run build          # /projects/[slug] ● SSG, four paths; no new ƒ routes
npx next start -p 3100 & echo $! > .next/server.pid
for s in calgary-folk-fest vista-crossing homechef-companion tedana-app; do
  curl -s -o /dev/null -w "$s %{http_code}\n" http://localhost:3100/projects/$s
done
kill "$(cat .next/server.pid)"
```

In the browser for each project (owner, see "Owner checks"): one `<h1>`; the hero image is the LCP element and has no layout shift; the details column sticks beside the body at `lg+` and sits between hero and body below it; sections fade in as you scroll; with reduced motion emulated they still fade (opacity only, no movement), because `MotionConfig reducedMotion="user"` disables transforms but not opacity, the same as the home page; Tab order is hero group link → sidebar group link → sidebar buttons → body links → pagination; `<title>` and `og:image` are right (view source). Prev/next never cross groups: Calgary Folk Fest ↔ Vista Crossing; HomeChef Companion ↔ Tedana App.

### Task 6: Content may use Markdown; baseline; hand-off

- [x] **Step 1: Baseline.** Done 2026-10-31: `comm -13` empty; `comm -23` listed exactly the two BackButton lines; `planning/baseline-test-failures.txt` regenerated (38 lines). Full suite: 460 tests, 422 pass, 38 fail (all baseline).
- [x] **Step 2: Hand-off log.** Written below; chunk 08 notes appended to `planning/08-cleanup-and-hardening.md`.
- [ ] **Step 3 (optional, owner's call):** Edit one real project's JSON to add a link or emphasis and confirm it renders.

---

## Verification checklist

- [ ] `rm -rf .next && npx tsc --noEmit`, `npx next lint`, `npm run build` clean
- [ ] `npm run test:run` + failing-set check from `00`: `comm -13` empty; baseline regenerated (BackButton lines leave it)
- [ ] `grep -rn "BackButton\|whitespace-pre-line\|MetaStrip" src` → nothing
- [ ] `grep -rn 'href="/projects"' src` → nothing (everything points at a group page)
- [ ] `git diff --stat package.json package-lock.json` shows only the two new packages; `next` still 15.4.11
- [ ] Hygiene: nothing under `scripts/backups/`, no `.env*` staged; only the two `git rm` deletions are staged
- [ ] Lighthouse (mobile) on a project page: Accessibility ≥ 95, Performance ≥ 90, zero CLS (owner, needs Chrome)
- [ ] Vercel preview: every `/projects/<slug>` renders; prev/next stop at each group's ends (first has no Previous, last has no Next)

## Owner checks on the preview

- Hero at phone, tablet and desktop widths; image ratio and rounding.
- Sticky column: does it clear the fixed header (`top-24`); does it ever overlap the pagination on a short body.
- Reduced-motion emulation: body sections fade in without sliding (opacity-only, site-wide behaviour). If you would rather they appear instantly, that is a one-line `useReducedMotion` change in `AnimatedSection`, best done for the whole site in chunk 08.
- Dark-mode pass: prose colours, chips, callout, pagination tint.
- Keyboard: focus rings on the group link, sidebar links, Markdown links and pagination cards.

## Done when

Working tree reviewed and committed by the owner; PR `chunk-07-projects-detail` → `main` opened on his go-ahead, green, merged, production verified. Design decisions table has no PENDING rows.

## Out of scope / deferred

- Dead-code sweep, `docs/adding-a-project.md`, CLAUDE.md, the placeholder `twitter.creator` in the root layout, per-page `openGraph` for the group pages: chunk 08.

## Hand-off log

- 2026-10-31 — Rewrite pass done against chunk 06 as merged (`8a503b8`). Fixed: `Badge` no longer takes `type`; fixtures used `web`/`native`/`Professional`; "All projects" pointed at the now-redirecting `/projects`; `ProjectLinks` was imported but never created; Task 1 referenced a Design decisions table that 06 does not have; `sizes` off-by-one; commit steps removed (owner commits).
- 2026-10-31 — Owner decisions banked: (1) prev/next stay within the group; (2) the meta strip is replaced by a right-hand sticky details column on desktop, with flat stack chips and no Frontend / Backend / Other sub-labels; (3) hero = option A "editorial stack" (title, lede, full-width image, then the columns), chosen from three mockups in artifact "Case Study Hero Options"; (4) details column = option B "open rows" (hairline rows for Status / Type / Stack, then `CTAButton` links "Visit live site" / "View source" opening in a new tab, rights note when no source), chosen from three mockups in artifact "Case Study Sidebar Options". `CTAButton` gains an `external` prop for this.
- 2026-10-31 — Execution (subagent-driven, nothing committed). Task 2 and Task 3 reviewed and approved. Review-driven additions folded into the code blocks above: `--tw-prose-bold` pair mapped to `--foreground`, a comment on the counters asymmetry, JSDoc on `inline`/`className`, and three more Markdown tests (className merge, inline multi-paragraph, mailto). Lockfile verified against `HEAD`: 96 packages added, none removed or re-versioned; six existing dev-only packages (`@types/estree`, `@types/react`, its nested `csstype`, `debug`, `dequal`, `ms`) lost their `dev` flag because the Markdown stack needs them at runtime. Known: react-markdown's URL allowlist empties `tel:` hrefs; content never uses them.
- 2026-10-31 — Tasks 4, 5 and 6 done, each with a spec review and a code-quality review; no Critical or Important findings anywhere. Review-driven changes, all folded into the code blocks above: index keys on takeaways and extra sections; non-breaking space before the button arrows; `cn` in the pagination cell and `hidden md:block` on an empty side; hero `sizes` matched to the real container (1504px at 2xl); tests for `CaseStudyHero`, `CaseStudySection`, a rights-note negative case and the hidden empty cell; page metadata restates `siteName`/`locale`, and `seo.title` is an absolute `<title>` override. Verified by the Task 5 implementer and again by its reviewer from the prerendered HTML: one `<h1>` per page, `<title>` "Calgary Folk Fest | Ben Wozak", absolute `og:image` with width/height/alt, `og:type` article, prev/next never cross groups (calgary ↔ vista, homechef ↔ tedana), all four pages 200 under `next start`. Content fields `overview`, `challenge`, `solution`, `sections[].body` and `keyTakeaways[]` may now contain Markdown; `docs/adding-a-project.md` (chunk 08) must say so.
- 2026-10-31 — **State for the owner.** Branch `chunk-07-projects-detail` from `main` (`8a503b8`), nothing committed. Staged: the two `git rm` deletions (`src/components/ui/BackButton.tsx`, `src/__tests__/components/ui/BackButton.test.tsx`). Unstaged: `package.json`, `package-lock.json`, `src/app/(app)/globals.css`, `src/app/(app)/projects/[slug]/page.tsx`, `src/components/ui/CTAButton.tsx`, `src/__tests__/components/ui/CTAButton.test.tsx`, `src/lib/projects/index.ts`, `src/__tests__/lib/projects.test.ts`, `planning/07-projects-detail-redesign.md`, `planning/08-cleanup-and-hardening.md`, `planning/baseline-test-failures.txt`. Untracked: `src/components/content/markdown/`, `src/__tests__/components/content/markdown/`, `src/components/content/projects/ProjectLinks.tsx`, `src/__tests__/components/content/projects/ProjectLinks.test.tsx`, `src/components/content/projects/case-study/`, `src/__tests__/components/content/projects/case-study/`. Suggested split: (1) `git add -A src package.json package-lock.json` → `feat(projects): long-scroll case study detail page with Markdown; remove BackButton`; (2) `git add planning` → `docs(planning): chunk 07 hand-off; notes for 08`. Intermediate task states do not build (the page needs every component), so a per-task split is not practical.
- 2026-10-31 — Carried from 06: `getAdjacentProjects` previously walked the global order (homechef, calgary, tedana, vista), so prev/next alternated groups; fixed by Task 2. The detail page had no `h1`; the hero's `<h1>` fixes it. Detail pages set only `openGraph.images`, which replaced the root `openGraph` block; Task 5 restates `type`, `url`, `title`, `description` and `images`.
