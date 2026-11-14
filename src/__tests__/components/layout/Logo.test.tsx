import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, hydrate } from '@/test-utils'
import userEvent from '@testing-library/user-event'
import Logo from '@/components/layout/Logo'

// Mock next-themes
const mockTheme = vi.hoisted(() => ({
  theme: 'light' as string | undefined,
  resolvedTheme: 'light' as string | undefined,
}))
vi.mock('next-themes', () => ({
  useTheme: vi.fn(() => mockTheme),
  ThemeProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>
}))

// Mock the smooth scroll hook
vi.mock('@/utils/hooks/useSmoothScroll', () => ({
  useSmoothScroll: vi.fn(() => ({ scrollToTop: vi.fn() }))
}))

// Mock usePathname
vi.mock('next/navigation', () => ({
  usePathname: vi.fn(() => '/')
}))

// Mock Next.js Image component
vi.mock('next/image', () => ({
  default: ({ src, alt, width, height, className, priority, preload, fetchPriority }: any) => (
    <div
      data-src={src}
      data-alt={alt}
      data-width={width}
      data-height={height}
      className={className}
      data-priority={priority}
      data-preload={preload}
      data-fetch-priority={fetchPriority}
      data-testid="logo-image"
    />
  )
}))

// Mock Next.js Link component
vi.mock('next/link', () => ({
  default: ({ href, children, className, onClick }: any) => (
    <a href={href} className={className} onClick={onClick} data-testid="logo-link">
      {children}
    </a>
  )
}))

describe('Logo Component', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockTheme.theme = 'light'
    mockTheme.resolvedTheme = 'light'

    // Mock matchMedia
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockImplementation((query) => ({
        matches: query === '(prefers-color-scheme: dark)',
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    })
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('Rendering', () => {
    it('renders logo link with correct href', () => {
      render(<Logo />)
      
      const logoLink = screen.getByTestId('logo-link')
      expect(logoLink).toHaveAttribute('href', '/')
    })

    it('renders a light and a dark logo variant with shared attributes', () => {
      render(<Logo />)

      const logoImages = screen.getAllByTestId('logo-image')
      expect(logoImages.map((image) => image.getAttribute('data-src'))).toEqual([
        '/BW_logo.svg',
        '/BW_logo_light.svg',
      ])
      for (const logoImage of logoImages) {
        expect(logoImage).toHaveAttribute('data-alt', 'Brand Logo')
        expect(logoImage).toHaveAttribute('data-width', '187.8')
        expect(logoImage).toHaveAttribute('data-height', '216')
        expect(logoImage).toHaveClass('h-16', 'w-auto')
        expect(logoImage).toHaveAttribute('data-fetch-priority', 'high')
        // Preloading (or eager loading) would fetch both variants; lazy loading
        // fetches only the one that is displayed.
        expect(logoImage).not.toHaveAttribute('data-priority')
        expect(logoImage).not.toHaveAttribute('data-preload')
      }
    })

    it('applies correct styling classes', () => {
      render(<Logo />)
      
      const logoLink = screen.getByTestId('logo-link')
      expect(logoLink).toHaveClass('block', 'hover:cursor-pointer')
    })
  })

  describe('Theme-based Logo Source', () => {
    it('lets the dark class on <html> pick the variant', () => {
      render(<Logo />)

      const [lightThemeLogo, darkThemeLogo] = screen.getAllByTestId('logo-image')
      expect(lightThemeLogo).toHaveAttribute('data-src', '/BW_logo.svg')
      expect(lightThemeLogo).toHaveClass('dark:hidden')
      expect(lightThemeLogo).not.toHaveClass('hidden')
      expect(darkThemeLogo).toHaveAttribute('data-src', '/BW_logo_light.svg')
      expect(darkThemeLogo).toHaveClass('hidden', 'dark:block')
    })

    it('matches the server HTML when the client already knows the theme', async () => {
      // next-themes has no theme on the server, but its first client render
      // reads the stored preference from localStorage.
      mockTheme.theme = undefined
      mockTheme.resolvedTheme = undefined
      const { hydrationErrors } = await hydrate(<Logo />, () => {
        mockTheme.theme = 'dark'
        mockTheme.resolvedTheme = 'dark'
      })

      expect(hydrationErrors).toEqual([])
    })
  })

  describe('Click Behavior', () => {
    it('renders click handler correctly', async () => {
      const user = userEvent.setup()
      render(<Logo />)
      
      const logoLink = screen.getByTestId('logo-link')
      
      // Should not throw when clicked
      expect(() => user.click(logoLink)).not.toThrow()
    })
  })

  describe('Integration', () => {
    it('renders without errors', () => {
      expect(() => render(<Logo />)).not.toThrow()
    })

    it('handles click events without errors', () => {
      render(<Logo />)
      const logoLink = screen.getByTestId('logo-link')
      
      expect(() => fireEvent.click(logoLink)).not.toThrow()
    })
  })
})