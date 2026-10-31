import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'

let pathname = '/projects/professional'
vi.mock('next/navigation', () => ({
  usePathname: () => pathname,
  useRouter: () => ({ push: vi.fn(), replace: vi.fn(), prefetch: vi.fn(), back: vi.fn(), forward: vi.fn(), refresh: vi.fn() }),
  useSearchParams: () => new URLSearchParams(),
  useParams: () => ({}),
}))

import { ProjectTabs } from '@/components/content/projects/ProjectTabs'

describe('ProjectTabs', () => {
  beforeEach(() => {
    pathname = '/projects/professional'
  })

  it('renders both group tabs with their hrefs', () => {
    render(<ProjectTabs />)
    expect(screen.getByRole('link', { name: 'Professional' })).toHaveAttribute('href', '/projects/professional')
    expect(screen.getByRole('link', { name: 'Personal' })).toHaveAttribute('href', '/projects/personal')
  })

  it('marks the current page with aria-current', () => {
    render(<ProjectTabs />)
    expect(screen.getByRole('link', { name: 'Professional' })).toHaveAttribute('aria-current', 'page')
    expect(screen.getByRole('link', { name: 'Personal' })).not.toHaveAttribute('aria-current')
  })

  it('follows the pathname', () => {
    pathname = '/projects/personal'
    render(<ProjectTabs />)
    expect(screen.getByRole('link', { name: 'Personal' })).toHaveAttribute('aria-current', 'page')
    expect(screen.getByRole('link', { name: 'Professional' })).not.toHaveAttribute('aria-current')
  })

  it('labels the navigation', () => {
    render(<ProjectTabs />)
    expect(screen.getByRole('navigation', { name: 'Project groups' })).toBeInTheDocument()
  })
})
