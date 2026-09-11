import { expect, test } from '@playwright/test'

const lin = (c: number) => { c /= 255; return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4 }
const lum = (rgb: number[]) => 0.2126 * lin(rgb[0]) + 0.7152 * lin(rgb[1]) + 0.0722 * lin(rgb[2])
const ratio = (a: number[], b: number[]) => { const [x, y] = [lum(a), lum(b)].sort((m, n) => n - m); return (x + 0.05) / (y + 0.05) }
const round = (n: number) => Number(n.toFixed(2))

const SCOPE = '[aria-label="Mlytics AI Mode playground"]'

// Resolves an element's effective background by compositing translucent ancestor
// layers, and skips aria-hidden subtrees (decoration, outside WCAG 1.4.3).
const HELPERS = `
  const parse = (c) => c.match(/[\\d.]+/g).map(Number)
  const over = (top, bottom) => {
    const a = top.length > 3 ? top[3] : 1
    return [0, 1, 2].map((i) => Math.round(a * top[i] + (1 - a) * bottom[i]))
  }
  const bgOf = (el) => {
    const layers = []
    let n = el
    while (n) {
      const c = parse(getComputedStyle(n).backgroundColor)
      if (!(c.length > 3 && c[3] === 0)) {
        layers.push(c)
        if (c.length === 3 || c[3] === 1) break
      }
      n = n.parentElement
    }
    return layers.reduceRight((acc, layer) => over(layer, acc), [255, 255, 255])
  }
  const measure = (el) => ({ text: el.textContent.trim().slice(0, 40), fg: parse(getComputedStyle(el).color), bg: bgOf(el) })
`

test('playground 初始畫面所有文字對比 ≥ 4.5', async ({ page }) => {
  await page.goto('/ai-mode-playground/')
  await expect(page.locator(SCOPE)).toHaveCount(1)

  const samples: { text: string; fg: number[]; bg: number[] }[] = await page.evaluate(`(() => {
    ${HELPERS}
    const scope = document.querySelector('${SCOPE}')
    return [...scope.querySelectorAll('*')]
      .filter((e) => {
        if (e.children.length > 0 || !e.textContent.trim()) return false
        if (e.closest('[aria-hidden="true"]')) return false
        const r = e.getBoundingClientRect()
        return r.width > 0 && r.height > 0 && getComputedStyle(e).visibility !== 'hidden'
      })
      .map(measure)
  })()`)

  expect(samples.length).toBeGreaterThan(10)
  const bad = samples.map((s) => ({ ...s, ratio: round(ratio(s.fg, s.bg)) })).filter((s) => s.ratio < 4.5)
  expect(bad, JSON.stringify(bad, null, 2)).toHaveLength(0)
})

test('Task 9 逐項：五個指定選擇器的實測對比', async ({ page }) => {
  await page.goto('/ai-mode-playground/')

  // Reach the grounded answer line, which only renders after a prompt is chosen.
  await page.getByRole('tab', { name: /ask/i }).click()
  await page.locator('li button').first().click()
  await expect(page.getByText(/^Grounded in/)).toBeVisible()

  const measured: Record<string, { fg: number[]; bg: number[] }> = await page.evaluate(`(() => {
    ${HELPERS}
    const scope = document.querySelector('${SCOPE}')
    const tabs = [...scope.querySelectorAll('[role="tab"]')]
    const unselected = tabs.find((t) => t.getAttribute('aria-selected') === 'false')
    const selected = tabs.find((t) => t.getAttribute('aria-selected') === 'true')
    const grounded = [...scope.querySelectorAll('p')].find((p) => p.textContent.trim().startsWith('Grounded in'))
    const radios = [...scope.querySelectorAll('[role="radio"]')]
    return {
      'modeTab unselected': measure(unselected),
      'modeTab small': measure(unselected.querySelector('small')),
      'modeTab selected': measure(selected),
      'answerGrounded': measure(grounded),
      'lensSwitch unchecked': measure(radios.find((r) => r.getAttribute('aria-checked') === 'false')),
      'lensSwitch checked': measure(radios.find((r) => r.getAttribute('aria-checked') === 'true')),
    }
  })()`)

  const results = Object.fromEntries(Object.entries(measured).map(([k, v]) => [k, round(ratio(v.fg, v.bg))]))
  // eslint-disable-next-line no-console
  console.log('contrast:', JSON.stringify(results, null, 2))
  for (const [name, r] of Object.entries(results)) expect(r, `${name} = ${r}`).toBeGreaterThanOrEqual(4.5)
})

test('選取中的 mode tab 使用 gold token 作為底線', async ({ page }) => {
  await page.goto('/ai-mode-playground/')
  const border = await page.evaluate(`getComputedStyle(document.querySelector('${SCOPE} [role="tab"][aria-selected="true"]')).borderBottomColor`)
  expect(border).toBe('rgb(245, 158, 11)') // --color-gold
})

// The initial-render scan cannot see text that only exists after a click:
// signal-tone ledger rows, the quote builder's step labels and signature hint.
// Disabled controls are exempt from WCAG 1.4.3, so they stay out of the scan.
const SCAN = `(() => {
  ${HELPERS}
  const scope = document.querySelector('${SCOPE}')
  return [...scope.querySelectorAll('*')]
    .filter((e) => {
      if (e.children.length > 0 || !e.textContent.trim()) return false
      if (e.closest('[aria-hidden="true"]') || e.closest(':disabled')) return false
      const r = e.getBoundingClientRect()
      return r.width > 0 && r.height > 0 && getComputedStyle(e).visibility !== 'hidden'
    })
    .map((e) => ({ ...measure(e), selector: e.className || e.tagName }))
})()`

type Sample = { text: string; fg: number[]; bg: number[]; selector: string }
const failures = (stage: string, samples: Sample[]) =>
  samples.map((s) => ({ stage, ...s, ratio: round(ratio(s.fg, s.bg)) })).filter((s) => s.ratio < 4.5)

test('playground 互動後狀態所有文字對比 ≥ 4.5', async ({ page }) => {
  await page.goto('/ai-mode-playground/')
  await expect(page.locator(SCOPE)).toHaveCount(1)
  const scope = page.locator(SCOPE)
  const bad: ReturnType<typeof failures> = []
  const sweep = async (stage: string) => bad.push(...failures(stage, await page.evaluate(SCAN)))

  // Chat: answering a question emits signal-tone ledger rows.
  await page.getByRole('tab', { name: /ask/i }).click()
  await page.locator('li button').first().click()
  await expect(page.getByText(/^Grounded in/)).toBeVisible()
  await expect(scope.locator("#lens-panel-brands [data-tone='signal']").first()).toBeVisible()
  await sweep('chat')

  // Quote: step labels, the signature hint, and the generated card.
  await page.getByRole('tab', { name: /amplify/i }).click()
  await expect(page.getByText('1 · Choose a line')).toBeVisible()
  await page.getByRole('listitem').filter({ has: page.locator('button') }).first().locator('button').click()
  await page.getByRole('radio', { name: 'Great' }).click()
  await page.getByRole('button', { name: /quote card/i }).click()
  await expect(page.getByRole('region', { name: 'Quote preview' })).toBeVisible()
  await sweep('quote')

  // Listen: playback state plus its own signal rows.
  await page.getByRole('tab', { name: /attend/i }).click()
  await page.getByRole('button', { name: 'Play' }).click()
  await expect(scope.locator("#lens-panel-brands [data-tone='signal']").first()).toBeVisible()
  await sweep('listen')

  // The media lens renders a different copy set through the same rows.
  await page.getByRole('radio', { name: 'Media and Content' }).click()
  await expect(scope.locator("#lens-panel-content-owners [data-tone='signal']").first()).toBeVisible()
  await sweep('media lens')

  expect(bad, JSON.stringify(bad, null, 2)).toHaveLength(0)
})
