# 10 — Dependency upgrades

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development to implement this plan task-by-task (fresh implementer per task, spec review, then code-quality review). Steps use checkbox (`- [ ]`) syntax for tracking. **Nobody but the orchestrator runs `git add`, `git commit` or `git push`; implementers and reviewers never do.** Read `planning/00-overview-and-preflight.md` and `CLAUDE.md` first.

**Goal:** Bring every dependency to its current major with the site buildable after each tier, in five tiers ordered from least to most risk, all on one local branch.

**Architecture:** One branch, `deps-upgrades`, off `main`. Five tiers are commit groups on it; inside a tier, one commit per package group, so the owner can bisect or drop a tier. Every package is installed with an explicit version (`npm install pkg@x.y.z`) so the lockfile changes surgically. The gate after every task is the same four commands plus a build. **Tiers 1–4 run in this session; Tier 5 (Tailwind 4) is written down but not executed.**

**Tech Stack (end state):** Next 16.4, React 19.3, TypeScript 6.0, ESLint 9 flat config (10 deferred, see hand-off), Vitest 5 on Vite 8, Tailwind 4.3, Motion 14, cobe 2, lucide-react 1.

## Why these tiers

Checked against the npm registry on 2026-11-01. Ranked lowest to highest effort.

| # | Package(s) | From → to | Why it costs what it costs |
|---|---|---|---|
| 1 | Every in-range bump (`npm update`) + `npm audit fix` | e.g. vitest 4.0.18 → 4.1.12, react 19.2.4 → 19.3.1, eslint 9.39.2 → 9.39.5, vite 7.3.1 → 7.3.x | No code. Clears every audit finding. |
| 2 | `@types/node` | 25.2.3 → **22.x** | Realign with the Node 22 runtime (25 was never right). No code. |
| 3 | `@vercel/analytics` 2, `@vercel/speed-insights` 2, `@emailjs/browser` 5, `sharp` 0.35 | majors | Release notes list no API changes (license/Nuxt/ESM-default only). Import paths unchanged. |
| 4 | `@testing-library/jest-dom` 7, `jsdom` 29 | majors | jest-dom 7 makes `@testing-library/dom` a required peer (already installed transitively; add it explicitly). jsdom 29 may change a few DOM behaviours; run the suite. |
| 5 | `lucide-react` 1.x | 0.564 → 1.66 | Brand icons removed (we use none: ChevronDown, Laptop, Moon, Sun), `aria-hidden` default on. Our icons are all decorative beside text. |
| 6 | `framer-motion` 12 → `motion` 14 | package rename | Mechanical: 12 source imports, 2 test mocks, `setup.ts`. Upstream says no breaking changes in 13 or 14. |
| 7 | `cobe` 2 | 0.6.5 → 2.0.1 | **API change not in the README:** `onRender` is gone from the types and the bundle; v2 exposes `globe.update(partialOptions)` and no longer owns a frame loop. `Globe.tsx` needs its own `requestAnimationFrame` loop. One component, one test file. |
| 8 | `typescript` 6.0 | 5.9.3 → 6.0.3 | Our tsconfig uses none of the removed options. Risk: `skipLibCheck` is stricter about conflicting declarations. |
| 9 | `next` 16 + `eslint-config-next` 16 + `eslint` 10 + flat config | 15.4 → 16.4.3, 9 → 10.14 | `next lint` removed, `.eslintrc.json` no longer read at all in ESLint 10, Turbopack default, new React Compiler lint rules from `eslint-plugin-react-hooks` 7 will flag code. Async params already done in chunk 07. |
| 10 | `vitest` 5 + `vite` 8 + `@vitejs/plugin-react` 6 + `@vitest/coverage-v8` 5 | 4 → 5 | Vite becomes a peer dependency; `clearMocks` defaults on; `vi.mock` inside functions throws. **Needs Node ≥ 22.12 on Vercel** because `prebuild` runs Vitest there. |
| 11 | `tailwindcss` 4 + `@tailwindcss/postcss` | 3.4.19 → 4.3.3 | Config moves into CSS, ten utilities renamed, defaults change (border colour, ring width, button cursor). Visual pass of every page in both themes. |

Unchanged (already latest): `clsx`, `next-themes`, `react-markdown`, `remark-gfm`, `tailwind-merge` (3.7 after Tier 1), `@tailwindcss/typography` 0.5.20 (supports v4), `postcss`, `tsx`.

## Prerequisites

- Chunk 08 merged (`b79f879`). Tree clean on `main`.
- Node ≥ 22.13 locally (`node -v` → v22.17.0 ✔).
- **OWNER CHECKS before deploying the branch:** the Vercel project's Node.js version setting is `22.x` (Project → Settings → Build and Deployment → Node.js Version). Vitest 5 needs ≥ 22.12 and runs on Vercel through `prebuild`. Tier 4 adds `engines.node` to `package.json`, which Vercel honours. Since nothing is pushed in this session, this check happens when the owner pushes.

## Commit policy

Owner's instruction (2026-11-01): everything goes on one new branch, `deps-upgrades`. The orchestrator commits locally after each task passes spec review and code-quality review, with conventional-commit prefixes. **Nobody runs `git push`, opens a PR or merges.** At the end of Tier 4 the orchestrator stops and hands off: branch name, commit list, and the OWNER CHECKS still open. Tier 5 is not started.

## Gate (run after every task)

```bash
rm -rf .next && npx tsc --noEmit && npm run lint && npm run test:run 2>&1 | tail -4 && npm run build 2>&1 | tail -25
```

Expected: tsc silent, lint clean, `Test Files  N passed`, build prints the same route table as before the task (`ƒ /robots.txt`, `○ /sitemap.xml`, four `/projects/<slug>` pages). If a step fails, fix it inside the task; do not carry failures forward.

## File structure

| Path | Tier | Change |
|---|---|---|
| `planning/10-dependency-upgrades.md`, `planning/README.md` | 0 | Create the chunk doc (this text from "# 10 —" down), add it to the index and status list |
| `package.json`, `package-lock.json` | all | Version bumps; Tier 3 changes `scripts`; Tier 4 adds `engines` and `vite` |
| `.github/dependabot.yml` | 1 | **Create** (grouped monthly updates) |
| `src/components/magicui/globe.tsx` | 2 | Rewrite the effect: own rAF loop calling `globe.update()` |
| `src/__tests__/components/magicui/Globe.test.tsx` | 2 | Mock `update`, drop the `onRender` assertion, add a loop/cleanup test |
| 12 files importing `framer-motion` under `src/components/`, `src/app/` | 2 | Import from `motion/react` |
| `src/__tests__/setup.ts`, `Globe.test.tsx`, `AnimatedSection.test.tsx`, `src/__tests__/README.md`, `CLAUDE.md` | 2 | Mock/document `motion/react` instead of `framer-motion` |
| `.eslintrc.json` → `eslint.config.mjs` | 3 | **Replace** with flat config |
| `next.config.ts` | 3 | No change needed (verified: `experimental.optimizePackageImports` exists in 16.4.3; `images` values are explicit) |
| `CLAUDE.md`, `README.md`, `planning/00-overview-and-preflight.md` | 3, 4, 5 | Stack line, commands, Node note |
| `vitest.config.ts` | 4 | No change needed; verify |
| `postcss.config.mjs`, `src/app/globals.css`, `tailwind.config.ts` (deleted) | 5 | Tailwind 4 |
| `src/components/ui/Dropdown.tsx`, `src/__tests__/components/ui/Dropdown.test.tsx`, `src/__tests__/components/ui/Button.test.tsx`, any `.tsx` the upgrade tool touches | 5 | Renamed utilities |

---

## Tier 0: Plan into the repo

### Task 0: Write the chunk doc

**Files:**
- Create: `planning/10-dependency-upgrades.md`
- Modify: `planning/README.md`

- [x] **Step 1: Create the doc.** Copy everything from the line `# 10 — Dependency upgrades` to the end of this file into `planning/10-dependency-upgrades.md`. Prepend the "Effort ranking" table from the Context section under a `## Why these tiers` heading so the ranking lives with the plan.

- [x] **Step 2: Index it.** In `planning/README.md`:
  - Under "Order and dependencies", append after the `09` line:
    ```
                                 └─ 10 dependency upgrades (five PRs; after 08, independent of 09)
    ```
  - Under "Status", append: `- [ ] 10 — Dependency upgrades (`10-dependency-upgrades.md`) — tiers done on `deps-upgrades`: ☐1 ☐2 ☐3 ☐4 ☐5 (5 deferred)`
  - Tick `08` (it merged as `b79f879` on 2026-11-01).

- [x] **Step 3: Branch and commit**

```bash
git checkout main && git pull
git checkout -b deps-upgrades
```

This is the only branch for the whole chunk. Every later "Tier N" heading continues on it.

Commit: `docs(planning): dependency upgrade plan (chunk 10)`

---

## Tier 1: Safe bumps

Nothing in this tier should need a source change. If a step does, stop and record why in the hand-off log before fixing it.

### Task 1: In-range updates and the audit

- [x] **Step 1: Record the before state**

```bash
npm outdated --long > /tmp/outdated-before.txt; npm audit 2>&1 | tail -3
```

Expected: `24 vulnerabilities (2 low, 6 moderate, 13 high, 3 critical)`.

- [x] **Step 2: Update everything inside its caret range**

```bash
npm update
npm audit fix
npm audit 2>&1 | tail -3
```

Expected: `found 0 vulnerabilities`. If anything remains, `npm audit` names the path; it will be under `vite` or `jsdom/node_modules/undici`. Do **not** run `npm audit fix --force` (it would jump majors). Note the leftover for Tier 4 instead.

- [x] **Step 3: Confirm what moved**

```bash
npm ls --depth=0 2>/dev/null | grep -E "vitest|coverage-v8|plugin-react|eslint|framer-motion|react@|react-dom|@types/react|postcss|react-icons|tailwind-merge|tsx|testing-library"
npm ls vite undici 2>/dev/null | grep -E "vite@|undici@" | sort -u
```

Expected: vitest and coverage-v8 `4.1.12`, plugin-react `5.2.0`, eslint `9.39.5`, eslint-config-next `15.5.28`, framer-motion `12.43.0`, react/react-dom `19.3.1`, @types/react `19.3.0`, @types/react-dom `19.3.0`, postcss `8.5.32`, react-icons `5.7.0`, tailwind-merge `3.7.0`, tsx `4.23.15`, @testing-library/react `16.3.3`, user-event `14.6.8`; vite `7.3.7` or later; undici no longer in the vulnerable range.

- [x] **Step 4: Gate.** Run the gate block. Expected: all green, identical route table.

Commit: `chore(deps): update in-range dependencies and fix audit findings`

### Task 2: `@types/node` back to the runtime major

- [x] **Step 1: Install**

```bash
npm install -D @types/node@^22
grep -n '"@types/node"' package.json   # "^22.20.5" or later 22.x
```

- [x] **Step 2: Gate.** `rm -rf .next && npx tsc --noEmit` is the only step that can react. Expected: silent.

Commit: `chore(deps): pin @types/node to the Node 22 line`

### Task 3: Majors with no API change

- [x] **Step 1: Install**

```bash
npm install @vercel/analytics@2.0.1 @vercel/speed-insights@2.0.0 @emailjs/browser@5.0.3
npm install -D sharp@0.35.5
```

- [x] **Step 2: Confirm the three imports still resolve.** `src/app/layout.tsx` imports `@vercel/analytics/react` and `@vercel/speed-insights/next`; `src/components/content/contact/ContactForm.tsx` imports the default export of `@emailjs/browser`; `scripts/content/image.ts` and `src/__tests__/scripts/image.test.ts` import `sharp`.

```bash
npx tsc --noEmit
npx vitest run src/__tests__/scripts/image.test.ts 2>&1 | tail -3
npm run content:new -- --slug zz-smoke --image public/android-chrome-512x512.png && rm -rf content/projects/zz-smoke.json public/projects/zz-smoke
```

Expected: tsc silent; image test passes; `content:new` writes two files (sharp 0.35 works under tsx) and the cleanup leaves `git status --short` showing only `package*.json`.

- [x] **Step 3: Gate.** Expected: green. In the build output, confirm `/contact` is still `○` (static).

Commit: `chore(deps): @vercel/analytics 2, @vercel/speed-insights 2, @emailjs/browser 5, sharp 0.35`

### Task 4: Test tooling majors

- [x] **Step 1: Install**

```bash
npm install -D @testing-library/jest-dom@7.0.1 @testing-library/dom@^10.4.1 jsdom@29.1.1
```

`@testing-library/dom` is now a required peer of jest-dom 7. It was already in the tree (10.4.1, via `@testing-library/react`); listing it makes the peer explicit so a future `npm ci` cannot drop it.

- [x] **Step 2: Run the suite**

```bash
npm run test:run 2>&1 | tail -15
```

Expected: green. Known jsdom 29 differences if something fails: it ships its own `PointerEvent` (a test that polyfills `PointerEvent` should remove the polyfill), and `window.getComputedStyle` knows prefixed animation properties. Fix the test, not the component, and record each fix in the hand-off log.

- [x] **Step 3: Gate.**

Commit: `chore(deps): jest-dom 7 (explicit @testing-library/dom peer) and jsdom 29`

### Task 5: `lucide-react` 1

- [x] **Step 1: Install and type-check**

```bash
npm install lucide-react@1.66.0
npx tsc --noEmit
```

Expected: silent. The four icons in use (`ChevronDown` in `src/components/ui/Dropdown.tsx:51`; `Sun`, `Moon`, `Laptop` in `src/components/layout/ThemeToggle.tsx:11-13`) are core icons, not brand icons.

- [x] **Step 2: Check the accessibility default.** lucide 1 renders `aria-hidden="true"` on every icon by default. Both call sites pair the icon with visible text (the dropdown's selected label; the theme option labels), so hidden icons are correct.

```bash
npx vitest run src/__tests__/components/layout/ThemeToggle.test.tsx src/__tests__/components/ui/Dropdown.test.tsx 2>&1 | tail -4
```

Expected: pass. If a test queried an icon by role `img`, change it to query the text label instead.

- [x] **Step 3: Gate.**

Commit: `chore(deps): lucide-react 1`

### Task 6: Dependabot (keeps this from recurring)

- [x] **Step 1: Create `.github/dependabot.yml`**

```yaml
# Grouped, monthly, so the repo gets one PR for routine bumps instead of one per package.
version: 2
updates:
  - package-ecosystem: npm
    directory: /
    schedule:
      interval: monthly
    open-pull-requests-limit: 3
    groups:
      minor-and-patch:
        update-types: [minor, patch]
      majors:
        update-types: [major]
```

Majors arrive as their own grouped PR, so the owner can decline them without blocking the routine group.

- [x] **Step 2: Tier hand-off note.** Append to the hand-off log: the `npm outdated` before/after counts and the audit result. Do not push. When the owner later deploys the branch, they check that `/`, `/projects/professional` and `/contact` render and that Vercel Analytics still records a page view.

Commit: `chore: dependabot config, grouped monthly`

---

## Tier 2: Motion and cobe

Continue on `deps-upgrades`.

### Task 7: `framer-motion` → `motion` 14

**Files:**
- Modify: every file matching `grep -rl "framer-motion" src`; `CLAUDE.md`; `src/__tests__/README.md`

- [x] **Step 1: Swap the package**

```bash
npm uninstall framer-motion
npm install motion@14.9.0
```

- [x] **Step 2: Rewrite the imports**

```bash
grep -rl "from \"framer-motion\"\|from 'framer-motion'" src | xargs sed -i '' "s#from \"framer-motion\"#from \"motion/react\"#; s#from 'framer-motion'#from 'motion/react'#"
grep -rl "vi.mock('framer-motion'" src/__tests__ | xargs sed -i '' "s#vi.mock('framer-motion'#vi.mock('motion/react'#"
grep -rn "framer-motion" src CLAUDE.md README.md docs 2>/dev/null
```

Expected after the greps: only prose mentions in `CLAUDE.md` ("framer-motion" in the Stack and Conventions lines), `src/__tests__/README.md` and `docs/adding-a-project.md` if any. Change those words to `motion` (`motion/react`). The 12 source imports (`motion`, `AnimatePresence`, `MotionConfig`, `Variants`, `useInView`, `useMotionValue`, `useSpring`) are all exported from `motion/react` unchanged.

- [x] **Step 3: Gate.** Expected: green. The `setup.ts` mock now targets `motion/react`, so the Proxy-based `motion.<tag>` mock keeps working for every component.

Commit: `chore(deps): framer-motion 12 → motion 14 (import from motion/react)`

### Task 8: `cobe` 2 — Globe owns its frame loop

**Files:**
- Modify: `src/components/magicui/globe.tsx`
- Test: `src/__tests__/components/magicui/Globe.test.tsx`

Why: cobe 2.0.1's `index.d.ts` removes `onRender` from `COBEOptions`, and the shipped bundle contains no `requestAnimationFrame` and no `onRender` handling (checked in the tarball). `createGlobe` now returns `{ update(partial: Partial<COBEOptions>), destroy() }` and renders when `update` is called. The README example still shows `onRender`; it is stale.

- [x] **Step 1: Install and see the type errors**

```bash
npm install cobe@2.0.1
npx tsc --noEmit 2>&1 | head
```

Expected: errors in `globe.tsx` on `onRender` (object literal may only specify known properties).

- [x] **Step 2: Update the test first.** In `Globe.test.tsx`:

Replace the cobe mock so it returns `update` too:

```ts
vi.mock('cobe', () => {
  const mockCreateGlobe = vi.fn(() => ({
    update: vi.fn(),
    destroy: vi.fn(),
  }))
  return { default: mockCreateGlobe }
})
```

In `'creates globe with expected configuration structure'`, delete the line `onRender: expect.any(Function)` and add after the assertion:

```ts
      // v2 has no onRender: the component drives frames through globe.update()
      expect(mockCreateGlobe.mock.calls[0][1]).not.toHaveProperty('onRender')
```

Add a new test inside `describe('Cleanup')`:

```ts
    it('drives frames with requestAnimationFrame and stops on unmount', () => {
      const raf = vi.spyOn(window, 'requestAnimationFrame').mockImplementation((cb) => {
        cb(0)          // run exactly one frame synchronously; the loop re-arms via the next call, which we do not run
        return 42
      })
      const caf = vi.spyOn(window, 'cancelAnimationFrame').mockImplementation(() => {})

      const { unmount } = render(<Globe />)
      const globe = mockCreateGlobe.mock.results[0].value
      expect(globe.update).toHaveBeenCalledWith(
        expect.objectContaining({ phi: expect.any(Number), width: expect.any(Number), height: expect.any(Number) }),
      )

      unmount()
      expect(caf).toHaveBeenCalledWith(42)
      expect(globe.destroy).toHaveBeenCalledTimes(1)

      raf.mockRestore()
      caf.mockRestore()
    })
```

The mock `requestAnimationFrame` runs the callback once and returns 42 without re-arming, so the loop produces one frame and the test stays finite. In `'fades the canvas in…'` change only the first `vi.runAllTimers()` (the one before the `opacity` assertion, while the globe is mounted) to `vi.runOnlyPendingTimers()`: if Vitest's fake timers also fake `requestAnimationFrame`, a mounted self-rescheduling loop would otherwise never drain. The two `runAllTimers` calls after an unmount stay as they are (cleanup has cancelled the frame).

```bash
npx vitest run src/__tests__/components/magicui/Globe.test.tsx 2>&1 | tail -6
```

Expected: the new test fails (`update` never called) and the config-structure test fails on `onRender`.

- [x] **Step 3: Rewrite the effect in `globe.tsx`.** Replace the `useEffect` block (everything from `useEffect(() => {` to `}, [rs, config]);`) with:

```tsx
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const onResize = () => {
      width.current = canvas.offsetWidth;
    };
    window.addEventListener("resize", onResize);
    onResize();

    // cobe 2 has no onRender and no internal frame loop: the component asks for
    // each frame with update(). Only phi and the size change per frame.
    const globe = createGlobe(canvas, {
      ...config,
      width: width.current * 2,
      height: width.current * 2,
    });

    let frame = 0;
    const render = () => {
      if (!pointerInteracting.current) phi.current += 0.001;
      globe.update({
        phi: phi.current + rs.get(),
        width: width.current * 2,
        height: width.current * 2,
      });
      frame = requestAnimationFrame(render);
    };
    frame = requestAnimationFrame(render);

    const fadeIn = setTimeout(() => {
      canvas.style.opacity = "1";
    }, 0);
    return () => {
      cancelAnimationFrame(frame);
      clearTimeout(fadeIn);
      globe.destroy();
      window.removeEventListener("resize", onResize);
    };
  }, [rs, config]);
```

Also delete `onRender: () => {},` from `GLOBE_CONFIG` (the type no longer has it). Nothing else in the file changes.

- [x] **Step 4: Run the test file, then tsc**

```bash
npx vitest run src/__tests__/components/magicui/Globe.test.tsx 2>&1 | tail -4
npx tsc --noEmit
```

Expected: all Globe tests pass; tsc silent.

- [x] **Step 5: Look at it.** `npm run dev`, open `/`. The globe fades in, rotates slowly, and dragging it spins with the spring. Check the Safari and Chrome consoles for WebGL errors (cobe 2 fixed a Firefox GLSL bug; Firefox too if available). Record the result in the hand-off log.

- [x] **Step 6: Gate.** Hand-off note: what the globe looked like in Step 5. Do not push. The owner checks the globe on the preview when they deploy.

Commit: `feat(globe): cobe 2 with a component-owned frame loop`

---

## Tier 3: TypeScript 6, Next 16, ESLint 10

Continue on `deps-upgrades`.

### Task 9: TypeScript 6.0

- [x] **Step 1: Install**

```bash
npm install -D typescript@6.0.3
rm -rf .next && npx tsc --noEmit
```

Expected: silent. Our tsconfig already has `paths` without `baseUrl`, `moduleResolution: bundler`, `esModuleInterop: true` and no `target: es5`, so none of the 6.0 deprecations apply. Known possible fallout: 6.0 is stricter about conflicting declarations even under `skipLibCheck`; if it reports a conflict between two `@types` packages, upgrade or dedupe the pair (`npm ls <name>`) rather than adding `ignoreDeprecations`. If it reports `Cannot find name 'process'` or `Cannot find module 'node:fs'`, add `"types": ["node"]` to `compilerOptions` and record it.

- [x] **Step 2: Lint still works** (typescript-eslint 8.x supports `<6.1.0`): `npm run lint`. Expected: clean, no "unsupported TypeScript version" warning.

- [x] **Step 3: Gate.**

Commit: `chore(deps): typescript 6.0`

### Task 10: Next 16.4

**Files:**
- Modify: `package.json` (`next`, `eslint-config-next`, scripts), `CLAUDE.md`, `README.md`

- [x] **Step 1: Install**

```bash
npm install next@16.4.3
npm install -D eslint-config-next@16.4.3
```

Do not run `npx @next/codemod upgrade`: the three things it would do here (bump packages, rewrite `next lint`, generate a `FlatCompat` ESLint config) are done by hand in this task and Task 11 so the result matches the current Next docs rather than the codemod's legacy shim.

- [x] **Step 2: Scripts.** In `package.json` change `"dev": "next dev --turbopack"` to `"dev": "next dev"` (Turbopack is the default; the flag is redundant). Leave `"lint": "next lint"` for Task 11.

- [x] **Step 3: Check the config surface.** `next.config.ts` needs no edit; confirm:
  - `experimental.optimizePackageImports` still exists in 16.4.3 (it does: `dist/server/config-shared.d.ts:619`).
  - `images.minimumCacheTTL`, `deviceSizes`, `imageSizes` are explicit, so the 16 default changes (TTL 4 h, `16` dropped from `imageSizes`, `qualities: [75]`) do not alter output. No `<Image quality=…>` is used anywhere (`grep -rn "quality=" src` is empty).
  - There is no `middleware.ts`, no `eslint` key, no webpack config, no parallel routes.
  - `src/app/robots.ts` already awaits `headers()`; `[slug]/page.tsx` already awaits `params`.

- [x] **Step 4: Build**

```bash
rm -rf .next && npm run build 2>&1 | tail -30
```

Expected: the build runs `content:check` first, then "▲ Next.js 16.4.3 (Turbopack)", then the route table. `next build` now type-checks through the project-local `tsc` CLI (default in 16 for TS ≥ 6), which prints plain tsc diagnostics. Note that the `Size` / `First Load JS` columns are gone from the table; that is a Next 16 change, not a regression.

- [x] **Step 5: Smoke the server**

```bash
npx next start -p 3100 & PID=$!; sleep 3
for p in / /projects/professional /projects/personal /projects/calgary-folk-fest /contact /robots.txt /sitemap.xml /nope; do printf "%s " "$p"; curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3100$p; done
curl -s -X POST http://localhost:3100/api/contact/verify -H 'content-type: application/json' -d '{}' ; echo
kill $PID
```

Expected: `200` for every page, `200` for robots and sitemap, `404` for `/nope`, and the POST returns `{"success":false,"error":"Missing Turnstile token"}` with 400.

- [x] **Step 6: Dev server.** `npm run dev`, open `/` and `/projects/professional`; check the terminal for Turbopack warnings about PostCSS or fonts. Expected: none.

- [x] **Step 7: Docs.** `CLAUDE.md` Stack line: "Next.js 16 App Router + React 19 … TypeScript 6". `README.md`: "Static Next.js 16 site". `planning/00-overview-and-preflight.md` Tech Stack line: append "(upgraded to Next 16 / TS 6 in chunk 10)".

- [x] **Step 8: Gate** (lint still runs through `next lint` at this point; that is fine for one commit).

Commit: `chore(deps): next 16.4 (Turbopack default, tsc-based build type-check)`

### Task 11: ESLint 10 with flat config

**Files:**
- Delete: `.eslintrc.json`
- Create: `eslint.config.mjs`
- Modify: `package.json` (`eslint`, `lint` script)

- [x] **Step 1: Install**

```bash
npm install -D eslint@10.14.0
```

`eslint-config-next@16.4.x` declares `eslint: ">=9.0.0"` and the Next docs state 16.4.0+ supports ESLint 10. If `npm install` reports an `ERESOLVE` from `eslint-plugin-react` or `eslint-plugin-jsx-a11y`, stop and record it: fall back to `eslint@9.39.5` for this tier and note ESLint 10 as a follow-up (do not use `--legacy-peer-deps`).

- [x] **Step 2: Replace the config**

```bash
git rm .eslintrc.json
```

Create `eslint.config.mjs`:

```js
// ESLint 10 reads only flat config. eslint-config-next 16 ships flat presets:
// core-web-vitals (Next + React + hooks + a11y rules) and typescript (typescript-eslint).
import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

export default defineConfig([
  ...nextVitals,
  ...nextTs,
  globalIgnores([".next/**", "out/**", "build/**", "coverage/**", "next-env.d.ts"]),
  {
    rules: {
      // Carried over from .eslintrc.json: test mocks and a few prop bags use `any` on purpose.
      "@typescript-eslint/no-explicit-any": "off",
    },
  },
]);
```

In `package.json` change `"lint": "next lint"` to `"lint": "eslint ."`.

- [x] **Step 3: Run it and triage**

```bash
npm run lint 2>&1 | tail -40
```

Expected: new findings are likely from `eslint-plugin-react-hooks` 7 (React Compiler rules such as `react-hooks/set-state-in-effect`, `react-hooks/refs`, `react-hooks/immutability`, `react-hooks/purity`) and from ESLint 10's `eslint:recommended` additions (`no-unassigned-vars`, `no-useless-assignment`, `preserve-caught-error`). For each:
  - If the fix is local and behaviour-preserving (a `catch (error)` that rethrows without `{ cause: error }`, a dead assignment), fix it.
  - If a React Compiler rule flags an established pattern (e.g. `Globe.tsx` writing `canvas.style` in an effect, `AnimatedSection` state in effects), add a one-line `// eslint-disable-next-line <rule> -- <why>` at the site rather than turning the rule off globally, unless more than five sites share one rule; then disable that rule in `eslint.config.mjs` with a comment and list the sites in the hand-off log.
  - The two existing `eslint-disable-next-line` comments in `src/__tests__/setup.ts` stay valid (`jsx-a11y/anchor-has-content`, `@typescript-eslint/no-unused-vars`); if ESLint reports an unused disable directive, delete that directive.

Expected after triage: `npm run lint` exits 0 with no warnings.

- [x] **Step 4: Confirm nothing else referenced `next lint`**

```bash
grep -rn "next lint\|eslintrc" --include='*.md' --include='*.json' --include='*.ts' --include='*.mjs' . --exclude-dir=node_modules --exclude-dir=.next
```

Expected: only history in `planning/`. Update `CLAUDE.md` Commands (`npm run lint` now runs `eslint .`) and `src/__tests__/README.md` if it names the linter.

- [x] **Step 5: Gate.** Hand-off note: the lint triage list (rules disabled, sites fixed). Do not push. When the owner deploys: home globe, a project page, `/contact` submission end-to-end (Turnstile + EmailJS), `/robots.txt` on both hosts.

Commit: `chore(lint): eslint 10 flat config replaces next lint`

---

## Tier 4: Vitest 5

Continue on `deps-upgrades`.

**OWNER CHECKS (before the branch is deployed, not before this tier runs):** Vercel Node.js version is `22.x`. Noted in the final hand-off.

### Task 12: Vitest 5, Vite 8, plugin-react 6

**Files:**
- Modify: `package.json` (versions, `engines`, remove `test:ui`), `vitest.config.ts` only if Step 3 demands it

- [ ] **Step 1: Install**

```bash
npm install -D vitest@5.0.5 @vitest/coverage-v8@5.0.5 @vitejs/plugin-react@6.1.2 vite@^8.3.5
```

`vite` is explicit because Vitest 5 makes it a peer dependency and plugin-react 6 requires `vite ^8`. If npm reports an `ERESOLVE` on `oxc-transform-react` or `@rolldown/plugin-babel`, those are optional peers of plugin-react; retry with the exact `vite@8.3.5`.

- [ ] **Step 2: Declare the runtime.** In `package.json`, after `"private": true,` add:

```json
  "engines": {
    "node": "22.x"
  },
```

Vercel reads `engines.node` to pick the build image, and Vitest 5 requires ≥ 22.12. Also delete the `"test:ui": "vitest --ui"` script: `@vitest/ui` was never installed, so it has never worked (or install `@vitest/ui@5.0.5` if the owner wants it; the plan deletes).

- [ ] **Step 3: Run the suite**

```bash
npm run test:run 2>&1 | tail -20
npm run content:check 2>&1 | tail -4
```

Expected: green. Vitest 5 changes that could bite and what to do:
  - `clearMocks` now defaults to `true` (call history cleared before each test, implementations kept). A test that counts calls made in a `beforeAll` or at module scope now sees 0: move the action into the test or `beforeEach`. Do not set `clearMocks: false` globally.
  - `vi.mock` / `vi.hoisted` inside a function or `describe` now throws. `grep -rnE "^\s+vi\.mock\(" src/__tests__` is empty today, so none expected.
  - `toThrow('')` matches any error. `grep -rn "toThrow('')" src/__tests__` should be empty.
  - Per-file `// @vitest-environment node` directives are unchanged.
  - Vitest no longer searches parent directories for a config; `vitest.config.ts` is in the root, so no change.

- [ ] **Step 4: Coverage still works**

```bash
npx vitest run --coverage 2>&1 | tail -8
```

Expected: the text table prints; `coverage/` is created (gitignored). Coverage `exclude` patterns without wildcards are now treated as directories (`src/__tests__/` → `src/__tests__/**`), which is what the config meant.

- [ ] **Step 5: Gate.** `npm run lint` must pass with `eslint .` and the new `vite` import graph; `npm run build` runs `content:check` under Vitest 5.

Commit: `chore(deps): vitest 5, vite 8, @vitejs/plugin-react 6; declare node 22.x`

- [ ] **Step 6: STOP. Final hand-off.** Do not start Tier 5. Write the hand-off log entry and report to the owner:
  - Branch `deps-upgrades`, not pushed; `git log --oneline main..deps-upgrades`.
  - `npm outdated` output (expected: only `tailwindcss` 3.4.x → 4.x and `typescript` 6 → 7 remain).
  - `npm audit` result (expected: 0).
  - OWNER CHECKS before deploying: Vercel Node.js version `22.x`; after the preview builds, the checks listed at the end of Tiers 1–3.
  - Suggested PR title: `Chunk 10: dependency upgrades, tiers 1–4 (Tailwind 4 deferred)`.

---

## Tier 5: Tailwind 4 — **DEFERRED, do not execute in this session**

Owner's instruction (2026-11-01): stop before the Tailwind update. This tier stays in the plan so it can be run later, on `deps-upgrades` after Tiers 1–4 have merged or on a fresh branch off `main`. The steps below assume the former; if run from `main`, start with `git checkout -b deps-tailwind-4`.

### Task 13: Run the upgrade tool, then finish by hand

**Files:**
- Modify: `postcss.config.mjs`, `src/app/globals.css`, any `.tsx` the tool rewrites
- Delete: `tailwind.config.ts`
- Test: `src/__tests__/components/ui/Dropdown.test.tsx:531`, `src/__tests__/components/ui/Button.test.tsx:195-196`

- [ ] **Step 1: Capture the current CSS output for later diffing**

```bash
rm -rf .next && npm run build >/dev/null 2>&1 && cp .next/static/css/*.css /tmp/tw3.css 2>/dev/null; ls -la /tmp/tw3.css
```

- [ ] **Step 2: Run the tool**

```bash
npx @tailwindcss/upgrade
git status --short
git diff --stat
```

Expected: it installs `tailwindcss@4.x` and `@tailwindcss/postcss`, rewrites `postcss.config.mjs` to `"@tailwindcss/postcss": {}`, replaces the three `@tailwind` directives in `globals.css` with `@import "tailwindcss";`, migrates `tailwind.config.ts` into `@theme` / `@plugin` / `@custom-variant` lines (and may leave a `@config` line), and renames utilities in `.tsx` files. Read the whole diff before continuing.

- [ ] **Step 3: Pin and tidy the packages**

```bash
npm install -D tailwindcss@4.3.3 @tailwindcss/postcss@4.3.3
grep -n "tailwind" package.json
```

Expected: `tailwindcss ^4.3.3`, `@tailwindcss/postcss ^4.3.3`, `@tailwindcss/typography ^0.5.20` (unchanged; 0.5.x supports v4), `tailwind-merge ^3.7.0` (already v4-aware).

- [ ] **Step 4: Make `globals.css` the single source of truth.** Whatever the tool produced, the top of the file must end up equivalent to this (keep the existing `:root` / `.dark` token blocks and the `.prose` variable overrides that follow; only the head and the three utility blocks change):

```css
@import "tailwindcss";
@plugin "@tailwindcss/typography";

/* next-themes toggles the `dark` class on <html>; keep class-based dark mode. */
@custom-variant dark (&:is(.dark *));

/* Design tokens stay as space-separated HSL triplets on :root/.dark below.
   `inline` makes each utility resolve hsl(var(--x)) where it is used, so the
   .dark overrides and opacity modifiers (bg-primary/50) keep working. */
@theme inline {
  --font-sans: var(--font-geist-sans), system-ui, sans-serif;
  --font-mono: var(--font-geist-mono), monospace;

  --color-background: hsl(var(--background));
  --color-foreground: hsl(var(--foreground));
  --color-secondary-bg: hsl(var(--secondary-bg));

  --color-primary: hsl(var(--primary));
  --color-primary-foreground: hsl(var(--primary-foreground));
  --color-primary-50: hsl(var(--primary-50));
  --color-primary-100: hsl(var(--primary-100));
  --color-primary-200: hsl(var(--primary-200));
  --color-primary-300: hsl(var(--primary-300));
  --color-primary-400: hsl(var(--primary-400));
  --color-primary-500: hsl(var(--primary-500));
  --color-primary-600: hsl(var(--primary-600));
  --color-primary-700: hsl(var(--primary-700));
  --color-primary-800: hsl(var(--primary-800));
  --color-primary-900: hsl(var(--primary-900));
  --color-primary-950: hsl(var(--primary-950));

  --color-secondary: hsl(var(--secondary));
  --color-secondary-foreground: hsl(var(--secondary-foreground));
  --color-secondary-50: hsl(var(--secondary-50));
  --color-secondary-100: hsl(var(--secondary-100));
  --color-secondary-200: hsl(var(--secondary-200));
  --color-secondary-300: hsl(var(--secondary-300));
  --color-secondary-400: hsl(var(--secondary-400));
  --color-secondary-500: hsl(var(--secondary-500));
  --color-secondary-600: hsl(var(--secondary-600));
  --color-secondary-700: hsl(var(--secondary-700));
  --color-secondary-800: hsl(var(--secondary-800));
  --color-secondary-900: hsl(var(--secondary-900));
  --color-secondary-950: hsl(var(--secondary-950));

  --color-accent: hsl(var(--accent));
  --color-accent-foreground: hsl(var(--accent-foreground));
  --color-card: hsl(var(--card));
  --color-card-foreground: hsl(var(--card-foreground));
  --color-popover: hsl(var(--popover));
  --color-popover-foreground: hsl(var(--popover-foreground));
  --color-muted: hsl(var(--muted));
  --color-muted-foreground: hsl(var(--muted-foreground));
  --color-destructive: hsl(var(--destructive));
  --color-destructive-foreground: hsl(var(--destructive-foreground));
  --color-border: hsl(var(--border));
  --color-input: hsl(var(--input));
  --color-ring: hsl(var(--ring));
  --color-chart-1: hsl(var(--chart-1));
  --color-chart-2: hsl(var(--chart-2));
  --color-chart-3: hsl(var(--chart-3));
  --color-chart-4: hsl(var(--chart-4));
  --color-chart-5: hsl(var(--chart-5));

  --radius-lg: var(--radius);
  --radius-md: calc(var(--radius) - 2px);
  --radius-sm: calc(var(--radius) - 4px);

  --animate-orbit: orbit calc(var(--duration) * 1s) linear infinite;
  @keyframes orbit {
    0% {
      transform: rotate(calc(var(--angle) * 1deg)) translateX(calc(var(--radius) * 1px)) rotate(calc(var(--angle) * -1deg));
    }
    100% {
      transform: rotate(calc(var(--angle) * 1deg + 360deg)) translateX(calc(var(--radius) * 1px)) rotate(calc((var(--angle) * -1deg) - 360deg));
    }
  }
}

/* v4 no longer treats classes in @layer components/utilities as utilities
   (they would not respond to variants like md:). Register them explicitly. */
@utility focus-ring {
  @apply focus:outline-hidden focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2;
}

@utility h-screen-dvh {
  height: 100vh;
  height: 100dvh;
}

@layer base {
  /* v4 default changes we do not want: borders default to currentColor and
     buttons to cursor: default. Keep the v3 behaviour the site was designed with
     (v3's default border colour was gray-200; this is the official upgrade-guide recipe). */
  *, ::after, ::before, ::backdrop, ::file-selector-button {
    border-color: var(--color-gray-200, currentColor);
  }
  button:not(:disabled), [role="button"]:not(:disabled) {
    cursor: pointer;
  }
}

/* Typography plugin → design tokens. In v4 the plugin's .prose rules land in the
   utilities layer, so an override inside @layer components or base would lose the
   cascade. Unlayered CSS beats every layer, so these stay outside @layer. */
.prose {
  --tw-prose-body: hsl(var(--foreground));
  /* …keep every existing --tw-prose-* line exactly as it is today… */
}
.prose a {
  text-decoration-thickness: 1px;
  text-underline-offset: 3px;
}
```

The `.prose` block is the existing one from `globals.css` moved out of `@layer components` with its contents unchanged. Remove the old `@layer components { .focus-ring … .prose … }` and `@layer utilities { .h-screen-dvh … }` blocks, and any `@config "./tailwind.config.ts";` line the tool added. Then:

```bash
git rm tailwind.config.ts
grep -rn "tailwind.config\|resolveConfig" src   # expect nothing
```

- [ ] **Step 5: Audit the renamed utilities.** The tool renames `shadow-sm→shadow-xs`, `shadow→shadow-sm`, `rounded-sm→rounded-xs`, `rounded→rounded-sm`, `outline-none→outline-hidden`, `ring→ring-3`, `blur→blur-sm`, `drop-shadow→drop-shadow-sm`, `backdrop-blur→backdrop-blur-sm`, `bg-gradient-to-*→bg-linear-to-*`, and removes `*-opacity-*`. Check two things in the diff:
  1. **Custom radius keys.** The v3 config overrode `rounded-sm/md/lg` with `--radius`-based values. If the tool rewrote any `rounded-sm` to `rounded-xs`, revert those to `rounded-sm` (they must keep mapping to `--radius-sm`), and rewrite any bare `rounded` to `rounded-sm` only if the tool did not already.
  2. **`ring-opacity-5` in `src/components/ui/Dropdown.tsx:55`.** Replace `ring-1 ring-black ring-opacity-5` with `ring-1 ring-black/5`, and update the matching assertion in `src/__tests__/components/ui/Dropdown.test.tsx:531` to `'ring-black/5'`. Update `src/__tests__/components/ui/Button.test.tsx:195-196` to whatever class names `Button.tsx` now carries after the rename (read the component; expected `'rounded-sm'`, `'shadow-sm'`).

```bash
grep -rnE "\b(bg|text|border|ring|divide|placeholder)-opacity-[0-9]+\b|\bflex-(shrink|grow)\b|\boverflow-ellipsis\b|\bbg-gradient-to-" src
```

Expected: nothing.

- [ ] **Step 6: Build and compare**

```bash
rm -rf .next && npm run build 2>&1 | tail -8
npm run test:run 2>&1 | tail -4
```

Expected: build green (Turbopack + `@tailwindcss/postcss` is the supported Next 16 path); tests green after the two assertion updates. Sanity-check the generated CSS contains the tokens: `grep -c "\-\-color-primary" .next/static/css/*.css` ≥ 1 and `grep -c "animate-orbit\|--animate-orbit" .next/static/css/*.css` ≥ 1.

- [ ] **Step 7: Visual pass (the real gate for this tier).** `npm run dev`. For each of `/`, `/projects/professional`, `/projects/personal`, `/projects/calgary-folk-fest`, `/contact`, `/nope` (404): light and dark theme, at 375 px and 1280 px wide. Check specifically:
  - Header, theme dropdown (ring and radius), hero tech orbit animation (`animate-orbit`), globe overlay.
  - Project cards: borders, shadows, `line-clamp-2`, hover states (v4 only applies `hover:` on devices that support hover; on desktop nothing changes).
  - Project detail prose: link colour, bullets, counters, blockquote border (the `--tw-prose-*` overrides).
  - Contact form: input borders, focus ring (`.focus-ring`), button cursor, placeholder colour (v4 default is 50 % of the current text colour; if it looks too faint, add `::placeholder { color: hsl(var(--muted-foreground)); }` to the base layer).
  - Footer and 404 page.
  Fix differences in `globals.css` or the component class list; record each in the hand-off log with the page it affected.

- [ ] **Step 8: Docs.** `CLAUDE.md` Stack line: "Tailwind 4 (tokens in `@theme inline` in `src/app/globals.css`, no `tailwind.config`)". Conventions: "Custom utilities are declared with `@utility` in `globals.css` (`focus-ring`, `h-screen-dvh`)". `planning/00-overview-and-preflight.md` Tech Stack line: note Tailwind 4.

- [ ] **Step 9: Gate.** Do not push. Hand off with the visual-pass notes; the owner repeats the pass on the Vercel preview before merging.

Commit: `feat(styles): tailwind 4 with tokens in @theme inline`

---

## Done when (this session: Tiers 0–4)

- [ ] Branch `deps-upgrades` exists locally, unpushed, with one commit per task above through Task 12.
- [ ] `npm outdated` lists only `tailwindcss` (Tier 5 deferred) and `typescript` 7.x (deliberately deferred).
- [ ] `npm audit` prints `found 0 vulnerabilities`.
- [ ] The gate passes on the branch tip: tsc, `eslint .`, `test:run`, `build`.
- [ ] `planning/README.md` lists chunk 10 with tiers 1–4 ticked and 5 open.
- [ ] `CLAUDE.md` Stack and Commands lines describe the new toolchain (still says Tailwind 3.4).
- [ ] The final hand-off (Task 12 Step 6) is in the hand-off log.

## Deferred, on purpose

- **ESLint 10.** `eslint-config-next@16.4.3` depends on `eslint-plugin-react@7.37`, `eslint-plugin-jsx-a11y@6.10` and `eslint-plugin-import@2.32`, whose `eslint` peer ranges stop at `^9`. ESLint 10 installs only with three `ERESOLVE overriding peer dependency` warnings (on Vercel too) and `npm ls` exits 1, and several of those plugins' rules still call `context.getFilename()` / `getSourceCode()` / `parserOptions`, which ESLint 10 removed. Retry when those three plugins publish ESLint 10 support (watch `npm view eslint-plugin-react peerDependencies.eslint`). The flat config is already in place, so the switch will be a one-line version bump. Dependabot's `majors` group will keep offering it; close those PRs until then.

- **TypeScript 7.** Switch when typescript-eslint supports it (expected alongside the 7.1 API). The alias recipe from the TS 7.0 announcement (`"typescript": "npm:@typescript/typescript6"`, `"@typescript/native": "npm:typescript@^7"`) is the fallback if that takes long.
- **jsdom 30** (needs Node ≥ 22.22) and **`@types/node` 24/26**: follow the runtime when Vercel's default Node moves.

## Verification sources (checked 2026-11-01)

- Next 16 upgrade guide and ESLint page: nextjs.org/docs/app/guides/upgrading/version-16, nextjs.org/docs/app/api-reference/config/eslint (16.4.0 adds ESLint 10 support; `next build` type-checks via the `tsc` CLI by default).
- ESLint 10 migration: eslint.org/docs/latest/use/migrate-to-10.0.0 (eslintrc removed; Node ^20.19 || ^22.13 || >=24).
- typescript-eslint supported ranges: typescript-eslint.io/users/dependency-versions (ESLint ^8.57 || ^9 || ^10; TypeScript >=4.8.4 <6.1.0).
- TypeScript 6.0 and 7.0 announcements: devblogs.microsoft.com/typescript (7.0 has no compiler API; 6.0 is the bridge).
- Vitest 5 migration: vitest.dev/guide/migration.html (Vite ≥ 6.4 peer, Node ≥ 22.12, `clearMocks` default, hoisted `vi.mock` only).
- Tailwind 4 upgrade guide: tailwindcss.com/docs/upgrade-guide; typography README for `@plugin`.
- Motion upgrade guides: motion.dev/docs/upgrade-guide, motion.dev/docs/react-upgrade-guide (no breaking changes in 13/14; import from `motion/react`).
- Lucide v1: lucide.dev/guide/version-1 (brand icons removed, `aria-hidden` default, UMD dropped).
- cobe 2.0.1: `dist/index.d.ts` and `dist/index.esm.js` from the npm tarball (no `onRender`, no rAF; `Globe.update`/`destroy`).
- npm registry `engines` / `peerDependencies` for every target version above.

## Hand-off log

_(append dated notes here)_

**2026-11-01 — Tier 1 (Tasks 1–6), branch `deps-upgrades`, not pushed**
- `npm outdated` before: 27 packages. After Tier 1: @types/node 22.20.5→26.6.6,@vitejs/plugin-react 5.2.0→6.1.2,@vitest/coverage-v8 4.1.12→5.0.5,cobe 0.6.5→2.0.1,eslint 9.39.5→10.14.0,eslint-config-next 15.5.28→16.4.3,framer-motion 12.43.0→14.9.0,next 15.4.11→16.4.3,tailwindcss 3.4.19→4.3.3,typescript 5.9.3→7.0.2,vitest 4.1.12→5.0.5.
- `npm audit`: 24 advisories → 1 moderate (`minimatch` under ESLint 9's own tree: `@eslint/config-array`, typescript-eslint). npm's only offer is `--force` to a downgraded eslint, so it is left for Tier 3, where ESLint 10 and eslint-config-next 16 replace that tree.
- One source change, contrary to the tier's expectation: `react-icons` 5.7 removed `SiLinkedin` (Simple Icons dropped the LinkedIn mark). `src/components/content/Socials.tsx` now uses `FaLinkedin` from `react-icons/fa`, the same set TechOrbit uses for AWS. Same square "in" glyph, Font Awesome's rounded-corner version.
- `npm update` already moved `vite` to 8.3.5 (Vitest 4.1.12's peer range allows ^8), so Tier 4's explicit `vite@^8` is a formality.
- `@testing-library/dom` is now an explicit devDependency (`^10.4.2`), as jest-dom 7 requires.
- Gate after every task: tsc silent, lint clean, 30 files / 430 tests, same route table.

**2026-11-01 — Tier 2 (Tasks 7–8)**
- Task 7: pure rename, spec-reviewed line by line (19 `motion/react` lines). One extra comment edit in `src/components/providers/Providers.tsx`. No separate code-quality review: no new code was written. Lockfile keeps a hoisted `framer-motion` 14.9.0 because `motion` depends on it; that is expected.
- Task 8: the plan's cobe 2 recipe had two defects that review caught, both now fixed and pinned by tests.
  1. **Canvas size.** cobe 2 multiplies `width`/`height` by `devicePixelRatio` itself (old cobe used `clientWidth * dpr` internally and only used the options for a uniform). Passing `offsetWidth * 2` with `devicePixelRatio: 2` rendered 2400×2400 for a 600 px globe. The component now passes CSS pixels and only resends the size when it changes.
  2. **Wrapper div.** cobe 2 moves the canvas into a `<div style="position:relative;width:100%;height:100%">` that `destroy()` leaves behind, so Strict Mode re-runs nest wrappers. Cleanup now unwraps the canvas. The test mock mimics the wrapping.
  3. The plan's rAF test mock (`cb(0); return 42` on every call) recursed to a stack overflow; replaced by a queue of frames with distinct ids, which also catches a cleanup that cancels a stale id. Suite: 30 files / 433 tests.
- **OWNER CHECK (browser):** on `/` the globe should be sharp at its normal size, auto-rotate, drag with the spring, fade in, and show exactly one cobe wrapper div inside the globe container in dev (Strict Mode). A headless check only confirmed the `<canvas>` renders and the dev log is clean.

**2026-11-01 — Tier 3 (Tasks 9–11)**
- **Order swapped: Next 16 (Task 10) landed before TypeScript 6 (Task 9).** TS 6 turns on `noUncheckedSideEffectImports`, which rejects the two plain `.css` side-effect imports in `src/app/layout.tsx` under Next 15's types; Next 16's `types/global.d.ts` declares `*.css`, so doing Next first avoided a throwaway `declare module` file.
- Next 16: `next build` rewrote `tsconfig.json` `jsx: preserve` → `react-jsx` (its new default); kept. `next dev` generates `AGENTS.md` (`agentRules`); committed, noted in `CLAUDE.md`, `agentRules: false` turns it off. `package.json` `next` is now a caret range (`^16.4.3`) like every other dependency; it was an exact `15.4.11` pin from the lockfile saga, which the committed lockfile makes unnecessary. Smoke: all eight routes answered as before, POST `/api/contact/verify` without a token → 400. Build output no longer shows `Size`/`First Load JS`.
- **ESLint 10 blocked, stayed on 9.39.5** (see Deferred). The flat config, `lint: eslint .` and the wider lint scope (configs, `scripts/`, `content/`) are done; the only findings were an unused disable directive in `setup.ts` and a `require()` in `tailwind.config.ts`, now an ESM import whose emitted CSS is byte-identical.
- **Audit correction.** Tier 1's note said "24 → 1 moderate"; the real count after Tier 1 was **18 moderate** from two root advisories, unchanged through Tier 3: `minimatch <11.0.1` (GHSA-g3hv-75wg-m249) under ESLint 9 and eslint-config-next's plugins, and `postcss-selector-parser <6.1.5` (GHSA-rj75-hqrm-r3gf) under `@tailwindcss/typography@0.5.20`. Both dev-only; npm's only "fix" is a downgrade. The first clears when ESLint 10 becomes installable; the second when typography 0.5.21+ or Tailwind 4 (Tier 5) lands.
- Vitest prints a Vite warning that `vitest.config.ts` uses ESM syntax in a file loaded as CJS (`configLoader: 'native'` will be the future default). Harmless on Vite 8.3 today; renaming to `vitest.config.mts` is the fix if Tier 4 turns it into an error.
- Gate after every task: tsc silent, lint clean, 30 files / 433 tests, same routes.
