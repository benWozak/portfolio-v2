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
  getProjectsByType,
} from '@/lib/projects'
import { PROJECT_TYPES } from '@/types'

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

  it('has at most one featured project per type', () => {
    for (const type of PROJECT_TYPES) {
      expect(getProjectsByType(type).filter((p) => p.featured).length).toBeLessThanOrEqual(1)
    }
  })

  it('has at least one project in every type (the home page shows one per group)', () => {
    for (const type of PROJECT_TYPES) {
      expect(getProjectsByType(type).length, type).toBeGreaterThan(0)
    }
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

  it('getProjectsByType filters and keeps order ascending', () => {
    for (const type of PROJECT_TYPES) {
      const list = getProjectsByType(type)
      expect(list.every((p) => p.type === type)).toBe(true)
      const orders = list.map((p) => p.order)
      expect(orders).toEqual([...orders].sort((x, y) => x - y))
    }
  })

  it('getFeaturedProject returns a project of the requested type', () => {
    for (const type of PROJECT_TYPES) {
      expect(getFeaturedProject(type)?.type).toBe(type)
    }
  })

  it('getAdjacentProjects stays within the project type, with nulls at the ends', () => {
    for (const type of PROJECT_TYPES) {
      const group = getProjectsByType(type)
      if (group.length === 0) continue
      const first = getAdjacentProjects(group[0].slug)
      const last = getAdjacentProjects(group[group.length - 1].slug)
      expect(first.prev).toBeNull()
      expect(last.next).toBeNull()
      for (const [i, p] of group.entries()) {
        const { prev, next } = getAdjacentProjects(p.slug)
        expect(prev?.slug ?? null).toBe(group[i - 1]?.slug ?? null)
        expect(next?.slug ?? null).toBe(group[i + 1]?.slug ?? null)
        if (prev) expect(prev.type).toBe(type)
        if (next) expect(next.type).toBe(type)
      }
    }
    expect(getAdjacentProjects('does-not-exist')).toEqual({ prev: null, next: null })
  })
})
