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
