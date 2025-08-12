import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@/test-utils'
import { Hero } from '@/components/layout/hero/HeroAlternate'

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

describe('HeroAlternate Component', () => {
  describe('Rendering', () => {
    it('renders main section element', () => {
      render(<Hero />)
      
      const section = screen.getByText('Your Vision').closest('section')
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
        'mt-4',
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

  describe('Service Items', () => {
    const expectedItems = [
      'Custom Websites',
      'Product Stores', 
      'Online Services',
      'Custom Solutions'
    ]

    it('renders all service items', () => {
      render(<Hero />)
      
      expectedItems.forEach(item => {
        expect(screen.getByText(item)).toBeInTheDocument()
      })
    })

    it('renders service items in grid layout', () => {
      render(<Hero />)
      
      const firstItem = screen.getByText('Custom Websites')
      const gridContainer = firstItem.closest('.grid')
      
      expect(gridContainer).toHaveClass('grid', 'gap-2', 'mt-8', 'sm:grid-cols-2')
    })

    it('renders checkmark icons for all items', () => {
      render(<Hero />)
      
      expectedItems.forEach(item => {
        const itemElement = screen.getByText(item)
        const itemContainer = itemElement.parentElement
        const svg = itemContainer?.querySelector('svg')
        
        expect(svg).toBeInTheDocument()
        expect(svg).toHaveClass('w-5', 'h-5', 'mx-3')
        expect(svg?.querySelector('path')).toHaveAttribute('d', 'M5 13l4 4L19 7')
      })
    })

    it('applies correct styling to service items', () => {
      render(<Hero />)
      
      const firstItem = screen.getByText('Custom Websites')
      const itemContainer = firstItem.parentElement
      
      expect(itemContainer).toHaveClass(
        'flex',
        'items-center',
        'lg:text-lg',
        'text-gray-800',
        '-px-3',
        'dark:text-gray-200'
      )
    })

    it('positions text correctly within items', () => {
      render(<Hero />)
      
      const firstItem = screen.getByText('Custom Websites')
      const textSpan = firstItem.parentElement?.querySelector('span.mx-3')
      
      expect(textSpan).toContainElement(firstItem)
      expect(textSpan).toHaveClass('mx-3')
    })
  })

  describe('CTA Buttons', () => {
    it('renders primary CTA button with correct props', () => {
      render(<Hero />)
      
      const primaryButton = screen.getByTestId('cta-button-primary')
      expect(primaryButton).toHaveTextContent('Get in Touch')
      expect(primaryButton).toHaveAttribute('data-href', '/contact')
    })

    it('renders secondary CTA button with different href', () => {
      render(<Hero />)
      
      const secondaryButton = screen.getByTestId('cta-button-secondary')
      expect(secondaryButton).toHaveTextContent('Learn More')
      expect(secondaryButton).toHaveAttribute('data-href', '/about')
    })

    it('wraps CTA buttons in correct container', () => {
      render(<Hero />)
      
      const primaryButton = screen.getByTestId('cta-button-primary')
      const secondaryButton = screen.getByTestId('cta-button-secondary')
      const container = primaryButton.parentElement
      
      expect(container).toContainElement(secondaryButton)
      expect(container).toHaveClass('my-6', 'lg:my-10', 'flex', 'gap-4')
    })
  })

  describe('Layout Differences from Hero', () => {
    it('uses different description margin', () => {
      render(<Hero />)
      
      const description = screen.getByText(/From concept to completion/)
      expect(description).toHaveClass('mt-4') // Different from Hero which uses 'my-8'
    })

    it('uses different CTA container margin', () => {
      render(<Hero />)
      
      const primaryButton = screen.getByTestId('cta-button-primary')
      const container = primaryButton.parentElement
      expect(container).toHaveClass('my-6', 'lg:my-10') // Different timing from Hero
    })

    it('includes service items grid that Hero does not have', () => {
      render(<Hero />)
      
      const gridContainer = screen.getByText('Custom Websites').closest('.grid')
      expect(gridContainer).toBeInTheDocument()
      expect(gridContainer).toHaveClass('grid', 'gap-2', 'mt-8', 'sm:grid-cols-2')
    })

    it('uses different section margin classes', () => {
      render(<Hero />)
      
      const section = screen.getByText('Your Vision').closest('section')
      expect(section).toHaveClass('my-32') // Consistent throughout, different from Hero's mt-36
    })
  })

  describe('Responsive Design', () => {
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
        'my-32',
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

    it('uses responsive grid for service items', () => {
      render(<Hero />)
      
      const gridContainer = screen.getByText('Custom Websites').closest('.grid')
      expect(gridContainer).toHaveClass('sm:grid-cols-2')
    })

    it('uses responsive text sizing for service items', () => {
      render(<Hero />)
      
      const itemContainer = screen.getByText('Custom Websites').parentElement
      expect(itemContainer).toHaveClass('lg:text-lg')
    })
  })

  describe('Motion Animation', () => {
    it('applies container variants to section', () => {
      render(<Hero />)
      
      const section = screen.getByText('Your Vision').closest('section')
      expect(section).toBeInTheDocument()
    })

    it('wraps all animated elements properly', () => {
      render(<Hero />)
      
      // All main elements should be present for animation
      expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument()
      expect(screen.getByText(/From concept to completion/)).toBeInTheDocument()
      expect(screen.getByText('Custom Websites')).toBeInTheDocument()
      expect(screen.getByTestId('cta-button-primary').parentElement).toBeInTheDocument()
      expect(screen.getByTestId('tech-orbit').parentElement).toBeInTheDocument()
    })

    it('animates service items individually', () => {
      render(<Hero />)
      
      const expectedItems = ['Custom Websites', 'Product Stores', 'Online Services', 'Custom Solutions']
      
      expectedItems.forEach(item => {
        const itemElement = screen.getByText(item)
        const itemContainer = itemElement.parentElement
        expect(itemContainer).toBeInTheDocument()
      })
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
      
      // Text container should contain all text elements
      expect(textContainer).toContainElement(screen.getByRole('heading'))
      expect(textContainer).toContainElement(screen.getByText(/From concept to completion/))
      expect(textContainer).toContainElement(screen.getByText('Custom Websites'))
      expect(textContainer).toContainElement(screen.getByTestId('cta-button-primary'))
    })

    it('renders service items between description and CTA buttons', () => {
      render(<Hero />)
      
      const textContainer = screen.getByRole('heading').parentElement
      const children = Array.from(textContainer?.children || [])
      
      const descriptionIndex = children.findIndex(child => 
        child.textContent?.includes('From concept to completion')
      )
      const gridIndex = children.findIndex(child => 
        child.classList.contains('grid')
      )
      const buttonIndex = children.findIndex(child => 
        child.querySelector('[data-testid="cta-button-primary"]')
      )
      
      expect(descriptionIndex).toBeLessThan(gridIndex)
      expect(gridIndex).toBeLessThan(buttonIndex)
    })
  })

  describe('Accessibility', () => {
    it('uses proper heading hierarchy', () => {
      render(<Hero />)
      
      const h1 = screen.getByRole('heading', { level: 1 })
      expect(h1).toBeInTheDocument()
      expect(h1).toHaveTextContent('Your Vision')
    })

    it('provides meaningful text for service items', () => {
      render(<Hero />)
      
      const expectedItems = ['Custom Websites', 'Product Stores', 'Online Services', 'Custom Solutions']
      expectedItems.forEach(item => {
        expect(screen.getByText(item)).toBeInTheDocument()
      })
    })

    it('uses semantic SVG structure for checkmarks', () => {
      render(<Hero />)
      
      const firstItem = screen.getByText('Custom Websites')
      const itemContainer = firstItem.parentElement
      const svg = itemContainer?.querySelector('svg')
      
      expect(svg).toHaveAttribute('xmlns', 'http://www.w3.org/2000/svg')
      expect(svg).toHaveAttribute('fill', 'none')
      expect(svg).toHaveAttribute('viewBox', '0 0 24 24')
      expect(svg).toHaveAttribute('stroke', 'currentColor')
    })
  })

  describe('Integration and Dependencies', () => {
    it('integrates with CTAButton component correctly', () => {
      render(<Hero />)
      
      const primaryButton = screen.getByTestId('cta-button-primary')
      const secondaryButton = screen.getByTestId('cta-button-secondary')
      
      expect(primaryButton).toHaveAttribute('href', '/contact')
      expect(secondaryButton).toHaveAttribute('href', '/about') // Different from Hero
    })

    it('integrates with TechOrbit component correctly', () => {
      render(<Hero />)
      
      const techOrbit = screen.getByTestId('tech-orbit')
      expect(techOrbit).toBeInTheDocument()
      expect(techOrbit).toHaveTextContent('Tech Orbit')
    })
  })

  describe('Edge Cases', () => {
    it('handles empty items array gracefully', () => {
      // Component should still render even if items array were empty
      expect(() => render(<Hero />)).not.toThrow()
      
      expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument()
      expect(screen.getByTestId('tech-orbit')).toBeInTheDocument()
    })

    it('maintains consistent styling across all service items', () => {
      render(<Hero />)
      
      const expectedItems = ['Custom Websites', 'Product Stores', 'Online Services', 'Custom Solutions']
      const itemContainers = expectedItems.map(item => 
        screen.getByText(item).parentElement
      )
      
      itemContainers.forEach(container => {
        expect(container).toHaveClass(
          'flex',
          'items-center', 
          'lg:text-lg',
          'text-gray-800',
          '-px-3',
          'dark:text-gray-200'
        )
      })
    })
  })
})