import { cleanup, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { AiModePlayground } from '@/components/pages/ai-mode-playground/AiModePlayground'
import { LENS_LABELS } from '@/components/pages/ai-mode-playground/ai-mode-playground-copy'

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
})
