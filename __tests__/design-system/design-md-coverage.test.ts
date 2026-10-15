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

  // §10.2 fix list: one row per OPEN fix ticket. Rows are deleted as tickets
  // close, so no check here may depend on how many tickets are still open.
  const FIX_LIST_HEADING = '## 10. 例外與待修清單'
  const FIX_LIST_HEADER = '| 票號 | 類別 | 內容 | 盤點 id |'
  const FIX_ROW = /^\|\s*DATAI-\d+\s*\|[^|\n]+\|[^|\n]+\|[^|\n]+\|$/
  const TICKET_KEY = /DATAI-\d+/g
  const stripHtmlComments = (s: string) => s.replace(/<!--[\s\S]*?-->/g, '')

  /** Lines of the §10.2 table body (after header and separator, up to the first non-table line). */
  function fixListRows(md: string): string[] | null {
    const section = md.indexOf(FIX_LIST_HEADING)
    if (section < 0) return null
    const lines = md.slice(section).split('\n')
    const header = lines.findIndex((l) => l.trim() === FIX_LIST_HEADER)
    if (header < 0) return null
    const rows: string[] = []
    for (const line of lines.slice(header + 2)) {
      if (!line.startsWith('|')) break
      rows.push(line)
    }
    return rows
  }

  it('keeps the §10.2 fix list parseable and every row a real Jira key', () => {
    expect(designMd).toMatch(new RegExp(`^${FIX_LIST_HEADING}$`, 'm'))
    const rows = fixListRows(designMd)
    expect(rows, `§10.2 table header not found: ${FIX_LIST_HEADER}`).not.toBeNull()
    const bad = rows!.filter((r) => !FIX_ROW.test(r))
    expect(bad, `Rows not shaped "| DATAI-123 | 類別 | 內容 | 盤點 id |":\n${bad.join('\n')}`).toEqual([])
    const keys = rows!.map((r) => r.match(TICKET_KEY)![0])
    expect(new Set(keys).size, 'duplicate ticket rows').toBe(keys.length)
  })

  it('cites in body text only tickets that have a fix-list row', () => {
    // Guard the pattern on a fixed sample, not on today's ticket count.
    expect('見 §10 DATAI-12、DATAI-345'.match(TICKET_KEY)).toEqual(['DATAI-12', 'DATAI-345'])
    // Source comments (<!-- src: … -->) may cite any ticket; visible text may
    // only cite open fix tickets, so closing a ticket forces every mention of
    // it (現況偏離 lines, notes, 待修 columns) to be cleaned up with its row.
    const rows = fixListRows(designMd) ?? []
    const listed = new Set(rows.map((r) => r.match(TICKET_KEY)![0]))
    // A row's own key cell does not count as a citation; the rest of the row does.
    const rowSet = new Set(rows)
    const body = stripHtmlComments(designMd)
      .split('\n')
      .map((l) => (rowSet.has(l) ? l.replace(/^\|\s*DATAI-\d+\s*\|/, '|') : l))
      .join('\n')
    const cited = new Set(body.match(TICKET_KEY) ?? [])
    const missing = [...cited].filter((k) => !listed.has(k))
    expect(missing, `Cited in DESIGN.md text but missing from §10.2: ${missing.join(', ')}`).toEqual([])
  })
})
