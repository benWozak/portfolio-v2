// src/__tests__/components/content/projects/case-study/CaseStudyHero.test.tsx
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { CaseStudyHero } from '@/components/content/projects/case-study/CaseStudyHero'
import type { Project } from '@/types'

const project: Project = {
  slug: 'x', name: 'Project X', type: 'personal', status: 'Prototype', featured: false, order: 1, description: 'A short lede.',
  techStack: { frontend: [], backend: [], other: [] }, liveUrl: null, githubUrl: null,
  image: { src: '/projects/x/x.png', alt: 'Project X screenshot', width: 1, height: 1, blurDataURL: 'data:image/webp;base64,AA==' },
  overview: 'o', challenge: 'c', solution: 's', keyTakeaways: ['k'],
}

describe('CaseStudyHero', () => {
  it('renders the h1, status, group link, lede and image', () => {
    render(<CaseStudyHero project={project} />)
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Project X')
    expect(screen.getByText('Prototype')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Personal' })).toHaveAttribute('href', '/projects/personal')
    expect(screen.getByText('A short lede.')).toBeInTheDocument()
    expect(screen.getByRole('img', { name: 'Project X screenshot' })).toBeInTheDocument()
  })
})
