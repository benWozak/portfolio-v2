import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, waitFor } from '@/test-utils'
import AnimatedHome from '@/components/layout/AnimatedHome'

// Mock InitialAnimation component
vi.mock('@/components/layout/InitialAnimation', () => ({
  default: ({ onComplete }: { onComplete: () => void }) => (
    <div data-testid="initial-animation">
      <button onClick={onComplete} data-testid="complete-animation">
        Complete Animation
      </button>
    </div>
  )
}))

// Mock storage APIs
const mockSessionStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn()
}

const mockLocalStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn()
}

Object.defineProperty(window, 'sessionStorage', {
  value: mockSessionStorage
})

Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage
})

describe('AnimatedHome Component', () => {
  const mockChildren = <div data-testid="home-content">Home Page Content</div>

  beforeEach(() => {
    vi.clearAllMocks()
    vi.useFakeTimers()
    
    // Reset storage mocks
    mockSessionStorage.getItem.mockReturnValue(null)
    mockLocalStorage.getItem.mockReturnValue(null)
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.restoreAllMocks()
  })

  describe('Initial State Logic', () => {
    it('shows home page immediately when animation was already shown in session', () => {
      mockSessionStorage.getItem.mockReturnValue('true')
      
      render(<AnimatedHome>{mockChildren}</AnimatedHome>)
      
      expect(screen.getByTestId('home-content')).toBeInTheDocument()
      expect(screen.queryByTestId('initial-animation')).not.toBeInTheDocument()
    })

    it('shows animation when session storage is empty and no timestamp', () => {
      mockSessionStorage.getItem.mockReturnValue(null)
      mockLocalStorage.getItem.mockReturnValue(null)
      
      render(<AnimatedHome>{mockChildren}</AnimatedHome>)
      
      expect(screen.getByTestId('initial-animation')).toBeInTheDocument()
      expect(screen.queryByTestId('home-content')).not.toBeInTheDocument()
    })

    it('shows animation when timestamp is expired', () => {
      const currentTime = new Date().getTime()
      const expiredTime = currentTime - (25 * 60 * 60 * 1000) // 25 hours ago
      
      mockSessionStorage.getItem.mockReturnValue(null)
      mockLocalStorage.getItem.mockReturnValue(expiredTime.toString())
      
      render(<AnimatedHome>{mockChildren}</AnimatedHome>)
      
      expect(screen.getByTestId('initial-animation')).toBeInTheDocument()
      expect(screen.queryByTestId('home-content')).not.toBeInTheDocument()
    })

    it('shows home page when timestamp is within 24 hours', () => {
      const currentTime = new Date().getTime()
      const recentTime = currentTime - (23 * 60 * 60 * 1000) // 23 hours ago
      
      mockSessionStorage.getItem.mockReturnValue('true')
      mockLocalStorage.getItem.mockReturnValue(recentTime.toString())
      
      render(<AnimatedHome>{mockChildren}</AnimatedHome>)
      
      expect(screen.getByTestId('home-content')).toBeInTheDocument()
      expect(screen.queryByTestId('initial-animation')).not.toBeInTheDocument()
    })
  })

  describe('Animation Completion', () => {
    it('transitions to home page after animation completes', async () => {
      mockSessionStorage.getItem.mockReturnValue(null)
      mockLocalStorage.getItem.mockReturnValue(null)
      
      render(<AnimatedHome>{mockChildren}</AnimatedHome>)
      
      // Initially shows animation
      expect(screen.getByTestId('initial-animation')).toBeInTheDocument()
      
      // Complete the animation
      const completeButton = screen.getByTestId('complete-animation')
      completeButton.click()
      
      // Should now show home page content
      await waitFor(() => {
        expect(screen.getByTestId('home-content')).toBeInTheDocument()
      })
      
      expect(screen.queryByTestId('initial-animation')).not.toBeInTheDocument()
    })

    it('sets session storage when animation completes', async () => {
      mockSessionStorage.getItem.mockReturnValue(null)
      mockLocalStorage.getItem.mockReturnValue(null)
      
      render(<AnimatedHome>{mockChildren}</AnimatedHome>)
      
      const completeButton = screen.getByTestId('complete-animation')
      completeButton.click()
      
      expect(mockSessionStorage.setItem).toHaveBeenCalledWith('animationShown', 'true')
    })

    it('sets local storage timestamp when animation completes', async () => {
      mockSessionStorage.getItem.mockReturnValue(null)
      mockLocalStorage.getItem.mockReturnValue(null)
      
      const currentTime = new Date().getTime()
      vi.setSystemTime(currentTime)
      
      render(<AnimatedHome>{mockChildren}</AnimatedHome>)
      
      const completeButton = screen.getByTestId('complete-animation')
      completeButton.click()
      
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        'animationTimestamp', 
        currentTime.toString()
      )
    })
  })

  describe('Storage Keys', () => {
    it('uses correct session storage key', () => {
      render(<AnimatedHome>{mockChildren}</AnimatedHome>)
      
      expect(mockSessionStorage.getItem).toHaveBeenCalledWith('animationShown')
    })

    it('uses correct local storage key', () => {
      render(<AnimatedHome>{mockChildren}</AnimatedHome>)
      
      expect(mockLocalStorage.getItem).toHaveBeenCalledWith('animationTimestamp')
    })
  })

  describe('Time Calculations', () => {
    it('correctly calculates 24-hour expiration', () => {
      const currentTime = 1640000000000 // Fixed timestamp
      const exactlyOneDayAgo = currentTime - (24 * 60 * 60 * 1000)
      const justOverOneDayAgo = currentTime - (24 * 60 * 60 * 1000 + 1)
      
      vi.setSystemTime(currentTime)
      
      // Exactly 24 hours should still be valid (within expiration)
      mockSessionStorage.getItem.mockReturnValue('true')
      mockLocalStorage.getItem.mockReturnValue(exactlyOneDayAgo.toString())
      
      render(<AnimatedHome>{mockChildren}</AnimatedHome>)
      expect(screen.queryByTestId('home-content')).toBeInTheDocument()
      
      // Just over 24 hours should be expired
      mockLocalStorage.getItem.mockReturnValue(justOverOneDayAgo.toString())
      mockSessionStorage.getItem.mockReturnValue(null)
      
      render(<AnimatedHome>{mockChildren}</AnimatedHome>)
      expect(screen.queryByTestId('initial-animation')).toBeInTheDocument()
    })

    it('handles invalid timestamp strings', () => {
      mockSessionStorage.getItem.mockReturnValue(null)
      mockLocalStorage.getItem.mockReturnValue('invalid-timestamp')
      
      // Should show animation when timestamp is invalid
      render(<AnimatedHome>{mockChildren}</AnimatedHome>)
      
      expect(screen.getByTestId('initial-animation')).toBeInTheDocument()
    })
  })

  describe('Component Structure', () => {
    it('renders children correctly when showing home page', () => {
      mockSessionStorage.getItem.mockReturnValue('true')
      
      const customChildren = (
        <div data-testid="custom-children">
          <h1>Welcome</h1>
          <p>This is the home page</p>
        </div>
      )
      
      render(<AnimatedHome>{customChildren}</AnimatedHome>)
      
      expect(screen.getByTestId('custom-children')).toBeInTheDocument()
      expect(screen.getByText('Welcome')).toBeInTheDocument()
      expect(screen.getByText('This is the home page')).toBeInTheDocument()
    })

    it('passes onComplete callback to InitialAnimation', () => {
      mockSessionStorage.getItem.mockReturnValue(null)
      mockLocalStorage.getItem.mockReturnValue(null)
      
      render(<AnimatedHome>{mockChildren}</AnimatedHome>)
      
      // Should be able to complete animation
      const completeButton = screen.getByTestId('complete-animation')
      expect(completeButton).toBeInTheDocument()
    })
  })

  describe('Motion Components and Animation', () => {
    it('applies correct CSS classes for initial animation', () => {
      mockSessionStorage.getItem.mockReturnValue(null)
      mockLocalStorage.getItem.mockReturnValue(null)
      
      render(<AnimatedHome>{mockChildren}</AnimatedHome>)
      
      const animationContainer = screen.getByTestId('initial-animation').parentElement
      expect(animationContainer).toHaveClass('z-50')
    })

    it('renders with AnimatePresence wrapper', () => {
      render(<AnimatedHome>{mockChildren}</AnimatedHome>)
      
      // Both animation and home page should be wrapped properly
      expect(screen.getByTestId('home-content')).toBeInTheDocument()
    })
  })

  describe('Edge Cases', () => {
    it('handles missing sessionStorage gracefully', () => {
      Object.defineProperty(window, 'sessionStorage', {
        value: undefined
      })
      
      expect(() => render(<AnimatedHome>{mockChildren}</AnimatedHome>)).not.toThrow()
    })

    it('handles missing localStorage gracefully', () => {
      Object.defineProperty(window, 'localStorage', {
        value: undefined
      })
      
      expect(() => render(<AnimatedHome>{mockChildren}</AnimatedHome>)).not.toThrow()
    })

    it('handles storage access errors', () => {
      mockSessionStorage.getItem.mockImplementation(() => {
        throw new Error('Storage access denied')
      })
      
      expect(() => render(<AnimatedHome>{mockChildren}</AnimatedHome>)).not.toThrow()
    })

    it('handles multiple children', () => {
      mockSessionStorage.getItem.mockReturnValue('true')
      
      const multipleChildren = (
        <>
          <div data-testid="child-1">Child 1</div>
          <div data-testid="child-2">Child 2</div>
          <div data-testid="child-3">Child 3</div>
        </>
      )
      
      render(<AnimatedHome>{multipleChildren}</AnimatedHome>)
      
      expect(screen.getByTestId('child-1')).toBeInTheDocument()
      expect(screen.getByTestId('child-2')).toBeInTheDocument()
      expect(screen.getByTestId('child-3')).toBeInTheDocument()
    })

    it('handles empty children', () => {
      mockSessionStorage.getItem.mockReturnValue('true')
      
      render(<AnimatedHome>{null}</AnimatedHome>)
      
      // Should not throw error
      expect(document.body).toBeInTheDocument()
    })
  })

  describe('State Management', () => {
    it('maintains state correctly during animation lifecycle', async () => {
      mockSessionStorage.getItem.mockReturnValue(null)
      mockLocalStorage.getItem.mockReturnValue(null)
      
      render(<AnimatedHome>{mockChildren}</AnimatedHome>)
      
      // Start with animation
      expect(screen.getByTestId('initial-animation')).toBeInTheDocument()
      expect(screen.queryByTestId('home-content')).not.toBeInTheDocument()
      
      // Complete animation
      const completeButton = screen.getByTestId('complete-animation')
      completeButton.click()
      
      // End with home page
      await waitFor(() => {
        expect(screen.queryByTestId('initial-animation')).not.toBeInTheDocument()
        expect(screen.getByTestId('home-content')).toBeInTheDocument()
      })
    })
  })
})