# 06 — Projects redesign: professional | personal

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking. The design is settled in `06-projects-redesign-spec.md`; read it first.

**Goal:** Regroup projects by provenance (professional work | personal projects) instead of platform, showcase one project per group on the home page in editorial rows, and replace `/projects` with two tabbed static pages of a new image-led card.

**Architecture:** `type` is repurposed to `'professional' | 'personal'` and statuses become `In Progress | Prototype | Live | Archived`; the loader gains `getProjectsByType` and a per-type `getFeaturedProject`, with a one-featured-per-type rule enforced at module init so a bad file fails the build. Presentation is a handful of server-safe components (`ProjectImage`, `TechChips`, `ProjectCard`, `ProjectGrid`, `ProjectRow`) sharing one constants file (`groups.ts`) for labels, hrefs, copy and accent classes; the only client components are `ProjectTabs` (`usePathname`) and the home section (framer-motion). `/projects/professional` and `/projects/personal` are separate page files; `/projects`, `/projects/web` and `/projects/native` become permanent redirects.

**Tech Stack:** Next.js 15 App Router (static pages, `next.config.ts` redirects), framer-motion (existing `AnimatedSection`/`itemVariants` only), Tailwind with HSL tokens, Vitest + Testing Library.

---

## Prerequisites

- Chunk 05 merged to `main` (done: PR #7). The tree has no Payload.
- Spec approved: `planning/06-projects-redesign-spec.md`.

## Conventions

- Every commit message ends with a blank line and `Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>`; the commands below include it.
- Nothing is pushed and no PR is opened without the owner saying so. The owner merges.
- `rm -rf .next` before `npx tsc --noEmit` (stale route type stubs otherwise).
- Test failures are compared as sets against `planning/baseline-test-failures.txt` (the command is in `00-overview-and-preflight.md`); counts are meaningless.
- `scripts/backups/` and `.env*` are never staged.

## Start

```bash
git checkout main && git pull
git checkout -b chunk-06-projects-redesign
```

## Deviations from the spec (decided while writing this plan)

| Spec says                                                            | Plan does                                                                                                                                                                           | Why                                                                                                                                                                                            |
| -------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| The one-featured-per-type rule lives in `content/projects/index.ts`. | It lives in `src/lib/projects/select.ts` and runs in `src/lib/projects/index.ts` at module init.                                                                                    | `content/projects/index.ts` is a plain import map with no access to parsed projects. The loader is where every page imports from, so a violation still fails `next build` and `content:check`. |
| `ProjectRow.test`: `reverse` flips DOM order.                        | `reverse` adds `lg:order-last` to the image; DOM order stays image-then-text. The test asserts that class.                                                                          | Flipping DOM order would put text above the image on mobile for every other row.                                                                                                               |
| `page.tsx` passes `getFeaturedProject('professional')!`.             | Both results are guarded; the section is omitted if either group is empty.                                                                                                          | An empty group should not crash the build.                                                                                                                                                     |
| Header nav href becomes `/projects/professional`.                    | Same, plus an `activePrefix: "/projects"` on the nav item so "Projects" stays underlined on `/projects/personal` and `/projects/<slug>`.                                            | `Header` marks items active with `pathname.includes(item.href)`; without the prefix the personal page would show no active item.                                                               |
| Chunk 07's prerequisite list names `ProjectLinks` from chunk 06.     | `ProjectLinks` is not built here (the card has no direct links). Task 8 notes this in `07-projects-detail-redesign.md`.                                                             | Spec drops it from the card; YAGNI.                                                                                                                                                            |
| Spec leaves room for an archived project in this chunk.              | No content is added. None of the four existing projects is archived; the owner will add new projects (some Archived) after the redesign ships, using the schema this chunk defines. | Owner's decision, 2026-10-31.                                                                                                                                                                  |

## File structure

| Path                                                                                      | Change               | Responsibility                                                                             |
| ----------------------------------------------------------------------------------------- | -------------------- | ------------------------------------------------------------------------------------------ |
| `src/types/project.ts`                                                                    | Modify               | New `PROJECT_TYPES`, `PROJECT_STATUSES`.                                                   |
| `src/lib/projects/select.ts`                                                              | **Create**           | Pure: `pickFeatured`, `assertOneFeaturedPerType`.                                          |
| `src/lib/projects/index.ts`                                                               | Modify               | `getProjectsByType(type)`, `getFeaturedProject(type)`, run the featured rule.              |
| `src/__tests__/lib/projectSchema.test.ts`, `projects.test.ts`                             | Modify               | New values; per-type API.                                                                  |
| `src/__tests__/lib/projectSelect.test.ts`                                                 | **Create**           | Featured fallback and the rule.                                                            |
| `content/projects/*.json`                                                                 | Modify               | `type`, `status`, `featured` per the spec table.                                           |
| `src/components/content/projects/groups.ts`                                               | **Create**           | `PROJECT_GROUPS`, `GROUP_ORDER`: labels, headings, intros, hrefs, accent classes per type. |
| `src/components/content/projects/ProjectImage.tsx`                                        | **Create**           | `next/image` with content width/height/blur. Server-safe.                                  |
| `src/components/content/projects/TechChips.tsx`                                           | **Create**           | `<ul>` of chips with `max` + "+N more"; `stackItems()` flattener. Server-safe.             |
| `src/components/ui/Badge.tsx`, `src/__tests__/components/ui/Badge.test.tsx`               | Rewrite both         | Status colours only; behaviour tests.                                                      |
| `src/components/layout/section/SectionHeading.tsx` + test                                 | Modify               | `as?: 'h1' \| 'h2'`.                                                                       |
| `src/components/layout/section/index.tsx`                                                 | Modify               | Apply `className`.                                                                         |
| `src/__tests__/setup.ts`                                                                  | Modify               | framer-motion mock gains `li`, `ul`, `article`, `section`, `useInView`.                    |
| `src/components/content/projects/ProjectCard.tsx`                                         | **Rewrite**          | Editorial card. Server-safe.                                                               |
| `src/components/content/projects/ProjectGrid.tsx`                                         | **Create**           | `<ul>` grid, `priorityCount`. Server-safe.                                                 |
| `src/components/content/projects/ProjectRow.tsx`                                          | **Create**           | Home editorial row. Server-safe.                                                           |
| `src/components/content/projects/ProjectTabs.tsx`                                         | **Create** (client)  | Two tabs, `aria-current`.                                                                  |
| `src/components/content/projects/index.tsx`                                               | **Rewrite** (client) | Home section `{ professional, personal }`.                                                 |
| `src/components/content/projects/ProjectsGrid.tsx`, `src/utils/functions/animations.ts`   | **Delete**           | Old waterfall grid.                                                                        |
| `src/__tests__/components/content/projects/{ProjectCard,ProjectRow,ProjectTabs}.test.tsx` | **Create**           |                                                                                            |
| `src/app/(app)/projects/professional/page.tsx`, `personal/page.tsx`                       | **Create**           | Group pages.                                                                               |
| `src/app/(app)/projects/page.tsx`, `web/page.tsx`, `native/page.tsx`                      | **Delete**           | Replaced by redirects.                                                                     |
| `src/app/(app)/projects/layout.tsx`                                                       | **Rewrite** (server) | Container only.                                                                            |
| `src/app/(app)/page.tsx`                                                                  | Modify               | Pass the two featured projects.                                                            |
| `src/app/(app)/sitemap.ts`                                                                | Modify               | Two group routes.                                                                          |
| `next.config.ts`                                                                          | Modify               | Three redirects.                                                                           |
| `src/utils/hooks/useNavigation.ts`, `src/components/layout/Header.tsx`                    | Modify               | Nav href + `activePrefix`.                                                                 |
| `planning/*`                                                                              | Modify               | Baseline, README ticks, notes to 07 and 08, hand-off log.                                  |

---

### Task 1: Content model, loader API, content edits (TDD)

**Files:**

- Modify: `src/types/project.ts:5-6`
- Create: `src/lib/projects/select.ts`
- Modify: `src/lib/projects/index.ts`
- Modify: `src/__tests__/lib/projectSchema.test.ts`, `src/__tests__/lib/projects.test.ts`
- Create: `src/__tests__/lib/projectSelect.test.ts`
- Modify: `content/projects/calgary-folk-fest.json`, `vista-crossing.json`, `homechef-companion.json`, `tedana-app.json`

- [ ] **Step 1: Update the schema test for the new values**

In `src/__tests__/lib/projectSchema.test.ts` change the fixture's type (line 8) and add value cases:

```ts
const valid = {
  slug: 'demo-app',
  name: 'Demo App',
  type: 'professional',
  status: 'Prototype',
  // …rest unchanged
```

Replace the two `it.each` rows `['bad type', …]` and `['bad status', …]` with:

```ts
    ['bad type', { ...valid, type: 'desktop' }],
    ['old type web', { ...valid, type: 'web' }],
    ['old type native', { ...valid, type: 'native' }],
    ['bad status', { ...valid, status: 'Done' }],
    ['old status Professional', { ...valid, status: 'Professional' }],
```

Add after the `it.each` block:

```ts
it.each(["professional", "personal"])("accepts type %s", (type) => {
  expect(parseProject({ ...valid, type }, "x").type).toBe(type);
});

it.each(["In Progress", "Prototype", "Live", "Archived"])(
  "accepts status %s",
  (status) => {
    expect(parseProject({ ...valid, status }, "x").status).toBe(status);
  },
);
```

- [ ] **Step 2: Write the select tests**

```ts
// src/__tests__/lib/projectSelect.test.ts
import { describe, it, expect } from "vitest";
import { assertOneFeaturedPerType, pickFeatured } from "@/lib/projects/select";
import { ProjectValidationError } from "@/lib/projects/schema";
import type { Project } from "@/types";

const make = (
  slug: string,
  type: Project["type"],
  featured: boolean,
  order: number,
) => ({ slug, type, featured, order }) as Project;

describe("pickFeatured", () => {
  it("returns the featured project when one exists", () => {
    const list = [
      make("a", "personal", false, 1),
      make("b", "personal", true, 2),
    ];
    expect(pickFeatured(list)?.slug).toBe("b");
  });

  it("falls back to the first entry (lowest order) when none is featured", () => {
    const list = [
      make("a", "personal", false, 1),
      make("b", "personal", false, 2),
    ];
    expect(pickFeatured(list)?.slug).toBe("a");
  });

  it("returns undefined for an empty list", () => {
    expect(pickFeatured([])).toBeUndefined();
  });
});

describe("assertOneFeaturedPerType", () => {
  it("accepts one featured per type", () => {
    expect(() =>
      assertOneFeaturedPerType([
        make("a", "professional", true, 1),
        make("b", "personal", true, 2),
        make("c", "personal", false, 3),
      ]),
    ).not.toThrow();
  });

  it("accepts a type with no featured project", () => {
    expect(() =>
      assertOneFeaturedPerType([make("a", "professional", false, 1)]),
    ).not.toThrow();
  });

  it("rejects two featured in the same type and names both files", () => {
    expect(() =>
      assertOneFeaturedPerType([
        make("a", "personal", true, 1),
        make("b", "personal", true, 2),
      ]),
    ).toThrow(ProjectValidationError);
    expect(() =>
      assertOneFeaturedPerType([
        make("a", "personal", true, 1),
        make("b", "personal", true, 2),
      ]),
    ).toThrow(/content\/projects\/b\.json: featured .*"a"/);
  });
});
```

- [ ] **Step 3: Update the loader tests**

In `src/__tests__/lib/projects.test.ts` replace the import block and the `has exactly one featured project` and `getFeaturedProject returns the featured one` tests:

```ts
import {
  getAdjacentProjects,
  getFeaturedProject,
  getProjectBySlug,
  getProjectSlugs,
  getProjects,
  getProjectsByType,
} from "@/lib/projects";
import { PROJECT_TYPES } from "@/types";
```

```ts
it("has at most one featured project per type", () => {
  for (const type of PROJECT_TYPES) {
    expect(
      getProjectsByType(type).filter((p) => p.featured).length,
    ).toBeLessThanOrEqual(1);
  }
});

it("has at least one project in every type (the home page shows one per group)", () => {
  for (const type of PROJECT_TYPES) {
    expect(getProjectsByType(type).length, type).toBeGreaterThan(0);
  }
});
```

```ts
it("getProjectsByType filters and keeps order ascending", () => {
  for (const type of PROJECT_TYPES) {
    const list = getProjectsByType(type);
    expect(list.every((p) => p.type === type)).toBe(true);
    const orders = list.map((p) => p.order);
    expect(orders).toEqual([...orders].sort((x, y) => x - y));
  }
});

it("getFeaturedProject returns a project of the requested type", () => {
  for (const type of PROJECT_TYPES) {
    expect(getFeaturedProject(type)?.type).toBe(type);
  }
});
```

Check that `src/types/index.ts` re-exports `PROJECT_TYPES` (`grep -n PROJECT_TYPES src/types/index.ts`); if it only re-exports types, add `export * from './project'` or the named constant.

- [ ] **Step 4: Run, expect failures**

Run: `npx vitest run src/__tests__/lib`
Expected: FAIL. `projectSchema` rejects `professional`; `projectSelect` cannot resolve `@/lib/projects/select`; `projects.test` has no `getProjectsByType`.

- [ ] **Step 5: Change the constants**

`src/types/project.ts` lines 5–6:

```ts
export const PROJECT_TYPES = ["professional", "personal"] as const;
export const PROJECT_STATUSES = [
  "In Progress",
  "Prototype",
  "Live",
  "Archived",
] as const;
```

- [ ] **Step 6: Create `select.ts`**

```ts
// src/lib/projects/select.ts
// Pure helpers over an already-parsed, order-sorted project list. No Next imports.
import { ProjectValidationError } from "./schema";
import type { Project, ProjectType } from "../../types/project";

/** The `featured` project, else the first entry. Callers pass a list sorted by `order`. */
export function pickFeatured(
  projects: readonly Project[],
): Project | undefined {
  return projects.find((p) => p.featured) ?? projects[0];
}

/** At most one `featured: true` per `type`. Throws so `next build` and `content:check` fail on a violation. */
export function assertOneFeaturedPerType(projects: readonly Project[]): void {
  const seen = new Map<ProjectType, string>();
  for (const p of projects) {
    if (!p.featured) continue;
    const prev = seen.get(p.type);
    if (prev !== undefined) {
      throw new ProjectValidationError(
        `content/projects/${p.slug}.json`,
        "featured",
        `is already true for ${p.type} project "${prev}"; at most one featured project per type`,
      );
    }
    seen.set(p.type, p.slug);
  }
}
```

- [ ] **Step 7: Update the loader**

`src/lib/projects/index.ts` becomes:

```ts
// src/lib/projects/index.ts
// Single source of project content for the site. Reads the static import map in
// content/projects/index.ts, validates every file once at module init (a bad file
// fails `next build`), and exposes a tiny synchronous API. No Next imports.
import { projectFiles } from "../../../content/projects";
import { parseProject } from "./schema";
import { assertOneFeaturedPerType, pickFeatured } from "./select";
import type { Project, ProjectType } from "../../types/project";

const PROJECTS: readonly Project[] = Object.entries(projectFiles)
  .map(([slug, raw]) =>
    parseProject(raw, `content/projects/${slug}.json`, slug),
  )
  .sort((a, b) => a.order - b.order || a.name.localeCompare(b.name));

assertOneFeaturedPerType(PROJECTS);

export function getProjects(): Project[] {
  return [...PROJECTS];
}

export function getProjectSlugs(): string[] {
  return PROJECTS.map((p) => p.slug);
}

export function getProjectBySlug(slug: string): Project | undefined {
  return PROJECTS.find((p) => p.slug === slug);
}

/** All projects of one type, sorted by `order`. */
export function getProjectsByType(type: ProjectType): Project[] {
  return PROJECTS.filter((p) => p.type === type);
}

/** The type's `featured` project, else its lowest `order`; `undefined` only for an empty type. */
export function getFeaturedProject(type: ProjectType): Project | undefined {
  return pickFeatured(getProjectsByType(type));
}

export function getAdjacentProjects(slug: string): {
  prev: Project | null;
  next: Project | null;
} {
  const i = PROJECTS.findIndex((p) => p.slug === slug);
  if (i === -1) return { prev: null, next: null };
  return { prev: PROJECTS[i - 1] ?? null, next: PROJECTS[i + 1] ?? null };
}

export { parseProject, ProjectValidationError } from "./schema";
```

- [ ] **Step 8: Edit the content files**

Each file's header block changes as follows (only these keys; everything else stays).

`content/projects/calgary-folk-fest.json`:

```json
  "type": "professional",
  "status": "Live",
  "featured": true,
  "order": 2,
```

`content/projects/vista-crossing.json`:

```json
  "type": "professional",
  "status": "Live",
  "featured": false,
  "order": 4,
```

`content/projects/homechef-companion.json`:

```json
  "type": "personal",
  "status": "In Progress",
  "featured": true,
  "order": 1,
```

`content/projects/tedana-app.json`:

```json
  "type": "personal",
  "status": "Prototype",
  "featured": false,
  "order": 3,
```

- [ ] **Step 9: Run, expect pass**

Run: `npm run content:check` (alias for `vitest run src/__tests__/lib`)
Expected: PASS, all three lib test files (`projectSchema`, `projectSelect`, `projects`). `npx tsc --noEmit` will now report two errors, in `web/page.tsx` and `native/page.tsx` (`project.type === "web"` has no overlap with the new union). Both files are deleted in Task 6; do not patch them here. `Badge.tsx` still compiles because its `status` prop is widened to `string`.

- [ ] **Step 10: Commit**

```bash
git add src/types/project.ts src/lib/projects/select.ts src/lib/projects/index.ts src/__tests__/lib content/projects/*.json
git commit -m "feat(projects): professional/personal types, Live/Archived statuses, per-type featured" -m "Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

### Task 2: Group constants and the framer-motion mock

**Files:**

- Create: `src/components/content/projects/groups.ts`
- Modify: `src/__tests__/setup.ts:37-46`

- [ ] **Step 1: Create `groups.ts`**

```ts
// src/components/content/projects/groups.ts
// Everything the UI needs to know about a project type, in one place. Server-safe.
// Tailwind classes are complete literals so the content scanner keeps them.
import type { ProjectType } from "@/types";

export interface ProjectGroup {
  type: ProjectType;
  /** Eyebrow and tab text */
  label: string;
  /** Page h1 */
  heading: string;
  /** One-line intro under the h1 (owner copy) */
  intro: string;
  href: string;
  /** Secondary CTA text on the home row */
  allLabel: string;
  /** Eyebrow text colour */
  accentText: string;
  /** Active tab underline */
  accentBorder: string;
}

export const PROJECT_GROUPS: Record<ProjectType, ProjectGroup> = {
  professional: {
    type: "professional",
    label: "Professional",
    heading: "Professional work",
    intro: "Sites and apps I've built for clients and employers.",
    href: "/projects/professional",
    allLabel: "All professional work",
    accentText: "text-secondary-900 dark:text-secondary-400",
    accentBorder: "border-secondary-800 dark:border-secondary-400",
  },
  personal: {
    type: "personal",
    label: "Personal",
    heading: "Personal projects",
    intro: "Side projects and prototypes where I try things out.",
    href: "/projects/personal",
    allLabel: "All personal projects",
    accentText: "text-primary-700 dark:text-primary-400",
    accentBorder: "border-primary dark:border-primary-400",
  },
};

/** Display order: professional first. */
export const GROUP_ORDER: readonly ProjectType[] = ["professional", "personal"];
```

Note: the bare `secondary` token is grey in `globals.css`; the teal lives in the numbered `secondary-*` shades, hence the numbered classes. Light-mode text uses `secondary-900` and `primary-700` (and the tab border `secondary-800`) because `secondary-700` (about 2.9:1) and bare `primary` (about 3.7:1) fall short of the 4.5:1 contrast needed for small uppercase text on the light background.

- [ ] **Step 2: Extend the framer-motion mock**

Replace lines 37–46 of `src/__tests__/setup.ts` with:

```ts
// Mock framer-motion to avoid animation issues in tests
vi.mock("framer-motion", () => ({
  motion: {
    div: "div",
    span: "span",
    a: "a",
    button: "button",
    li: "li",
    ul: "ul",
    article: "article",
    section: "section",
  },
  AnimatePresence: ({ children }: { children: React.ReactNode }) => children,
  useInView: () => true,
}));
```

- [ ] **Step 3: Run the whole suite once to confirm nothing new fails from the mock change**

```bash
npx vitest run --reporter=json --outputFile=.vitest-current.json >/dev/null 2>&1 || true
node -e '
const r=require("./.vitest-current.json");const out=[];
for(const f of r.testResults)for(const t of f.assertionResults)if(t.status==="failed")out.push(f.name.replace(process.cwd()+"/","")+" :: "+t.fullName);
console.log(out.sort().join("\n"))' > .vitest-current.txt
comm -13 planning/baseline-test-failures.txt .vitest-current.txt
rm .vitest-current.json .vitest-current.txt
```

Expected: the `comm` line prints nothing. The old Badge tests still pass at this point because `Badge.tsx` is untouched until Task 3. Anything printed is a regression to fix before continuing.

- [ ] **Step 4: Commit**

```bash
git add src/components/content/projects/groups.ts src/__tests__/setup.ts
git commit -m "feat(projects): group constants; framer-motion mock covers list and article elements" -m "Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

### Task 3: Primitives: `ProjectImage`, `TechChips`, `Badge`, `SectionHeading as`, `Section className` (TDD for Badge and SectionHeading)

**Files:**

- Create: `src/components/content/projects/ProjectImage.tsx`, `src/components/content/projects/TechChips.tsx`
- Rewrite: `src/components/ui/Badge.tsx`, `src/__tests__/components/ui/Badge.test.tsx`
- Modify: `src/components/layout/section/SectionHeading.tsx`, `src/__tests__/components/layout/section/SectionHeading.test.tsx`
- Modify: `src/components/layout/section/index.tsx`

- [ ] **Step 1: Rewrite the Badge test to behaviour**

Replace the whole of `src/__tests__/components/ui/Badge.test.tsx`:

```tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@/test-utils";
import { Badge } from "@/components/ui/Badge";
import { PROJECT_STATUSES } from "@/types";

describe("Badge", () => {
  it("renders the status text in a span", () => {
    render(<Badge status='In Progress' />);
    const badge = screen.getByText("In Progress");
    expect(badge.tagName).toBe("SPAN");
  });

  it("renders an empty span without a status", () => {
    const { container } = render(<Badge />);
    expect(container.querySelector("span")).toBeEmptyDOMElement();
  });

  it("applies a custom className", () => {
    render(<Badge status='Live' className='custom-badge' />);
    expect(screen.getByText("Live")).toHaveClass("custom-badge");
    expect(screen.getByText("Live").className).not.toContain("undefined");
  });

  it("gives every known status a distinct colour treatment", () => {
    render(
      <div>
        {PROJECT_STATUSES.map((s) => (
          <Badge key={s} status={s} />
        ))}
      </div>,
    );
    const classes = PROJECT_STATUSES.map((s) => screen.getByText(s).className);
    expect(new Set(classes).size).toBe(PROJECT_STATUSES.length);
  });

  it("styles unknown values neutrally but still renders them", () => {
    render(<Badge status='Something Else' />);
    const badge = screen.getByText("Something Else");
    expect(badge.className).toMatch(/bg-/);
    expect(badge.className).toMatch(/text-/);
  });

  it("includes a dark-mode variant for every status", () => {
    for (const s of PROJECT_STATUSES) {
      const { unmount } = render(<Badge status={s} />);
      expect(screen.getByText(s).className).toMatch(/dark:/);
      unmount();
    }
  });
});
```

- [ ] **Step 2: Add the `as="h1"` case to the SectionHeading test**

Append inside the top-level `describe` of `src/__tests__/components/layout/section/SectionHeading.test.tsx`:

```tsx
describe("Heading level", () => {
  it('renders an h1 when as="h1"', () => {
    render(<SectionHeading title='Professional work' as='h1' />);
    const heading = screen.getByRole("heading", { level: 1 });
    expect(heading.tagName).toBe("H1");
    expect(heading).toHaveTextContent("Professional work");
    expect(screen.queryByRole("heading", { level: 2 })).toBeNull();
  });
});
```

- [ ] **Step 3: Run, expect failures**

Run: `npx vitest run src/__tests__/components/ui/Badge.test.tsx src/__tests__/components/layout/section/SectionHeading.test.tsx`
Expected: Badge "distinct colour" fails (`Live` and `Archived` fall to the same default) and "dark-mode variant" fails; SectionHeading `as="h1"` fails (still renders `h2`).

- [ ] **Step 4: Rewrite `Badge`**

```tsx
// src/components/ui/Badge.tsx
import React from "react";
import { cn } from "@/lib/utils";
import type { ProjectStatus } from "@/types";

type BadgeProps = {
  status?: ProjectStatus | string;
  className?: string;
};

const STATUS_CLASSES: Record<ProjectStatus, string> = {
  Live: "bg-emerald-100 text-emerald-900 dark:bg-emerald-900/40 dark:text-emerald-200",
  "In Progress":
    "bg-amber-100 text-amber-900 dark:bg-amber-900/40 dark:text-amber-200",
  Prototype: "bg-sky-100 text-sky-900 dark:bg-sky-900/40 dark:text-sky-200",
  Archived: "bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-100",
};
const DEFAULT_CLASSES =
  "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100";

function isKnownStatus(value: string): value is ProjectStatus {
  // hasOwnProperty, not `in`: "constructor" and friends must not match prototype keys
  return Object.prototype.hasOwnProperty.call(STATUS_CLASSES, value);
}

export function Badge({ status, className }: BadgeProps) {
  const label = status === undefined || status === null ? "" : String(status);
  const colour = isKnownStatus(label) ? STATUS_CLASSES[label] : DEFAULT_CLASSES;
  return (
    <span
      className={cn(
        "inline-block rounded-full px-2 py-1 text-xs font-medium",
        colour,
        className,
      )}
    >
      {label}
    </span>
  );
}
```

- [ ] **Step 5: `SectionHeading` `as` prop**

```tsx
// src/components/layout/section/SectionHeading.tsx
"use client";
import React from "react";
import { AnimatedSection, itemVariants } from "./AnimatedSection";
import { motion } from "framer-motion";

interface SectionHeadingProps {
  title: string;
  /** `h2` inside page sections (default); `h1` when the heading titles the page. */
  as?: "h1" | "h2";
}

export function SectionHeading({ title, as = "h2" }: SectionHeadingProps) {
  const Tag = as;
  return (
    <AnimatedSection>
      <motion.div
        className='relative mb-8 flex gap-4 items-center'
        variants={itemVariants}
      >
        <div className='w-8 lg:w-16 h-0.5 lg:h-1 rounded-full bg-primary'></div>
        <Tag className='inline-block text-2xl font-bold py-2 lg:px-4 uppercase tracking-wider'>
          {title}
        </Tag>
      </motion.div>
    </AnimatedSection>
  );
}
```

- [ ] **Step 6: `Section` applies `className`**

```tsx
// src/components/layout/section/index.tsx
import React from "react";
import { cn } from "@/lib/utils";
import { SectionHeading } from "./SectionHeading";

type Props = {
  id: string;
  title: string;
  children: React.ReactNode;
  className?: string;
};

export default function Section({ id, title, children, className }: Props) {
  return (
    <section id={id} className={cn("w-full max-w-4xl mb-16 pt-16", className)}>
      <SectionHeading title={title} />
      {children}
    </section>
  );
}
```

Two callers pass `className` today and have been silently ignored: `src/components/content/projects/index.tsx` (`"flex items-center flex-1"`, rewritten in Task 5) and `src/app/(app)/contact/page.tsx` (`"pt-32"`). `cn` uses `tailwind-merge`, so `pt-32` replaces `pt-16` on the contact page and the heading moves down by 4rem. Check `/contact` in the browser during Task 6 Step 9; if the extra space looks wrong, delete the `className="pt-32"` prop from `contact/page.tsx` in that task.

- [ ] **Step 7: `ProjectImage`**

```tsx
// src/components/content/projects/ProjectImage.tsx
import Image from "next/image";
import type { ProjectImage as ProjectImageData } from "@/types";

interface Props {
  image: ProjectImageData;
  /** Responsive `sizes` hint; required so next/image picks sensible srcset entries. */
  sizes: string;
  priority?: boolean;
  className?: string;
}

export function ProjectImage({
  image,
  sizes,
  priority = false,
  className,
}: Props) {
  return (
    <Image
      src={image.src}
      alt={image.alt}
      width={image.width}
      height={image.height}
      sizes={sizes}
      priority={priority}
      placeholder='blur'
      blurDataURL={image.blurDataURL}
      className={className}
    />
  );
}
```

- [ ] **Step 8: `TechChips`**

```tsx
// src/components/content/projects/TechChips.tsx
import { cn } from "@/lib/utils";
import type { TechStack } from "@/types";

interface Props {
  items: string[];
  /** Show at most this many; the rest collapse into "+N more". */
  max?: number;
  label?: string;
  className?: string;
}

/** Frontend, backend, other, in that order; deduplicated because the schema does not forbid repeats across groups. */
export function stackItems(stack: TechStack): string[] {
  return [...new Set([...stack.frontend, ...stack.backend, ...stack.other])];
}

export function TechChips({
  items,
  max,
  label = "Tech stack",
  className,
}: Props) {
  if (items.length === 0) return null;
  const shown = max ? items.slice(0, max) : items;
  const hidden = items.length - shown.length;
  return (
    <ul
      role='list'
      className={cn("flex flex-wrap gap-2", className)}
      aria-label={label}
    >
      {shown.map((item) => (
        <li
          key={item}
          className='rounded-full border border-gray-300 bg-secondary-bg px-2.5 py-0.5 text-xs font-medium text-foreground dark:border-gray-600'
        >
          {item}
        </li>
      ))}
      {hidden > 0 && (
        <li className='rounded-full px-2.5 py-0.5 text-xs font-medium text-gray-600 dark:text-gray-300'>
          +{hidden} more
        </li>
      )}
    </ul>
  );
}
```

Check `src/types/index.ts` exports `TechStack` and `ProjectImage` (`grep -n "TechStack\|ProjectImage" src/types/index.ts`); add them if missing.

- [ ] **Step 9: Run, expect pass; type-check**

Run: `npx vitest run src/__tests__/components/ui/Badge.test.tsx src/__tests__/components/layout/section`
Expected: PASS.

Run: `rm -rf .next && npx tsc --noEmit`
Expected: still only the two errors in `web/page.tsx` and `native/page.tsx` from Task 1. The old `ProjectCard.tsx` compiles against the new `Badge` because it passes strings. Fixed in Task 6.

- [ ] **Step 10: Commit**

```bash
git add src/components/ui/Badge.tsx src/__tests__/components/ui/Badge.test.tsx src/components/layout/section src/__tests__/components/layout/section/SectionHeading.test.tsx src/components/content/projects/ProjectImage.tsx src/components/content/projects/TechChips.tsx
git commit -m "feat(projects): ProjectImage and TechChips primitives; status-only Badge; SectionHeading as; Section className" -m "Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

### Task 4: `ProjectCard` and `ProjectGrid` (TDD)

**Files:**

- Rewrite: `src/components/content/projects/ProjectCard.tsx`
- Create: `src/components/content/projects/ProjectGrid.tsx`
- Create: `src/__tests__/components/content/projects/ProjectCard.test.tsx`
- Delete: `src/components/content/projects/ProjectsGrid.tsx`, `src/utils/functions/animations.ts`

- [ ] **Step 1: Failing test**

```tsx
// src/__tests__/components/content/projects/ProjectCard.test.tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { ProjectCard } from "@/components/content/projects/ProjectCard";
import type { Project } from "@/types";

const project: Project = {
  slug: "demo-app",
  name: "Demo App",
  type: "professional",
  status: "Live",
  featured: false,
  order: 1,
  description: "A demo project.",
  techStack: {
    frontend: ["Next.js", "Tailwind"],
    backend: ["Node"],
    other: ["Vercel", "Stripe"],
  },
  liveUrl: "https://demo.example.com",
  githubUrl: null,
  image: {
    src: "/projects/demo-app/demo.png",
    alt: "Demo screenshot",
    width: 1200,
    height: 900,
    blurDataURL: "data:image/webp;base64,AA==",
  },
  overview: "o",
  challenge: "c",
  solution: "s",
  keyTakeaways: ["k"],
};

// The eyebrow wraps its middle dot in an aria-hidden span, so match the <p> by full textContent
// (the default getByText matcher only reads an element's own text nodes).
const eyebrow = (text: string) =>
  screen.getByText((_, el) => el?.tagName === "P" && el.textContent === text);

describe("ProjectCard", () => {
  it("links the name to the project page and it is the only link", () => {
    render(<ProjectCard project={project} />);
    const links = screen.getAllByRole("link");
    expect(links).toHaveLength(1);
    expect(links[0]).toHaveAttribute("href", "/projects/demo-app");
    expect(links[0]).toHaveTextContent("Demo App");
    expect(
      screen.getByRole("heading", { level: 2, name: "Demo App" }),
    ).toBeInTheDocument();
  });

  it("shows group and status in one eyebrow line", () => {
    render(<ProjectCard project={project} />);
    expect(eyebrow("Professional · Live")).toBeInTheDocument();
  });

  it("shows the description and the image alt", () => {
    render(<ProjectCard project={project} />);
    expect(screen.getByText("A demo project.")).toBeInTheDocument();
    expect(screen.getByAltText("Demo screenshot")).toBeInTheDocument();
  });

  it("caps tech chips at three and counts the rest", () => {
    render(<ProjectCard project={project} />);
    const chips = screen.getByRole("list", { name: "Tech stack" });
    expect(chips.querySelectorAll("li")).toHaveLength(4); // 3 chips + "+2 more"
    expect(screen.getByText("+2 more")).toBeInTheDocument();
  });

  it("uses the personal accent for personal projects", () => {
    render(
      <ProjectCard
        project={{ ...project, type: "personal", status: "Prototype" }}
      />,
    );
    expect(eyebrow("Personal · Prototype").className).toContain("text-primary");
  });
});
```

- [ ] **Step 2: Run, expect failure**

Run: `npx vitest run src/__tests__/components/content/projects/ProjectCard.test.tsx`
Expected: FAIL. The old card renders two Badges and `getByText('Professional · Live')` finds nothing.

- [ ] **Step 3: Rewrite `ProjectCard`**

```tsx
// src/components/content/projects/ProjectCard.tsx
import Link from "next/link";
import { cn } from "@/lib/utils";
import type { Project } from "@/types";
import { PROJECT_GROUPS } from "./groups";
import { ProjectImage } from "./ProjectImage";
import { TechChips, stackItems } from "./TechChips";

interface Props {
  project: Project;
  /** Above-the-fold cards load eagerly. */
  priority?: boolean;
}

export function ProjectCard({ project, priority = false }: Props) {
  const group = PROJECT_GROUPS[project.type];
  return (
    <article className='group relative flex h-full flex-col gap-3 rounded-lg has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-primary has-[:focus-visible]:ring-offset-4 has-[:focus-visible]:ring-offset-background'>
      <div className='aspect-[4/3] overflow-hidden rounded-lg bg-secondary-bg shadow-sm transition-[transform,box-shadow] duration-300 ease-out group-hover:-translate-y-1 group-hover:shadow-lg motion-reduce:transition-none motion-reduce:group-hover:translate-y-0'>
        <ProjectImage
          image={project.image}
          sizes='(max-width: 767px) 100vw, (max-width: 1023px) 50vw, 33vw'
          priority={priority}
          className='h-full w-full object-cover'
        />
      </div>
      <p
        className={cn(
          "text-xs font-semibold uppercase tracking-widest",
          group.accentText,
        )}
      >
        {group.label}
        <span aria-hidden='true'> · </span>
        {project.status}
      </p>
      <h2 className='text-xl font-semibold leading-snug'>
        <Link
          href={`/projects/${project.slug}`}
          className="focus:outline-none after:absolute after:inset-0 after:content-['']"
        >
          {project.name}
        </Link>
      </h2>
      <p className='line-clamp-2 text-gray-600 dark:text-gray-300'>
        {project.description}
      </p>
      <TechChips
        items={stackItems(project.techStack)}
        max={3}
        className='mt-auto pt-1'
      />
    </article>
  );
}
```

The `after:absolute after:inset-0` pseudo-element on the name link stretches the hit area over the whole card while keeping one focusable element; `has-[:focus-visible]:ring` on the article shows keyboard focus only (plain `focus-within` would flash the ring on mouse clicks in Chromium). The heading is an `h2` because the card renders on the group pages directly under the page `h1`. The middle dot is `aria-hidden` so screen readers do not announce it. The hover lift is on the image box (`group-hover:-translate-y-1`) and switched off under `motion-reduce:`.

- [ ] **Step 4: Create `ProjectGrid`**

```tsx
// src/components/content/projects/ProjectGrid.tsx
import type { Project } from "@/types";
import { ProjectCard } from "./ProjectCard";

interface Props {
  projects: Project[];
  /** How many leading cards load their image eagerly. */
  priorityCount?: number;
}

export function ProjectGrid({ projects, priorityCount = 0 }: Props) {
  if (projects.length === 0) {
    return (
      <p className='py-12 text-center text-gray-600 dark:text-gray-300'>
        Nothing here yet.
      </p>
    );
  }
  return (
    <ul
      role='list'
      className='grid grid-cols-1 gap-x-6 gap-y-10 md:grid-cols-2 lg:grid-cols-3'
    >
      {projects.map((project, i) => (
        <li key={project.slug}>
          <ProjectCard project={project} priority={i < priorityCount} />
        </li>
      ))}
    </ul>
  );
}
```

- [ ] **Step 5: Run, expect pass; delete the old grid**

Run: `npx vitest run src/__tests__/components/content/projects/ProjectCard.test.tsx`
Expected: PASS.

```bash
git rm src/components/content/projects/ProjectsGrid.tsx src/utils/functions/animations.ts
grep -rn "calculateWaterfallDelay\|functions/animations" src   # expect: nothing
```

`animations.ts` is the only file in `src/utils/functions/` and there is no index there, so the folder disappears with it.

- [ ] **Step 6: Commit**

```bash
git add -A src/components/content/projects src/utils src/__tests__/components/content
git commit -m "feat(projects): editorial ProjectCard and ProjectGrid; drop waterfall grid" -m "Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

(`npx tsc --noEmit` still fails on the three old pages importing `ProjectsGrid`; Task 6 deletes them.)

### Task 5: `ProjectRow`, `ProjectTabs`, home section (TDD)

**Files:**

- Create: `src/components/content/projects/ProjectRow.tsx`, `src/components/content/projects/ProjectTabs.tsx`
- Rewrite: `src/components/content/projects/index.tsx`
- Create: `src/__tests__/components/content/projects/ProjectRow.test.tsx`, `ProjectTabs.test.tsx`

- [ ] **Step 1: Failing `ProjectRow` test**

```tsx
// src/__tests__/components/content/projects/ProjectRow.test.tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { ProjectRow } from "@/components/content/projects/ProjectRow";
import type { Project } from "@/types";

const project: Project = {
  slug: "demo-app",
  name: "Demo App",
  type: "personal",
  status: "In Progress",
  featured: true,
  order: 1,
  description: "A demo project.",
  techStack: { frontend: ["Next.js"], backend: [], other: [] },
  liveUrl: null,
  githubUrl: null,
  image: {
    src: "/projects/demo-app/demo.png",
    alt: "Demo screenshot",
    width: 1200,
    height: 900,
    blurDataURL: "data:image/webp;base64,AA==",
  },
  overview: "o",
  challenge: "c",
  solution: "s",
  keyTakeaways: ["k"],
};

describe("ProjectRow", () => {
  it("links to the project and to its group page", () => {
    render(<ProjectRow project={project} />);
    expect(screen.getByRole("link", { name: /View project/ })).toHaveAttribute(
      "href",
      "/projects/demo-app",
    );
    expect(
      screen.getByRole("link", { name: "All personal projects" }),
    ).toHaveAttribute("href", "/projects/personal");
  });

  it("shows the group eyebrow, name, status badge, description and image", () => {
    render(<ProjectRow project={project} />);
    expect(screen.getByText("Personal")).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { level: 3, name: "Demo App" }),
    ).toBeInTheDocument();
    expect(screen.getByText("In Progress")).toBeInTheDocument();
    expect(screen.getByText("A demo project.")).toBeInTheDocument();
    expect(screen.getByAltText("Demo screenshot")).toBeInTheDocument();
  });

  it("keeps the image first in the DOM and moves it right with a CSS order class when reversed", () => {
    const { container, rerender } = render(<ProjectRow project={project} />);
    const imageBox = () => container.querySelector("img")!.parentElement!;
    expect(imageBox().className).not.toContain("lg:order-last");
    rerender(<ProjectRow project={project} reverse />);
    expect(imageBox().className).toContain("lg:order-last");
    expect(container.querySelector("article")!.firstElementChild).toBe(
      imageBox(),
    );
  });
});
```

- [ ] **Step 2: Failing `ProjectTabs` test**

The global `next/navigation` mock returns `/` from `usePathname`; this test overrides it per case.

```tsx
// src/__tests__/components/content/projects/ProjectTabs.test.tsx
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";

let pathname = "/projects/professional";
vi.mock("next/navigation", () => ({
  usePathname: () => pathname,
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    refresh: vi.fn(),
  }),
  useSearchParams: () => new URLSearchParams(),
  useParams: () => ({}),
}));

import { ProjectTabs } from "@/components/content/projects/ProjectTabs";

describe("ProjectTabs", () => {
  beforeEach(() => {
    pathname = "/projects/professional";
  });

  it("renders both group tabs with their hrefs", () => {
    render(<ProjectTabs />);
    expect(screen.getByRole("link", { name: "Professional" })).toHaveAttribute(
      "href",
      "/projects/professional",
    );
    expect(screen.getByRole("link", { name: "Personal" })).toHaveAttribute(
      "href",
      "/projects/personal",
    );
  });

  it("marks the current page with aria-current", () => {
    render(<ProjectTabs />);
    expect(screen.getByRole("link", { name: "Professional" })).toHaveAttribute(
      "aria-current",
      "page",
    );
    expect(screen.getByRole("link", { name: "Personal" })).not.toHaveAttribute(
      "aria-current",
    );
  });

  it("follows the pathname", () => {
    pathname = "/projects/personal";
    render(<ProjectTabs />);
    expect(screen.getByRole("link", { name: "Personal" })).toHaveAttribute(
      "aria-current",
      "page",
    );
    expect(
      screen.getByRole("link", { name: "Professional" }),
    ).not.toHaveAttribute("aria-current");
  });

  it("labels the navigation", () => {
    render(<ProjectTabs />);
    expect(
      screen.getByRole("navigation", { name: "Project groups" }),
    ).toBeInTheDocument();
  });
});
```

- [ ] **Step 3: Run, expect failure**

Run: `npx vitest run src/__tests__/components/content/projects`
Expected: `ProjectRow.test` and `ProjectTabs.test` fail to resolve their modules; `ProjectCard.test` still passes.

- [ ] **Step 4: Create `ProjectRow`**

```tsx
// src/components/content/projects/ProjectRow.tsx
import { Badge } from "@/components/ui/Badge";
import { CTAButton } from "@/components/ui/CTAButton";
import { cn } from "@/lib/utils";
import type { Project } from "@/types";
import { PROJECT_GROUPS } from "./groups";
import { ProjectImage } from "./ProjectImage";

interface Props {
  project: Project;
  /** Put the image on the right at `lg`. DOM order is unchanged so mobile always stacks image-then-text. */
  reverse?: boolean;
}

export function ProjectRow({ project, reverse = false }: Props) {
  const group = PROJECT_GROUPS[project.type];
  return (
    <article className='grid grid-cols-1 items-center gap-6 lg:grid-cols-5 lg:gap-10'>
      <div
        className={cn(
          "overflow-hidden rounded-lg bg-secondary-bg shadow-sm lg:col-span-3",
          reverse && "lg:order-last",
        )}
      >
        <ProjectImage
          image={project.image}
          sizes='(max-width: 1023px) 100vw, 600px'
          className='h-full w-full object-cover'
        />
      </div>
      <div className='flex flex-col gap-4 lg:col-span-2'>
        <p
          className={cn(
            "text-xs font-semibold uppercase tracking-widest",
            group.accentText,
          )}
        >
          {group.label}
        </p>
        <div className='flex flex-wrap items-center gap-3'>
          <h3 className='text-2xl font-bold lg:text-3xl'>{project.name}</h3>
          <Badge status={project.status} />
        </div>
        <p className='text-gray-700 dark:text-gray-200 lg:text-lg'>
          {project.description}
        </p>
        <div className='mt-2 flex flex-col gap-3 sm:flex-row lg:flex-col'>
          <CTAButton href={`/projects/${project.slug}`}>
            View project<span className='sr-only'> {project.name}</span>
          </CTAButton>
          <CTAButton type='secondary' href={group.href}>
            {group.allLabel}
          </CTAButton>
        </div>
      </div>
    </article>
  );
}
```

`CTAButton` is a client component; importing it from a server-safe file is fine (it becomes a client boundary). The CTAs stack again from `lg` because the text column is only about 386px wide there (the section is capped at `max-w-5xl`) and `CTAButton`'s `lg:px-16` padding would squash two side-by-side buttons onto two or three lines. The visually hidden project name makes the two "View project" links distinguishable in a screen reader's links list. The row image is not `priority`: both rows sit below the hero and about sections, so preloading them would compete with the hero's largest-contentful-paint image. The `600px` hint matches the image column (3/5 of the `max-w-5xl` section).

- [ ] **Step 5: Create `ProjectTabs`**

```tsx
// src/components/content/projects/ProjectTabs.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { GROUP_ORDER, PROJECT_GROUPS } from "./groups";

export function ProjectTabs() {
  const pathname = usePathname();
  return (
    <nav
      aria-label='Project groups'
      className='mb-8 border-b border-gray-200 pt-16 dark:border-gray-700'
    >
      <ul role='list' className='-mb-px flex gap-6'>
        {GROUP_ORDER.map((type) => {
          const group = PROJECT_GROUPS[type];
          const active = pathname === group.href;
          return (
            <li key={type}>
              <Link
                href={group.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "focus-ring inline-block border-b-2 px-1 pb-3 text-sm font-medium tracking-wider transition-colors",
                  active
                    ? cn("text-foreground", group.accentBorder)
                    : "border-transparent text-gray-500 hover:border-gray-300 hover:text-foreground dark:text-gray-400 dark:hover:border-gray-600 dark:hover:text-foreground",
                )}
              >
                {group.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
```

`pt-16` here replaces the `pt-16` the old layout put on its tab nav, so the detail page (which has no tabs) keeps its current spacing. The explicit `dark:hover:` classes are needed because `dark:text-gray-400` has the same specificity as `hover:text-foreground` and is emitted later, so without them inactive tabs would not react to hover in dark mode.

- [ ] **Step 6: Rewrite the home section**

```tsx
// src/components/content/projects/index.tsx
"use client";

import { motion } from "framer-motion";
import Section from "../../layout/section";
import {
  AnimatedSection,
  itemVariants,
} from "../../layout/section/AnimatedSection";
import type { Project } from "@/types";
import { ProjectRow } from "./ProjectRow";

interface ProjectsProps {
  professional: Project;
  personal: Project;
}

export function Projects({ professional, personal }: ProjectsProps) {
  return (
    <Section
      id='projects'
      title='Recent Work'
      className='max-w-5xl px-4 xl:px-0'
    >
      <div className='flex flex-col gap-16 lg:gap-24'>
        <AnimatedSection>
          <motion.div variants={itemVariants}>
            <ProjectRow project={professional} />
          </motion.div>
        </AnimatedSection>
        <AnimatedSection>
          <motion.div variants={itemVariants}>
            <ProjectRow project={personal} reverse />
          </motion.div>
        </AnimatedSection>
      </div>
    </Section>
  );
}
```

Each row gets its own `AnimatedSection` rather than sharing one: `AnimatedSection` triggers at 30% visibility, and a single wrapper around both rows is 1100–1400px tall on phones, so on a landscape phone it could never reach 30% and the rows would stay invisible. `xl:px-0` rather than `md:px-0` keeps side padding until the viewport is wider than the `max-w-5xl` section.

- [ ] **Step 7: Run, expect pass**

Run: `npx vitest run src/__tests__/components/content/projects`
Expected: PASS, three files.

- [ ] **Step 8: Commit**

```bash
git add src/components/content/projects src/__tests__/components/content/projects
git commit -m "feat(projects): ProjectRow, ProjectTabs and two-row home section" -m "Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

(`page.tsx` still passes `projects=`; Task 6 fixes it.)

### Task 6: Routes, redirects, sitemap, nav

**Files:**

- Create: `src/app/(app)/projects/professional/page.tsx`, `src/app/(app)/projects/personal/page.tsx`
- Delete: `src/app/(app)/projects/page.tsx`, `src/app/(app)/projects/web/page.tsx`, `src/app/(app)/projects/native/page.tsx`
- Rewrite: `src/app/(app)/projects/layout.tsx`
- Modify: `src/app/(app)/page.tsx`, `src/app/(app)/sitemap.ts`, `next.config.ts`, `src/utils/hooks/useNavigation.ts`, `src/components/layout/Header.tsx:53,142`

- [ ] **Step 1: Professional page**

```tsx
// src/app/(app)/projects/professional/page.tsx
import type { Metadata } from "next";
import { SectionHeading } from "@/components/layout/section/SectionHeading";
import { ProjectGrid } from "@/components/content/projects/ProjectGrid";
import { ProjectTabs } from "@/components/content/projects/ProjectTabs";
import { PROJECT_GROUPS } from "@/components/content/projects/groups";
import { getProjectsByType } from "@/lib/projects";

const group = PROJECT_GROUPS.professional;

export const metadata: Metadata = {
  title: group.heading,
  description: group.intro,
};

export default function ProfessionalProjectsPage() {
  return (
    <>
      <ProjectTabs />
      <SectionHeading title={group.heading} as='h1' />
      <p className='-mt-4 mb-10 max-w-2xl text-gray-700 dark:text-gray-200 lg:text-lg'>
        {group.intro}
      </p>
      <ProjectGrid
        projects={getProjectsByType("professional")}
        priorityCount={3}
      />
    </>
  );
}
```

- [ ] **Step 2: Personal page**

The same shape in its own file, so it can diverge later without touching the professional page.

```tsx
// src/app/(app)/projects/personal/page.tsx
import type { Metadata } from "next";
import { SectionHeading } from "@/components/layout/section/SectionHeading";
import { ProjectGrid } from "@/components/content/projects/ProjectGrid";
import { ProjectTabs } from "@/components/content/projects/ProjectTabs";
import { PROJECT_GROUPS } from "@/components/content/projects/groups";
import { getProjectsByType } from "@/lib/projects";

const group = PROJECT_GROUPS.personal;

export const metadata: Metadata = {
  title: group.heading,
  description: group.intro,
};

export default function PersonalProjectsPage() {
  return (
    <>
      <ProjectTabs />
      <SectionHeading title={group.heading} as='h1' />
      <p className='-mt-4 mb-10 max-w-2xl text-gray-700 dark:text-gray-200 lg:text-lg'>
        {group.intro}
      </p>
      <ProjectGrid projects={getProjectsByType("personal")} priorityCount={3} />
    </>
  );
}
```

- [ ] **Step 3: Layout becomes a server container**

```tsx
// src/app/(app)/projects/layout.tsx
// Shared container for the group pages and the detail page. Tabs live in the group pages.
export default function ProjectsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <article className='container mx-auto my-16 px-4 lg:py-8'>
      {children}
    </article>
  );
}
```

The classes match the old `<article>` exactly, so `/projects/[slug]` renders as before.

- [ ] **Step 4: Delete the old pages**

```bash
git rm "src/app/(app)/projects/page.tsx" "src/app/(app)/projects/web/page.tsx" "src/app/(app)/projects/native/page.tsx"
```

- [ ] **Step 5: Home page**

`src/app/(app)/page.tsx` becomes:

```tsx
import { Hero } from "@/components/layout";
import {
  Projects,
  // Pitch
  About,
  Experience,
} from "@/components/content";
import ContactCTA from "@/components/content/contact/ContactCTA";
import { getFeaturedProject } from "@/lib/projects";

export default async function Home() {
  const professional = getFeaturedProject("professional");
  const personal = getFeaturedProject("personal");

  return (
    <article className='flex min-h-screen flex-col items-center justify-center'>
      <Hero />
      {/* <Pitch /> */}
      <About />
      {professional && personal && (
        <Projects professional={professional} personal={personal} />
      )}
      <Experience />
      <ContactCTA />
    </article>
  );
}
```

- [ ] **Step 6: Redirects**

In `next.config.ts` `redirects()`, after the `/blog/:slug*` entry:

```ts
      { source: '/projects', destination: '/projects/professional', permanent: true },
      { source: '/projects/web', destination: '/projects/professional', permanent: true },
      { source: '/projects/native', destination: '/projects/personal', permanent: true },
```

Redirects are evaluated before routing, so `/projects/web` never reaches `[slug]`.

- [ ] **Step 7: Sitemap**

`src/app/(app)/sitemap.ts` line 8:

```ts
  const staticRoutes = ['', '/projects/professional', '/projects/personal', '/contact'].map((route) => ({
```

- [ ] **Step 8: Header nav**

`src/utils/hooks/useNavigation.ts` becomes:

```ts
export interface NavItem {
  href: string;
  label: string;
  /** Path prefix that keeps the item active; defaults to `href`. */
  activePrefix?: string;
}

/**
 * Hook that returns navigation items with proper URLs based on current path
 * @returns Array of navigation items with path-aware URLs
 */
export function useNavigation(): NavItem[] {
  const navItems: NavItem[] = [
    {
      href: "/projects/professional",
      label: "Projects",
      activePrefix: "/projects",
    },
    {
      href: "/contact",
      label: "Contact",
    },
  ];

  return navItems;
}
```

In `src/components/layout/Header.tsx` change both `isActive` props (desktop nav, line 53, and mobile nav, line 142) to:

```tsx
                      isActive={pathname.includes(item.activePrefix ?? item.href)}
```

`Header.test.tsx` mocks `useNavigation` with items that have no `activePrefix`, so its active-state cases are unaffected.

- [ ] **Step 9: Verify**

```bash
rm -rf .next && npx tsc --noEmit        # clean
npm run lint                            # clean
npm run build
```

Expected route table: `/projects/professional` and `/projects/personal` are `○`; `/projects/[slug]` is `●` with four paths; there is no `/projects`, `/projects/web` or `/projects/native` entry.

```bash
npx next start -p 3100 & echo $! > .next/server.pid     # .next is gitignored
sleep 3
for p in /projects /projects/web /projects/native; do printf "%s -> " "$p"; curl -s -o /dev/null -w "%{http_code} %{redirect_url}\n" "http://localhost:3100$p"; done
for p in / /projects/professional /projects/personal /projects/calgary-folk-fest /contact /sitemap.xml; do printf "%s -> " "$p"; curl -s -o /dev/null -w "%{http_code}\n" "http://localhost:3100$p"; done
curl -s http://localhost:3100/sitemap.xml | grep -o "benwozak.dev/projects[^<]*"
kill "$(cat .next/server.pid)"
```

Expected: the three redirects return `308` to `http://localhost:3100/projects/professional`, `/projects/professional`, `/projects/personal` respectively; the other six return `200`; the sitemap lists `/projects/professional`, `/projects/personal` and the four slugs, nothing else under `/projects`.

In the browser (`npm run dev`): home shows two rows, professional first with the image left, personal second with the image right at `lg`, stacked on a narrow window; "Projects" in the header is underlined on both group pages and on a detail page; Tab reaches both tabs, each card and both row CTAs with a visible ring; `/contact` heading spacing is acceptable (see Task 3 Step 6).

- [ ] **Step 10: Commit**

```bash
git add -A "src/app/(app)" next.config.ts src/utils/hooks/useNavigation.ts src/components/layout/Header.tsx
git status --short                      # confirm nothing under scripts/backups or .env* is staged
git commit -m "feat(projects): professional and personal group pages; redirects; nav" -m "Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

### Task 7: Motion and reduced-motion check

- [ ] **Step 1:** In DevTools → Rendering → "Emulate CSS media feature prefers-reduced-motion: reduce", reload `/projects/professional` and `/`. Expected: hovering a card does not move the image; rows and heading still fade in via `AnimatedSection` (that is existing behaviour, not introduced here).
- [ ] **Step 2:** Switch emulation off; hover a card: the image box lifts 4px and gains a shadow. No other motion was added, so nothing else to wrap in `useReducedMotion`.

### Task 8: Nav hardening, tests baseline, planning docs, hand-off

**Files:**

- Modify: `src/components/layout/Header.tsx:53,142`, `src/__tests__/components/layout/Header.test.tsx`
- Modify: `planning/baseline-test-failures.txt`, `planning/README.md`, `planning/07-projects-detail-redesign.md`, `planning/08-cleanup-and-hardening.md`, this file

- [ ] **Step 0: Boundary-aware active prefix (from Task 6 review)**

`pathname.includes(prefix)` is a substring test, so a future `/notes/projects` would light up "Projects". Add a tiny helper at the top of `src/components/layout/Header.tsx` (outside the component) and use it in both navs:

```tsx
/** True for the prefix itself and any path beneath it; never for `/projects-archive`. */
function isUnderPath(pathname: string, prefix: string): boolean {
  return pathname === prefix || pathname.startsWith(`${prefix}/`);
}
```

```tsx
isActive={isUnderPath(pathname, item.activePrefix ?? item.href)}
```

Add one case to the "Navigation Active States" block of `src/__tests__/components/layout/Header.test.tsx`:

```tsx
it("keeps an item active anywhere under its activePrefix", () => {
  vi.mocked(useNavigation).mockReturnValueOnce([
    {
      href: "/projects/professional",
      label: "Projects",
      activePrefix: "/projects",
    },
    { href: "/contact", label: "Contact" },
  ]);
  vi.mocked(usePathname).mockReturnValue("/projects/personal");

  render(<Header />);

  expect(screen.getByTestId("link-/projects/professional")).toHaveAttribute(
    "data-active",
    "true",
  );
  expect(screen.getByTestId("link-/contact")).toHaveAttribute(
    "data-active",
    "false",
  );
});
```

And the negative cases, so a regression back to `includes()` fails:

```tsx
it.each([
  ["/projects/demo-app", "true"],
  ["/projects", "true"],
  ["/projects-archive", "false"],
  ["/notes/projects", "false"],
])(
  "matches activePrefix on path boundaries only (%s -> %s)",
  (path, expected) => {
    vi.mocked(useNavigation).mockReturnValueOnce([
      {
        href: "/projects/professional",
        label: "Projects",
        activePrefix: "/projects",
      },
    ]);
    vi.mocked(usePathname).mockReturnValue(path);

    render(<Header />);

    expect(screen.getByTestId("link-/projects/professional")).toHaveAttribute(
      "data-active",
      expected,
    );
  },
);
```

Run `npx vitest run src/__tests__/components/layout/Header.test.tsx`: the new cases and both existing active-state cases pass; the three mobile-menu failures are baseline lines 1–3 and stay.

- [ ] **Step 1: Full suite and failing-set check**

```bash
npx vitest run --reporter=json --outputFile=.vitest-current.json >/dev/null 2>&1 || true
node -e '
const r=require("./.vitest-current.json");const out=[];
for(const f of r.testResults)for(const t of f.assertionResults)if(t.status==="failed")out.push(f.name.replace(process.cwd()+"/","")+" :: "+t.fullName);
console.log(out.sort().join("\n"))' > .vitest-current.txt
comm -13 planning/baseline-test-failures.txt .vitest-current.txt   # must print nothing
comm -23 planning/baseline-test-failures.txt .vitest-current.txt   # informational
cp .vitest-current.txt planning/baseline-test-failures.txt
rm .vitest-current.json .vitest-current.txt
```

The first `comm` must be empty. The baseline is expected to stay at 40 lines: none of the 40 are Badge tests, and the two SectionHeading entries ("handles title with only whitespace", "handles titles with HTML entities") are pre-existing failures in cases this chunk does not touch, so they remain. If the second `comm` prints either of them, the `as` change fixed them by accident; that is fine and the regenerated baseline simply shrinks.

- [ ] **Step 2: Grep for leftovers**

```bash
grep -rn "ProjectsGrid\|functions/animations\|projects/web\|projects/native\|status.*\"Professional\"\|'web'\|'native'" src content | grep -v __tests__
```

Expected: nothing. (The legacy redirects live in `next.config.ts`, outside the grep; the tab label `"Professional"` in `groups.ts` is correct and is excluded by the `status.*` prefix.)

- [ ] **Step 3: Planning docs**

- `planning/README.md`: tick `05` and `06` in the checklist.
- `planning/07-projects-detail-redesign.md`, Prerequisites (line 15): replace the primitives list with "primitives `ProjectImage`, `TechChips`, status-only `Badge`, `groups.ts` (`PROJECT_GROUPS` labels/hrefs), extended framer-motion mock. `ProjectLinks` was dropped from chunk 06; chunk 07 creates it. `Badge` no longer styles `type`; render the group with `PROJECT_GROUPS[project.type].label` instead of `<Badge status={project.type} />`." Add a dated line under its Hand-off log saying its task list needs the same rewrite pass before execution.
- `planning/08-cleanup-and-hardening.md`: in the content-schema table (lines 264–266) change `type` to `"professional" \| "personal"` with "Drives the two group pages", `status` to `"In Progress" \| "Prototype" \| "Live" \| "Archived"`, and the `featured` row to "At most one `true` per `type`; it is that group's row on the home page" (it still says exactly one leads `/projects`); change the scaffold default at line 184 from `type: 'web'` to `type: 'personal'`.
- `planning/07-projects-detail-redesign.md`: add to its Hand-off log that `getAdjacentProjects` walks the global `order`, so prev/next alternates between groups (homechef, calgary, tedana, vista); chunk 07 decides whether to keep that or stay within a group.
- `planning/08-cleanup-and-hardening.md`, Hand-off log or a "Carried in from 06" note: (a) reserved slugs — a project slug of `professional`, `personal`, `web` or `native` would be shadowed by a static page or a redirect; have `new-project.ts` or `parseProject` reject them; (b) the group pages inherit the root layout's `openGraph` block (home title and URL); add per-page `openGraph` when 08 does its metadata pass; (c) `content:check` is a manual gate: `next build` does not run it, so the "at least one project per type" rule only fails locally.
- This file: append to the Hand-off log (below) with the date, anything that deviated from the plan, and the `/contact` spacing decision from Task 3 Step 6 (or "not yet checked" if the owner has not looked).

- [ ] **Step 4: Commit**

```bash
git add planning
git commit -m "docs(planning): chunk 06 hand-off; baseline; notes for 07 and 08" -m "Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

---

## Verification checklist

- [ ] `rm -rf .next && npx tsc --noEmit`, `npm run lint`, `npm run build` clean; route table as in Task 6 Step 9
- [ ] `next start` redirect and 200 checks from Task 6 Step 9 pass
- [ ] Failing-set check empty; baseline regenerated and committed
- [ ] Keyboard: both tabs, every card, both row CTAs reachable with a visible ring
- [ ] Reduced motion: no card lift
- [ ] Leftover grep (Task 8 Step 2) prints nothing
- [ ] `scripts/backups/` and `.env*` not in any commit (`git log --stat main..HEAD | grep -c "scripts/backups\|\.env"` → 0)

## Push and PR

Only when the owner says so:

```bash
git push -u origin chunk-06-projects-redesign
gh pr create --base main --title "chunk 06: projects regrouped as professional | personal" --body "$(cat <<'EOF'
## Summary
- `type` is now `professional | personal`; statuses `In Progress | Prototype | Live | Archived`; at most one `featured` per type (build fails otherwise)
- Home page shows one editorial row per group with "View project" and "All … " CTAs
- `/projects/professional` and `/projects/personal` replace `/projects`, `/projects/web`, `/projects/native` (all three 308)
- New `ProjectCard` (editorial, single stretched link), `ProjectGrid`, `ProjectRow`, `ProjectTabs`, `ProjectImage`, `TechChips`; `Badge` is status-only
- Header "Projects" links to `/projects/professional` and stays active under `/projects/*`

Spec: `planning/06-projects-redesign-spec.md`. Plan: `planning/06-projects-index-redesign.md`.

## Owner checks on the preview
- `/` rows, both group pages, a detail page, `/contact`
- `/projects`, `/projects/web`, `/projects/native` redirect
- Header active state on `/projects/personal`

🤖 Generated with [Claude Code](https://claude.com/claude-code)
EOF
)"
```

Watch the Vercel check; do not merge. The owner merges and verifies production.

## Done when

PR merged, production shows the two group pages and the new home rows, `planning/README.md` has 05 and 06 ticked.

## Out of scope / deferred

- Detail page (`/projects/[slug]`): chunk 07, which now also creates `ProjectLinks`.
- `new-project.ts` scaffolding: chunk 08. The owner's new projects (including any Archived ones) are added with it after this redesign ships.
- Any visual divergence of the personal page beyond having its own file.
- Pruning merged `chunk-0N-*` branches.

## Hand-off log

- 2026-10-31 — Plan rewritten from `06-projects-redesign-spec.md` after the brainstorming session; the earlier featured-block-plus-`?type=`-filter design is superseded. Not yet executed.
- 2026-10-31 — Executed subagent-driven on branch `chunk-06-projects-redesign`. Tasks 1–6 each had a spec-compliance review and a code-quality review; Task 8 had a spec review and was covered by the final whole-branch review; Task 7 (reduced-motion check in DevTools) is owner-only and still open. The final review re-ran tsc, lint, build, the failing-set check and a `next start` smoke test: all clean, failing set identical to the 40-line baseline. Per the owner's instruction nothing was committed; the work sits in the working tree (five `git rm` deletions staged, everything else unstaged/untracked).
- 2026-10-31 — Deviations from the plan made during review: `groups.ts` light-mode accents darkened for contrast (`secondary-900`/`primary-700` text, `secondary-800` border); `ProjectCard` heading is `h2`, focus ring uses `has-[:focus-visible]`, middle dot is `aria-hidden`; `ProjectRow` CTAs stack again from `lg`, primary CTA carries a visually hidden project name, image not `priority`, `sizes` 600px at desktop; home section uses `px-4 xl:px-0` and one `AnimatedSection` per row; `ProjectTabs` has explicit `dark:hover:` classes; `TechChips`/`ProjectGrid`/`ProjectTabs` lists carry `role="list"` and `stackItems` dedupes; `ProjectCard` `sizes` breakpoints are `767px`/`1023px`; Header active check is boundary-aware (`isUnderPath`) with positive and negative tests. The plan's code blocks were updated to match; the tree is authoritative where they differ.
- 2026-10-31 — Not yet checked by the owner (needs a browser): home rows at phone/tablet/desktop (professional row first with image left, personal row image right at `lg`, both fade in on a landscape phone, CTAs stacked at `lg`); the 4:3 card crop of the roughly 2:1 screenshots; keyboard focus rings on tabs, cards and row CTAs, and no ring on mouse click; reduced-motion emulation (no card lift, no entrance slide; Task 7); a dark-mode pass over eyebrow accents, the four badge colours, inactive-tab hover and chip borders; `/contact` heading spacing now that `Section` applies its `pt-32` (keep, or drop the prop); the `h1` re-animating when switching tabs (it now lives in each page rather than the persistent layout); header active state on `/projects/personal` and a detail page (already confirmed in server-rendered HTML, visual check only); and the Vercel preview before merge.
