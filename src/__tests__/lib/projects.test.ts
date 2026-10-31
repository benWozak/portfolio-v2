// src/__tests__/lib/projects.test.ts
import { describe, it, expect } from 'vitest'
import { existsSync, readdirSync } from 'node:fs'
import path from 'node:path'
import {
  getAdjacentProjects,
  getFeaturedProject,
  getProjectBySlug,
  getProjectSlugs,
  getProjects,
} from '@/lib/projects'

const CONTENT_DIR = path.join(process.cwd(), 'content', 'projects')
const PUBLIC_DIR = path.join(process.cwd(), 'public')

describe('content/projects integrity', () => {
  it('indexes every JSON file in content/projects', () => {
    const files = readdirSync(CONTENT_DIR)
      .filter((f) => f.endsWith('.json'))
      .map((f) => f.replace(/\.json$/, ''))
      .sort()
    expect([...getProjectSlugs()].sort()).toEqual(files)
  })

  it('has at least one project', () => {
    expect(getProjects().length).toBeGreaterThan(0)
  })

  it('has unique slugs', () => {
    const slugs = getProjectSlugs()
    expect(new Set(slugs).size).toBe(slugs.length)
  })

  it('has exactly one featured project', () => {
    expect(getProjects().filter((p) => p.featured)).toHaveLength(1)
  })

  it('every image file exists under public/', () => {
    for (const p of getProjects()) {
      expect(existsSync(path.join(PUBLIC_DIR, p.image.src)), `${p.slug}: ${p.image.src}`).toBe(true)
    }
  })
})

describe('loader API', () => {
  it('getProjects is sorted by order ascending and returns copies', () => {
    const a = getProjects()
    const orders = a.map((p) => p.order)
    expect(orders).toEqual([...orders].sort((x, y) => x - y))
    a.pop()
    expect(getProjects().length).toBe(orders.length)
  })

  it('getProjectBySlug round-trips and returns undefined for unknown slugs', () => {
    const first = getProjects()[0]
    expect(getProjectBySlug(first.slug)?.name).toBe(first.name)
    expect(getProjectBySlug('does-not-exist')).toBeUndefined()
  })

  it('getFeaturedProject returns the featured one', () => {
    expect(getFeaturedProject()?.featured).toBe(true)
  })

  it('getAdjacentProjects walks the ordered list with nulls at the ends', () => {
    const all = getProjects()
    const first = getAdjacentProjects(all[0].slug)
    const last = getAdjacentProjects(all[all.length - 1].slug)
    expect(first.prev).toBeNull()
    expect(last.next).toBeNull()
    if (all.length > 1) {
      expect(first.next?.slug).toBe(all[1].slug)
      expect(last.prev?.slug).toBe(all[all.length - 2].slug)
    }
    expect(getAdjacentProjects('does-not-exist')).toEqual({ prev: null, next: null })
  })
})
