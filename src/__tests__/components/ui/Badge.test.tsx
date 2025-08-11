import { describe, it, expect } from 'vitest'
import { render, screen } from '@/test-utils'
import { Badge } from '@/components/ui/Badge'

describe('Badge Component', () => {
  describe('Rendering', () => {
    it('renders badge element', () => {
      render(<Badge status="Featured" />)
      
      const badge = screen.getByText('Featured')
      expect(badge).toBeInTheDocument()
      expect(badge.tagName).toBe('SPAN')
    })

    it('displays the status text correctly', () => {
      render(<Badge status="In Progress" />)
      
      expect(screen.getByText('In Progress')).toBeInTheDocument()
    })

    it('renders without status prop', () => {
      const { container } = render(<Badge />)
      
      const badge = container.querySelector('span')
      expect(badge).toBeInTheDocument()
      expect(badge).toBeEmptyDOMElement()
    })

    it('renders with custom string status', () => {
      render(<Badge status="Custom Status" />)
      
      expect(screen.getByText('Custom Status')).toBeInTheDocument()
    })
  })

  describe('Base Styling', () => {
    it('applies base badge styling classes', () => {
      render(<Badge status="Test" />)
      
      const badge = screen.getByText('Test')
      expect(badge).toHaveClass(
        'px-2',
        'py-1',
        'text-xs',
        'font-medium',
        'rounded-full'
      )
    })
  })

  describe('Status Color Variants', () => {
    it('applies "In Progress" status colors', () => {
      render(<Badge status="In Progress" />)
      
      const badge = screen.getByText('In Progress')
      expect(badge).toHaveClass('bg-yellow-100', 'text-yellow-800')
    })

    it('applies "Prototype" status colors', () => {
      render(<Badge status="Prototype" />)
      
      const badge = screen.getByText('Prototype')
      expect(badge).toHaveClass('bg-blue-100', 'text-blue-800')
    })

    it('applies "Professional" status colors', () => {
      render(<Badge status="Professional" />)
      
      const badge = screen.getByText('Professional')
      expect(badge).toHaveClass('bg-green-100', 'text-green-800')
    })

    it('applies "Featured" status colors', () => {
      render(<Badge status="Featured" />)
      
      const badge = screen.getByText('Featured')
      expect(badge).toHaveClass('bg-primary-500', 'text-primary-foreground')
    })
  })

  describe('Project Type Variants', () => {
    it('applies "web" type colors', () => {
      render(<Badge status="web" />)
      
      const badge = screen.getByText('web')
      expect(badge).toHaveClass('bg-primary-500', 'text-primary-foreground')
    })

    it('applies "native" type colors', () => {
      render(<Badge status="native" />)
      
      const badge = screen.getByText('native')
      expect(badge).toHaveClass('bg-secondary-700', 'text-primary-foreground')
    })
  })

  describe('Default Styling', () => {
    it('applies default colors for unknown status', () => {
      render(<Badge status="Unknown Status" />)
      
      const badge = screen.getByText('Unknown Status')
      expect(badge).toHaveClass(
        'bg-gray-100',
        'text-gray-800',
        'dark:bg-gray-800',
        'dark:text-gray-100'
      )
    })

    it('applies default colors when no status provided', () => {
      const { container } = render(<Badge />)
      
      const badge = container.querySelector('span')
      expect(badge).toHaveClass(
        'bg-gray-100',
        'text-gray-800',
        'dark:bg-gray-800',
        'dark:text-gray-100'
      )
    })

    it('applies default colors for empty string status', () => {
      const { container } = render(<Badge status="" />)
      
      const badge = container.querySelector('span')
      expect(badge).toHaveClass(
        'bg-gray-100',
        'text-gray-800',
        'dark:bg-gray-800',
        'dark:text-gray-100'
      )
    })
  })

  describe('Custom ClassName', () => {
    it('applies custom className when provided', () => {
      render(<Badge status="Test" className="custom-badge" />)
      
      const badge = screen.getByText('Test')
      expect(badge).toHaveClass('custom-badge')
    })

    it('combines custom className with base classes', () => {
      render(<Badge status="Test" className="extra-margin" />)
      
      const badge = screen.getByText('Test')
      expect(badge).toHaveClass(
        'px-2',
        'py-1',
        'text-xs',
        'font-medium',
        'rounded-full',
        'extra-margin'
      )
    })

    it('does not add undefined to className when not provided', () => {
      render(<Badge status="Test" />)
      
      const badge = screen.getByText('Test')
      expect(badge.className).not.toContain('undefined')
    })

    it('handles empty className correctly', () => {
      render(<Badge status="Test" className="" />)
      
      const badge = screen.getByText('Test')
      expect(badge).toHaveClass('px-2', 'py-1')
      expect(badge.className).not.toContain('undefined')
    })
  })

  describe('Color Mapping Consistency', () => {
    it('maintains consistent colors for same status across renders', () => {
      const { rerender } = render(<Badge status="Professional" />)
      
      let badge = screen.getByText('Professional')
      expect(badge).toHaveClass('bg-green-100', 'text-green-800')
      
      rerender(<Badge status="Professional" />)
      
      badge = screen.getByText('Professional')
      expect(badge).toHaveClass('bg-green-100', 'text-green-800')
    })

    it('applies different colors for different statuses', () => {
      render(
        <div>
          <Badge status="In Progress" />
          <Badge status="Professional" />
        </div>
      )
      
      const inProgressBadge = screen.getByText('In Progress')
      const professionalBadge = screen.getByText('Professional')
      
      expect(inProgressBadge).toHaveClass('bg-yellow-100', 'text-yellow-800')
      expect(professionalBadge).toHaveClass('bg-green-100', 'text-green-800')
    })
  })

  describe('Accessibility', () => {
    it('provides meaningful text content for screen readers', () => {
      render(<Badge status="In Progress" />)
      
      const badge = screen.getByText('In Progress')
      expect(badge).toBeInTheDocument()
    })

    it('uses semantic span element', () => {
      render(<Badge status="Featured" />)
      
      const badge = screen.getByText('Featured')
      expect(badge.tagName).toBe('SPAN')
    })

    it('maintains text readability with proper contrast classes', () => {
      render(<Badge status="Featured" />)
      
      const badge = screen.getByText('Featured')
      expect(badge).toHaveClass('bg-primary-500', 'text-primary-foreground')
    })
  })

  describe('Edge Cases', () => {
    it('handles undefined status gracefully', () => {
      const { container } = render(<Badge status={undefined} />)
      
      const badge = container.querySelector('span')
      expect(badge).toBeInTheDocument()
      expect(badge).toHaveClass('bg-gray-100', 'text-gray-800')
    })

    it('handles null status gracefully', () => {
      const { container } = render(<Badge status={null as any} />)
      
      const badge = container.querySelector('span')
      expect(badge).toBeInTheDocument()
      expect(badge).toHaveClass('bg-gray-100', 'text-gray-800')
    })

    it('handles numeric status values', () => {
      render(<Badge status={123 as any} />)
      
      const badge = screen.getByText('123')
      expect(badge).toBeInTheDocument()
      expect(badge).toHaveClass('bg-gray-100', 'text-gray-800')
    })
  })

  describe('Dark Mode Support', () => {
    it('includes dark mode classes for default styling', () => {
      render(<Badge status="Unknown" />)
      
      const badge = screen.getByText('Unknown')
      expect(badge).toHaveClass(
        'dark:bg-gray-800',
        'dark:text-gray-100'
      )
    })

    it('provides appropriate color contrast for all themes', () => {
      const statuses = ['In Progress', 'Prototype', 'Professional', 'Featured', 'web', 'native']
      
      statuses.forEach(status => {
        const { unmount } = render(<Badge status={status} />)
        const badge = screen.getByText(status)
        
        // Should have background and text color classes
        expect(badge.className).toMatch(/bg-\w+/)
        expect(badge.className).toMatch(/text-\w+/)
        
        unmount()
      })
    })
  })
})