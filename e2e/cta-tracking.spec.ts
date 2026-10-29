import { test, expect, type Page } from '@playwright/test'

/**
 * DATAI-628: navigation CTAs send GA4 `click_cta` with the on-screen label.
 *
 * The GA loader (`lib/ga.ts`) defines `window.gtag` itself, so a gtag stub
 * would be overwritten. Instead we pre-create `window.dataLayer` and wrap its
 * `push`: the loader reuses `window.dataLayer || []` (on localhost it never
 * loads gtag.js, so nothing is sent), and every gtag() call lands here as an
 * `arguments` object. Entries are mirrored to sessionStorage so they survive
 * the navigation the click triggers.
 */
const KEY = '__dl'

test.beforeEach(async ({ page }) => {
  // Never send events from tests to the real services: abort every request
  // that leaves localhost (GA, GTM, HubSpot and all their subdomains).
  await page.route((url) => url.hostname !== 'localhost', (route) => route.abort())
  await page.addInitScript((key: string) => {
    const w = window as unknown as { dataLayer?: unknown[] }
    const dl = (w.dataLayer = w.dataLayer || [])
    const original = dl.push.bind(dl)
    dl.push = (...items: unknown[]) => {
      try {
        const stored = JSON.parse(sessionStorage.getItem(key) || '[]') as unknown[]
        for (const item of items) {
          const isArgs = Object.prototype.toString.call(item) === '[object Arguments]'
          stored.push(isArgs ? Array.from(item as ArrayLike<unknown>) : item)
        }
        sessionStorage.setItem(key, JSON.stringify(stored))
      } catch { /* ignore */ }
      return original(...items)
    }
  }, KEY)
})

type CtaEvent = { cta_label: string; cta_position: string; page_audience: string }

async function clickCtaEvents(page: Page): Promise<CtaEvent[]> {
  try {
    return await page.evaluate((key) => {
      const stored = JSON.parse(sessionStorage.getItem(key) || '[]') as unknown[]
      return stored
        .filter((e): e is [string, string, CtaEvent] =>
          Array.isArray(e) && e[0] === 'event' && e[1] === 'click_cta')
        .map((e) => e[2])
    }, KEY)
  } catch {
    return [] // execution context swapped mid-navigation; poll again
  }
}

async function expectSingleEvent(page: Page, expected: CtaEvent) {
  await expect.poll(() => clickCtaEvents(page), { timeout: 15_000 }).toEqual([expected])
}

test.describe('CTA tracking (DATAI-628)', () => {
  const CARDS = [
    { full: 'See media and content plan', persona: 'Media and Content Owner', position: 'home_identity_content_owners' },
    { full: 'See brand plan', persona: 'Brand', position: 'home_identity_brands' },
    { full: 'See developer plan', persona: 'Developer', position: 'home_identity_developers' },
  ]

  for (const width of [375, 768, 1280]) {
    for (const card of CARDS) {
      const tablet = width === 768
      const label = tablet ? 'Learn more' : card.full
      test(`home identity card ${card.position} at ${width}px records "${label}"`, async ({ page }) => {
        await page.setViewportSize({ width, height: 900 })
        await page.goto('/')
        const name = tablet ? `Learn more about the ${card.persona} plan` : card.full
        const link = page.getByRole('link', { name, exact: true })
        await link.scrollIntoViewIfNeeded()
        await expect(link).toBeVisible()
        await link.click()
        await expectSingleEvent(page, { cta_label: label, cta_position: card.position, page_audience: 'home' })
      })
    }
  }

  test('/content-owners/ Talk to us card', async ({ page }) => {
    await page.goto('/content-owners/')
    const link = page.getByRole('link', { name: /Talk to us/ })
    await link.scrollIntoViewIfNeeded()
    await link.click()
    await expectSingleEvent(page, {
      cta_label: 'Talk to us', cta_position: 'content_owners_section', page_audience: 'content-owners',
    })
  })

  test('404 default variant: Back to Home', async ({ page }) => {
    await page.goto('/does-not-exist-628/')
    const link = page.getByRole('link', { name: 'Back to Home', exact: true })
    await expect(link).toBeVisible()
    await link.click()
    await expectSingleEvent(page, {
      cta_label: 'Back to Home', cta_position: 'not_found', page_audience: 'does-not-exist-628',
    })
  })
})
