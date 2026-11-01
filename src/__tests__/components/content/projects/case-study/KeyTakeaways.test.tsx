// src/__tests__/components/content/projects/case-study/KeyTakeaways.test.tsx
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { KeyTakeaways } from '@/components/content/projects/case-study/KeyTakeaways'

describe('KeyTakeaways', () => {
  it('renders one list item per takeaway with inline markdown', () => {
    render(<KeyTakeaways items={['Ship **early**', 'Measure']} />)
    expect(screen.getByRole('complementary', { name: /key takeaways/i })).toBeInTheDocument()
    expect(screen.getAllByRole('listitem')).toHaveLength(2)
    expect(screen.getByText('early').tagName).toBe('STRONG')
  })
})
