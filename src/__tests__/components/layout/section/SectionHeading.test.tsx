import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@/test-utils'
import { SectionHeading } from '@/components/layout/section/SectionHeading'

// Mock AnimatedSection component
vi.mock('@/components/layout/section/AnimatedSection', () => ({
  AnimatedSection: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="animated-section">{children}</div>
  ),
  itemVariants: {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  }
}))

describe('SectionHeading Component', () => {
  describe('Rendering', () => {
    it('renders the heading with provided title', () => {
      render(<SectionHeading title="About Me" />)
      
      const heading = screen.getByRole('heading', { level: 2 })
      expect(heading).toHaveTextContent('About Me')
    })

    it('renders heading with correct tag', () => {
      render(<SectionHeading title="My Work" />)
      
      const heading = screen.getByRole('heading', { level: 2 })
      expect(heading.tagName).toBe('H2')
    })

    it('wraps content in AnimatedSection', () => {
      render(<SectionHeading title="Contact" />)
      
      expect(screen.getByTestId('animated-section')).toBeInTheDocument()
    })
  })

  describe('Styling', () => {
    it('applies correct container styling', () => {
      render(<SectionHeading title="Services" />)
      
      const heading = screen.getByRole('heading', { level: 2 })
      const container = heading.parentElement
      
      expect(container).toHaveClass(
        'relative',
        'mb-8',
        'flex',
        'gap-4',
        'items-center'
      )
    })

    it('applies correct heading styling', () => {
      render(<SectionHeading title="Portfolio" />)
      
      const heading = screen.getByRole('heading', { level: 2 })
      expect(heading).toHaveClass(
        'inline-block',
        'text-2xl',
        'font-bold',
        'py-2',
        'lg:px-4',
        'uppercase',
        'tracking-wider'
      )
    })

    it('renders decorative line element', () => {
      render(<SectionHeading title="Skills" />)
      
      const heading = screen.getByRole('heading', { level: 2 })
      const container = heading.parentElement
      const decorativeLine = container?.firstChild
      
      expect(decorativeLine).toHaveClass(
        'w-8',
        'lg:w-16',
        'h-0.5',
        'lg:h-1',
        'rounded-full',
        'bg-primary'
      )
    })
  })

  describe('Responsive Design', () => {
    it('applies responsive padding to heading', () => {
      render(<SectionHeading title="Experience" />)
      
      const heading = screen.getByRole('heading', { level: 2 })
      expect(heading).toHaveClass('py-2', 'lg:px-4')
    })

    it('applies responsive dimensions to decorative line', () => {
      render(<SectionHeading title="Education" />)
      
      const heading = screen.getByRole('heading', { level: 2 })
      const container = heading.parentElement
      const decorativeLine = container?.firstChild
      
      expect(decorativeLine).toHaveClass(
        'w-8', 'lg:w-16',    // Width responsive
        'h-0.5', 'lg:h-1'    // Height responsive
      )
    })
  })

  describe('Content Handling', () => {
    it('handles short titles', () => {
      render(<SectionHeading title="Bio" />)
      
      const heading = screen.getByRole('heading', { level: 2 })
      expect(heading).toHaveTextContent('Bio')
    })

    it('handles long titles', () => {
      const longTitle = "Professional Experience and Career Development"
      render(<SectionHeading title={longTitle} />)
      
      const heading = screen.getByRole('heading', { level: 2 })
      expect(heading).toHaveTextContent(longTitle)
    })

    it('handles titles with special characters', () => {
      render(<SectionHeading title="Skills & Expertise" />)
      
      const heading = screen.getByRole('heading', { level: 2 })
      expect(heading).toHaveTextContent('Skills & Expertise')
    })

    it('handles titles with numbers', () => {
      render(<SectionHeading title="Top 10 Projects" />)
      
      const heading = screen.getByRole('heading', { level: 2 })
      expect(heading).toHaveTextContent('Top 10 Projects')
    })
  })

  describe('Typography and Text Treatment', () => {
    it('applies uppercase transformation', () => {
      render(<SectionHeading title="about" />)
      
      const heading = screen.getByRole('heading', { level: 2 })
      expect(heading).toHaveClass('uppercase')
    })

    it('applies letter spacing', () => {
      render(<SectionHeading title="contact" />)
      
      const heading = screen.getByRole('heading', { level: 2 })
      expect(heading).toHaveClass('tracking-wider')
    })

    it('uses correct font weight and size', () => {
      render(<SectionHeading title="work" />)
      
      const heading = screen.getByRole('heading', { level: 2 })
      expect(heading).toHaveClass('text-2xl', 'font-bold')
    })
  })

  describe('Layout Structure', () => {
    it('positions decorative line before heading', () => {
      render(<SectionHeading title="Projects" />)
      
      const heading = screen.getByRole('heading', { level: 2 })
      const container = heading.parentElement
      const children = Array.from(container?.children || [])
      
      expect(children).toHaveLength(2)
      expect(children[0]).toHaveClass('bg-primary') // Decorative line
      expect(children[1]).toBe(heading)            // Heading element
    })

    it('maintains flex layout alignment', () => {
      render(<SectionHeading title="Testimonials" />)
      
      const heading = screen.getByRole('heading', { level: 2 })
      const container = heading.parentElement
      
      expect(container).toHaveClass('flex', 'items-center')
    })

    it('applies correct gap between elements', () => {
      render(<SectionHeading title="Blog" />)
      
      const heading = screen.getByRole('heading', { level: 2 })
      const container = heading.parentElement
      
      expect(container).toHaveClass('gap-4')
    })
  })

  describe('Primary Color Usage', () => {
    it('applies primary background to decorative line', () => {
      render(<SectionHeading title="FAQ" />)
      
      const heading = screen.getByRole('heading', { level: 2 })
      const container = heading.parentElement
      const decorativeLine = container?.firstChild
      
      expect(decorativeLine).toHaveClass('bg-primary')
    })

    it('uses primary color consistently', () => {
      render(<SectionHeading title="Gallery" />)
      
      // Decorative line should use primary color
      const heading = screen.getByRole('heading', { level: 2 })
      const container = heading.parentElement
      const decorativeLine = container?.querySelector('.bg-primary')
      
      expect(decorativeLine).toBeInTheDocument()
    })
  })

  describe('Motion Integration', () => {
    it('integrates with AnimatedSection correctly', () => {
      render(<SectionHeading title="Awards" />)
      
      const animatedSection = screen.getByTestId('animated-section')
      const heading = screen.getByRole('heading', { level: 2 })
      
      expect(animatedSection).toContainElement(heading)
    })

    it('applies motion variants through AnimatedSection', () => {
      render(<SectionHeading title="News" />)
      
      // The motion div should be present (handled by AnimatedSection)
      const heading = screen.getByRole('heading', { level: 2 })
      const motionContainer = heading.closest('[data-testid="animated-section"]')
      
      expect(motionContainer).toBeInTheDocument()
    })
  })

  describe('Semantic HTML', () => {
    it('uses proper heading hierarchy', () => {
      render(<SectionHeading title="Resources" />)
      
      const heading = screen.getByRole('heading', { level: 2 })
      expect(heading.tagName).toBe('H2')
    })

    it('maintains semantic structure', () => {
      render(<SectionHeading title="Downloads" />)
      
      const heading = screen.getByRole('heading', { level: 2 })
      expect(heading).toHaveAttribute('class')
      expect(heading).toHaveTextContent('Downloads')
    })
  })

  describe('Accessibility', () => {
    it('provides proper heading role', () => {
      render(<SectionHeading title="Privacy Policy" />)
      
      const heading = screen.getByRole('heading', { level: 2 })
      expect(heading).toBeInTheDocument()
    })

    it('maintains readable text contrast with decorative element', () => {
      render(<SectionHeading title="Terms of Service" />)
      
      const heading = screen.getByRole('heading', { level: 2 })
      const container = heading.parentElement
      const decorativeLine = container?.querySelector('.bg-primary')
      
      // Decorative line should not interfere with text readability
      expect(heading).toHaveClass('text-2xl')
      expect(decorativeLine).toHaveClass('bg-primary')
    })
  })

  describe('Component Props Interface', () => {
    it('accepts title prop as string', () => {
      expect(() => 
        render(<SectionHeading title="Valid String Title" />)
      ).not.toThrow()
    })

    it('renders title prop content correctly', () => {
      const testTitle = "Test Section Title"
      render(<SectionHeading title={testTitle} />)
      
      expect(screen.getByText(testTitle)).toBeInTheDocument()
    })
  })

  describe('Edge Cases', () => {
    it('handles empty title string', () => {
      render(<SectionHeading title="" />)
      
      const heading = screen.getByRole('heading', { level: 2 })
      expect(heading).toHaveTextContent('')
    })

    it('handles title with only whitespace', () => {
      render(<SectionHeading title="   " />)
      
      const heading = screen.getByRole('heading', { level: 2 })
      expect(heading).toHaveTextContent('   ')
    })

    it('maintains structure with very long titles', () => {
      const veryLongTitle = "A".repeat(100)
      render(<SectionHeading title={veryLongTitle} />)
      
      const heading = screen.getByRole('heading', { level: 2 })
      const container = heading.parentElement
      
      expect(heading).toHaveTextContent(veryLongTitle)
      expect(container).toHaveClass('flex', 'items-center')
    })

    it('handles titles with HTML entities', () => {
      render(<SectionHeading title="Q&amp;A Section" />)
      
      const heading = screen.getByRole('heading', { level: 2 })
      expect(heading).toHaveTextContent('Q&amp;A Section')
    })
  })
})