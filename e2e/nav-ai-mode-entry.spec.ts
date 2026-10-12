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

test.describe('desktop 1280', () => {
  test.use({ viewport: { width: 1280, height: 800 } })

  test('Try AI Mode (primary) sits before Book a Demo (secondary); center links drop AI Mode', async ({ page }) => {
    await page.goto('/')
    const group = page.locator(DESKTOP_GROUP)
    const links = group.locator('a')
    await expect(links).toHaveText(['Try AI Mode', 'Book a Demo'])
    await expect(links.nth(0)).toBeVisible()
    await expect(links.nth(1)).toBeVisible()
    await expect(links.nth(0)).toHaveAttribute('href', /\/ai-mode-playground\/?$/)
    await expect(links.nth(1)).toHaveAttribute('href', /\/book-a-demo\/?$/)
    const [a, b] = [await links.nth(0).boundingBox(), await links.nth(1).boundingBox()]
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

  test('aria-current marks Try AI Mode on the AI Mode page only', async ({ page }) => {
    await page.goto('/ai-mode-playground/')
    await expect(page.locator(`${DESKTOP_GROUP} a`, { hasText: 'Try AI Mode' })).toHaveAttribute('aria-current', 'page')
    await page.goto('/')
    await expect(page.locator(`${DESKTOP_GROUP} a`, { hasText: 'Try AI Mode' })).not.toHaveAttribute('aria-current', /.*/)
  })

  test('keyboard focus ring is visible on both nav buttons', async ({ page }) => {
    await page.goto('/')
    for (const label of ['Try AI Mode', 'Book a Demo']) {
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

test.describe('mobile 375', () => {
  test.use({ viewport: { width: 375, height: 812 } })

  test('menu stacks Try AI Mode above Book a Demo, full width, and the page does not scroll sideways', async ({ page }) => {
    await page.goto('/')
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(375)

    await page.getByRole('button', { name: 'Open menu' }).click()
    const tryAi = page.locator('nav.fixed a:visible', { hasText: 'Try AI Mode' })
    const book = page.locator('nav.fixed a:visible', { hasText: 'Book a Demo' })
    await expect(tryAi).toBeVisible()
    await expect(book).toBeVisible()
    const [a, b] = [await tryAi.boundingBox(), await book.boundingBox()]
    expect(a!.y + a!.height).toBeLessThanOrEqual(b!.y)
    expect(Math.abs(a!.x - b!.x)).toBeLessThanOrEqual(1)
    expect(Math.abs(a!.width - b!.width)).toBeLessThanOrEqual(1)
    // Full width of the menu's padded content box (375 − 2×24px).
    expect(a!.width).toBeGreaterThanOrEqual(375 - 48 - 1)

    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(375)

    await tryAi.click()
    await page.waitForURL(/\/ai-mode-playground\/?$/)
    await expect(page.getByRole('button', { name: 'Open menu' })).toBeVisible()
  })

})

// Hero: the input block is InlineEmailCTA's pill (`form > div`), not the form,
// because the form also holds the (usually absent) error line.
const heroGeometry = async (page: Page) => {
  const pill = (await page.locator('section form > div').first().boundingBox())!
  const btn = (await page.locator('section a', { hasText: 'Try AI Mode' }).boundingBox())!
  const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth)
  return { pill, btn, scrollWidth }
}

for (const width of [1023, 640]) {
  test.describe(`home hero row at ${width}`, () => {
    test.use({ viewport: { width, height: 800 } })

    test('Try AI Mode sits to the right of the input block, top and bottom aligned', async ({ page }) => {
      await page.goto('/')
      await expect(page.locator('section a', { hasText: 'Try AI Mode' })).toBeVisible()
      const { pill, btn, scrollWidth } = await heroGeometry(page)
      expect(Math.abs(btn.y - pill.y)).toBeLessThanOrEqual(1)
      expect(Math.abs(btn.y + btn.height - (pill.y + pill.height))).toBeLessThanOrEqual(1)
      expect(btn.x).toBeGreaterThanOrEqual(pill.x + pill.width + 11) // ~12px gap
      expect(btn.x - (pill.x + pill.width)).toBeLessThanOrEqual(13)
      // The input keeps its design width (InlineEmailCTA's max-w-md, 28rem).
      expect(pill.width).toBeCloseTo(448, 0)
      expect(scrollWidth).toBeLessThanOrEqual(width)
    })
  })
}

// From lg (1024px) the Nav shows its own solid Try AI Mode, so the hero's
// outline one is display:none and the input block sits alone, centred.
for (const width of [1280, 1024]) {
  test.describe(`home hero at ${width} (nav owns Try AI Mode)`, () => {
    test.use({ viewport: { width, height: 800 } })

    test('hero Try AI Mode is hidden; input block is centred at its design width', async ({ page }) => {
      await page.goto('/')
      const pillLoc = page.locator('section form > div').first()
      await expect(pillLoc).toBeVisible()
      await expect(page.locator('section a', { hasText: 'Try AI Mode' })).toBeHidden()
      // The nav entry is the one on screen instead.
      await expect(page.locator(`${DESKTOP_GROUP} a`, { hasText: 'Try AI Mode' })).toBeVisible()
      const pill = (await pillLoc.boundingBox())!
      const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth)
      expect(pill.width).toBeCloseTo(448, 0)
      expect(Math.abs(pill.x + pill.width / 2 - width / 2)).toBeLessThanOrEqual(2)
      expect(scrollWidth).toBeLessThanOrEqual(width)
    })
  })
}

for (const width of [375, 320]) {
  test.describe(`home hero stacked at ${width}`, () => {
    test.use({ viewport: { width, height: 812 } })

    test('Try AI Mode sits below the input block at exactly its width, no sideways scroll', async ({ page }) => {
      await page.goto('/')
      await expect(page.locator('section a', { hasText: 'Try AI Mode' })).toBeVisible()
      const { pill, btn, scrollWidth } = await heroGeometry(page)
      expect(btn.y).toBeGreaterThanOrEqual(pill.y + pill.height)
      expect(Math.abs(btn.width - pill.width)).toBeLessThanOrEqual(1)
      expect(Math.abs(btn.x - pill.x)).toBeLessThanOrEqual(1)
      expect(scrollWidth).toBeLessThanOrEqual(width)
    })
  })
}
