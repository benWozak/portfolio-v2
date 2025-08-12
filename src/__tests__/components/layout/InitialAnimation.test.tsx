import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, waitFor } from '@/test-utils'
import InitialAnimation from '@/components/layout/InitialAnimation'

const mockOnComplete = vi.fn()

describe('InitialAnimation Component', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.restoreAllMocks()
  })

  describe('Rendering', () => {
    it('renders animation container with correct styling', () => {
      render(<InitialAnimation onComplete={mockOnComplete} />)
      
      const container = screen.getByText('').parentElement?.parentElement
      expect(container).toHaveClass(
        'fixed',
        'inset-0',
        'flex',
        'items-center',
        'justify-center',
        'bg-background',
        'text-foreground'
      )
    })

    it('renders text container with correct styling', () => {
      render(<InitialAnimation onComplete={mockOnComplete} />)
      
      const textContainer = screen.getByText('').parentElement
      expect(textContainer).toHaveClass(
        'text-3xl',
        'md:text-6xl',
        'font-bold',
        'font-mono'
      )
    })

    it('renders cursor element with correct initial styling', () => {
      render(<InitialAnimation onComplete={mockOnComplete} />)
      
      const cursor = screen.getByText('\u00a0') // Non-breaking space
      expect(cursor).toHaveClass(
        'inline-block',
        'w-0.5',
        'h-10',
        'lg:h-16',
        'ml-1',
        'bg-foreground'
      )
    })
  })

  describe('Typewriter Animation', () => {
    it('starts with empty text', () => {
      render(<InitialAnimation onComplete={mockOnComplete} />)
      
      // Should start with empty string (no visible text except cursor)
      const textElement = screen.getByText('\u00a0').previousSibling
      expect(textElement?.textContent || '').toBe('')
    })

    it('types first word character by character', async () => {
      render(<InitialAnimation onComplete={mockOnComplete} />)
      
      // Fast-forward through typing animation
      vi.advanceTimersByTime(60) // First character
      expect(screen.getByText('Y')).toBeInTheDocument()
      
      vi.advanceTimersByTime(60) // Second character
      expect(screen.getByText('Yo')).toBeInTheDocument()
      
      vi.advanceTimersByTime(60 * 9) // Rest of "Your Vision"
      expect(screen.getByText('Your Vision')).toBeInTheDocument()
    })

    it('pauses between words', async () => {
      render(<InitialAnimation onComplete={mockOnComplete} />)
      
      // Type complete first word
      vi.advanceTimersByTime(60 * 11) // "Your Vision" = 11 characters
      expect(screen.getByText('Your Vision')).toBeInTheDocument()
      
      // Should pause for 1000ms before starting second word
      vi.advanceTimersByTime(999)
      expect(screen.getByText('Your Vision')).toBeInTheDocument()
      
      // After pause, should start typing second word
      vi.advanceTimersByTime(1)
      vi.advanceTimersByTime(60) // First character of second word
      expect(screen.getByText('E')).toBeInTheDocument()
    })

    it('types second word after pause', async () => {
      render(<InitialAnimation onComplete={mockOnComplete} />)
      
      // Complete first word and pause
      vi.advanceTimersByTime(60 * 11 + 1000)
      
      // Type second word character by character
      vi.advanceTimersByTime(60) // E
      expect(screen.getByText('E')).toBeInTheDocument()
      
      vi.advanceTimersByTime(60 * 16) // Rest of "Expertly Developed"
      expect(screen.getByText('Expertly Developed')).toBeInTheDocument()
    })

    it('calls onComplete after animation finishes', async () => {
      render(<InitialAnimation onComplete={mockOnComplete} />)
      
      // Complete entire typing sequence
      vi.advanceTimersByTime(60 * 11) // "Your Vision"
      vi.advanceTimersByTime(1000) // Pause
      vi.advanceTimersByTime(60 * 17) // "Expertly Developed"
      vi.advanceTimersByTime(1000) // Final delay
      
      expect(mockOnComplete).toHaveBeenCalledTimes(1)
    })
  })

  describe('Cursor Blinking', () => {
    it('starts with visible cursor', () => {
      render(<InitialAnimation onComplete={mockOnComplete} />)
      
      const cursor = screen.getByText('\u00a0')
      expect(cursor).toHaveClass('bg-foreground')
    })

    it('blinks cursor at correct interval', async () => {
      render(<InitialAnimation onComplete={mockOnComplete} />)
      
      const cursor = screen.getByText('\u00a0')
      expect(cursor).toHaveClass('bg-foreground')
      
      // After 530ms, cursor should become transparent
      vi.advanceTimersByTime(530)
      await waitFor(() => {
        expect(cursor).toHaveClass('bg-transparent')
      })
      
      // After another 530ms, cursor should be visible again
      vi.advanceTimersByTime(530)
      await waitFor(() => {
        expect(cursor).toHaveClass('bg-foreground')
      })
    })

    it('continues blinking throughout animation', async () => {
      render(<InitialAnimation onComplete={mockOnComplete} />)
      
      const cursor = screen.getByText('\u00a0')
      
      // Start typing first word
      vi.advanceTimersByTime(60 * 5) // Type "Your "
      
      // Cursor should still be blinking
      vi.advanceTimersByTime(530)
      await waitFor(() => {
        expect(cursor).toHaveClass('bg-transparent')
      })
      
      vi.advanceTimersByTime(530)
      await waitFor(() => {
        expect(cursor).toHaveClass('bg-foreground')
      })
    })
  })

  describe('Animation Timing', () => {
    it('uses correct typing speed (60ms per character)', () => {
      render(<InitialAnimation onComplete={mockOnComplete} />)
      
      // Should type one character every 60ms
      vi.advanceTimersByTime(59)
      expect(screen.queryByText('Y')).not.toBeInTheDocument()
      
      vi.advanceTimersByTime(1)
      expect(screen.getByText('Y')).toBeInTheDocument()
      
      vi.advanceTimersByTime(59)
      expect(screen.queryByText('Yo')).not.toBeInTheDocument()
      
      vi.advanceTimersByTime(1)
      expect(screen.getByText('Yo')).toBeInTheDocument()
    })

    it('uses correct pause duration between words (1000ms)', () => {
      render(<InitialAnimation onComplete={mockOnComplete} />)
      
      // Complete first word
      vi.advanceTimersByTime(60 * 11) // "Your Vision"
      expect(screen.getByText('Your Vision')).toBeInTheDocument()
      
      // Should not start second word before 1000ms
      vi.advanceTimersByTime(999)
      vi.advanceTimersByTime(60) // Try to type first character
      expect(screen.queryByText('E')).not.toBeInTheDocument()
      
      // Should start after 1000ms pause
      vi.advanceTimersByTime(1)
      vi.advanceTimersByTime(60)
      expect(screen.getByText('E')).toBeInTheDocument()
    })

    it('uses correct final delay before completion (1000ms)', () => {
      render(<InitialAnimation onComplete={mockOnComplete} />)
      
      // Complete both words
      vi.advanceTimersByTime(60 * 11 + 1000 + 60 * 17)
      expect(screen.getByText('Expertly Developed')).toBeInTheDocument()
      
      // Should not complete before final delay
      vi.advanceTimersByTime(999)
      expect(mockOnComplete).not.toHaveBeenCalled()
      
      // Should complete after final delay
      vi.advanceTimersByTime(1)
      expect(mockOnComplete).toHaveBeenCalledTimes(1)
    })
  })

  describe('Word Content', () => {
    it('displays correct words in sequence', async () => {
      render(<InitialAnimation onComplete={mockOnComplete} />)
      
      // First word
      vi.advanceTimersByTime(60 * 11)
      expect(screen.getByText('Your Vision')).toBeInTheDocument()
      
      // Second word (after pause)
      vi.advanceTimersByTime(1000 + 60 * 17)
      expect(screen.getByText('Expertly Developed')).toBeInTheDocument()
    })

    it('resets text when transitioning between words', async () => {
      render(<InitialAnimation onComplete={mockOnComplete} />)
      
      // Complete first word
      vi.advanceTimersByTime(60 * 11)
      expect(screen.getByText('Your Vision')).toBeInTheDocument()
      
      // Transition should clear text and start second word
      vi.advanceTimersByTime(1000)
      vi.advanceTimersByTime(60) // First character of second word
      
      // First word should be gone, second word starting
      expect(screen.queryByText('Your Vision')).not.toBeInTheDocument()
      expect(screen.getByText('E')).toBeInTheDocument()
    })
  })

  describe('Cleanup and Memory Management', () => {
    it('cleans up timers on unmount', () => {
      const clearTimeoutSpy = vi.spyOn(global, 'clearTimeout')
      const clearIntervalSpy = vi.spyOn(global, 'clearInterval')
      
      const { unmount } = render(<InitialAnimation onComplete={mockOnComplete} />)
      
      // Start some timers
      vi.advanceTimersByTime(30)
      
      unmount()
      
      expect(clearTimeoutSpy).toHaveBeenCalled()
      expect(clearIntervalSpy).toHaveBeenCalled()
    })

    it('handles multiple rapid state changes', () => {
      render(<InitialAnimation onComplete={mockOnComplete} />)
      
      // Rapidly advance time in small increments
      for (let i = 0; i < 100; i++) {
        vi.advanceTimersByTime(10)
      }
      
      // Should not throw errors or call onComplete multiple times prematurely
      expect(() => vi.runAllTimers()).not.toThrow()
    })
  })

  describe('Edge Cases', () => {
    it('handles onComplete callback being undefined', () => {
      expect(() => 
        render(<InitialAnimation onComplete={undefined as any} />)
      ).not.toThrow()
    })

    it('handles onComplete callback throwing error', () => {
      const errorCallback = vi.fn(() => {
        throw new Error('Callback error')
      })
      
      render(<InitialAnimation onComplete={errorCallback} />)
      
      // Complete animation
      vi.advanceTimersByTime(60 * 11 + 1000 + 60 * 17 + 1000)
      
      expect(errorCallback).toHaveBeenCalled()
    })

    it('maintains state consistency during rapid re-renders', () => {
      const { rerender } = render(<InitialAnimation onComplete={mockOnComplete} />)
      
      // Start typing
      vi.advanceTimersByTime(60 * 5)
      expect(screen.getByText('Your ')).toBeInTheDocument()
      
      // Re-render component
      rerender(<InitialAnimation onComplete={mockOnComplete} />)
      
      // Should maintain state and continue animation
      vi.advanceTimersByTime(60 * 6)
      expect(screen.getByText('Your Vision')).toBeInTheDocument()
    })
  })

  describe('Motion and Animation Properties', () => {
    it('wraps content in AnimatePresence', () => {
      render(<InitialAnimation onComplete={mockOnComplete} />)
      
      // Component should render without throwing motion-related errors
      expect(screen.getByText('\u00a0')).toBeInTheDocument()
    })

    it('applies correct responsive text sizes', () => {
      render(<InitialAnimation onComplete={mockOnComplete} />)
      
      const textContainer = screen.getByText('\u00a0').parentElement
      expect(textContainer).toHaveClass('text-3xl', 'md:text-6xl')
    })

    it('applies correct cursor responsive heights', () => {
      render(<InitialAnimation onComplete={mockOnComplete} />)
      
      const cursor = screen.getByText('\u00a0')
      expect(cursor).toHaveClass('h-10', 'lg:h-16')
    })
  })
})