import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
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

  // `noindex` and `canonical` are contradictory signals — a noindexed page's
  // canonical tends to be ignored, so the "the content lives over there" hint
  // is the one worth keeping. This one-line stub has no duplicate-content risk.
  it('不送 noindex，只留 canonical 當作搬家訊號', () => {
    expect(metadata.robots).toBeUndefined()
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

  // A meta refresh with a non-zero delay is WCAG F40 (a failure of SC 2.2.1
  // Timing Adjustable), and it dropped `?lens=` anyway — so the no-JS path
  // paid an accessibility failure for nothing. The clickable link below is
  // exactly what WCAG recommends instead. Do not reintroduce the tag.
  it('不使用 meta refresh（WCAG F40）', () => {
    arriveAt('/cortex-playground/')
    render(<LegacyPlaygroundRedirectPage />)
    expect(document.querySelector('meta[http-equiv="refresh"]')).toBeNull()
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

  // Matches the JSX attribute, not the word: the page carries a comment saying
  // why the tag must not come back, and that comment has to stay greppable.
  it('原始碼不含 httpEquiv 屬性，擋住日後被當成優化補回來', () => {
    const src = readFileSync(resolve(__dirname, '../../../app/cortex-playground/page.tsx'), 'utf8')
    expect(src).not.toMatch(/httpEquiv\s*=/)
  })

  it('DESTINATION 帶 trailing slash（next/link 在 jsdom 會去掉，故直接鎖常數）', () => {
    const src = readFileSync(resolve(__dirname, '../../../app/cortex-playground/page.tsx'), 'utf8')
    expect(src).toMatch(/const DESTINATION = '\/ai-mode-playground\/'/)
  })
})
