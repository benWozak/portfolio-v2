// One-time migration: consolidate overview/challenge/solution/keyTakeaways
// into the Lexical rich text `content` field on each project, prepending the
// generated sections above any existing content. The four textarea fields are
// left untouched (their NOT NULL columns get dropped by the later schema push).
//
// Usage:
//   npx tsx scripts/migrate-projects-to-lexical.ts --dry-run [--verbose]
//   npx tsx scripts/migrate-projects-to-lexical.ts
//
// A JSON backup of all raw project docs is written to scripts/backups/ before
// anything else (in dry-run mode too). Docs whose content already starts with
// a generated section h2 are skipped; to redo a migration, restore the doc
// from the backup JSON first — re-running can only prepend, never replace.

import fs from 'fs'
import path from 'path'
import { loadEnvConfig } from '@next/env'

loadEnvConfig(process.cwd())
// Both must be set before payload.config is imported (hence the dynamic
// imports in main): outside production getPayload() runs a drizzle schema
// push, and this script must never mutate the schema. NODE_ENV=production
// skips the push branch entirely; PAYLOAD_DB_PUSH=false disables it even if
// that branch is reached.
process.env.PAYLOAD_DB_PUSH = 'false'
;(process.env as Record<string, string | undefined>).NODE_ENV = 'production'

const DRY_RUN = process.argv.includes('--dry-run')
const VERBOSE = process.argv.includes('--verbose')

type LexicalNode = Record<string, unknown>

type ProjectDoc = {
  id: number | string
  name: string
  slug?: string | null
  content?: { root?: Record<string, unknown> & { children?: LexicalNode[] } } | null
  overview?: string
  challenge?: string
  solution?: string
  keyTakeaways?: string
}

const SECTION_HEADINGS = ['Overview', 'Challenge', 'Solution', 'Key Takeaways'] as const

function textNode(text: string): LexicalNode {
  return {
    type: 'text',
    text,
    format: 0,
    detail: 0,
    mode: 'normal',
    style: '',
    version: 1,
  }
}

function linebreakNode(): LexicalNode {
  return { type: 'linebreak', version: 1 }
}

// Single newlines inside a paragraph become canonical Lexical linebreak nodes.
function paragraphNode(text: string): LexicalNode {
  const lines = text
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
  return {
    type: 'paragraph',
    children: lines.flatMap((line, i) => (i === 0 ? [textNode(line)] : [linebreakNode(), textNode(line)])),
    direction: 'ltr',
    format: '',
    indent: 0,
    textFormat: 0,
    textStyle: '',
    version: 1,
  }
}

function headingNode(text: string, tag: 'h2' | 'h3' = 'h2'): LexicalNode {
  return {
    type: 'heading',
    tag,
    children: [textNode(text)],
    direction: 'ltr',
    format: '',
    indent: 0,
    version: 1,
  }
}

// Normalizes CRLF/CR to LF, then splits on blank lines (tolerating trailing
// spaces/tabs on the "blank" line, which browsers happily save in textareas).
function splitParagraphs(body: string): string[] {
  return body
    .replace(/\r\n?/g, '\n')
    .split(/\n[ \t]*\n+/)
    .map((p) => p.trim())
    .filter(Boolean)
}

function sectionNodes(heading: string, body: string): LexicalNode[] {
  const paragraphs = splitParagraphs(body)
  if (paragraphs.length === 0) return []
  return [headingNode(heading), ...paragraphs.map(paragraphNode)]
}

// A doc whose content starts with any generated section h2 was already
// migrated — re-running must not prepend the sections a second time. (Checks
// all four headings, not just "Overview": a doc with a whitespace-only
// overview generates content starting with "Challenge".)
function isAlreadyMigrated(content: ProjectDoc['content']): boolean {
  const first = content?.root?.children?.[0] as
    | { type?: string; tag?: string; children?: { text?: string }[] }
    | undefined
  return (
    first?.type === 'heading' &&
    first.tag === 'h2' &&
    SECTION_HEADINGS.includes((first.children?.[0]?.text ?? '') as (typeof SECTION_HEADINGS)[number])
  )
}

function sectionFieldChars(p: ProjectDoc): number {
  return (p.overview ?? '').length + (p.challenge ?? '').length + (p.solution ?? '').length + (p.keyTakeaways ?? '').length
}

// The update must change `content` and nothing else — Payload rewrites array
// tables (delete-then-reinsert) untransacted, so verify per doc afterwards.
function fingerprint(d: Record<string, any>): string {
  return JSON.stringify({
    name: d.name,
    type: d.type,
    status: d.status,
    description: d.description,
    order: d.order ?? null,
    featured: d.featured ?? false,
    liveUrl: d.liveUrl ?? null,
    githubUrl: d.githubUrl ?? null,
    media: { staticImage: d.media?.staticImage ?? null, video: d.media?.video ?? null },
    seo: {
      metaTitle: d.seo?.metaTitle ?? null,
      metaDescription: d.seo?.metaDescription ?? null,
      ogImage: d.seo?.ogImage ?? null,
    },
    techStack: {
      frontend: (d.techStack?.frontend ?? []).map((t: any) => t.technology),
      backend: (d.techStack?.backend ?? []).map((t: any) => t.technology),
      other: (d.techStack?.other ?? []).map((t: any) => t.technology),
    },
  })
}

async function main() {
  console.log(DRY_RUN ? '🧪 DRY RUN — no writes' : '🚀 LIVE RUN — writing to DB')

  const { getPayload } = await import('payload')
  const { default: config } = await import('../src/payload.config')
  const payload = await getPayload({ config })

  const result = await payload.find({
    collection: 'projects',
    limit: 1000,
    depth: 0,
  })
  if (result.totalDocs !== result.docs.length) {
    throw new Error(
      `Pagination overflow: ${result.totalDocs} total docs but only ${result.docs.length} fetched — docs would be silently missed`,
    )
  }
  console.log(`Found ${result.docs.length} projects`)

  const backupDir = path.resolve(process.cwd(), 'scripts/backups')
  fs.mkdirSync(backupDir, { recursive: true })
  const stamp = new Date().toISOString().replace(/[:.]/g, '-')
  const backupPath = path.join(backupDir, `projects-backup-${stamp}.json`)
  fs.writeFileSync(backupPath, JSON.stringify(result.docs, null, 2))
  console.log(`💾 Backup written: ${backupPath}`)

  let updated = 0
  let skipped = 0
  const updatedIds = new Set<string>()
  const emptyDocs: string[] = []

  for (const doc of result.docs) {
    const p = doc as unknown as ProjectDoc

    if (isAlreadyMigrated(p.content)) {
      const chars = sectionFieldChars(p)
      console.log(
        `⏭️  ${p.name}: content already starts with a generated section h2, skipping` +
          (chars > 0 ? ` — NOTE: textarea fields hold ${chars} chars; verify they are represented in content` : ''),
      )
      skipped++
      continue
    }

    const sections: [string, string][] = [
      ['Overview', p.overview ?? ''],
      ['Challenge', p.challenge ?? ''],
      ['Solution', p.solution ?? ''],
      ['Key Takeaways', p.keyTakeaways ?? ''],
    ]
    const migrated = sections.flatMap(([heading, body]) => sectionNodes(heading, body))

    if (migrated.length === 0) {
      console.log(
        `⚠️  ${p.name}: all four section fields empty and no content written — this project will have NO write-up after the textarea columns are dropped`,
      )
      emptyDocs.push(p.name)
      skipped++
      continue
    }

    const existingRoot = p.content?.root
    const existingChildren = existingRoot?.children ?? []
    const content = existingRoot
      ? { root: { ...existingRoot, children: [...migrated, ...existingChildren] } }
      : {
          root: {
            type: 'root',
            children: migrated,
            direction: 'ltr',
            format: '',
            indent: 0,
            version: 1,
          },
        }

    const summary = sections
      .map(([heading, body]) => `${heading}: ${splitParagraphs(body).length}p`)
      .join(', ')
    const prependNote =
      existingChildren.length > 0
        ? `; existing content: ${existingChildren.length} nodes preserved below`
        : ''
    const totalNodes = migrated.length + existingChildren.length

    if (DRY_RUN) {
      console.log(`📝 ${p.name}: would write ${totalNodes} nodes (${summary}${prependNote})`)
      if (VERBOSE) console.log(JSON.stringify(content, null, 2))
    } else {
      await payload.update({
        collection: 'projects',
        id: p.id,
        // Cast: the committed payload-types.ts is stale and lacks `content`
        // on Project; the field exists in the live config.
        data: { content } as never,
        depth: 0,
        context: { disableRevalidate: true },
      })
      console.log(`✅ ${p.name}: updated, ${totalNodes} nodes (${summary}${prependNote})`)
      updatedIds.add(String(p.id))
      updated++
    }
  }

  if (emptyDocs.length > 0) {
    console.log(`\n⚠️  Projects that will have NO write-up after cutover: ${emptyDocs.join(', ')}`)
  }

  if (!DRY_RUN) {
    console.log('\n🔍 Verifying: refetching all projects and comparing non-content fields…')
    const after = await payload.find({ collection: 'projects', limit: 1000, depth: 0 })
    const beforeById = new Map(result.docs.map((d) => [String((d as { id: unknown }).id), d]))
    let problems = 0

    for (const doc of after.docs) {
      const a = doc as unknown as ProjectDoc & Record<string, any>
      const b = beforeById.get(String(a.id)) as (ProjectDoc & Record<string, any>) | undefined
      if (!b) {
        console.log(`❌ ${a.name}: missing from pre-run snapshot`)
        problems++
        continue
      }
      if (fingerprint(a) !== fingerprint(b)) {
        console.log(`❌ ${a.name}: non-content fields changed — compare against the backup JSON!`)
        problems++
      }
      if ((b.slug ?? '') !== (a.slug ?? '')) {
        // The beforeChange hook backfills a missing slug; only a *changed* slug is a problem.
        const note = b.slug ? '❌' : 'ℹ️ '
        console.log(`${note} ${a.name}: slug ${b.slug ? 'CHANGED' : 'generated'}: "${b.slug ?? ''}" → "${a.slug}"`)
        if (b.slug) problems++
      }
      if (updatedIds.has(String(a.id)) && !isAlreadyMigrated(a.content)) {
        console.log(`❌ ${a.name}: was updated but content does not start with a generated section h2`)
        problems++
      }
    }

    console.log(
      problems === 0
        ? '🔍 Verification passed: only `content` changed.'
        : `\n❌ ${problems} verification problem(s) — reconcile against ${backupPath} before proceeding!`,
    )
  }

  console.log(
    DRY_RUN
      ? `\n🧪 Dry run complete. ${result.docs.length - skipped} projects would be updated, ${skipped} skipped.`
      : `\n✅ Done. Updated ${updated}, skipped ${skipped}.`,
  )

  process.exit(0)
}

main().catch((err) => {
  console.error('❌ Migration failed:', err)
  process.exit(1)
})
