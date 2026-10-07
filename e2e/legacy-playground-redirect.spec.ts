import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { expect, test } from '@playwright/test'
import { LENS_LABELS, UI } from '../components/pages/ai-mode-playground/ai-mode-playground-copy'

// The old route is the only thing catching the `/cortex-playground/` links
// DATAI-555 already put into circulation, and every assertion it had lived in
// jsdom with `window.location` mocked out — so the actual browser jump, and
// the no-JS path it is supposed to serve, were never exercised anywhere.
// These run against a real page.

const LEGACY = '/cortex-playground/'
const DESTINATION = '/ai-mode-playground/'
const selectedLens = (page: import('@playwright/test').Page) =>
  page.getByRole('tablist', { name: UI.canvas.customerTablistLabel }).getByRole('tab', { selected: true })

test.describe('JS 開：真實瀏覽器跳轉', () => {
  test('沒有參數時落在新路徑', async ({ page }) => {
    await page.goto(LEGACY)
    await page.waitForURL(`**${DESTINATION}`)
    expect(new URL(page.url()).pathname).toBe(DESTINATION)
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
  })

  // `publisher` is a DATAI-555 alias, so this also proves the alias survives
  // the hop rather than silently landing on the default lens.
  test('?lens=publisher 保留 query 並選中 Media and Content', async ({ page }) => {
    await page.goto(`${LEGACY}?lens=publisher`)
    await page.waitForURL(`**${DESTINATION}?lens=publisher`)
    expect(new URL(page.url()).search).toBe('?lens=publisher')
    await expect(selectedLens(page)).toHaveText(LENS_LABELS['content-owners'])
  })

  test('?lens=brand#ledger 連 hash 一起保留並選中 Brand', async ({ page }) => {
    await page.goto(`${LEGACY}?lens=brand#ledger`)
    await page.waitForURL(`**${DESTINATION}?lens=brand#ledger`)
    const url = new URL(page.url())
    expect(url.search).toBe('?lens=brand')
    expect(url.hash).toBe('#ledger')
    await expect(selectedLens(page)).toHaveText(LENS_LABELS.brands)
  })

  test('其他 query 參數一併帶過去', async ({ page }) => {
    await page.goto(`${LEGACY}?utm_source=slack&lens=media`)
    await page.waitForURL(`**${DESTINATION}?utm_source=slack&lens=media`)
    const params = new URL(page.url()).searchParams
    expect(params.get('utm_source')).toBe('slack')
    expect(params.get('lens')).toBe('media')
    await expect(selectedLens(page)).toHaveText(LENS_LABELS['content-owners'])
  })
})

test.describe('JS 關：停在原地，改用連結', () => {
  test.use({ javaScriptEnabled: false })

  test('不會被時限式跳轉帶走，且提供可點的新路徑連結', async ({ page }) => {
    await page.goto(`${LEGACY}?lens=publisher`)

    // A meta refresh would fire here even with scripting off, which is the
    // WCAG 2.2.1 failure the stub deliberately does not have. Waiting well
    // past any plausible delay is the point of this assertion, so the wait is
    // not a flake guard and cannot be replaced by a web-first assertion.
    await page.waitForTimeout(2500)
    expect(new URL(page.url()).pathname).toBe(LEGACY)

    // The nav and the footer also link to AI Mode, so the one in the stub's
    // own sentence is picked by its exact name rather than a loose match.
    const link = page.getByRole('link', { name: 'Mlytics AI Mode', exact: true })
    await expect(link).toBeVisible()
    expect(new URL(await link.getAttribute('href') ?? '', 'https://www.mlytics.com').pathname).toBe(DESTINATION)

    await link.click()
    await page.waitForURL(`**${DESTINATION}`)
    expect(new URL(page.url()).pathname).toBe(DESTINATION)
  })
})

// The exported HTML is what actually ships — `next dev` never produces it, so
// the trailing slash, the canonical and the absence of a meta refresh can only
// be confirmed against `out/`. CI builds before this run; locally, run
// `npm run build` first.
test.describe('產出物：out/cortex-playground/index.html', () => {
  const built = resolve(process.cwd(), 'out/cortex-playground/index.html')
  let html = ''

  test.beforeAll(() => {
    expect(
      existsSync(built),
      `找不到 ${built}——這個斷言檢查的是 export 產出，請先跑 npm run build`,
    ).toBe(true)
    html = readFileSync(built, 'utf8')
  })

  test('不含 meta refresh（WCAG F40）', () => {
    expect(html).not.toMatch(/http-equiv\s*=\s*["']?refresh/i)
  })

  test('不含 noindex，搬家訊號留給 canonical', () => {
    expect(html).not.toMatch(/noindex/i)
  })

  test('canonical 指向新路徑（含 trailing slash）', () => {
    const canonical = html.match(/<link[^>]+rel="canonical"[^>]*>/i)?.[0] ?? ''
    expect(canonical, 'canonical link 不存在').toMatch(/rel="canonical"/i)
    expect(canonical).toMatch(/href="[^"]*\/ai-mode-playground\/"/)
  })
})
