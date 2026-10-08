import { expect, test, type Page } from '@playwright/test'
import {
  CHAT_QUESTIONS,
  EXPERIENCE_LABELS,
  LENS_LABELS,
  UI,
} from '../components/pages/ai-mode-playground/ai-mode-playground-copy'

const experienceTabs = (page: Page) =>
  page.getByRole('tablist', { name: UI.experienceTablistLabel })

test('customer tabs use automatic activation and roving focus', async ({ page }) => {
  await page.goto('/ai-mode-playground/')
  const list = page.getByRole('tablist', { name: UI.canvas.customerTablistLabel })
  const contentOwners = list.getByRole('tab', { name: LENS_LABELS['content-owners'], exact: true })
  const brands = list.getByRole('tab', { name: LENS_LABELS.brands, exact: true })

  await expect(contentOwners).toHaveAttribute('aria-selected', 'true')
  await expect(contentOwners).toHaveAttribute('tabindex', '0')
  await expect(brands).toHaveAttribute('aria-selected', 'false')
  await contentOwners.focus()
  await page.keyboard.press('ArrowRight')
  await expect(brands).toBeFocused()
  await expect(brands).toHaveAttribute('aria-selected', 'true')
  await page.keyboard.press('ArrowLeft')
  await expect(contentOwners).toBeFocused()
  await page.keyboard.press('ArrowDown')
  await expect(brands).toBeFocused()
  await page.keyboard.press('ArrowUp')
  await expect(contentOwners).toBeFocused()
  await page.keyboard.press('End')
  await expect(brands).toBeFocused()
  await page.keyboard.press('Home')
  await expect(contentOwners).toBeFocused()
})

test('experience tabs use manual activation without losing captures', async ({ page }) => {
  await page.goto('/ai-mode-playground/')
  const list = experienceTabs(page)
  const chat = list.getByRole('tab', { name: EXPERIENCE_LABELS.chat, exact: true })
  const quote = list.getByRole('tab', { name: EXPERIENCE_LABELS.quote, exact: true })
  const listen = list.getByRole('tab', { name: EXPERIENCE_LABELS.listen, exact: true })

  await expect(chat).toHaveAttribute('tabindex', '0')
  await expect(quote).toHaveAttribute('tabindex', '-1')
  await chat.focus()
  await page.keyboard.press('ArrowRight')
  await expect(quote).toBeFocused()
  await expect(chat).toHaveAttribute('aria-selected', 'true')
  await page.keyboard.press('ArrowRight')
  await expect(listen).toBeFocused()
  await page.keyboard.press('ArrowRight')
  await expect(chat).toBeFocused()
  await page.keyboard.press('End')
  await expect(listen).toBeFocused()
  await page.keyboard.press('Enter')
  await expect(listen).toHaveAttribute('aria-selected', 'true')
  await page.keyboard.press('Home')
  await expect(chat).toBeFocused()
  await page.keyboard.press(' ')
  await expect(chat).toHaveAttribute('aria-selected', 'true')

  await page.getByRole('button', { name: CHAT_QUESTIONS[0], exact: true }).click()
  await chat.focus()
  await page.keyboard.press('ArrowRight')
  await page.keyboard.press('ArrowRight')
  await page.keyboard.press('ArrowLeft')
  await page.keyboard.press('Home')
  await page.keyboard.press('End')
  await expect(page.locator('#stage-02-copy')).toContainText(CHAT_QUESTIONS[0])
})

test('sticky lens shell, active rail, and mobile canvas remain usable', async ({ page }) => {
  await page.setViewportSize({ width: 900, height: 800 })
  await page.goto('/ai-mode-playground/')
  await page.addStyleTag({ content: 'html { scroll-behavior: auto !important }' })
  const shell = page.locator('[class*="customerTabsShell"]')
  const stage03 = await page.locator('[data-stage="03"]').boundingBox()
  expect(stage03).not.toBeNull()
  await page.evaluate((top) => window.scrollTo({ top: Math.max(0, top - 120), behavior: 'auto' }), stage03!.y + 200)
  await expect.poll(async () => (await shell.boundingBox())?.y ?? -1).toBeLessThanOrEqual(66)
  await expect.poll(async () => (await shell.boundingBox())?.y ?? -1).toBeGreaterThanOrEqual(64)
  const geometry = await page.evaluate(() => {
    const shell = document.querySelector('[class*="customerTabsShell"]')!.getBoundingClientRect()
    const nav = [...document.querySelectorAll('header, nav')]
      .map((element) => element.getBoundingClientRect().bottom)
      .filter((bottom) => bottom > 0)
      .sort((a, b) => b - a)[0]
    return { shellTop: shell.top, navBottom: nav }
  })
  expect(geometry.shellTop).toBeGreaterThanOrEqual(64)
  expect(geometry.shellTop).toBeLessThanOrEqual(66)
  expect(geometry.navBottom).toBe(65)

  await page.setViewportSize({ width: 1280, height: 900 })
  await page.goto('/ai-mode-playground/')
  await page.locator('[data-stage="05"]').scrollIntoViewIfNeeded()
  await expect(page.locator('[data-stage="05"]')).toHaveAttribute('data-state', 'active')
  await expect(page.locator('[data-stage="01"]')).toHaveAttribute('data-state', 'past')

  await page.setViewportSize({ width: 375, height: 812 })
  await page.goto('/ai-mode-playground/')
  const noOverflow = async () => expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(375)
  await noOverflow()
  await page.getByRole('tab', { name: EXPERIENCE_LABELS.quote, exact: true }).click()
  await page.getByRole('button', { name: /Before you choose/ }).click()
  await noOverflow()
  await page.getByRole('tab', { name: LENS_LABELS.brands, exact: true }).click()
  await noOverflow()
  await expect(page.locator('[class*="stageGrid"]').first().locator('article')).toHaveCount(2)
  const cells = page.locator('[data-stage="03"] article')
  const firstCell = await cells.nth(0).boundingBox()
  const secondCell = await cells.nth(1).boundingBox()
  expect(firstCell).not.toBeNull()
  expect(secondCell).not.toBeNull()
  expect(Math.abs(firstCell!.x - secondCell!.x)).toBeLessThan(1)
  const pathTag = page.locator('[data-stage="03"] [class*="cellPathTag"]').first()
  await expect(pathTag).toBeVisible()
  expect((await pathTag.boundingBox())?.width ?? 0).toBeGreaterThan(1)
  await expect(pathTag).toHaveCSS('font-size', '12px')
  await expect(page.locator('[data-stage="03"] [class*="cellKicker"]').first()).toHaveCSS('font-size', '12px')
  const ctaActions = page.locator('[data-stage="05"] [class*="ctaActions"]')
  const ctaWidth = (await ctaActions.boundingBox())?.width ?? 0
  for (const cta of await page.locator('[data-stage="05"] [class*="ctaPrimary"], [data-stage="05"] [class*="ctaSecondary"]').all()) {
    expect(Math.abs(((await cta.boundingBox())?.width ?? 0) - ctaWidth)).toBeLessThanOrEqual(1)
  }
})

test('sticky lens shell follows the desktop nav as it hides and shows, leaving no gap above it', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 })
  await page.goto('/ai-mode-playground/')
  await page.addStyleTag({ content: 'html { scroll-behavior: auto !important }' })
  const shell = page.locator('[class*="customerTabsShell"]')
  const nav = page.locator('nav').first()
  await expect(nav).toHaveCSS('position', 'fixed')

  const readGeometry = () => page.evaluate(() => {
    const shellRect = document.querySelector('[class*="customerTabsShell"]')!.getBoundingClientRect()
    const navElement = document.querySelector('nav')!
    const navRect = navElement.getBoundingClientRect()
    const probe = document.elementFromPoint(window.innerWidth / 2, 10)
    const shellElement = document.querySelector('[class*="customerTabsShell"]')!
    return {
      shellTop: shellRect.top,
      navBottom: navRect.bottom,
      stripCovered: !!probe && (shellElement.contains(probe) || navElement.contains(probe)),
    }
  })
  const waitForNavToSettle = () => page.evaluate(() => new Promise<void>((resolve) => {
    const navElement = document.querySelector('nav')!
    let last = Number.NaN
    let stable = 0
    const tick = () => {
      const bottom = navElement.getBoundingClientRect().bottom
      stable = bottom === last && navElement.getAnimations().length === 0 ? stable + 1 : 0
      last = bottom
      if (stable >= 5) resolve()
      else requestAnimationFrame(tick)
    }
    requestAnimationFrame(tick)
  }))

  const stage03 = await page.locator('[data-stage="03"]').boundingBox()
  expect(stage03).not.toBeNull()
  const target = stage03!.y + 200
  for (let y = 0; y <= target; y += 100) {
    await page.evaluate((top) => window.scrollTo({ top, behavior: 'auto' }), y)
    await page.waitForTimeout(16)
  }
  await page.evaluate((top) => window.scrollTo({ top, behavior: 'auto' }), target)
  await waitForNavToSettle()
  await expect.poll(async () => (await readGeometry()).shellTop).toBeLessThanOrEqual(1)
  const hidden = await readGeometry()
  expect(hidden.navBottom).toBeLessThanOrEqual(0)
  expect(hidden.shellTop).toBeGreaterThanOrEqual(-1)
  expect(hidden.shellTop).toBeLessThanOrEqual(1)
  expect(hidden.stripCovered).toBe(true)
  await expect(shell).toHaveCSS('background-color', 'rgb(255, 255, 255)')
  await expect(shell).toHaveCSS('background-image', /linear-gradient/)

  for (let y = target; y >= target - 120; y -= 20) {
    await page.evaluate((top) => window.scrollTo({ top, behavior: 'auto' }), y)
    await page.waitForTimeout(16)
  }
  await waitForNavToSettle()
  await expect.poll(async () => (await readGeometry()).navBottom).toBeGreaterThanOrEqual(64)
  await expect.poll(async () => (await readGeometry()).shellTop).toBeGreaterThanOrEqual(64)
  const shown = await readGeometry()
  expect(shown.navBottom).toBeGreaterThanOrEqual(64)
  expect(shown.navBottom).toBeLessThanOrEqual(66)
  expect(shown.shellTop).toBeGreaterThanOrEqual(64)
  expect(shown.shellTop).toBeLessThanOrEqual(66)
  expect(Math.abs(shown.shellTop - shown.navBottom)).toBeLessThanOrEqual(1)
  expect(shown.stripCovered).toBe(true)
})

test('chat answer scrolls to the canvas and switches stage copy', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 })
  await page.goto('/ai-mode-playground/')
  await page.getByRole('button', { name: CHAT_QUESTIONS[0], exact: true }).click()
  // A Chat answer moves focus to the stage 02 raw-signal copy.
  await expect(page.locator('#stage-02-copy')).toBeFocused()
  await expect(page.locator('[data-stage="03"] [class*="cellBody"]').first()).toContainText('Are one product’s specs worth turning into a searchable piece')
  await expect.poll(async () => (await page.locator('#canvas-title').boundingBox())?.y ?? -1).toBeGreaterThanOrEqual(65)
  await expect.poll(async () => (await page.locator('#canvas-title').boundingBox())?.y ?? -1).toBeLessThanOrEqual(140)
})

test('path tags are visually hidden on desktop but present in the DOM', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 })
  await page.goto('/ai-mode-playground/')
  const tag = page.locator('[data-stage="03"] [class*="cellPathTag"]').first()
  await expect(tag).toContainText('Content Experience')
  await expect(tag).toHaveCSS('width', '1px')
  expect((await page.locator('[data-stage="03"] article').first().textContent()) ?? '').toContain('Content Experience')
})

test('Listen progresses and incomplete playback resets when changing experience', async ({ page }) => {
  await page.goto('/ai-mode-playground/')
  await page.getByRole('tab', { name: EXPERIENCE_LABELS.listen, exact: true }).click()
  await page.getByRole('button', { name: UI.listen.play, exact: true }).click()
  await expect(page.getByRole('progressbar')).toHaveAttribute('aria-valuenow', /[2-9]|[12][0-9]/, { timeout: 3000 })
  await page.getByRole('tab', { name: EXPERIENCE_LABELS.chat, exact: true }).click()
  await page.getByRole('tab', { name: EXPERIENCE_LABELS.listen, exact: true }).click()
  await expect(page.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '0')
})

for (const viewport of [{ width: 1280, height: 800 }, { width: 375, height: 812 }]) {
  test(`Quote feedback brings the focused stage 02 signal fully into view below the sticky shell at ${viewport.width}×${viewport.height}`, async ({ page }) => {
    await page.setViewportSize(viewport)
    await page.goto('/ai-mode-playground/')
    await page.getByRole('tab', { name: EXPERIENCE_LABELS.quote, exact: true }).click()
    await page.getByRole('button', { name: /Before you choose/ }).click()
    await page.getByRole('radio', { name: 'Helpful', exact: true }).focus()
    await page.keyboard.press('Space')

    const signal = page.locator('#stage-02-copy')
    await expect(signal).toBeFocused()
    // Smooth scrolling and the nav's hide/show both move things: wait until
    // scroll position and the signal's box hold still for several frames.
    await page.evaluate(() => new Promise<void>((resolve) => {
      const element = document.getElementById('stage-02-copy')!
      let last = ''
      let stable = 0
      const tick = () => {
        const key = `${window.scrollY}:${element.getBoundingClientRect().top}`
        stable = key === last ? stable + 1 : 0
        last = key
        if (stable >= 10) resolve()
        else requestAnimationFrame(tick)
      }
      requestAnimationFrame(tick)
    }))
    const geometry = await page.evaluate(() => {
      const signalRect = document.getElementById('stage-02-copy')!.getBoundingClientRect()
      const shellRect = document.querySelector('[class*="customerTabsShell"]')!.getBoundingClientRect()
      const navBottom = [...document.querySelectorAll('header, nav')]
        .map((element) => element.getBoundingClientRect().bottom)
        .reduce((max, bottom) => Math.max(max, bottom), 0)
      return {
        top: signalRect.top,
        bottom: signalRect.bottom,
        coveredUntil: Math.max(shellRect.bottom, navBottom),
        viewportHeight: window.innerHeight,
        active: document.activeElement?.id,
      }
    })
    expect(geometry.active).toBe('stage-02-copy')
    expect(geometry.top).toBeGreaterThanOrEqual(geometry.coveredUntil)
    expect(geometry.bottom).toBeLessThanOrEqual(geometry.viewportHeight)
  })
}
