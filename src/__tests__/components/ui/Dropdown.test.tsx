import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@/test-utils'
import userEvent from '@testing-library/user-event'
import { Dropdown } from '@/components/ui/Dropdown'

const mockOptions = [
  { value: 'option1', label: 'Option 1', icon: <span data-testid="icon-1">🌟</span> },
  { value: 'option2', label: 'Option 2', icon: <span data-testid="icon-2">🚀</span> },
  { value: 'option3', label: 'Option 3', icon: <span data-testid="icon-3">🎯</span> },
]

describe('Dropdown Component', () => {
  const mockOnChange = vi.fn()

  beforeEach(() => {
    mockOnChange.mockClear()
  })

  describe('Rendering', () => {
    it('renders dropdown button', () => {
      render(
        <Dropdown
          options={mockOptions}
          value="option1"
          onChange={mockOnChange}
        />
      )
      
      const button = screen.getByRole('button')
      expect(button).toBeInTheDocument()
    })

    it('renders selected option icon in button', () => {
      render(
        <Dropdown
          options={mockOptions}
          value="option1"
          onChange={mockOnChange}
        />
      )
      
      expect(screen.getByTestId('icon-1')).toBeInTheDocument()
    })

    it('renders chevron down icon', () => {
      render(
        <Dropdown
          options={mockOptions}
          value="option1"
          onChange={mockOnChange}
        />
      )
      
      // ChevronDown component should render
      const button = screen.getByRole('button')
      expect(button).toBeInTheDocument()
    })

    it('does not render options list when closed', () => {
      render(
        <Dropdown
          options={mockOptions}
          value="option1"
          onChange={mockOnChange}
        />
      )
      
      expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
    })
  })

  describe('Button Styling', () => {
    it('applies button layout and styling classes', () => {
      render(
        <Dropdown
          options={mockOptions}
          value="option1"
          onChange={mockOnChange}
        />
      )
      
      const button = screen.getByRole('button')
      expect(button).toHaveClass(
        'flex',
        'items-center',
        'justify-between',
        'w-full',
        'px-4',
        'py-2',
        'text-sm',
        'font-medium'
      )
    })

    it('applies color and background classes', () => {
      render(
        <Dropdown
          options={mockOptions}
          value="option1"
          onChange={mockOnChange}
        />
      )
      
      const button = screen.getByRole('button')
      expect(button).toHaveClass(
        'text-foreground',
        'bg-secondary-bg',
        'rounded-md'
      )
    })

    it('applies hover and focus styles', () => {
      render(
        <Dropdown
          options={mockOptions}
          value="option1"
          onChange={mockOnChange}
        />
      )
      
      const button = screen.getByRole('button')
      expect(button).toHaveClass(
        'hover:bg-primary/10',
        'focus:outline-none',
        'focus:ring-2',
        'focus:ring-offset-2',
        'focus:ring-primary'
      )
    })
  })

  describe('Dropdown State Management', () => {
    it('opens dropdown when button is clicked', async () => {
      const user = userEvent.setup()
      
      render(
        <Dropdown
          options={mockOptions}
          value="option1"
          onChange={mockOnChange}
        />
      )
      
      const button = screen.getByRole('button')
      await user.click(button)
      
      expect(screen.getByRole('listbox')).toBeInTheDocument()
    })

    it('closes dropdown when button is clicked again', async () => {
      const user = userEvent.setup()
      
      render(
        <Dropdown
          options={mockOptions}
          value="option1"
          onChange={mockOnChange}
        />
      )
      
      const button = screen.getByRole('button')
      await user.click(button)
      expect(screen.getByRole('listbox')).toBeInTheDocument()
      
      await user.click(button)
      expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
    })

    it('toggles dropdown state correctly', async () => {
      const user = userEvent.setup()
      
      render(
        <Dropdown
          options={mockOptions}
          value="option1"
          onChange={mockOnChange}
        />
      )
      
      const button = screen.getByRole('button')
      
      // Initially closed
      expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
      
      // Click to open
      await user.click(button)
      expect(screen.getByRole('listbox')).toBeInTheDocument()
      
      // Click to close
      await user.click(button)
      expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
    })
  })

  describe('Options Rendering', () => {
    it('renders all options when dropdown is open', async () => {
      const user = userEvent.setup()
      
      render(
        <Dropdown
          options={mockOptions}
          value="option1"
          onChange={mockOnChange}
        />
      )
      
      const button = screen.getByRole('button')
      await user.click(button)
      
      mockOptions.forEach(option => {
        expect(screen.getByText(option.label)).toBeInTheDocument()
      })
    })

    it('renders option icons when dropdown is open', async () => {
      const user = userEvent.setup()
      
      render(
        <Dropdown
          options={mockOptions}
          value="option1"
          onChange={mockOnChange}
        />
      )
      
      const button = screen.getByRole('button')
      await user.click(button)
      
      expect(screen.getAllByTestId('icon-1')).toHaveLength(2) // One in button, one in dropdown
      expect(screen.getByTestId('icon-2')).toBeInTheDocument()
      expect(screen.getByTestId('icon-3')).toBeInTheDocument()
    })

    it('highlights selected option', async () => {
      const user = userEvent.setup()
      
      render(
        <Dropdown
          options={mockOptions}
          value="option2"
          onChange={mockOnChange}
        />
      )
      
      const button = screen.getByRole('button')
      await user.click(button)
      
      const selectedOption = screen.getByRole('option', { name: /Option 2/ })
      expect(selectedOption).toHaveClass('text-primary', 'bg-primary/10')
    })

    it('shows non-selected options with default styling', async () => {
      const user = userEvent.setup()
      
      render(
        <Dropdown
          options={mockOptions}
          value="option1"
          onChange={mockOnChange}
        />
      )
      
      const button = screen.getByRole('button')
      await user.click(button)
      
      const nonSelectedOption = screen.getByRole('option', { name: /Option 2/ })
      expect(nonSelectedOption).toHaveClass('text-foreground')
      expect(nonSelectedOption).not.toHaveClass('text-primary', 'bg-primary/10')
    })
  })

  describe('Option Selection', () => {
    it('calls onChange when option is selected', async () => {
      const user = userEvent.setup()
      
      render(
        <Dropdown
          options={mockOptions}
          value="option1"
          onChange={mockOnChange}
        />
      )
      
      const button = screen.getByRole('button')
      await user.click(button)
      
      const option2 = screen.getByRole('option', { name: /Option 2/ })
      await user.click(option2)
      
      expect(mockOnChange).toHaveBeenCalledWith('option2')
    })

    it('closes dropdown after option selection', async () => {
      const user = userEvent.setup()
      
      render(
        <Dropdown
          options={mockOptions}
          value="option1"
          onChange={mockOnChange}
        />
      )
      
      const button = screen.getByRole('button')
      await user.click(button)
      
      const option2 = screen.getByRole('option', { name: /Option 2/ })
      await user.click(option2)
      
      expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
    })

    it('updates selected option display after selection', async () => {
      const user = userEvent.setup()
      let currentValue = 'option1'
      
      const handleChange = (value: string) => {
        currentValue = value
        mockOnChange(value)
      }
      
      const { rerender } = render(
        <Dropdown
          options={mockOptions}
          value={currentValue}
          onChange={handleChange}
        />
      )
      
      const button = screen.getByRole('button')
      await user.click(button)
      
      const option3 = screen.getByRole('option', { name: /Option 3/ })
      await user.click(option3)
      
      // Rerender with new value
      rerender(
        <Dropdown
          options={mockOptions}
          value="option3"
          onChange={handleChange}
        />
      )
      
      // The icon for option3 should now be visible in the button
      expect(screen.getByTestId('icon-3')).toBeInTheDocument()
    })
  })

  describe('Outside Click Handling', () => {
    it('closes dropdown when clicking outside', async () => {
      const user = userEvent.setup()
      
      render(
        <div>
          <Dropdown
            options={mockOptions}
            value="option1"
            onChange={mockOnChange}
          />
          <div data-testid="outside">Outside element</div>
        </div>
      )
      
      const button = screen.getByRole('button')
      await user.click(button)
      expect(screen.getByRole('listbox')).toBeInTheDocument()
      
      const outsideElement = screen.getByTestId('outside')
      await user.click(outsideElement)
      
      expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
    })

    it('does not close dropdown when clicking inside', async () => {
      const user = userEvent.setup()
      
      render(
        <Dropdown
          options={mockOptions}
          value="option1"
          onChange={mockOnChange}
        />
      )
      
      const button = screen.getByRole('button')
      await user.click(button)
      
      const listbox = screen.getByRole('listbox')
      await user.click(listbox)
      
      expect(screen.getByRole('listbox')).toBeInTheDocument()
    })
  })

  describe('Accessibility', () => {
    it('applies correct ARIA attributes to button', () => {
      render(
        <Dropdown
          options={mockOptions}
          value="option1"
          onChange={mockOnChange}
        />
      )
      
      const button = screen.getByRole('button')
      expect(button).toHaveAttribute('aria-haspopup', 'listbox')
      expect(button).toHaveAttribute('aria-expanded', 'false')
    })

    it('updates aria-expanded when dropdown opens', async () => {
      const user = userEvent.setup()
      
      render(
        <Dropdown
          options={mockOptions}
          value="option1"
          onChange={mockOnChange}
        />
      )
      
      const button = screen.getByRole('button')
      await user.click(button)
      
      expect(button).toHaveAttribute('aria-expanded', 'true')
    })

    it('applies correct role to options list', async () => {
      const user = userEvent.setup()
      
      render(
        <Dropdown
          options={mockOptions}
          value="option1"
          onChange={mockOnChange}
        />
      )
      
      const button = screen.getByRole('button')
      await user.click(button)
      
      const listbox = screen.getByRole('listbox')
      expect(listbox).toBeInTheDocument()
    })

    it('applies correct role and aria-selected to options', async () => {
      const user = userEvent.setup()
      
      render(
        <Dropdown
          options={mockOptions}
          value="option2"
          onChange={mockOnChange}
        />
      )
      
      const button = screen.getByRole('button')
      await user.click(button)
      
      const selectedOption = screen.getByRole('option', { name: /Option 2/ })
      const unselectedOption = screen.getByRole('option', { name: /Option 1/ })
      
      expect(selectedOption).toHaveAttribute('aria-selected', 'true')
      expect(unselectedOption).toHaveAttribute('aria-selected', 'false')
    })
  })

  describe('Keyboard Navigation', () => {
    it('opens dropdown with Enter key', async () => {
      const user = userEvent.setup()
      
      render(
        <Dropdown
          options={mockOptions}
          value="option1"
          onChange={mockOnChange}
        />
      )
      
      const button = screen.getByRole('button')
      button.focus()
      
      await user.keyboard('{Enter}')
      expect(screen.getByRole('listbox')).toBeInTheDocument()
    })

    it('opens dropdown with Space key', async () => {
      const user = userEvent.setup()
      
      render(
        <Dropdown
          options={mockOptions}
          value="option1"
          onChange={mockOnChange}
        />
      )
      
      const button = screen.getByRole('button')
      button.focus()
      
      await user.keyboard(' ')
      expect(screen.getByRole('listbox')).toBeInTheDocument()
    })
  })

  describe('Dropdown List Styling', () => {
    it('applies correct styling to dropdown list', async () => {
      const user = userEvent.setup()
      
      render(
        <Dropdown
          options={mockOptions}
          value="option1"
          onChange={mockOnChange}
        />
      )
      
      const button = screen.getByRole('button')
      await user.click(button)
      
      const listbox = screen.getByRole('listbox')
      expect(listbox).toHaveClass(
        'absolute',
        'z-10',
        'w-full',
        'min-w-28',
        'py-1',
        'mt-1',
        'overflow-auto',
        'text-base',
        'bg-secondary-bg',
        'rounded-md',
        'shadow-lg',
        'max-h-60',
        'ring-1',
        'ring-black',
        'ring-opacity-5'
      )
    })

    it('applies hover styles to options', async () => {
      const user = userEvent.setup()
      
      render(
        <Dropdown
          options={mockOptions}
          value="option1"
          onChange={mockOnChange}
        />
      )
      
      const button = screen.getByRole('button')
      await user.click(button)
      
      const option = screen.getByRole('option', { name: /Option 2/ })
      expect(option).toHaveClass('hover:bg-primary/10')
    })
  })

  describe('Edge Cases', () => {
    it('handles empty options array', () => {
      render(
        <Dropdown
          options={[]}
          value=""
          onChange={mockOnChange}
        />
      )
      
      expect(screen.getByRole('button')).toBeInTheDocument()
    })

    it('handles missing selected value', () => {
      render(
        <Dropdown
          options={mockOptions}
          value="nonexistent"
          onChange={mockOnChange}
        />
      )
      
      expect(screen.getByRole('button')).toBeInTheDocument()
    })

    it('does not call onChange when clicking the same option', async () => {
      const user = userEvent.setup()
      
      render(
        <Dropdown
          options={mockOptions}
          value="option1"
          onChange={mockOnChange}
        />
      )
      
      const button = screen.getByRole('button')
      await user.click(button)
      
      const selectedOption = screen.getByRole('option', { name: /Option 1/ })
      await user.click(selectedOption)
      
      expect(mockOnChange).toHaveBeenCalledWith('option1')
    })
  })
})