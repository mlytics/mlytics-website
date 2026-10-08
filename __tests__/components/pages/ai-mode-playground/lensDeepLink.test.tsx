import { act, cleanup, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { AiModePlayground } from '@/components/pages/ai-mode-playground/AiModePlayground'
import { LENS_LABELS } from '@/components/pages/ai-mode-playground/ai-mode-playground-copy'
import type { PlaygroundLens } from '@/components/pages/ai-mode-playground/ai-mode-playground-data'

// The real default is Content Owners, so a case expecting Content Owners would
// pass even if the URL were never read. Those cases override the default to
// Brands (the real `readLensFromSearch` stays in place) so only the URL can
// select Content Owners.
const defaultLens = vi.hoisted(() => ({ override: null as PlaygroundLens | null }))
vi.mock('@/components/pages/ai-mode-playground/ai-mode-playground-data', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/components/pages/ai-mode-playground/ai-mode-playground-data')>()
  return {
    ...actual,
    get DEFAULT_LENS() {
      return defaultLens.override ?? actual.DEFAULT_LENS
    },
  }
})

// The default is Content Owners. The component-level cases below cover the
// mount-once wiring separately from the pure URL parser tests: no parameter
// lands on Content Owners, while an explicit parameter or legacy alias selects
// the matching lens. The history test covers two switches because both must
// replace the same entry rather than stacking navigation.

function setSearch(search: string) {
  window.history.replaceState({}, '', `/ai-mode-playground/${search}`)
}

beforeEach(() => {
  vi.stubGlobal('IntersectionObserver', vi.fn(function IntersectionObserver() {
    return { observe: vi.fn(), disconnect: vi.fn() }
  }))
  if (!HTMLElement.prototype.scrollIntoView) HTMLElement.prototype.scrollIntoView = () => {}
  vi.spyOn(HTMLElement.prototype, 'scrollIntoView').mockImplementation(() => {})
})

afterEach(() => {
  cleanup()
  defaultLens.override = null
  setSearch('')
  vi.restoreAllMocks()
  vi.unstubAllGlobals()
})

const customerTab = (label: string) => screen.getByRole('tab', { name: label })

describe('AiModePlayground lens deep-link', () => {
  it('selects Content Owners by default when no lens parameter is present', async () => {
    setSearch('')
    render(<AiModePlayground />)
    await waitFor(() => expect(customerTab(LENS_LABELS['content-owners'])).toHaveAttribute('aria-selected', 'true'))
    expect(customerTab(LENS_LABELS.brands)).toHaveAttribute('aria-selected', 'false')
  })

  it('selects Brands only for the brands lens parameter', async () => {
    setSearch('?lens=brands')
    render(<AiModePlayground />)
    await waitFor(() => expect(customerTab(LENS_LABELS.brands)).toHaveAttribute('aria-selected', 'true'))
    expect(customerTab(LENS_LABELS['content-owners'])).toHaveAttribute('aria-selected', 'false')
  })

  it('keeps Brands unselected for the content-owners lens parameter', async () => {
    defaultLens.override = 'brands'
    setSearch('?lens=content-owners')
    render(<AiModePlayground />)
    await waitFor(() => expect(customerTab(LENS_LABELS['content-owners'])).toHaveAttribute('aria-selected', 'true'))
    expect(customerTab(LENS_LABELS.brands)).toHaveAttribute('aria-selected', 'false')
  })

  it.each([
    ['?lens=publisher', LENS_LABELS['content-owners']],
    ['?lens=media', LENS_LABELS['content-owners']],
    ['?lens=brand', LENS_LABELS.brands],
  ])('resolves the legacy value in %s through the component', async (search, selected) => {
    // Start from the lens the URL must move away from.
    defaultLens.override = selected === LENS_LABELS.brands ? 'content-owners' : 'brands'
    setSearch(search)
    render(<AiModePlayground />)
    await waitFor(() => expect(customerTab(selected)).toHaveAttribute('aria-selected', 'true'))
  })
})

describe('AiModePlayground lens URL sync', () => {
  it('rewrites lens twice while preserving other params, hash, and history length', async () => {
    const user = userEvent.setup()
    setSearch('?utm_source=slack&lens=content-owners#foo')
    render(<AiModePlayground />)
    await waitFor(() => expect(customerTab(LENS_LABELS['content-owners'])).toHaveAttribute('aria-selected', 'true'))
    const lengthBefore = window.history.length
    await user.click(customerTab(LENS_LABELS.brands))
    expect(new URLSearchParams(window.location.search).get('lens')).toBe('brands')
    await user.click(customerTab(LENS_LABELS['content-owners']))
    expect(new URLSearchParams(window.location.search).get('lens')).toBe('content-owners')
    expect(new URLSearchParams(window.location.search).get('utm_source')).toBe('slack')
    expect(window.location.hash).toBe('#foo')
    expect(window.history.length).toBe(lengthBefore)
  })

  it('hands replaceState a null state and the rewritten URL with other params and hash kept', async () => {
    const user = userEvent.setup()
    setSearch('?utm_source=slack&lens=content-owners#foo')
    render(<AiModePlayground />)
    await waitFor(() => expect(customerTab(LENS_LABELS['content-owners'])).toHaveAttribute('aria-selected', 'true'))
    const replaceState = vi.spyOn(window.history, 'replaceState')
    await user.click(customerTab(LENS_LABELS.brands))
    expect(replaceState).toHaveBeenCalledTimes(1)
    const [state, unused, url] = replaceState.mock.calls[0]
    expect(state).toBeNull()
    expect(unused).toBe('')
    const parsed = new URL(String(url), window.location.origin)
    expect(parsed.pathname).toBe('/ai-mode-playground/')
    expect(parsed.searchParams.get('lens')).toBe('brands')
    expect(parsed.searchParams.get('utm_source')).toBe('slack')
    expect(parsed.hash).toBe('#foo')
  })

  it('does nothing when the already-selected lens is chosen again', async () => {
    const user = userEvent.setup()
    setSearch('?lens=content-owners')
    render(<AiModePlayground />)
    const contentTab = customerTab(LENS_LABELS['content-owners'])
    await waitFor(() => expect(contentTab).toHaveAttribute('aria-selected', 'true'))
    const replaceState = vi.spyOn(window.history, 'replaceState')
    await user.click(contentTab)
    contentTab.focus()
    await user.keyboard('{Home}')
    await act(async () => { await new Promise((resolve) => setTimeout(resolve, 50)) })
    expect(replaceState).not.toHaveBeenCalled()
    expect(screen.getByRole('status')).toBeEmptyDOMElement()
    expect(contentTab).toHaveAttribute('aria-selected', 'true')
  })
})
