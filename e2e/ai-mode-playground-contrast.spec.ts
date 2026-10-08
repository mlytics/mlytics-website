import { expect, test } from '@playwright/test'
import {
  EXPERIENCE_LABELS,
  HERO,
  LENS_LABELS,
  UI,
} from '../components/pages/ai-mode-playground/ai-mode-playground-copy'

const lin = (c: number) => { c /= 255; return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4 }
const lum = (rgb: number[]) => 0.2126 * lin(rgb[0]) + 0.7152 * lin(rgb[1]) + 0.0722 * lin(rgb[2])
const ratio = (a: number[], b: number[]) => { const [x, y] = [lum(a), lum(b)].sort((m, n) => n - m); return (x + 0.05) / (y + 0.05) }
const round = (n: number) => Number(n.toFixed(2))

const SCOPE = '[data-playground-root]'

// The sweeps used to start at SCOPE, so the dark Hero and the section intro
// above the playground were never measured at all. They are in scope now.
// Nav and Footer deliberately are not: they are site-wide furniture that this
// ticket does not touch, and pulling them in would make this spec fail for
// reasons that belong to another change.
const SCAN_ROOTS = ['.ai-mode-playground-hero', '[data-playground-root]']
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
    expect.arrayContaining([HERO.eyebrow, HERO.title.slice(0, 40), EXPERIENCE_LABELS.chat]),
  )
  // Same for the section intro, which sits between the Hero and the playground.
  expect(samples.some((s) => s.text === HERO.copy.slice(0, 40))).toBe(true)
  // And for the tab labels the old leaf-only filter skipped entirely.
  expect(samples.some((s) => s.text === 'Chat')).toBe(true)

  const bad = failures('initial', samples)
  expect(bad, JSON.stringify(bad, null, 2)).toHaveLength(0)
})

test('Task 9 逐項：每個 tab 狀態與內文的實測對比', async ({ page }) => {
  await page.goto('/ai-mode-playground/')

  const measured: Record<string, { fg: number[]; bg: number[] }> = await page.evaluate(`(() => {
    ${HELPERS}
    const scope = document.querySelector('${SCOPE}')
    const find = (selector) => scope.querySelector(selector)
    return {
      'experience tab unselected': measure(find('#experience-tab-quote')),
      'experience tab selected': measure(find('#experience-tab-chat')),
      'customer tab unselected': measure(find('#customer-tab-brands')),
      'customer tab selected': measure(find('#customer-tab-content-owners')),
      cellKicker: measure(find('[class*="cellKicker"]')),
      cellLabel: measure(find('[class*="cellLabel"]')),
      stageKicker: measure(find('[class*="stageKicker"]')),
    }
  })()`)

  const results = Object.fromEntries(Object.entries(measured).map(([k, v]) => [k, round(ratio(v.fg, v.bg))]))
  // eslint-disable-next-line no-console
  console.log('contrast:', JSON.stringify(results, null, 2))
  for (const [name, r] of Object.entries(results)) expect(r, `${name} = ${r}`).toBeGreaterThanOrEqual(4.5)
})

test('選取中的 experience tab 使用 gold token 作為底線', async ({ page }) => {
  await page.goto('/ai-mode-playground/')
  const border = await page.evaluate(`getComputedStyle(document.querySelector('${SCOPE} [role="tablist"][aria-label="${UI.experienceTablistLabel}"] [role="tab"][aria-selected="true"]')).borderBottomColor`)
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
  const bad: ReturnType<typeof failures> = []
  const sweep = async (stage: string) => bad.push(...failures(stage, await page.evaluate(SCAN)))

  // Chat: answering a question emits the raw signal and changes the path copy.
  await page.getByRole('button', { name: /iPhone 18 Pro full specs/ }).click()
  await expect(page.locator('#stage-02-copy')).toContainText('iPhone 18 Pro full specs')
  await sweep('chat')

  // Quote: step labels, the signature hint, and the generated card.
  await page.getByRole('tab', { name: EXPERIENCE_LABELS.quote, exact: true }).click()
  await page.getByRole('button', { name: /Before you choose/ }).click()
  await page.getByRole('radio', { name: 'Resonates', exact: true }).click()
  await expect(page.getByRole('region', { name: UI.quote.previewLabel })).toBeVisible()
  await expect(page.getByRole('blockquote')).toBeVisible()
  await expect(page.getByText(UI.quote.anonymous)).toBeVisible()
  await expect(page.getByRole('region', { name: UI.quote.previewLabel }).getByRole('img', { name: 'Mlytics' })).toBeVisible()
  await sweep('quote')

  // Listen: playback state plus its own signal rows.
  await page.getByRole('tab', { name: EXPERIENCE_LABELS.listen, exact: true }).click()
  await page.getByRole('button', { name: UI.listen.play, exact: true }).click()
  await expect(page.getByRole('progressbar')).toBeVisible()
  await sweep('listen')

  // The Brands lens renders a different copy set through the same stages.
  await page.getByRole('tab', { name: LENS_LABELS.brands, exact: true }).click()
  await sweep('brands lens')

  expect(bad, JSON.stringify(bad, null, 2)).toHaveLength(0)
})

// WCAG 2.2 SC 1.4.11 Non-text Contrast: a focus indicator has to reach 3:1
// against the colours it sits next to. `outline-offset` puts this page's ring
// OUTSIDE the control, floating over whatever surface happens to be behind it
// — so the governing measurement is the ring colour against the composited
// background under the ring, found by hit-testing points the ring really
// paints, not against the control's own fill.
//
// Only the four side midpoints are sampled. The bounding box corners are not
// on the ring at all once the control is rounded (the Reset button is a pill),
// so sampling them would report a background the ring never touches.
//
// An indicator may be made of more than one band: an outline plus a
// box-shadow ring reads as one indicator, and it is enough for ONE band to
// clear 3:1 against a given neighbour as long as the bands also separate from
// each other — which is how a browser's own default focus ring stays visible
// on a background it cannot know in advance.
const RING = `
  const bandColors = (cs) => {
    const bands = [parse(cs.outlineColor)]
    const shadow = (cs.boxShadow || 'none').match(/rgba?\([^)]*\)/)
    if (shadow) bands.push(parse(shadow[0]))
    return bands
  }
  const ringBackgrounds = (el) => {
    const cs = getComputedStyle(el)
    const width = parseFloat(cs.outlineWidth) || 0
    const mid = (parseFloat(cs.outlineOffset) || 0) + width / 2
    const r = el.getBoundingClientRect()
    const cx = r.left + r.width / 2
    const cy = r.top + r.height / 2
    const points = [[cx, r.top - mid], [cx, r.bottom + mid], [r.left - mid, cy], [r.right + mid, cy]]
    const seen = []
    for (const [x, y] of points) {
      if (x < 0 || y < 0 || x > innerWidth || y > innerHeight) continue
      let hit = document.elementFromPoint(x, y)
      if (!hit) continue
      // The ring is painted outside the control's border box, so a hit on the
      // control itself would mean the point landed back inside it; step out.
      while (hit && (hit === el || el.contains(hit))) hit = hit.parentElement
      if (!hit) continue
      seen.push({ at: [Math.round(x), Math.round(y)], bg: bgOf(hit), tag: String(hit.className || hit.tagName).slice(0, 40) })
    }
    return { bands: bandColors(cs), width, samples: seen, focusVisible: el.matches(':focus-visible'), rect: [Math.round(r.left), Math.round(r.top), Math.round(r.width), Math.round(r.height)], viewport: [innerWidth, innerHeight] }
  }
`

type Ring = {
  bands: number[][]
  width: number
  focusVisible: boolean
  samples: { at: number[]; bg: number[]; tag: string }[]
}

// `finder` is a DOM expression rather than a Playwright locator: the ring has
// to be measured inside the page, where `:has-text()` and friends do not exist.
async function measureRing(
  page: import('@playwright/test').Page,
  finder: string,
  { refocus = true }: { refocus?: boolean } = {},
): Promise<Ring> {
  if (refocus) {
    // Chromium only matches :focus-visible on a programmatically focused button
    // when the last interaction was a keypress, so prime keyboard modality first.
    // Tab moves focus away; the focus() below takes it straight back.
    await page.keyboard.press('Tab')
    await page.evaluate(`(() => { ${finder}.focus() })()`)
  }
  // Let any scroll the page itself started (a completion scrolls the stage 02
  // signal into view with an explicit smooth behaviour) and any hover/focus
  // transition land before the ring is located, then centre the control.
  await page.waitForTimeout(400)
  await page.evaluate(`(() => { ${finder}.scrollIntoView({ block: 'center' }) })()`)
  return page.evaluate(`(() => {
    ${HELPERS}
    ${RING}
    return ringBackgrounds(${finder})
  })()`)
}

const EXPERIENCE_TAB = `[role="tablist"][aria-label="${UI.experienceTablistLabel}"] [role="tab"]`
const CUSTOMER_TAB = `[role="tablist"][aria-label="${UI.canvas.customerTablistLabel}"] [role="tab"]`
const byText = (text: string) =>
  `[...document.querySelectorAll('button')].find((b) => b.textContent.includes(${JSON.stringify(text)}))`
const first = (selector: string) => `document.querySelector(${JSON.stringify(selector)})`
const rgb = (c: number[]) => `rgb(${c.slice(0, 3).join(', ')})`

test('每一類控制項的 focus ring 對相鄰底色 ≥ 3:1（WCAG 1.4.11）', async ({ page }) => {
  await page.goto('/ai-mode-playground/')
  // The site scrolls smoothly, so scrollIntoView lands asynchronously and the
  // ring would be hit-tested at coordinates the page has already left behind.
  await page.addStyleTag({ content: '*, html { scroll-behavior: auto !important }' })
  const results: Record<string, { ratio: number; bands: string[]; worstBg: string; at: number[] }> = {}

  const check = async (name: string, finder: string, options?: { refocus?: boolean }) => {
    const ring = await measureRing(page, finder, options)
    expect(ring.focusVisible, `${name} 沒有進入 :focus-visible，量到的不是 focus ring`).toBe(true)
    expect(ring.width, `${name} 沒有 outline`).toBeGreaterThan(0)
    expect(ring.samples.length, `${name} 的 ring 四邊沒有全部取到相鄰底色`).toBe(4)
    // A multi-band indicator only holds together if the bands separate from
    // each other too; otherwise it is one blurred band, not two.
    if (ring.bands.length > 1) {
      const between = round(ratio(ring.bands[0], ring.bands[1]))
      expect(between, `${name} 兩層 ring 之間只有 ${between}:1`).toBeGreaterThanOrEqual(3)
    }
    const worst = ring.samples
      .map((s) => ({ ...s, r: Math.max(...ring.bands.map((band) => ratio(band, s.bg))) }))
      .sort((a, b) => a.r - b.r)[0]
    results[name] = {
      ratio: round(worst.r),
      bands: ring.bands.map(rgb),
      worstBg: rgb(worst.bg),
      at: worst.at,
    }
  }

  await check('experience tab', first(EXPERIENCE_TAB))
  await check('customer tab', first(CUSTOMER_TAB))
  await check('choice (chat question)', first('button[class*="choice"]'))
  await check('reset', first('button[class*="reset"]'))

  // A keyboard Chat answer moves focus to the stage 02 raw-signal copy. Its
  // ring is measured where the app put it, without re-focusing: the copy sits
  // in a boxed surface now, so the ring has to clear that box, not the page.
  await page.locator('button[class*="choice"]').first().focus()
  await page.keyboard.press('Enter')
  await expect(page.locator('#stage-02-copy')).toBeFocused()
  await check('stage 02 signal (after keyboard Chat answer)', first('#stage-02-copy'), { refocus: false })

  // Entering Quote renders its step controls and the signature input at once;
  // the share buttons only appear once a line is selected.
  await page.getByRole('tab', { name: EXPERIENCE_LABELS.quote, exact: true }).click()
  await expect(page.getByText(UI.quote.step1)).toBeVisible()
  await check('choice (quote option)', first('button[class*="choice"]'))
  await check('quoteFeedbackChoice', first('[role="radiogroup"][aria-label="' + UI.quote.feedbackLabel + '"] [role="radio"]'))
  await check('quote signature input', first('input[class*="signatureInput"]'))

  await page.locator('button[class*="choice"]').first().click()
  await page.getByRole('radio', { name: 'Helpful', exact: true }).click()
  await check('quoteAction', first('button[class*="shareButton"]'))

  await page.getByRole('tab', { name: EXPERIENCE_LABELS.listen, exact: true }).click()
  await check('listenToggle', first('button[class*="listenToggle"]'))
  await check('ctaPrimary', first('a[class*="ctaPrimary"]'))
  await check('ctaSecondary', first('a[class*="ctaSecondary"]'))

  // eslint-disable-next-line no-console
  console.log('focus ring 1.4.11:', JSON.stringify(results, null, 2))
  for (const [name, r] of Object.entries(results)) {
    expect(r.ratio, `${name} = ${r.ratio} (${r.bands.join(' + ')} on ${r.worstBg})`).toBeGreaterThanOrEqual(3)
  }
})
