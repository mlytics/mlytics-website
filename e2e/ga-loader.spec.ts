import { test, expect, type Page } from '@playwright/test'

/**
 * DATAI-681: the GA id is chosen from location.hostname. Production and UAT
 * hostnames are served from the local dev server through page.route, so the
 * real hosts are never contacted; every other non-localhost request (GA,
 * HubSpot, fonts) is aborted and gtag.js requests are only recorded.
 * WebSockets to non-localhost hosts (dev HMR follows the page origin) are
 * closed too. Proxied hosts do not hydrate under dev, so only the first load
 * is checked here; client-side navigation is checked on the static out/.
 */
const PROXIED = new Set(['www.mlytics.com', 'mlytics.co', 'www.mlytics.co'])

test.afterEach(async ({ page }) => {
  await page.unrouteAll({ behavior: 'ignoreErrors' })
})

async function open(page: Page, origin: string) {
  const gaRequests: string[] = []
  await page.routeWebSocket((url) => new URL(url).hostname !== 'localhost', (ws) => ws.close())
  await page.route((url) => url.hostname !== 'localhost', async (route) => {
    const url = new URL(route.request().url())
    if (PROXIED.has(url.hostname)) {
      const response = await route.fetch({ url: `http://localhost:3000${url.pathname}${url.search}` })
      return route.fulfill({ response })
    }
    if (url.hostname === 'www.googletagmanager.com') gaRequests.push(url.href)
    return route.abort()
  })
  await page.goto(`${origin}/`)
  return gaRequests
}

async function configIds(page: Page) {
  return page.evaluate(() =>
    ((window as unknown as { dataLayer?: ArrayLike<unknown>[] }).dataLayer ?? [])
      .map((e) => Array.from(e as ArrayLike<unknown>))
      .filter((e) => e[0] === 'config')
      .map((e) => e[1]))
}

test.describe('GA loader (DATAI-681)', () => {
  test('www.mlytics.com loads the production id', async ({ page }) => {
    const ga = await open(page, 'https://www.mlytics.com')
    await expect.poll(() => ga).toEqual(['https://www.googletagmanager.com/gtag/js?id=G-BHS28B1S3P'])
    expect(await configIds(page)).toEqual(['G-BHS28B1S3P'])
  })

  for (const host of ['mlytics.co', 'www.mlytics.co']) {
    test(`${host} loads the UAT id`, async ({ page }) => {
      const ga = await open(page, `https://${host}`)
      await expect.poll(() => ga).toEqual(['https://www.googletagmanager.com/gtag/js?id=G-6QKQKHMYJV'])
      expect(await configIds(page)).toEqual(['G-6QKQKHMYJV'])
    })
  }

  test('localhost loads no GA but keeps gtag for trackAG', async ({ page }) => {
    const ga = await open(page, 'http://localhost:3000')
    await page.waitForLoadState('networkidle')
    expect(ga).toEqual([])
    expect(await configIds(page)).toEqual([])
    expect(await page.evaluate(() => typeof (window as unknown as { gtag?: unknown }).gtag)).toBe('function')
  })
})
