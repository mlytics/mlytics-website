import { expect, test } from '@playwright/test'

test('右欄首視線是 heading 與引導，不是 metrics 列', async ({ page }) => {
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
  expect(tops.heading).toBeLessThan(tops.metrics)
  expect(tops.guide).toBeLessThan(tops.metrics)
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
