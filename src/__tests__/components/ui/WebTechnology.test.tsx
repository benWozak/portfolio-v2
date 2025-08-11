import { describe, it, expect } from 'vitest'
import { render, screen } from '@/test-utils'
import { WebTechnology } from '@/components/ui/WebTechnology'

const mockIcon = <span data-testid="mock-icon">⚛️</span>

describe('WebTechnology Component', () => {
  describe('Rendering', () => {
    it('renders the container element', () => {
      const { container } = render(<WebTechnology name="React" icon={mockIcon} />)
      
      const techContainer = container.querySelector('div')
      expect(techContainer).toBeInTheDocument()
    })

    it('renders the technology name', () => {
      render(<WebTechnology name="React" icon={mockIcon} />)
      
      const name = screen.getByText('React')
      expect(name).toBeInTheDocument()
    })

    it('renders the technology icon', () => {
      render(<WebTechnology name="React" icon={mockIcon} />)
      
      const icon = screen.getByTestId('mock-icon')
      expect(icon).toBeInTheDocument()
    })

    it('renders name as span element', () => {
      render(<WebTechnology name="TypeScript" icon={mockIcon} />)
      
      const name = screen.getByText('TypeScript')
      expect(name.tagName).toBe('SPAN')
    })
  })

  describe('Container Styling', () => {
    it('applies layout and positioning classes', () => {
      const { container } = render(<WebTechnology name="Vue.js" icon={mockIcon} />)
      
      const techContainer = container.querySelector('div')
      expect(techContainer).toHaveClass(
        'flex',
        'items-center',
        'space-x-2',
        'p-2',
        'rounded-md'
      )
    })

    it('applies background color class', () => {
      const { container } = render(<WebTechnology name="Angular" icon={mockIcon} />)
      
      const techContainer = container.querySelector('div')
      expect(techContainer).toHaveClass('bg-secondary-bg')
    })

    it('applies base text color classes', () => {
      const { container } = render(<WebTechnology name="Svelte" icon={mockIcon} />)
      
      const techContainer = container.querySelector('div')
      expect(techContainer).toHaveClass(
        'text-secondary-700',
        'dark:text-secondary-500'
      )
    })
  })

  describe('Hover Effects', () => {
    it('applies hover cursor styling', () => {
      const { container } = render(<WebTechnology name="Next.js" icon={mockIcon} />)
      
      const techContainer = container.querySelector('div')
      expect(techContainer).toHaveClass('hover:cursor-default')
    })

    it('applies hover text color changes', () => {
      const { container } = render(<WebTechnology name="Gatsby" icon={mockIcon} />)
      
      const techContainer = container.querySelector('div')
      expect(techContainer).toHaveClass(
        'hover:text-secondary-900',
        'hover:dark:text-secondary-300'
      )
    })

    it('applies shadow hover effects', () => {
      const { container } = render(<WebTechnology name="Nuxt.js" icon={mockIcon} />)
      
      const techContainer = container.querySelector('div')
      expect(techContainer).toHaveClass(
        'shadow-sm',
        'hover:shadow-md',
        'hover:shadow-slate-300',
        'hover:dark:shadow-slate-500'
      )
    })

    it('applies transition classes for smooth animations', () => {
      const { container } = render(<WebTechnology name="Express" icon={mockIcon} />)
      
      const techContainer = container.querySelector('div')
      expect(techContainer).toHaveClass(
        'transition-all',
        'duration-300'
      )
    })
  })

  describe('Icon Styling', () => {
    it('applies correct dimensions to icon container', () => {
      const { container } = render(<WebTechnology name="Node.js" icon={mockIcon} />)
      
      const iconContainer = container.querySelector('.w-6')
      
      expect(iconContainer).toBeInTheDocument()
      expect(iconContainer).toHaveClass('w-6', 'h-6', 'lg:w-10', 'lg:h-10')
    })

    it('applies responsive sizing classes to icon', () => {
      const { container } = render(<WebTechnology name="Python" icon={mockIcon} />)
      
      const iconContainer = container.querySelector('.w-6')
      
      expect(iconContainer).toHaveClass('lg:w-10', 'lg:h-10')
    })

    it('renders icon inside proper container', () => {
      const { container } = render(<WebTechnology name="Java" icon={mockIcon} />)
      
      const iconContainer = container.querySelector('.w-6')
      const icon = screen.getByTestId('mock-icon')
      
      expect(iconContainer).toContainElement(icon)
    })
  })

  describe('Text Styling', () => {
    it('applies responsive text sizing classes', () => {
      render(<WebTechnology name="C#" icon={mockIcon} />)
      
      const name = screen.getByText('C#')
      expect(name).toHaveClass(
        'text-sm',
        'lg:text-base',
        'font-medium'
      )
    })

    it('applies font weight class', () => {
      render(<WebTechnology name="Ruby" icon={mockIcon} />)
      
      const name = screen.getByText('Ruby')
      expect(name).toHaveClass('font-medium')
    })
  })

  describe('Different Technology Names', () => {
    it('handles short technology names', () => {
      render(<WebTechnology name="Go" icon={mockIcon} />)
      
      expect(screen.getByText('Go')).toBeInTheDocument()
    })

    it('handles long technology names', () => {
      const longName = "React with TypeScript and Redux Toolkit"
      render(<WebTechnology name={longName} icon={mockIcon} />)
      
      expect(screen.getByText(longName)).toBeInTheDocument()
    })

    it('handles technology names with special characters', () => {
      render(<WebTechnology name="Vue.js 3.0" icon={mockIcon} />)
      
      expect(screen.getByText('Vue.js 3.0')).toBeInTheDocument()
    })

    it('handles technology names with numbers', () => {
      render(<WebTechnology name="Angular 15" icon={mockIcon} />)
      
      expect(screen.getByText('Angular 15')).toBeInTheDocument()
    })
  })

  describe('Different Icon Types', () => {
    it('handles React component icons', () => {
      const ReactIcon = () => <div data-testid="react-component">React</div>
      render(<WebTechnology name="React" icon={<ReactIcon />} />)
      
      expect(screen.getByTestId('react-component')).toBeInTheDocument()
    })

    it('handles string icons', () => {
      const { container } = render(<WebTechnology name="JavaScript" icon="🟨" />)
      
      const techContainer = container.querySelector('div')
      expect(techContainer).toHaveTextContent('🟨')
    })

    it('handles complex icon elements', () => {
      const complexIcon = (
        <div>
          <svg data-testid="complex-icon">
            <circle cx="50" cy="50" r="40" />
          </svg>
        </div>
      )
      render(<WebTechnology name="GraphQL" icon={complexIcon} />)
      
      expect(screen.getByTestId('complex-icon')).toBeInTheDocument()
    })
  })

  describe('Component Structure', () => {
    it('maintains proper element hierarchy', () => {
      const { container } = render(<WebTechnology name="MongoDB" icon={mockIcon} />)
      
      const techContainer = container.querySelector('div')
      const iconContainer = container.querySelector('.w-6')
      const nameElement = screen.getByText('MongoDB')
      
      expect(techContainer).toContainElement(iconContainer)
      expect(techContainer).toContainElement(nameElement)
    })

    it('renders icon before name in layout', () => {
      const { container } = render(<WebTechnology name="PostgreSQL" icon={mockIcon} />)
      
      const techContainer = container.querySelector('div')
      const children = Array.from(techContainer?.children || [])
      
      expect(children[0]).toHaveClass('w-6')
      expect(children[1]).toHaveTextContent('PostgreSQL')
    })
  })

  describe('Accessibility', () => {
    it('provides meaningful content for screen readers', () => {
      render(<WebTechnology name="Docker" icon={mockIcon} />)
      
      const name = screen.getByText('Docker')
      const icon = screen.getByTestId('mock-icon')
      
      expect(name).toBeInTheDocument()
      expect(icon).toBeInTheDocument()
    })

    it('uses semantic HTML structure', () => {
      const { container } = render(<WebTechnology name="Kubernetes" icon={mockIcon} />)
      
      const techContainer = container.querySelector('div')
      const name = screen.getByText('Kubernetes')
      
      expect(techContainer?.tagName).toBe('DIV')
      expect(name.tagName).toBe('SPAN')
    })

    it('maintains readability with proper color classes', () => {
      const { container } = render(<WebTechnology name="Redis" icon={mockIcon} />)
      
      const techContainer = container.querySelector('div')
      expect(techContainer).toHaveClass('text-secondary-700', 'dark:text-secondary-500')
    })
  })

  describe('Responsive Design', () => {
    it('applies responsive classes for different screen sizes', () => {
      const { container } = render(<WebTechnology name="Tailwind CSS" icon={mockIcon} />)
      
      const iconContainer = container.querySelector('.w-6')
      const name = screen.getByText('Tailwind CSS')
      
      expect(iconContainer).toHaveClass('lg:w-10', 'lg:h-10')
      expect(name).toHaveClass('lg:text-base')
    })

    it('maintains consistent spacing across screen sizes', () => {
      const { container } = render(<WebTechnology name="Sass" icon={mockIcon} />)
      
      const techContainer = container.querySelector('div')
      expect(techContainer).toHaveClass('space-x-2')
    })
  })

  describe('Visual Effects', () => {
    it('applies all visual effect classes together', () => {
      const { container } = render(<WebTechnology name="Webpack" icon={mockIcon} />)
      
      const techContainer = container.querySelector('div')
      expect(techContainer).toHaveClass(
        'shadow-sm',
        'hover:shadow-md',
        'hover:shadow-slate-300',
        'hover:dark:shadow-slate-500',
        'transition-all',
        'duration-300'
      )
    })

    it('maintains visual consistency across rerenders', () => {
      const { rerender, container } = render(<WebTechnology name="Vite" icon={mockIcon} />)
      
      let techContainer = container.querySelector('div')
      expect(techContainer).toHaveClass('transition-all', 'duration-300')
      
      rerender(<WebTechnology name="Vite Build Tool" icon={mockIcon} />)
      
      techContainer = container.querySelector('div')
      expect(techContainer).toHaveClass('transition-all', 'duration-300')
    })
  })

  describe('Edge Cases', () => {
    it('handles empty name gracefully', () => {
      const { container } = render(<WebTechnology name="" icon={mockIcon} />)
      
      const techContainer = container.querySelector('div')
      const icon = screen.getByTestId('mock-icon')
      
      expect(techContainer).toBeInTheDocument()
      expect(icon).toBeInTheDocument()
    })

    it('handles null icon gracefully', () => {
      const { container } = render(<WebTechnology name="Unknown Tech" icon={null} />)
      
      const techContainer = container.querySelector('div')
      const name = screen.getByText('Unknown Tech')
      
      expect(techContainer).toBeInTheDocument()
      expect(name).toBeInTheDocument()
    })

    it('handles undefined icon gracefully', () => {
      const { container } = render(<WebTechnology name="Mystery Tech" icon={undefined as any} />)
      
      const techContainer = container.querySelector('div')
      const name = screen.getByText('Mystery Tech')
      
      expect(techContainer).toBeInTheDocument()
      expect(name).toBeInTheDocument()
    })
  })
})