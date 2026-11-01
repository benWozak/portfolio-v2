import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, fireEvent } from '@testing-library/react'
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
          // cobe 2 raises markers into domes by default; keep them flat and
          // tiny, they only remain as the no-anchor-support fallback.
          markerElevation: 0,
          markers: [
            expect.objectContaining({ id: 'yvr', size: 0.02, location: [49.2827, -123.1207] }),
            expect.objectContaining({ id: 'yyc', size: 0.02, location: [51.0447, -114.0719] }),
            expect.objectContaining({ id: 'den', size: 0.02, location: [39.7392, -104.9903] }),
            expect.objectContaining({ id: 'san', size: 0.02, location: [32.715736, -117.161087] }),
          ],
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
      // canvas, then the pin list
      expect(host!.children).toHaveLength(2)
      expect(host!.children[0]).toBe(canvas)
      expect(wrapper.contains(canvas)).toBe(false)
    })
  })

  describe('Pins', () => {
    it('renders one pin per city, in order, with its label', () => {
      const { container } = render(<Globe />)

      const pins = container.querySelectorAll('li.globe-pin')
      expect(pins).toHaveLength(4)
      expect([...pins].map((p) => p.querySelector('.globe-pin-label')!.textContent)).toEqual([
        'Vancouver, BC',
        'Calgary, AB',
        'Denver, CO',
        'San Diego, CA',
      ])
      expect(container.querySelector('ul.globe-pins')).toHaveAttribute('aria-label', 'Places I have worked')
    })

    it("binds each pin to cobe's anchor and visibility variable for its id", () => {
      const { container } = render(<Globe />)
      const pins = [...container.querySelectorAll('li.globe-pin')] as HTMLElement[]
      expect(pins.map((p) => [p.style.getPropertyValue('--pin-anchor'), p.style.getPropertyValue('--pin-visible'), p.textContent])).toEqual([
        ['--cobe-yvr', 'var(--cobe-visible-yvr, 0)', 'Vancouver, BC'],
        ['--cobe-yyc', 'var(--cobe-visible-yyc, 0)', 'Calgary, AB'],
        ['--cobe-den', 'var(--cobe-visible-den, 0)', 'Denver, CO'],
        ['--cobe-san', 'var(--cobe-visible-san, 0)', 'San Diego, CA'],
      ])
    })

    it("places the list after cobe's wrapper, unpositioned, so the anchors share the pins' containing block", () => {
      const { container } = render(<Globe />)

      const host = container.firstElementChild!
      const list = container.querySelector('ul.globe-pins')!
      const wrapper = document.querySelector('canvas')!.parentElement
      expect(list.parentElement).toBe(host)
      expect(list.previousElementSibling).toBe(wrapper)
      // exact class list: a positioning utility here would make the ul the pins' containing block and break anchor resolution
      expect(list.className).toBe('globe-pins')
    })

    it('contains the pin icon, the leader line and the label in each pin', () => {
      const { container } = render(<Globe />)

      const pin = container.querySelector('li.globe-pin')!
      expect(pin.querySelector('svg.globe-pin-icon')).toHaveAttribute('aria-hidden', 'true')
      expect(pin.querySelector('svg.globe-pin-lead')).toHaveAttribute('aria-hidden', 'true')
      expect(pin.querySelector('span.globe-pin-label')).toBeInTheDocument()
    })

    it('inverts only the canvas in dark mode, never the pins', () => {
      const { container } = render(<Globe />)

      expect(document.querySelector('canvas')).toHaveClass('dark:invert')
      expect(container.querySelector('ul.globe-pins')).not.toHaveClass('dark:invert')
    })

    it('accepts a custom pin list', () => {
      const { container } = render(
        <Globe pins={[{ id: 'nyc', label: 'New York, NY', location: [40.7128, -74.006] }]} />,
      )

      const pins = container.querySelectorAll('li.globe-pin')
      expect(pins).toHaveLength(1)
      expect(pins[0].textContent).toBe('New York, NY')
      expect((pins[0] as HTMLElement).style.getPropertyValue('--pin-anchor')).toBe('--cobe-nyc')
      expect(mockCreateGlobe.mock.calls[0][1].markers).toEqual([{ id: 'nyc', location: [40.7128, -74.006], size: 0.02 }])
    })

    it('puts only the Vancouver label on the left (it would collide with Calgary on touch screens)', () => {
      const { container } = render(<Globe />)

      const left = container.querySelectorAll('li.globe-pin[data-side]')
      expect(left).toHaveLength(1)
      expect(left[0]).toHaveAttribute('data-side', 'left')
      expect(left[0].textContent).toBe('Vancouver, BC')
    })

    it('normalises the leader path length so the draw animation spans the whole line', () => {
      const { container } = render(<Globe />)

      expect(container.querySelector('svg.globe-pin-lead path')).toHaveAttribute('pathLength', '100')
    })
  })

  describe('Dragging', () => {
    it('pauses the auto-rotation while the pointer is over the globe, pins included', () => {
      const frames: FrameRequestCallback[] = []
      vi.spyOn(window, 'requestAnimationFrame').mockImplementation((cb) => frames.push(cb))
      vi.spyOn(window, 'cancelAnimationFrame').mockImplementation(() => {})

      const { container } = render(<Globe />)
      const host = container.firstElementChild!
      const update = vi.mocked(mockCreateGlobe.mock.results[0].value.update)

      frames[0](0)
      expect(update.mock.calls[0][0].phi).toBeCloseTo(0.001)

      // The pins are siblings of the canvas, so the hover target is the host:
      // moving from the canvas onto a pin must not resume the rotation.
      fireEvent.pointerEnter(host)
      frames[1](16)
      frames[2](32)
      expect(update.mock.calls[2][0].phi).toBeCloseTo(0.001)

      fireEvent.pointerLeave(host)
      frames[3](48)
      expect(update.mock.calls[3][0].phi).toBeCloseTo(0.002)
    })

    it('captures the pointer on pointerdown so crossing a pin does not end the drag', () => {
      const capture = vi.fn()
      const proto = HTMLElement.prototype as unknown as { setPointerCapture?: unknown }
      const original = proto.setPointerCapture
      proto.setPointerCapture = capture
      try {
        render(<Globe />)
        fireEvent.pointerDown(document.querySelector('canvas')!, { clientX: 10, pointerId: 7 })
        expect(capture).toHaveBeenCalledTimes(1)
      } finally {
        proto.setPointerCapture = original
      }
    })
  })

  describe('Accessibility and Structure', () => {
    it('has proper canvas structure', () => {
      const { container } = render(<Globe />)

      const host = container.firstElementChild
      const canvas = document.querySelector('canvas')

      expect(canvas).toBeInTheDocument()
      expect(host).toBeInTheDocument()
      // Two children: cobe's wrapper div (holding the canvas), then the pin list
      expect(host?.children).toHaveLength(2)
      expect(canvas?.parentElement?.parentElement).toBe(host)
      expect(host?.children[1].tagName).toBe('UL')
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