// src/__tests__/components/content/projects/case-study/ProjectPagination.test.tsx
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ProjectPagination } from '@/components/content/projects/case-study/ProjectPagination'
import { PROJECT_GROUPS } from '@/components/content/projects/groups'
import type { Project } from '@/types'

const p = (slug: string, name: string) => ({ slug, name, type: 'professional' }) as Project
const group = PROJECT_GROUPS.professional

describe('ProjectPagination', () => {
  it('links prev, next and the group page', () => {
    render(<ProjectPagination prev={p('a', 'Alpha')} next={p('b', 'Beta')} group={group} />)
    expect(screen.getByRole('navigation', { name: /more projects/i })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /previous.*alpha/i })).toHaveAttribute('href', '/projects/a')
    expect(screen.getByRole('link', { name: /next.*beta/i })).toHaveAttribute('href', '/projects/b')
    expect(screen.getByRole('link', { name: /all professional work/i })).toHaveAttribute('href', '/projects/professional')
  })

  it('omits a missing side', () => {
    render(<ProjectPagination prev={null} next={p('b', 'Beta')} group={group} />)
    expect(screen.queryByRole('link', { name: /previous/i })).toBeNull()
    expect(screen.getByRole('link', { name: /next.*beta/i })).toBeInTheDocument()
    expect(screen.getByRole('navigation', { name: /more projects/i }).querySelector('.hidden.md\\:block')).not.toBeNull()
  })
})
