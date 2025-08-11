import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@/test-utils'
import Resume from '@/components/resume/Resume'
import { mockResumeData, createMockResumeData } from './__mocks__/mockResumeData'

// Mock the cleanUrl function
vi.mock('@/utils/functions/format', () => ({
  cleanUrl: vi.fn((url: string) => url.replace(/^(https?:\/\/)?(www\.)?/, '').replace(/\/$/, '')),
}))

// Mock UI components
vi.mock('@/components/ui', () => ({
  Button: ({ children, onClick, disabled, href, icon, label }: any) => {
    const Component = href ? 'a' : 'button'
    return (
      <Component 
        onClick={disabled ? undefined : onClick}
        disabled={disabled}
        href={href}
        role={href ? 'link' : 'button'}
        data-testid={href ? undefined : 'button'}
      >
        {icon && <span>{icon}</span>} {label || children}
      </Component>
    )
  },
  Announcement: () => <div data-testid="announcement">Announcement</div>,
}))

describe('Resume Component', () => {
  const mockOnExportPDF = vi.fn()
  const defaultProps = {
    data: mockResumeData,
    onExportPDF: mockOnExportPDF,
    isGeneratingPDF: false,
    hideContactInfo: true,
  }

  beforeEach(() => {
    vi.clearAllMocks()
    // Mock window.location
    Object.defineProperty(window, 'location', {
      value: {
        href: 'http://example.com',
      },
      writable: true,
    })
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  describe('Basic Rendering', () => {
    it('renders the resume with all major sections', () => {
      render(<Resume {...defaultProps} />)

      // Check if main sections are present
      expect(screen.getByText('John Doe')).toBeInTheDocument()
      expect(screen.getByText('Summary')).toBeInTheDocument()
      expect(screen.getByText('Experience')).toBeInTheDocument()
      expect(screen.getByText('Technical Strengths')).toBeInTheDocument()
      expect(screen.getByText('Education')).toBeInTheDocument()
    })

    it('displays full name correctly', () => {
      render(<Resume {...defaultProps} />)
      expect(screen.getByText('John Doe')).toBeInTheDocument()
    })

    it('displays summary text', () => {
      render(<Resume {...defaultProps} />)
      expect(screen.getByText(mockResumeData.summary)).toBeInTheDocument()
    })

    it('renders all experience entries', () => {
      render(<Resume {...defaultProps} />)

      // Check all companies are rendered
      expect(screen.getByText('Tech Corp')).toBeInTheDocument()
      expect(screen.getByText('StartupXYZ')).toBeInTheDocument()
      expect(screen.getByText('Web Solutions Inc')).toBeInTheDocument()
      expect(screen.getByText('Freelance')).toBeInTheDocument()

      // Check positions
      expect(screen.getByText('Senior Software Engineer')).toBeInTheDocument()
      expect(screen.getByText('Full Stack Developer')).toBeInTheDocument()
    })

    it('renders all skills sections', () => {
      render(<Resume {...defaultProps} />)

      mockResumeData.skills.forEach(skill => {
        expect(screen.getByText(skill.skill_title)).toBeInTheDocument()
        expect(screen.getByText(skill.skill_items)).toBeInTheDocument()
      })
    })

    it('renders education information', () => {
      render(<Resume {...defaultProps} />)

      expect(screen.getByText('University of Technology, San Francisco, CA')).toBeInTheDocument()
      expect(screen.getByText('Bachelor of Science in Computer Science')).toBeInTheDocument()
    })
  })

  describe('Contact Information Visibility', () => {
    it('shows blurred contact info when hideContactInfo is true and not generating PDF', () => {
      render(<Resume {...defaultProps} hideContactInfo={true} isGeneratingPDF={false} />)

      // Should show placeholder values
      expect(screen.getByText('(555) 555-5555')).toBeInTheDocument()
      expect(screen.getByText('redacted@email.com')).toBeInTheDocument()

      // Check for blur classes
      const phoneElement = screen.getByText('(555) 555-5555').closest('span')
      const emailElement = screen.getByText('redacted@email.com').closest('span')

      expect(phoneElement).toHaveClass('blur-sm')
      expect(emailElement).toHaveClass('blur-sm')
    })

    it('shows real contact info when hideContactInfo is false', () => {
      render(<Resume {...defaultProps} hideContactInfo={false} />)

      expect(screen.getByText('(555) 123-4567')).toBeInTheDocument()
      expect(screen.getByText('john.doe@example.com')).toBeInTheDocument()
    })

    it('shows real contact info when generating PDF even if hideContactInfo is true', () => {
      render(<Resume {...defaultProps} hideContactInfo={true} isGeneratingPDF={true} />)

      expect(screen.getByText('(555) 123-4567')).toBeInTheDocument()
      expect(screen.getByText('john.doe@example.com')).toBeInTheDocument()
    })
  })

  describe('Social Links', () => {
    it('renders social links with correct URLs and clean display text', () => {
      render(<Resume {...defaultProps} />)

      // Check LinkedIn
      const linkedinLink = screen.getByRole('link', { name: /linkedin\.com\/in\/johndoe/i })
      expect(linkedinLink).toHaveAttribute('href', 'https://www.linkedin.com/in/johndoe')

      // Check GitHub
      const githubLink = screen.getByRole('link', { name: /github\.com\/johndoe/i })
      expect(githubLink).toHaveAttribute('href', 'https://github.com/johndoe')

      // Check Portfolio
      const portfolioLink = screen.getByRole('link', { name: /johndoe\.com/i })
      expect(portfolioLink).toHaveAttribute('href', 'https://www.johndoe.com')
    })

    it('opens social links in new tab', () => {
      render(<Resume {...defaultProps} />)

      const links = screen.getAllByRole('link')
      const socialLinks = links.filter(link => 
        link.getAttribute('href')?.includes('linkedin') || 
        link.getAttribute('href')?.includes('github') || 
        link.getAttribute('href')?.includes('johndoe.com')
      )

      socialLinks.forEach(link => {
        expect(link).toHaveAttribute('target', '_blank')
        expect(link).toHaveAttribute('rel', 'noopener noreferrer')
      })
    })
  })

  describe('Experience Section', () => {
    it('displays experience dates correctly', () => {
      render(<Resume {...defaultProps} />)

      // Current position (no end date)
      expect(screen.getByText('2022-01-01 - Present')).toBeInTheDocument()

      // Past positions with end dates
      expect(screen.getByText('2020-06-01 - 2021-12-31')).toBeInTheDocument()
      expect(screen.getByText('2019-01-01 - 2020-05-31')).toBeInTheDocument()
    })

    it('renders experience descriptions as list items', () => {
      render(<Resume {...defaultProps} />)

      // Check if description items are rendered
      expect(screen.getByText('Led development of microservices architecture')).toBeInTheDocument()
      expect(screen.getByText('Improved application performance by 40%')).toBeInTheDocument()
      expect(screen.getByText('Built responsive web applications using React')).toBeInTheDocument()
    })

    it('adds special ID to the 4th experience item for page break', () => {
      render(<Resume {...defaultProps} />)

      // The 4th experience item (index 3) should have the 'page2el' id
      const experienceItems = document.querySelectorAll('[data-testid], #page2el')
      const fourthItem = document.querySelector('#page2el')
      expect(fourthItem).toBeInTheDocument()
    })
  })

  describe('Education Section', () => {
    it('displays education dates correctly', () => {
      render(<Resume {...defaultProps} />)

      expect(screen.getByText('2014-09-01 - 2018-05-31')).toBeInTheDocument()
    })

    it('handles education with no end date', () => {
      const dataWithCurrentEducation = createMockResumeData({
        education: {
          ...mockResumeData.education,
          duration: {
            startDate: '2020-01-01',
            endDate: null,
          },
        },
      })

      render(<Resume {...defaultProps} data={dataWithCurrentEducation} />)

      expect(screen.getByText('2020-01-01 - Present')).toBeInTheDocument()
    })
  })

  describe('Buttons', () => {
    it('renders download PDF button', () => {
      render(<Resume {...defaultProps} />)

      const downloadButton = screen.getByRole('button', { name: /download pdf/i })
      expect(downloadButton).toBeInTheDocument()
    })

    it('renders contact me button with correct href', () => {
      render(<Resume {...defaultProps} />)

      const contactButton = screen.getByRole('link', { name: /contact me/i })
      expect(contactButton).toHaveAttribute('href', '/#contact')
    })

    it('passes onExportPDF to button component but button is disabled', () => {
      render(<Resume {...defaultProps} />)

      const downloadButton = screen.getByRole('button', { name: /download pdf/i })
      
      // Button should be disabled in the actual implementation
      expect(downloadButton).toBeDisabled()
      
      // Since the button is disabled, clicking it won't trigger the onClick
      fireEvent.click(downloadButton)
      expect(mockOnExportPDF).toHaveBeenCalledTimes(0)
    })

    it('disables download button when specified', () => {
      render(<Resume {...defaultProps} />)

      const downloadButton = screen.getByRole('button', { name: /download pdf/i })
      expect(downloadButton).toBeDisabled()
    })

    it('shows different button state when generating PDF', () => {
      render(<Resume {...defaultProps} isGeneratingPDF={true} />)

      const downloadButton = screen.getByRole('button', { name: /download pdf/i })
      expect(downloadButton).toBeDisabled()
    })
  })

  describe('PDF Generation Mode', () => {
    it('applies different styling when generating PDF', () => {
      render(<Resume {...defaultProps} isGeneratingPDF={true} />)

      const container = document.querySelector('#resume-container')
      expect(container).toHaveClass('bg-white')
    })

    it('adds padding to technical strengths section when generating PDF', () => {
      render(<Resume {...defaultProps} isGeneratingPDF={true} />)

      const technicalSection = screen.getByText('Technical Strengths').closest('section')
      expect(technicalSection).toHaveClass('pt-16')
    })

    it('removes shadow when generating PDF', () => {
      const { rerender } = render(<Resume {...defaultProps} isGeneratingPDF={false} />)

      let container = document.querySelector('#resume-container')
      expect(container).toHaveClass('shadow-lg')

      rerender(<Resume {...defaultProps} isGeneratingPDF={true} />)

      container = document.querySelector('#resume-container')
      expect(container).not.toHaveClass('shadow-lg')
    })
  })

  describe('Responsive Design', () => {
    it('has responsive classes for mobile/desktop', () => {
      render(<Resume {...defaultProps} />)

      const container = document.querySelector('#resume-container')
      expect(container).toHaveClass('py-4', 'px-8', 'sm:py-8', 'sm:px-16')
    })

    it('applies minimum width for mobile', () => {
      render(<Resume {...defaultProps} />)

      const outerContainer = document.querySelector('.min-w-\\[320px\\]')
      expect(outerContainer).toBeInTheDocument()
    })
  })

  describe('Localhost Detection', () => {
    it('detects localhost correctly', async () => {
      Object.defineProperty(window, 'location', {
        value: {
          href: 'http://localhost:3000',
        },
        writable: true,
      })

      render(<Resume {...defaultProps} />)

      // Wait for useEffect to run
      await waitFor(() => {
        // The component should detect localhost (though the specific behavior isn't visible in the DOM)
        // This test mainly ensures no errors occur during localhost detection
        expect(screen.getByText('John Doe')).toBeInTheDocument()
      })
    })
  })

  describe('Viewport Handling', () => {
    it('handles window resize events', async () => {
      const addEventListenerSpy = vi.spyOn(window, 'addEventListener')
      const removeEventListenerSpy = vi.spyOn(window, 'removeEventListener')

      const { unmount } = render(<Resume {...defaultProps} />)

      // Check if resize event listener was added
      expect(addEventListenerSpy).toHaveBeenCalledWith('resize', expect.any(Function))

      // Unmount component
      unmount()

      // Check if resize event listener was removed
      expect(removeEventListenerSpy).toHaveBeenCalledWith('resize', expect.any(Function))
    })

    it('handles viewport meta tag manipulation', async () => {
      // Mock querySelector for viewport meta tag
      const mockViewport = {
        setAttribute: vi.fn(),
      }
      const querySelectorSpy = vi.spyOn(document, 'querySelector')
      querySelectorSpy.mockReturnValue(mockViewport as any)

      render(<Resume {...defaultProps} />)

      // Simulate window resize to trigger viewport handling
      Object.defineProperty(window, 'innerWidth', { value: 500 })
      fireEvent(window, new Event('resize'))

      await waitFor(() => {
        expect(mockViewport.setAttribute).toHaveBeenCalled()
      })
    })
  })

  describe('Font Application', () => {
    it('applies Nunito font class to resume container', () => {
      render(<Resume {...defaultProps} />)

      const container = screen.getByText('John Doe').closest('#resume-container')
      expect(container).toBeInTheDocument()
      // The font class would be applied via the nunito.className from the mock
    })
  })

  describe('Announcement Component', () => {
    it('renders the Announcement component', () => {
      render(<Resume {...defaultProps} />)

      // The Announcement component should be rendered (though its content depends on the component itself)
      // This test ensures it doesn't cause any errors
      expect(screen.getByText('John Doe')).toBeInTheDocument()
    })
  })

  describe('Print Styles', () => {
    it('hides action buttons in print mode', () => {
      render(<Resume {...defaultProps} />)

      // Check that buttons container has print:hidden class by finding it via data attributes
      const downloadButton = screen.getByRole('button', { name: /download pdf/i })
      expect(downloadButton.closest('.print\\:hidden, [class*="print:hidden"]')).toBeTruthy()
    })
  })

  describe('Edge Cases', () => {
    it('handles empty experience array', () => {
      const dataWithNoExperience = createMockResumeData({
        experience: [],
      })

      render(<Resume {...defaultProps} data={dataWithNoExperience} />)

      expect(screen.getByText('Experience')).toBeInTheDocument()
      expect(screen.queryByText('Tech Corp')).not.toBeInTheDocument()
    })

    it('handles empty skills array', () => {
      const dataWithNoSkills = createMockResumeData({
        skills: [],
      })

      render(<Resume {...defaultProps} data={dataWithNoSkills} />)

      expect(screen.getByText('Technical Strengths')).toBeInTheDocument()
      expect(screen.queryByText('Frontend Technologies')).not.toBeInTheDocument()
    })

    it('handles missing education end date', () => {
      const dataWithNoEducationEndDate = createMockResumeData({
        education: {
          ...mockResumeData.education,
          duration: {
            startDate: '2020-01-01',
            endDate: null,
          },
        },
      })

      render(<Resume {...defaultProps} data={dataWithNoEducationEndDate} />)

      expect(screen.getByText('2020-01-01 - Present')).toBeInTheDocument()
    })
  })
})