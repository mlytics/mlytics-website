import { expect, test, type Page } from '@playwright/test'

const lin = (c: number) => { c /= 255; return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4 }
const lum = (rgb: number[]) => 0.2126 * lin(rgb[0]) + 0.7152 * lin(rgb[1]) + 0.0722 * lin(rgb[2])
const ratio = (a: number[], b: number[]) => { const [x, y] = [lum(a), lum(b)].sort((m, n) => n - m); return (x + 0.05) / (y + 0.05) }

const DESKTOP_GROUP = 'nav.fixed div.hidden.lg\\:flex.gap-3'

// Measures one nav button against what is actually painted around it. The nav
// is `position: fixed` and translucent (bg-white/80), so the colour behind a
// button is the nav layer composited over whichever page element sits under
// it — not something an ancestor walk can find. We sample the page element
// just left of the button (outside the nav, via elementsFromPoint), resolve
// its background the same way, then composite the nav's own layers on top.
type Measured = { label: string; text: number; boundary: number; fg: number[]; fill: number[]; surround: number[] }
const measureButton = (page: Page, label: string) =>
  page.evaluate((label) => {
    // Computed colours come back in several syntaxes (rgb(), and for Tailwind
    // v4 opacity modifiers `color(srgb …)` / oklab). Let a canvas normalise
    // them to 0–255 RGBA instead of regex-parsing each form.
    const ctx = document.createElement('canvas').getContext('2d', { willReadFrequently: true })!
    const parse = (c: string) => {
      ctx.clearRect(0, 0, 1, 1)
      ctx.fillStyle = c
      ctx.fillRect(0, 0, 1, 1)
      const [r, g, b, a] = ctx.getImageData(0, 0, 1, 1).data
      return a === 255 ? [r, g, b] : [r, g, b, a / 255]
    }
    const over = (top: number[], bottom: number[]) => {
      const a = top.length > 3 ? top[3] : 1
      return [0, 1, 2].map((i) => Math.round(a * top[i] + (1 - a) * bottom[i]))
    }
    const layersOf = (el: Element | null, stopAt?: Element) => {
      const layers: number[][] = []
      let n = el
      while (n && n !== stopAt?.parentElement) {
        const c = parse(getComputedStyle(n).backgroundColor)
        if (!(c.length > 3 && c[3] === 0)) {
          layers.push(c)
          if (c.length === 3 || c[3] === 1) break
        }
        n = n.parentElement
      }
      return layers
    }
    const composite = (layers: number[][], base: number[]) => layers.reduceRight((acc, l) => over(l, acc), base)

    const nav = document.querySelector('nav.fixed')!
    const btn = [...document.querySelectorAll<HTMLAnchorElement>('nav.fixed div.hidden a')].find(
      (a) => a.textContent?.trim() === label,
    )!
    const r = btn.getBoundingClientRect()
    const x = r.left - 4
    const y = r.top + r.height / 2
    const under = document.elementsFromPoint(x, y).find((e) => !nav.contains(e)) ?? document.body
    const pageBg = composite(layersOf(under), [255, 255, 255])
    const surround = composite(layersOf(btn.parentElement, nav), pageBg)

    const cs = getComputedStyle(btn)
    const own = parse(cs.backgroundColor)
    const fill = own.length > 3 && own[3] === 0 ? surround : composite([own], surround)
    const borderW = parseFloat(cs.borderTopWidth)
    const border = borderW > 0 ? parse(cs.borderTopColor) : fill
    return { fg: parse(cs.color), fill, border, surround, borderW }
  }, label).then(({ fg, fill, border, surround, borderW }) => ({
    label,
    fg,
    fill,
    surround,
    text: ratio(fg, fill),
    // WCAG 1.4.11: the visual boundary of the control against what surrounds it.
    // Outline button → its border; solid button (no border) → its fill.
    boundary: ratio(borderW > 0 ? border : fill, surround),
  }) as Measured)

const scrollToScrolledState = async (page: Page) => {
  // Scroll down past the hide threshold, then up a little: the Nav reappears
  // (diff < -4) while staying in the `scrolled` (> 20px) state.
  // `html { scroll-behavior: smooth }` would turn one jump into many tiny
  // steps below the Nav's show threshold, so scroll instantly.
  await page.evaluate(() => window.scrollTo({ top: 900, behavior: 'instant' }))
  await page.waitForTimeout(150)
  const nav = page.locator('nav.fixed')
  // Each attempt scrolls up another 100px (a fresh "scrolling up" signal), so
  // a late layout shift or a missed scroll event cannot leave the Nav hidden.
  let top = 900
  await expect(async () => {
    top -= 100
    await page.evaluate((y) => window.scrollTo({ top: y, behavior: 'instant' }), top)
    // The scrolled state is the one that adds `shadow-sm`.
    await expect(nav).toHaveClass(/shadow-sm/, { timeout: 500 })
    // Fully slid back in (transform transition finished).
    await expect.poll(async () => (await nav.boundingBox())!.y, { timeout: 1000 }).toBe(0)
  }).toPass({ timeout: 6000 })
}

// Scroll until a dark section below the hero sits under the Nav, then scroll up
// a little so the desktop Nav slides back in over it (DATAI-680: the
// translucent Nav over a dark section is where text-ink-muted fell to 3.69:1).
const scrollNavOverDarkSection = async (page: Page) => {
  const target = await page.evaluate(() => {
    const s = [...document.querySelectorAll<HTMLElement>('.section-dark')]
      .find((e) => e.getBoundingClientRect().top + window.scrollY > 300)
    return s ? Math.round(s.getBoundingClientRect().top + window.scrollY + 40) : null
  })
  expect(target, 'page has a dark section below the hero').not.toBeNull()
  const nav = page.locator('nav.fixed')
  await expect(async () => {
    await page.evaluate((y) => window.scrollTo({ top: y + 150, behavior: 'instant' }), target!)
    await page.waitForTimeout(100)
    await page.evaluate((y) => window.scrollTo({ top: y, behavior: 'instant' }), target!)
    await expect.poll(async () => (await nav.boundingBox())!.y, { timeout: 1000 }).toBe(0)
  }).toPass({ timeout: 6000 })
  const overDark = await page.evaluate(() => {
    const n = document.querySelector('nav.fixed')!
    const r = n.getBoundingClientRect()
    const under = document.elementsFromPoint(r.width / 2, r.bottom - 10).find((e) => !n.contains(e))
    return !!under?.closest('.section-dark')
  })
  expect(overDark, 'a dark section is under the Nav').toBe(true)
}

test.describe('desktop 1280', () => {
  test.use({ viewport: { width: 1280, height: 800 } })

  test('Book a Demo (secondary) sits left of Try AI Mode (primary); center links drop AI Mode', async ({ page }) => {
    await page.goto('/')
    const group = page.locator(DESKTOP_GROUP)
    const links = group.locator('a')
    await expect(links).toHaveText(['Book a Demo', 'Try AI Mode'])
    await expect(links.nth(0)).toBeVisible()
    await expect(links.nth(1)).toBeVisible()
    await expect(links.nth(0)).toHaveAttribute('href', /\/book-a-demo\/?$/)
    await expect(links.nth(1)).toHaveAttribute('href', /\/ai-mode-playground\/?$/)
    const [a, b] = [await links.nth(0).boundingBox(), await links.nth(1).boundingBox()]
    // Book a Demo ends before Try AI Mode starts.
    expect(a!.x + a!.width).toBeLessThan(b!.x)
    // Same height, so the pair reads as one group.
    expect(Math.abs(a!.height - b!.height)).toBeLessThanOrEqual(0.5)
    await expect(page.locator('nav.fixed a', { hasText: /^AI Mode$/ })).toHaveCount(0)
  })

  for (const path of ['/', '/ai-mode-playground/', '/brands/', '/content-owners/']) {
    for (const state of ['top', 'scrolled'] as const) {
      test(`nav button contrast on ${path} (${state})`, async ({ page }) => {
        await page.goto(path)
        await expect(page.locator(DESKTOP_GROUP)).toBeVisible()
        if (state === 'scrolled') await scrollToScrolledState(page)
        for (const label of ['Try AI Mode', 'Book a Demo']) {
          const m = await measureButton(page, label)
          expect.soft(m.text, `${label} text ${JSON.stringify(m)}`).toBeGreaterThanOrEqual(4.5)
          expect.soft(m.boundary, `${label} boundary ${JSON.stringify(m)}`).toBeGreaterThanOrEqual(3)
        }
      })
    }
  }

  // DATAI-680: the four center links over a dark hero (/brands/, /content-owners/,
  // /does-not-exist/) or a dark section further down were 3.69:1 with text-ink-muted.
  // measureButton composites the nav layer over the page element under it, which
  // is what is actually painted.
  for (const path of ['/', '/brands/', '/content-owners/', '/does-not-exist/']) {
    for (const state of ['top', 'over dark section'] as const) {
      // The 404 page is one dark viewport tall: its top already is the dark case.
      if (path === '/does-not-exist/' && state !== 'top') continue
      test(`nav link contrast on ${path} (${state})`, async ({ page }) => {
        await page.goto(path)
        await expect(page.locator(DESKTOP_GROUP)).toBeVisible()
        if (state !== 'top') await scrollNavOverDarkSection(page)
        for (const label of ['Media and Content', 'Brands', 'Developers', 'Partnership']) {
          const m = await measureButton(page, label)
          expect.soft(m.text, `${label} text ${JSON.stringify(m)}`).toBeGreaterThanOrEqual(4.5)
        }
      })
    }
  }

  test('aria-current marks Try AI Mode on the AI Mode page only', async ({ page }) => {
    await page.goto('/ai-mode-playground/')
    await expect(page.locator(`${DESKTOP_GROUP} a`, { hasText: 'Try AI Mode' })).toHaveAttribute('aria-current', 'page')
    await page.goto('/')
    await expect(page.locator(`${DESKTOP_GROUP} a`, { hasText: 'Try AI Mode' })).not.toHaveAttribute('aria-current', /.*/)
  })

  test('keyboard focus ring is visible on both nav buttons', async ({ page }) => {
    await page.goto('/')
    // Forward Tab order = DOM order: Book a Demo, then Try AI Mode.
    for (const label of ['Book a Demo', 'Try AI Mode']) {
      let found = false
      for (let i = 0; i < 25 && !found; i++) {
        await page.keyboard.press('Tab')
        found = await page.evaluate((l) => {
          const a = document.activeElement
          return !!a && !!a.closest('nav') && a.textContent?.trim() === l
        }, label)
      }
      expect(found, `${label} reachable by Tab`).toBe(true)
      const ring = await page.evaluate(() => {
        const cs = getComputedStyle(document.activeElement!)
        return { style: cs.outlineStyle, width: parseFloat(cs.outlineWidth), color: cs.outlineColor }
      })
      expect(ring.style, label).not.toBe('none')
      expect(ring.width, label).toBeGreaterThanOrEqual(2)
    }
  })
})

// Below lg (1024px) the bar carries its own solid Try AI Mode between the logo
// and the hamburger. It must fit on one line down to 320px.
const MOBILE_BAR_BTN = 'nav.fixed div.lg\\:hidden a'

for (const width of [320, 375, 768, 1023]) {
  test.describe(`mobile bar at ${width}`, () => {
    test.use({ viewport: { width, height: 800 } })

    test('logo, Try AI Mode and hamburger sit in one row without overlap or sideways scroll', async ({ page }) => {
      await page.goto('/')
      const btn = page.locator(MOBILE_BAR_BTN, { hasText: 'Try AI Mode' })
      await expect(btn).toBeVisible()
      await expect(btn).toHaveAttribute('href', /\/ai-mode-playground\/?$/)
      const logo = (await page.locator('nav.fixed > div > a[href="/"]').boundingBox())!
      const b = (await btn.boundingBox())!
      const burger = (await page.getByRole('button', { name: 'Open menu' }).boundingBox())!
      expect(b.height).toBeGreaterThanOrEqual(36)
      expect(b.height, 'single line, no wrap').toBeLessThan(40)
      // Order and no overlap.
      expect(logo.x + logo.width).toBeLessThanOrEqual(b.x)
      expect(b.x + b.width).toBeLessThanOrEqual(burger.x)
      // Everything inside the viewport.
      expect(burger.x + burger.width).toBeLessThanOrEqual(width)
      // Bar height unchanged.
      const nav = (await page.locator('nav.fixed').boundingBox())!
      expect(nav.height).toBe(65)
      expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width)
    })
  })
}

for (const width of [1024, 1280]) {
  test.describe(`mobile bar at ${width}`, () => {
    test.use({ viewport: { width, height: 800 } })

    test('mobile Try AI Mode and hamburger are hidden', async ({ page }) => {
      await page.goto('/')
      await expect(page.locator(DESKTOP_GROUP)).toBeVisible()
      await expect(page.locator(MOBILE_BAR_BTN, { hasText: 'Try AI Mode' })).toBeHidden()
      await expect(page.getByRole('button', { name: 'Open menu' })).toBeHidden()
    })
  })
}

// Hero: back to its pre-DATAI-555 state — the input block (InlineEmailCTA's
// pill, `form > div`) alone and centred; no Try AI Mode at any width.
for (const width of [320, 375, 640, 1023, 1280]) {
  test.describe(`home hero at ${width}`, () => {
    test.use({ viewport: { width, height: 800 } })

    test('has no Try AI Mode; email pill is visible, centred and at its design width', async ({ page }) => {
      await page.goto('/')
      const pillLoc = page.locator('section form > div').first()
      await expect(pillLoc).toBeVisible()
      await expect(page.locator('section a', { hasText: 'Try AI Mode' })).toHaveCount(0)
      const pill = (await pillLoc.boundingBox())!
      expect(Math.abs(pill.x + pill.width / 2 - width / 2)).toBeLessThanOrEqual(2)
      expect(Math.abs(pill.width - Math.min(448, width - 48))).toBeLessThanOrEqual(1)
      expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width)
    })
  })
}
