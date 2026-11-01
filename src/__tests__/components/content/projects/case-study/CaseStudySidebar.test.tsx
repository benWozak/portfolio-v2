// src/__tests__/components/content/projects/case-study/CaseStudySidebar.test.tsx
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { CaseStudySidebar } from '@/components/content/projects/case-study/CaseStudySidebar'
import type { Project } from '@/types'

const project: Project = {
  slug: 'x', name: 'X', type: 'personal', status: 'Prototype', featured: false, order: 1, description: 'd',
  techStack: { frontend: ['React Native'], backend: [], other: ['Expo', 'React Native'] },
  liveUrl: 'https://example.com', githubUrl: null,
  image: { src: '/projects/x/x.png', alt: 'x', width: 1, height: 1, blurDataURL: 'data:image/webp;base64,AA==' },
  overview: 'o', challenge: 'c', solution: 's', keyTakeaways: ['k'],
}

describe('CaseStudySidebar', () => {
  it('shows status, links the group page and lists the stack once, flat', () => {
    render(<CaseStudySidebar project={project} />)
    expect(screen.getByRole('complementary', { name: /project details/i })).toBeInTheDocument()
    expect(screen.getByText('Prototype')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Personal' })).toHaveAttribute('href', '/projects/personal')
    const chips = screen.getByRole('list', { name: /tech stack/i })
    expect(chips.querySelectorAll('li')).toHaveLength(2)   // React Native de-duplicated, no group lists
    expect(screen.queryByRole('list', { name: /frontend/i })).toBeNull()
  })

  it('omits the Stack row when the project has no tech stack', () => {
    render(<CaseStudySidebar project={{ ...project, techStack: { frontend: [], backend: [], other: [] } }} />)
    expect(screen.queryByText('Stack')).toBeNull()
    expect(screen.queryByRole('list', { name: /tech stack/i })).toBeNull()
    expect(screen.getByText('Status')).toBeInTheDocument()   // the other rows stay
  })

  it('shows the live button and the rights note when there is no code link', () => {
    render(<CaseStudySidebar project={project} />)
    expect(screen.getByRole('link', { name: /visit live site/i })).toHaveAttribute('href', 'https://example.com')
    expect(screen.queryByRole('link', { name: /view source/i })).toBeNull()
    expect(screen.getByText(/do not own the rights/i)).toBeInTheDocument()
  })
})
