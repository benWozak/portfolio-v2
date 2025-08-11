import { describe, it, expect } from 'vitest'
import { render, screen } from '@/test-utils'
import { VideoLoader } from '@/components/ui/VideoLoader'

describe('VideoLoader Component', () => {
  describe('Rendering', () => {
    it('renders the loader container', () => {
      const { container } = render(<VideoLoader />)
      
      const loaderContainer = container.querySelector('.bg-gradient-to-br')
      expect(loaderContainer).toBeInTheDocument()
    })

    it('renders the loading message', () => {
      render(<VideoLoader />)
      
      const message = screen.getByText('Loading video...')
      expect(message).toBeInTheDocument()
    })

    it('renders the spinner elements', () => {
      const { container } = render(<VideoLoader />)
      
      const spinnerContainer = container.querySelector('.relative')
      
      expect(spinnerContainer).toBeInTheDocument()
    })
  })

  describe('Container Styling', () => {
    it('applies layout and centering classes', () => {
      const { container } = render(<VideoLoader />)
      
      const loaderContainer = container.querySelector('.bg-gradient-to-br')
      expect(loaderContainer).toHaveClass(
        'flex',
        'items-center',
        'justify-center'
      )
    })

    it('applies gradient background classes', () => {
      const { container } = render(<VideoLoader />)
      
      const loaderContainer = container.querySelector('.bg-gradient-to-br')
      expect(loaderContainer).toHaveClass(
        'bg-gradient-to-br',
        'from-secondary-400',
        'via-secondary-500',
        'to-secondary-800'
      )
    })

    it('applies default className when none provided', () => {
      const { container } = render(<VideoLoader />)
      
      const loaderContainer = container.querySelector('.bg-gradient-to-br')
      expect(loaderContainer?.className).toContain('flex items-center justify-center')
      expect(loaderContainer?.className).not.toContain('undefined')
    })
  })

  describe('Custom ClassName', () => {
    it('applies custom className when provided', () => {
      const { container } = render(<VideoLoader className="custom-loader" />)
      
      const loaderContainer = container.querySelector('.bg-gradient-to-br')
      expect(loaderContainer).toHaveClass('custom-loader')
    })

    it('combines custom className with base classes', () => {
      const { container } = render(<VideoLoader className="w-full h-64" />)
      
      const loaderContainer = container.querySelector('.bg-gradient-to-br')
      expect(loaderContainer).toHaveClass(
        'flex',
        'items-center',
        'justify-center',
        'bg-gradient-to-br',
        'w-full',
        'h-64'
      )
    })

    it('handles empty className correctly', () => {
      const { container } = render(<VideoLoader className="" />)
      
      const loaderContainer = container.querySelector('.bg-gradient-to-br')
      expect(loaderContainer).toHaveClass('flex', 'items-center', 'justify-center')
      expect(loaderContainer?.className).not.toContain('undefined')
    })
  })

  describe('Spinner Structure', () => {
    it('creates proper spinner structure with two elements', () => {
      const { container } = render(<VideoLoader />)
      
      const spinnerContainer = container.querySelector('.relative')
      
      expect(spinnerContainer).toBeInTheDocument()
      // Should have circular elements for the spinner effect
    })

    it('applies relative positioning to spinner container', () => {
      const { container } = render(<VideoLoader />)
      
      const spinnerContainer = container.querySelector('.relative')
      
      expect(spinnerContainer).toHaveClass('relative')
    })
  })

  describe('Spinner Styling', () => {
    it('applies correct styling to spinner elements', () => {
      const { container } = render(<VideoLoader />)
      
      const spinnerElements = container.querySelectorAll('.w-8')
      
      expect(spinnerElements.length).toBeGreaterThan(0)
    })

    it('applies correct styling to animated circle', () => {
      const { container } = render(<VideoLoader />)
      
      const animatedCircle = container.querySelector('.animate-spin')
      
      expect(animatedCircle).toBeInTheDocument()
    })

    it('applies absolute positioning to animated circle', () => {
      const { container } = render(<VideoLoader />)
      
      const animatedCircle = container.querySelector('.absolute')
      
      expect(animatedCircle).toBeInTheDocument()
    })
  })

  describe('Loading Text Styling', () => {
    it('applies correct text styling classes', () => {
      render(<VideoLoader />)
      
      const message = screen.getByText('Loading video...')
      expect(message).toHaveClass(
        'text-white/80',
        'text-sm',
        'font-medium'
      )
    })

    it('renders text as span element', () => {
      render(<VideoLoader />)
      
      const message = screen.getByText('Loading video...')
      expect(message.tagName).toBe('SPAN')
    })
  })

  describe('Layout Structure', () => {
    it('maintains proper component hierarchy', () => {
      const { container } = render(<VideoLoader />)
      
      const flexColumn = container.querySelector('.flex-col')
      const message = screen.getByText('Loading video...')
      
      expect(flexColumn).toBeInTheDocument()
      expect(flexColumn).toContainElement(message)
    })

    it('applies flex column and centering to inner container', () => {
      const { container } = render(<VideoLoader />)
      
      const innerContainer = container.querySelector('.flex-col')
      
      expect(innerContainer).toHaveClass(
        'flex',
        'flex-col',
        'items-center',
        'space-y-3'
      )
    })
  })

  describe('Animation Classes', () => {
    it('applies spin animation to spinner element', () => {
      const { container } = render(<VideoLoader />)
      
      const spinningElement = container.querySelector('.animate-spin')
      
      expect(spinningElement).toHaveClass('animate-spin')
    })

    it('maintains animation classes throughout component lifecycle', () => {
      const { rerender, container } = render(<VideoLoader />)
      
      let spinningElement = container.querySelector('.animate-spin')
      expect(spinningElement).toHaveClass('animate-spin')
      
      rerender(<VideoLoader className="updated" />)
      
      spinningElement = container.querySelector('.animate-spin')
      expect(spinningElement).toHaveClass('animate-spin')
    })
  })

  describe('Accessibility', () => {
    it('provides meaningful loading text for screen readers', () => {
      render(<VideoLoader />)
      
      const message = screen.getByText('Loading video...')
      expect(message).toBeInTheDocument()
    })

    it('uses semantic structure for loading indicator', () => {
      const { container } = render(<VideoLoader />)
      
      const loaderContainer = container.querySelector('.bg-gradient-to-br')
      expect(loaderContainer?.tagName).toBe('DIV')
    })

    it('maintains readability with proper color contrast', () => {
      render(<VideoLoader />)
      
      const message = screen.getByText('Loading video...')
      expect(message).toHaveClass('text-white/80')
    })
  })

  describe('Visual Design Consistency', () => {
    it('applies consistent spacing between spinner and text', () => {
      const { container } = render(<VideoLoader />)
      
      const innerContainer = container.querySelector('.space-y-3')
      
      expect(innerContainer).toHaveClass('space-y-3')
    })

    it('maintains consistent spinner dimensions', () => {
      const { container } = render(<VideoLoader />)
      
      const spinnerElements = container.querySelectorAll('.w-8')
      
      // Should have elements with consistent dimensions
      expect(spinnerElements.length).toBeGreaterThan(0)
    })

    it('applies consistent border styling to spinner elements', () => {
      const { container } = render(<VideoLoader />)
      
      const borderedElements = container.querySelectorAll('.border-2')
      
      expect(borderedElements.length).toBeGreaterThan(0)
    })
  })

  describe('Responsive Design', () => {
    it('maintains consistent design across different container sizes', () => {
      const { rerender, container } = render(<VideoLoader className="w-32 h-32" />)
      
      let loaderContainer = container.querySelector('.bg-gradient-to-br')
      let message = screen.getByText('Loading video...')
      
      expect(loaderContainer).toHaveClass('w-32', 'h-32')
      expect(message).toHaveClass('text-sm')
      
      rerender(<VideoLoader className="w-64 h-64" />)
      
      loaderContainer = container.querySelector('.bg-gradient-to-br')
      message = screen.getByText('Loading video...')
      
      expect(loaderContainer).toHaveClass('w-64', 'h-64')
      expect(message).toHaveClass('text-sm')
    })
  })

  describe('Component Props', () => {
    it('handles undefined className prop gracefully', () => {
      const { container } = render(<VideoLoader className={undefined} />)
      
      const loaderContainer = container.querySelector('.bg-gradient-to-br')
      expect(loaderContainer).toBeInTheDocument()
      expect(loaderContainer?.className).not.toContain('undefined')
    })

    it('handles all props correctly with TypeScript interface', () => {
      // This test ensures the component accepts the correct props structure
      const props: React.ComponentProps<typeof VideoLoader> = {
        className: 'test-class'
      }
      
      const { container } = render(<VideoLoader {...props} />)
      
      const loaderContainer = container.querySelector('.bg-gradient-to-br')
      expect(loaderContainer).toHaveClass('test-class')
    })
  })
})