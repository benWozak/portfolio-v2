import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@/test-utils'
import { Footer } from '@/components/layout/Footer'

// Mock the navigation hook
vi.mock('@/utils/hooks', () => ({
  useNavigation: vi.fn(() => [
    { href: '/about', label: 'About' },
    { href: '/work', label: 'Work' },
    { href: '/contact', label: 'Contact' },
    { href: '/blog', label: 'Blog' }
  ])
}))

// Mock child components
vi.mock('@/components/layout/Logo', () => ({
  default: () => <div data-testid="footer-logo">Logo</div>
}))

vi.mock('@/components/ui/LinkButton', () => ({
  LinkButton: ({ children, href, className }: any) => (
    <a href={href} className={className} data-testid={`footer-link-${href}`}>
      {children}
    </a>
  )
}))

vi.mock('@/components/content', () => ({
  Socials: ({ size }: { size: string }) => <div data-testid={`footer-socials-${size}`}>Socials</div>
}))

describe('Footer Component', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Rendering', () => {
    it('renders footer element with correct semantic tag', () => {
      render(<Footer />)
      
      const footer = screen.getByRole('contentinfo')
      expect(footer).toBeInTheDocument()
      expect(footer.tagName).toBe('FOOTER')
    })

    it('renders logo component', () => {
      render(<Footer />)
      
      expect(screen.getByTestId('footer-logo')).toBeInTheDocument()
    })

    it('renders all navigation items', () => {
      render(<Footer />)
      
      expect(screen.getByTestId('footer-link-/about')).toHaveTextContent('About')
      expect(screen.getByTestId('footer-link-/work')).toHaveTextContent('Work')
      expect(screen.getByTestId('footer-link-/contact')).toHaveTextContent('Contact')
      expect(screen.getByTestId('footer-link-/blog')).toHaveTextContent('Blog')
    })

    it('renders social icons with medium size', () => {
      render(<Footer />)
      
      expect(screen.getByTestId('footer-socials-md')).toBeInTheDocument()
    })

    it('renders copyright notice with current year', () => {
      render(<Footer />)
      
      const currentYear = new Date().getFullYear()
      const copyright = screen.getByText(new RegExp(`© ${currentYear} Ben Wozak\\. All rights reserved\\.`))
      expect(copyright).toBeInTheDocument()
      expect(copyright.tagName).toBe('SUB')
    })
  })

  describe('Navigation Links', () => {
    it('applies correct CSS classes to navigation links', () => {
      render(<Footer />)
      
      const aboutLink = screen.getByTestId('footer-link-/about')
      expect(aboutLink).toHaveClass(
        'text-gray-700',
        'dark:text-gray-200',
        'transition',
        'hover:text-gray-700/75'
      )
    })

    it('renders navigation in list structure', () => {
      render(<Footer />)
      
      const list = screen.getByRole('list')
      expect(list).toBeInTheDocument()
      
      const listItems = screen.getAllByRole('listitem')
      expect(listItems).toHaveLength(4) // About, Work, Contact, Blog
    })

    it('has correct href attributes for all links', () => {
      render(<Footer />)
      
      expect(screen.getByTestId('footer-link-/about')).toHaveAttribute('href', '/about')
      expect(screen.getByTestId('footer-link-/work')).toHaveAttribute('href', '/work')
      expect(screen.getByTestId('footer-link-/contact')).toHaveAttribute('href', '/contact')
      expect(screen.getByTestId('footer-link-/blog')).toHaveAttribute('href', '/blog')
    })
  })

  describe('Layout and Styling', () => {
    it('applies correct container styling', () => {
      render(<Footer />)
      
      const footer = screen.getByRole('contentinfo')
      expect(footer).toHaveClass('text-sm', 'text-foreground')
      
      const container = footer.firstChild
      expect(container).toHaveClass(
        'flex',
        'flex-col',
        'items-center',
        'justify-center',
        'gap-4',
        'mx-auto',
        'max-w-5xl',
        'px-4',
        'py-16',
        'sm:px-6',
        'lg:px-8'
      )
    })

    it('applies responsive gap classes to navigation list', () => {
      render(<Footer />)
      
      const list = screen.getByRole('list')
      expect(list).toHaveClass(
        'flex',
        'flex-wrap',
        'gap-6',
        'md:gap-8',
        'lg:gap-12'
      )
    })

    it('applies margin to copyright text', () => {
      render(<Footer />)
      
      const currentYear = new Date().getFullYear()
      const copyright = screen.getByText(new RegExp(`© ${currentYear} Ben Wozak`))
      expect(copyright).toHaveClass('mt-4')
    })
  })

  describe('Dynamic Content', () => {
    it('displays correct year in different years', () => {
      vi.setSystemTime(new Date('2025-06-15'))
      render(<Footer />)
      
      expect(screen.getByText(/© 2025 Ben Wozak. All rights reserved./)).toBeInTheDocument()
    })

    it('handles year change correctly', () => {
      vi.setSystemTime(new Date('2023-12-31'))
      render(<Footer />)
      
      expect(screen.getByText(/© 2023 Ben Wozak. All rights reserved./)).toBeInTheDocument()
    })
  })

  describe('Component Structure', () => {
    it('renders components in correct order', () => {
      render(<Footer />)
      
      const container = screen.getByRole('contentinfo').firstChild
      const children = Array.from(container?.children || [])
      
      expect(children).toHaveLength(4) // Logo, Nav, Socials, Copyright
      
      expect(children[0]).toContainElement(screen.getByTestId('footer-logo'))
      expect(children[1]).toContainElement(screen.getByRole('list'))
      expect(children[2]).toContainElement(screen.getByTestId('footer-socials-md'))
      const currentYear = new Date().getFullYear()
      expect(children[3]).toContainElement(screen.getByText(new RegExp(`© ${currentYear} Ben Wozak`)))
    })

    it('centers all content properly', () => {
      render(<Footer />)
      
      const container = screen.getByRole('contentinfo').firstChild
      expect(container).toHaveClass('items-center', 'justify-center')
    })
  })

  describe('Accessibility', () => {
    it('uses semantic footer element', () => {
      render(<Footer />)
      
      const footer = screen.getByRole('contentinfo')
      expect(footer.tagName).toBe('FOOTER')
    })

    it('has proper list structure for navigation', () => {
      render(<Footer />)
      
      const list = screen.getByRole('list')
      const listItems = screen.getAllByRole('listitem')
      
      expect(list).toBeInTheDocument()
      expect(listItems.length).toBeGreaterThan(0)
      
      listItems.forEach(item => {
        expect(list).toContainElement(item)
      })
    })

    it('maintains proper link structure', () => {
      render(<Footer />)
      
      const links = [
        screen.getByTestId('footer-link-/about'),
        screen.getByTestId('footer-link-/work'),
        screen.getByTestId('footer-link-/contact'),
        screen.getByTestId('footer-link-/blog')
      ]
      
      links.forEach(link => {
        expect(link.tagName).toBe('A')
        expect(link).toHaveAttribute('href')
      })
    })
  })

})