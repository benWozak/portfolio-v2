// scripts/export/parity.ts
// Offline: compares what the site now serves (content/projects via the loader)
// with the raw Payload dump from chunk 01. Run before any hand edits are forgotten.
//   npx tsx scripts/export/parity.ts --from scripts/backups/<stamp>
// Deleted in chunk 05.
import path from 'node:path'
import { getProjects } from '../../src/lib/projects'
import { loadDumpProjects } from './convert-projects'

const squash = (s: string) => s.replace(/\s+/g, ' ').trim()

async function main() {
  const i = process.argv.indexOf('--from')
  const from = i === -1 ? undefined : process.argv[i + 1]
  if (!from) throw new Error('usage: --from scripts/backups/<stamp>')

  const dump = await loadDumpProjects(from)
  const site = getProjects()
  let mismatches = 0
  const report = (slug: string, field: string, a: unknown, b: unknown) => {
    mismatches++
    console.log(`✗ ${slug}.${field}\n    dump: ${JSON.stringify(a)}\n    site: ${JSON.stringify(b)}`)
  }

  for (const d of dump) {
    const s = site.find((p) => p.slug === d.slug)
    if (!s) {
      report(d.slug, '(missing)', d.name, undefined)
      continue
    }
    const pairs: Array<[string, unknown, unknown]> = [
      ['name', d.name, s.name],
      ['type', d.type, s.type],
      ['status', d.status, s.status],
      ['description', squash(d.description), squash(s.description)],
      ['overview', squash(d.overview), squash(s.overview)],
      ['challenge', squash(d.challenge), squash(s.challenge)],
      ['solution', squash(d.solution), squash(s.solution)],
      ['keyTakeaways', d.keyTakeaways.map(squash), s.keyTakeaways.map(squash)],
      ['techStack', d.techStack, s.techStack],
      ['liveUrl', d.liveUrl, s.liveUrl],
      ['githubUrl', d.githubUrl, s.githubUrl],
      ['order', d.order, s.order],
      ['image', d.imageFilename.toLowerCase().replace(/\s+/g, '-'), path.basename(s.image.src)],
    ]
    for (const [field, a, b] of pairs) {
      if (JSON.stringify(a) !== JSON.stringify(b)) report(d.slug, field, a, b)
    }
  }
  for (const s of site) if (!dump.find((d) => d.slug === s.slug)) report(s.slug, '(extra on site)', undefined, s.name)

  console.log(mismatches ? `\n${mismatches} mismatch(es)` : `\n✓ ${site.length} projects match the dump`)
  process.exit(mismatches ? 1 : 0)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
