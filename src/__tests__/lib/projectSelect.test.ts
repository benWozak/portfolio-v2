// src/__tests__/lib/projectSelect.test.ts
// @vitest-environment node
// Node-only, like the other content tests; see projects.test.ts for why.
import { describe, it, expect } from 'vitest'
import { assertOneFeaturedPerType, pickFeatured } from '@/lib/projects/select'
import { ProjectValidationError } from '@/lib/projects/schema'
import type { Project } from '@/types'

const make = (slug: string, type: Project['type'], featured: boolean, order: number) =>
  ({ slug, type, featured, order }) as Project

describe('pickFeatured', () => {
  it('returns the featured project when one exists', () => {
    const list = [make('a', 'personal', false, 1), make('b', 'personal', true, 2)]
    expect(pickFeatured(list)?.slug).toBe('b')
  })

  it('falls back to the first entry (lowest order) when none is featured', () => {
    const list = [make('a', 'personal', false, 1), make('b', 'personal', false, 2)]
    expect(pickFeatured(list)?.slug).toBe('a')
  })

  it('returns undefined for an empty list', () => {
    expect(pickFeatured([])).toBeUndefined()
  })
})

describe('assertOneFeaturedPerType', () => {
  it('accepts one featured per type', () => {
    expect(() =>
      assertOneFeaturedPerType([
        make('a', 'professional', true, 1),
        make('b', 'personal', true, 2),
        make('c', 'personal', false, 3),
      ]),
    ).not.toThrow()
  })

  it('accepts a type with no featured project', () => {
    expect(() => assertOneFeaturedPerType([make('a', 'professional', false, 1)])).not.toThrow()
  })

  it('rejects two featured in the same type and names both files', () => {
    expect(() =>
      assertOneFeaturedPerType([make('a', 'personal', true, 1), make('b', 'personal', true, 2)]),
    ).toThrow(ProjectValidationError)
    expect(() =>
      assertOneFeaturedPerType([make('a', 'personal', true, 1), make('b', 'personal', true, 2)]),
    ).toThrow(/content\/projects\/b\.json: featured .*"a"/)
  })
})
