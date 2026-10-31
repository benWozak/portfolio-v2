# 00 — Overview and pre-flight

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to run the pre-flight tasks at the bottom of this doc. Steps use checkbox (`- [ ]`) syntax for tracking. Every other chunk doc assumes you have read this one.

**Goal:** Replace Payload CMS, Turso and Vercel Blob with JSON files and images committed to the repo; delete the resume and blog sections; redesign the projects section. The site must build and deploy after every chunk.

**Architecture (end state):** A fully static Next.js 15 App Router site. Project content lives in `content/projects/<slug>.json`, images in `public/projects/<slug>/`. A synchronous loader in `src/lib/projects/` validates every file at module init and exposes `getProjects`, `getProjectBySlug`, `getFeaturedProject`, `getAdjacentProjects`. No database, no admin UI, no draft mode, no revalidation, no runtime image processing. The only server-side route left is the Turnstile verification endpoint for the contact form.

**Tech Stack:** Next.js 15.4 (App Router, React 19), Tailwind 3.4, framer-motion, next-themes, Vitest 4 + Testing Library, `react-markdown` + `remark-gfm` (added in chunk 07), `sharp` as a devDependency for content tooling only. Node 22.17, npm.

---

## Decisions (made 2026-10-18, do not relitigate inside a chunk)

| Topic | Decision |
|---|---|
| Blog | Delete entirely. The raw table dump from chunk 01 is the only backup. |
| Resume | Delete entirely. The "View My CV" button at the end of the Experience section is removed, not replaced. |
| Project content shape | One JSON file per project. `overview`, `challenge`, `solution` are strings; `keyTakeaways` is a string array; optional `sections: [{ heading, body }]`. Strings may contain inline Markdown (rendered from chunk 07 on). |
| Media | All project images are downloaded from Vercel Blob into `public/projects/<slug>/` and committed. **Videos are dropped entirely.** No video support anywhere in the new design. |
| Projects index | Featured case study + grid. A client-side web/native filter driven by `?type=` replaces the `/projects/web` and `/projects/native` routes (permanent redirects). |
| Projects detail | Long-scroll case study: hero image, meta strip (status, type, stack chips, links), Overview / Challenge / Solution sections, Key Takeaways callout list, extra Markdown sections, prev/next project navigation. |
| Redesign scope | Projects only. Hero, About, Experience, Contact, Header and Footer stay as they are apart from removing resume and blog references. |
| Sequencing | Strangler. Each chunk is a branch off `main`, merged by PR, deployable on its own. |
| Production rule | The owner personally runs anything that reads or writes the production database or the Blob store. Docs prepare the command and stop at a line marked **OWNER RUNS**. |

## Current state (verified 2026-10-18)

- Branch `audit-improvements` is 12 commits ahead of `main`, local-only, clean tree. It adds two schema-affecting fields to the Projects collection: `slug` and `content`. There is no migrations directory. The sqlite adapter pushes schema changes only when `getPayload()` runs outside production, so whether production Turso has those two columns depends on whether a dev server ever ran against it on this branch. **The pre-flight below answers that question before anything merges.**
- Production content: four projects (HomeChef Companion, Calgary Folk Fest, Tedana App, Vista Crossing, confirm in pre-flight), zero local copies. `dev.db` is stale and tracked in git.
- Media docs store `url` as `/api/media/file/<filename>`, served through Payload. The real object is `https://ua4mmiw8i4jbla3y.public.blob.vercel-storage.com/<encodeURIComponent(filename)>` (no prefix, no random suffix).
- The projects data path is `src/utils/getProjects.ts` plus the hand-written `Project` type in `src/types/index.ts`. `getProjects.ts:7` imports `generateSlug` from `src/collections/hooks/slug.ts`.
- `src/app/(app)/projects/[slug]/page.tsx` is the only non-admin file importing `@payloadcms/*`. It also uses `draftMode`, `LivePreviewToolbar` and `MediaContainer`.
- Lockfiles are gitignored. `package-lock.json` exists locally but is not committed.

## Conventions for every chunk

**Branching.** `git checkout main && git pull && git checkout -b chunk-NN-<short-name>`. One PR per chunk into `main`. Check the Vercel preview deployment before merging. (Exception: pre-flight outcome (b) below changes the base branch for chunks 01 and 02.)

**Commits.** Small and frequent, one logical change each. Conventional-commit prefixes (`feat:`, `chore:`, `refactor:`, `test:`, `docs:`).

**Verification commands** (run all four before opening a PR):

```bash
npx tsc --noEmit
npm run lint
npm run build
npm run test:run
```

**Failing-set check.** There are pre-existing test failures. Compare *sets*, never counts. The baseline is recorded by pre-flight Task 4 into `planning/baseline-test-failures.txt`. After your changes:

```bash
npx vitest run --reporter=json --outputFile=.vitest-current.json >/dev/null 2>&1 || true
node -e '
const r=require("./.vitest-current.json");const out=[];
for(const f of r.testResults)for(const t of f.assertionResults)if(t.status==="failed")out.push(f.name.replace(process.cwd()+"/","")+" :: "+t.fullName);
console.log(out.sort().join("\n"))' > .vitest-current.txt
comm -13 planning/baseline-test-failures.txt .vitest-current.txt   # NEW failures: must be empty
comm -23 planning/baseline-test-failures.txt .vitest-current.txt   # failures that went away (deleted or fixed tests): fine
rm .vitest-current.json .vitest-current.txt
```

If a chunk deletes test files, the baseline shrinks. Update `planning/baseline-test-failures.txt` in that chunk's final commit by regenerating it with the same command and `planning/baseline-test-failures.txt` as the output path.

**Do not touch before chunk 05:** `src/collections/`, `src/access/`, `src/payload.config.ts`, `src/app/(payload)/`. Chunks 03 and 04 are frontend-only removals; the admin keeps working until Payload goes in one piece.

**Schema push guard.** Pre-flight Task 2 adds `PAYLOAD_DB_PUSH=false` to `.env`. Leave it there. It stops a local `next dev` from altering the production schema for the rest of the project.

**Script locations.** Anything that imports a Payload-era package (`@libsql/client`, `@vercel/blob`, `payload`) lives in `scripts/export/` and is deleted in chunk 05. Durable content tooling lives in `scripts/content/`.

**Legacy redirects** (all `permanent: true`, added to the existing `redirects()` in `next.config.ts`):

| Source | Destination | Owned by |
|---|---|---|
| `/resume` | `/` | 03 |
| `/blog` | `/` | 04 |
| `/blog/:slug*` | `/` | 04 |
| `/projects/web` | `/projects?type=web` | 06 |
| `/projects/native` | `/projects?type=native` | 06 |

**Hand-off log.** Each chunk doc ends with a "Hand-off log" section. When you finish a chunk, write one or two lines there about anything that deviated from the plan, then tick the box in `planning/README.md`.

---

## Pre-flight tasks

These happen once, before chunk 01. Tasks 2 and 5 touch production (read-only) and are **OWNER RUNS**.

### Task 1: Toolchain check

- [ ] **Step 1: Confirm Node and install**

```bash
node -v          # expect v22.x
npm install      # no committed lockfile yet; this regenerates package-lock.json locally
```

- [ ] **Step 2: Confirm the baseline build passes on the current branch**

```bash
git status --short     # expect empty
npm run build
```

Expected: build succeeds. If the build hits the database during static generation and fails because `DATABASE_URI` is unreachable, note that in the hand-off log; it does not block pre-flight.

### Task 2: Schema check against production — **OWNER RUNS**

**Files:**
- Create: `scripts/export/preflight.ts`

- [ ] **Step 1: Add the schema push guard**

Append to `.env` (not committed, it is gitignored):

```
PAYLOAD_DB_PUSH=false
```

- [ ] **Step 2: Write the read-only check**

```ts
// scripts/export/preflight.ts
// Read-only: lists the production `projects` columns so we know whether the
// audit-improvements schema (slug, content) ever reached production.
import { loadEnvConfig } from '@next/env'
import { createClient } from '@libsql/client'

loadEnvConfig(process.cwd())

async function main() {
  const url = process.env.DATABASE_URI
  const authToken = process.env.DATABASE_AUTH_TOKEN
  if (!url?.startsWith('libsql://')) {
    throw new Error('DATABASE_URI must be the remote libsql:// Turso URL (refusing to inspect a local file)')
  }
  const db = createClient({ url, authToken })

  const cols = (await db.execute('PRAGMA table_info("projects")')).rows.map((r) => String(r.name))
  const rows = (await db.execute('SELECT name FROM projects')).rows.map((r) => String(r.name))
  const tables = (await db.execute(
    "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' ORDER BY name",
  )).rows.map((r) => String(r.name))

  console.log(`projects rows (${rows.length}):`)
  for (const n of rows) console.log(`  - ${n}`)
  console.log(`\nprojects columns: ${cols.join(', ')}`)
  console.log(`slug column:    ${cols.includes('slug') ? 'PRESENT' : 'MISSING'}`)
  console.log(`content column: ${cols.includes('content') ? 'PRESENT' : 'MISSING'}`)
  console.log(`\ntables (${tables.length}): ${tables.join(', ')}`)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
```

- [ ] **Step 3: OWNER RUNS the check**

```bash
npx tsx scripts/export/preflight.ts
```

Paste the output into the hand-off log at the bottom of this doc.

- [ ] **Step 4: Commit the script**

```bash
git add scripts/export/preflight.ts
git commit -m "chore(planning): read-only production schema pre-flight"
```

### Task 3: Choose the merge path

- [ ] **Step 1: Apply the rule**

| Pre-flight result | What to do |
|---|---|
| **(a)** `slug` PRESENT and `content` PRESENT | Open a PR `audit-improvements → main`, merge, confirm the production deploy renders `/` and `/projects`. All chunks branch from `main`. |
| **(b)** either column MISSING | **Do not merge** `audit-improvements` yet: with the new collection config, `getProjects()` would throw `no such column` and the home page has no fallback. Branch chunks 01 and 02 from `audit-improvements` instead of `main`. After 02 merges into `audit-improvements`, no public route queries Payload for projects any more, so open the PR `audit-improvements → main` then. From chunk 03 on, branch from `main`. Never add the columns by running `next dev` without the push guard. |

- [ ] **Step 2: Record the choice** in the hand-off log below and in `planning/README.md` under Status.

### Task 4: Record the test baseline

- [ ] **Step 1: Generate the failing set**

```bash
npx vitest run --reporter=json --outputFile=.vitest-baseline.json >/dev/null 2>&1 || true
node -e '
const r=require("./.vitest-baseline.json");const out=[];
for(const f of r.testResults)for(const t of f.assertionResults)if(t.status==="failed")out.push(f.name.replace(process.cwd()+"/","")+" :: "+t.fullName);
console.log(out.sort().join("\n"))' > planning/baseline-test-failures.txt
rm .vitest-baseline.json
wc -l planning/baseline-test-failures.txt     # memory says roughly 45; any number is fine, it is a baseline
```

- [ ] **Step 2: Commit**

```bash
git add planning/
git commit -m "docs(planning): overhaul plans and test-failure baseline"
```

### Task 5: Confirm live project slugs — **OWNER RUNS** (read-only, public site)

- [ ] **Step 1: List live project links**

```bash
curl -s https://www.benwozak.dev/projects | grep -oE 'href="/projects/[^"]+"' | sort -u
```

Expected: four hrefs. Save them in the hand-off log. Chunk 01 compares the slugs it generates against this list so no URL changes.

### Task 6: Lockfile policy

- [ ] **Step 1: Decide and record**

Recommended: commit `package-lock.json` in chunk 05 (when the dependency set stabilises) by removing `package-lock.json` from `.gitignore`. Until then Vercel resolves fresh on each deploy, which is the current behaviour. Record the decision in the hand-off log.

---

## Done when

- [ ] `.env` contains `PAYLOAD_DB_PUSH=false`
- [ ] Hand-off log holds the pre-flight output, the merge path chosen, the four live hrefs, and the lockfile decision
- [ ] `planning/baseline-test-failures.txt` is committed
- [ ] Merge path (a): `audit-improvements` is merged and the production deploy is verified. Merge path (b): nothing merged, chunks 01/02 will branch from `audit-improvements`.

## Hand-off log

_(append dated notes here)_

**2026-10-21**
- Task 1: Node v22.17.0, `npm install` was a no-op. `npm run build` on `audit-improvements` passes and statically generates all four `/projects/<slug>` pages through the new collection config, which hints that prod already has `slug`. Task 2 confirms or refutes this. Next warns about multiple lockfiles because of the stray `~/package-lock.json`. This is harmless.
- Task 2 Step 1: the push guard was added to `.env` *before* the Task 1 build (order swapped as a precaution).
- Task 4: the baseline is 45 failing tests across 9 files (555 total). Every failing file fails on assertions and none fail to load, so the set check sees everything. It was committed (`54e2777`) before the preflight script, because `planning/` was already staged and would otherwise have gone into the script's commit.
- Task 5: Claude ran the public GET. Live hrefs: `/projects/calgary-folk-fest`, `/projects/homechef-companion`, `/projects/tedana-app`, `/projects/vista-crossing`. `/projects/web` and `/projects/native` also appear; they are the filter routes.
- Task 6: commit `package-lock.json` in chunk 05, as recommended.
- Tasks 2 Step 3 and Task 3: **PENDING**, waiting for the owner to run `preflight.ts`. `chunk-01-export-content` was branched from `audit-improvements` in the meantime, which works for either merge path.

**2026-10-30**
- Task 2 Step 3, run by the owner. Pre-flight output:
  - The `projects` table has 4 rows: Tedana App, Calgary Folk Fest, Vista Crossing and HomeChef Companion.
  - `slug` is **PRESENT** and `content` is **PRESENT**. 31 tables in all.
  - The dump shows both columns are null in all 4 rows. The live site's slugs are generated from names when pages are read.
- Task 3: merge path **(a)**.
  - Next: open the PR `audit-improvements → main`, merge it, and confirm the production deploy renders `/` and `/projects`.
  - `audit-improvements` has no remote yet, so pushing waits for the owner's go-ahead.
  - `chunk-01-export-content` and `chunk-02-json-data-layer` are already cut from it. Once it is on `main`, their PRs target `main`: 01 first, then 02 rebased onto `main`.
- Task 3 Step 2: the choice is also recorded under Status in `planning/README.md`.
