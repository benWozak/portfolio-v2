import { describe, it, expect } from 'vitest'
import { render, screen } from '@/test-utils'
import { Announcement } from '@/components/ui/Announcement'

describe('Announcement Component', () => {
  describe('Rendering', () => {
    it('renders the announcement container', () => {
      render(<Announcement />)
      
      const container = screen.getByText('Resume download is currently disabled –– Please contact me directly for a copy.').closest('div')
      expect(container).toBeInTheDocument()
    })

    it('renders the announcement message text', () => {
      render(<Announcement />)
      
      const message = screen.getByText(
        'Resume download is currently disabled –– Please contact me directly for a copy.'
      )
      expect(message).toBeInTheDocument()
    })

    it('renders the message within an italic element', () => {
      render(<Announcement />)
      
      const italicText = screen.getByText(
        'Resume download is currently disabled –– Please contact me directly for a copy.'
      )
      expect(italicText.tagName).toBe('I')
    })
  })

  describe('Container Styling', () => {
    it('applies layout and positioning classes', () => {
      render(<Announcement />)
      
      const container = screen.getByText('Resume download is currently disabled –– Please contact me directly for a copy.').closest('div')
      expect(container).toHaveClass(
        'flex',
        'items-center',
        'justify-between',
        'rounded'
      )
    })

    it('applies background color classes for light and dark themes', () => {
      render(<Announcement />)
      
      const container = screen.getByText('Resume download is currently disabled –– Please contact me directly for a copy.').closest('div')
      expect(container).toHaveClass(
        'bg-secondary-100/80',
        'dark:bg-secondary-900/80'
      )
    })

    it('applies padding classes', () => {
      render(<Announcement />)
      
      const container = screen.getByText('Resume download is currently disabled –– Please contact me directly for a copy.').closest('div')
      expect(container).toHaveClass('px-4', 'py-2')
    })

    it('applies text color classes for light and dark themes', () => {
      render(<Announcement />)
      
      const container = screen.getByText('Resume download is currently disabled –– Please contact me directly for a copy.').closest('div')
      expect(container).toHaveClass(
        'text-secondary-foreground',
        'dark:text-primary-foreground'
      )
    })
  })

  describe('Message Styling', () => {
    it('applies text styling classes to the message', () => {
      render(<Announcement />)
      
      const message = screen.getByText(
        'Resume download is currently disabled –– Please contact me directly for a copy.'
      )
      expect(message).toHaveClass(
        'text-sm',
        'font-medium',
        'px-2',
        'py-1'
      )
    })
  })

  describe('Content', () => {
    it('displays the correct announcement message', () => {
      render(<Announcement />)
      
      expect(screen.getByText(/Resume download is currently disabled/)).toBeInTheDocument()
      expect(screen.getByText(/Please contact me directly for a copy/)).toBeInTheDocument()
    })

    it('contains the full expected message text', () => {
      render(<Announcement />)
      
      const expectedText = 'Resume download is currently disabled –– Please contact me directly for a copy.'
      expect(screen.getByText(expectedText)).toBeInTheDocument()
    })
  })

  describe('Accessibility', () => {
    it('provides meaningful content for screen readers', () => {
      render(<Announcement />)
      
      const message = screen.getByText(
        'Resume download is currently disabled –– Please contact me directly for a copy.'
      )
      expect(message).toBeInTheDocument()
    })

    it('uses semantic HTML structure', () => {
      render(<Announcement />)
      
      const container = screen.getByText('Resume download is currently disabled –– Please contact me directly for a copy.').closest('div')
      expect(container?.tagName).toBe('DIV')
      
      const message = screen.getByText(
        'Resume download is currently disabled –– Please contact me directly for a copy.'
      )
      expect(message.tagName).toBe('I')
    })
  })

  describe('Visual Design', () => {
    it('applies proper styling for visual hierarchy', () => {
      render(<Announcement />)
      
      const container = screen.getByText('Resume download is currently disabled –– Please contact me directly for a copy.').closest('div')
      const message = screen.getByText(
        'Resume download is currently disabled –– Please contact me directly for a copy.'
      )
      
      // Container has background and rounded corners
      expect(container).toHaveClass('rounded', 'bg-secondary-100/80')
      
      // Message has proper padding and typography
      expect(message).toHaveClass('text-sm', 'font-medium', 'px-2', 'py-1')
    })

    it('applies consistent spacing and layout', () => {
      render(<Announcement />)
      
      const container = screen.getByText('Resume download is currently disabled –– Please contact me directly for a copy.').closest('div')
      expect(container).toHaveClass(
        'flex',
        'items-center',
        'justify-between',
        'px-4',
        'py-2'
      )
    })
  })
})