import { expect, test, type Page } from '@playwright/test'
import {
  CAPTURE,
  EXPERIENCE_DEFAULT_OBSERVATION,
  EXPERIENCE_LABELS,
  LISTEN_AUDIO_SRC,
  LISTEN_TRANSCRIPT_SENTENCES,
  LISTEN_TRANSCRIPT_TEXT,
  UI,
} from '../components/pages/ai-mode-playground/ai-mode-playground-copy'

const openListen = async (page: Page) => {
  await page.goto('/ai-mode-playground/')
  await page.getByRole('tab', { name: EXPERIENCE_LABELS.listen, exact: true }).click()
}

const audio = (page: Page) => page.locator('audio')
const audioState = (page: Page) =>
  audio(page).evaluate((element: HTMLAudioElement) => ({
    paused: element.paused,
    currentTime: element.currentTime,
    duration: element.duration,
  }))

test('the browser can play AAC in an MP4 container', async ({ page }) => {
  await page.goto('/ai-mode-playground/')
  const support = await page.evaluate(() => document.createElement('audio').canPlayType('audio/mp4; codecs="mp4a.40.2"'))
  expect(support).not.toBe('')
})

test('the narrated overview is served as AAC audio with range support', async ({ request }) => {
  const response = await request.get(LISTEN_AUDIO_SRC)
  expect(response.status()).toBe(200)
  expect(response.headers()['content-type']).toMatch(/^audio\/(mp4|x-m4a)/)
  const size = (await response.body()).length
  expect(size).toBeGreaterThan(100 * 1024)
  expect(size).toBeLessThan(400 * 1024)
  const ranged = await request.get(LISTEN_AUDIO_SRC, { headers: { Range: 'bytes=0-1' } })
  expect(ranged.status()).toBe(206)
})

test('Listen plays the real audio and completes from the media element', async ({ page }) => {
  await openListen(page)
  await page.getByRole('button', { name: UI.listen.play, exact: true }).click()
  const progress = page.getByRole('progressbar')
  await expect(progress).toHaveAttribute('aria-valuenow', /^([1-9]|[12][0-9])$/, { timeout: 10_000 })
  const { duration } = await audioState(page)
  expect(Math.round(duration)).toBe(27)

  await audio(page).evaluate((element: HTMLAudioElement) => { element.currentTime = element.duration - 0.5 })
  const completed = CAPTURE.listen({ status: 'completed', elapsed: 27 })
  await expect(page.locator('#stage-01-copy')).toContainText(completed.observation, { timeout: 10_000 })
  await expect(page.locator('#stage-02-copy')).toContainText(completed.rawSignal)
  await expect(progress).toHaveAttribute('aria-valuenow', '27')
  await expect(page.getByRole('button', { name: UI.listen.replay, exact: true })).toBeVisible()
  await expect(page.locator('#stage-02-copy')).toBeFocused()

  await page.getByRole('button', { name: UI.listen.replay, exact: true }).click()
  await expect.poll(async () => (await audioState(page)).paused).toBe(false)
  expect((await audioState(page)).currentTime).toBeLessThan(2)
})

test('leaving Listen or resetting it mid-play stops and rewinds the audio', async ({ page }) => {
  await openListen(page)
  const progress = page.getByRole('progressbar')
  await page.getByRole('button', { name: UI.listen.play, exact: true }).click()
  await expect(progress).toHaveAttribute('aria-valuenow', /^([1-9]|[12][0-9])$/, { timeout: 10_000 })
  await page.getByRole('tab', { name: EXPERIENCE_LABELS.chat, exact: true }).click()
  await expect.poll(() => audioState(page)).toMatchObject({ paused: true, currentTime: 0 })
  await page.getByRole('tab', { name: EXPERIENCE_LABELS.listen, exact: true }).click()
  await expect(progress).toHaveAttribute('aria-valuenow', '0')

  await page.getByRole('button', { name: UI.listen.play, exact: true }).click()
  await expect(progress).toHaveAttribute('aria-valuenow', /^([1-9]|[12][0-9])$/, { timeout: 10_000 })
  await page.getByRole('button', { name: UI.reset, exact: true }).click()
  await expect.poll(() => audioState(page)).toMatchObject({ paused: true, currentTime: 0 })
  await expect(progress).toHaveAttribute('aria-valuenow', '0')
})

test('a failed audio load shows an honest error state with Try again', async ({ page }) => {
  await page.route('**/audio/*.m4a', (route) => route.abort())
  await openListen(page)
  await page.getByRole('button', { name: UI.listen.play, exact: true }).click()
  await expect(page.locator('#listen-error')).toHaveText(UI.listen.error, { timeout: 10_000 })
  await expect(page.getByRole('button', { name: UI.listen.retry, exact: true })).toBeVisible()
  await expect(page.locator('#stage-01-copy')).toContainText(EXPERIENCE_DEFAULT_OBSERVATION.listen)
  await expect(page.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '0')
})

test('the transcript disclosure opens from the keyboard', async ({ page }) => {
  await openListen(page)
  const details = page.locator('details', { has: page.locator('summary', { hasText: UI.listen.transcript }) })
  await expect(details).not.toHaveAttribute('open', '')
  await page.locator('summary', { hasText: UI.listen.transcript }).focus()
  await page.keyboard.press('Enter')
  await expect(details).toHaveAttribute('open', '')
  await expect(details.locator('p')).toHaveCount(3)
})

const fillOf = (page: Page) => page.getByRole('progressbar').locator('span').first()
const widthRatio = (page: Page) =>
  page.getByRole('progressbar').evaluate((bar) => {
    const fill = bar.firstElementChild as HTMLElement
    return fill.getBoundingClientRect().width / bar.getBoundingClientRect().width
  })

test('the progress bar is a thin, display-only YouTube-style bar that moves smoothly', async ({ page }) => {
  await openListen(page)
  const bar = page.getByRole('progressbar')
  expect((await bar.boundingBox())!.height).toBe(4)
  await expect(page.getByRole('slider')).toHaveCount(0)
  // No thumb, no seek affordance: the fill is the only child and nothing suggests dragging.
  expect(await bar.evaluate((element) => element.children.length)).toBe(1)
  expect(await bar.evaluate((element) => getComputedStyle(element).cursor)).not.toBe('pointer')
  const colours = await bar.evaluate((element) => {
    const probe = document.createElement('span')
    probe.style.color = 'var(--color-primary)'
    document.body.append(probe)
    const primary = getComputedStyle(probe).color
    probe.remove()
    return { primary, fill: getComputedStyle(element.firstElementChild as HTMLElement).backgroundColor }
  })
  expect(colours.fill).toBe(colours.primary)

  const time = page.locator('[class*="listenTime"]:not([class*="listenTimeTotal"])')
  await expect(time).toHaveText(/^0:\d\d \/ 0:27$/)
  await expect(time).toHaveText('0:00 / 0:27')
  await expect(bar).toHaveAttribute('aria-valuetext', '0 of 27 seconds')

  await page.getByRole('button', { name: UI.listen.play, exact: true }).click()
  await expect(bar).toHaveAttribute('aria-valuenow', /^([1-9]|[12][0-9])$/, { timeout: 10_000 })
  // Right after a whole-second step, sample twice ~300 ms apart: the reducer
  // value (aria-valuenow) stays the same while the fill keeps growing.
  const samples = await bar.evaluate(async (element) => {
    const fill = element.firstElementChild as HTMLElement
    const now = () => element.getAttribute('aria-valuenow')
    const start = now()
    await new Promise<void>((resolve) => {
      const wait = () => (now() !== start ? resolve() : requestAnimationFrame(wait))
      wait()
    })
    const first = { value: now(), width: fill.getBoundingClientRect().width }
    await new Promise((resolve) => setTimeout(resolve, 300))
    return { first, second: { value: now(), width: fill.getBoundingClientRect().width } }
  })
  expect(samples.second.value).toBe(samples.first.value)
  expect(samples.second.width).toBeGreaterThan(samples.first.width)
  await expect(time).toHaveText(/^0:\d\d \/ 0:27$/)
  await expect(fillOf(page)).toBeVisible()
})

test.describe('with prefers-reduced-motion: reduce', () => {
  test('the fill still reaches 100% on completion', async ({ page }) => {
    // Same approach as the layout spec: emulateMedia reaches the page under this project config.
    await page.emulateMedia({ reducedMotion: 'reduce' })
    await openListen(page)
    expect(await page.evaluate(() => matchMedia('(prefers-reduced-motion: reduce)').matches)).toBe(true)
    await page.getByRole('button', { name: UI.listen.play, exact: true }).click()
    await expect(page.getByRole('progressbar')).toHaveAttribute('aria-valuenow', /^([1-9]|[12][0-9])$/, { timeout: 10_000 })
    await audio(page).evaluate((element: HTMLAudioElement) => { element.currentTime = element.duration - 0.5 })
    await expect(page.getByRole('button', { name: UI.listen.replay, exact: true })).toBeVisible({ timeout: 10_000 })
    await expect.poll(() => widthRatio(page)).toBeCloseTo(1, 2)
    await expect(page.locator('[class*="listenTime"]:not([class*="listenTimeTotal"])')).toHaveText('0:27 / 0:27')
  })
})

test('the transcript highlights the sentence being spoken, in sync with the real audio', async ({ page }) => {
  await openListen(page)
  await audio(page).evaluate((element: HTMLAudioElement) => { element.muted = true })
  await page.locator('summary', { hasText: UI.listen.transcript }).click()
  const details = page.locator('details', { has: page.locator('summary', { hasText: UI.listen.transcript }) })
  const current = details.locator('[aria-current="true"]')
  const sentence = (index: number) => details.locator(`[data-sentence="${index}"]`)
  await expect(details.locator('p')).toHaveText([...LISTEN_TRANSCRIPT_TEXT])
  await expect(details.locator('[data-sentence]')).toHaveText(LISTEN_TRANSCRIPT_SENTENCES.map((item) => item.text))
  await expect(current).toHaveCount(0)

  await page.getByRole('button', { name: UI.listen.play, exact: true }).click()
  await expect(page.getByRole('progressbar')).toHaveAttribute('aria-valuenow', /^([1-9]|[12][0-9])$/, { timeout: 10_000 })
  await audio(page).evaluate((element: HTMLAudioElement) => { element.currentTime = 15 })
  await expect(sentence(4)).toHaveAttribute('aria-current', 'true', { timeout: 500 })
  await expect(current).toHaveCount(1)
  const colours = await sentence(4).evaluate((element) => {
    const probe = document.createElement('span')
    probe.style.color = 'var(--color-primary)'
    document.body.append(probe)
    const primary = getComputedStyle(probe).color
    probe.remove()
    return { primary, text: getComputedStyle(element).color }
  })
  // Allow the <=150ms colour transition to finish before comparing.
  await expect.poll(() => sentence(4).evaluate((element) => getComputedStyle(element).color)).toBe(colours.primary)

  await audio(page).evaluate((element: HTMLAudioElement) => { element.currentTime = 24.5 })
  await expect(sentence(7)).toHaveAttribute('aria-current', 'true', { timeout: 500 })
  await expect(current).toHaveCount(1)

  await page.getByRole('button', { name: UI.listen.replay, exact: true }).waitFor({ timeout: 10_000 })
  await expect(current).toHaveCount(0)

  await page.getByRole('button', { name: UI.listen.replay, exact: true }).click()
  await audio(page).evaluate((element: HTMLAudioElement) => { element.currentTime = 15 })
  await expect(sentence(4)).toHaveAttribute('aria-current', 'true', { timeout: 500 })
  await page.getByRole('button', { name: UI.reset, exact: true }).click()
  await expect(current).toHaveCount(0)
  await expect(details.locator('p')).toHaveText([...LISTEN_TRANSCRIPT_TEXT])
})

test('pausing real playback after the opening sponsor shows the paused signal', async ({ page }) => {
  await openListen(page)
  await audio(page).evaluate((element: HTMLAudioElement) => { element.muted = true })
  await page.getByRole('button', { name: UI.listen.play, exact: true }).click()
  await expect(page.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '4', { timeout: 10_000 })
  await page.getByRole('button', { name: UI.listen.pause, exact: true }).click()
  await expect(page.locator('#stage-01-copy')).toHaveText(
    /^The user listened for \d+ seconds \(\d+%\), then paused\. The opening sponsor message \(demo sponsor: Mlytics\) played\.$/,
  )
  await expect(page.locator('#stage-02-copy')).toContainText(
    /Paused at \d+ of 27 seconds \(\d+%\)\. Opening sponsor message \(demo sponsor: Mlytics\): played\. Closing sponsor message: not played\./,
  )
})

for (const { width, height } of [{ width: 1280, height: 800 }, { width: 375, height: 812 }]) {
  test(`the completed state shows the lucide RotateCcw replay icon, centred, at ${width}`, async ({ page }) => {
    await page.setViewportSize({ width, height })
    await openListen(page)
    await audio(page).evaluate((element: HTMLAudioElement) => { element.muted = true })
    await page.getByRole('button', { name: UI.listen.play, exact: true }).click()
    await expect(page.getByRole('progressbar')).toHaveAttribute('aria-valuenow', /^([1-9]|[12][0-9])$/, { timeout: 10_000 })
    await audio(page).evaluate((element: HTMLAudioElement) => { element.currentTime = element.duration - 0.5 })
    const replay = page.getByRole('button', { name: UI.listen.replay, exact: true })
    await expect(replay).toBeVisible({ timeout: 10_000 })
    const icon = replay.locator('svg.lucide-rotate-ccw')
    await expect(icon).toHaveCount(1)
    await expect(icon).toBeVisible()
    await expect(icon).toHaveAttribute('aria-hidden', 'true')
    const m = await replay.evaluate((button) => {
      const svg = button.querySelector('svg') as SVGSVGElement
      const b = button.getBoundingClientRect()
      const s = svg.getBoundingClientRect()
      // Union of the drawn path geometry, so the check is optical, not just the 24-unit box.
      const rects = Array.from(svg.querySelectorAll('path')).map((path) => path.getBoundingClientRect())
      const left = Math.min(...rects.map((r) => r.left))
      const right = Math.max(...rects.map((r) => r.right))
      const top = Math.min(...rects.map((r) => r.top))
      const bottom = Math.max(...rects.map((r) => r.bottom))
      return {
        size: [s.width, s.height],
        dx: (left + right) / 2 - (b.left + b.width / 2),
        dy: (top + bottom) / 2 - (b.top + b.height / 2),
        colour: getComputedStyle(svg).color,
        background: getComputedStyle(button).backgroundColor,
      }
    })
    expect(m.size).toEqual([18, 18])
    expect(Math.abs(m.dx)).toBeLessThanOrEqual(1)
    expect(Math.abs(m.dy)).toBeLessThanOrEqual(1)
    expect(m.colour).not.toBe(m.background)
  })
}

// One row at every width (owner "combo" decision at <=560px: 36px play,
// 8px gaps, current time only). The bar is the item that shrinks.
test('the player is one centred row at 1280, 375 and 320, and the bar is what shrinks', async ({ page }) => {
  const barWidths: Record<number, number> = {}
  for (const { width, height, phone } of [
    { width: 1280, height: 800, phone: false },
    { width: 375, height: 812, phone: true },
    { width: 320, height: 720, phone: true },
  ]) {
    await page.setViewportSize({ width, height })
    await openListen(page)
    const m = await page.getByRole('progressbar').evaluate((bar) => {
      const row = bar.parentElement as HTMLElement
      const card = row.closest('[class*="card"]') as HTMLElement
      const play = row.querySelector('[class*="listenToggle"]') as HTMLElement
      const time = row.querySelector('[class*="listenTime"]') as HTMLElement
      const current = time.firstElementChild as HTMLElement
      const total = row.querySelector('[class*="listenTimeTotal"]') as HTMLElement
      const mute = row.querySelector('[class*="listenMute"]') as HTMLElement
      const box = (element: Element) => {
        const r = element.getBoundingClientRect()
        return { top: r.top, bottom: r.bottom, left: r.left, right: r.right, width: r.width, height: r.height, center: r.top + r.height / 2 }
      }
      const range = document.createRange()
      range.selectNodeContents(time)
      const cardBox = box(card)
      const cardStyle = getComputedStyle(card)
      return {
        play: box(play),
        bar: box(bar),
        time: box(time),
        mute: box(mute),
        row: box(row),
        cardInnerRight: cardBox.right - parseFloat(cardStyle.borderRightWidth),
        timeText: time.innerText.trim(),
        currentVisible: current.getBoundingClientRect().width > 0,
        totalDisplay: getComputedStyle(total).display,
        timeLines: new Set(Array.from(range.getClientRects()).map((r) => Math.round(r.top))).size,
        tabular: getComputedStyle(time).fontVariantNumeric,
        pageScrollX: document.documentElement.scrollWidth > document.documentElement.clientWidth,
      }
    })
    for (const centre of [m.bar.center, m.time.center, m.mute.center]) {
      expect(Math.abs(centre - m.play.center), `centreline at ${width}`).toBeLessThanOrEqual(1)
    }
    // Single row, left to right: play, bar, time, mute — all inside the row and the card.
    expect(m.play.left).toBeGreaterThanOrEqual(m.row.left - 0.5)
    expect(m.play.right).toBeLessThanOrEqual(m.bar.left)
    expect(m.bar.right).toBeLessThanOrEqual(m.time.left)
    expect(m.time.right).toBeLessThanOrEqual(m.mute.left)
    expect(m.mute.right, `mute inside the row at ${width}`).toBeLessThanOrEqual(m.row.right + 0.5)
    expect(m.mute.right, `mute inside the card at ${width}`).toBeLessThanOrEqual(m.cardInnerRight)
    expect(m.timeLines, `time label on one line at ${width}`).toBe(1)
    expect(m.tabular).toContain('tabular-nums')
    expect(m.bar.height).toBe(4)
    expect(m.bar.width, `bar keeps its minimum at ${width}`).toBeGreaterThanOrEqual(40)
    expect([m.mute.width, m.mute.height]).toEqual([36, 36])
    expect(m.pageScrollX, `no horizontal scroll at ${width}`).toBe(false)
    expect(m.currentVisible).toBe(true)
    if (phone) {
      expect([m.play.width, m.play.height]).toEqual([36, 36])
      expect(m.totalDisplay).toBe('none')
      expect(m.timeText).toBe('0:00')
    } else {
      expect([m.play.width, m.play.height]).toEqual([44, 44])
      expect(m.totalDisplay).not.toBe('none')
      expect(m.timeText).toBe('0:00 / 0:27')
    }
    barWidths[width] = m.bar.width
  }
  console.log('listen bar widths', JSON.stringify(barWidths))
  expect(barWidths[1280]).toBeGreaterThan(barWidths[375])
  expect(barWidths[375]).toBeGreaterThan(barWidths[320])
})

test('on phones the play glyph stays optically centred in the 36px button (replay is covered at 375 above)', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 720 })
  await openListen(page)
  const offsets = await page.locator('[class*="listenToggle"]').evaluate((button) => {
    const b = button.getBoundingClientRect()
    const svg = button.querySelector('svg') as SVGSVGElement
    const s = svg.getBoundingClientRect()
    return { size: [s.width, s.height], dx: s.left + s.width / 2 - (b.left + b.width / 2), dy: s.top + s.height / 2 - (b.top + b.height / 2) }
  })
  expect(offsets.size).toEqual([18, 18])
  expect(Math.abs(offsets.dx)).toBeLessThanOrEqual(1)
  expect(Math.abs(offsets.dy)).toBeLessThanOrEqual(1)
})

test('mute toggles audio.muted during real playback and playback continues', async ({ page }) => {
  await openListen(page)
  const mute = page.getByRole('button', { name: UI.listen.mute, exact: true })
  await expect(mute).toHaveAttribute('aria-pressed', 'false')
  await page.getByRole('button', { name: UI.listen.play, exact: true }).click()
  await expect(page.getByRole('progressbar')).toHaveAttribute('aria-valuenow', /^([1-9]|[12][0-9])$/, { timeout: 10_000 })
  await mute.click()
  await expect(mute).toHaveAttribute('aria-pressed', 'true')
  await expect(mute).toHaveAccessibleName(UI.listen.mute)
  expect(await audio(page).evaluate((element: HTMLAudioElement) => element.muted)).toBe(true)
  const before = (await audioState(page)).currentTime
  await expect.poll(async () => (await audioState(page)).currentTime).toBeGreaterThan(before + 0.5)
  expect((await audioState(page)).paused).toBe(false)
  await mute.click()
  await expect(mute).toHaveAttribute('aria-pressed', 'false')
  expect(await audio(page).evaluate((element: HTMLAudioElement) => element.muted)).toBe(false)
  expect((await audioState(page)).paused).toBe(false)
})
