# Testing Documentation

This directory contains the test suite for the Portfolio v2 application, built with Vitest and React Testing Library.

## Test Setup

### Dependencies
- **Vitest** - Modern testing framework
- **@testing-library/react** - Simple and complete React DOM testing utilities
- **@testing-library/jest-dom** - Custom Jest matchers for DOM nodes
- **@testing-library/user-event** - User interaction simulation
- **jsdom** - DOM implementation for testing

### Configuration Files
- `vitest.config.ts` - Main Vitest configuration
- `setup.ts` - Global test setup and mocks
- `../test-utils.tsx` - Custom render utilities with providers

## Running Tests

```bash
# Run tests in watch mode
npm test

# Run all tests once
npm run test:run

# Run tests with coverage
npm run test:coverage

# Run tests with UI
npm run test:ui
```

## Test Structure

### Component Tests
Located in `components/` directory, mirroring the source structure:
- `components/ui/Button.test.tsx` - Button component tests
- `components/ui/CTAButton.test.tsx` - CTA Button component tests
- `components/ui/LinkButton.test.tsx` - Link Button component tests

### Hook Tests
Located in `utils/hooks/` directory:
- `utils/hooks/useSmoothScroll.test.tsx` - Smooth scroll hook tests

## Test Coverage

Current coverage focuses on:
- UI component rendering and behavior
- Event handling and user interactions
- Accessibility compliance
- Component variants and states
- Custom hooks functionality

## Writing Tests

### Basic Component Test
```typescript
import { describe, it, expect } from 'vitest'
import { render, screen } from '@/test-utils'
import { MyComponent } from '@/components/MyComponent'

describe('MyComponent', () => {
  it('renders correctly', () => {
    render(<MyComponent />)
    expect(screen.getByText('Expected Text')).toBeInTheDocument()
  })
})
```

### Testing User Interactions
```typescript
import userEvent from '@testing-library/user-event'

it('handles click events', async () => {
  const handleClick = vi.fn()
  const user = userEvent.setup()
  
  render(<Button onClick={handleClick}>Click me</Button>)
  
  await user.click(screen.getByRole('button'))
  expect(handleClick).toHaveBeenCalledTimes(1)
})
```

### Testing Hooks
```typescript
import { renderHook, act } from '@testing-library/react'

it('manages state correctly', () => {
  const { result } = renderHook(() => useMyHook())
  
  act(() => {
    result.current.updateValue('new value')
  })
  
  expect(result.current.value).toBe('new value')
})
```

## Mocks and Setup

The test setup includes mocks for:
- Next.js router and navigation hooks
- Next.js Link and Image components
- Framer Motion components (to avoid animation issues)
- DOM APIs (IntersectionObserver, matchMedia, localStorage)
- Browser navigation methods

## Coverage Goals

- Aim for >80% test coverage on components
- All utility functions should have unit tests
- Critical user flows should have integration tests
- Accessibility features should be thoroughly tested

## Best Practices

1. **Test behavior, not implementation** - Focus on what the component does, not how
2. **Use meaningful test descriptions** - Tests should read like specifications
3. **Follow the Arrange-Act-Assert pattern** - Structure tests clearly
4. **Test edge cases** - Empty states, error conditions, boundary values
5. **Mock external dependencies** - Keep tests fast and reliable
6. **Use semantic queries** - Prefer `getByRole`, `getByLabelText` over `getByTestId`