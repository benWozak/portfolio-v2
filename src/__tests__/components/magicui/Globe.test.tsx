import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render } from '@testing-library/react'
import { Globe } from '@/components/magicui/globe'
import createGlobe from 'cobe'

// Mock the cobe library
vi.mock('cobe', () => {
  const mockDestroy = vi.fn()
  const mockCreateGlobe = vi.fn(() => ({
    destroy: mockDestroy
  }))
  
  return {
    default: mockCreateGlobe
  }
})

const mockCreateGlobe = vi.mocked(createGlobe)

// Mock motion/react hooks
vi.mock('motion/react', () => ({
  useMotionValue: vi.fn((initialValue) => ({
    get: vi.fn(() => initialValue),
    set: vi.fn()
  })),
  useSpring: vi.fn((value) => ({
    get: vi.fn(() => 0)
  }))
}))

describe('Globe Component', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('Rendering', () => {
    it('renders container with correct default classes', () => {
      render(<Globe />)
      
      const container = document.querySelector('canvas')?.parentElement
      expect(container).toBeInTheDocument()
      expect(container).toHaveClass(
        'absolute',
        'inset-0',
        'mx-auto',
        'aspect-[1/1]',
        'w-full',
        'max-w-[600px]'
      )
    })

    it('renders canvas element with proper attributes', () => {
      render(<Globe />)
      
      const canvas = document.querySelector('canvas')
      expect(canvas).toBeInTheDocument()
      expect(canvas!.tagName).toBe('CANVAS')
      expect(canvas).toHaveClass(
        'size-full',
        'opacity-0',
        'transition-opacity',
        'duration-500',
        '[contain:layout_paint_size]'
      )
    })

    it('applies custom className when provided', () => {
      render(<Globe className="custom-globe-class" />)
      
      const container = document.querySelector('canvas')?.parentElement
      expect(container).toHaveClass('custom-globe-class')
    })
  })

  describe('Globe Initialization', () => {
    it('creates globe with expected configuration structure', () => {
      render(<Globe />)
      
      expect(mockCreateGlobe).toHaveBeenCalledWith(
        expect.any(Object), // canvas ref
        expect.objectContaining({
          devicePixelRatio: 2,
          phi: 0,
          theta: 0.3,
          dark: 0,
          diffuse: 0.4,
          mapSamples: 16000,
          mapBrightness: 1.2,
          baseColor: [1, 1, 1],
          markerColor: [251 / 255, 100 / 255, 21 / 255],
          glowColor: [1, 1, 1],
          onRender: expect.any(Function)
        })
      )
    })

    it('uses custom config when provided', () => {
      const customConfig = {
        phi: 0.5,
        markers: [{ location: [0, 0], size: 0.2 }]
      }
      
      render(<Globe config={customConfig} />)
      
      expect(mockCreateGlobe).toHaveBeenCalledWith(
        expect.any(Object),
        expect.objectContaining({
          phi: 0.5,
          markers: [{ location: [0, 0], size: 0.2 }]
        })
      )
    })
  })

  describe('Cleanup', () => {
    it('calls createGlobe on mount', () => {
      render(<Globe />)
      
      expect(mockCreateGlobe).toHaveBeenCalledTimes(1)
    })
  })

  describe('Accessibility and Structure', () => {
    it('has proper canvas structure', () => {
      render(<Globe />)
      
      const canvas = document.querySelector('canvas')
      const container = canvas?.parentElement
      
      expect(canvas).toBeInTheDocument()
      expect(container).toBeInTheDocument()
      expect(container?.children).toHaveLength(1)
    })
  })

  describe('Configuration Override', () => {
    it('accepts custom configuration properties', () => {
      const customConfig = {
        phi: 1.5,
        theta: 0.8
      }
      
      render(<Globe config={customConfig as any} />)
      
      expect(mockCreateGlobe).toHaveBeenCalledWith(
        expect.any(Object),
        expect.objectContaining({
          phi: 1.5,
          theta: 0.8
        })
      )
    })
  })
})