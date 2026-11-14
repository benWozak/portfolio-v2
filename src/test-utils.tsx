import React, { act } from 'react'
import { renderToString } from 'react-dom/server'
import { hydrateRoot } from 'react-dom/client'
import { onTestFinished, vi } from 'vitest'
import { render, RenderOptions } from '@testing-library/react'
import { ThemeProvider } from 'next-themes'

// Custom render function that includes providers
const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  return (
    <ThemeProvider>
      {children}
    </ThemeProvider>
  )
}

const customRender = (
  ui: React.ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => render(ui, { wrapper: AllTheProviders, ...options })

/**
 * Server-renders `ui`, hydrates that HTML the way the browser does, and returns
 * the hydration mismatches React reported (as recoverable errors or, for
 * attribute-only differences, console errors). `beforeHydrate` runs between the
 * two passes so a test can make a mocked hook answer differently on the client,
 * the way next-themes reads localStorage there but has no theme on the server.
 * The container is detached from the document, so `screen` does not see it;
 * query it with `within(container)`.
 */
async function hydrate(ui: React.ReactElement, beforeHydrate?: () => void) {
  const container = document.createElement('div')
  container.innerHTML = renderToString(ui)
  beforeHydrate?.()

  const hydrationErrors: string[] = []
  const originalError = console.error
  const consoleError = vi.spyOn(console, 'error').mockImplementation((...args) => {
    const message = args.map(String).join(' ')
    if (/hydrat/i.test(message)) hydrationErrors.push(message)
    else originalError(...args)
  })

  let root: ReturnType<typeof hydrateRoot> | undefined
  try {
    await act(async () => {
      root = hydrateRoot(container, ui, {
        onRecoverableError: (error) => hydrationErrors.push(String(error)),
      })
    })
  } finally {
    consoleError.mockRestore()
  }
  onTestFinished(() => act(() => root?.unmount()))

  return { container, hydrationErrors }
}

// Re-export everything
export * from '@testing-library/react'
export { customRender as render, hydrate }
