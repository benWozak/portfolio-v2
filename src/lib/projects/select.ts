// src/lib/projects/select.ts
// Pure helpers over an already-parsed, order-sorted project list. No Next imports.
import { ProjectValidationError } from './schema'
import type { Project, ProjectType } from '../../types/project'

/** The `featured` project, else the first entry. Callers pass a list sorted by `order`. */
export function pickFeatured(projects: readonly Project[]): Project | undefined {
  return projects.find((p) => p.featured) ?? projects[0]
}

/** At most one `featured: true` per `type`. Throws so `next build` and `content:check` fail on a violation. */
export function assertOneFeaturedPerType(projects: readonly Project[]): void {
  const seen = new Map<ProjectType, string>()
  for (const p of projects) {
    if (!p.featured) continue
    const prev = seen.get(p.type)
    if (prev !== undefined) {
      throw new ProjectValidationError(
        `content/projects/${p.slug}.json`,
        'featured',
        `is already true for ${p.type} project "${prev}"; at most one featured project per type`,
      )
    }
    seen.set(p.type, p.slug)
  }
}
