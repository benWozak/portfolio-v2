import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Markdown } from '@/components/content/markdown/Markdown'

describe('Markdown', () => {
  it('renders paragraphs, emphasis and GFM strikethrough', () => {
    const { container } = render(<Markdown>{'Hello **world** and ~~gone~~.\n\nSecond.'}</Markdown>)
    expect(container.querySelectorAll('p')).toHaveLength(2)
    expect(container.querySelector('strong')?.textContent).toBe('world')
    expect(container.querySelector('del')?.textContent).toBe('gone')
  })

  it('opens external links in a new tab with rel, and keeps internal links plain', () => {
    render(<Markdown>{'[ext](https://example.com) and [int](/projects/demo)'}</Markdown>)
    const ext = screen.getByRole('link', { name: 'ext' })
    expect(ext).toHaveAttribute('target', '_blank')
    expect(ext).toHaveAttribute('rel', 'noopener noreferrer')
    const int = screen.getByRole('link', { name: 'int' })
    expect(int).toHaveAttribute('href', '/projects/demo')
    expect(int).not.toHaveAttribute('target')
  })

  it('does not render raw HTML', () => {
    const { container } = render(<Markdown>{'<script>alert(1)</script> text'}</Markdown>)
    expect(container.querySelector('script')).toBeNull()
  })

  it('inline variant renders no wrapping paragraph', () => {
    const { container } = render(<Markdown inline>{'Use **bold** here'}</Markdown>)
    expect(container.querySelector('p')).toBeNull()
    expect(container.querySelector('strong')?.textContent).toBe('bold')
  })

  it('wraps block output in prose', () => {
    const { container } = render(<Markdown>{'x'}</Markdown>)
    expect(container.firstElementChild?.className).toMatch(/\bprose\b/)
  })

  it('merges className onto the prose wrapper and keeps the base classes', () => {
    const { container } = render(<Markdown className="mt-4">{'x'}</Markdown>)
    expect(container.firstElementChild).toHaveClass('prose', 'max-w-none', 'dark:prose-invert', 'mt-4')
  })

  it('inline variant keeps the text of every paragraph', () => {
    const { container } = render(<Markdown inline>{'First para.\n\nSecond para.'}</Markdown>)
    expect(container.querySelector('p')).toBeNull()
    expect(container.textContent).toContain('First para.')
    expect(container.textContent).toContain('Second para.')
  })

  it('does not open mailto links in a new tab', () => {
    render(<Markdown>{'[mail](mailto:hi@example.com)'}</Markdown>)
    const link = screen.getByRole('link', { name: 'mail' })
    expect(link).toHaveAttribute('href', 'mailto:hi@example.com')
    expect(link).not.toHaveAttribute('target')
  })
})
