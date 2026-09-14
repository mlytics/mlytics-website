import { expect, test } from '@playwright/test'

const lin = (c: number) => { c /= 255; return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4 }
const lum = (rgb: number[]) => 0.2126 * lin(rgb[0]) + 0.7152 * lin(rgb[1]) + 0.0722 * lin(rgb[2])
const ratio = (a: number[], b: number[]) => { const [x, y] = [lum(a), lum(b)].sort((m, n) => n - m); return (x + 0.05) / (y + 0.05) }
const round = (n: number) => Number(n.toFixed(2))

const SCOPE = '[aria-label="Mlytics AI Mode playground"]'

// The sweeps used to start at SCOPE, so the dark Hero and the section intro
// above the playground were never measured at all. They are in scope now.
// Nav and Footer deliberately are not: they are site-wide furniture that this
// ticket does not touch, and pulling them in would make this spec fail for
// reasons that belong to another change.
const SCAN_ROOTS = ['.ai-mode-playground-hero', 'section[aria-labelledby="playground-heading"]']
const ROOTS = JSON.stringify(SCAN_ROOTS)

type Sample = { text: string; fg: number[]; bg: number[]; selector: string }
const failures = (stage: string, samples: Sample[]) =>
  samples.map((s) => ({ stage, ...s, ratio: round(ratio(s.fg, s.bg)) })).filter((s) => s.ratio < 4.5)

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

  // What actually gets painted in this element's own color: its direct text
  // nodes. Filtering on \`children.length === 0\` instead — which is what this
  // spec used to do — silently skipped every element that mixes text with an
  // element child, and that is the exact shape of a mode tab
  // (\`Chat<small>Ask</small>\`). Six of them went unmeasured.
  const ownText = (el) => [...el.childNodes]
    .filter((n) => n.nodeType === 3)
    .map((n) => n.textContent)
    .join('')
    .trim()

  // Disabled controls are exempt from WCAG 1.4.3, so they are excluded on
  // purpose rather than by accident: with the filter above fixed, the disabled
  // \`More to come\` tab measures 2.67:1 and is allowed to. The per-item test
  // below drops disabled tabs the same way.
  const exempt = (el) =>
    el.closest('[aria-hidden="true"]') || el.closest(':disabled') || el.closest('[aria-disabled="true"]')

  const painted = (el) => {
    const r = el.getBoundingClientRect()
    return r.width > 0 && r.height > 0 && getComputedStyle(el).visibility !== 'hidden'
  }

  const scan = (selectors) => selectors
    .flatMap((sel) => [...document.querySelectorAll(sel)])
    .flatMap((root) => [root, ...root.querySelectorAll('*')])
    .filter((el) => ownText(el) && !exempt(el) && painted(el))
    .map((el) => ({ ...measure(el), text: ownText(el).slice(0, 40), selector: el.className || el.tagName }))
`

test('playground 初始畫面所有文字對比 ≥ 4.5', async ({ page }) => {
  await page.goto('/ai-mode-playground/')
  await expect(page.locator(SCOPE)).toHaveCount(1)

  const samples: Sample[] = await page.evaluate(`(() => {
    ${HELPERS}
    return scan(${ROOTS})
  })()`)

  expect(samples.length).toBeGreaterThan(10)

  // Pin the widened scope: if a refactor moves the Hero out from under
  // SCAN_ROOTS, this fails loudly instead of quietly measuring less.
  expect(samples.map((s) => s.text)).toEqual(
    expect.arrayContaining(['Mlytics AI Mode', 'One signal. Two values.']),
  )
  // Same for the section intro, which sits between the Hero and the playground.
  expect(samples.some((s) => s.text.startsWith('A small surface'))).toBe(true)
  // And for the tab labels the old leaf-only filter skipped entirely.
  expect(samples.some((s) => s.text === 'Chat')).toBe(true)

  const bad = failures('initial', samples)
  expect(bad, JSON.stringify(bad, null, 2)).toHaveLength(0)
})

test('Task 9 逐項：每個 tab 狀態與內文的實測對比', async ({ page }) => {
  await page.goto('/ai-mode-playground/')

  // Reach the grounded answer line, which only renders after a prompt is chosen.
  await page.getByRole('tablist', { name: 'AI Mode experiences' }).getByRole('tab', { name: /ask/i }).click()
  await page.locator('li button').first().click()
  await expect(page.getByText(/^Grounded in/)).toBeVisible()

  const measured: Record<string, { fg: number[]; bg: number[] }> = await page.evaluate(`(() => {
    ${HELPERS}
    const scope = document.querySelector('${SCOPE}')
    const inList = (label) => [...scope.querySelectorAll('[role="tablist"][aria-label="' + label + '"] [role="tab"]')]
    const modes = inList('AI Mode experiences').filter((t) => !t.disabled)
    const lenses = inList('Ledger lens')
    const modeOff = modes.find((t) => t.getAttribute('aria-selected') === 'false')
    const modeOn = modes.find((t) => t.getAttribute('aria-selected') === 'true')
    const lensOff = lenses.find((t) => t.getAttribute('aria-selected') === 'false')
    const lensOn = lenses.find((t) => t.getAttribute('aria-selected') === 'true')
    const grounded = [...scope.querySelectorAll('p')].find((p) => p.textContent.trim().startsWith('Grounded in'))
    return {
      'modeTab unselected': measure(modeOff),
      'modeTab small': measure(modeOff.querySelector('small')),
      'modeTab selected': measure(modeOn),
      'modeTab selected small': measure(modeOn.querySelector('small')),
      'answerGrounded': measure(grounded),
      'lensTab unselected': measure(lensOff),
      'lensTab unselected small': measure(lensOff.querySelector('small')),
      'lensTab selected': measure(lensOn),
      'lensTab selected small': measure(lensOn.querySelector('small')),
    }
  })()`)

  const results = Object.fromEntries(Object.entries(measured).map(([k, v]) => [k, round(ratio(v.fg, v.bg))]))
  // eslint-disable-next-line no-console
  console.log('contrast:', JSON.stringify(results, null, 2))
  for (const [name, r] of Object.entries(results)) expect(r, `${name} = ${r}`).toBeGreaterThanOrEqual(4.5)
})

test('選取中的 mode tab 使用 gold token 作為底線', async ({ page }) => {
  await page.goto('/ai-mode-playground/')
  const border = await page.evaluate(`getComputedStyle(document.querySelector('${SCOPE} [role="tablist"][aria-label="AI Mode experiences"] [role="tab"][aria-selected="true"]')).borderBottomColor`)
  expect(border).toBe('rgb(245, 158, 11)') // --color-gold
})

// The initial-render scan cannot see text that only exists after a click:
// signal-tone ledger rows, the quote builder's step labels and signature hint.
const SCAN = `(() => {
  ${HELPERS}
  return scan(${ROOTS})
})()`

test('playground 互動後狀態所有文字對比 ≥ 4.5', async ({ page }) => {
  await page.goto('/ai-mode-playground/')
  await expect(page.locator(SCOPE)).toHaveCount(1)
  const scope = page.locator(SCOPE)
  const bad: ReturnType<typeof failures> = []
  const sweep = async (stage: string) => bad.push(...failures(stage, await page.evaluate(SCAN)))

  // Chat: answering a question emits signal-tone ledger rows.
  const modeTab = (name: RegExp) => page.getByRole('tablist', { name: 'AI Mode experiences' }).getByRole('tab', { name })

  await modeTab(/ask/i).click()
  await page.locator('li button').first().click()
  await expect(page.getByText(/^Grounded in/)).toBeVisible()
  await expect(scope.locator("#lens-panel-brands [data-tone='signal']").first()).toBeVisible()
  await sweep('chat')

  // Quote: step labels, the signature hint, and the generated card.
  await modeTab(/amplify/i).click()
  await expect(page.getByText('1 · Choose a line')).toBeVisible()
  await page.getByRole('listitem').filter({ has: page.locator('button') }).first().locator('button').click()
  await page.getByRole('radio', { name: 'Great' }).click()
  await page.getByRole('button', { name: /quote card/i }).click()
  await expect(page.getByRole('region', { name: 'Quote preview' })).toBeVisible()
  await sweep('quote')

  // Listen: playback state plus its own signal rows.
  await modeTab(/attend/i).click()
  await page.getByRole('button', { name: 'Play' }).click()
  await expect(scope.locator("#lens-panel-brands [data-tone='signal']").first()).toBeVisible()
  await sweep('listen')

  // The media lens renders a different copy set through the same rows.
  await page.getByRole('tablist', { name: 'Ledger lens' }).getByRole('tab', { name: /Media and Content/ }).click()
  await expect(scope.locator("#lens-panel-content-owners [data-tone='signal']").first()).toBeVisible()
  await sweep('media lens')

  expect(bad, JSON.stringify(bad, null, 2)).toHaveLength(0)
})
