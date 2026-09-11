import { expect, test } from '@playwright/test'

test('metrics 列回到 ledger 上方（比照 UAT）', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 })
  await page.goto('/ai-mode-playground/')

  const tops = await page.evaluate(() => {
    const ledger = document.querySelector('[aria-label="Experience ledger"]')!
    const visible = (el: Element) => (el as HTMLElement).offsetParent !== null
    const heading = [...ledger.querySelectorAll('h2')].find(visible)!
    const guide = [...ledger.querySelectorAll('b')].filter((b) => /Nothing captured yet/i.test(b.textContent ?? '')).find(visible)!
    const metrics = ledger.querySelector('[aria-label="Preview metrics"]')!
    return {
      heading: heading.getBoundingClientRect().top,
      guide: guide.getBoundingClientRect().top,
      metrics: metrics.getBoundingClientRect().top,
    }
  })

  // eslint-disable-next-line no-console
  console.log('ledger tops:', JSON.stringify(tops))
  expect(tops.metrics).toBeLessThan(tops.heading)
  expect(tops.metrics).toBeLessThan(tops.guide)
})

// `● LIVE PLAYGROUND` is the one pseudo label An asked to keep: it marks the
// left column as the live thing rather than a screenshot. Everything else that
// Task 11 stripped must stay stripped.
test('只留下 ● LIVE PLAYGROUND 這一個 mono 微標籤', async ({ page }) => {
  await page.goto('/ai-mode-playground/')
  const decorations = await page.evaluate(() => {
    const scope = document.querySelector('[aria-label="Mlytics AI Mode playground"]')!
    const pseudo = [...scope.querySelectorAll('*')]
      .map((e) => getComputedStyle(e, '::after').content)
      .filter((c) => c && c !== 'none' && c !== 'normal' && /[A-Z]{3,}/.test(c))
    return { pseudo, sourceStory: scope.textContent!.match(/Source story/i)?.length ?? 0 }
  })
  // eslint-disable-next-line no-console
  console.log('pseudo labels:', JSON.stringify(decorations.pseudo))
  expect(decorations.pseudo).toEqual(['"●  LIVE PLAYGROUND"'])
  expect(decorations.sourceStory).toBe(0)
})

test('● LIVE PLAYGROUND 用 token 顏色，且對比達 AA', async ({ page }) => {
  await page.goto('/ai-mode-playground/')
  const measured = await page.evaluate(() => {
    const el = [...document.querySelectorAll('*')].find(
      (e) => getComputedStyle(e, '::after').content.includes('LIVE PLAYGROUND'),
    )!
    const parse = (c: string) => c.match(/[\d.]+/g)!.map(Number)
    const over = (top: number[], bottom: number[]) => {
      const a = top.length > 3 ? top[3] : 1
      return [0, 1, 2].map((i) => Math.round(a * top[i] + (1 - a) * bottom[i]))
    }
    const layers: number[][] = []
    let n: Element | null = el
    while (n) {
      const c = parse(getComputedStyle(n).backgroundColor)
      if (!(c.length > 3 && c[3] === 0)) {
        layers.push(c)
        if (c.length === 3 || c[3] === 1) break
      }
      n = n.parentElement
    }
    return {
      fg: parse(getComputedStyle(el, '::after').color),
      bg: layers.reduceRight((acc, layer) => over(layer, acc), [255, 255, 255]),
    }
  })

  const lin = (c: number) => { c /= 255; return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4 }
  const lum = (rgb: number[]) => 0.2126 * lin(rgb[0]) + 0.7152 * lin(rgb[1]) + 0.0722 * lin(rgb[2])
  const [x, y] = [lum(measured.fg), lum(measured.bg)].sort((m, n) => n - m)
  const ratio = Number(((x + 0.05) / (y + 0.05)).toFixed(2))

  // eslint-disable-next-line no-console
  console.log('LIVE PLAYGROUND:', JSON.stringify({ ...measured, ratio }))
  expect(measured.fg).toEqual([45, 122, 116]) // --color-primary-light
  expect(ratio).toBeGreaterThanOrEqual(4.5)
})

test('lens tablist 的 roving tabindex 與方向鍵（實機按鍵）', async ({ page }) => {
  await page.goto('/ai-mode-playground/')
  const lens = page.getByRole('tablist', { name: 'Ledger lens' })
  const media = lens.getByRole('tab', { name: /Media and Content/ })
  const brand = lens.getByRole('tab', { name: /^Brand/ })

  const snapshot = async () => page.evaluate(() => {
    const tabs = [...document.querySelectorAll('[role="tablist"][aria-label="Ledger lens"] [role="tab"]')]
    return {
      tabindex: tabs.map((t) => t.getAttribute('tabindex')),
      selected: tabs.map((t) => t.getAttribute('aria-selected')),
      focused: tabs.findIndex((t) => t === document.activeElement),
    }
  })

  // The page defaults to the brand lens, so assert the invariant rather than a fixed pair:
  // exactly one tab is in the tab order, and it is the selected one.
  const start = await snapshot()
  // eslint-disable-next-line no-console
  console.log('initial:', JSON.stringify(start))
  expect(start.tabindex.filter((t) => t === '0')).toHaveLength(1)
  expect(start.tabindex.indexOf('0')).toBe(start.selected.indexOf('true'))

  await media.focus()
  await page.keyboard.press('ArrowRight')
  const afterRight = await snapshot()
  // eslint-disable-next-line no-console
  console.log('after ArrowRight:', JSON.stringify(afterRight))
  expect(afterRight.selected).toEqual(['false', 'true'])
  expect(afterRight.tabindex).toEqual(['-1', '0'])
  expect(afterRight.focused).toBe(1)
  await expect(brand).toBeFocused()

  await page.keyboard.press('ArrowLeft')
  const afterLeft = await snapshot()
  // eslint-disable-next-line no-console
  console.log('after ArrowLeft:', JSON.stringify(afterLeft))
  expect(afterLeft.selected).toEqual(['true', 'false'])
  expect(afterLeft.tabindex).toEqual(['0', '-1'])
  await expect(media).toBeFocused()

  await page.keyboard.press('ArrowDown')
  await expect(brand).toBeFocused()
  await expect(brand).toHaveAttribute('aria-selected', 'true')

  await page.keyboard.press('ArrowUp')
  await expect(media).toBeFocused()
  await expect(media).toHaveAttribute('aria-selected', 'true')

  await page.keyboard.press('End')
  await expect(brand).toBeFocused()
  await expect(brand).toHaveAttribute('aria-selected', 'true')

  await page.keyboard.press('Home')
  await expect(media).toBeFocused()
  await expect(media).toHaveAttribute('aria-selected', 'true')
})

// Manual activation, unlike the lens tablist: selecting a mode resets the
// playground, so arrows must only move focus.
test('mode tablist 的 manual activation 方向鍵（實機按鍵）', async ({ page }) => {
  await page.goto('/ai-mode-playground/')
  const list = page.getByRole('tablist', { name: 'AI Mode experiences' })
  const chat = list.getByRole('tab', { name: /^Chat/ })
  const quote = list.getByRole('tab', { name: /Make a quote/ })
  const listen = list.getByRole('tab', { name: /^Listen/ })
  const more = list.getByRole('tab', { name: /More to come/ })

  const snapshot = async () => page.evaluate(() => {
    const tabs = [...document.querySelectorAll('[role="tablist"][aria-label="AI Mode experiences"] [role="tab"]')]
    return {
      tabindex: tabs.map((t) => t.getAttribute('tabindex')),
      selected: tabs.map((t) => t.getAttribute('aria-selected')),
      focused: tabs.findIndex((t) => t === document.activeElement),
    }
  })

  const start = await snapshot()
  // eslint-disable-next-line no-console
  console.log('mode initial:', JSON.stringify(start))
  expect(start.tabindex).toEqual(['0', '-1', '-1', '-1'])
  expect(start.selected).toEqual(['true', 'false', 'false', 'false'])

  await chat.focus()
  await page.keyboard.press('ArrowRight')
  const afterRight = await snapshot()
  // eslint-disable-next-line no-console
  console.log('mode after ArrowRight:', JSON.stringify(afterRight))
  expect(afterRight.focused).toBe(1)
  expect(afterRight.selected).toEqual(start.selected) // selection unmoved
  await expect(quote).toBeFocused()

  await page.keyboard.press('ArrowRight')
  await expect(listen).toBeFocused()
  // Listen is the last enabled tab: forward wraps past the disabled one.
  await page.keyboard.press('ArrowRight')
  await expect(more).not.toBeFocused()
  await expect(chat).toBeFocused()

  await page.keyboard.press('ArrowLeft')
  await expect(more).not.toBeFocused()
  await expect(listen).toBeFocused()

  await page.keyboard.press('Home')
  await expect(chat).toBeFocused()
  await page.keyboard.press('End')
  await expect(listen).toBeFocused()

  const beforeEnter = await snapshot()
  // eslint-disable-next-line no-console
  console.log('mode before Enter:', JSON.stringify(beforeEnter))
  expect(beforeEnter.selected).toEqual(start.selected)

  await page.keyboard.press('Enter')
  await expect(listen).toHaveAttribute('aria-selected', 'true')
  const afterEnter = await snapshot()
  // eslint-disable-next-line no-console
  console.log('mode after Enter:', JSON.stringify(afterEnter))
  expect(afterEnter.selected).toEqual(['false', 'false', 'true', 'false'])
  expect(afterEnter.tabindex).toEqual(['-1', '-1', '0', '-1'])

  // Space activates too.
  await page.keyboard.press('Home')
  await expect(chat).toBeFocused()
  await page.keyboard.press(' ')
  await expect(chat).toHaveAttribute('aria-selected', 'true')
})

test('mode 方向鍵不會觸發 reset——已產生的事件留著', async ({ page }) => {
  await page.goto('/ai-mode-playground/')
  const rows = () => page.locator("#lens-panel-brands [data-tone]")

  await page.locator('li button').first().click()
  await expect(rows().first()).toBeVisible()
  const before = await rows().count()

  await page.getByRole('tablist', { name: 'AI Mode experiences' }).getByRole('tab', { name: /^Chat/ }).focus()
  for (const key of ['ArrowRight', 'ArrowRight', 'ArrowLeft', 'Home', 'End']) await page.keyboard.press(key)

  const after = await rows().count()
  // eslint-disable-next-line no-console
  console.log('ledger rows before/after arrowing:', before, after)
  expect(after).toBe(before)
  await expect(page.getByText(/^Grounded in/)).toBeVisible()
})
