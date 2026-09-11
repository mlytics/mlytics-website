import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import LegacyPlaygroundRedirectPage, { metadata } from '@/app/cortex-playground/page'

// jsdom's `location.replace` is a non-configurable own property, so it cannot
// be spied on; the whole `location` object has to be swapped instead. It is
// configurable, and the original descriptor goes back after each test.
const realLocation = Object.getOwnPropertyDescriptor(window, 'location')!

function arriveAt(path: string) {
  const url = new URL(path, 'https://www.mlytics.com')
  const replace = vi.fn()
  Object.defineProperty(window, 'location', {
    configurable: true,
    value: { href: url.href, pathname: url.pathname, search: url.search, hash: url.hash, replace },
  })
  return replace
}

afterEach(() => {
  cleanup()
  Object.defineProperty(window, 'location', realLocation)
})

describe('legacy /cortex-playground/ redirect stub', () => {
  it('canonical 指向新路徑', () => {
    expect(metadata.alternates?.canonical).toBe('/ai-mode-playground/')
  })

  it('標示 noindex，避免與新頁競食', () => {
    expect(metadata.robots).toMatchObject({ index: false, follow: true })
  })

  // The trailing slash is asserted loosely on purpose: `trailingSlash: true`
  // lives in next.config.ts, which vitest does not load, so next/link drops it
  // here. The built HTML is checked separately.
  it('提供可點擊的新路徑連結', () => {
    arriveAt('/cortex-playground/')
    render(<LegacyPlaygroundRedirectPage />)
    expect(screen.getByRole('link', { name: /ai mode/i }).getAttribute('href'))
      .toMatch(/^\/ai-mode-playground\/?$/)
  })

  it('留一個 meta refresh 當作無 JS 時的 fallback', () => {
    arriveAt('/cortex-playground/')
    render(<LegacyPlaygroundRedirectPage />)
    expect(document.querySelector('meta[http-equiv="refresh"]'))
      .toHaveAttribute('content', '0; url=/ai-mode-playground/')
  })

  // DATAI-555 put `/cortex-playground/?lens=brand` deep links into circulation.
  // A bare meta-refresh drops the parameter and silently lands the visitor on
  // the default lens, so the redirect has to carry search and hash across.
  it('保留 query string 與 hash', () => {
    const replace = arriveAt('/cortex-playground/?lens=brand#ledger')
    render(<LegacyPlaygroundRedirectPage />)
    expect(replace).toHaveBeenCalledWith('/ai-mode-playground/?lens=brand#ledger')
  })

  it('沒有參數時不會多出空的 ? 或 #', () => {
    const replace = arriveAt('/cortex-playground/')
    render(<LegacyPlaygroundRedirectPage />)
    expect(replace).toHaveBeenCalledWith('/ai-mode-playground/')
  })
})
