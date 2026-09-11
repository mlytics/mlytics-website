// Two different things are covered in two different places, and neither
// stands in for the other. The `readLensFromSearch` tests in
// `__tests__/components/pages/cortex-playground/cortex-playground-data.test.ts`
// cover the *parser*: what a missing or unsupported `lens` resolves to (null).
// The default-lens test below covers where the *component* actually lands with
// no `?lens=` at all — brand — which is a separate claim, and the one the
// "arrive without a deep link and you get the Brand view" promise rests on.
// Note that at the component level "the effect ran and chose brand" and "the
// effect never ran" render the same output, so the default-lens test pins the
// default, not the effect; `?lens=publisher` is what exercises the effect.
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
  it('selects the Brand lens when no ?lens= is present', async () => {
    setSearch('')
    render(<CortexPlayground />)

    await waitFor(() => {
      expect(screen.getByRole('tab', { name: /^brand/i })).toHaveAttribute('aria-selected', 'true')
    })
    expect(screen.getByRole('tab', { name: /publisher/i })).toHaveAttribute('aria-selected', 'false')
  })

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
