import { cleanup, render, screen, waitFor } from '@testing-library/react'
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

  it('selects the Brand lens for ?lens=brand', async () => {
    setSearch('?lens=brand')
    render(<CortexPlayground />)

    await waitFor(() => {
      expect(screen.getByRole('tab', { name: /^brand/i })).toHaveAttribute('aria-selected', 'true')
    })
    expect(screen.getByRole('tab', { name: /publisher/i })).toHaveAttribute('aria-selected', 'false')
  })

  it('falls back to the Brand lens for an unsupported lens value', async () => {
    setSearch('?lens=garbage')
    render(<CortexPlayground />)

    await waitFor(() => {
      expect(screen.getByRole('tab', { name: /^brand/i })).toHaveAttribute('aria-selected', 'true')
    })
    expect(screen.getByRole('tab', { name: /publisher/i })).toHaveAttribute('aria-selected', 'false')
  })

  it('defaults to the Brand lens with no query string', async () => {
    setSearch('')
    render(<CortexPlayground />)

    await waitFor(() => {
      expect(screen.getByRole('tab', { name: /^brand/i })).toHaveAttribute('aria-selected', 'true')
    })
  })
})
