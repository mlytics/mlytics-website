import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { dirname, join, relative, resolve } from 'node:path'
import { describe, expect, it } from 'vitest'
import postcss from 'postcss'
import { COLOR_TOKENS } from '@/stories/_data/tokens'
import { SPECIMENS } from '@/stories/_data/specimens'
import { REGISTRY } from '@/stories/_data/registry'

// DESIGN.md is the single source of truth for UI rules. These checks keep it
// from silently drifting away from the code it documents.

const root = resolve(__dirname, '../..')
const read = (p: string) => readFileSync(resolve(root, p), 'utf8')
const designMd = existsSync(resolve(root, 'DESIGN.md')) ? read('DESIGN.md') : ''
// Tokens and shared classes live in app/site-base.css; app/globals.css is the
// site entry that only imports it and sets Tailwind sources.
const css = read('app/site-base.css')

/**
 * Custom properties declared directly in a block, in source order, with their
 * values. postcss already drops comments, so `--x: …` inside one never counts.
 * Blocks are found at any depth (inside @layer / @media too), and a :root rule
 * counts when :root is one entry of a selector list such as `:root, :host`.
 */
function declarations(source: string, selector: '@theme' | ':root'): Map<string, string> {
  const out = new Map<string, string>()
  const collect = (node: postcss.Container) => node.each((child: postcss.ChildNode) => {
    if (child.type === 'decl' && child.prop.startsWith('--')) out.set(child.prop, child.value)
  })
  const parsed = postcss.parse(source)
  if (selector === '@theme') parsed.walkAtRules('theme', collect)
  else parsed.walkRules((rule) => { if (rule.selectors.some((s) => s.trim() === ':root')) collect(rule) })
  return out
}

/** Custom properties declared in @theme or :root. */
const declaredTokens = (source: string, selector: '@theme' | ':root') => [...declarations(source, selector).keys()]

/**
 * Every class used in a selector anywhere in the file, including inside
 * @media / @layer blocks and compound selectors such as
 * `[data-nf="cdn"] .nf-default`, plus every Tailwind v4 `@utility name { }`
 * (it becomes a class just like a selector does). Keyframe steps (`from`,
 * `50%`) are not selectors and are skipped.
 */
function componentClasses(source: string): string[] {
  const names = new Set<string>()
  const parsed = postcss.parse(source)
  parsed.walkAtRules('utility', (at) => { names.add(at.params.trim()) })
  parsed.walkRules((rule) => {
    if (rule.parent?.type === 'atrule' && /keyframes$/.test((rule.parent as postcss.AtRule).name)) return
    // Drop attribute selectors and strings first so `[href$=".pdf"]` is not read as a class.
    const selector = rule.selector.replace(/\[[^\]]*\]/g, '').replace(/(["'])[^"']*\1/g, '')
    for (const m of selector.matchAll(/\.(-?[_a-zA-Z][\w-]*)/g)) names.add(m[1])
  })
  return [...names]
}

/** Normalises a CSS value for comparison: case and whitespace do not matter. */
const normValue = (v: string) => v.trim().replace(/\s+/g, ' ').toLowerCase()

/**
 * The first Markdown table under a heading line (e.g. '### 2.1 顏色 token'),
 * stopping at the next heading. Returns the header cells and the body rows.
 * A heading ending in a space (e.g. '### 2.8 ') matches by prefix, so a
 * section can be found by number when its title wording may change.
 */
function tableUnder(md: string, heading: string): { header: string[]; rows: string[][] } | null {
  const lines = md.split('\n')
  const start = lines.findIndex((l) => (heading.endsWith(' ') ? l.startsWith(heading) : l.trim() === heading))
  if (start < 0) return null
  const cells = (l: string) => l.trim().replace(/^\||\|$/g, '').split('|').map((c) => c.trim())
  for (let i = start + 1; i < lines.length; i++) {
    if (/^#{2,3} /.test(lines[i])) return null
    if (!lines[i].startsWith('|')) continue
    const rows: string[][] = []
    for (const line of lines.slice(i + 2)) {
      if (!line.startsWith('|')) break
      rows.push(cells(line))
    }
    return { header: cells(lines[i]), rows }
  }
  return null
}

/** The single backtick-quoted string a table cell holds, or null. */
const codeCell = (cell: string) => cell.match(/^`([^`]+)`$/)?.[1] ?? null

const CHAPTERS = [
  '## 0. 給 AI 的使用說明', '## 1. 設計原則', '## 2. Tokens', '## 3. Atoms',
  '## 4. Molecules', '## 5. Organisms', '## 6. Templates',
  '## 7. 行為契約與技術約束', '## 8. 無障礙', '## 9. 新增頁面 SOP',
  '## 10. 例外與待修清單',
]

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

describe('DESIGN.md', () => {
  it('exists and has every chapter in order', () => {
    // Match whole heading lines only, so '### 1. …' or a mention in prose does not count.
    const escape = (h: string) => h.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    const positions = CHAPTERS.map((h) => designMd.search(new RegExp(`^${escape(h)}$`, 'm')))
    expect(positions.every((p) => p >= 0), `missing: ${CHAPTERS.filter((_, i) => positions[i] < 0)}`).toBe(true)
    expect([...positions].sort((a, b) => a - b)).toEqual(positions)
  })

  it('parses a non-trivial token and class set from site-base.css (guards the parser)', () => {
    expect(declaredTokens(css, '@theme')).toContain('--color-primary')
    expect(declaredTokens(css, ':root')).toContain('--bg-dark')
    expect(declarations(css, '@theme').get('--font-size-h3')).toBe('1.5rem')
    expect(componentClasses(css)).toEqual(expect.arrayContaining(['section-heading', 'pill-btn', 'label-eyebrow']))
    // Fixed samples: classes inside @media / @layer and in compound selectors
    // count; keyframe steps, attribute values and comments do not.
    const sample = `
      @layer components { .in-layer { color: red } }
      @media (min-width: 768px) { .in-media:hover { color: red } }
      [data-nf="cdn"] .compound, .a.b > .c { color: red }
      a[href$=".pdf"] { color: red }
      /* .commented { color: red } */
      @keyframes k { from { opacity: 0 } 50.5% { opacity: 1 } }`
    expect(componentClasses(sample).sort()).toEqual(['a', 'b', 'c', 'compound', 'in-layer', 'in-media'])
    // Tailwind v4 @utility at-rules define classes too, at any depth.
    const utilities = `
      @utility scrollbar-none { scrollbar-width: none }
      @layer x { @utility tab-* { tab-size: --value(integer) } }`
    expect(componentClasses(utilities).sort()).toEqual(['scrollbar-none', 'tab-*'])
    // :root and @theme blocks count wherever they are, and :root inside a
    // selector list counts; a selector that merely contains ":root" does not.
    const tokenSample = `
      :root, :host { --top: 1px; }
      @layer base { :root { --in-layer: 2px; } }
      @media (prefers-color-scheme: dark) { :root { --in-media: 3px; } }
      :root.dark { --not-root: 4px; }
      .x { --not-root-either: 5px; }
      @layer theme { @theme { --nested-theme: 6px; } }
      @theme inline { --theme-inline: 7px; }`
    expect([...declarations(tokenSample, ':root')]).toEqual([['--top', '1px'], ['--in-layer', '2px'], ['--in-media', '3px']])
    expect([...declarations(tokenSample, '@theme')]).toEqual([['--nested-theme', '6px'], ['--theme-inline', '7px']])
  })

  // A name quoted only on a 禁止 (forbidden) line, or only inside a hidden
  // <!-- src --> comment, is not documented: it says what not to do, not what
  // the token or class is.
  const documentedLines = stripHtmlComments(designMd).split('\n').filter((l) => !/禁止/.test(l))
  const documented = (quoted: string) => documentedLines.some((l) => l.includes(quoted))

  it('documents every @theme and :root token outside 禁止 lines', () => {
    const tokens = [...declaredTokens(css, '@theme'), ...declaredTokens(css, ':root')]
    const missing = tokens.filter((t) => !documented(`\`${t}\``))
    expect(missing, `Tokens missing from DESIGN.md (or only on a 禁止 line): ${missing.join(', ')}`).toEqual([])
  })

  it('documents every class used in site-base.css outside 禁止 lines', () => {
    const missing = componentClasses(css).filter((c) => !documented(`\`.${c}\``))
    expect(missing, `Classes missing from DESIGN.md (or only on a 禁止 line): ${missing.join(', ')}`).toEqual([])
  })

  // Tables that state the value a token has in site-base.css TODAY. §2.8 says
  // DATAI-556 will rename and re-value some of these; its table still lists the
  // current values (the target is in prose), so it is checked too. When a
  // ticket changes a value, the table and the CSS must change together.
  const VALUE_TABLES: { heading: string; tokens: (name: string) => boolean; from: '@theme' | ':root' }[] = [
    { heading: '### 2.1 顏色 token', tokens: (t) => t.startsWith('--color-'), from: '@theme' },
    { heading: '### 2.5 legacy 變數（`:root`）', tokens: () => true, from: ':root' },
    // Matched by number: the title says 目前失效 and will change with DATAI-556.
    // DATAI-556 renames --font-size-* to --text-*: it must update this prefix
    // (and the §2.8 table) in the same PR, or every --text-* token falls
    // through to the classification check below.
    { heading: '### 2.8 ', tokens: (t) => t.startsWith('--font-size-'), from: '@theme' },
  ]

  // @theme tokens whose value DESIGN.md states in prose rather than in a
  // table: the exact `--token: value` code span must appear in that section.
  const PROSE_VALUES: { section: string; token: string }[] = [
    { section: '### 2.15 ', token: '--breakpoint-sm' }, // 「`--breakpoint-sm: 30rem`」
  ]

  // @theme / :root tokens that are documented by name only, with no value
  // check. Empty today. Adding a name here is a conscious decision: say why.
  const NAME_ONLY: string[] = []

  /** token → value from a DESIGN.md table, read from its first column and its 值 column. */
  function documentedValues(heading: string): Map<string, string> | null {
    const table = tableUnder(designMd, heading)
    if (!table) return null
    const col = table.header.indexOf('值')
    if (col < 0) return null
    const out = new Map<string, string>()
    for (const row of table.rows) {
      const token = codeCell(row[0])
      const value = codeCell(row[col] ?? '')
      if (token && value) out.set(token, value)
    }
    return out
  }

  it('reads token values from DESIGN.md tables (guards the parser)', () => {
    const sample = '### X\n\ntext\n\n| token | 值 | 用途 |\n|---|---|---|\n| `--a` | `#ABC` | x |\n| `--b` | `1px` | y |\n\nafter\n| `--c` | `2px` | z |'
    const t = tableUnder(sample, '### X')!
    expect(t.header).toEqual(['token', '值', '用途'])
    expect(t.rows.map((r) => [codeCell(r[0]), codeCell(r[1])])).toEqual([['--a', '#ABC'], ['--b', '1px']])
    expect(tableUnder('### X\ntext\n### Y\n| a |\n|---|\n| b |', '### X'), 'must stop at the next heading').toBeNull()
    expect(tableUnder('### 2.8 any title\n| a |\n|---|\n| b |', '### 2.8 ')?.rows, 'trailing space matches by prefix').toEqual([['b']])
    expect(tableUnder('### 2.8 any title\n| a |\n|---|\n| b |', '### 2.8'), 'no trailing space matches the whole line').toBeNull()
  })

  /** Which value check covers a token, or null when none does. */
  const valueCheckFor = (token: string, from: '@theme' | ':root') =>
    VALUE_TABLES.find((v) => v.from === from && v.tokens(token))?.heading
    ?? (from === '@theme' ? PROSE_VALUES.find((p) => p.token === token)?.section : undefined)
    ?? (NAME_ONLY.includes(token) ? 'NAME_ONLY' : null)

  it('classifies every @theme and :root token into a value check or NAME_ONLY', () => {
    // A new token family (e.g. --radius-*, --text-*) must be consciously given a
    // value table, a PROSE_VALUES entry, or a NAME_ONLY entry; never skipped.
    expect(valueCheckFor('--radius-sm', '@theme'), 'an unknown family must be unclassified').toBeNull()
    const unclassified = (['@theme', ':root'] as const).flatMap((from) =>
      declaredTokens(css, from).filter((t) => valueCheckFor(t, from) === null).map((t) => `${from} ${t}`))
    expect(unclassified, `Add a VALUE_TABLES prefix, a PROSE_VALUES entry or a commented NAME_ONLY entry for: ${unclassified.join(', ')}`).toEqual([])
    // NAME_ONLY / PROSE_VALUES must not go stale either.
    const theme = declaredTokens(css, '@theme')
    for (const t of [...NAME_ONLY, ...PROSE_VALUES.map((p) => p.token)]) expect([...theme, ...declaredTokens(css, ':root')], t).toContain(t)
  })

  it.each(PROSE_VALUES)('$section states the value site-base.css declares for $token', ({ section, token }) => {
    const lines = designMd.split('\n')
    const start = lines.findIndex((l) => l.startsWith(section))
    expect(start, `section "${section}" not found`).toBeGreaterThanOrEqual(0)
    const end = lines.findIndex((l, i) => i > start && /^#{2,3} /.test(l))
    const body = stripHtmlComments(lines.slice(start + 1, end < 0 ? undefined : end).join('\n'))
    const escaped = token.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    const stated = [...body.matchAll(new RegExp(`\`${escaped}:\\s*([^\`;]+);?\``, 'g'))].map((m) => normValue(m[1]))
    expect(stated.length, `no \`${token}: <value>\` code span in ${section}`).toBeGreaterThan(0)
    const actual = declarations(css, '@theme').get(token)
    expect(actual, `${token} not in @theme`).toBeDefined()
    for (const v of stated) expect(v, `${section}: ${token}`).toBe(normValue(actual!))
  })

  it.each(VALUE_TABLES)('$heading lists every token with the value site-base.css declares', ({ heading, tokens, from }) => {
    const doc = documentedValues(heading)
    expect(doc, `table with a 值 column not found under "${heading}"`).not.toBeNull()
    const declared = [...declarations(css, from)].filter(([t]) => tokens(t))
    expect(declared.length).toBeGreaterThan(0)
    const actual = new Map(declared.map(([t, v]) => [t, normValue(v)]))
    const stated = new Map([...doc!].map(([t, v]) => [t, normValue(v)]))
    // Same token set, and the same value for each.
    expect([...stated.keys()].sort(), 'tokens in the table vs. site-base.css').toEqual([...actual.keys()].sort())
    for (const [t, v] of stated) expect(v, `${heading}: ${t}`).toBe(actual.get(t))
  })

  // Names DESIGN.md already uses for something a §10.2 fix ticket will add to
  // site-base.css. Keyed by ticket so closing the ticket forces a cleanup: each
  // key must still have a §10.2 row, and each name must still be missing from
  // the CSS (once the ticket adds it, drop it here).
  const PLANNED_BY_TICKET: Record<string, string[]> = {
    'DATAI-623': ['--color-error', '--color-error-on-dark'], // §2.2 錯誤色，建議名稱
  }
  const planned = new Set(Object.values(PLANNED_BY_TICKET).flat())

  it('keeps the planned-name allowlist tied to open tickets and still unbuilt', () => {
    const rows = fixListRows(designMd) ?? []
    const open = new Set(rows.map((r) => r.match(TICKET_KEY)![0]))
    const existing = new Set([
      ...declaredTokens(css, '@theme'), ...declaredTokens(css, ':root'),
      ...componentClasses(css).map((c) => `.${c}`),
    ])
    for (const [ticket, names] of Object.entries(PLANNED_BY_TICKET)) {
      expect(open.has(ticket), `${ticket} has no §10.2 row; remove it from PLANNED_BY_TICKET`).toBe(true)
      for (const n of names) expect(existing.has(n), `${n} now exists in site-base.css; remove it from PLANNED_BY_TICKET`).toBe(false)
    }
  })

  // A real token name inside a code span: not a wildcard prefix such as
  // `--text-*` and not a BEM modifier such as `.pill-btn--dark`.
  const TOKEN_IN_CODE = /(?<![\w-])--[a-z0-9]+(?:-[a-z0-9]+)*(?![\w*-])/g
  const codeSpans = (md: string) => [...md.matchAll(/`([^`\n]+)`/g)].map((m) => m[1])
  /**
   * Token names quoted in code spans, skipping <!-- src --> comments and 禁止
   * lines (same rule as `documentedLines`): a forbidden example may name a
   * token that intentionally does not exist.
   */
  const namedTokens = (md: string) => new Set(
    stripHtmlComments(md).split('\n').filter((l) => !/禁止/.test(l))
      .flatMap((l) => codeSpans(l).flatMap((c) => c.match(TOKEN_IN_CODE) ?? [])),
  )

  it('every token named in §2 Tokens exists in site-base.css', () => {
    expect(codeSpans('`--a-b` `--text-*` `.pill-btn--dark` `var(--c)`').flatMap((c) => c.match(TOKEN_IN_CODE) ?? [])).toEqual(['--a-b', '--c'])
    expect([...namedTokens('`--kept`\n- 禁止：`--forbidden-example`\n<!-- src: `--in-comment` -->')]).toEqual(['--kept'])
    // Scoped to §2: other chapters quote non-existent names on purpose
    // (§7.5 uses --color-amber as an example of a token that silently fails).
    const start = designMd.indexOf('\n## 2. Tokens')
    const end = designMd.indexOf('\n## 3. Atoms')
    expect(start).toBeGreaterThan(0)
    const named = namedTokens(designMd.slice(start, end))
    expect(named.size).toBeGreaterThan(10)
    const existing = new Set([...declaredTokens(css, '@theme'), ...declaredTokens(css, ':root')])
    const missing = [...named].filter((t) => !existing.has(t) && !planned.has(t))
    expect(missing, `Named in DESIGN.md §2 but not declared in site-base.css: ${missing.join(', ')}`).toEqual([])
  })

  it('every class in the §2.18 index exists in site-base.css', () => {
    const table = tableUnder(designMd, '### 2.18 `app/site-base.css` 元件類別索引')
    expect(table, '§2.18 table not found').not.toBeNull()
    const listed = table!.rows.flatMap((r) => [...r[0].matchAll(/`\.([a-z][\w-]*)`/g)].map((m) => m[1]))
    expect(listed).toEqual(expect.arrayContaining(['label-eyebrow', 'nf-cdn', 'nf-default']))
    const existing = new Set(componentClasses(css))
    const missing = listed.filter((c) => !existing.has(c) && !planned.has(`.${c}`))
    expect(missing, `Listed in DESIGN.md §2.18 but not in site-base.css: ${missing.join(', ')}`).toEqual([])
    // And the index is complete: every class in the CSS has a §2.18 row.
    const unlisted = [...existing].filter((c) => !listed.includes(c))
    expect(unlisted, `Classes in site-base.css with no §2.18 row: ${unlisted.join(', ')}`).toEqual([])
  })

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

describe('storybook data matches the source of truth', () => {
  it('shows every color token with the value site-base.css declares', () => {
    const declared = Object.fromEntries(
      [...declarations(css, '@theme')].filter(([t]) => t.startsWith('--color-')).map(([t, v]) => [t, v.trim().toLowerCase()]),
    )
    expect(COLOR_TOKENS.map((c) => c.token).sort()).toEqual(Object.keys(declared).sort())
    for (const c of COLOR_TOKENS) expect(c.hex.toLowerCase(), c.token).toBe(declared[c.token])
  })

  // DESIGN.md also quotes deviations, forbidden forms and pre-fix source code
  // verbatim, so a className found only on such a line is not a standard.
  const NON_STANDARD_LINE = /現況偏離|禁止|原始碼現況/
  const standardLines = designMd.split('\n').filter((l) => !NON_STANDARD_LINE.test(l))

  /**
   * The whole className, delimited, in one of the three ways DESIGN.md quotes a
   * standard: `classes`, `.class` (a single class in selector form, e.g.
   * `.label-eyebrow`), or className="classes" (a JSX attribute inside a quoted
   * element or a fenced code block). A substring of a longer string never counts.
   */
  function quotedAsStandard(className: string): boolean {
    const forms = [`\`${className}\``, `className="${className}"`]
    if (!/\s/.test(className)) forms.push(`\`.${className}\``)
    return standardLines.some((line) => forms.some((f) => line.includes(f)))
  }

  it('every specimen className is quoted in full as a standard in DESIGN.md, and none is forbidden', () => {
    // Guard the matcher on fixed samples, not on today's DESIGN.md wording.
    expect(NON_STANDARD_LINE.test('- 禁止：`p-7`（28）或其他內距。')).toBe(true)
    expect(NON_STANDARD_LINE.test('原始碼現況：44 為 `… transition-all …`')).toBe(true)
    expect(NON_STANDARD_LINE.test('- 現況偏離：見 §10 DATAI-625')).toBe(true)
    expect(quotedAsStandard('rounded-full text-sm'), 'a substring of a longer quoted string must not count').toBe(false)

    const missing = SPECIMENS.filter((s) => !quotedAsStandard(s.className)).map((s) => `${s.id}: ${s.className}`)
    expect(missing, `Specimens not quoted as a standard in DESIGN.md:\n${missing.join('\n')}`).toEqual([])

    // §2.16 forbids transition-all; §4.2 forbids p-7. Variant prefixes (md:, hover:) count too.
    const FORBIDDEN = ['transition-all', 'p-7']
    const forbidden = SPECIMENS.filter((s) =>
      s.className.split(/\s+/).some((c) => FORBIDDEN.includes(c.split(':').pop()!)),
    ).map((s) => `${s.id}: ${s.className}`)
    expect(forbidden, `Specimens using a class DESIGN.md forbids:\n${forbidden.join('\n')}`).toEqual([])
  })
})

// DESIGN.md §7.8: a shared component either has a story next to it (no open
// fix ticket) or is listed as pending with the §10.2 tickets that block it.
describe('storybook registry', () => {
  it('lists every shared and layout component', () => {
    const names = ['components/ui', 'components/layout'].flatMap((dir) =>
      readdirSync(resolve(root, dir))
        .filter((f) => f.endsWith('.tsx') && !f.endsWith('.stories.tsx'))
        .map((f) => f.replace(/\.tsx$/, '')),
    )
    const listed = new Set(REGISTRY.map((e) => e.component))
    expect(names.filter((c) => !listed.has(c))).toEqual([])
  })

  it('rendered entries have a story file next to the component, pending entries do not', () => {
    const storyOf = (file: string) => resolve(root, file.replace(/\.tsx$/, '.stories.tsx'))
    for (const e of REGISTRY.filter((x) => x.status === 'rendered')) {
      expect(existsSync(storyOf(e.file)), `${e.id}: rendered but has no story`).toBe(true)
    }
    // §7.8: a component with open fix tickets must not render its current
    // (deviating) state as a story; it is listed in PendingComponents instead.
    for (const e of REGISTRY.filter((x) => x.status === 'pending')) {
      expect(existsSync(storyOf(e.file)), `${e.id}: pending but has a story next to it`).toBe(false)
    }
  })

  /** Files a story module imports, resolved to repo-relative paths ('@/' = repo root). */
  function importedFiles(source: string, fromFile: string): string[] {
    const specs = [...source.matchAll(/(?:\bfrom\s*|\bimport\s*\(?\s*)['"]([^'"]+)['"]/g)].map((m) => m[1])
    return specs.flatMap((spec) => {
      const base = spec.startsWith('@/') ? resolve(root, spec.slice(2))
        : spec.startsWith('.') ? resolve(root, dirname(fromFile), spec) : null
      if (!base) return [] // a package, not a repo file
      const hit = ['', '.tsx', '.ts', '/index.tsx', '/index.ts'].map((ext) => base + ext).find((f) => existsSync(f) && !f.endsWith('/'))
      return [relative(root, hit ?? base)]
    })
  }

  it('no story anywhere imports a pending component (§7.8)', () => {
    // Guard the resolver on a fixed sample.
    expect(importedFiles(`import { A } from '@/components/ui/Eyebrow'\nimport x from './ScrollToTop'\nimport 'react'\nconst y = import("../ui/Eyebrow")`, 'components/layout/X.stories.tsx'))
      .toEqual(['components/ui/Eyebrow.tsx', 'components/layout/ScrollToTop.tsx', 'components/ui/Eyebrow.tsx'])
    // Only story modules: an MDX page that mentions a pending component by name is fine.
    const stories = ['stories', 'components'].flatMap((dir) =>
      (readdirSync(resolve(root, dir), { recursive: true }) as string[])
        .filter((f) => /\.stories\.tsx?$/.test(f))
        .map((f) => join(dir, f)))
    expect(stories.length).toBeGreaterThan(5)
    const pending = new Map(REGISTRY.filter((e) => e.status === 'pending').map((e) => [e.file, e.id]))
    const offending = stories.flatMap((story) =>
      importedFiles(read(story), story).filter((f) => pending.has(f)).map((f) => `${story} → ${f} (${pending.get(f)})`))
    expect(offending, `Stories importing a pending component:\n${offending.join('\n')}`).toEqual([])
  })

  it('every pending entry names only tickets that have a DESIGN.md §10.2 row', () => {
    // Exact keys from the §10.2 rows only: §10.1, prose and source comments
    // also mention tickets, and a substring match would accept "DATAI-62".
    const rows = fixListRows(designMd)
    expect(rows, '§10.2 table not found').not.toBeNull()
    const listed = new Set(rows!.map((r) => r.match(/^\|\s*(DATAI-\d+)\s*\|/)?.[1]))
    for (const e of REGISTRY.filter((x) => x.status === 'pending')) {
      expect(e.tickets.length, e.id).toBeGreaterThan(0)
      for (const t of e.tickets) expect(listed.has(t), `${e.id} → ${t} has no §10.2 row`).toBe(true)
    }
  })

  it('has unique ids, existing files, and no tickets on rendered entries', () => {
    const ids = REGISTRY.map((e) => e.id)
    expect(new Set(ids).size, 'duplicate registry ids').toBe(ids.length)
    for (const e of REGISTRY) {
      expect(existsSync(resolve(root, e.file)), `${e.id}: ${e.file}`).toBe(true)
      if (e.status === 'rendered') expect(e.tickets, e.id).toEqual([])
    }
  })
})
