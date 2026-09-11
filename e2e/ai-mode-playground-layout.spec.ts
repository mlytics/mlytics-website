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

test('純裝飾的 mono 微標籤已移除', async ({ page }) => {
  await page.goto('/ai-mode-playground/')
  const decorations = await page.evaluate(() => {
    const scope = document.querySelector('[aria-label="Mlytics AI Mode playground"]')!
    const pseudo = [...scope.querySelectorAll('*')]
      .map((e) => getComputedStyle(e, '::after').content)
      .filter((c) => c && c !== 'none' && c !== 'normal' && /[A-Z]{3,}/.test(c))
    return { pseudo, sourceStory: scope.textContent!.match(/Source story/i)?.length ?? 0 }
  })
  expect(decorations.pseudo).toEqual([])
  expect(decorations.sourceStory).toBe(0)
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
