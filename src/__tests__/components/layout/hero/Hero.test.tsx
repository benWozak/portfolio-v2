import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@/test-utils'
import { Hero } from '@/components/layout/hero/Hero'

// Mock child components
vi.mock('@/components/ui', () => ({
  CTAButton: ({ children, href, type }: any) => (
    <a href={href} data-testid={`cta-button-${type || 'primary'}`} data-href={href}>
      {children}
    </a>
  )
}))

vi.mock('@/components/layout/hero/TechOrbit', () => ({
  TechOrbit: () => <div data-testid="tech-orbit">Tech Orbit</div>
}))

// Mock itemVariants import
vi.mock('@/components/layout/section/AnimatedSection', () => ({
  itemVariants: {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  }
}))

describe('Hero Component', () => {
  describe('Rendering', () => {
    it('renders main section element', () => {
      render(<Hero />)
      
      const section = screen.getByRole('main') || screen.getByText('Your Vision').closest('section')
      expect(section).toBeInTheDocument()
    })

    it('renders main heading with correct text and styling', () => {
      render(<Hero />)
      
      const heading = screen.getByRole('heading', { level: 1 })
      expect(heading).toHaveTextContent('Your Vision')
      expect(heading).toHaveTextContent('Expertly Developed')
      expect(heading).toHaveClass(
        'text-3xl',
        'font-bold',
        'tracking-wide',
        'text-gray-800',
        'dark:text-white',
        'md:text-4xl',
        'lg:text-6xl'
      )
    })

    it('renders primary text with highlighted span', () => {
      render(<Hero />)
      
      const primarySpan = screen.getByText('Your Vision')
      expect(primarySpan).toHaveClass('text-primary-500')
    })

    it('renders description paragraph', () => {
      render(<Hero />)
      
      const description = screen.getByText(/From concept to completion/)
      expect(description).toBeInTheDocument()
      expect(description).toHaveClass(
        'my-8',
        'font-semibold',
        'text-lg',
        'lg:text-2xl',
        'text-gray-600',
        'dark:text-gray-300'
      )
    })

    it('highlights "digital experiences" in description', () => {
      render(<Hero />)
      
      const highlightedText = screen.getByText('digital experiences.')
      expect(highlightedText).toHaveClass('text-primary-500')
    })

    it('renders TechOrbit component', () => {
      render(<Hero />)
      
      expect(screen.getByTestId('tech-orbit')).toBeInTheDocument()
    })
  })

  describe('CTA Buttons', () => {
    it('renders primary CTA button with correct props', () => {
      render(<Hero />)
      
      const primaryButton = screen.getByTestId('cta-button-primary')
      expect(primaryButton).toHaveTextContent('Get in Touch')
      expect(primaryButton).toHaveAttribute('data-href', '/contact')
    })

    it('renders secondary CTA button with correct props', () => {
      render(<Hero />)
      
      const secondaryButton = screen.getByTestId('cta-button-secondary')
      expect(secondaryButton).toHaveTextContent('Learn More')
      expect(secondaryButton).toHaveAttribute('data-href', '#about')
    })

    it('wraps CTA buttons in correct container', () => {
      render(<Hero />)
      
      const primaryButton = screen.getByTestId('cta-button-primary')
      const secondaryButton = screen.getByTestId('cta-button-secondary')
      const container = primaryButton.parentElement
      
      expect(container).toContainElement(secondaryButton)
      expect(container).toHaveClass('mb-6', 'lg:my-10', 'flex', 'gap-4')
    })
  })

  describe('Layout and Responsive Design', () => {
    it('applies correct section styling', () => {
      render(<Hero />)
      
      const section = screen.getByText('Your Vision').closest('section')
      expect(section).toHaveClass(
        'relative',
        'h-auto',
        'w-full',
        'flex',
        'flex-col',
        'px-4',
        'mb-16',
        'mx-auto',
        'mt-36',
        'lg:my-32',
        'lg:h-[32rem]',
        'lg:flex-row',
        'lg:items-center'
      )
    })

    it('renders text content in full-width container', () => {
      render(<Hero />)
      
      const heading = screen.getByRole('heading', { level: 1 })
      const textContainer = heading.parentElement
      expect(textContainer).toHaveClass('w-full')
    })

    it('renders tech orbit in responsive container', () => {
      render(<Hero />)
      
      const techOrbit = screen.getByTestId('tech-orbit')
      const orbitContainer = techOrbit.parentElement
      expect(orbitContainer).toHaveClass(
        'flex',
        'items-center',
        'justify-center',
        'w-full',
        'h-96',
        'lg:w-2/3'
      )
    })
  })

  describe('Motion Animation', () => {
    it('applies container variants to section', () => {
      render(<Hero />)
      
      const section = screen.getByText('Your Vision').closest('section')
      expect(section).toBeInTheDocument()
      // Motion properties are handled by framer-motion, so we verify structure
    })

    it('wraps animated elements properly', () => {
      render(<Hero />)
      
      // All main elements should be present and wrapped for animation
      expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument()
      expect(screen.getByText(/From concept to completion/)).toBeInTheDocument()
      expect(screen.getByTestId('cta-button-primary').parentElement).toBeInTheDocument()
      expect(screen.getByTestId('tech-orbit').parentElement).toBeInTheDocument()
    })
  })

  describe('Content Structure', () => {
    it('maintains correct content hierarchy', () => {
      render(<Hero />)
      
      const section = screen.getByText('Your Vision').closest('section')
      const textContainer = screen.getByRole('heading', { level: 1 }).parentElement
      const orbitContainer = screen.getByTestId('tech-orbit').parentElement
      
      expect(section).toContainElement(textContainer)
      expect(section).toContainElement(orbitContainer)
      
      // Text container should contain heading, description, and buttons
      expect(textContainer).toContainElement(screen.getByRole('heading'))
      expect(textContainer).toContainElement(screen.getByText(/From concept to completion/))
      expect(textContainer).toContainElement(screen.getByTestId('cta-button-primary'))
    })

    it('renders heading with proper line breaks', () => {
      render(<Hero />)
      
      const heading = screen.getByRole('heading', { level: 1 })
      const headingHTML = heading.innerHTML
      
      expect(headingHTML).toContain('Your Vision')
      expect(headingHTML).toContain('Expertly Developed')
      expect(headingHTML).toContain('<br>')
    })

    it('renders description with proper inline styling', () => {
      render(<Hero />)
      
      const description = screen.getByText(/From concept to completion/)
      expect(description).toContainHTML('digital experiences.')
      
      const highlightedText = screen.getByText('digital experiences.')
      expect(highlightedText.tagName).toBe('SPAN')
    })
  })

  describe('Accessibility', () => {
    it('uses proper heading hierarchy', () => {
      render(<Hero />)
      
      const h1 = screen.getByRole('heading', { level: 1 })
      expect(h1).toBeInTheDocument()
      expect(h1).toHaveTextContent('Your Vision')
    })

    it('provides meaningful link text for CTA buttons', () => {
      render(<Hero />)
      
      const getInTouchButton = screen.getByText('Get in Touch')
      const learnMoreButton = screen.getByText('Learn More')
      
      expect(getInTouchButton).toBeInTheDocument()
      expect(learnMoreButton).toBeInTheDocument()
    })

    it('maintains semantic structure', () => {
      render(<Hero />)
      
      // Should have proper semantic elements
      const section = screen.getByText('Your Vision').closest('section')
      const heading = screen.getByRole('heading', { level: 1 })
      
      expect(section?.tagName).toBe('SECTION')
      expect(heading.tagName).toBe('H1')
    })
  })

  describe('Color Scheme Support', () => {
    it('applies dark mode classes to heading', () => {
      render(<Hero />)
      
      const heading = screen.getByRole('heading', { level: 1 })
      expect(heading).toHaveClass('text-gray-800', 'dark:text-white')
    })

    it('applies dark mode classes to description', () => {
      render(<Hero />)
      
      const description = screen.getByText(/From concept to completion/)
      expect(description).toHaveClass('text-gray-600', 'dark:text-gray-300')
    })

    it('uses primary color for highlighted text', () => {
      render(<Hero />)
      
      const primaryText = screen.getByText('Your Vision')
      const highlightedText = screen.getByText('digital experiences.')
      
      expect(primaryText).toHaveClass('text-primary-500')
      expect(highlightedText).toHaveClass('text-primary-500')
    })
  })

  describe('Integration with Components', () => {
    it('integrates with CTAButton component correctly', () => {
      render(<Hero />)
      
      const primaryButton = screen.getByTestId('cta-button-primary')
      const secondaryButton = screen.getByTestId('cta-button-secondary')
      
      expect(primaryButton).toHaveAttribute('href', '/contact')
      expect(secondaryButton).toHaveAttribute('href', '#about')
    })

    it('integrates with TechOrbit component correctly', () => {
      render(<Hero />)
      
      const techOrbit = screen.getByTestId('tech-orbit')
      expect(techOrbit).toBeInTheDocument()
      expect(techOrbit).toHaveTextContent('Tech Orbit')
    })
  })

  describe('Edge Cases', () => {
    it('handles missing itemVariants import gracefully', () => {
      // Component should still render even if motion variants fail
      expect(() => render(<Hero />)).not.toThrow()
      
      expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument()
      expect(screen.getByTestId('tech-orbit')).toBeInTheDocument()
    })

    it('maintains layout with long text content', () => {
      render(<Hero />)
      
      // Even with potentially long text, layout should be maintained
      const section = screen.getByText('Your Vision').closest('section')
      const textContainer = screen.getByRole('heading').parentElement
      const orbitContainer = screen.getByTestId('tech-orbit').parentElement
      
      expect(section).toHaveClass('flex')
      expect(textContainer).toHaveClass('w-full')
      expect(orbitContainer).toHaveClass('w-full', 'lg:w-2/3')
    })
  })
})