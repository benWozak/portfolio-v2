# 03 — Remove the resume section (frontend + deps)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Delete the `/resume` page, its two PDF API routes, components, types, CSS, tests, mocks and two npm packages; remove every link to it; redirect the old URL. Leave the Payload `resume` collection and the preview routes for chunk 05.

**Architecture:** Pure deletion. The resume code is self-contained: `resume/page.tsx` → `ResumeClientWrapper` → `Resume` → `Announcement`, fed by `getResume.ts` and typed by `types/resume.ts` + `types/yakpdf.ts`. Outside that tree only four things reference it: the nav item, the sitemap entry, the "View My CV" button in `Experience.tsx`, and the `yakpdf` re-export in `types/index.ts`.

**Tech Stack:** none new.

---

## Prerequisites

- Chunk 02 merged to `main` (it rewrote `src/types/index.ts` and `sitemap.ts`, which this chunk edits again).
- Independent of chunk 04. If doing both in one session, do them on two branches and rebase the second before its PR.

## Start

```bash
git checkout main && git pull
git checkout -b chunk-03-remove-resume
```

## File structure

| Path | Change |
|---|---|
| `src/app/(app)/resume/page.tsx` | **Delete** |
| `src/app/(app)/api/generate-resume/route.ts` | **Delete** (posted HTML to the YakPDF API) |
| `src/app/(app)/api/resume-pdf/route.ts` | **Delete** (reads a LaTeX template dir that does not exist; dead already) |
| `src/components/resume/Resume.tsx`, `ResumeClientWrapper.tsx` | **Delete** |
| `src/components/ui/Announcement.tsx`, `src/__tests__/components/ui/Announcement.test.tsx` | **Delete** (only `Resume.tsx` used it; its copy is resume-specific) |
| `src/utils/getResume.ts` | **Delete** |
| `src/utils/functions/format.ts` | **Delete** (used only by `resume-pdf` and `Resume.tsx`) |
| `src/types/resume.ts`, `src/types/yakpdf.ts` | **Delete** |
| `module.d.ts` | **Delete** (`declare module 'html2pdf.js'`; the package is not even installed) |
| `src/__tests__/components/resume/` (Resume.test, ResumeClientWrapper.test, `__mocks__/mockResumeData.ts`) | **Delete** |
| `src/components/content/Experience.tsx` | Modify: drop the CTA block and the `CTAButton` import |
| `src/utils/hooks/useNavigation.ts` | Modify: drop the Resume item |
| `src/app/(app)/sitemap.ts` | Modify: drop `'/resume'` |
| `src/components/ui/index.tsx` | Modify: drop `Announcement` |
| `src/types/index.ts` | Modify: drop the `yakpdf` re-export |
| `src/__tests__/setup.ts` | Modify: drop the `next/font/google` (Nunito) and `react-hot-toast` mocks |
| `src/app/(app)/globals.css` | Modify: delete the resume / PDF CSS block |
| `tsconfig.json` | Modify: drop `"scripts/build-resume.js"` from `include` |
| `package.json` | Modify: remove `node-latex`, `react-hot-toast` |
| `next.config.ts` | Modify: redirect `/resume` → `/` |

Untouched until chunk 05: `src/collections/Resume.ts`, the resume branches in `src/app/(app)/api/preview/route.ts` and `api/live-preview/route.ts` (they call Payload directly and import nothing from the list above), `LivePreviewToolbar` (orphaned after this chunk, deleted in 05).

---

### Task 1: Delete resume code

- [ ] **Step 1: Confirm the consumer list is still exactly this**

```bash
grep -rln "getResume\|types/resume\|ResumeData\|yakpdf\|GenerateResume\|Announcement\|functions/format\|react-hot-toast\|node-latex" src | sort
```

Expected: only paths in the delete list above plus `src/types/index.ts` and `src/components/ui/index.tsx`. Anything else must be handled by hand first.

- [ ] **Step 2: Delete**

```bash
git rm -r "src/app/(app)/resume" "src/app/(app)/api/generate-resume" "src/app/(app)/api/resume-pdf" \
          src/components/resume \
          src/components/ui/Announcement.tsx src/__tests__/components/ui/Announcement.test.tsx \
          src/utils/getResume.ts src/utils/functions/format.ts \
          src/types/resume.ts src/types/yakpdf.ts \
          module.d.ts \
          src/__tests__/components/resume
```

- [ ] **Step 3: Barrel and type index**

`src/components/ui/index.tsx`: remove `export { Announcement } from "./Announcement";`

`src/types/index.ts` becomes exactly:

```ts
// src/types/index.ts
export * from './project';
```

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "chore(resume): remove resume page, PDF routes, components, types and tests"
```

### Task 2: Remove the links

**Files:**
- Modify: `src/components/content/Experience.tsx:10,106-113`
- Modify: `src/utils/hooks/useNavigation.ts`
- Modify: `src/app/(app)/sitemap.ts`

- [ ] **Step 1: Experience**

Delete line 10, `import { CTAButton } from "../ui";`, and the whole block:

```tsx
        <motion.div
          variants={itemVariants}
          className="mt-8 lg:mt-12 flex justify-center"
        >
          <CTAButton type="secondary" href="/resume" className="w-72">
            View My CV
          </CTAButton>
        </motion.div>
```

The `AnimatedSection` now ends right after the `experiences.map(...)` block. `itemVariants` is still used by the `motion.ol`, so its import stays.

- [ ] **Step 2: Navigation**

In `src/utils/hooks/useNavigation.ts` delete:

```ts
    {
      href: "/resume",
      label: "Resume",
    },
```

Header and Footer both read this hook, so both lose the link at once. (`Header.test.tsx` and `Footer.test.tsx` mock the hook with their own items; they are unaffected.)

- [ ] **Step 3: Sitemap**

Remove `'/resume'` from the `staticRoutes` array in `src/app/(app)/sitemap.ts`.

- [ ] **Step 4: Verify and commit**

```bash
npx tsc --noEmit
grep -rn "/resume" src     # expect: nothing outside src/collections and src/app/(app)/api/preview*, api/live-preview*
git add src/components/content/Experience.tsx src/utils/hooks/useNavigation.ts "src/app/(app)/sitemap.ts"
git commit -m "chore(resume): remove nav item, sitemap entry and Experience CTA"
```

### Task 3: CSS, test setup, config, packages, redirect

**Files:**
- Modify: `src/app/(app)/globals.css`, `src/__tests__/setup.ts`, `tsconfig.json`, `package.json`, `next.config.ts`

- [ ] **Step 1: CSS**

In `src/app/(app)/globals.css`, delete everything from the comment line `/* Fix for bullet points */` (around line 293) down to and including the closing brace of the last `.resume-list li::before { … }` rule (around line 385). That span contains, in order: `.resume-list`, `.resume-list li`, the `.text-gray-600.inline-flex, .text-gray-600.inline-block` icon rule (only `Resume.tsx` had those class pairs), the whole `@media print { … }` block (Nunito font, resume bullets, svg sizing, contact alignment — all PDF export), `.generating-pdf`, `.generating-pdf #resume-container`, `.generating-pdf .resume-list li::before`, `.resume-list li::before`. Nothing after it is resume-related.

```bash
grep -n "resume\|generating-pdf\|@media print\|Nunito" "src/app/(app)/globals.css"   # expect: nothing
```

- [ ] **Step 2: Test setup**

In `src/__tests__/setup.ts` delete the two blocks:

```ts
vi.mock('next/font/google', () => ({
  Nunito: vi.fn(() => ({
    className: 'font-nunito',
    variable: '--font-nunito',
  })),
}))

vi.mock('react-hot-toast', () => ({
  toast: {
    loading: vi.fn(),
    success: vi.fn(),
    error: vi.fn(),
    dismiss: vi.fn(),
  },
}))
```

- [ ] **Step 3: tsconfig**

Remove `"scripts/build-resume.js",` from the `include` array in `tsconfig.json` (the file never existed).

- [ ] **Step 4: Packages**

```bash
npm uninstall node-latex react-hot-toast
```

- [ ] **Step 5: Redirect**

Inside the array returned by `redirects()` in `next.config.ts`, after the existing host redirect object, add:

```ts
      { source: '/resume', destination: '/', permanent: true },
```

- [ ] **Step 6: Verify**

```bash
npx tsc --noEmit
npm run lint
npm run build
npm run dev &      # then:
curl -sI http://localhost:3000/resume | head -1    # HTTP/1.1 308
```

Open `/`: the header and footer show Projects and Contact only; the Experience section ends with the timeline.

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "chore(resume): drop resume CSS, test mocks, deps; redirect /resume"
```

---

## Verification checklist

- [ ] `npx tsc --noEmit`, `npm run lint`, `npm run build` clean
- [ ] `npm run test:run` + failing-set check from `00`: no new failures; baseline regenerated (the three resume tests and `Announcement.test.tsx` leave it) and committed
- [ ] `grep -rniE "resume|yakpdf|latex|hot-toast|html2pdf|nunito" src tsconfig.json package.json module.d.ts 2>/dev/null` → only `src/collections/Resume.ts`, `api/preview/route.ts`, `api/live-preview/route.ts`
- [ ] Vercel preview: `/resume` redirects, nav has no Resume, Experience has no CTA

## Done when

PR `chunk-03-remove-resume` → `main` is open and green.

## Out of scope / deferred

- `src/collections/Resume.ts`, preview-route resume branches, `LivePreviewToolbar`: chunk 05.
- Vercel env vars `YAKPDF_API_KEY`, `YAKPDF_HOST`: chunk 09.

## Hand-off log

- 2026-10-30: Done as written, with the following notes.
  - **Stacking.** Done in the same session as 04. `chunk-04-remove-blog` is stacked on this branch, and its PR targets `chunk-03-remove-resume`.
  - **Type check.** The first `npx tsc --noEmit` after Task 1 failed on stale `.next/types` stubs for the deleted routes. They're generated, so I removed them and the build recreates the rest.
  - **Verification.** `npm run build` no longer lists `/resume`, `/api/generate-resume` or `/api/resume-pdf`. With `next start`:
    - `/resume` returns 308 to `/`;
    - the nav shows only Projects and Contact;
    - "View My CV" is gone.
  - **Tests.** 496 run, 41 failing, no new failures. The baseline lost the 4 `Resume.test.tsx` failures, so it now holds 41.
  - **Residual grep.** It also lists the following, all expected:
    - `src/payload.config.ts`, `src/payload-types.ts` and `src/__tests__/collections/revalidation.test.ts`, which belong to chunk 05.
    - `globals.css`, a false positive: `translateX` matches `latex` case-insensitively.
