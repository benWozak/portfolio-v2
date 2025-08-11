import { describe, it, expect } from 'vitest'
import { render, screen } from '@/test-utils'
import { CTAButton } from '@/components/ui/CTAButton'

describe('CTAButton Component', () => {
  describe('Rendering', () => {
    it('renders as a link element', () => {
      render(
        <CTAButton href="/test">
          Test CTA
        </CTAButton>
      )
      
      const link = screen.getByRole('link', { name: 'Test CTA' })
      expect(link).toBeInTheDocument()
      expect(link).toHaveAttribute('href', '/test')
    })

    it('renders children content correctly', () => {
      render(
        <CTAButton href="/test">
          <span>Custom Content</span>
        </CTAButton>
      )
      
      expect(screen.getByText('Custom Content')).toBeInTheDocument()
    })

    it('renders complex children correctly', () => {
      render(
        <CTAButton href="/test">
          <div>
            <span>Action</span>
            <em>Now</em>
          </div>
        </CTAButton>
      )
      
      expect(screen.getByText('Action')).toBeInTheDocument()
      expect(screen.getByText('Now')).toBeInTheDocument()
    })
  })

  describe('Button Types', () => {
    it('applies primary type styles by default', () => {
      render(
        <CTAButton href="/primary">
          Primary CTA
        </CTAButton>
      )
      
      const link = screen.getByRole('link')
      expect(link).toHaveClass('bg-primary', 'text-primary-foreground')
    })

    it('applies secondary type styles when specified', () => {
      render(
        <CTAButton href="/secondary" type="secondary">
          Secondary CTA
        </CTAButton>
      )
      
      const link = screen.getByRole('link')
      expect(link).toHaveClass(
        'bg-transparent',
        'border',
        'border-neutral-800',
        'text-neutral-800'
      )
    })

    it('includes dark mode classes for secondary type', () => {
      render(
        <CTAButton href="/secondary" type="secondary">
          Secondary CTA
        </CTAButton>
      )
      
      const link = screen.getByRole('link')
      expect(link).toHaveClass(
        'dark:border-neutral-200',
        'dark:text-neutral-200'
      )
    })
  })

  describe('Animation and Hover Effects', () => {
    it('applies hover animation classes', () => {
      render(
        <CTAButton href="/animated">
          Animated CTA
        </CTAButton>
      )
      
      const link = screen.getByRole('link')
      expect(link).toHaveClass(
        'after:content-[\"_\"]',
        'after:absolute',
        'after:h-full',
        'after:w-0',
        'after:right-0',
        'after:transition-all',
        'after:duration-300',
        'after:ease-in-out',
        'hover:after:right-auto',
        'hover:after:left-0',
        'hover:after:w-full'
      )
    })

    it('applies background color for after pseudo-element', () => {
      render(
        <CTAButton href="/test">
          Test CTA
        </CTAButton>
      )
      
      const link = screen.getByRole('link')
      expect(link).toHaveClass('after:bg-secondary-700')
    })
  })

  describe('Custom Styling', () => {
    it('applies custom className when provided', () => {
      render(
        <CTAButton href="/custom" className="custom-styles">
          Custom CTA
        </CTAButton>
      )
      
      const link = screen.getByRole('link')
      expect(link).toHaveClass('custom-styles')
    })

    it('combines custom className with default classes', () => {
      render(
        <CTAButton href="/combined" className="extra-margin">
          Combined CTA
        </CTAButton>
      )
      
      const link = screen.getByRole('link')
      expect(link).toHaveClass('group', 'font-semibold', 'extra-margin')
    })
  })

  describe('Base Layout Classes', () => {
    it('applies structural layout classes', () => {
      render(
        <CTAButton href="/layout">
          Layout CTA
        </CTAButton>
      )
      
      const link = screen.getByRole('link')
      expect(link).toHaveClass(
        'group',
        'font-semibold',
        'relative',
        'flex',
        'justify-center',
        'items-center',
        'rounded-md',
        'overflow-hidden',
        'cursor-pointer'
      )
    })
  })

  describe('Inner Span Styling', () => {
    it('applies correct styles to inner span element', () => {
      render(
        <CTAButton href="/span">
          Span Content
        </CTAButton>
      )
      
      const span = screen.getByText('Span Content')
      expect(span).toHaveClass(
        'relative',
        'w-full',
        'text-center',
        'transition-all',
        'duration-300',
        'hover:text-primary-foreground',
        'hover:border-primary-foreground',
        'text-md',
        'z-20'
      )
    })

    it('applies responsive padding and text classes to inner span', () => {
      render(
        <CTAButton href="/responsive">
          Responsive Content
        </CTAButton>
      )
      
      const span = screen.getByText('Responsive Content')
      expect(span).toHaveClass(
        'px-8',
        'py-2',
        'lg:px-16',
        'lg:py-2',
        'lg:text-lg'
      )
    })
  })

  describe('Link Navigation', () => {
    it('handles internal links correctly', () => {
      render(
        <CTAButton href="/internal">
          Internal Link
        </CTAButton>
      )
      
      const link = screen.getByRole('link')
      expect(link).toHaveAttribute('href', '/internal')
    })

    it('handles external links correctly', () => {
      render(
        <CTAButton href="https://external.com">
          External Link
        </CTAButton>
      )
      
      const link = screen.getByRole('link')
      expect(link).toHaveAttribute('href', 'https://external.com')
    })

    it('handles hash links correctly', () => {
      render(
        <CTAButton href="#section">
          Anchor Link
        </CTAButton>
      )
      
      const link = screen.getByRole('link')
      expect(link).toHaveAttribute('href', '#section')
    })
  })

  describe('Accessibility', () => {
    it('maintains semantic link structure', () => {
      render(
        <CTAButton href="/accessible">
          Accessible CTA
        </CTAButton>
      )
      
      const link = screen.getByRole('link')
      expect(link).toBeInTheDocument()
      expect(link.tagName).toBe('A')
    })

    it('preserves text content for screen readers', () => {
      render(
        <CTAButton href="/screen-reader">
          Screen Reader Content
        </CTAButton>
      )
      
      expect(screen.getByText('Screen Reader Content')).toBeInTheDocument()
    })
  })
})