// src/types/project.ts
// Content schema for content/projects/<slug>.json. Keep in sync with
// src/lib/projects/schema.ts (the runtime validator).

export const PROJECT_TYPES = ['web', 'native'] as const
export const PROJECT_STATUSES = ['In Progress', 'Prototype', 'Professional'] as const

export type ProjectType = (typeof PROJECT_TYPES)[number]
export type ProjectStatus = (typeof PROJECT_STATUSES)[number]

export interface TechStack {
  frontend: string[]
  backend: string[]
  other: string[]
}

export interface ProjectImage {
  /** Public path, always "/projects/<slug>/<file>" */
  src: string
  alt: string
  width: number
  height: number
  /** Tiny webp data URI for next/image placeholder="blur" */
  blurDataURL: string
}

export interface ProjectSection {
  heading: string
  /** Markdown */
  body: string
}

export interface ProjectSeo {
  title?: string
  description?: string
}

export interface Project {
  slug: string
  name: string
  type: ProjectType
  status: ProjectStatus
  featured: boolean
  /** Lower comes first */
  order: number
  /** Plain text, one or two sentences. Used on cards and as the meta description. */
  description: string
  techStack: TechStack
  liveUrl: string | null
  githubUrl: string | null
  image: ProjectImage
  /** Markdown */
  overview: string
  /** Markdown */
  challenge: string
  /** Markdown */
  solution: string
  /** One item per takeaway; inline Markdown allowed */
  keyTakeaways: string[]
  /** Optional extra write-up sections rendered after Key Takeaways */
  sections?: ProjectSection[]
  seo?: ProjectSeo
  /** ISO date, used for sitemap lastModified */
  updatedAt?: string
}
