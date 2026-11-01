// src/__tests__/components/content/projects/case-study/CaseStudySection.test.tsx
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { CaseStudySection } from '@/components/content/projects/case-study/CaseStudySection'

describe('CaseStudySection', () => {
  it('is a region named by its h2 and renders children', () => {
    render(<CaseStudySection id="overview" heading="Overview"><p>Body</p></CaseStudySection>)
    const region = screen.getByRole('region', { name: 'Overview' })
    expect(region).toContainElement(screen.getByText('Body'))
    expect(screen.getByRole('heading', { level: 2, name: 'Overview' })).toHaveAttribute('id', 'overview')
  })
})
