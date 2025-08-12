import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@/test-utils'
import userEvent from '@testing-library/user-event'
import { ThemeToggle } from '@/components/layout/ThemeToggle'

// Mock the theme context
const mockSetTheme = vi.fn()
const mockTheme = { theme: 'light', setTheme: mockSetTheme }
vi.mock('@/contexts/ThemeContext', () => ({
  useTheme: vi.fn(() => mockTheme)
}))

// Mock Lucide React icons
vi.mock('lucide-react', () => ({
  Sun: ({ size }: { size: number }) => <div data-testid="sun-icon" data-size={size}>Sun</div>,
  Moon: ({ size }: { size: number }) => <div data-testid="moon-icon" data-size={size}>Moon</div>,
  Laptop: ({ size }: { size: number }) => <div data-testid="laptop-icon" data-size={size}>Laptop</div>,
}))

// Mock the Dropdown component
vi.mock('@/components/ui', () => ({
  Dropdown: ({ options, value, onChange }: any) => (
    <div data-testid="theme-dropdown" data-value={value}>
      {options.map((option: any) => (
        <button
          key={option.value}
          onClick={() => onChange(option.value)}
          data-testid={`theme-option-${option.value}`}
          data-selected={value === option.value}
        >
          <span data-testid={`icon-${option.value}`}>{option.icon}</span>
          <span data-testid={`label-${option.value}`}>{option.label}</span>
        </button>
      ))}
    </div>
  )
}))

describe('ThemeToggle Component', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockTheme.theme = 'light'
  })

  describe('Rendering', () => {
    it('renders dropdown component', () => {
      render(<ThemeToggle />)
      
      expect(screen.getByTestId('theme-dropdown')).toBeInTheDocument()
    })

    it('displays current theme value', () => {
      render(<ThemeToggle />)
      
      const dropdown = screen.getByTestId('theme-dropdown')
      expect(dropdown).toHaveAttribute('data-value', 'light')
    })

    it('renders all theme options', () => {
      render(<ThemeToggle />)
      
      expect(screen.getByTestId('theme-option-light')).toBeInTheDocument()
      expect(screen.getByTestId('theme-option-dark')).toBeInTheDocument()
      expect(screen.getByTestId('theme-option-system')).toBeInTheDocument()
    })
  })

  describe('Theme Options', () => {
    it('renders light theme option with correct icon and label', () => {
      render(<ThemeToggle />)
      
      expect(screen.getByTestId('label-light')).toHaveTextContent('Light')
      
      const sunIcon = screen.getByTestId('sun-icon')
      expect(sunIcon).toBeInTheDocument()
      expect(sunIcon).toHaveAttribute('data-size', '16')
    })

    it('renders dark theme option with correct icon and label', () => {
      render(<ThemeToggle />)
      
      expect(screen.getByTestId('label-dark')).toHaveTextContent('Dark')
      
      const moonIcon = screen.getByTestId('moon-icon')
      expect(moonIcon).toBeInTheDocument()
      expect(moonIcon).toHaveAttribute('data-size', '16')
    })

    it('renders system theme option with correct icon and label', () => {
      render(<ThemeToggle />)
      
      expect(screen.getByTestId('label-system')).toHaveTextContent('System')
      
      const laptopIcon = screen.getByTestId('laptop-icon')
      expect(laptopIcon).toBeInTheDocument()
      expect(laptopIcon).toHaveAttribute('data-size', '16')
    })
  })

  describe('Theme Selection', () => {
    it('calls setTheme when light option selected', async () => {
      const user = userEvent.setup()
      render(<ThemeToggle />)
      
      const lightOption = screen.getByTestId('theme-option-light')
      await user.click(lightOption)
      
      expect(mockSetTheme).toHaveBeenCalledWith('light')
    })

    it('calls setTheme when dark option selected', async () => {
      const user = userEvent.setup()
      render(<ThemeToggle />)
      
      const darkOption = screen.getByTestId('theme-option-dark')
      await user.click(darkOption)
      
      expect(mockSetTheme).toHaveBeenCalledWith('dark')
    })

    it('calls setTheme when system option selected', async () => {
      const user = userEvent.setup()
      render(<ThemeToggle />)
      
      const systemOption = screen.getByTestId('theme-option-system')
      await user.click(systemOption)
      
      expect(mockSetTheme).toHaveBeenCalledWith('system')
    })
  })

  describe('Current Theme State', () => {
    it('reflects dark theme as current', () => {
      mockTheme.theme = 'dark'
      render(<ThemeToggle />)
      
      const dropdown = screen.getByTestId('theme-dropdown')
      expect(dropdown).toHaveAttribute('data-value', 'dark')
      
      const darkOption = screen.getByTestId('theme-option-dark')
      expect(darkOption).toHaveAttribute('data-selected', 'true')
    })

    it('reflects system theme as current', () => {
      mockTheme.theme = 'system'
      render(<ThemeToggle />)
      
      const dropdown = screen.getByTestId('theme-dropdown')
      expect(dropdown).toHaveAttribute('data-value', 'system')
      
      const systemOption = screen.getByTestId('theme-option-system')
      expect(systemOption).toHaveAttribute('data-selected', 'true')
    })

    it('reflects light theme as current by default', () => {
      mockTheme.theme = 'light'
      render(<ThemeToggle />)
      
      const lightOption = screen.getByTestId('theme-option-light')
      expect(lightOption).toHaveAttribute('data-selected', 'true')
      
      const darkOption = screen.getByTestId('theme-option-dark')
      expect(darkOption).toHaveAttribute('data-selected', 'false')
      
      const systemOption = screen.getByTestId('theme-option-system')
      expect(systemOption).toHaveAttribute('data-selected', 'false')
    })
  })

  describe('Dropdown Integration', () => {
    it('passes correct options structure to Dropdown', () => {
      render(<ThemeToggle />)
      
      // Verify all three options exist
      expect(screen.getByTestId('theme-option-light')).toBeInTheDocument()
      expect(screen.getByTestId('theme-option-dark')).toBeInTheDocument()
      expect(screen.getByTestId('theme-option-system')).toBeInTheDocument()
      
      // Verify icons are properly rendered
      expect(screen.getByTestId('sun-icon')).toBeInTheDocument()
      expect(screen.getByTestId('moon-icon')).toBeInTheDocument()
      expect(screen.getByTestId('laptop-icon')).toBeInTheDocument()
    })

    it('passes current value to Dropdown', () => {
      mockTheme.theme = 'dark'
      render(<ThemeToggle />)
      
      const dropdown = screen.getByTestId('theme-dropdown')
      expect(dropdown).toHaveAttribute('data-value', 'dark')
    })

    it('passes onChange handler to Dropdown', async () => {
      const user = userEvent.setup()
      render(<ThemeToggle />)
      
      // Test that onChange works by selecting a different theme
      const systemOption = screen.getByTestId('theme-option-system')
      await user.click(systemOption)
      
      expect(mockSetTheme).toHaveBeenCalledWith('system')
      expect(mockSetTheme).toHaveBeenCalledTimes(1)
    })
  })

  describe('Theme Type Casting', () => {
    it('properly casts string values to theme types', async () => {
      const user = userEvent.setup()
      render(<ThemeToggle />)
      
      // Test all theme options to ensure proper type casting
      await user.click(screen.getByTestId('theme-option-light'))
      expect(mockSetTheme).toHaveBeenCalledWith('light')
      
      await user.click(screen.getByTestId('theme-option-dark'))
      expect(mockSetTheme).toHaveBeenCalledWith('dark')
      
      await user.click(screen.getByTestId('theme-option-system'))
      expect(mockSetTheme).toHaveBeenCalledWith('system')
      
      expect(mockSetTheme).toHaveBeenCalledTimes(3)
    })
  })

  describe('Component Dependencies', () => {
    it('uses theme context correctly', () => {
      const { useTheme } = require('@/contexts/ThemeContext')
      render(<ThemeToggle />)
      
      expect(useTheme).toHaveBeenCalled()
    })

    it('imports Dropdown from UI components', () => {
      render(<ThemeToggle />)
      
      expect(screen.getByTestId('theme-dropdown')).toBeInTheDocument()
    })

    it('uses correct icon sizes', () => {
      render(<ThemeToggle />)
      
      expect(screen.getByTestId('sun-icon')).toHaveAttribute('data-size', '16')
      expect(screen.getByTestId('moon-icon')).toHaveAttribute('data-size', '16')
      expect(screen.getByTestId('laptop-icon')).toHaveAttribute('data-size', '16')
    })
  })

  describe('Edge Cases', () => {
    it('handles undefined theme gracefully', () => {
      mockTheme.theme = undefined as any
      
      expect(() => render(<ThemeToggle />)).not.toThrow()
      
      const dropdown = screen.getByTestId('theme-dropdown')
      expect(dropdown).toHaveAttribute('data-value', '')
    })

    it('handles invalid theme value', () => {
      mockTheme.theme = 'invalid' as any
      
      expect(() => render(<ThemeToggle />)).not.toThrow()
      
      const dropdown = screen.getByTestId('theme-dropdown')
      expect(dropdown).toHaveAttribute('data-value', 'invalid')
    })

    it('handles missing setTheme function', () => {
      mockTheme.setTheme = undefined as any
      
      expect(() => render(<ThemeToggle />)).not.toThrow()
    })
  })
})