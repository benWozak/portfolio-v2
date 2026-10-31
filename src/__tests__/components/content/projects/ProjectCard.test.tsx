import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ProjectCard } from '@/components/content/projects/ProjectCard'
import type { Project } from '@/types'

// The dot is in an aria-hidden span, so match on the element's full textContent.
const eyebrow = (text: string) =>
  screen.getByText((_, el) => el?.tagName === 'P' && el.textContent === text)

const project: Project = {
  slug: 'demo-app',
  name: 'Demo App',
  type: 'professional',
  status: 'Live',
  featured: false,
  order: 1,
  description: 'A demo project.',
  techStack: { frontend: ['Next.js', 'Tailwind'], backend: ['Node'], other: ['Vercel', 'Stripe'] },
  liveUrl: 'https://demo.example.com',
  githubUrl: null,
  image: { src: '/projects/demo-app/demo.png', alt: 'Demo screenshot', width: 1200, height: 900, blurDataURL: 'data:image/webp;base64,AA==' },
  overview: 'o',
  challenge: 'c',
  solution: 's',
  keyTakeaways: ['k'],
}

describe('ProjectCard', () => {
  it('links the name to the project page and it is the only link', () => {
    render(<ProjectCard project={project} />)
    const links = screen.getAllByRole('link')
    expect(links).toHaveLength(1)
    expect(links[0]).toHaveAttribute('href', '/projects/demo-app')
    expect(links[0]).toHaveTextContent('Demo App')
    expect(screen.getByRole('heading', { level: 2, name: 'Demo App' })).toBeInTheDocument()
  })

  it('shows group and status in one eyebrow line', () => {
    render(<ProjectCard project={project} />)
    expect(eyebrow('Professional · Live')).toBeInTheDocument()
  })

  it('shows the description and the image alt', () => {
    render(<ProjectCard project={project} />)
    expect(screen.getByText('A demo project.')).toBeInTheDocument()
    expect(screen.getByAltText('Demo screenshot')).toBeInTheDocument()
  })

  it('caps tech chips at three and counts the rest', () => {
    render(<ProjectCard project={project} />)
    const chips = screen.getByRole('list', { name: 'Tech stack' })
    expect(chips.querySelectorAll('li')).toHaveLength(4) // 3 chips + "+2 more"
    expect(screen.getByText('+2 more')).toBeInTheDocument()
  })

  it('uses the personal accent for personal projects', () => {
    render(<ProjectCard project={{ ...project, type: 'personal', status: 'Prototype' }} />)
    expect(eyebrow('Personal · Prototype').className).toContain('text-primary')
  })
})
