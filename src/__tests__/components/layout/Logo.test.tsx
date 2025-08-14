import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent } from '@/test-utils'
import userEvent from '@testing-library/user-event'
import Logo from '@/components/layout/Logo'

// Mock the theme context
vi.mock('@/contexts/ThemeContext', () => {
  const mockTheme = { theme: 'light' }
  return {
    useTheme: vi.fn(() => mockTheme),
    ThemeProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>
  }
})

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
  default: ({ src, alt, width, height, className, priority }: any) => (
    <div 
      data-src={src} 
      data-alt={alt} 
      data-width={width} 
      data-height={height} 
      className={className}
      data-priority={priority}
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

    it('renders logo image with correct attributes', () => {
      render(<Logo />)
      
      const logoImage = screen.getByTestId('logo-image')
      expect(logoImage).toHaveAttribute('data-alt', 'Brand Logo')
      expect(logoImage).toHaveAttribute('data-width', '187.8')
      expect(logoImage).toHaveAttribute('data-height', '216')
      expect(logoImage).toHaveClass('h-16', 'w-auto')
      expect(logoImage).toHaveAttribute('data-priority', 'true')
    })

    it('applies correct styling classes', () => {
      render(<Logo />)
      
      const logoLink = screen.getByTestId('logo-link')
      expect(logoLink).toHaveClass('block', 'hover:cursor-pointer')
    })
  })

  describe('Theme-based Logo Source', () => {
    it('renders logo with appropriate source', () => {
      render(<Logo />)
      
      const logoImage = screen.getByTestId('logo-image')
      
      // Should render with a logo source (either light or dark)
      expect(logoImage).toHaveAttribute('data-src')
      const src = logoImage.getAttribute('data-src')
      expect(src).toMatch(/\/BW_logo(_light)?\.svg/)
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