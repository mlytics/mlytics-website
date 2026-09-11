// Only the `?lens=publisher` case is asserted on mount. `brand` is both the
// initial `useState` value and the fallback for a missing or unsupported
// `lens`, so at the component level "the effect ran and chose brand" and "the
// effect never ran" are the same rendered output — a test for either would
// stay green with the effect deleted. The authoritative coverage for the
// fallback lives in the `readLensFromSearch` tests in
// `__tests__/components/pages/cortex-playground/cortex-playground-data.test.ts`,
// which can tell those two apart.
import { cleanup, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { CortexPlayground } from '@/components/pages/cortex-playground/CortexPlayground'

function setSearch(search: string) {
  window.history.replaceState({}, '', `/cortex-playground/${search}`)
}

beforeEach(() => {
  vi.stubGlobal('IntersectionObserver', vi.fn(function IntersectionObserver() {
    return { observe: vi.fn(), disconnect: vi.fn() }
  }))
  vi.stubGlobal('scrollTo', vi.fn())
})

afterEach(() => {
  cleanup()
  setSearch('')
  vi.restoreAllMocks()
  vi.unstubAllGlobals()
})

describe('CortexPlayground lens deep-link', () => {
  it('selects the Publisher lens for ?lens=publisher', async () => {
    setSearch('?lens=publisher')
    render(<CortexPlayground />)

    await waitFor(() => {
      expect(screen.getByRole('tab', { name: /publisher/i })).toHaveAttribute('aria-selected', 'true')
    })
    expect(screen.getByRole('tab', { name: /^brand/i })).toHaveAttribute('aria-selected', 'false')
  })
})

describe('CortexPlayground lens URL sync', () => {
  it('rewrites ?lens= when the reader switches lens', async () => {
    const user = userEvent.setup()
    setSearch('?lens=publisher')
    render(<CortexPlayground />)

    await waitFor(() => {
      expect(screen.getByRole('tab', { name: /publisher/i })).toHaveAttribute('aria-selected', 'true')
    })

    await user.click(screen.getByRole('tab', { name: /^brand/i }))

    await waitFor(() => {
      expect(new URLSearchParams(window.location.search).get('lens')).toBe('brand')
    })
    expect(screen.getByRole('tab', { name: /^brand/i })).toHaveAttribute('aria-selected', 'true')
  })

  it('keeps the other query params and the hash when it rewrites ?lens=', async () => {
    const user = userEvent.setup()
    setSearch('?utm_source=slack&lens=publisher#foo')
    render(<CortexPlayground />)

    await waitFor(() => {
      expect(screen.getByRole('tab', { name: /publisher/i })).toHaveAttribute('aria-selected', 'true')
    })

    await user.click(screen.getByRole('tab', { name: /^brand/i }))

    await waitFor(() => {
      expect(new URLSearchParams(window.location.search).get('lens')).toBe('brand')
    })
    expect(new URLSearchParams(window.location.search).get('utm_source')).toBe('slack')
    expect(window.location.hash).toBe('#foo')
  })

  it('replaces the history entry instead of pushing one', async () => {
    const user = userEvent.setup()
    setSearch('?lens=publisher')
    render(<CortexPlayground />)

    await waitFor(() => {
      expect(screen.getByRole('tab', { name: /publisher/i })).toHaveAttribute('aria-selected', 'true')
    })
    const lengthBefore = window.history.length

    await user.click(screen.getByRole('tab', { name: /^brand/i }))
    await user.click(screen.getByRole('tab', { name: /publisher/i }))

    await waitFor(() => {
      expect(new URLSearchParams(window.location.search).get('lens')).toBe('publisher')
    })
    expect(window.history.length).toBe(lengthBefore)
  })
})
