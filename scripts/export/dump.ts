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
