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
