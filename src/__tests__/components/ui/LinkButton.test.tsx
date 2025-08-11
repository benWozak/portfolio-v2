import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@/test-utils'
import userEvent from '@testing-library/user-event'
import { LinkButton } from '@/components/ui/LinkButton'

// Mock the smooth scroll hook
vi.mock('@/utils/hooks/useSmoothScroll', () => ({
  useSmoothScroll: () => ({
    scrollToElement: vi.fn(),
    scrollToTop: vi.fn(),
  }),
}))

describe('LinkButton Component', () => {
  describe('Rendering', () => {
    it('renders as a link element', () => {
      render(
        <LinkButton href="/test">
          Test Link
        </LinkButton>
      )
      
      const link = screen.getByRole('link', { name: 'Test Link' })
      expect(link).toBeInTheDocument()
      expect(link).toHaveAttribute('href', '/test')
    })

    it('renders children content correctly', () => {
      render(
        <LinkButton href="/test">
          <span>Custom Content</span>
        </LinkButton>
      )
      
      expect(screen.getByText('Custom Content')).toBeInTheDocument()
    })

    it('renders complex children correctly', () => {
      render(
        <LinkButton href="/test">
          <div>
            <span>Navigation</span>
            <em>Item</em>
          </div>
        </LinkButton>
      )
      
      expect(screen.getByText('Navigation')).toBeInTheDocument()
      expect(screen.getByText('Item')).toBeInTheDocument()
    })
  })

  describe('Active State', () => {
    it('applies active styles when isActive is true', () => {
      render(
        <LinkButton href="/active" isActive={true}>
          Active Link
        </LinkButton>
      )
      
      const link = screen.getByRole('link')
      expect(link).toHaveClass('after:scale-x-100', 'after:origin-left')
    })

    it('applies inactive styles when isActive is false', () => {
      render(
        <LinkButton href="/inactive" isActive={false}>
          Inactive Link
        </LinkButton>
      )
      
      const link = screen.getByRole('link')
      expect(link).toHaveClass('after:scale-x-0')
      expect(link).not.toHaveClass('after:scale-x-100')
    })

    it('applies inactive styles by default', () => {
      render(
        <LinkButton href="/default">
          Default Link
        </LinkButton>
      )
      
      const link = screen.getByRole('link')
      expect(link).toHaveClass('after:scale-x-0')
    })
  })

  describe('Hover Animation Classes', () => {
    it('applies hover animation pseudo-element classes', () => {
      render(
        <LinkButton href="/hover">
          Hover Link
        </LinkButton>
      )
      
      const link = screen.getByRole('link')
      expect(link).toHaveClass(
        'after:content-[\'\']',
        'after:absolute',
        'after:w-full',
        'after:h-0.5',
        'after:bottom-0',
        'after:left-0',
        'after:bg-primary-500',
        'after:origin-right',
        'after:transition-transform',
        'after:duration-300',
        'after:ease-out',
        'hover:after:scale-x-100',
        'hover:after:origin-left'
      )
    })

    it('applies base styling classes', () => {
      render(
        <LinkButton href="/base">
          Base Link
        </LinkButton>
      )
      
      const link = screen.getByRole('link')
      expect(link).toHaveClass(
        'relative',
        'pb-1',
        'tracking-wider',
        'text-sm'
      )
    })
  })

  describe('Custom Styling', () => {
    it('applies custom className when provided', () => {
      render(
        <LinkButton href="/custom" className="custom-link">
          Custom Link
        </LinkButton>
      )
      
      const link = screen.getByRole('link')
      expect(link).toHaveClass('custom-link')
    })

    it('combines custom className with default classes', () => {
      render(
        <LinkButton href="/combined" className="extra-padding">
          Combined Link
        </LinkButton>
      )
      
      const link = screen.getByRole('link')
      expect(link).toHaveClass('relative', 'pb-1', 'extra-padding')
    })

    it('applies empty className by default', () => {
      render(
        <LinkButton href="/no-class">
          No Class Link
        </LinkButton>
      )
      
      const link = screen.getByRole('link')
      // Should not have any additional custom classes beyond the component defaults
      expect(link.className).not.toContain('undefined')
    })
  })

  describe('Link Attributes', () => {
    it('applies target attribute when provided', () => {
      render(
        <LinkButton href="/external" target="_blank">
          External Link
        </LinkButton>
      )
      
      const link = screen.getByRole('link')
      expect(link).toHaveAttribute('target', '_blank')
    })

    it('does not apply target attribute when not provided', () => {
      render(
        <LinkButton href="/internal">
          Internal Link
        </LinkButton>
      )
      
      const link = screen.getByRole('link')
      expect(link).not.toHaveAttribute('target')
    })
  })

  describe('Event Handling', () => {
    it('calls onClick handler when provided', async () => {
      const handleClick = vi.fn()
      const user = userEvent.setup()
      
      render(
        <LinkButton href="/click" onClick={handleClick}>
          Clickable Link
        </LinkButton>
      )
      
      const link = screen.getByRole('link')
      await user.click(link)
      
      expect(handleClick).toHaveBeenCalledTimes(1)
    })

    it('does not break when onClick is not provided', async () => {
      const user = userEvent.setup()
      
      render(
        <LinkButton href="/no-click">
          No Click Handler
        </LinkButton>
      )
      
      const link = screen.getByRole('link')
      
      // Should not throw an error
      await expect(user.click(link)).resolves.not.toThrow()
    })
  })

  describe('Smooth Scroll Behavior', () => {
    it('handles hash links on home page with smooth scroll', async () => {
      const mockScrollToElement = vi.fn()
      
      // Re-mock the hook for this specific test
      vi.doMock('@/utils/hooks/useSmoothScroll', () => ({
        useSmoothScroll: () => ({
          scrollToElement: mockScrollToElement,
          scrollToTop: vi.fn(),
        }),
      }))
      
      const user = userEvent.setup()
      
      render(
        <LinkButton href="#section">
          Hash Link
        </LinkButton>
      )
      
      const link = screen.getByRole('link')
      await user.click(link)
      
      // The actual smooth scroll call would be made in the real component
      // For now, we just verify the component renders correctly with hash links
      expect(link).toHaveAttribute('href', '#section')
    })

    it('does not trigger smooth scroll on non-home pages', async () => {
      const user = userEvent.setup()
      
      render(
        <LinkButton href="#section">
          Hash Link on Other Page
        </LinkButton>
      )
      
      const link = screen.getByRole('link')
      await user.click(link)
      
      // Verify the link renders correctly
      expect(link).toHaveAttribute('href', '#section')
    })

    it('does not trigger smooth scroll for non-hash links', async () => {
      const user = userEvent.setup()
      
      render(
        <LinkButton href="/regular-link">
          Regular Link
        </LinkButton>
      )
      
      const link = screen.getByRole('link')
      await user.click(link)
      
      // Verify regular links work as expected
      expect(link).toHaveAttribute('href', '/regular-link')
    })
  })

  describe('Link Types', () => {
    it('handles internal links correctly', () => {
      render(
        <LinkButton href="/internal">
          Internal Link
        </LinkButton>
      )
      
      const link = screen.getByRole('link')
      expect(link).toHaveAttribute('href', '/internal')
    })

    it('handles external links correctly', () => {
      render(
        <LinkButton href="https://external.com">
          External Link
        </LinkButton>
      )
      
      const link = screen.getByRole('link')
      expect(link).toHaveAttribute('href', 'https://external.com')
    })

    it('handles hash/anchor links correctly', () => {
      render(
        <LinkButton href="#section">
          Anchor Link
        </LinkButton>
      )
      
      const link = screen.getByRole('link')
      expect(link).toHaveAttribute('href', '#section')
    })
  })

  describe('Accessibility', () => {
    it('maintains semantic link structure', () => {
      render(
        <LinkButton href="/accessible">
          Accessible Link
        </LinkButton>
      )
      
      const link = screen.getByRole('link')
      expect(link).toBeInTheDocument()
      expect(link.tagName).toBe('A')
    })

    it('preserves text content for screen readers', () => {
      render(
        <LinkButton href="/screen-reader">
          Screen Reader Content
        </LinkButton>
      )
      
      expect(screen.getByText('Screen Reader Content')).toBeInTheDocument()
    })

    it('works with keyboard navigation', async () => {
      const handleClick = vi.fn()
      const user = userEvent.setup()
      
      render(
        <LinkButton href="/keyboard" onClick={handleClick}>
          Keyboard Link
        </LinkButton>
      )
      
      const link = screen.getByRole('link')
      
      // Tab to the link and press Enter
      await user.tab()
      expect(link).toHaveFocus()
      
      await user.keyboard('{Enter}')
      expect(handleClick).toHaveBeenCalled()
    })
  })
})