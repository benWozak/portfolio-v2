// scripts/content/new-project.ts
// Scaffolds a project: copies the image into public/projects/<slug>/, computes
// dimensions + blur, writes content/projects/<slug>.json with empty text fields,
// and prints the two lines to add to content/projects/index.ts.
//
//   npm run content:new -- --slug my-app --image ~/Desktop/my-app.png
//
// --image is resolved from where you run the command (npm passes that as
// INIT_CWD); the output always goes under the repo root.
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import path from 'node:path'
import { RESERVED_SLUGS, SLUG_RE } from '../../src/lib/projects/schema'
import type { Project } from '../../src/types/project'
import { describeImage, toPublicFilename } from './image'

async function main() {
  const args = process.argv.slice(2)
  const flag = (name: string) => {
    const i = args.indexOf(name)
    return i === -1 ? undefined : args[i + 1]
  }
  const slug = flag('--slug')
  const imagePath = flag('--image')
  if (!slug || !imagePath) throw new Error('usage: --slug <kebab-slug> --image <path-to-image>')
  if (!SLUG_RE.test(slug)) throw new Error('slug must be lowercase kebab-case, e.g. my-app')
  if ((RESERVED_SLUGS as readonly string[]).includes(slug)) {
    throw new Error(`"${slug}" is reserved (${RESERVED_SLUGS.join(', ')})`)
  }

  const jsonPath = path.join('content', 'projects', `${slug}.json`)
  if (existsSync(jsonPath)) throw new Error(`${jsonPath} already exists`)

  const buffer = await readFile(path.resolve(process.env.INIT_CWD ?? process.cwd(), imagePath))
  const meta = await describeImage(buffer)
  const file = toPublicFilename(path.basename(imagePath))
  const publicDir = path.join('public', 'projects', slug)
  await mkdir(publicDir, { recursive: true })
  await writeFile(path.join(publicDir, file), buffer)

  const skeleton = {
    slug,
    name: '',
    type: 'personal',
    status: 'Prototype',
    featured: false,
    order: 99,
    description: '',
    techStack: { frontend: [], backend: [], other: [] },
    liveUrl: null,
    githubUrl: null,
    image: { src: `/projects/${slug}/${file}`, alt: '', width: meta.width, height: meta.height, blurDataURL: meta.blurDataURL },
    overview: '',
    challenge: '',
    solution: '',
    keyTakeaways: [''],
    updatedAt: new Date().toISOString(),
  } satisfies Project
  await writeFile(jsonPath, JSON.stringify(skeleton, null, 2) + '\n')

  const camel = slug.replace(/-([a-z0-9])/g, (_, c: string) => c.toUpperCase())
  const ident = /^\d/.test(camel) ? `_${camel}` : camel
  console.log(`wrote ${jsonPath}`)
  console.log(`wrote ${path.join(publicDir, file)} (${meta.width}x${meta.height})`)
  console.log(`\nAdd to content/projects/index.ts:\n  import ${ident} from './${slug}.json'\n  '${slug}': ${ident},`)
  console.log(`\nThen fill in the empty fields and run: npm run content:check`)
}

main().catch((e) => {
  console.error(e instanceof Error ? e.message : e)
  process.exit(1)
})
