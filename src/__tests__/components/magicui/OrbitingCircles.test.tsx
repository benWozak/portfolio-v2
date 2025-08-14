import { describe, it, expect } from 'vitest'
import { render, screen } from '@/test-utils'
import { OrbitingCircles } from '@/components/magicui/orbiting-circles'
import React from 'react'

describe('OrbitingCircles Component', () => {
  const TestIcon = () => <span data-testid="test-icon">🚀</span>
  const TestIcon2 = () => <span data-testid="test-icon-2">⭐</span>

  describe('Rendering', () => {
    it('renders container with correct structure', () => {
      render(
        <OrbitingCircles>
          <TestIcon />
        </OrbitingCircles>
      )
      
      const container = screen.getByTestId('test-icon').closest('div')?.parentElement
      expect(container).toHaveClass('absolute', 'inset-0', 'flex', 'items-center', 'justify-center')
    })

    it('renders SVG path by default', () => {
      render(
        <OrbitingCircles>
          <TestIcon />
        </OrbitingCircles>
      )
      
      const svg = document.querySelector('svg')
      expect(svg!.tagName).toBe('svg')
      expect(svg).toHaveClass('pointer-events-none', 'absolute', 'inset-0', 'size-full')
    })

    it('renders circle path with correct radius', () => {
      const customRadius = 200
      render(
        <OrbitingCircles radius={customRadius}>
          <TestIcon />
        </OrbitingCircles>
      )
      
      const circle = document.querySelector('svg circle')
      expect(circle).toHaveAttribute('r', customRadius.toString())
      expect(circle).toHaveAttribute('cx', '50%')
      expect(circle).toHaveAttribute('cy', '50%')
      expect(circle).toHaveAttribute('fill', 'none')
    })

    it('hides SVG path when path prop is false', () => {
      render(
        <OrbitingCircles path={false}>
          <TestIcon />
        </OrbitingCircles>
      )
      
      const svg = document.querySelector('svg')
      expect(svg).not.toBeInTheDocument()
    })

    it('renders children with correct classes', () => {
      render(
        <OrbitingCircles>
          <TestIcon />
        </OrbitingCircles>
      )
      
      const childContainer = screen.getByTestId('test-icon').parentElement
      expect(childContainer).toHaveClass(
        'absolute',
        'flex',
        'size-[var(--icon-size)]',
        'items-center',
        'justify-center',
        'animate-orbit'
      )
    })
  })

  describe('Props Configuration', () => {
    it('applies custom className to child containers', () => {
      render(
        <OrbitingCircles className="custom-class">
          <TestIcon />
        </OrbitingCircles>
      )
      
      const childContainer = screen.getByTestId('test-icon').parentElement
      expect(childContainer).toHaveClass('custom-class')
    })

    it('sets correct duration CSS variable', () => {
      const customDuration = 30
      render(
        <OrbitingCircles duration={customDuration}>
          <TestIcon />
        </OrbitingCircles>
      )
      
      const childContainer = screen.getByTestId('test-icon').parentElement
      expect(childContainer).toHaveStyle('--duration: 30')
    })

    it('sets correct radius CSS variable', () => {
      const customRadius = 180
      render(
        <OrbitingCircles radius={customRadius}>
          <TestIcon />
        </OrbitingCircles>
      )
      
      const childContainer = screen.getByTestId('test-icon').parentElement
      expect(childContainer).toHaveStyle('--radius: 180')
    })

    it('sets correct iconSize CSS variable', () => {
      const customIconSize = 40
      render(
        <OrbitingCircles iconSize={customIconSize}>
          <TestIcon />
        </OrbitingCircles>
      )
      
      const childContainer = screen.getByTestId('test-icon').parentElement
      expect(childContainer).toHaveStyle('--icon-size: 40px')
    })

    it('applies reverse animation class when reverse is true', () => {
      render(
        <OrbitingCircles reverse>
          <TestIcon />
        </OrbitingCircles>
      )
      
      const childContainer = screen.getByTestId('test-icon').parentElement
      expect(childContainer).toHaveClass('[animation-direction:reverse]')
    })

    it('does not apply reverse class when reverse is false or undefined', () => {
      render(
        <OrbitingCircles reverse={false}>
          <TestIcon />
        </OrbitingCircles>
      )
      
      const childContainer = screen.getByTestId('test-icon').parentElement
      expect(childContainer).not.toHaveClass('[animation-direction:reverse]')
    })
  })

  describe('Multiple Children Handling', () => {
    it('renders multiple children with correct angle distribution', () => {
      render(
        <OrbitingCircles>
          <TestIcon />
          <TestIcon2 />
        </OrbitingCircles>
      )
      
      const child1 = screen.getByTestId('test-icon').parentElement
      const child2 = screen.getByTestId('test-icon-2').parentElement
      
      // First child should have angle 0
      expect(child1).toHaveStyle('--angle: 0')
      // Second child should have angle 180 (360/2 * 1)
      expect(child2).toHaveStyle('--angle: 180')
    })

    it('distributes three children correctly', () => {
      const TestIcon3 = () => <span data-testid="test-icon-3">💫</span>
      
      render(
        <OrbitingCircles>
          <TestIcon />
          <TestIcon2 />
          <TestIcon3 />
        </OrbitingCircles>
      )
      
      const child1 = screen.getByTestId('test-icon').parentElement
      const child2 = screen.getByTestId('test-icon-2').parentElement
      const child3 = screen.getByTestId('test-icon-3').parentElement
      
      expect(child1).toHaveStyle('--angle: 0')
      expect(child2).toHaveStyle('--angle: 120')
      expect(child3).toHaveStyle('--angle: 240')
    })

    it('handles single child correctly', () => {
      render(
        <OrbitingCircles>
          <TestIcon />
        </OrbitingCircles>
      )
      
      const child = screen.getByTestId('test-icon').parentElement
      expect(child).toHaveStyle('--angle: 0')
    })
  })

  describe('Default Props', () => {
    it('uses default duration of 20', () => {
      render(
        <OrbitingCircles>
          <TestIcon />
        </OrbitingCircles>
      )
      
      const childContainer = screen.getByTestId('test-icon').parentElement
      expect(childContainer).toHaveStyle('--duration: 20')
    })

    it('uses default radius of 160', () => {
      render(
        <OrbitingCircles>
          <TestIcon />
        </OrbitingCircles>
      )
      
      const childContainer = screen.getByTestId('test-icon').parentElement
      expect(childContainer).toHaveStyle('--radius: 160')
      
      const circle = document.querySelector('svg circle')
      expect(circle).toHaveAttribute('r', '160')
    })

    it('uses default iconSize of 30', () => {
      render(
        <OrbitingCircles>
          <TestIcon />
        </OrbitingCircles>
      )
      
      const childContainer = screen.getByTestId('test-icon').parentElement
      expect(childContainer).toHaveStyle('--icon-size: 30px')
    })

    it('shows path by default', () => {
      render(
        <OrbitingCircles>
          <TestIcon />
        </OrbitingCircles>
      )
      
      const svg = document.querySelector('svg')
      expect(svg).toBeInTheDocument()
    })
  })

  describe('CSS Variables and Animation', () => {
    it('sets all required CSS variables correctly', () => {
      render(
        <OrbitingCircles duration={25} radius={150} iconSize={35}>
          <TestIcon />
          <TestIcon2 />
        </OrbitingCircles>
      )
      
      const child1 = screen.getByTestId('test-icon').parentElement
      const child2 = screen.getByTestId('test-icon-2').parentElement
      
      expect(child1).toHaveStyle({
        '--duration': '25',
        '--radius': '150',
        '--angle': '0',
        '--icon-size': '35px'
      })
      
      expect(child2).toHaveStyle({
        '--duration': '25',
        '--radius': '150',
        '--angle': '180',
        '--icon-size': '35px'
      })
    })

    it('applies animate-orbit class to all children', () => {
      render(
        <OrbitingCircles>
          <TestIcon />
          <TestIcon2 />
        </OrbitingCircles>
      )
      
      const child1 = screen.getByTestId('test-icon').parentElement
      const child2 = screen.getByTestId('test-icon-2').parentElement
      
      expect(child1).toHaveClass('animate-orbit')
      expect(child2).toHaveClass('animate-orbit')
    })
  })

  describe('Path SVG Styling', () => {
    it('applies correct stroke classes to circle path', () => {
      render(
        <OrbitingCircles>
          <TestIcon />
        </OrbitingCircles>
      )
      
      const circle = document.querySelector('svg circle')
      expect(circle).toHaveClass('stroke-black/10', 'stroke-1', 'dark:stroke-white/10')
    })

    it('creates proper SVG structure', () => {
      render(
        <OrbitingCircles>
          <TestIcon />
        </OrbitingCircles>
      )
      
      const svg = document.querySelector('svg')
      expect(svg!).toHaveAttribute('xmlns', 'http://www.w3.org/2000/svg')
      expect(svg!).toHaveAttribute('version', '1.1')
    })
  })

  describe('Custom Props Forwarding', () => {
    it('forwards custom HTML attributes to child containers', () => {
      render(
        <OrbitingCircles data-testid="orbiting-container" title="Custom Title">
          <TestIcon />
        </OrbitingCircles>
      )
      
      const childContainer = screen.getByTestId('test-icon').parentElement
      expect(childContainer).toHaveAttribute('data-testid', 'orbiting-container')
      expect(childContainer).toHaveAttribute('title', 'Custom Title')
    })
  })

  describe('Edge Cases', () => {
    it('handles empty children gracefully', () => {
      render(<OrbitingCircles />)
      
      const container = document.querySelector('.absolute.inset-0.flex.items-center.justify-center')
      expect(container).toBeInTheDocument()
    })

    it('handles null/undefined children', () => {
      render(
        <OrbitingCircles>
          {null}
          {undefined}
          <TestIcon />
        </OrbitingCircles>
      )
      
      const testIcon = screen.getByTestId('test-icon')
      expect(testIcon).toBeInTheDocument()
    })

    it('maintains proper structure with zero radius', () => {
      render(
        <OrbitingCircles radius={0}>
          <TestIcon />
        </OrbitingCircles>
      )
      
      const circle = document.querySelector('svg circle')
      expect(circle).toHaveAttribute('r', '0')
      
      const childContainer = screen.getByTestId('test-icon').parentElement
      expect(childContainer).toHaveStyle('--radius: 0')
    })
  })

  describe('TypeScript Props Interface', () => {
    it('accepts all expected props without type errors', () => {
      // This test ensures the component accepts the defined interface
      const props = {
        className: 'test-class',
        children: <TestIcon />,
        reverse: true,
        duration: 25,
        delay: 5,
        radius: 150,
        path: true,
        iconSize: 40,
        speed: 2,
        'data-testid': 'typescript-test'
      }
      
      render(<OrbitingCircles {...props} />)
      
      const childContainer = screen.getByTestId('test-icon').parentElement
      expect(childContainer).toHaveAttribute('data-testid', 'typescript-test')
      expect(childContainer).toHaveClass('test-class')
    })
  })
})