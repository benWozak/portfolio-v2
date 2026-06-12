import { describe, it, expect, vi } from 'vitest'
import { generateSlug, ensureUniqueSlug } from '@/collections/hooks/slug'

describe('generateSlug', () => {
  it('lowercases and hyphenates spaces', () => {
    expect(generateSlug('My Cool Project')).toBe('my-cool-project')
  })

  it('strips special characters', () => {
    expect(generateSlug('My C++ Project')).toBe('my-c-project')
    expect(generateSlug('React.js & Friends!')).toBe('reactjs-friends')
  })

  it('collapses repeated separators and trims hyphens', () => {
    expect(generateSlug('  spaced   out  ')).toBe('spaced-out')
    expect(generateSlug('-already-hyphenated-')).toBe('already-hyphenated')
  })
})

describe('ensureUniqueSlug', () => {
  const makeReq = (existingSlugs: string[]) => ({
    payload: {
      find: vi.fn(async ({ where }: any) => {
        const requested = where.and[0].slug.equals
        return { docs: existingSlugs.includes(requested) ? [{ id: 99 }] : [] }
      }),
    },
  })

  it('returns the slug unchanged when free', async () => {
    const req = makeReq([])
    expect(await ensureUniqueSlug('projects', 'my-project', undefined, req)).toBe('my-project')
  })

  it('appends a counter when taken', async () => {
    const req = makeReq(['my-project', 'my-project-1'])
    expect(await ensureUniqueSlug('projects', 'my-project', undefined, req)).toBe('my-project-2')
  })

  it('excludes the current document when updating', async () => {
    const req = makeReq([])
    await ensureUniqueSlug('blog', 'hello', 42, req)
    const where = req.payload.find.mock.calls[0][0].where
    expect(where.and[1]).toEqual({ id: { not_equals: 42 } })
  })
})
