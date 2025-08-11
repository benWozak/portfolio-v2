import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@/test-utils'
import userEvent from '@testing-library/user-event'
import { BackButton } from '@/components/ui/BackButton'

// Mock Next.js router
const mockBack = vi.fn()
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    back: mockBack,
    push: vi.fn(),
    replace: vi.fn(),
    refresh: vi.fn(),
    forward: vi.fn(),
    prefetch: vi.fn(),
  }),
}))

describe('BackButton Component', () => {
  beforeEach(() => {
    mockBack.mockClear()
  })

  describe('Rendering', () => {
    it('renders as a button element', () => {
      render(<BackButton />)
      
      const button = screen.getByRole('button', { name: '← Back' })
      expect(button).toBeInTheDocument()
      expect(button.tagName).toBe('BUTTON')
    })

    it('renders the back arrow symbol', () => {
      render(<BackButton />)
      
      const arrow = screen.getByText('←')
      expect(arrow).toBeInTheDocument()
    })

    it('renders the "Back" text', () => {
      render(<BackButton />)
      
      const backText = screen.getByText('Back')
      expect(backText).toBeInTheDocument()
    })
  })

  describe('Event Handling', () => {
    it('calls router.back() when clicked', async () => {
      const user = userEvent.setup()
      
      render(<BackButton />)
      
      const button = screen.getByRole('button')
      await user.click(button)
      
      expect(mockBack).toHaveBeenCalledTimes(1)
    })

    it('handles multiple clicks correctly', async () => {
      const user = userEvent.setup()
      
      render(<BackButton />)
      
      const button = screen.getByRole('button')
      await user.click(button)
      await user.click(button)
      
      expect(mockBack).toHaveBeenCalledTimes(2)
    })
  })

  describe('Button Styling', () => {
    it('applies base layout and positioning classes', () => {
      render(<BackButton />)
      
      const button = screen.getByRole('button')
      expect(button).toHaveClass(
        'group',
        'inline-flex',
        'items-center',
        'mb-8',
        'relative',
        'overflow-hidden'
      )
    })

    it('applies padding and spacing classes', () => {
      render(<BackButton />)
      
      const button = screen.getByRole('button')
      expect(button).toHaveClass('px-4', 'py-2')
    })

    it('applies border and border radius classes', () => {
      render(<BackButton />)
      
      const button = screen.getByRole('button')
      expect(button).toHaveClass(
        'rounded',
        'border',
        'border-transparent'
      )
    })

    it('applies transition and duration classes', () => {
      render(<BackButton />)
      
      const button = screen.getByRole('button')
      expect(button).toHaveClass(
        'transition-colors',
        'duration-300'
      )
    })
  })

  describe('Hover Effects', () => {
    it('applies hover color classes', () => {
      render(<BackButton />)
      
      const button = screen.getByRole('button')
      expect(button).toHaveClass(
        'hover:text-primary-500',
        'dark:hover:text-secondary-400'
      )
    })

    it('applies hover border classes', () => {
      render(<BackButton />)
      
      const button = screen.getByRole('button')
      expect(button).toHaveClass(
        'hover:border-primary-500',
        'dark:hover:border-secondary-400'
      )
    })
  })

  describe('Arrow Animation', () => {
    it('applies arrow animation classes', () => {
      render(<BackButton />)
      
      const arrow = screen.getByText('←')
      expect(arrow).toHaveClass(
        'inline-block',
        'hover:animate-bounce-horizontal',
        'mr-2',
        'transition-transform',
        'duration-300',
        'group-hover:-translate-x-1'
      )
    })
  })

  describe('Back Text Styling', () => {
    it('applies text styling classes', () => {
      render(<BackButton />)
      
      const backText = screen.getByText('Back')
      expect(backText).toHaveClass(
        'relative',
        'z-10',
        'transition-colors',
        'duration-300'
      )
    })
  })

  describe('Accessibility', () => {
    it('has proper button role and is accessible', () => {
      render(<BackButton />)
      
      const button = screen.getByRole('button')
      expect(button).toBeInTheDocument()
      expect(button).toHaveAccessibleName('← Back')
    })

    it('works with keyboard navigation', async () => {
      const user = userEvent.setup()
      
      render(<BackButton />)
      
      const button = screen.getByRole('button')
      
      // Tab to the button and press Enter
      await user.tab()
      expect(button).toHaveFocus()
      
      await user.keyboard('{Enter}')
      expect(mockBack).toHaveBeenCalledTimes(1)
    })

    it('works with space key activation', async () => {
      const user = userEvent.setup()
      
      render(<BackButton />)
      
      const button = screen.getByRole('button')
      button.focus()
      
      await user.keyboard(' ')
      expect(mockBack).toHaveBeenCalledTimes(1)
    })
  })

  describe('Component Structure', () => {
    it('maintains proper semantic structure', () => {
      render(<BackButton />)
      
      const button = screen.getByRole('button')
      const arrow = screen.getByText('←')
      const text = screen.getByText('Back')
      
      expect(button).toContainElement(arrow)
      expect(button).toContainElement(text)
    })

    it('renders arrow before text', () => {
      render(<BackButton />)
      
      const button = screen.getByRole('button')
      const children = Array.from(button.children)
      
      expect(children[0]).toHaveTextContent('←')
      expect(children[1]).toHaveTextContent('Back')
    })
  })

  describe('Router Integration', () => {
    it('integrates correctly with Next.js router', () => {
      render(<BackButton />)
      
      // Component should render without errors, indicating proper router mock setup
      expect(screen.getByRole('button')).toBeInTheDocument()
    })

    it('does not call router.back() on render', () => {
      render(<BackButton />)
      
      // Router.back() should only be called on user interaction, not on render
      expect(mockBack).not.toHaveBeenCalled()
    })
  })
})