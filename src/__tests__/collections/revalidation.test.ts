import { describe, it, expect, vi, beforeEach } from 'vitest'

const revalidateTag = vi.fn()
const revalidatePath = vi.fn()
vi.mock('next/cache', () => ({
  revalidateTag: (...args: unknown[]) => revalidateTag(...args),
  revalidatePath: (...args: unknown[]) => revalidatePath(...args),
}))

import { createRevalidationHooks } from '@/collections/hooks/revalidation'

const makeReq = (context: Record<string, unknown> = {}) => ({
  payload: { logger: { info: vi.fn(), error: vi.fn() } },
  context,
})

describe('createRevalidationHooks', () => {
  beforeEach(() => {
    revalidateTag.mockReset()
    revalidatePath.mockReset()
  })

  it('revalidates tags and resolved paths on afterChange', async () => {
    const hooks = createRevalidationHooks({
      tags: ['projects-data'],
      paths: (doc) => ['/projects', doc?.slug && `/projects/${doc.slug}`],
    })
    const req = makeReq()
    const doc = { slug: 'my-project' }

    const result = await hooks.afterChange({ doc, previousDoc: undefined, req } as any)

    expect(result).toBe(doc)
    expect(revalidateTag).toHaveBeenCalledWith('projects-data')
    expect(revalidatePath).toHaveBeenCalledWith('/projects')
    expect(revalidatePath).toHaveBeenCalledWith('/projects/my-project')
  })

  it('skips falsy path entries', async () => {
    const hooks = createRevalidationHooks({
      paths: (doc) => ['/blog', doc?.slug && `/blog/${doc.slug}`, undefined, false],
    })
    await hooks.afterChange({ doc: {}, previousDoc: undefined, req: makeReq() } as any)

    expect(revalidatePath).toHaveBeenCalledTimes(1)
    expect(revalidatePath).toHaveBeenCalledWith('/blog')
  })

  it('does nothing when context.disableRevalidate is set', async () => {
    const hooks = createRevalidationHooks({ tags: ['blog-data'] })
    await hooks.afterChange({
      doc: {},
      previousDoc: undefined,
      req: makeReq({ disableRevalidate: true }),
    } as any)

    expect(revalidateTag).not.toHaveBeenCalled()
  })

  it('never throws when revalidation fails (logs instead)', () => {
    revalidateTag.mockImplementation(() => {
      throw new Error('outside request scope')
    })
    const hooks = createRevalidationHooks({ tags: ['resume-data'] })
    const req = makeReq()

    expect(hooks.afterDelete({ doc: { id: 1 }, req } as any)).toEqual({ id: 1 })
    expect(req.payload.logger.error).toHaveBeenCalled()
  })

  it('revalidates the previous slug path on rename', async () => {
    const hooks = createRevalidationHooks({
      paths: (doc, previousDoc) => [
        doc?.slug && `/projects/${doc.slug}`,
        previousDoc?.slug && previousDoc.slug !== doc?.slug && `/projects/${previousDoc.slug}`,
      ],
    })
    await hooks.afterChange({
      doc: { slug: 'new-slug' },
      previousDoc: { slug: 'old-slug' },
      req: makeReq(),
    } as any)

    expect(revalidatePath).toHaveBeenCalledWith('/projects/new-slug')
    expect(revalidatePath).toHaveBeenCalledWith('/projects/old-slug')
  })
})
