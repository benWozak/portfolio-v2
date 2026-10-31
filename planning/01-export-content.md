# 01 — Export content from Payload into JSON + public images

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking. Stop at every step marked **OWNER RUNS**.

**Goal:** Produce `content/projects/<slug>.json` files and `public/projects/<slug>/<image>` files that match the production Payload data, validated against the new schema, plus a raw backup of every production table and blob.

**Architecture:** Two scripts. `scripts/export/dump.ts` (owner-run, needs prod secrets) reads every table with raw SQL through `@libsql/client` and downloads every blob with `@vercel/blob`, into `scripts/backups/<stamp>/`. It never loads Payload, so it cannot push schema and does not care which columns exist. `scripts/export/convert-projects.ts` (offline, re-runnable, `--dry-run`) turns that dump into the new JSON shape, copies images into `public/`, precomputes blur placeholders with `sharp`, and validates every record with the same `parseProject` the site will use. The new `Project` type and its validator are created here because the converter needs them; the site starts reading them in chunk 02.

**Tech Stack:** tsx, `@libsql/client` and `@vercel/blob` (already in `node_modules` as Payload transitive deps), `@next/env` for `.env` loading, `sharp`, Vitest.

---

## Prerequisites

- Chunk 00 pre-flight done: `.env` has `PAYLOAD_DB_PUSH=false`; hand-off log has the four live hrefs and the merge path.
- Base branch: `main` if pre-flight chose (a), `audit-improvements` if it chose (b).

## Start

```bash
git checkout <base> && git pull
git checkout -b chunk-01-export-content
ls node_modules/@libsql/client node_modules/@vercel/blob node_modules/@next/env node_modules/sharp   # all four must exist
```

If any is missing: `npm i -D @libsql/client @vercel/blob` (they are removed again in chunk 05).

## File structure

| Path | Responsibility |
|---|---|
| `src/types/project.ts` | **Create.** The new `Project` type and the `PROJECT_TYPES` / `PROJECT_STATUSES` constants. No runtime logic. |
| `src/lib/projects/schema.ts` | **Create.** `parseProject(raw, source, expectedSlug?)`: narrows `unknown` to `Project` or throws `ProjectValidationError` with a path-qualified message. No Next imports (scripts import it too). |
| `src/__tests__/lib/projectSchema.test.ts` | **Create.** Validator tests. |
| `scripts/content/image.ts` | **Create.** `describeImage(buffer)` → `{ width, height, blurDataURL }` and `toPublicFilename(name)`. Durable: chunk 08's new-project helper reuses it. |
| `src/__tests__/scripts/image.test.ts` | **Create.** Image helper test. |
| `scripts/export/dump.ts` | **Create.** Owner-run raw backup. Deleted in chunk 05. |
| `scripts/export/convert-projects.ts` | **Create.** Dump → content. Exports `loadDumpProjects` for chunk 02's parity script. Deleted in chunk 05. |
| `content/projects/<slug>.json`, `content/projects/index.ts` | **Generated** by the converter, then committed and hand-maintained. |
| `public/projects/<slug>/<file>` | **Generated** by the converter, committed. |

---

### Task 1: The new Project type

**Files:**
- Create: `src/types/project.ts`

- [ ] **Step 1: Write the type**

```ts
// src/types/project.ts
// Content schema for content/projects/<slug>.json. Keep in sync with
// src/lib/projects/schema.ts (the runtime validator).

export const PROJECT_TYPES = ['web', 'native'] as const
export const PROJECT_STATUSES = ['In Progress', 'Prototype', 'Professional'] as const

export type ProjectType = (typeof PROJECT_TYPES)[number]
export type ProjectStatus = (typeof PROJECT_STATUSES)[number]

export interface TechStack {
  frontend: string[]
  backend: string[]
  other: string[]
}

export interface ProjectImage {
  /** Public path, always "/projects/<slug>/<file>" */
  src: string
  alt: string
  width: number
  height: number
  /** Tiny webp data URI for next/image placeholder="blur" */
  blurDataURL: string
}

export interface ProjectSection {
  heading: string
  /** Markdown */
  body: string
}

export interface ProjectSeo {
  title?: string
  description?: string
}

export interface Project {
  slug: string
  name: string
  type: ProjectType
  status: ProjectStatus
  featured: boolean
  /** Lower comes first */
  order: number
  /** Plain text, one or two sentences. Used on cards and as the meta description. */
  description: string
  techStack: TechStack
  liveUrl: string | null
  githubUrl: string | null
  image: ProjectImage
  /** Markdown */
  overview: string
  /** Markdown */
  challenge: string
  /** Markdown */
  solution: string
  /** One item per takeaway; inline Markdown allowed */
  keyTakeaways: string[]
  /** Optional extra write-up sections rendered after Key Takeaways */
  sections?: ProjectSection[]
  seo?: ProjectSeo
  /** ISO date, used for sitemap lastModified */
  updatedAt?: string
}
```

- [ ] **Step 2: Type-check and commit**

```bash
npx tsc --noEmit
git add src/types/project.ts
git commit -m "feat(content): add Project content type"
```

### Task 2: Validator (TDD)

**Files:**
- Create: `src/lib/projects/schema.ts`
- Test: `src/__tests__/lib/projectSchema.test.ts`

- [ ] **Step 1: Write the failing tests**

```ts
// src/__tests__/lib/projectSchema.test.ts
import { describe, it, expect } from 'vitest'
import { parseProject, ProjectValidationError } from '@/lib/projects/schema'

const valid = {
  slug: 'demo-app',
  name: 'Demo App',
  type: 'web',
  status: 'Prototype',
  featured: false,
  order: 1,
  description: 'A demo.',
  techStack: { frontend: ['Next.js'], backend: [], other: [] },
  liveUrl: 'https://example.com',
  githubUrl: null,
  image: {
    src: '/projects/demo-app/demo.png',
    alt: 'Demo screenshot',
    width: 1200,
    height: 800,
    blurDataURL: 'data:image/webp;base64,AA==',
  },
  overview: 'o',
  challenge: 'c',
  solution: 's',
  keyTakeaways: ['k1', 'k2'],
}

describe('parseProject', () => {
  it('returns a typed project for valid input', () => {
    const p = parseProject(valid, 'demo-app.json', 'demo-app')
    expect(p.slug).toBe('demo-app')
    expect(p.techStack.frontend).toEqual(['Next.js'])
    expect(p.sections).toBeUndefined()
  })

  it('keeps optional sections, seo and updatedAt when present', () => {
    const p = parseProject(
      { ...valid, sections: [{ heading: 'Notes', body: 'b' }], seo: { title: 't' }, updatedAt: '2026-01-01T00:00:00.000Z' },
      'x',
    )
    expect(p.sections).toEqual([{ heading: 'Notes', body: 'b' }])
    expect(p.seo).toEqual({ title: 't' })
    expect(p.updatedAt).toBe('2026-01-01T00:00:00.000Z')
  })

  it.each([
    ['non-object', 'nope'],
    ['bad type', { ...valid, type: 'desktop' }],
    ['bad status', { ...valid, status: 'Done' }],
    ['bad slug format', { ...valid, slug: 'Demo App' }],
    ['non-boolean featured', { ...valid, featured: 'yes' }],
    ['non-integer order', { ...valid, order: 1.5 }],
    ['empty name', { ...valid, name: '  ' }],
    ['techStack item not string', { ...valid, techStack: { ...valid.techStack, backend: [1] } }],
    ['image src outside slug folder', { ...valid, image: { ...valid.image, src: '/other/demo.png' } }],
    ['image blur not a data URI', { ...valid, image: { ...valid.image, blurDataURL: 'nope' } }],
    ['image width zero', { ...valid, image: { ...valid.image, width: 0 } }],
    ['keyTakeaways as string', { ...valid, keyTakeaways: 'one' }],
    ['relative liveUrl', { ...valid, liveUrl: '/relative' }],
    ['section without body', { ...valid, sections: [{ heading: 'h', body: '' }] }],
    ['bad updatedAt', { ...valid, updatedAt: 'yesterday' }],
  ])('rejects %s', (_label, raw) => {
    expect(() => parseProject(raw, 'x')).toThrow(ProjectValidationError)
  })

  it('rejects a slug that differs from the file name', () => {
    expect(() => parseProject(valid, 'other.json', 'other')).toThrow(/must equal the file name/)
  })

  it('names the source and path in the error', () => {
    expect(() => parseProject({ ...valid, type: 'x' }, 'content/projects/demo-app.json')).toThrow(
      /^content\/projects\/demo-app\.json: type /,
    )
  })
})
```

- [ ] **Step 2: Run to verify failure**

```bash
npx vitest run src/__tests__/lib/projectSchema.test.ts
```

Expected: FAIL, `Cannot find module '@/lib/projects/schema'`.

- [ ] **Step 3: Implement the validator**

```ts
// src/lib/projects/schema.ts
// Runtime validator for content/projects/*.json. Hand-rolled on purpose: one
// schema does not justify a dependency. Must stay free of Next.js imports
// because scripts/export and scripts/content import it under tsx.
import {
  PROJECT_STATUSES,
  PROJECT_TYPES,
  type Project,
  type ProjectSection,
  type ProjectSeo,
  type ProjectStatus,
  type ProjectType,
} from '../../types/project'

export class ProjectValidationError extends Error {
  constructor(source: string, path: string, message: string) {
    super(`${source}: ${path} ${message}`)
    this.name = 'ProjectValidationError'
  }
}

const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/
const ABSOLUTE_URL_RE = /^https?:\/\//

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null && !Array.isArray(v)
}

export function parseProject(raw: unknown, source: string, expectedSlug?: string): Project {
  const fail = (path: string, message: string): never => {
    throw new ProjectValidationError(source, path, message)
  }

  if (!isRecord(raw)) fail('$', 'must be an object')
  const r = raw as Record<string, unknown>

  const str = (obj: Record<string, unknown>, key: string, path = key): string => {
    const v = obj[key]
    if (typeof v !== 'string') fail(path, 'must be a string')
    if ((v as string).trim() === '') fail(path, 'must not be empty')
    return v as string
  }
  const strArray = (obj: Record<string, unknown>, key: string, path: string): string[] => {
    const v = obj[key]
    if (!Array.isArray(v) || !v.every((x) => typeof x === 'string' && x.trim() !== '')) {
      fail(path, 'must be an array of non-empty strings')
    }
    return v as string[]
  }
  const posInt = (obj: Record<string, unknown>, key: string, path: string): number => {
    const v = obj[key]
    if (!Number.isInteger(v) || (v as number) <= 0) fail(path, 'must be a positive integer')
    return v as number
  }
  const urlOrNull = (key: string): string | null => {
    const v = r[key]
    if (v === null || v === undefined) return null
    if (typeof v !== 'string' || !ABSOLUTE_URL_RE.test(v)) fail(key, 'must be an absolute http(s) URL or null')
    return v as string
  }

  const slug = str(r, 'slug')
  if (!SLUG_RE.test(slug)) fail('slug', 'must be lowercase words separated by single hyphens')
  if (expectedSlug !== undefined && slug !== expectedSlug) fail('slug', `must equal the file name "${expectedSlug}"`)

  const type = str(r, 'type')
  if (!(PROJECT_TYPES as readonly string[]).includes(type)) fail('type', `must be one of: ${PROJECT_TYPES.join(', ')}`)
  const status = str(r, 'status')
  if (!(PROJECT_STATUSES as readonly string[]).includes(status)) {
    fail('status', `must be one of: ${PROJECT_STATUSES.join(', ')}`)
  }

  if (typeof r.featured !== 'boolean') fail('featured', 'must be a boolean')
  if (!Number.isInteger(r.order)) fail('order', 'must be an integer')

  if (!isRecord(r.techStack)) fail('techStack', 'must be an object')
  const ts = r.techStack as Record<string, unknown>
  const techStack = {
    frontend: strArray(ts, 'frontend', 'techStack.frontend'),
    backend: strArray(ts, 'backend', 'techStack.backend'),
    other: strArray(ts, 'other', 'techStack.other'),
  }

  if (!isRecord(r.image)) fail('image', 'must be an object')
  const img = r.image as Record<string, unknown>
  const src = str(img, 'src', 'image.src')
  if (!src.startsWith(`/projects/${slug}/`)) fail('image.src', `must start with "/projects/${slug}/"`)
  const blurDataURL = str(img, 'blurDataURL', 'image.blurDataURL')
  if (!blurDataURL.startsWith('data:image/')) fail('image.blurDataURL', 'must be a data:image/ URI')
  const image = {
    src,
    alt: str(img, 'alt', 'image.alt'),
    width: posInt(img, 'width', 'image.width'),
    height: posInt(img, 'height', 'image.height'),
    blurDataURL,
  }

  const keyTakeaways = strArray(r, 'keyTakeaways', 'keyTakeaways')

  let sections: ProjectSection[] | undefined
  if (r.sections !== undefined) {
    if (!Array.isArray(r.sections)) fail('sections', 'must be an array')
    sections = (r.sections as unknown[]).map((s, i) => {
      if (!isRecord(s)) fail(`sections[${i}]`, 'must be an object')
      const sec = s as Record<string, unknown>
      return { heading: str(sec, 'heading', `sections[${i}].heading`), body: str(sec, 'body', `sections[${i}].body`) }
    })
  }

  let seo: ProjectSeo | undefined
  if (r.seo !== undefined) {
    if (!isRecord(r.seo)) fail('seo', 'must be an object')
    const s = r.seo as Record<string, unknown>
    seo = {}
    if (s.title !== undefined) seo.title = str(s, 'title', 'seo.title')
    if (s.description !== undefined) seo.description = str(s, 'description', 'seo.description')
  }

  let updatedAt: string | undefined
  if (r.updatedAt !== undefined) {
    updatedAt = str(r, 'updatedAt')
    if (Number.isNaN(Date.parse(updatedAt))) fail('updatedAt', 'must be an ISO date string')
  }

  return {
    slug,
    name: str(r, 'name'),
    type: type as ProjectType,
    status: status as ProjectStatus,
    featured: r.featured as boolean,
    order: r.order as number,
    description: str(r, 'description'),
    techStack,
    liveUrl: urlOrNull('liveUrl'),
    githubUrl: urlOrNull('githubUrl'),
    image,
    overview: str(r, 'overview'),
    challenge: str(r, 'challenge'),
    solution: str(r, 'solution'),
    keyTakeaways,
    ...(sections ? { sections } : {}),
    ...(seo ? { seo } : {}),
    ...(updatedAt ? { updatedAt } : {}),
  }
}
```

- [ ] **Step 4: Run to verify pass**

```bash
npx vitest run src/__tests__/lib/projectSchema.test.ts
```

Expected: all tests PASS.

- [ ] **Step 5: Commit**

```bash
git add src/lib/projects/schema.ts src/__tests__/lib/projectSchema.test.ts
git commit -m "feat(content): runtime validator for project JSON"
```

### Task 3: Image helper (TDD)

**Files:**
- Create: `scripts/content/image.ts`
- Test: `src/__tests__/scripts/image.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
// src/__tests__/scripts/image.test.ts
import { describe, it, expect } from 'vitest'
import sharp from 'sharp'
import { describeImage, toPublicFilename } from '../../../scripts/content/image'

describe('describeImage', () => {
  it('returns dimensions and a webp blur data URI', async () => {
    const png = await sharp({ create: { width: 64, height: 32, channels: 3, background: '#f26322' } }).png().toBuffer()
    const meta = await describeImage(png)
    expect(meta.width).toBe(64)
    expect(meta.height).toBe(32)
    expect(meta.blurDataURL.startsWith('data:image/webp;base64,')).toBe(true)
    expect(meta.blurDataURL.length).toBeLessThan(2000)
  })
})

describe('toPublicFilename', () => {
  it('lower-cases and hyphenates whitespace', () => {
    expect(toPublicFilename('Recipe App Final.PNG')).toBe('recipe-app-final.png')
  })
})
```

- [ ] **Step 2: Run to verify failure**

```bash
npx vitest run src/__tests__/scripts/image.test.ts
```

Expected: FAIL, cannot find module `scripts/content/image`.

- [ ] **Step 3: Implement**

```ts
// scripts/content/image.ts
// Shared by scripts/export/convert-projects.ts (chunk 01) and
// scripts/content/new-project.ts (chunk 08). Node-only (sharp).
import sharp from 'sharp'

export interface ProjectImageMeta {
  width: number
  height: number
  blurDataURL: string
}

export function toPublicFilename(filename: string): string {
  return filename.trim().toLowerCase().replace(/\s+/g, '-')
}

export async function describeImage(buffer: Buffer): Promise<ProjectImageMeta> {
  const meta = await sharp(buffer).metadata()
  if (!meta.width || !meta.height) throw new Error('could not read image dimensions')
  const blur = await sharp(buffer).resize(16, undefined, { fit: 'inside' }).webp({ quality: 40 }).toBuffer()
  return {
    width: meta.width,
    height: meta.height,
    blurDataURL: `data:image/webp;base64,${blur.toString('base64')}`,
  }
}
```

- [ ] **Step 4: Run to verify pass, then commit**

```bash
npx vitest run src/__tests__/scripts/image.test.ts
git add scripts/content/image.ts src/__tests__/scripts/image.test.ts
git commit -m "feat(content): image dimension + blur helper"
```

### Task 4: Raw production dump — **OWNER RUNS**

**Files:**
- Create: `scripts/export/dump.ts`

- [ ] **Step 1: Write the dump script**

```ts
// scripts/export/dump.ts
// One-time raw backup of production: every table as JSON, every blob as a file.
// Uses raw SQL + the Blob SDK only. Never loads Payload, so it cannot push schema.
// Output: scripts/backups/<ISO stamp>/ (gitignored). Contains PII (resume, user emails):
// copy it somewhere safe outside the repo after running.
import { loadEnvConfig } from '@next/env'
import { createClient } from '@libsql/client'
import { list } from '@vercel/blob'
import { execSync } from 'node:child_process'
import { mkdir, readFile, stat, writeFile } from 'node:fs/promises'
import path from 'node:path'

loadEnvConfig(process.cwd())

const SENSITIVE_USER_COLUMNS = new Set(['hash', 'salt', 'reset_password_token', 'reset_password_expiration'])
const SKIP_TABLES = new Set(['users_sessions'])

type Row = Record<string, unknown>

async function main() {
  const url = process.env.DATABASE_URI
  const authToken = process.env.DATABASE_AUTH_TOKEN
  const blobToken = process.env.BLOB_READ_WRITE_TOKEN
  if (!url?.startsWith('libsql://')) throw new Error('DATABASE_URI must be the remote libsql:// Turso URL (refusing to dump a local file)')
  if (!authToken) throw new Error('DATABASE_AUTH_TOKEN is not set')
  if (!blobToken) throw new Error('BLOB_READ_WRITE_TOKEN is not set')

  const stamp = new Date().toISOString().replace(/[:.]/g, '-')
  const outDir = path.join('scripts', 'backups', stamp)
  await mkdir(path.join(outDir, 'tables'), { recursive: true })
  await mkdir(path.join(outDir, 'blobs'), { recursive: true })
  console.log(`writing to ${outDir}`)

  const db = createClient({ url, authToken })

  // 1. Schema
  const tableNames = (await db.execute(
    "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' AND name NOT LIKE '__drizzle%' ORDER BY name",
  )).rows.map((r) => String(r.name))
  const schema: Record<string, Row[]> = {}
  for (const t of tableNames) {
    const info = await db.execute(`PRAGMA table_info("${t}")`)
    schema[t] = info.rows.map((r) => ({ name: r.name, type: r.type, notnull: r.notnull, pk: r.pk }))
  }
  await writeFile(path.join(outDir, 'schema.json'), JSON.stringify(schema, null, 2))
  const projectCols = (schema.projects ?? []).map((c) => String(c.name))
  console.log(`projects columns: ${projectCols.join(', ')}`)
  console.log(`  slug: ${projectCols.includes('slug') ? 'present' : 'MISSING'}  content: ${projectCols.includes('content') ? 'present' : 'MISSING'}`)

  // 2. Tables
  const counts: Record<string, number> = {}
  for (const t of tableNames) {
    if (SKIP_TABLES.has(t)) continue
    const res = await db.execute(`SELECT * FROM "${t}"`)
    let rows: Row[] = res.rows.map((r) => Object.fromEntries(res.columns.map((c, i) => [c, r[i]])))
    if (t === 'users') {
      rows = rows.map((r) => Object.fromEntries(Object.entries(r).filter(([k]) => !SENSITIVE_USER_COLUMNS.has(k))))
    }
    counts[t] = rows.length
    await writeFile(path.join(outDir, 'tables', `${t}.json`), JSON.stringify(rows, null, 2))
    console.log(`  ${t}: ${rows.length} rows`)
  }

  // 3. Blobs
  const blobs: Array<{ pathname: string; url: string; downloadUrl: string; size: number; uploadedAt: string }> = []
  let cursor: string | undefined
  do {
    const page = await list({ token: blobToken, cursor, limit: 1000 })
    for (const b of page.blobs) {
      blobs.push({ pathname: b.pathname, url: b.url, downloadUrl: b.downloadUrl, size: b.size, uploadedAt: b.uploadedAt.toISOString() })
    }
    cursor = page.hasMore ? page.cursor : undefined
  } while (cursor)
  await writeFile(path.join(outDir, 'blobs.json'), JSON.stringify(blobs, null, 2))

  let bytes = 0
  for (const b of blobs) {
    const dest = path.join(outDir, 'blobs', b.pathname)
    await mkdir(path.dirname(dest), { recursive: true })
    const res = await fetch(b.downloadUrl)
    if (!res.ok) throw new Error(`download failed for ${b.pathname}: HTTP ${res.status}`)
    await writeFile(dest, Buffer.from(await res.arrayBuffer()))
    const { size } = await stat(dest)
    if (size !== b.size) throw new Error(`size mismatch for ${b.pathname}: expected ${b.size}, got ${size}`)
    bytes += size
    console.log(`  blob ${b.pathname} (${size} bytes)`)
  }

  // 4. Cross-check media rows vs blobs
  const media = JSON.parse(await readFile(path.join(outDir, 'tables', 'media.json'), 'utf8')) as Array<{ filename: string }>
  const blobSet = new Set(blobs.map((b) => b.pathname))
  const mediaSet = new Set(media.map((m) => m.filename))
  const missingBlobs = [...mediaSet].filter((f) => !blobSet.has(f))
  const orphanBlobs = [...blobSet].filter((p) => !mediaSet.has(p))
  if (missingBlobs.length) console.warn(`WARNING media rows with no blob: ${missingBlobs.join(', ')}`)
  if (orphanBlobs.length) console.warn(`note: blobs with no media row (harmless): ${orphanBlobs.join(', ')}`)

  // 5. Manifest
  const manifest = {
    createdAt: new Date().toISOString(),
    gitSha: execSync('git rev-parse HEAD').toString().trim(),
    databaseHost: new URL(url).host,
    tableCounts: counts,
    blobCount: blobs.length,
    blobBytes: bytes,
    missingBlobs,
    orphanBlobs,
  }
  await writeFile(path.join(outDir, 'manifest.json'), JSON.stringify(manifest, null, 2))
  console.log(`\ndone: ${Object.keys(counts).length} tables, ${blobs.length} blobs, ${bytes} bytes`)
  console.log(`copy ${outDir} outside the repo now (it is gitignored and contains PII).`)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
```

- [ ] **Step 2: Type-check and commit the script before running it**

```bash
npx tsc --noEmit
git add scripts/export/dump.ts
git commit -m "chore(export): raw production dump script"
```

- [ ] **Step 3: OWNER RUNS the dump**

```bash
npx tsx scripts/export/dump.ts
```

Expected: a `scripts/backups/<stamp>/` folder with `schema.json`, `manifest.json`, `blobs.json`, `tables/*.json`, `blobs/*`. The console shows `projects: 4 rows` (or whatever the live count is) and one `blob …` line per file. No `WARNING` lines about missing blobs.

- [ ] **Step 4: OWNER copies the backup off-repo**

```bash
cp -R scripts/backups/<stamp> ~/Backups/portfolio-payload-<stamp>
```

Record the stamp and the copy location in the hand-off log.

### Task 5: Converter

**Files:**
- Create: `scripts/export/convert-projects.ts`

- [ ] **Step 1: Confirm table and column names in the dump**

```bash
node -e 'const s=require("./scripts/backups/'"<stamp>"'/schema.json"); for (const t of Object.keys(s)) if (t.startsWith("projects")||t==="media") console.log(t, "=>", s[t].map(c=>c.name).join(", "))'
```

Expected tables: `projects`, `projects_tech_stack_frontend`, `projects_tech_stack_backend`, `projects_tech_stack_other`, `media`. Expected `projects` columns include `name, type, status, description, overview, challenge, solution, key_takeaways, live_url, github_url, order, featured, media_static_image_id, media_video_id, seo_meta_title, seo_meta_description, seo_og_image_id, updated_at` and possibly `slug, content`. Tech stack tables have `_order, _parent_id, id, technology`. If the names differ, adjust the `COLS` map in the script below; everything else is driven by it.

- [ ] **Step 2: Write the converter**

```ts
// scripts/export/convert-projects.ts
// Offline, idempotent: turns a scripts/backups/<stamp>/ dump into
// content/projects/<slug>.json, content/projects/index.ts and public/projects/<slug>/<image>.
//
//   npx tsx scripts/export/convert-projects.ts --from scripts/backups/<stamp> [--dry-run]
//
// Deleted in chunk 05 together with the rest of scripts/export/.
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import path from 'node:path'
import { parseProject } from '../../src/lib/projects/schema'
import type { Project, ProjectSection } from '../../src/types/project'
import { describeImage, toPublicFilename } from '../content/image'

type Row = Record<string, unknown>

// ---- column map (adjust here if schema.json shows different names) -------------
const COLS = {
  projects: 'projects',
  techFrontend: 'projects_tech_stack_frontend',
  techBackend: 'projects_tech_stack_backend',
  techOther: 'projects_tech_stack_other',
  media: 'media',
  p: {
    id: 'id', name: 'name', slug: 'slug', type: 'type', status: 'status', description: 'description',
    overview: 'overview', challenge: 'challenge', solution: 'solution', keyTakeaways: 'key_takeaways',
    content: 'content', liveUrl: 'live_url', githubUrl: 'github_url', order: 'order', featured: 'featured',
    staticImage: 'media_static_image_id', video: 'media_video_id',
    seoTitle: 'seo_meta_title', seoDescription: 'seo_meta_description', seoOgImage: 'seo_og_image_id',
    updatedAt: 'updated_at', createdAt: 'created_at',
  },
  tech: { parent: '_parent_id', order: '_order', technology: 'technology' },
  m: { id: 'id', filename: 'filename', alt: 'alt' },
} as const

// ---- helpers -------------------------------------------------------------------
const AUTO_HEADINGS: Record<string, 'overview' | 'challenge' | 'solution' | 'keyTakeaways'> = {
  Overview: 'overview', Challenge: 'challenge', Solution: 'solution', 'Key Takeaways': 'keyTakeaways',
}

// Copied verbatim from src/collections/hooks/slug.ts so this script survives chunk 05.
function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
}

function requireCol<T = unknown>(row: Row, col: string, source: string): T {
  if (!(col in row)) throw new Error(`${source}: column "${col}" missing. Present: ${Object.keys(row).join(', ')}`)
  return row[col] as T
}
const optCol = <T = unknown>(row: Row, col: string): T | undefined => (col in row ? (row[col] as T) : undefined)

function normalizeText(v: unknown): string {
  return String(v ?? '').replace(/\r\n?/g, '\n').replace(/\n{3,}/g, '\n\n').trim()
}
const squash = (s: string) => s.replace(/\s+/g, ' ').trim()

function splitTakeaways(text: string, warn: (m: string) => void): string[] {
  const items = text
    .split('\n')
    .map((l) => l.replace(/^\s*(?:[-*•]|\d+[.)])\s*/, '').trim())
    .filter(Boolean)
  if (items.length === 1 && (items[0].match(/[.!?](\s|$)/g) ?? []).length > 1) {
    warn('keyTakeaways is a single multi-sentence item; split it by hand in the JSON')
  }
  return items
}

async function readTable(from: string, name: string): Promise<Row[]> {
  const file = path.join(from, 'tables', `${name}.json`)
  if (!existsSync(file)) throw new Error(`table dump not found: ${file}`)
  return JSON.parse(await readFile(file, 'utf8')) as Row[]
}

// ---- Lexical -> Markdown (strict: throws on anything unexpected) -----------------
interface LexNode {
  type: string
  children?: LexNode[]
  text?: string
  format?: number | string
  tag?: string
  listType?: string
  checked?: boolean
  fields?: { url?: string; linkType?: string }
  url?: string
}

const nodeText = (n: LexNode): string =>
  n.type === 'text' ? n.text ?? '' : n.type === 'linebreak' ? '\n' : (n.children ?? []).map(nodeText).join('')

function inline(nodes: LexNode[], warn: (m: string) => void): string {
  return nodes
    .map((n) => {
      switch (n.type) {
        case 'text': {
          let t = n.text ?? ''
          const f = typeof n.format === 'number' ? n.format : 0
          if (f & 16) t = '`' + t + '`'
          if (f & 1) t = `**${t}**`
          if (f & 2) t = `*${t}*`
          if (f & 4) t = `~~${t}~~`
          if (f & (8 | 32 | 64 | 128)) warn(`dropped unsupported text format ${f} on "${t.slice(0, 30)}"`)
          return t
        }
        case 'linebreak':
          return '  \n'
        case 'link':
        case 'autolink': {
          const url = n.fields?.url ?? n.url ?? ''
          if (n.fields?.linkType === 'internal') warn(`internal link to "${url}" — verify by hand`)
          return `[${inline(n.children ?? [], warn)}](${url})`
        }
        default:
          throw new Error(`unsupported inline Lexical node "${n.type}"`)
      }
    })
    .join('')
}

function block(n: LexNode, warn: (m: string) => void, depth = 0): string {
  switch (n.type) {
    case 'paragraph':
      return inline(n.children ?? [], warn)
    case 'heading': {
      const level = Math.max(2, Number((n.tag ?? 'h2').slice(1)) || 2)
      return `${'#'.repeat(level)} ${inline(n.children ?? [], warn)}`
    }
    case 'quote':
      return inline(n.children ?? [], warn).split('\n').map((l) => `> ${l}`).join('\n')
    case 'horizontalrule':
      return '---'
    case 'list': {
      const ordered = n.listType === 'number'
      return (n.children ?? [])
        .map((li, i) => {
          const marker = ordered ? `${i + 1}. ` : n.listType === 'check' ? (li.checked ? '- [x] ' : '- [ ] ') : '- '
          const own = (li.children ?? []).filter((c) => c.type !== 'list')
          const nested = (li.children ?? []).filter((c) => c.type === 'list')
          const line = '  '.repeat(depth) + marker + inline(own, warn)
          return [line, ...nested.map((l) => block(l, warn, depth + 1))].join('\n')
        })
        .join('\n')
    }
    default:
      throw new Error(`unsupported block Lexical node "${n.type}"`)
  }
}

function lexicalToSections(
  contentRaw: unknown,
  textareas: Record<'overview' | 'challenge' | 'solution' | 'keyTakeaways', string>,
  warn: (m: string) => void,
): ProjectSection[] {
  if (contentRaw === null || contentRaw === undefined || contentRaw === '') return []
  const state = typeof contentRaw === 'string' ? JSON.parse(contentRaw) : contentRaw
  const children: LexNode[] = state?.root?.children ?? []
  const groups: { heading: string | null; nodes: LexNode[] }[] = []
  for (const n of children) {
    if (n.type === 'heading') {
      if (n.tag !== 'h2') warn(`heading <${n.tag}> treated as a section boundary`)
      groups.push({ heading: nodeText(n).trim(), nodes: [] })
    } else {
      if (!groups.length) groups.push({ heading: null, nodes: [] })
      groups[groups.length - 1].nodes.push(n)
    }
  }
  // Strip the sections the migration script generated from the four textareas; the textareas win.
  while (groups.length && groups[0].heading && groups[0].heading in AUTO_HEADINGS) {
    const g = groups.shift()!
    const key = AUTO_HEADINGS[g.heading!]
    if (squash(g.nodes.map(nodeText).join('\n')) !== squash(textareas[key])) {
      warn(`auto-generated "${g.heading}" section differs from the ${key} field; kept the field`)
    }
  }
  return groups
    .map((g) => ({ heading: g.heading ?? 'Notes', body: g.nodes.map((n) => block(n, warn)).join('\n\n').trim() }))
    .filter((s) => s.body.length > 0)
}

// ---- dump -> intermediate records (also used by chunk 02's parity script) ----------
export interface DumpProject {
  id: string
  slug: string
  name: string
  type: string
  status: string
  description: string
  overview: string
  challenge: string
  solution: string
  keyTakeaways: string[]
  sections: ProjectSection[]
  techStack: { frontend: string[]; backend: string[]; other: string[] }
  liveUrl: string | null
  githubUrl: string | null
  order: number
  featured: boolean
  seo?: { title?: string; description?: string }
  updatedAt?: string
  imageFilename: string
  imageAlt: string
  droppedVideo?: string
  warnings: string[]
}

export async function loadDumpProjects(from: string): Promise<DumpProject[]> {
  const [projects, fe, be, ot, media] = await Promise.all([
    readTable(from, COLS.projects),
    readTable(from, COLS.techFrontend),
    readTable(from, COLS.techBackend),
    readTable(from, COLS.techOther),
    readTable(from, COLS.media),
  ])
  const mediaById = new Map(media.map((m) => [String(requireCol(m, COLS.m.id, 'media')), m]))
  const techFor = (rows: Row[], parentId: string) =>
    rows
      .filter((r) => String(requireCol(r, COLS.tech.parent, 'tech')) === parentId)
      .sort((a, b) => Number(a[COLS.tech.order]) - Number(b[COLS.tech.order]))
      .map((r) => String(requireCol(r, COLS.tech.technology, 'tech')).trim())
      .filter(Boolean)

  const sorted = [...projects].sort((a, b) => Number(a[COLS.p.order] ?? 999) - Number(b[COLS.p.order] ?? 999))
  return sorted.map((p, index) => {
    const warnings: string[] = []
    const warn = (m: string) => warnings.push(m)
    const src = `projects#${p[COLS.p.id]}`
    const name = String(requireCol(p, COLS.p.name, src)).trim()
    const storedSlug = optCol<string | null>(p, COLS.p.slug)
    const slug = (storedSlug ?? '').trim() || generateSlug(name)
    if (!storedSlug) warn(`no stored slug; derived "${slug}" from the name`)

    const textareas = {
      overview: normalizeText(requireCol(p, COLS.p.overview, src)),
      challenge: normalizeText(requireCol(p, COLS.p.challenge, src)),
      solution: normalizeText(requireCol(p, COLS.p.solution, src)),
      keyTakeaways: normalizeText(requireCol(p, COLS.p.keyTakeaways, src)),
    }

    const orderRaw = optCol<number | null>(p, COLS.p.order)
    const order = Number.isInteger(orderRaw) ? (orderRaw as number) : index + 1
    if (!Number.isInteger(orderRaw)) warn(`no order; assigned ${order} by position`)

    const imageId = requireCol<number | string | null>(p, COLS.p.staticImage, src)
    const image = imageId === null ? undefined : mediaById.get(String(imageId))
    if (!image) throw new Error(`${src} (${name}): static image ${imageId} not found in media table`)

    const videoId = optCol<number | string | null>(p, COLS.p.video)
    const droppedVideo = videoId ? String(mediaById.get(String(videoId))?.[COLS.m.filename] ?? videoId) : undefined
    if (droppedVideo) warn(`dropped video ${droppedVideo} (videos are out of scope)`)
    if (optCol(p, COLS.p.seoOgImage)) warn('dropped seo.ogImage (detail page uses image.src for OG)')

    const seo: { title?: string; description?: string } = {}
    const seoTitle = normalizeText(optCol(p, COLS.p.seoTitle))
    const seoDescription = normalizeText(optCol(p, COLS.p.seoDescription))
    if (seoTitle) seo.title = seoTitle
    if (seoDescription) seo.description = seoDescription

    const updatedRaw = optCol<string | null>(p, COLS.p.updatedAt)
    const updatedAt = updatedRaw && !Number.isNaN(Date.parse(updatedRaw)) ? new Date(updatedRaw).toISOString() : undefined

    return {
      id: String(p[COLS.p.id]),
      slug,
      name,
      type: String(requireCol(p, COLS.p.type, src)),
      status: String(requireCol(p, COLS.p.status, src)),
      description: normalizeText(requireCol(p, COLS.p.description, src)),
      ...textareas,
      keyTakeaways: splitTakeaways(textareas.keyTakeaways, warn),
      sections: lexicalToSections(optCol(p, COLS.p.content), textareas, warn),
      techStack: { frontend: techFor(fe, String(p[COLS.p.id])), backend: techFor(be, String(p[COLS.p.id])), other: techFor(ot, String(p[COLS.p.id])) },
      liveUrl: normalizeText(optCol(p, COLS.p.liveUrl)) || null,
      githubUrl: normalizeText(optCol(p, COLS.p.githubUrl)) || null,
      order,
      featured: Boolean(optCol(p, COLS.p.featured)),
      ...(Object.keys(seo).length ? { seo } : {}),
      ...(updatedAt ? { updatedAt } : {}),
      imageFilename: String(requireCol(image, COLS.m.filename, 'media')),
      imageAlt: String(optCol(image, COLS.m.alt) ?? name),
      droppedVideo,
      warnings,
    }
  })
}

// ---- write content files --------------------------------------------------------
function toIdentifier(slug: string): string {
  const id = slug.replace(/-([a-z0-9])/g, (_, c: string) => c.toUpperCase())
  return /^[0-9]/.test(id) ? `p${id}` : id
}

async function main() {
  const args = process.argv.slice(2)
  const flag = (name: string) => {
    const i = args.indexOf(name)
    return i === -1 ? undefined : args[i + 1]
  }
  const from = flag('--from')
  if (!from) throw new Error('usage: --from scripts/backups/<stamp> [--dry-run]')
  const dryRun = args.includes('--dry-run')
  const outDir = 'content/projects'
  const publicDir = 'public/projects'

  const records = await loadDumpProjects(from)
  const written: Project[] = []

  for (const rec of records) {
    const buf = await readFile(path.join(from, 'blobs', rec.imageFilename))
    const meta = await describeImage(buf)
    const publicName = toPublicFilename(rec.imageFilename)
    const candidate = {
      slug: rec.slug,
      name: rec.name,
      type: rec.type,
      status: rec.status,
      featured: rec.featured,
      order: rec.order,
      description: rec.description,
      techStack: rec.techStack,
      liveUrl: rec.liveUrl,
      githubUrl: rec.githubUrl,
      image: { src: `/projects/${rec.slug}/${publicName}`, alt: rec.imageAlt, width: meta.width, height: meta.height, blurDataURL: meta.blurDataURL },
      overview: rec.overview,
      challenge: rec.challenge,
      solution: rec.solution,
      keyTakeaways: rec.keyTakeaways,
      ...(rec.sections.length ? { sections: rec.sections } : {}),
      ...(rec.seo ? { seo: rec.seo } : {}),
      ...(rec.updatedAt ? { updatedAt: rec.updatedAt } : {}),
    }
    const project = parseProject(candidate, `${outDir}/${rec.slug}.json`, rec.slug)
    written.push(project)

    if (!dryRun) {
      await mkdir(path.join(publicDir, rec.slug), { recursive: true })
      await writeFile(path.join(publicDir, rec.slug, publicName), buf)
      await mkdir(outDir, { recursive: true })
      await writeFile(path.join(outDir, `${rec.slug}.json`), JSON.stringify(project, null, 2) + '\n')
    }
  }

  const indexTs = [
    '// Generated once by scripts/export/convert-projects.ts, hand-maintained afterwards.',
    '// One import per content/projects/<slug>.json; the key must equal the file name.',
    ...written.map((p) => `import ${toIdentifier(p.slug)} from './${p.slug}.json'`),
    '',
    'export const projectFiles: Record<string, unknown> = {',
    ...written.map((p) => `  '${p.slug}': ${toIdentifier(p.slug)},`),
    '}',
    '',
  ].join('\n')
  if (!dryRun) await writeFile(path.join(outDir, 'index.ts'), indexTs)

  console.log(`${dryRun ? '[dry-run] ' : ''}${written.length} projects`)
  console.log('order  slug                        type    status        image (w x h)            takeaways  sections  warnings')
  for (const [i, p] of written.entries()) {
    const rec = records[i]
    console.log(
      `${String(p.order).padEnd(6)} ${p.slug.padEnd(27)} ${p.type.padEnd(7)} ${p.status.padEnd(13)} ${`${path.basename(p.image.src)} (${p.image.width}x${p.image.height})`.padEnd(24)} ${String(p.keyTakeaways.length).padEnd(10)} ${String(p.sections?.length ?? 0).padEnd(9)} ${rec.warnings.length}`,
    )
    for (const w of rec.warnings) console.log(`         ! ${w}`)
  }
  console.log('\nname -> slug (compare with the live hrefs recorded in planning/00 hand-off log):')
  for (const p of written) console.log(`  ${p.name}  ->  /projects/${p.slug}`)
}

if (require.main === module) {
  main().catch((e) => {
    console.error(e)
    process.exit(1)
  })
}
```

- [ ] **Step 3: Type-check, dry-run**

```bash
npx tsc --noEmit
npx tsx scripts/export/convert-projects.ts --from scripts/backups/<stamp> --dry-run
```

Expected: a table with one line per project, zero thrown errors. Warnings about "no stored slug" or "dropped video" are informational. Any warning containing "differs from" or "needs manual split" means a hand-edit follows in Task 6.

- [ ] **Step 4: Real run**

```bash
npx tsx scripts/export/convert-projects.ts --from scripts/backups/<stamp>
ls content/projects public/projects/*
```

Expected: `content/projects/index.ts` plus one `.json` per project; one image per project under `public/projects/<slug>/`.

- [ ] **Step 5: Commit the script (content is committed in Task 7)**

```bash
git add scripts/export/convert-projects.ts
git commit -m "chore(export): dump -> content/projects converter"
```

### Task 6: Review the generated content

- [ ] **Step 1: Slugs must match the live site**

Compare the `name -> slug` table from the converter with the hrefs in the chunk 00 hand-off log. Every live `/projects/<slug>` must have a matching file. If one differs, rename the JSON file and `public/projects/<slug>/` folder, fix `slug`, `image.src` and the `index.ts` line, and note it in the hand-off log. URLs must not change.

- [ ] **Step 2: Read every JSON file once**

For each `content/projects/<slug>.json`: `description` is one or two plain sentences; `keyTakeaways` is one idea per item (split by hand if the converter warned); `overview`/`challenge`/`solution` read correctly with paragraphs separated by blank lines; `techStack` groups are what the live site shows; `liveUrl`/`githubUrl` are right. Do **not** add Markdown syntax yet: until chunk 07 the site renders these strings as plain text.

- [ ] **Step 3: Choose the featured project**

Exactly one file must have `"featured": true`. If none does (the flag was never used in Payload), set it on the project that should lead the new index page (lowest `order` is the sensible default).

- [ ] **Step 4: Re-validate**

```bash
npx vitest run src/__tests__/lib
npx tsc --noEmit
```

(Chunk 02 adds content-level tests; the validator test is what exists now. `tsc` confirms `content/projects/index.ts` and its JSON imports compile.)

### Task 7: Commit content and images

- [ ] **Step 1: Check sizes**

```bash
du -sh public/projects
```

Expected: a few MB. If any single image is over ~2 MB, note it for chunk 06 (the redesign session can re-export it at a sane size); do not block on it.

- [ ] **Step 2: Commit**

```bash
git add content/ public/projects/
git commit -m "feat(content): export projects from Payload to JSON + public images"
```

---

## Verification checklist

- [ ] `npx tsc --noEmit` clean
- [ ] `npm run lint` clean
- [ ] `npm run build` passes (nothing reads the new files yet, so this proves only that they compile)
- [ ] `npm run test:run` and the failing-set check from `00` show no new failures
- [ ] `git status` shows `scripts/backups/` is **not** staged (gitignored)
- [ ] Hand-off log has: backup stamp, off-repo copy location, any slug renames, any hand edits

## Done when

- Backup folder exists off-repo.
- `content/projects/` has one JSON per live project plus `index.ts`; `public/projects/<slug>/` has one image each; exactly one project is `featured`.
- PR `chunk-01-export-content` → base branch is open with the four verification commands green.

## Out of scope / deferred

- Making the site read these files: chunk 02.
- Deleting `scripts/export/`: chunk 05.
- Markdown in content strings: after chunk 07.

## Hand-off log

_(append dated notes here)_

**2026-10-30 (Claude)**
- **Backup.** The owner ran the dump on 2026-10-30. Stamp: `2026-10-31T05-08-25-054Z` (UTC).
  - Off-repo copy: `~/Backups/portfolio-payload-2026-10-31T05-08-25-054Z`.
  - 30 tables (`users_sessions` skipped), 20 blobs, 173.5 MB.
  - No media row is missing its blob.
  - 9 blobs have no media row: the logos, headshot crops, `recipe-catalogue.mov` and `vistacrossing.png`. No project uses them.
  - Blob `list()` returned `vistacrossing.mov` twice, at the same size. Harmless.
- **Schema.** It matched the `COLS` map, so the converter needed no changes.
- **Slugs.** The `slug` column is null in every row, so the converter derived slugs from the names. All four match the live hrefs. No renames.
- **Dropped.** Videos `recipe-app.mov`, `TedanaApp.mov` and `vistacrossing.mov`. Calgary Folk Fest's video field pointed to `CFMF.webp`, an image identical to its static image; also dropped.
- **No sections.** `content` is empty in every row.
- **Hand edits.** `keyTakeaways` was a single paragraph in every project. Each was split at sentence boundaries: homechef-companion 3 items, calgary-folk-fest 2, tedana-app 3, vista-crossing 2.
  - The text is verbatim. The split script asserted that the rejoined items equal the original.
  - No other edits.
- **Featured.** HomeChef Companion, already flagged in Payload. Order 1–4 matches the live `/projects`.
- **Images.** 1.0 MB total, none over 2 MB. HomeChef's image is a 3006×1364 PNG (586 KB), a candidate for a webp re-export in chunk 06.
- **Noticed, not changed (owner's call):**
  - The last homechef takeaway sentence looks truncated: "…required me to master not only a new language."
  - The homechef overview says "an avenue for me learn".
  - The alt texts are thin: "CFMF", "Tedana Image".
- **Verification.**
  - tsc and lint are clean.
  - The build passes, and `/projects/[slug]` lists all four slugs.
  - Tests: 576 total, 45 failing, no new failures, none gone.
  - `scripts/backups/` is ignored.
