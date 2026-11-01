// src/__tests__/components/content/projects/ProjectLinks.test.tsx
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ProjectLinks } from '@/components/content/projects/ProjectLinks'

describe('ProjectLinks', () => {
  it('renders live and source buttons that open in a new tab', () => {
    render(<ProjectLinks liveUrl="https://example.com" githubUrl="https://github.com/x/y" />)
    const live = screen.getByRole('link', { name: /visit live site/i })
    expect(live).toHaveAttribute('href', 'https://example.com')
    expect(live).toHaveAttribute('target', '_blank')
    expect(live).toHaveAttribute('rel', 'noopener noreferrer')
    expect(screen.getByRole('link', { name: /view source/i })).toHaveAttribute('href', 'https://github.com/x/y')
    expect(screen.queryByText(/do not own the rights/i)).toBeNull()
  })

  it('shows the rights note instead of a source button when asked and there is no code link', () => {
    render(<ProjectLinks liveUrl="https://example.com" githubUrl={null} showRightsNote />)
    expect(screen.queryByRole('link', { name: /view source/i })).toBeNull()
    expect(screen.getByText(/do not own the rights/i)).toBeInTheDocument()
  })

  it('hides the rights note when a source link exists even if asked', () => {
    render(<ProjectLinks liveUrl={null} githubUrl="https://github.com/x/y" showRightsNote />)
    expect(screen.getByRole('link', { name: /view source/i })).toBeInTheDocument()
    expect(screen.queryByText(/do not own the rights/i)).toBeNull()
  })

  it('renders nothing when there are no links and no note', () => {
    const { container } = render(<ProjectLinks liveUrl={null} githubUrl={null} />)
    expect(container).toBeEmptyDOMElement()
  })
})
