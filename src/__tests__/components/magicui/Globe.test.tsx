import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render } from '@testing-library/react'
import { Globe } from '@/components/magicui/globe'
import createGlobe, { type COBEOptions } from 'cobe'

// Mock the cobe library. Like cobe 2, createGlobe moves the canvas into a
// wrapper div that destroy() leaves in place.
vi.mock('cobe', () => {
  const mockCreateGlobe = vi.fn((canvas: HTMLCanvasElement) => {
    const wrapper = document.createElement('div')
    canvas.parentElement?.insertBefore(wrapper, canvas)
    wrapper.append(canvas)
    return { update: vi.fn(), destroy: vi.fn() }
  })
  return { default: mockCreateGlobe }
})

const mockCreateGlobe = vi.mocked(createGlobe)

// Mock motion/react hooks
vi.mock('motion/react', () => ({
  useMotionValue: vi.fn((initialValue) => ({
    get: vi.fn(() => initialValue),
    set: vi.fn()
  })),
  useSpring: vi.fn(() => ({
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
      const { container } = render(<Globe />)

      const host = container.firstElementChild
      expect(host).toContainElement(document.querySelector('canvas'))
      expect(host).toHaveClass(
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
      const { container } = render(<Globe className="custom-globe-class" />)

      const host = container.firstElementChild
      expect(host).toContainElement(document.querySelector('canvas'))
      expect(host).toHaveClass('custom-globe-class')
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
        })
      )
      // v2 has no onRender: the component drives frames through globe.update()
      expect(mockCreateGlobe.mock.calls[0][1]).not.toHaveProperty('onRender')
    })

    it('sizes the globe in CSS pixels (cobe 2 applies devicePixelRatio itself)', () => {
      vi.spyOn(HTMLElement.prototype, 'offsetWidth', 'get').mockReturnValue(300)

      render(<Globe />)

      expect(mockCreateGlobe.mock.calls[0][1]).toEqual(
        expect.objectContaining({ width: 300, height: 300, devicePixelRatio: 2 }),
      )
    })

    it('uses custom config when provided', () => {
      const customConfig = {
        phi: 0.5,
        markers: [{ location: [0, 0], size: 0.2 }]
      }
      
      render(<Globe config={customConfig as unknown as COBEOptions} />)
      
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

    it('fades the canvas in, and cancels the fade-in when unmounted first', () => {
      vi.useFakeTimers()
      try {
        const { unmount } = render(<Globe />)
        vi.runOnlyPendingTimers()
        expect(document.querySelector('canvas')!.style.opacity).toBe('1')

        const { destroy } = mockCreateGlobe.mock.results[0].value
        unmount()
        expect(vi.getTimerCount()).toBe(0)
        expect(() => vi.runAllTimers()).not.toThrow()
        expect(destroy).toHaveBeenCalledTimes(1)

        // Unmount clears the fade-in timeout and stops the frame loop, also when
        // neither has fired yet.
        render(<Globe />).unmount()
        expect(vi.getTimerCount()).toBe(0)
        expect(() => vi.runAllTimers()).not.toThrow()
      } finally {
        vi.useRealTimers()
      }
    })

    it('drives frames with requestAnimationFrame and stops on unmount', () => {
      const ow = vi.spyOn(HTMLElement.prototype, 'offsetWidth', 'get').mockReturnValue(300)
      const frames: FrameRequestCallback[] = []
      vi.spyOn(window, 'requestAnimationFrame').mockImplementation((cb) => frames.push(cb)) // ids 1, 2, 3…
      const caf = vi.spyOn(window, 'cancelAnimationFrame').mockImplementation(() => {})

      const { unmount } = render(<Globe />)
      const globe = mockCreateGlobe.mock.results[0].value
      const update = vi.mocked(globe.update)
      expect(update).not.toHaveBeenCalled()

      frames[0](0)
      expect(update.mock.calls[0][0].phi).toBeCloseTo(0.001)
      expect(update.mock.calls[0][0]).not.toHaveProperty('width') // size unchanged since creation

      ow.mockReturnValue(400)
      window.dispatchEvent(new Event('resize'))
      frames[1](16)
      expect(update.mock.calls[1][0].phi).toBeCloseTo(0.002)
      expect(update.mock.calls[1][0]).toMatchObject({ width: 400, height: 400 })

      frames[2](32)
      expect(update.mock.calls[2][0]).not.toHaveProperty('width') // sent once, not every frame
      expect(update).toHaveBeenCalledTimes(3)

      unmount()
      expect(caf).toHaveBeenCalledWith(4) // the frame armed by the last tick, not the first one
      expect(globe.destroy).toHaveBeenCalledTimes(1)
    })

    it("unwraps the canvas from cobe's wrapper div on unmount", () => {
      const { container, unmount } = render(<Globe />)
      const host = container.firstElementChild
      const canvas = document.querySelector('canvas')!
      const wrapper = canvas.parentElement!
      expect(wrapper).not.toBe(host)
      expect(wrapper.parentElement).toBe(host)

      unmount()
      // React detaches host; the canvas must sit directly under it again so a
      // re-run of the effect (Strict Mode) does not nest a second wrapper.
      expect(canvas.parentElement).toBe(host)
      expect(host!.children).toHaveLength(1)
      expect(wrapper.contains(canvas)).toBe(false)
    })
  })

  describe('Accessibility and Structure', () => {
    it('has proper canvas structure', () => {
      const { container } = render(<Globe />)

      const host = container.firstElementChild
      const canvas = document.querySelector('canvas')

      expect(canvas).toBeInTheDocument()
      expect(host).toBeInTheDocument()
      // One child: cobe's wrapper div, which holds the canvas
      expect(host?.children).toHaveLength(1)
      expect(canvas?.parentElement?.parentElement).toBe(host)
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