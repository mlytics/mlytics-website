import { describe, it, expect } from 'vitest'
import { GA_IDS_BY_HOST, GA_PROD_ID, GA_UAT_ID, assertGaIds, gaBootstrapScript } from '@/lib/ga'

type Win = { dataLayer?: unknown[]; gtag?: (...a: unknown[]) => void }

/** Run the bootstrap with a fake hostname; returns the window and appended scripts. */
function run(hostname: string, preset?: unknown[]) {
  const win: Win = preset ? { dataLayer: preset } : {}
  const appended: { src: string; async: boolean }[] = []
  const doc = {
    createElement: () => ({ src: '', async: false }),
    head: { appendChild: (el: { src: string; async: boolean }) => appended.push(el) },
  }
  // The script only touches these three globals; shadow them.
  new Function('window', 'document', 'location', gaBootstrapScript())(win, doc, { hostname })
  const entries = (win.dataLayer ?? []).map((e) => Array.from(e as ArrayLike<unknown>))
  return { win, appended, entries }
}

describe('GA ids (DATAI-681)', () => {
  it('maps production and UAT hosts to their properties', () => {
    expect(GA_PROD_ID).toBe('G-BHS28B1S3P')
    expect(GA_UAT_ID).toBe('G-6QKQKHMYJV')
    expect(GA_IDS_BY_HOST).toEqual({
      'www.mlytics.com': GA_PROD_ID,
      'mlytics.com': GA_PROD_ID,
      'mlytics.co': GA_UAT_ID,
      'www.mlytics.co': GA_UAT_ID,
    })
  })

  it('rejects a map without the production or UAT host', () => {
    expect(() => assertGaIds({ 'mlytics.co': GA_UAT_ID })).toThrow(/www\.mlytics\.com/)
    expect(() => assertGaIds({ 'www.mlytics.com': GA_PROD_ID })).toThrow(/mlytics\.co/)
  })

  it('rejects ids that are not GA4 measurement ids', () => {
    for (const bad of ['', 'undefined', 'UA-123', 'G-']) {
      expect(() => assertGaIds({ 'www.mlytics.com': bad, 'mlytics.co': GA_UAT_ID })).toThrow(/measurement id/i)
    }
  })

  it('gaBootstrapScript validates the map it embeds', () => {
    expect(() => gaBootstrapScript({ 'mlytics.co': GA_UAT_ID })).toThrow()
  })
})

describe('GA bootstrap script', () => {
  it('loads the production id on www.mlytics.com', () => {
    const { win, appended, entries } = run('www.mlytics.com')
    expect(typeof win.gtag).toBe('function')
    expect(appended).toEqual([{ src: `https://www.googletagmanager.com/gtag/js?id=${GA_PROD_ID}`, async: true }])
    expect(entries).toContainEqual(['config', GA_PROD_ID])
    expect(entries[0][0]).toBe('js')
    expect(entries[0][1]).toBeInstanceOf(Date)
  })

  it('treats a fully qualified hostname (trailing dot) like the plain one', () => {
    const { appended, entries } = run('www.mlytics.com.')
    expect(appended.map((s) => s.src)).toEqual([`https://www.googletagmanager.com/gtag/js?id=${GA_PROD_ID}`])
    expect(entries).toContainEqual(['config', GA_PROD_ID])
  })

  it('ignores inherited object keys such as constructor', () => {
    for (const host of ['constructor', 'toString', '__proto__']) {
      const { appended, entries } = run(host)
      expect(appended).toEqual([])
      expect(entries.some((e) => e[0] === 'config')).toBe(false)
    }
  })

  it('loads the UAT id on mlytics.co and www.mlytics.co', () => {
    for (const host of ['mlytics.co', 'www.mlytics.co']) {
      const { appended, entries } = run(host)
      expect(appended.map((s) => s.src)).toEqual([`https://www.googletagmanager.com/gtag/js?id=${GA_UAT_ID}`])
      expect(entries).toContainEqual(['config', GA_UAT_ID])
    }
  })

  it('keeps a local queue but loads nothing on localhost and unknown hosts', () => {
    for (const host of ['localhost', '127.0.0.1', 'mlytics-website.vercel.app']) {
      const { win, appended, entries } = run(host)
      expect(appended).toEqual([])
      expect(entries.some((e) => e[0] === 'config')).toBe(false)
      win.gtag!('event', 'click_cta', { cta_label: 'x' })
      expect(Array.from(win.dataLayer!.at(-1) as ArrayLike<unknown>)).toEqual(['event', 'click_cta', { cta_label: 'x' }])
    }
  })

  it('reuses an existing dataLayer (e2e hooks its push)', () => {
    const preset: unknown[] = ['existing']
    const { win } = run('localhost', preset)
    expect(win.dataLayer).toBe(preset)
    expect(preset[0]).toBe('existing')
  })
})
