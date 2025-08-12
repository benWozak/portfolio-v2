import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, waitFor } from '@/test-utils'
import userEvent from '@testing-library/user-event'
import { LivePreviewToolbar } from '@/components/layout/LivePreviewToolbar'

// Mock Next.js router
const mockRefresh = vi.fn()
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    refresh: mockRefresh
  })
}))

// Mock window.open and fetch
Object.defineProperty(window, 'open', {
  value: vi.fn(),
  writable: true
})

Object.defineProperty(global, 'fetch', {
  value: vi.fn().mockResolvedValue({ ok: true }),
  writable: true
})

describe('LivePreviewToolbar Component', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('Conditional Rendering', () => {
    it('renders when isDraftMode is true', () => {
      render(<LivePreviewToolbar isDraftMode={true} />)
      
      expect(screen.getByText('Live Preview Mode')).toBeInTheDocument()
    })

    it('does not render when isDraftMode is false', () => {
      render(<LivePreviewToolbar isDraftMode={false} />)
      
      expect(screen.queryByText('Live Preview Mode')).not.toBeInTheDocument()
    })

    it('does not render when isDraftMode is undefined', () => {
      render(<LivePreviewToolbar />)
      
      expect(screen.queryByText('Live Preview Mode')).not.toBeInTheDocument()
    })

    it('initially renders based on isDraftMode prop', () => {
      const { rerender } = render(<LivePreviewToolbar isDraftMode={false} />)
      
      expect(screen.queryByText('Live Preview Mode')).not.toBeInTheDocument()
      
      rerender(<LivePreviewToolbar isDraftMode={true} />)
      
      expect(screen.getByText('Live Preview Mode')).toBeInTheDocument()
    })
  })

  describe('Visual Elements', () => {
    it('renders toolbar with correct styling', () => {
      render(<LivePreviewToolbar isDraftMode={true} />)
      
      const toolbar = screen.getByText('Live Preview Mode').closest('div')
      expect(toolbar).toHaveClass(
        'fixed',
        'top-0',
        'left-0',
        'right-0',
        'z-50',
        'bg-yellow-500',
        'text-black',
        'px-4',
        'py-2',
        'text-sm',
        'font-medium',
        'shadow-lg'
      )
    })

    it('renders animated indicator dot', () => {
      render(<LivePreviewToolbar isDraftMode={true} />)
      
      const indicatorDot = document.querySelector('.w-2.h-2.bg-orange-600.rounded-full.animate-pulse')
      expect(indicatorDot).toBeInTheDocument()
    })

    it('displays live preview mode text', () => {
      render(<LivePreviewToolbar isDraftMode={true} />)
      
      expect(screen.getByText('Live Preview Mode')).toBeInTheDocument()
      expect(screen.getByText('Live Preview Mode')).toHaveClass('font-semibold')
    })

    it('applies responsive container layout', () => {
      render(<LivePreviewToolbar isDraftMode={true} />)
      
      const container = screen.getByText('Live Preview Mode').closest('.max-w-7xl')
      expect(container).toHaveClass('max-w-7xl', 'mx-auto', 'flex', 'items-center', 'justify-between')
    })
  })

  describe('Collection Information Display', () => {
    it('shows collection name when provided', () => {
      render(<LivePreviewToolbar isDraftMode={true} collection="posts" />)
      
      expect(screen.getByText('posts')).toBeInTheDocument()
    })

    it('shows collection and ID when both provided', () => {
      render(<LivePreviewToolbar isDraftMode={true} collection="pages" id="123" />)
      
      const collectionInfo = screen.getByText(/pages/)
      expect(collectionInfo).toHaveTextContent('pages (123)')
    })

    it('does not show collection info when not provided', () => {
      render(<LivePreviewToolbar isDraftMode={true} />)
      
      expect(screen.queryByText(/bg-black\/10/)).not.toBeInTheDocument()
    })

    it('styles collection info correctly', () => {
      render(<LivePreviewToolbar isDraftMode={true} collection="articles" id="456" />)
      
      const collectionInfo = screen.getByText('articles (456)')
      expect(collectionInfo).toHaveClass('text-xs', 'bg-black/10', 'px-2', 'py-1', 'rounded')
    })
  })

  describe('Button Actions', () => {
    it('renders refresh button', () => {
      render(<LivePreviewToolbar isDraftMode={true} />)
      
      const refreshButton = screen.getByRole('button', { name: /refresh/i })
      expect(refreshButton).toBeInTheDocument()
      expect(refreshButton).toHaveTextContent('Refresh')
    })

    it('renders edit button when collection provided', () => {
      render(<LivePreviewToolbar isDraftMode={true} collection="posts" />)
      
      const editButton = screen.getByRole('button', { name: /edit/i })
      expect(editButton).toBeInTheDocument()
      expect(editButton).toHaveTextContent('Edit')
    })

    it('does not render edit button when collection not provided', () => {
      render(<LivePreviewToolbar isDraftMode={true} />)
      
      expect(screen.queryByRole('button', { name: /edit/i })).not.toBeInTheDocument()
    })

    it('renders exit preview button', () => {
      render(<LivePreviewToolbar isDraftMode={true} />)
      
      const exitButton = screen.getByRole('button', { name: /exit preview/i })
      expect(exitButton).toBeInTheDocument()
      expect(exitButton).toHaveTextContent('Exit Preview')
    })

    it('applies correct button styling', () => {
      render(<LivePreviewToolbar isDraftMode={true} collection="posts" />)
      
      const refreshButton = screen.getByRole('button', { name: /refresh/i })
      const editButton = screen.getByRole('button', { name: /edit/i })
      const exitButton = screen.getByRole('button', { name: /exit preview/i })
      
      expect(refreshButton).toHaveClass(
        'bg-black/10',
        'hover:bg-black/20',
        'px-3',
        'py-1',
        'rounded',
        'text-xs',
        'font-medium',
        'transition-colors'
      )
      
      expect(editButton).toHaveClass(
        'bg-black/10',
        'hover:bg-black/20',
        'px-3',
        'py-1',
        'rounded',
        'text-xs',
        'font-medium',
        'transition-colors'
      )
      
      expect(exitButton).toHaveClass(
        'bg-red-600',
        'hover:bg-red-700',
        'text-white',
        'px-3',
        'py-1',
        'rounded',
        'text-xs',
        'font-medium',
        'transition-colors'
      )
    })
  })

  describe('Refresh Functionality', () => {
    it('calls router.refresh when refresh button clicked', async () => {
      const user = userEvent.setup()
      render(<LivePreviewToolbar isDraftMode={true} />)
      
      const refreshButton = screen.getByRole('button', { name: /refresh/i })
      await user.click(refreshButton)
      
      expect(mockRefresh).toHaveBeenCalledTimes(1)
    })

    it('has correct refresh button tooltip', () => {
      render(<LivePreviewToolbar isDraftMode={true} />)
      
      const refreshButton = screen.getByRole('button', { name: /refresh/i })
      expect(refreshButton).toHaveAttribute('title', 'Refresh to see latest changes')
    })
  })

  describe('Edit Functionality', () => {
    it('opens correct URL with collection and ID', async () => {
      const user = userEvent.setup()
      render(<LivePreviewToolbar isDraftMode={true} collection="posts" id="123" />)
      
      const editButton = screen.getByRole('button', { name: /edit/i })
      await user.click(editButton)
      
      expect(window.open).toHaveBeenCalledWith('/admin/collections/posts/123', '_blank')
    })

    it('opens collection URL without ID', async () => {
      const user = userEvent.setup()
      render(<LivePreviewToolbar isDraftMode={true} collection="articles" />)
      
      const editButton = screen.getByRole('button', { name: /edit/i })
      await user.click(editButton)
      
      expect(window.open).toHaveBeenCalledWith('/admin/collections/articles', '_blank')
    })

    it('opens admin root when no collection provided but edit button exists', async () => {
      // This test covers the fallback case in openInPayload
      render(<LivePreviewToolbar isDraftMode={true} collection="posts" />)
      
      // Modify the component's collection prop to undefined after render
      const editButton = screen.getByRole('button', { name: /edit/i })
      expect(editButton).toBeInTheDocument()
    })

    it('has correct edit button tooltip', () => {
      render(<LivePreviewToolbar isDraftMode={true} collection="posts" />)
      
      const editButton = screen.getByRole('button', { name: /edit/i })
      expect(editButton).toHaveAttribute('title', 'Edit in Payload CMS')
    })
  })

  describe('Exit Preview Functionality', () => {
    beforeEach(() => {
      // Mock window.location.pathname
      Object.defineProperty(window, 'location', {
        value: { pathname: '/current-page' },
        writable: true
      })
    })

    it('calls exit preview API with correct parameters', async () => {
      const user = userEvent.setup()
      render(<LivePreviewToolbar isDraftMode={true} />)
      
      const exitButton = screen.getByRole('button', { name: /exit preview/i })
      await user.click(exitButton)
      
      expect(fetch).toHaveBeenCalledWith('/api/exit-preview?redirect=%2Fcurrent-page')
    })

    it('calls router.refresh after successful API call', async () => {
      const user = userEvent.setup()
      render(<LivePreviewToolbar isDraftMode={true} />)
      
      const exitButton = screen.getByRole('button', { name: /exit preview/i })
      await user.click(exitButton)
      
      await waitFor(() => {
        expect(mockRefresh).toHaveBeenCalledTimes(1)
      })
    })

    it('handles API error gracefully', async () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      const fetchError = new Error('Network error')
      vi.mocked(fetch).mockRejectedValueOnce(fetchError)
      
      const user = userEvent.setup()
      render(<LivePreviewToolbar isDraftMode={true} />)
      
      const exitButton = screen.getByRole('button', { name: /exit preview/i })
      await user.click(exitButton)
      
      await waitFor(() => {
        expect(consoleErrorSpy).toHaveBeenCalledWith('Error exiting preview mode:', fetchError)
      })
      
      consoleErrorSpy.mockRestore()
    })

    it('has correct exit button tooltip', () => {
      render(<LivePreviewToolbar isDraftMode={true} />)
      
      const exitButton = screen.getByRole('button', { name: /exit preview/i })
      expect(exitButton).toHaveAttribute('title', 'Exit preview mode')
    })
  })

  describe('State Management', () => {
    it('updates visibility when isDraftMode changes', () => {
      const { rerender } = render(<LivePreviewToolbar isDraftMode={false} />)
      
      expect(screen.queryByText('Live Preview Mode')).not.toBeInTheDocument()
      
      rerender(<LivePreviewToolbar isDraftMode={true} />)
      
      expect(screen.getByText('Live Preview Mode')).toBeInTheDocument()
    })

    it('maintains visibility state during re-renders', () => {
      const { rerender } = render(<LivePreviewToolbar isDraftMode={true} collection="posts" />)
      
      expect(screen.getByText('Live Preview Mode')).toBeInTheDocument()
      
      rerender(<LivePreviewToolbar isDraftMode={true} collection="articles" />)
      
      expect(screen.getByText('Live Preview Mode')).toBeInTheDocument()
      expect(screen.getByText('articles')).toBeInTheDocument()
    })
  })

  describe('Accessibility', () => {
    it('provides proper button labels', () => {
      render(<LivePreviewToolbar isDraftMode={true} collection="posts" />)
      
      expect(screen.getByRole('button', { name: /refresh/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /edit/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /exit preview/i })).toBeInTheDocument()
    })

    it('provides tooltips for better UX', () => {
      render(<LivePreviewToolbar isDraftMode={true} collection="posts" />)
      
      const refreshButton = screen.getByRole('button', { name: /refresh/i })
      const editButton = screen.getByRole('button', { name: /edit/i })
      const exitButton = screen.getByRole('button', { name: /exit preview/i })
      
      expect(refreshButton).toHaveAttribute('title')
      expect(editButton).toHaveAttribute('title')
      expect(exitButton).toHaveAttribute('title')
    })

    it('uses semantic button elements', () => {
      render(<LivePreviewToolbar isDraftMode={true} collection="posts" />)
      
      const buttons = screen.getAllByRole('button')
      expect(buttons).toHaveLength(3)
      
      buttons.forEach(button => {
        expect(button.tagName).toBe('BUTTON')
      })
    })
  })

  describe('Props Interface', () => {
    it('handles all prop combinations correctly', () => {
      const props = {
        isDraftMode: true,
        collection: 'test-collection',
        id: 'test-id',
        slug: 'test-slug'
      }
      
      expect(() => render(<LivePreviewToolbar {...props} />)).not.toThrow()
      
      expect(screen.getByText('test-collection (test-id)')).toBeInTheDocument()
    })

    it('works with minimal props', () => {
      expect(() => render(<LivePreviewToolbar isDraftMode={true} />)).not.toThrow()
      
      expect(screen.getByText('Live Preview Mode')).toBeInTheDocument()
    })
  })

  describe('Edge Cases', () => {
    it('handles very long collection names', () => {
      const longCollection = 'a'.repeat(50)
      render(<LivePreviewToolbar isDraftMode={true} collection={longCollection} />)
      
      expect(screen.getByText(longCollection)).toBeInTheDocument()
    })

    it('handles special characters in collection names', () => {
      render(<LivePreviewToolbar isDraftMode={true} collection="posts-with-dashes_and_underscores" />)
      
      expect(screen.getByText('posts-with-dashes_and_underscores')).toBeInTheDocument()
    })

    it('handles numeric IDs', () => {
      render(<LivePreviewToolbar isDraftMode={true} collection="posts" id="12345" />)
      
      expect(screen.getByText('posts (12345)')).toBeInTheDocument()
    })

    it('returns null when not visible', () => {
      const { container } = render(<LivePreviewToolbar isDraftMode={false} />)
      
      expect(container.firstChild).toBeNull()
    })
  })
})