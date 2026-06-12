// One-time migration: combine overview/challenge/solution/keyTakeaways
// into a single Lexical rich text `content` field on each project.
//
// Usage:
//   npx tsx scripts/migrate-projects-to-lexical.ts --dry-run
//   npx tsx scripts/migrate-projects-to-lexical.ts

import { loadEnvConfig } from '@next/env'
loadEnvConfig(process.cwd())

import { getPayload } from 'payload'
import config from '../src/payload.config'

const DRY_RUN = process.argv.includes('--dry-run')

type LexicalNode = Record<string, unknown>

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

function paragraphNode(text: string): LexicalNode {
  return {
    type: 'paragraph',
    children: [textNode(text)],
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

function sectionNodes(heading: string, body: string): LexicalNode[] {
  if (!body || !body.trim()) return []
  const paragraphs = body
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter(Boolean)
    .map((p) => paragraphNode(p))
  return [headingNode(heading), ...paragraphs]
}

function buildLexicalContent(project: {
  overview?: string
  challenge?: string
  solution?: string
  keyTakeaways?: string
}) {
  const children: LexicalNode[] = [
    ...sectionNodes('Overview', project.overview ?? ''),
    ...sectionNodes('Challenge', project.challenge ?? ''),
    ...sectionNodes('Solution', project.solution ?? ''),
    ...sectionNodes('Key Takeaways', project.keyTakeaways ?? ''),
  ]

  return {
    root: {
      type: 'root',
      children,
      direction: 'ltr',
      format: '',
      indent: 0,
      version: 1,
    },
  }
}

async function run() {
  console.log(DRY_RUN ? '🧪 DRY RUN — no writes' : '🚀 LIVE RUN — writing to DB')

  const payload = await getPayload({ config })

  const result = await payload.find({
    collection: 'projects',
    limit: 1000,
    depth: 0,
  })

  console.log(`Found ${result.docs.length} projects`)

  let updated = 0
  let skipped = 0

  for (const project of result.docs) {
    const p = project as unknown as {
      id: number | string
      name: string
      content?: unknown
      overview?: string
      challenge?: string
      solution?: string
      keyTakeaways?: string
    }

    if (p.content) {
      console.log(`⏭️  ${p.name}: already has content, skipping`)
      skipped++
      continue
    }

    const content = buildLexicalContent(p)

    if (DRY_RUN) {
      console.log(`📝 ${p.name}: would write content with ${(content.root.children as unknown[]).length} nodes`)
      console.log(JSON.stringify(content, null, 2))
    } else {
      await payload.update({
        collection: 'projects',
        id: p.id,
        data: { content },
      })
      console.log(`✅ ${p.name}: updated`)
      updated++
    }
  }

  console.log(
    DRY_RUN
      ? `\n🧪 Dry run complete. ${result.docs.length - skipped} projects would be updated.`
      : `\n✅ Done. Updated ${updated}, skipped ${skipped}.`,
  )

  process.exit(0)
}

run().catch((err) => {
  console.error('❌ Migration failed:', err)
  process.exit(1)
})
