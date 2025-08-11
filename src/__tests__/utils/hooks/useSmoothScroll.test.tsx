import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useSmoothScroll } from '@/utils/hooks/useSmoothScroll'

// Mock DOM methods
beforeEach(() => {
  // Reset mocks
  vi.clearAllMocks()
  
  // Mock window.scrollTo
  Object.defineProperty(window, 'scrollTo', {
    value: vi.fn(),
    writable: true,
  })

  // Mock document.getElementById
  Object.defineProperty(document, 'getElementById', {
    value: vi.fn(),
    writable: true,
  })
})

describe('useSmoothScroll Hook', () => {
  describe('scrollToElement', () => {
    it('scrolls to element when element exists', () => {
      const mockElement = {
        scrollIntoView: vi.fn(),
      }
      
      vi.mocked(document.getElementById).mockReturnValue(mockElement as any)
      
      const { result } = renderHook(() => useSmoothScroll())
      
      act(() => {
        result.current.scrollToElement('test-section')
      })
      
      expect(document.getElementById).toHaveBeenCalledWith('test-section')
      expect(mockElement.scrollIntoView).toHaveBeenCalledWith({
        behavior: 'smooth',
        block: 'start',
      })
    })

    it('does nothing when element does not exist', () => {
      vi.mocked(document.getElementById).mockReturnValue(null)
      
      const { result } = renderHook(() => useSmoothScroll())
      
      act(() => {
        result.current.scrollToElement('non-existent')
      })
      
      expect(document.getElementById).toHaveBeenCalledWith('non-existent')
      // Should not throw an error
    })

    it('handles elements with scrollIntoView method', () => {
      const mockScrollIntoView = vi.fn()
      const mockElement = {
        scrollIntoView: mockScrollIntoView,
      }
      
      vi.mocked(document.getElementById).mockReturnValue(mockElement as any)
      
      const { result } = renderHook(() => useSmoothScroll())
      
      act(() => {
        result.current.scrollToElement('header')
      })
      
      expect(mockScrollIntoView).toHaveBeenCalledWith({
        behavior: 'smooth',
        block: 'start',
      })
    })
  })

  describe('scrollToTop', () => {
    it('scrolls to top of page', () => {
      const { result } = renderHook(() => useSmoothScroll())
      
      act(() => {
        result.current.scrollToTop()
      })
      
      expect(window.scrollTo).toHaveBeenCalledWith({
        top: 0,
        behavior: 'smooth',
      })
    })

    it('calls window.scrollTo with correct parameters', () => {
      const { result } = renderHook(() => useSmoothScroll())
      
      act(() => {
        result.current.scrollToTop()
      })
      
      expect(window.scrollTo).toHaveBeenCalledTimes(1)
      expect(window.scrollTo).toHaveBeenCalledWith(
        expect.objectContaining({
          top: 0,
          behavior: 'smooth',
        })
      )
    })
  })

  describe('Hook Stability', () => {
    it('returns stable function references', () => {
      const { result, rerender } = renderHook(() => useSmoothScroll())
      
      const firstScrollToElement = result.current.scrollToElement
      const firstScrollToTop = result.current.scrollToTop
      
      rerender()
      
      expect(result.current.scrollToElement).toBe(firstScrollToElement)
      expect(result.current.scrollToTop).toBe(firstScrollToTop)
    })

    it('returns an object with expected methods', () => {
      const { result } = renderHook(() => useSmoothScroll())
      
      expect(result.current).toEqual({
        scrollToElement: expect.any(Function),
        scrollToTop: expect.any(Function),
      })
    })
  })

  describe('Edge Cases', () => {
    it('handles empty string element ID', () => {
      vi.mocked(document.getElementById).mockReturnValue(null)
      
      const { result } = renderHook(() => useSmoothScroll())
      
      expect(() => {
        act(() => {
          result.current.scrollToElement('')
        })
      }).not.toThrow()
      
      expect(document.getElementById).toHaveBeenCalledWith('')
    })

    it('handles multiple calls to scrollToElement', () => {
      const mockElement1 = { scrollIntoView: vi.fn() }
      const mockElement2 = { scrollIntoView: vi.fn() }
      
      vi.mocked(document.getElementById)
        .mockReturnValueOnce(mockElement1 as any)
        .mockReturnValueOnce(mockElement2 as any)
      
      const { result } = renderHook(() => useSmoothScroll())
      
      act(() => {
        result.current.scrollToElement('section1')
        result.current.scrollToElement('section2')
      })
      
      expect(document.getElementById).toHaveBeenCalledTimes(2)
      expect(mockElement1.scrollIntoView).toHaveBeenCalledTimes(1)
      expect(mockElement2.scrollIntoView).toHaveBeenCalledTimes(1)
    })

    it('handles multiple calls to scrollToTop', () => {
      const { result } = renderHook(() => useSmoothScroll())
      
      act(() => {
        result.current.scrollToTop()
        result.current.scrollToTop()
      })
      
      expect(window.scrollTo).toHaveBeenCalledTimes(2)
    })
  })
})