# 06 — Projects redesign: design spec

Agreed with the owner on 2026-10-31 in a brainstorming session (mockups under `.superpowers/brainstorm/`, gitignored). This spec supersedes the Goal, Architecture and Design decisions sections of `06-projects-index-redesign.md`; that doc's task list is rewritten from this spec before implementation starts.

## Summary

The projects area stops grouping by platform (web | native) and groups by provenance instead: **professional work** and **personal projects**. The home page showcases one project from each group in an editorial row. `/projects` becomes two tabbed pages, one per group, each a grid of a new image-led card. Statuses become In Progress, Prototype, Live and Archived.

## Decisions

| Topic | Decision |
|---|---|
| Grouping field | `type` is repurposed: `'professional' \| 'personal'`. No separate platform field. |
| Statuses | `'In Progress' \| 'Prototype' \| 'Live' \| 'Archived'`. "Professional" is renamed to "Live". Archived is for shipped work that has since been taken down but still merits a case study. |
| Links vs status | `liveUrl` and `githubUrl` stay nullable and independent of status. An Archived project may still have a `liveUrl`. |
| Featured | `featured: true` marks the showcase project *within its group*. At most one per group. |
| Home section | Two editorial rows (image 3/5, text 2/5 at `lg`; stacked on mobile), alternating sides. Professional first, personal second. Each row: group eyebrow, name, status badge, description, "View project" (primary) and "All professional work" / "All personal projects" (secondary). The single "See More" CTA goes away. |
| Card | Editorial card: tall image (4:3, rounded, no box surface), eyebrow "Professional · Live", name as a stretched link covering the card, description clamped to two lines, up to three tech chips. Hover lifts the image slightly; disabled under reduced motion. |
| Index pages | `/projects/professional` and `/projects/personal`, each its own page file so the personal page can diverge later. Two tabs; no "All" view. |
| `/projects` | Permanent redirect to `/projects/professional`. The header nav (`useNavigation.ts`) links to `/projects/professional` directly. |
| Old routes | `/projects/web` → `/projects/professional`, `/projects/native` → `/projects/personal`, both permanent. |
| Filtering | None. The `?type=` filter, `ProjectFilter`, `ProjectsBrowser` and `filter.ts` from the earlier plan are dropped. |
| Colour | Tokens only. `secondary` (teal) marks professional, `primary` (orange) marks personal, in eyebrows and the tab underline. Badges: Live green, In Progress amber, Prototype blue, Archived grey, via Tailwind palette classes with dark variants. |

## Content model

`src/types/project.ts` and `src/lib/projects/schema.ts` change together:

```ts
export const PROJECT_TYPES = ['professional', 'personal'] as const
export const PROJECT_STATUSES = ['In Progress', 'Prototype', 'Live', 'Archived'] as const
```

Everything else in `Project` is unchanged. `content/projects/index.ts` gains a rule: more than one `featured: true` per `type` is a validation error, reported by `content:check` and at build time.

Content edits:

| File | `type` | `status` | `featured` |
|---|---|---|---|
| `calgary-folk-fest.json` | professional | Live | true |
| `vista-crossing.json` | professional | Live | false |
| `homechef-companion.json` | personal | In Progress | true |
| `tedana-app.json` | personal | Prototype | false |

The platform is no longer recorded; Tedana's "Tauri" chip conveys that it is a desktop app.

**Archived project.** None of the four existing projects is archived. The Archived status exists for professional work the owner will add after this redesign ships (one such project is known), via the chunk 08 `new-project.ts` tool. This chunk adds no content beyond the four edits above.

## Data access (`src/lib/projects`)

- `getProjects()` unchanged (all, sorted by `order`).
- `getProjectsByType(type)` — filtered, sorted by `order`.
- `getFeaturedProject(type)` — the group's `featured` project, else its lowest `order`. Returns `undefined` only for an empty group.

## Routes

| Route | Change |
|---|---|
| `/projects` | Redirect (308) to `/projects/professional`, in `next.config.ts`. No page file. |
| `/projects/professional` | New static page. |
| `/projects/personal` | New static page. |
| `/projects/web`, `/projects/native` | Page files deleted; redirects added. |
| `/projects/[slug]` | Untouched (chunk 07). |
| `src/app/(app)/projects/layout.tsx` | Becomes a server container (`<article>` with the existing container classes). No path sniffing, no tabs. |
| `src/app/(app)/sitemap.ts` | `staticRoutes` lists `/projects/professional` and `/projects/personal` instead of `/projects`, `/projects/web`, `/projects/native`. |
| Header nav (`src/utils/hooks/useNavigation.ts`) | The "Projects" item's href becomes `/projects/professional`. |

Each group page: `metadata` (title, description), `ProjectTabs`, `SectionHeading as="h1"` ("Professional work" / "Personal projects"), a one-line intro paragraph, `ProjectGrid` of `getProjectsByType(type)`.

Starting intro copy, for the owner to rewrite:

- Professional: "Sites and apps I've built for clients and employers."
- Personal: "Side projects and prototypes where I try things out."

## Components (`src/components/content/projects/` unless noted)

| Component | Kind | Responsibility |
|---|---|---|
| `ProjectImage` | server-safe | `next/image` with the content width, height and `blurDataURL`; `sizes` and `priority` props. |
| `TechChips` | server-safe | `<ul aria-label>` of chips; `max` prop adds "+N more". |
| `Badge` (`ui/Badge.tsx`) | server-safe | Same `status` prop; colours per the Decisions table; unknown values get a neutral style. |
| `ProjectCard` | server-safe, rewrite | Editorial card as decided. One focusable link (the name) stretched over the card via `after:absolute after:inset-0`; `focus-within` ring on the card. |
| `ProjectGrid` | server-safe | `<ul>` grid: 1 column, `md:2`, `lg:3`; `priorityCount` for above-the-fold images. |
| `ProjectRow` | server-safe | Home editorial row. Props: `project`, `reverse?: boolean`. Group eyebrow, name, `Badge`, description, `CTAButton` "View project" → `/projects/<slug>`, secondary `CTAButton` "All professional work" / "All personal projects" → the group page. |
| `ProjectTabs` | client (`usePathname`) | Two `next/link` tabs with `aria-current="page"` on the active one; underline in the group colour. |
| `Projects` (`index.tsx`) | client (framer-motion) | Home section. Props `{ professional: Project; personal: Project }`. Two `ProjectRow`s inside `AnimatedSection` with `itemVariants`. `Section` widened to `max-w-5xl` via its `className` prop, which `Section` must start applying. |
| `SectionHeading` | modify | `as?: 'h1' \| 'h2'`. |

Deleted: `ProjectsGrid.tsx`, `src/utils/functions/animations.ts`.

`src/app/(app)/page.tsx` passes `getFeaturedProject('professional')!` and `getFeaturedProject('personal')!`.

## Motion

Entrance uses the existing `AnimatedSection` + `itemVariants`. Card hover is CSS (`group-hover:-translate-y-1` on the image, `motion-reduce:` off). No new framer-motion hooks.

## Tests

- `schema.test` / `index.test`: new type and status values accepted, old ones rejected, two featured in one group rejected.
- `projects.test` (lib): `getProjectsByType` order, `getFeaturedProject` fallback to lowest order.
- `ProjectCard.test`: name links to `/projects/<slug>`; eyebrow shows group and status; chips cap at three with "+N more"; image alt renders.
- `ProjectTabs.test`: active tab has `aria-current`; both hrefs.
- `ProjectRow.test`: both links present with the right hrefs; `reverse` flips DOM order.
- `Badge.test`: rewritten to behaviour (text renders, distinct statuses get distinct classes); no assertions on specific colour classes.
- `src/__tests__/setup.ts`: framer-motion mock extended for any new elements used.
- Failing-set check against `planning/baseline-test-failures.txt`; regenerate the baseline since tests are deleted.

## Verification

- `rm -rf .next && npx tsc --noEmit`, `npm run lint`, `npm run build`: `/projects/professional` and `/projects/personal` are `○`; no `/projects`, `/projects/web` or `/projects/native` pages.
- `next start`: `/projects`, `/projects/web`, `/projects/native` return 308 to the right destinations; both group pages and `/` return 200.
- Keyboard: Tab reaches both tabs, every card and every row link with a visible ring.
- Reduced motion: no translate on entrance or hover.
- Vercel preview checked by the owner before merge.

## Out of scope

- Detail page (`/projects/[slug]`): chunk 07. It will reuse `ProjectImage`, `TechChips`, `Badge`.
- `new-project.ts` tooling: chunk 08.
- Any visual divergence of the personal page beyond its own file: later.
