import { expect, test, type Page } from '@playwright/test'

// The <1024px menu: a full-screen dialog rendered beside the fixed <nav>.

const dialog = (page: Page) => page.getByRole('dialog', { name: 'Site menu' })

const openOverlay = async (page: Page) => {
  await page.getByRole('button', { name: 'Open menu' }).click()
  await expect(dialog(page)).toBeVisible()
  // Fade finished (0.18s) so geometry and opacity are final.
  await expect.poll(() => dialog(page).evaluate((el) => getComputedStyle(el).opacity)).toBe('1')
}

const focusInDialog = (page: Page) =>
  page.evaluate(() => !!document.activeElement?.closest('[role="dialog"]'))

for (const width of [320, 375]) {
  test.describe(`mobile overlay at ${width}`, () => {
    test.use({ viewport: { width, height: 700 } })

    test('fills the viewport with full-width rows and an equal pinned button pair', async ({ page }) => {
      await page.goto('/')
      await openOverlay(page)
      const vh = 700
      const box = (await dialog(page).boundingBox())!
      expect(Math.abs(box.x)).toBeLessThanOrEqual(1)
      expect(Math.abs(box.y)).toBeLessThanOrEqual(1)
      expect(Math.abs(box.width - width)).toBeLessThanOrEqual(1)
      expect(Math.abs(box.height - vh)).toBeLessThanOrEqual(1)

      await expect(dialog(page).getByRole('link', { name: 'Mlytics' })).toBeVisible()
      await expect(dialog(page).getByRole('button', { name: 'Close menu' })).toBeVisible()

      const rows = dialog(page).locator('ul > li')
      await expect(rows).toHaveCount(4)
      await expect(rows.locator('a')).toHaveText(['Media and Content', 'Brands', 'Developers', 'Partnership'])
      for (let i = 0; i < 4; i++) {
        const r = (await rows.nth(i).boundingBox())!
        // Full width of the padded list (viewport − 2×24px).
        expect(Math.abs(r.width - (width - 48))).toBeLessThanOrEqual(1)
        const divider = await rows.nth(i).evaluate((el) => {
          const cs = getComputedStyle(el)
          return { w: parseFloat(cs.borderBottomWidth), style: cs.borderBottomStyle }
        })
        expect(divider).toEqual({ w: 1, style: 'solid' })
      }

      const book = (await dialog(page).getByRole('link', { name: 'Book a Demo' }).boundingBox())!
      const tryAi = (await dialog(page).getByRole('link', { name: 'Try AI Mode' }).boundingBox())!
      expect(Math.abs(book.y - tryAi.y)).toBeLessThanOrEqual(0.5)
      expect(Math.abs(book.width - tryAi.width)).toBeLessThanOrEqual(1)
      expect(book.x + book.width).toBeLessThanOrEqual(tryAi.x)
      expect(tryAi.y + tryAi.height).toBeGreaterThanOrEqual(vh - 40)
      expect(tryAi.y + tryAi.height).toBeLessThanOrEqual(vh)

      expect(await page.evaluate(() => getComputedStyle(document.documentElement).overflow)).toBe('hidden')
      expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width)
    })

    test('traps focus, and Escape closes, restores focus and unlocks scroll', async ({ page }) => {
      await page.goto('/')
      const before = await page.evaluate(() => document.documentElement.style.overflow)
      await openOverlay(page)
      await expect(dialog(page).getByRole('button', { name: 'Close menu' })).toBeFocused()

      for (let i = 0; i < 10; i++) {
        await page.keyboard.press('Tab')
        expect(await focusInDialog(page), `Tab ${i + 1}`).toBe(true)
      }
      for (let i = 0; i < 10; i++) {
        await page.keyboard.press('Shift+Tab')
        expect(await focusInDialog(page), `Shift+Tab ${i + 1}`).toBe(true)
      }

      await page.keyboard.press('Escape')
      await expect(dialog(page)).toHaveCount(0)
      await expect(page.getByRole('button', { name: 'Open menu' })).toBeFocused()
      expect(await page.evaluate(() => document.documentElement.style.overflow)).toBe(before)
      expect(await page.evaluate(() => getComputedStyle(document.documentElement).overflow)).not.toBe('hidden')
    })

    test('Try AI Mode navigates, removes the dialog and unlocks scroll', async ({ page }) => {
      await page.goto('/')
      await openOverlay(page)
      await dialog(page).getByRole('link', { name: 'Try AI Mode' }).click()
      await page.waitForURL(/\/ai-mode-playground\/$/)
      await expect(dialog(page)).toHaveCount(0)
      expect(await page.evaluate(() => getComputedStyle(document.documentElement).overflow)).not.toBe('hidden')
      expect(await page.evaluate(() => getComputedStyle(document.body).overflow)).not.toBe('hidden')
      await expect(page.locator('nav.fixed')).not.toHaveAttribute('inert', /.*/)
    })
  })
}

test.describe('mobile overlay blank-space click at 375', () => {
  test.use({ viewport: { width: 375, height: 700 } })

  test('Escape still closes after clicking empty space in the dialog', async ({ page }) => {
    await page.goto('/')
    const before = await page.evaluate(() => getComputedStyle(document.documentElement).overflow)
    await openOverlay(page)
    // Empty area below the link list (the <ul> is flex-1, its rows end well above).
    const list = (await dialog(page).locator('ul').boundingBox())!
    const lastRow = (await dialog(page).locator('ul > li').last().boundingBox())!
    const y = Math.round((lastRow.y + lastRow.height + list.y + list.height) / 2)
    expect(y).toBeGreaterThan(lastRow.y + lastRow.height)
    await page.mouse.click(375 / 2, y)
    expect(await page.evaluate(() => document.activeElement?.getAttribute('role'))).toBe('dialog')
    // From the container, Shift+Tab enters the list at its last item.
    await page.keyboard.press('Shift+Tab')
    await expect(dialog(page).getByRole('link', { name: 'Try AI Mode' })).toBeFocused()
    // Back on the container, Escape closes.
    await page.mouse.click(375 / 2, y)
    expect(await page.evaluate(() => document.activeElement?.getAttribute('role'))).toBe('dialog')
    await page.keyboard.press('Escape')
    await expect(dialog(page)).toHaveCount(0)
    await expect(page.getByRole('button', { name: 'Open menu' })).toBeFocused()
    expect(await page.evaluate(() => getComputedStyle(document.documentElement).overflow)).toBe(before)
    expect(await page.evaluate(() => document.documentElement.style.overflow)).toBe('')
  })
})

test.describe('mobile overlay exit fade at 375', () => {
  test.use({ viewport: { width: 375, height: 700 } })

  test('the closing dialog is inert, aria-hidden and unclickable while it fades out', async ({ page }) => {
    await page.goto('/')
    await openOverlay(page)
    // Close, then record the dialog's state on every frame until it is
    // removed. No fixed-time sample: the fade length depends on the machine.
    const result = await page.evaluate(async () => {
      type Sample = { inert: boolean; ariaHidden: string | null; pointerEvents: string }
      const read = (el: HTMLElement): Sample => ({
        inert: el.hasAttribute('inert'),
        ariaHidden: el.getAttribute('aria-hidden'),
        pointerEvents: getComputedStyle(el).pointerEvents,
      })
      const frame = () => new Promise<void>((r) => requestAnimationFrame(() => r()))
      ;(document.querySelector('[aria-label="Close menu"]') as HTMLButtonElement).click()
      await Promise.resolve()
      await frame()
      const el = document.getElementById('mobile-menu')
      const first = el ? read(el) : null
      const samples: Sample[] = first ? [first] : []
      const deadline = performance.now() + 2000
      while (performance.now() < deadline) {
        await frame()
        const cur = document.getElementById('mobile-menu')
        if (!cur) return { first, samples, removed: true }
        samples.push(read(cur))
      }
      return { first, samples, removed: false }
    })
    const closing = { inert: true, ariaHidden: 'true', pointerEvents: 'none' }
    expect(result.first, 'dialog still mounted one frame after Close').not.toBeNull()
    expect(result.first).toEqual(closing)
    expect(result.removed, 'dialog removed within 2s').toBe(true)
    expect(result.samples.length).toBeGreaterThanOrEqual(1)
    for (const [n, sample] of result.samples.entries()) expect(sample, `frame ${n}`).toEqual(closing)
    await expect(page.locator('#mobile-menu')).toHaveCount(0)
    await expect(page.getByRole('button', { name: 'Open menu' })).toBeFocused()
  })
})

test.describe('mobile overlay double-tap on X at 375', () => {
  test.use({ viewport: { width: 375, height: 700 } })

  test('a second tap right after Close does not reopen the menu', async ({ page }) => {
    await page.goto('/')
    await openOverlay(page)
    const close = (await dialog(page).getByRole('button', { name: 'Close menu' }).boundingBox())!
    const x = close.x + close.width / 2
    const y = close.y + close.height / 2
    // Two taps at the X's position; the second lands on the hamburger beneath.
    await page.mouse.click(x, y)
    await page.mouse.click(x, y)
    await page.waitForTimeout(400)
    await expect(page.locator('#mobile-menu')).toHaveCount(0)
    await expect(page.getByRole('button', { name: 'Open menu' })).toHaveAttribute('aria-expanded', 'false')
    // A deliberate tap later still opens it.
    await openOverlay(page)
  })
})

test.describe('mobile overlay with reduced motion', () => {
  test.use({ viewport: { width: 375, height: 700 } })

  test('appears at full opacity immediately', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' })
    await page.goto('/')
    await page.getByRole('button', { name: 'Open menu' }).click()
    await expect(dialog(page)).toBeVisible()
    expect(await dialog(page).evaluate((el) => getComputedStyle(el).opacity)).toBe('1')
  })
})

test.describe('AI Mode playground after using the overlay', () => {
  test.use({ viewport: { width: 375, height: 812 } })

  test('sticky offset stays at the 65px nav bar', async ({ page }) => {
    await page.goto('/ai-mode-playground/')
    await page.addStyleTag({ content: 'html { scroll-behavior: auto !important }' })
    await openOverlay(page)
    await page.getByRole('button', { name: 'Close menu' }).click()
    await expect(dialog(page)).toHaveCount(0)

    const shell = page.locator('[class*="customerTabsShell"]')
    const stickyTop = () => shell.evaluate((el) => getComputedStyle(el).getPropertyValue('--playground-sticky-top').trim())
    await expect.poll(stickyTop).toBe('65px')

    const stage03 = (await page.locator('[data-stage="03"]').boundingBox())!
    await page.evaluate((top) => window.scrollTo({ top: Math.max(0, top - 120), behavior: 'auto' }), stage03.y + 200)
    await expect.poll(async () => (await shell.boundingBox())?.y ?? -1).toBeGreaterThanOrEqual(64)
    await expect.poll(async () => (await shell.boundingBox())?.y ?? -1).toBeLessThanOrEqual(66)
    expect(await stickyTop()).toBe('65px')
  })
})
