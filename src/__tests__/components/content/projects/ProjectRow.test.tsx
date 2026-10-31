import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ProjectRow } from '@/components/content/projects/ProjectRow'
import type { Project } from '@/types'

const project: Project = {
  slug: 'demo-app',
  name: 'Demo App',
  type: 'personal',
  status: 'In Progress',
  featured: true,
  order: 1,
  description: 'A demo project.',
  techStack: { frontend: ['Next.js'], backend: [], other: [] },
  liveUrl: null,
  githubUrl: null,
  image: { src: '/projects/demo-app/demo.png', alt: 'Demo screenshot', width: 1200, height: 900, blurDataURL: 'data:image/webp;base64,AA==' },
  overview: 'o',
  challenge: 'c',
  solution: 's',
  keyTakeaways: ['k'],
}

describe('ProjectRow', () => {
  it('links to the project and to its group page', () => {
    render(<ProjectRow project={project} />)
    expect(screen.getByRole('link', { name: /View project/ })).toHaveAttribute('href', '/projects/demo-app')
    expect(screen.getByRole('link', { name: 'All personal projects' })).toHaveAttribute('href', '/projects/personal')
  })

  it('shows the group eyebrow, name, status badge, description and image', () => {
    render(<ProjectRow project={project} />)
    expect(screen.getByText('Personal')).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 3, name: 'Demo App' })).toBeInTheDocument()
    expect(screen.getByText('In Progress')).toBeInTheDocument()
    expect(screen.getByText('A demo project.')).toBeInTheDocument()
    expect(screen.getByAltText('Demo screenshot')).toBeInTheDocument()
  })

  it('keeps the image first in the DOM and moves it right with a CSS order class when reversed', () => {
    const { container, rerender } = render(<ProjectRow project={project} />)
    const imageBox = () => container.querySelector('img')!.parentElement!
    expect(imageBox().className).not.toContain('lg:order-last')
    rerender(<ProjectRow project={project} reverse />)
    expect(imageBox().className).toContain('lg:order-last')
    expect(container.querySelector('article')!.firstElementChild).toBe(imageBox())
  })
})
