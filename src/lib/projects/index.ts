// src/lib/projects/index.ts
// Single source of project content for the site. Reads the static import map in
// content/projects/index.ts, validates every file once at module init (a bad file
// fails `next build`), and exposes a tiny synchronous API. No Next imports.
import { projectFiles } from '../../../content/projects'
import { parseProject } from './schema'
import { assertOneFeaturedPerType, pickFeatured } from './select'
import type { Project, ProjectType } from '../../types/project'

const PROJECTS: readonly Project[] = Object.entries(projectFiles)
  .map(([slug, raw]) => parseProject(raw, `content/projects/${slug}.json`, slug))
  .sort((a, b) => a.order - b.order || a.name.localeCompare(b.name))

assertOneFeaturedPerType(PROJECTS)

export function getProjects(): Project[] {
  return [...PROJECTS]
}

export function getProjectSlugs(): string[] {
  return PROJECTS.map((p) => p.slug)
}

export function getProjectBySlug(slug: string): Project | undefined {
  return PROJECTS.find((p) => p.slug === slug)
}

/** All projects of one type, sorted by `order`. */
export function getProjectsByType(type: ProjectType): Project[] {
  return PROJECTS.filter((p) => p.type === type)
}

/** The type's `featured` project, else its lowest `order`; `undefined` only for an empty type. */
export function getFeaturedProject(type: ProjectType): Project | undefined {
  return pickFeatured(getProjectsByType(type))
}

/** Previous/next within the same `type`, by `order`. Nulls at the ends and for unknown slugs. */
export function getAdjacentProjects(slug: string): { prev: Project | null; next: Project | null } {
  const current = getProjectBySlug(slug)
  if (!current) return { prev: null, next: null }
  const group = getProjectsByType(current.type)
  const i = group.findIndex((p) => p.slug === slug)
  return { prev: group[i - 1] ?? null, next: group[i + 1] ?? null }
}

export { parseProject, ProjectValidationError } from './schema'
