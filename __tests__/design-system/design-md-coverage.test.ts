import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

// DESIGN.md is the single source of truth for UI rules. These checks keep it
// from silently drifting away from the code it documents.

const root = resolve(__dirname, '../..')
const read = (p: string) => readFileSync(resolve(root, p), 'utf8')
const designMd = existsSync(resolve(root, 'DESIGN.md')) ? read('DESIGN.md') : ''
// Tokens and shared classes live in app/site-base.css; app/globals.css is the
// site entry that only imports it and sets Tailwind sources.
const css = read('app/site-base.css')

function block(source: string, opener: RegExp): string {
  const start = source.search(opener)
  if (start < 0) return ''
  const open = source.indexOf('{', start)
  let depth = 0
  for (let i = open; i < source.length; i++) {
    if (source[i] === '{') depth++
    if (source[i] === '}' && --depth === 0) return source.slice(open + 1, i)
  }
  return ''
}

const stripComments = (s: string) => s.replace(/\/\*[\s\S]*?\*\//g, '')

/** Custom properties declared in a block, ignoring ones inside comments. */
function declaredTokens(body: string): string[] {
  return [...stripComments(body).matchAll(/(--[a-z0-9-]+)\s*:/g)].map((m) => m[1])
}

/** Top-level component classes defined in site-base.css (e.g. .pill-btn). */
function componentClasses(source: string): string[] {
  const names = [...stripComments(source).matchAll(/^\.([a-z][a-z0-9-]*(?:--[a-z0-9-]+)?)\s*[{,:]/gm)].map((m) => m[1])
  return [...new Set(names)]
}

const CHAPTERS = [
  '## 0. 給 AI 的使用說明', '## 1. 設計原則', '## 2. Tokens', '## 3. Atoms',
  '## 4. Molecules', '## 5. Organisms', '## 6. Templates',
  '## 7. 行為契約與技術約束', '## 8. 無障礙', '## 9. 新增頁面 SOP',
  '## 10. 例外與待修清單',
]

describe('DESIGN.md', () => {
  it('exists and has every chapter in order', () => {
    // Match whole heading lines only, so '### 1. …' or a mention in prose does not count.
    const escape = (h: string) => h.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    const positions = CHAPTERS.map((h) => designMd.search(new RegExp(`^${escape(h)}$`, 'm')))
    expect(positions.every((p) => p >= 0), `missing: ${CHAPTERS.filter((_, i) => positions[i] < 0)}`).toBe(true)
    expect([...positions].sort((a, b) => a - b)).toEqual(positions)
  })

  it('parses a non-trivial token and class set from site-base.css (guards the parser)', () => {
    expect(declaredTokens(block(css, /@theme\s*\{/))).toContain('--color-primary')
    expect(declaredTokens(block(css, /:root\s*\{/))).toContain('--bg-dark')
    expect(componentClasses(css)).toEqual(expect.arrayContaining(['section-heading', 'pill-btn', 'label-eyebrow']))
  })

  it('documents every @theme and :root token', () => {
    const tokens = [...declaredTokens(block(css, /@theme\s*\{/)), ...declaredTokens(block(css, /:root\s*\{/))]
    const missing = tokens.filter((t) => !designMd.includes(`\`${t}\``))
    expect(missing, `Tokens missing from DESIGN.md: ${missing.join(', ')}`).toEqual([])
  })

  it('documents every component class defined in site-base.css', () => {
    const missing = componentClasses(css).filter((c) => !designMd.includes(`\`.${c}\``))
    expect(missing, `Classes missing from DESIGN.md: ${missing.join(', ')}`).toEqual([])
  })

  // §10 fix list: one row per open fix ticket, `| DATAI-123 | 類別 | 內容 | 盤點 id |`.
  const fixListSection = () => designMd.slice(designMd.indexOf('## 10. 例外與待修清單'))
  const fixListKeys = () =>
    new Set([...fixListSection().matchAll(/^\|\s*(DATAI-\d+)\s*\|/gm)].map((m) => m[1]))

  it('lists only real Jira keys in the fix list', () => {
    const section = designMd.slice(designMd.indexOf('## 10. 例外與待修清單'))
    const rows = section.split('\n').filter((l) => /^\|\s*DATAI-/.test(l))
    expect(rows.length).toBeGreaterThanOrEqual(13)
    expect(rows.every((r) => /^\|\s*DATAI-\d+\s*\|/.test(r))).toBe(true)
  })

  it('has a fix-list row for every ticket chapters 0–9 cite', () => {
    // Every DATAI key before §10 (現況偏離 lines, 待修 columns, notes) must be
    // a row in §10, so a rule can never point at a ticket the list lacks.
    const body = designMd.slice(0, designMd.indexOf('## 10. 例外與待修清單'))
    const cited = new Set([...body.matchAll(/DATAI-\d+/g)].map((m) => m[0]))
    const deviationLines = body.split('\n').filter((l) => l.includes('現況偏離') && /DATAI-\d+/.test(l))
    // Guard the parser: chapters 2–6 cite many tickets on 現況偏離 lines.
    expect(deviationLines.length).toBeGreaterThan(20)
    expect(cited.size).toBeGreaterThan(5)
    const listed = fixListKeys()
    const missing = [...cited].filter((k) => !listed.has(k))
    expect(missing, `Cited in chapters 0–9 but missing from §10: ${missing.join(', ')}`).toEqual([])
  })
})
