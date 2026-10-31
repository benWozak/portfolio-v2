// src/lib/projects/index.ts
// Single source of project content for the site. Reads the static import map in
// content/projects/index.ts, validates every file once at module init (a bad file
// fails `next build`), and exposes a tiny synchronous API. No Next imports.
import { projectFiles } from '../../../content/projects'
import { parseProject } from './schema'
import type { Project } from '../../types/project'

const PROJECTS: readonly Project[] = Object.entries(projectFiles)
  .map(([slug, raw]) => parseProject(raw, `content/projects/${slug}.json`, slug))
  .sort((a, b) => a.order - b.order || a.name.localeCompare(b.name))

export function getProjects(): Project[] {
  return [...PROJECTS]
}

export function getProjectSlugs(): string[] {
  return PROJECTS.map((p) => p.slug)
}

export function getProjectBySlug(slug: string): Project | undefined {
  return PROJECTS.find((p) => p.slug === slug)
}

/** The project flagged `featured`; falls back to the first by order so the index page never has an empty hero. */
export function getFeaturedProject(): Project | undefined {
  return PROJECTS.find((p) => p.featured) ?? PROJECTS[0]
}

export function getAdjacentProjects(slug: string): { prev: Project | null; next: Project | null } {
  const i = PROJECTS.findIndex((p) => p.slug === slug)
  if (i === -1) return { prev: null, next: null }
  return { prev: PROJECTS[i - 1] ?? null, next: PROJECTS[i + 1] ?? null }
}

export { parseProject, ProjectValidationError } from './schema'
