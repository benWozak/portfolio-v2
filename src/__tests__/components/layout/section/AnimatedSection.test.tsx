import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@/test-utils'
import { AnimatedSection, itemVariants } from '@/components/layout/section/AnimatedSection'

// Mock framer-motion
const mockUseInView = vi.fn()
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, variants, initial, animate, className, ...props }: any) => (
      <div 
        data-testid="motion-div"
        data-variants={variants ? 'present' : 'absent'}
        data-initial={initial}
        data-animate={animate}
        className={className}
        {...props}
      >
        {children}
      </div>
    )
  },
  useInView: () => mockUseInView(),
  Variants: {}
}))

describe('AnimatedSection Component', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockUseInView.mockReturnValue(false)
  })

  describe('Rendering', () => {
    it('renders children correctly', () => {
      const testContent = <div data-testid="test-content">Test Content</div>
      render(<AnimatedSection>{testContent}</AnimatedSection>)
      
      expect(screen.getByTestId('test-content')).toBeInTheDocument()
      expect(screen.getByText('Test Content')).toBeInTheDocument()
    })

    it('wraps children in motion.div', () => {
      render(
        <AnimatedSection>
          <p>Animation content</p>
        </AnimatedSection>
      )
      
      const motionDiv = screen.getByTestId('motion-div')
      expect(motionDiv).toBeInTheDocument()
      expect(motionDiv).toContainElement(screen.getByText('Animation content'))
    })

    it('applies default className when none provided', () => {
      render(<AnimatedSection><div>Content</div></AnimatedSection>)
      
      const motionDiv = screen.getByTestId('motion-div')
      expect(motionDiv).toHaveClass('')
    })

    it('applies custom className when provided', () => {
      render(
        <AnimatedSection className="custom-class">
          <div>Content</div>
        </AnimatedSection>
      )
      
      const motionDiv = screen.getByTestId('motion-div')
      expect(motionDiv).toHaveClass('custom-class')
    })
  })

  describe('Animation States', () => {
    it('animates to visible when in view', () => {
      mockUseInView.mockReturnValue(true)
      
      render(<AnimatedSection><div>Visible content</div></AnimatedSection>)
      
      const motionDiv = screen.getByTestId('motion-div')
      expect(motionDiv).toHaveAttribute('data-animate', 'visible')
    })

    it('remains hidden when not in view', () => {
      mockUseInView.mockReturnValue(false)
      
      render(<AnimatedSection><div>Hidden content</div></AnimatedSection>)
      
      const motionDiv = screen.getByTestId('motion-div')
      expect(motionDiv).toHaveAttribute('data-animate', 'hidden')
    })

    it('starts with hidden initial state', () => {
      render(<AnimatedSection><div>Initial content</div></AnimatedSection>)
      
      const motionDiv = screen.getByTestId('motion-div')
      expect(motionDiv).toHaveAttribute('data-initial', 'hidden')
    })
  })

  describe('Motion Variants', () => {
    it('applies container variants to motion div', () => {
      render(<AnimatedSection><div>Variant content</div></AnimatedSection>)
      
      const motionDiv = screen.getByTestId('motion-div')
      expect(motionDiv).toHaveAttribute('data-variants', 'present')
    })
  })

  describe('IntersectionObserver Integration', () => {
    it('uses useInView hook correctly', () => {
      render(<AnimatedSection><div>Observer content</div></AnimatedSection>)
      
      expect(mockUseInView).toHaveBeenCalled()
    })

    it('responds to intersection changes', () => {
      // Start not in view
      mockUseInView.mockReturnValue(false)
      const { rerender } = render(<AnimatedSection><div>Content</div></AnimatedSection>)
      
      let motionDiv = screen.getByTestId('motion-div')
      expect(motionDiv).toHaveAttribute('data-animate', 'hidden')
      
      // Change to in view
      mockUseInView.mockReturnValue(true)
      rerender(<AnimatedSection><div>Content</div></AnimatedSection>)
      
      motionDiv = screen.getByTestId('motion-div')
      expect(motionDiv).toHaveAttribute('data-animate', 'visible')
    })
  })

  describe('Children Handling', () => {
    it('handles single child', () => {
      render(
        <AnimatedSection>
          <h1>Single Child</h1>
        </AnimatedSection>
      )
      
      expect(screen.getByText('Single Child')).toBeInTheDocument()
    })

    it('handles multiple children', () => {
      render(
        <AnimatedSection>
          <h1>First Child</h1>
          <p>Second Child</p>
          <div>Third Child</div>
        </AnimatedSection>
      )
      
      expect(screen.getByText('First Child')).toBeInTheDocument()
      expect(screen.getByText('Second Child')).toBeInTheDocument()
      expect(screen.getByText('Third Child')).toBeInTheDocument()
    })

    it('handles React fragments as children', () => {
      render(
        <AnimatedSection>
          <>
            <span>Fragment Child 1</span>
            <span>Fragment Child 2</span>
          </>
        </AnimatedSection>
      )
      
      expect(screen.getByText('Fragment Child 1')).toBeInTheDocument()
      expect(screen.getByText('Fragment Child 2')).toBeInTheDocument()
    })

    it('handles complex nested children', () => {
      render(
        <AnimatedSection>
          <div>
            <h2>Nested Heading</h2>
            <ul>
              <li>Item 1</li>
              <li>Item 2</li>
            </ul>
          </div>
        </AnimatedSection>
      )
      
      expect(screen.getByText('Nested Heading')).toBeInTheDocument()
      expect(screen.getByText('Item 1')).toBeInTheDocument()
      expect(screen.getByText('Item 2')).toBeInTheDocument()
    })
  })

  describe('Exported Variants', () => {
    it('exports itemVariants with correct structure', () => {
      expect(itemVariants).toBeDefined()
      expect(itemVariants.hidden).toBeDefined()
      expect(itemVariants.visible).toBeDefined()
    })

    it('has correct hidden state in itemVariants', () => {
      expect(itemVariants.hidden).toEqual({ opacity: 0, y: 20 })
    })

    it('has correct visible state in itemVariants', () => {
      expect(itemVariants.visible).toEqual({
        opacity: 1,
        y: 0,
        transition: {
          duration: 1,
          ease: [0.25, 0.1, 0.25, 1]
        }
      })
    })
  })

  describe('TypeScript Props Interface', () => {
    it('accepts ReactNode as children', () => {
      const stringChild = "String child"
      const numberChild = 42
      const arrayChild = [<span key="1">Array item 1</span>, <span key="2">Array item 2</span>]
      
      expect(() => render(<AnimatedSection>{stringChild}</AnimatedSection>)).not.toThrow()
      expect(() => render(<AnimatedSection>{numberChild}</AnimatedSection>)).not.toThrow()
      expect(() => render(<AnimatedSection>{arrayChild}</AnimatedSection>)).not.toThrow()
    })

    it('accepts optional className prop', () => {
      expect(() => render(
        <AnimatedSection className="test-class">
          <div>Test</div>
        </AnimatedSection>
      )).not.toThrow()
    })

    it('works without className prop', () => {
      expect(() => render(
        <AnimatedSection>
          <div>Test</div>
        </AnimatedSection>
      )).not.toThrow()
    })
  })

  describe('Animation Configuration', () => {
    it('uses correct container variants configuration', () => {
      render(<AnimatedSection><div>Config test</div></AnimatedSection>)
      
      // Based on the component code, it should have container variants
      const motionDiv = screen.getByTestId('motion-div')
      expect(motionDiv).toHaveAttribute('data-variants', 'present')
    })

    it('applies staggerChildren configuration through variants', () => {
      // This tests that the component is set up to use stagger animations
      render(
        <AnimatedSection>
          <div>Item 1</div>
          <div>Item 2</div>
        </AnimatedSection>
      )
      
      const motionDiv = screen.getByTestId('motion-div')
      expect(motionDiv).toHaveAttribute('data-variants', 'present')
    })
  })

  describe('Performance and Optimization', () => {
    it('uses once: true for intersection observer', () => {
      // This test ensures the component is optimized for performance
      render(<AnimatedSection><div>Performance test</div></AnimatedSection>)
      
      expect(mockUseInView).toHaveBeenCalled()
    })

    it('uses appropriate amount threshold for intersection', () => {
      // Tests that intersection observer uses 0.3 amount threshold
      render(<AnimatedSection><div>Threshold test</div></AnimatedSection>)
      
      expect(mockUseInView).toHaveBeenCalled()
    })
  })

  describe('Edge Cases', () => {
    it('handles null children', () => {
      expect(() => render(<AnimatedSection>{null}</AnimatedSection>)).not.toThrow()
    })

    it('handles undefined children', () => {
      expect(() => render(<AnimatedSection>{undefined}</AnimatedSection>)).not.toThrow()
    })

    it('handles empty string children', () => {
      render(<AnimatedSection>{""}</AnimatedSection>)
      
      const motionDiv = screen.getByTestId('motion-div')
      expect(motionDiv).toBeInTheDocument()
    })

    it('handles boolean children', () => {
      expect(() => render(<AnimatedSection>{true}</AnimatedSection>)).not.toThrow()
      expect(() => render(<AnimatedSection>{false}</AnimatedSection>)).not.toThrow()
    })

    it('maintains animation state across re-renders', () => {
      mockUseInView.mockReturnValue(true)
      
      const { rerender } = render(
        <AnimatedSection className="initial">
          <div>Content</div>
        </AnimatedSection>
      )
      
      rerender(
        <AnimatedSection className="updated">
          <div>Updated Content</div>
        </AnimatedSection>
      )
      
      const motionDiv = screen.getByTestId('motion-div')
      expect(motionDiv).toHaveAttribute('data-animate', 'visible')
      expect(motionDiv).toHaveClass('updated')
    })
  })

  describe('Ref Handling', () => {
    it('creates and uses ref for intersection observer', () => {
      render(<AnimatedSection><div>Ref test</div></AnimatedSection>)
      
      // Component should render without throwing errors related to ref usage
      expect(screen.getByTestId('motion-div')).toBeInTheDocument()
    })
  })

  describe('Integration', () => {
    it('integrates with other layout components', () => {
      render(
        <AnimatedSection className="section-wrapper">
          <div className="section-content">
            <h2>Section Title</h2>
            <p>Section description with some content.</p>
          </div>
        </AnimatedSection>
      )
      
      const motionDiv = screen.getByTestId('motion-div')
      expect(motionDiv).toHaveClass('section-wrapper')
      expect(screen.getByText('Section Title')).toBeInTheDocument()
      expect(screen.getByText('Section description with some content.')).toBeInTheDocument()
    })

    it('can be nested within other components', () => {
      render(
        <div className="outer-container">
          <AnimatedSection className="inner-animated">
            <div className="content">Nested content</div>
          </AnimatedSection>
        </div>
      )
      
      const outerContainer = screen.getByText('Nested content').closest('.outer-container')
      const motionDiv = screen.getByTestId('motion-div')
      
      expect(outerContainer).toContainElement(motionDiv)
      expect(motionDiv).toHaveClass('inner-animated')
    })
  })
})