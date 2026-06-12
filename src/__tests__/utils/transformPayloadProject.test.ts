import { describe, it, expect, vi } from 'vitest'

vi.mock('next/cache', () => ({
  unstable_cache: (fn: (...args: unknown[]) => unknown) => fn,
}))
vi.mock('next/headers', () => ({
  draftMode: vi.fn(async () => ({ isEnabled: false })),
}))
vi.mock('payload', () => ({
  getPayload: vi.fn(),
}))
vi.mock('../../payload.config', () => ({ default: Promise.resolve({}) }))
vi.mock('@/utils/getBase64', () => ({
  getBase64: vi.fn(async () => 'data:image/png;base64,blurred'),
}))

import { transformPayloadProject } from '@/utils/getProjects'
import { getBase64 } from '@/utils/getBase64'

const basePayloadProject = {
  id: 7,
  name: 'My C++ Project',
  type: 'web',
  status: 'Prototype',
  description: 'desc',
  techStack: {
    frontend: [{ technology: 'React' }],
    backend: [{ technology: 'Node' }],
    other: null,
  },
  media: {
    staticImage: { url: 'https://blob.example/img.png', alt: 'Screenshot of app' },
    video: null,
  },
}

describe('transformPayloadProject', () => {
  it('maps payload fields, deriving a clean slug when none is stored', async () => {
    const project = await transformPayloadProject(basePayloadProject)

    expect(project.slug).toBe('my-c-project')
    expect(project.techStack).toEqual({ frontend: ['React'], backend: ['Node'], other: [] })
    expect(project.media.staticImage).toBe('https://blob.example/img.png')
    expect(project.media.alt).toBe('Screenshot of app')
    expect(project.media.blurDataURL).toBe('data:image/png;base64,blurred')
    expect(project.order).toBe(999)
    expect(project.featured).toBe(false)
  })

  it('prefers a stored slug over derivation', async () => {
    const project = await transformPayloadProject({
      ...basePayloadProject,
      slug: 'stored-slug',
    })
    expect(project.slug).toBe('stored-slug')
  })

  it('falls back to an SVG placeholder when blur generation fails', async () => {
    vi.mocked(getBase64).mockResolvedValueOnce(null)
    const project = await transformPayloadProject(basePayloadProject)
    expect(project.media.blurDataURL).toMatch(/^data:image\/svg\+xml;base64,/)
  })

  it('handles missing media and empty tech stack', async () => {
    const project = await transformPayloadProject({
      ...basePayloadProject,
      media: null,
      techStack: null,
    })
    expect(project.media).toEqual({ staticImage: '', alt: undefined, video: undefined, blurDataURL: undefined })
    expect(project.techStack).toEqual({ frontend: [], backend: [], other: [] })
  })
})
