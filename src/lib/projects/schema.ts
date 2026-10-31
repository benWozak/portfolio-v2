// src/lib/projects/schema.ts
// Runtime validator for content/projects/*.json. Hand-rolled on purpose: one
// schema does not justify a dependency. Must stay free of Next.js imports
// because the scripts/content tooling imports it under tsx.
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
