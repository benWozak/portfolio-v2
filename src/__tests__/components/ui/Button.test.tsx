import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@/test-utils'
import userEvent from '@testing-library/user-event'
import { Button } from '@/components/ui/Button'

describe('Button Component', () => {
  describe('Rendering', () => {
    it('renders button element when no href provided', () => {
      render(<Button label="Test Button" />)
      
      const button = screen.getByRole('button', { name: 'Test Button' })
      expect(button).toBeInTheDocument()
      expect(button.tagName).toBe('BUTTON')
    })

    it('renders link element when href provided', () => {
      render(<Button label="Test Link" href="/test" />)
      
      const link = screen.getByRole('link', { name: 'Test Link' })
      expect(link).toBeInTheDocument()
      expect(link.tagName).toBe('A')
      expect(link).toHaveAttribute('href', '/test')
    })

    it('renders with icon when provided', () => {
      const TestIcon = <span data-testid="test-icon">🚀</span>
      render(<Button label="Test Button" icon={TestIcon} />)
      
      expect(screen.getByTestId('test-icon')).toBeInTheDocument()
      expect(screen.getByText('Test Button')).toBeInTheDocument()
    })

    it('renders label text correctly', () => {
      render(<Button label="Custom Label" />)
      expect(screen.getByText('Custom Label')).toBeInTheDocument()
    })
  })

  describe('Button Variants', () => {
    it('applies primary variant classes by default', () => {
      render(<Button label="Primary Button" />)
      
      const button = screen.getByRole('button')
      expect(button).toHaveClass('bg-primary', 'text-primary-foreground')
    })

    it('applies secondary variant classes when specified', () => {
      render(<Button label="Secondary Button" variant="secondary" />)
      
      const button = screen.getByRole('button')
      expect(button).toHaveClass('bg-secondary-bg', 'text-foreground')
    })

    it('applies custom className when provided', () => {
      render(<Button label="Custom Button" className="custom-class" />)
      
      const button = screen.getByRole('button')
      expect(button).toHaveClass('custom-class')
    })
  })

  describe('Disabled State', () => {
    it('renders disabled button correctly', () => {
      render(<Button label="Disabled Button" disabled />)
      
      const button = screen.getByRole('button')
      expect(button).toBeDisabled()
      expect(button).toHaveClass('cursor-not-allowed', 'opacity-50')
    })

    it('uses disabledReason for aria-label when provided', () => {
      render(
        <Button 
          label="Submit" 
          disabled 
          disabledReason="Form is incomplete" 
        />
      )
      
      const button = screen.getByRole('button')
      expect(button).toHaveAttribute('aria-label', 'Form is incomplete')
    })

    it('does not render as link when href provided but disabled', () => {
      render(<Button label="Disabled Link" href="/test" disabled />)
      
      expect(screen.queryByRole('link')).not.toBeInTheDocument()
      expect(screen.getByRole('button')).toBeInTheDocument()
    })

    it('applies disabled styles for primary variant', () => {
      render(<Button label="Disabled Primary" disabled variant="primary" />)
      
      const button = screen.getByRole('button')
      expect(button).toHaveClass('bg-primary', 'cursor-not-allowed', 'opacity-50')
    })

    it('applies disabled styles for secondary variant', () => {
      render(<Button label="Disabled Secondary" disabled variant="secondary" />)
      
      const button = screen.getByRole('button')
      expect(button).toHaveClass('bg-secondary-bg', 'cursor-not-allowed', 'opacity-50')
    })
  })

  describe('Link Behavior', () => {
    it('renders external link attributes correctly', () => {
      render(
        <Button 
          label="External Link" 
          href="https://example.com" 
          noreferrer 
        />
      )
      
      const link = screen.getByRole('link')
      expect(link).toHaveAttribute('href', 'https://example.com')
      expect(link).toHaveAttribute('rel', 'noreferrer noopener')
    })

    it('does not add rel attribute when noreferrer is false', () => {
      render(<Button label="Internal Link" href="/internal" noreferrer={false} />)
      
      const link = screen.getByRole('link')
      expect(link).toHaveAttribute('href', '/internal')
      expect(link).not.toHaveAttribute('rel')
    })
  })

  describe('Event Handling', () => {
    it('calls onClick handler when button is clicked', async () => {
      const handleClick = vi.fn()
      const user = userEvent.setup()
      
      render(<Button label="Click Me" onClick={handleClick} />)
      
      const button = screen.getByRole('button')
      await user.click(button)
      
      expect(handleClick).toHaveBeenCalledTimes(1)
    })

    it('does not call onClick when button is disabled', async () => {
      const handleClick = vi.fn()
      const user = userEvent.setup()
      
      render(<Button label="Disabled Button" onClick={handleClick} disabled />)
      
      const button = screen.getByRole('button')
      await user.click(button)
      
      expect(handleClick).not.toHaveBeenCalled()
    })
  })

  describe('Accessibility', () => {
    it('has correct button type attribute', () => {
      render(<Button label="Submit Button" />)
      
      const button = screen.getByRole('button')
      expect(button).toHaveAttribute('type', 'button')
    })

    it('has proper aria-label for buttons', () => {
      render(<Button label="Action Button" />)
      
      const button = screen.getByRole('button')
      expect(button).toHaveAttribute('aria-label', 'Action Button')
    })

    it('has proper aria-label for links', () => {
      render(<Button label="Navigation Link" href="/nav" />)
      
      const link = screen.getByRole('link')
      expect(link).toHaveAttribute('aria-label', 'Navigation Link')
    })

    it('maintains accessibility when disabled', () => {
      render(<Button label="Disabled Button" disabled />)
      
      const button = screen.getByRole('button')
      expect(button).toBeDisabled()
      expect(button).toHaveAttribute('aria-label', 'Disabled Button')
    })
  })

  describe('Base Classes', () => {
    it('applies base styling classes', () => {
      render(<Button label="Styled Button" />)
      
      const button = screen.getByRole('button')
      expect(button).toHaveClass(
        'px-4',
        'py-2',
        'rounded',
        'shadow',
        'flex',
        'items-center',
        'justify-center',
        'gap-2',
        'text-sm',
        'transition-colors'
      )
    })

    it('combines base classes with variant classes', () => {
      render(<Button label="Combined Classes" variant="secondary" />)
      
      const button = screen.getByRole('button')
      expect(button).toHaveClass('px-4', 'py-2', 'bg-secondary-bg')
    })
  })
})