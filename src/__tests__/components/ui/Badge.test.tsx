import { describe, it, expect } from 'vitest'
import { render, screen } from '@/test-utils'
import { Badge } from '@/components/ui/Badge'
import { PROJECT_STATUSES } from '@/types'

describe('Badge', () => {
  it('renders the status text in a span', () => {
    render(<Badge status="In Progress" />)
    const badge = screen.getByText('In Progress')
    expect(badge.tagName).toBe('SPAN')
  })

  it('renders an empty span without a status', () => {
    const { container } = render(<Badge />)
    expect(container.querySelector('span')).toBeEmptyDOMElement()
  })

  it('applies a custom className', () => {
    render(<Badge status="Live" className="custom-badge" />)
    expect(screen.getByText('Live')).toHaveClass('custom-badge')
    expect(screen.getByText('Live').className).not.toContain('undefined')
  })

  it('gives every known status a distinct colour treatment', () => {
    render(
      <div>
        {PROJECT_STATUSES.map((s) => (
          <Badge key={s} status={s} />
        ))}
      </div>,
    )
    const classes = PROJECT_STATUSES.map((s) => screen.getByText(s).className)
    expect(new Set(classes).size).toBe(PROJECT_STATUSES.length)
  })

  it('styles unknown values neutrally but still renders them', () => {
    render(<Badge status="Something Else" />)
    const badge = screen.getByText('Something Else')
    expect(badge.className).toMatch(/bg-/)
    expect(badge.className).toMatch(/text-/)
  })

  it('includes a dark-mode variant for every status', () => {
    for (const s of PROJECT_STATUSES) {
      const { unmount } = render(<Badge status={s} />)
      expect(screen.getByText(s).className).toMatch(/dark:/)
      unmount()
    }
  })
})
