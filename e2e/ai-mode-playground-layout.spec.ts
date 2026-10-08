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
  // The state styling is keyed on stageMain's own attributes (single-class
  // selectors), so it must still land on the box.
  await expect(page.locator('[data-stage="05"] [class*="stageMain"]')).toHaveCSS('border-top-color', 'rgba(34, 93, 89, 0.34)')
  await expect(page.locator('[data-stage="01"] [class*="stageMain"]')).toHaveCSS('border-top-color', 'rgba(34, 93, 89, 0.2)')

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

test('chat answer focuses the stage 02 signal and switches stage copy', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 })
  await page.goto('/ai-mode-playground/')
  await page.getByRole('button', { name: CHAT_QUESTIONS[0], exact: true }).click()
  // A Chat answer moves focus to the stage 02 raw-signal copy; the loop at the
  // end of this file checks that it lands fully in view below the sticky shell.
  await expect(page.locator('#stage-02-copy')).toBeFocused()
  await expect(page.locator('[data-stage="03"] [class*="cellBody"]').first()).toContainText('Are one product’s specs worth turning into a searchable piece')
})

test('stage 05 CTA sits 18px below the stage grid at 1280', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 })
  await page.goto('/ai-mode-playground/')
  const stage05 = page.locator('[data-stage="05"]')
  await stage05.scrollIntoViewIfNeeded()
  const grid = await stage05.locator('[class*="stageGrid"]').boundingBox()
  const cta = await stage05.locator('[role="group"][aria-labelledby^="cta-title-"]').boundingBox()
  expect(grid).not.toBeNull()
  expect(cta).not.toBeNull()
  expect(Math.abs(cta!.y - (grid!.y + grid!.height) - 18)).toBeLessThanOrEqual(1)
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

const expectVisibleListenIcon = async (page: Page, label: string) => {
  const toggle = page.getByRole('button', { name: label, exact: true })
  const icon = toggle.locator('svg')
  await expect(icon).toHaveCount(1)
  await expect(icon).toBeVisible()
  await expect(icon).toHaveAttribute('aria-hidden', 'true')
  const box = await icon.boundingBox()
  expect(box).not.toBeNull()
  expect(box!.width).toBeGreaterThan(0)
  expect(box!.height).toBeGreaterThan(0)
  const toggleBox = (await toggle.boundingBox())!
  expect(box!.x).toBeGreaterThanOrEqual(toggleBox.x)
  expect(box!.y).toBeGreaterThanOrEqual(toggleBox.y)
  expect(box!.x + box!.width).toBeLessThanOrEqual(toggleBox.x + toggleBox.width)
  expect(box!.y + box!.height).toBeLessThanOrEqual(toggleBox.y + toggleBox.height)
  const color = await icon.evaluate((element) => getComputedStyle(element).color)
  expect(color).toBe('rgb(255, 255, 255)')
}

for (const viewport of [{ width: 1280, height: 900 }, { width: 375, height: 812 }]) {
  test(`Listen toggle shows a visible play and pause icon at ${viewport.width}`, async ({ page }) => {
    await page.setViewportSize(viewport)
    await page.goto('/ai-mode-playground/')
    await page.getByRole('tab', { name: EXPERIENCE_LABELS.listen, exact: true }).click()
    await expectVisibleListenIcon(page, UI.listen.play)
    await page.getByRole('button', { name: UI.listen.play, exact: true }).click()
    await expectVisibleListenIcon(page, UI.listen.pause)
  })
}

const completions = [
  {
    name: 'Quote feedback',
    complete: async (page: Page) => {
      await page.getByRole('tab', { name: EXPERIENCE_LABELS.quote, exact: true }).click()
      await page.getByRole('button', { name: /Before you choose/ }).click()
      await page.getByRole('radio', { name: 'Helpful', exact: true }).focus()
      await page.keyboard.press('Space')
    },
  },
  {
    name: 'A Chat answer',
    complete: async (page: Page) => {
      await page.getByRole('button', { name: CHAT_QUESTIONS[0], exact: true }).focus()
      await page.keyboard.press('Enter')
    },
  },
]

const waitForSignalToSettle = (page: Page) => page.evaluate(() => new Promise<void>((resolve) => {
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

for (const viewport of [{ width: 1280, height: 800 }, { width: 375, height: 812 }, { width: 375, height: 667 }]) {
  for (const { name, complete } of completions) {
    test(`${name} brings the focused stage 02 signal fully into view below the sticky shell at ${viewport.width}×${viewport.height}`, async ({ page }) => {
      await page.setViewportSize(viewport)
      await page.goto('/ai-mode-playground/')
      await complete(page)

      const signal = page.locator('#stage-02-copy')
      await expect(signal).toBeFocused()
      // Smooth scrolling and the nav's hide/show both move things: wait until
      // scroll position and the signal's box hold still for several frames.
      await waitForSignalToSettle(page)
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
}

test.describe('with prefers-reduced-motion: reduce', () => {
  const reducedMotionCases = [
    {
      name: 'A Chat answer',
      prepare: async () => {},
      trigger: (page: Page) => page.getByRole('button', { name: CHAT_QUESTIONS[0], exact: true }),
      key: 'Enter',
    },
    {
      name: 'Quote feedback',
      prepare: async (page: Page) => {
        await page.getByRole('tab', { name: EXPERIENCE_LABELS.quote, exact: true }).click()
        await page.getByRole('button', { name: /Before you choose/ }).click()
      },
      trigger: (page: Page) => page.getByRole('radio', { name: 'Helpful', exact: true }),
      key: 'Space',
    },
  ]

  for (const { name, prepare, trigger, key } of reducedMotionCases) {
    test(`${name} jumps straight to the signal with no intermediate scroll frames`, async ({ page }) => {
      // A stacked phone layout puts the signal well below the control, so the
      // completion has a real distance to scroll.
      await page.setViewportSize({ width: 375, height: 667 })
      // `test.use({ reducedMotion })` does not reach the page under this
      // project config; emulateMedia does, and the check below proves it.
      await page.emulateMedia({ reducedMotion: 'reduce' })
      await page.goto('/ai-mode-playground/')
      expect(await page.evaluate(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches)).toBe(true)
      // The page-wide smooth scroll is still in force; the scroll call itself
      // has to opt out of it.
      expect(await page.evaluate(() => getComputedStyle(document.documentElement).scrollBehavior)).toBe('smooth')
      await prepare(page)
      const control = trigger(page)
      await control.scrollIntoViewIfNeeded()
      await waitForSignalToSettle(page)
      const before = await page.evaluate(() => window.scrollY)
      await page.evaluate(() => {
        const log: number[] = []
        ;(window as unknown as { __scrollLog: number[] }).__scrollLog = log
        window.addEventListener('scroll', () => log.push(window.scrollY), { passive: true })
      })
      await control.focus()
      await page.keyboard.press(key)
      await expect(page.locator('#stage-02-copy')).toBeFocused()
      // Sample scrollY on the next few frames: an instant scroll is already at
      // its final value on the first sample; a smooth one is still moving.
      const samples = await page.evaluate(() => new Promise<number[]>((resolve) => {
        const values: number[] = []
        const tick = () => {
          values.push(window.scrollY)
          if (values.length >= 6) resolve(values)
          else requestAnimationFrame(tick)
        }
        requestAnimationFrame(tick)
      }))
      const scrollLog = await page.evaluate(() => (window as unknown as { __scrollLog: number[] }).__scrollLog)
      expect(samples[0]).not.toBe(before)
      expect(samples).toEqual(samples.map(() => samples[0]))
      // Every scroll event saw the same position: there was one jump, no glide.
      expect(new Set(scrollLog)).toEqual(new Set([samples[0]]))
    })
  }
})

test('landscape phone: the stage 02 focus target and its ring stay in view below the nav at 568×320', async ({ page }) => {
  await page.setViewportSize({ width: 568, height: 320 })
  await page.goto('/ai-mode-playground/')
  // On a 320px-tall viewport the shell must not be sticky, or it covers most
  // of the space the completion scrolls the signal into.
  await expect(page.locator('[class*="customerTabsShell"]')).toHaveCSS('position', 'relative')
  await page.getByRole('button', { name: CHAT_QUESTIONS[0], exact: true }).focus()
  await page.keyboard.press('Enter')
  const signal = page.locator('#stage-02-copy')
  await expect(signal).toBeFocused()
  await waitForSignalToSettle(page)
  const geometry = await page.evaluate(() => {
    const element = document.getElementById('stage-02-copy')!
    const style = getComputedStyle(element)
    const rect = element.getBoundingClientRect()
    const ring = (parseFloat(style.outlineOffset) || 0) + (parseFloat(style.outlineWidth) || 0)
    const navBottom = Math.max(0, ...[...document.querySelectorAll('header, nav')].map((n) => n.getBoundingClientRect().bottom))
    // Whatever is painted on top at the text's centre and at the ring's top and
    // bottom edges must not be the customer tabs shell or the site nav.
    const covers = [...document.querySelectorAll('[class*="customerTabsShell"], header, nav')]
    const cx = rect.left + rect.width / 2
    const coveredPoints = [[cx, rect.top + rect.height / 2], [cx, rect.top - ring + 1], [cx, rect.bottom + ring - 1]]
      .filter(([x, y]) => {
        const hit = document.elementFromPoint(x, y)
        return !hit || covers.some((cover) => cover.contains(hit))
      })
    return {
      coveredPoints,
      focusVisible: element.matches(':focus-visible'),
      ring,
      text: { top: rect.top, bottom: rect.bottom, left: rect.left, right: rect.right },
      ringBox: { top: rect.top - ring, bottom: rect.bottom + ring, left: rect.left - ring, right: rect.right + ring },
      navBottom,
      viewport: { width: window.innerWidth, height: window.innerHeight },
    }
  })
  expect(geometry.focusVisible).toBe(true)
  expect(geometry.ring).toBeGreaterThan(0)
  expect(geometry.coveredPoints).toEqual([])
  for (const box of [geometry.text, geometry.ringBox]) {
    expect(box.top).toBeGreaterThanOrEqual(geometry.navBottom)
    expect(box.bottom).toBeLessThanOrEqual(geometry.viewport.height)
    expect(box.left).toBeGreaterThanOrEqual(0)
    expect(box.right).toBeLessThanOrEqual(geometry.viewport.width)
  }
})

test.describe('prototype parity', () => {
  test('section headings render bold (Tailwind preflight resets h1–h6 to inherit)', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 })
    await page.goto('/ai-mode-playground/')
    const headings = [
      page.locator('[class*="cardTitle"]').first(),
      page.locator('#canvas-title'),
      page.locator('#progress-stage-01'),
      page.locator('#progress-stage-05'),
      page.locator('[class*="pathsTitle"]'),
      page.locator('[class*="ctaTitle"]'),
    ]
    for (const heading of headings) await expect(heading).toHaveCSS('font-weight', '700')
    await expect(page.locator('#canvas-title')).toHaveCSS('font-size', '36px')
    const pathsTitle = page.locator('[class*="pathsTitle"]')
    await expect(pathsTitle).toHaveCSS('font-size', '24px')
    await expect(pathsTitle).toHaveCSS('text-transform', 'none')
    await expect(pathsTitle).toHaveCSS('color', 'rgb(26, 61, 58)')
    await page.setViewportSize({ width: 375, height: 812 })
    await expect(page.locator('#canvas-title')).toHaveCSS('font-size', '28.8px')
  })

  for (const { width, height, size } of [{ width: 375, height: 812, size: '18px' }, { width: 1280, height: 800, size: '24px' }]) {
    test(`experience card titles are ${size} at ${width}`, async ({ page }) => {
      await page.setViewportSize({ width, height })
      await page.goto('/ai-mode-playground/')
      for (const label of [EXPERIENCE_LABELS.chat, EXPERIENCE_LABELS.quote, EXPERIENCE_LABELS.listen]) {
        await experienceTabs(page).getByRole('tab', { name: label, exact: true }).click()
        const title = page.locator('[class*="cardTitle"]').filter({ visible: true })
        await expect(title).toHaveCount(1)
        await expect(title).toHaveCSS('font-size', size)
      }
    })
  }

  // Owner decision: Reset stays on the title row, pinned top-right, with its
  // TOP edge on the title's top edge, so a title that wraps grows downward
  // without dragging Reset with it.
  for (const { width, height } of [{ width: 320, height: 720 }, { width: 375, height: 812 }, { width: 1280, height: 800 }]) {
    test(`experience card Reset top-aligns with the title at ${width}`, async ({ page }) => {
      await page.setViewportSize({ width, height })
      await page.goto('/ai-mode-playground/')
      const lineCounts: Record<string, number> = {}
      for (const [key, label] of [['chat', EXPERIENCE_LABELS.chat], ['quote', EXPERIENCE_LABELS.quote], ['listen', EXPERIENCE_LABELS.listen]] as const) {
        await experienceTabs(page).getByRole('tab', { name: label, exact: true }).click()
        const header = page.locator('[class*="cardHeader"]').filter({ visible: true })
        await expect(header).toHaveCount(1)
        const m = await header.evaluate((el) => {
          const title = el.querySelector('h3') as HTMLElement
          const reset = el.querySelector('button') as HTMLElement
          const t = title.getBoundingClientRect()
          const r = reset.getBoundingClientRect()
          const h = el.getBoundingClientRect()
          const lineHeight = parseFloat(getComputedStyle(title).lineHeight)
          return {
            alignItems: getComputedStyle(el).alignItems,
            lines: Math.round(t.height / lineHeight),
            titleTop: t.top,
            resetTop: r.top,
            resetRight: r.right,
            headerRight: h.right,
            titleRight: t.right,
          }
        })
        lineCounts[key] = m.lines
        expect(m.alignItems, `${key} header alignment`).toBe('flex-start')
        expect(Math.abs(m.resetTop - m.titleTop), `${key} Reset top vs title top`).toBeLessThanOrEqual(1)
        expect(Math.abs(m.resetRight - m.headerRight), `${key} Reset right edge`).toBeLessThanOrEqual(1)
        expect(m.titleRight, `${key} title does not run under Reset`).toBeLessThanOrEqual(m.resetRight)
      }
      // The case this decision exists for: at 320 the Quote title wraps, and
      // Reset must still sit at its top (asserted above), not the middle.
      if (width === 320) expect(lineCounts.quote, 'Quote title wraps at 320').toBeGreaterThan(1)
      if (width === 1280) for (const key of ['chat', 'quote', 'listen']) expect(lineCounts[key], `${key} is one line on desktop`).toBe(1)
    })
  }

  test('the quote card has its gradient and both decorations', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 })
    await page.goto('/ai-mode-playground/')
    await page.getByRole('tab', { name: EXPERIENCE_LABELS.quote, exact: true }).click()
    await page.getByRole('button', { name: /Before you choose/ }).click()
    const card = page.locator('[class*="quoteCard"]')
    await expect(card).toBeVisible()
    const style = await card.evaluate((element) => {
      const own = getComputedStyle(element)
      const before = getComputedStyle(element, '::before')
      const after = getComputedStyle(element, '::after')
      return {
        backgroundImage: own.backgroundImage,
        position: own.position,
        overflow: own.overflow,
        isolation: own.isolation,
        before: { content: before.content, width: before.width, height: before.height, borderRadius: before.borderRadius, boxShadow: before.boxShadow },
        after: { content: after.content, fontFamily: after.fontFamily, position: after.position },
      }
    })
    expect(style.backgroundImage).toMatch(/^linear-gradient\(145deg, rgb\(26, 61, 58\) 0%, rgb\(34, 93, 89\) 62%, rgb\(45, 122, 116\) 100%\)/)
    expect(style.position).toBe('relative')
    expect(style.overflow).toBe('hidden')
    expect(style.isolation).toBe('isolate')
    expect(style.before.content).toBe('""')
    expect(style.before.width).toBe('220px')
    expect(style.before.height).toBe('220px')
    expect(style.before.borderRadius).toBe('50%')
    // Two halo rings around the circle.
    expect(style.before.boxShadow.match(/rgba?\(/g)).toHaveLength(2)
    // The quote mark is decoration: empty alt text keeps it out of the
    // accessibility tree.
    expect(style.after.content).toBe('"“" / ""')
    expect(style.after.fontFamily).toMatch(/Georgia/)
    expect(style.after.position).toBe('absolute')
    // The share row sits 24px below the card.
    const cardBox = (await card.boundingBox())!
    const shareBox = (await page.locator('[class*="shareActions"]').boundingBox())!
    expect(Math.abs(shareBox.y - (cardBox.y + cardBox.height) - 24)).toBeLessThanOrEqual(1)
  })

  // The card clips its decorations (overflow: hidden), so a sponsor row that
  // does not fit would cut the logo off. The label stays on one line, and the
  // logo shrinks or wraps under it instead.
  for (const { width, height } of [{ width: 320, height: 720 }, { width: 375, height: 812 }, { width: 768, height: 1024 }, { width: 1280, height: 800 }]) {
    test(`the quote card's sponsor row fits without clipping the logo at ${width}`, async ({ page }) => {
      await page.setViewportSize({ width, height })
      await page.goto('/ai-mode-playground/')
      await page.getByRole('tab', { name: EXPERIENCE_LABELS.quote, exact: true }).click()
      await page.getByRole('button', { name: /Before you choose/ }).click()
      const card = page.locator('[class*="quoteCard"]')
      const logo = card.getByRole('img', { name: 'Mlytics' })
      await expect(logo).toBeVisible()
      await expect.poll(() => logo.evaluate((img) => (img as HTMLImageElement).complete && (img as HTMLImageElement).naturalWidth > 0)).toBe(true)
      const m = await card.evaluate((el) => {
        const rect = (e: Element) => { const r = e.getBoundingClientRect(); return { left: r.left, top: r.top, right: r.right, bottom: r.bottom, width: r.width, height: r.height } }
        const sponsor = el.querySelector('[class*="sponsor"]')!
        const label = el.querySelector('[class*="sponsorLabel"]')!
        const img = el.querySelector('img') as HTMLImageElement
        const range = document.createRange()
        range.selectNodeContents(label)
        return {
          card: rect(el),
          sponsor: rect(sponsor),
          label: rect(label),
          logo: rect(img),
          labelLines: new Set([...range.getClientRects()].map((r) => Math.round(r.top))).size,
          aspect: img.naturalWidth / img.naturalHeight,
        }
      })
      const inside = (inner: typeof m.logo, outer: typeof m.card) =>
        inner.left >= outer.left - 0.5 && inner.right <= outer.right + 0.5 && inner.top >= outer.top - 0.5 && inner.bottom <= outer.bottom + 0.5
      expect(inside(m.logo, m.card), `logo ${JSON.stringify(m.logo)} inside card ${JSON.stringify(m.card)}`).toBe(true)
      expect(inside(m.logo, m.sponsor), `logo ${JSON.stringify(m.logo)} inside sponsor ${JSON.stringify(m.sponsor)}`).toBe(true)
      expect(inside(m.label, m.sponsor), `label ${JSON.stringify(m.label)} inside sponsor ${JSON.stringify(m.sponsor)}`).toBe(true)
      expect(m.labelLines, 'SPONSORED BY stays on one line').toBe(1)
      // Shrinking keeps the logo's proportions, it never squashes.
      expect(Math.abs(m.logo.width / m.logo.height - m.aspect), 'logo aspect ratio').toBeLessThanOrEqual(0.1)
    })
  }

  // A typed signature can be one unbroken run (an email, a URL). The card
  // clips with overflow: hidden, so a run that cannot wrap is cut off
  // silently instead of scrolling. It has to wrap inside the card.
  // No spaces or hyphens, so the browser has no ordinary break opportunity.
  const UNBROKEN_SIGNATURE = 'jordanleemontgomery@acmepublishinggroupinternational.example'
  for (const { width, height } of [{ width: 320, height: 720 }, { width: 375, height: 812 }, { width: 768, height: 1024 }, { width: 1280, height: 800 }]) {
    test(`a long unbroken signature wraps inside the quote card at ${width}`, async ({ page }) => {
      expect(UNBROKEN_SIGNATURE).toHaveLength(60)
      expect(UNBROKEN_SIGNATURE).not.toMatch(/[\s-]/)
      await page.setViewportSize({ width, height })
      await page.goto('/ai-mode-playground/')
      await page.getByRole('tab', { name: EXPERIENCE_LABELS.quote, exact: true }).click()
      await page.getByRole('button', { name: /Before you choose/ }).click()
      await page.getByRole('textbox', { name: UI.quote.signatureLabel }).fill(UNBROKEN_SIGNATURE)
      const card = page.locator('[class*="quoteCard"]')
      const signature = card.locator('[class*="signatureText"]')
      await expect(signature).toHaveText(UNBROKEN_SIGNATURE)
      const m = await signature.evaluate((el) => {
        const rect = (e: Element) => { const r = e.getBoundingClientRect(); return { left: r.left, top: r.top, right: r.right, bottom: r.bottom } }
        const range = document.createRange()
        range.selectNodeContents(el)
        const text = range.getBoundingClientRect()
        return {
          scrollWidth: el.scrollWidth,
          clientWidth: el.clientWidth,
          signature: rect(el),
          // The glyphs themselves, not just the box: an overflowing run
          // spills out of a fixed-width box without growing it.
          text: { left: text.left, top: text.top, right: text.right, bottom: text.bottom },
          card: rect(el.closest('[class*="quoteCard"]')!),
        }
      })
      const inside = (inner: typeof m.card, outer: typeof m.card) =>
        inner.left >= outer.left - 0.5 && inner.right <= outer.right + 0.5 && inner.top >= outer.top - 0.5 && inner.bottom <= outer.bottom + 0.5
      expect(m.scrollWidth, `signature scrollWidth ${m.scrollWidth} vs clientWidth ${m.clientWidth}`).toBeLessThanOrEqual(m.clientWidth + 1)
      expect(inside(m.signature, m.card), `signature ${JSON.stringify(m.signature)} inside card ${JSON.stringify(m.card)}`).toBe(true)
      expect(inside(m.text, m.card), `signature text ${JSON.stringify(m.text)} inside card ${JSON.stringify(m.card)}`).toBe(true)
    })
  }

  test('stage 01 and 02 copy sit in a boxed surface', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 })
    await page.goto('/ai-mode-playground/')
    for (const id of ['#stage-01-copy', '#stage-02-copy']) {
      const box = page.locator(id).locator('..')
      await expect(box).toHaveCSS('padding', '14px')
      await expect(box).toHaveCSS('border-top-width', '1px')
      await expect(box).toHaveCSS('border-top-color', 'rgba(34, 93, 89, 0.16)')
      await expect(box).toHaveCSS('border-radius', '10px')
      await expect(box).toHaveCSS('background-color', 'rgba(255, 255, 255, 0.72)')
    }
  })

  for (const { width, height, x, w } of [{ width: 1280, height: 800, x: 98, w: 1084 }, { width: 375, height: 812, x: 36, w: 303 }]) {
    test(`the experience module lines up with the canvas content at ${width}`, async ({ page }) => {
      await page.setViewportSize({ width, height })
      await page.goto('/ai-mode-playground/')
      const module = await page.getByRole('tablist', { name: UI.experienceTablistLabel }).locator('..').boundingBox()
      const canvasHead = await page.locator('#canvas-title').locator('..').boundingBox()
      expect(module).not.toBeNull()
      expect(canvasHead).not.toBeNull()
      expect(Math.abs(module!.x - canvasHead!.x)).toBeLessThanOrEqual(1)
      expect(Math.abs(module!.width - canvasHead!.width)).toBeLessThanOrEqual(1)
      // Pinned to the prototype's measured geometry.
      expect(Math.abs(module!.x - x)).toBeLessThanOrEqual(1)
      expect(Math.abs(module!.width - w)).toBeLessThanOrEqual(1)
    })
  }
})
