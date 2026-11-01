// src/__tests__/lib/projectSchema.test.ts
// @vitest-environment node
// Node-only, like the other content tests; see projects.test.ts for why.
import { describe, it, expect } from 'vitest'
import { parseProject, ProjectValidationError } from '@/lib/projects/schema'

const valid = {
  slug: 'demo-app',
  name: 'Demo App',
  type: 'professional',
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
    ['old type web', { ...valid, type: 'web' }],
    ['old type native', { ...valid, type: 'native' }],
    ['bad status', { ...valid, status: 'Done' }],
    ['old status Professional', { ...valid, status: 'Professional' }],
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

  it.each(['professional', 'personal'])('accepts type %s', (type) => {
    expect(parseProject({ ...valid, type }, 'x').type).toBe(type)
  })

  it.each(['In Progress', 'Prototype', 'Live', 'Archived'])('accepts status %s', (status) => {
    expect(parseProject({ ...valid, status }, 'x').status).toBe(status)
  })

  it.each(['professional', 'personal', 'web', 'native'])('rejects the reserved slug "%s"', (slug) => {
    expect(() => parseProject({ ...valid, slug, image: { ...valid.image, src: `/projects/${slug}/x.png` } }, 'test')).toThrow(/reserved/)
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
