import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@/test-utils'
import userEvent from '@testing-library/user-event'
import { Header } from '@/components/layout/Header'
import { usePathname } from 'next/navigation'

// Mock the navigation hook
vi.mock('@/utils/hooks', () => ({
  useNavigation: vi.fn(() => [
    { href: '/about', label: 'About' },
    { href: '/work', label: 'Work' },
    { href: '/contact', label: 'Contact' }
  ])
}))

// Mock usePathname
vi.mock('next/navigation', () => ({
  usePathname: vi.fn(() => '/')
}))

// Mock child components
vi.mock('@/components/layout/Logo', () => ({
  default: () => <div data-testid="logo">Logo</div>
}))

vi.mock('@/components/layout/ThemeToggle', () => ({
  ThemeToggle: () => <div data-testid="theme-toggle">Theme Toggle</div>
}))

vi.mock('@/components/ui/LinkButton', () => ({
  LinkButton: ({ children, href, isActive, onClick }: any) => (
    <a href={href} data-active={isActive} onClick={onClick} data-testid={`link-${href}`}>
      {children}
    </a>
  )
}))

vi.mock('@/components/content', () => ({
  Socials: ({ size }: { size: string }) => <div data-testid={`socials-${size}`}>Socials</div>
}))

describe('Header Component', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('Rendering', () => {
    it('renders header with all main elements', () => {
      render(<Header />)
      
      expect(screen.getByRole('banner')).toBeInTheDocument()
      expect(screen.getByTestId('logo')).toBeInTheDocument()
      expect(screen.getByTestId('theme-toggle')).toBeInTheDocument()
      expect(screen.getByRole('navigation', { name: 'Global' })).toBeInTheDocument()
    })

    it('renders navigation items correctly', () => {
      render(<Header />)
      
      expect(screen.getByTestId('link-/about')).toHaveTextContent('About')
      expect(screen.getByTestId('link-/work')).toHaveTextContent('Work')
      expect(screen.getByTestId('link-/contact')).toHaveTextContent('Contact')
    })

    it('renders social icons in desktop view', () => {
      render(<Header />)
      
      const socials = screen.getByTestId('socials-md')
      expect(socials).toBeInTheDocument()
      expect(socials.parentElement).toHaveClass('hidden', 'md:block')
    })

    it('renders mobile menu button', () => {
      render(<Header />)
      
      const mobileButton = screen.getByRole('button', { name: /toggle mobile menu/i })
      expect(mobileButton).toBeInTheDocument()
      expect(mobileButton).toHaveAttribute('aria-expanded', 'false')
    })
  })

  describe('Scroll Behavior', () => {
    it('applies transparent background initially', () => {
      render(<Header />)
      
      const header = screen.getByRole('banner')
      expect(header).toHaveClass('bg-transparent')
      expect(header).not.toHaveClass('bg-white/70', 'dark:bg-gray-900/70', 'backdrop-blur-md', 'shadow-md')
    })

    it('changes styling when scrolled', async () => {
      render(<Header />)
      
      const header = screen.getByRole('banner')
      
      // Simulate scroll
      Object.defineProperty(window, 'scrollY', { value: 100, writable: true })
      fireEvent.scroll(window)
      
      await waitFor(() => {
        expect(header).toHaveClass('bg-white/70', 'dark:bg-gray-900/70', 'backdrop-blur-md', 'shadow-md')
        expect(header).not.toHaveClass('bg-transparent')
      })
    })

    it('removes scroll event listener on unmount', () => {
      const removeEventListenerSpy = vi.spyOn(window, 'removeEventListener')
      
      const { unmount } = render(<Header />)
      unmount()
      
      expect(removeEventListenerSpy).toHaveBeenCalledWith('scroll', expect.any(Function))
    })
  })

  describe('Mobile Menu', () => {
    it('opens mobile menu when button clicked', async () => {
      const user = userEvent.setup()
      render(<Header />)
      
      const mobileButton = screen.getByRole('button', { name: /toggle mobile menu/i })
      
      await user.click(mobileButton)
      
      expect(mobileButton).toHaveAttribute('aria-expanded', 'true')
      
      // Mobile menu should be visible
      const mobileMenu = screen.getByRole('navigation')
      expect(mobileMenu).toBeInTheDocument()
    })

    it('closes mobile menu when close button clicked', async () => {
      const user = userEvent.setup()
      render(<Header />)
      
      // Open mobile menu first
      const mobileButton = screen.getByRole('button', { name: /toggle mobile menu/i })
      await user.click(mobileButton)
      
      // Click close button
      const closeButton = screen.getByRole('button', { name: /close mobile menu/i })
      await user.click(closeButton)
      
      expect(mobileButton).toHaveAttribute('aria-expanded', 'false')
    })

    it('closes mobile menu when logo clicked', async () => {
      const user = userEvent.setup()
      render(<Header />)
      
      // Open mobile menu first
      const mobileButton = screen.getByRole('button', { name: /toggle mobile menu/i })
      await user.click(mobileButton)
      
      // Click logo in mobile menu
      const mobileLogos = screen.getAllByTestId('logo')
      const mobileMenuLogo = mobileLogos.find(logo => 
        logo.closest('.fixed')?.classList.contains('z-50')
      )
      
      if (mobileMenuLogo) {
        await user.click(mobileMenuLogo.parentElement!)
        expect(mobileButton).toHaveAttribute('aria-expanded', 'false')
      }
    })

    it('closes mobile menu when navigation item clicked', async () => {
      const user = userEvent.setup()
      render(<Header />)
      
      // Open mobile menu first
      const mobileButton = screen.getByRole('button', { name: /toggle mobile menu/i })
      await user.click(mobileButton)
      
      // Find mobile menu navigation links (they should be in the mobile menu overlay)
      const mobileNavLinks = screen.getAllByTestId('link-/about')
      const mobileLink = mobileNavLinks.find(link => 
        link.closest('.fixed')?.classList.contains('z-50')
      )
      
      if (mobileLink) {
        await user.click(mobileLink)
        expect(mobileButton).toHaveAttribute('aria-expanded', 'false')
      }
    })

    it('renders mobile menu navigation items', async () => {
      const user = userEvent.setup()
      render(<Header />)
      
      // Open mobile menu
      const mobileButton = screen.getByRole('button', { name: /toggle mobile menu/i })
      await user.click(mobileButton)
      
      // Check that mobile navigation items exist
      const aboutLinks = screen.getAllByTestId('link-/about')
      const workLinks = screen.getAllByTestId('link-/work')
      const contactLinks = screen.getAllByTestId('link-/contact')
      
      expect(aboutLinks).toHaveLength(2) // One in desktop nav, one in mobile nav
      expect(workLinks).toHaveLength(2)
      expect(contactLinks).toHaveLength(2)
    })

    it('renders socials in mobile menu', async () => {
      const user = userEvent.setup()
      render(<Header />)
      
      // Open mobile menu
      const mobileButton = screen.getByRole('button', { name: /toggle mobile menu/i })
      await user.click(mobileButton)
      
      // Should have both desktop and mobile socials
      const socialElements = screen.getAllByTestId('socials-md')
      expect(socialElements).toHaveLength(2) // One hidden on mobile, one in mobile menu
    })
  })

  describe('Navigation Active States', () => {
    it('marks navigation items as active based on pathname', () => {
      vi.mocked(usePathname).mockReturnValue('/about/me')
      
      render(<Header />)
      
      const aboutLink = screen.getByTestId('link-/about')
      expect(aboutLink).toHaveAttribute('data-active', 'true')
      
      const workLink = screen.getByTestId('link-/work')
      expect(workLink).toHaveAttribute('data-active', 'false')
    })

    it('handles root path correctly', () => {
      vi.mocked(usePathname).mockReturnValue('/')
      
      render(<Header />)
      
      const aboutLink = screen.getByTestId('link-/about')
      expect(aboutLink).toHaveAttribute('data-active', 'false')
    })
  })

  describe('Responsive Behavior', () => {
    it('hides desktop navigation on mobile', () => {
      render(<Header />)
      
      const desktopNav = screen.getByRole('navigation', { name: 'Global' })
      expect(desktopNav).toHaveClass('hidden', 'md:block')
    })

    it('hides mobile menu button on desktop', () => {
      render(<Header />)
      
      const mobileButton = screen.getByRole('button', { name: /toggle mobile menu/i })
      expect(mobileButton.parentElement).toHaveClass('block', 'md:hidden')
    })

    it('hides desktop socials on mobile', () => {
      render(<Header />)
      
      const socials = screen.getByTestId('socials-md')
      expect(socials.parentElement).toHaveClass('hidden', 'md:block')
    })
  })

  describe('Accessibility', () => {
    it('has proper ARIA labels', () => {
      render(<Header />)
      
      expect(screen.getByRole('navigation', { name: 'Global' })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /toggle mobile menu/i })).toBeInTheDocument()
    })

    it('manages aria-expanded correctly', async () => {
      const user = userEvent.setup()
      render(<Header />)
      
      const mobileButton = screen.getByRole('button', { name: /toggle mobile menu/i })
      
      expect(mobileButton).toHaveAttribute('aria-expanded', 'false')
      
      await user.click(mobileButton)
      expect(mobileButton).toHaveAttribute('aria-expanded', 'true')
      
      await user.click(mobileButton)
      expect(mobileButton).toHaveAttribute('aria-expanded', 'false')
    })

    it('has proper semantic structure', () => {
      render(<Header />)
      
      const header = screen.getByRole('banner')
      const nav = screen.getByRole('navigation')
      const list = screen.getByRole('list')
      
      expect(header).toContainElement(nav)
      expect(nav).toContainElement(list)
    })
  })

  describe('Animation and Motion', () => {
    it('applies correct CSS classes for animations', () => {
      render(<Header />)
      
      const header = screen.getByRole('banner')
      expect(header).toHaveClass('transition-all', 'duration-300', 'ease-in-out')
    })

    it('positions header correctly', () => {
      render(<Header />)
      
      const header = screen.getByRole('banner')
      expect(header).toHaveClass('fixed', 'top-0', 'left-0', 'right-0', 'z-50')
    })
  })
})