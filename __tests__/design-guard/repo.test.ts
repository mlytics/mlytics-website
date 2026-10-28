/// <reference types="vite/client" />
import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'
import { APPROVED } from './approved'
import { compareWithPending, type PendingTicket } from './ledger'
import { OUTLINE_CALC_DESIGN_REF, findViolations } from './rules'
import { ROOT, blankSiteBaseTokens, listFiles, readSource, scanRepo, scanSource } from './scan-repo'

// The design guard (DESIGN.md §0). New UI code may not hard-code colours, use
// transparency outside the two bases and the alpha ladder, or write spacing,
// type or colour as Tailwind arbitrary values. Today's deviations are frozen
// per fix ticket in pending/ and may only shrink.

const modules = import.meta.glob<{ default: PendingTicket }>('./pending/*.ts', { eager: true })
const PENDING = Object.entries(modules).map(([path, m]) => ({ path, ...m.default }))
const designMd = readFileSync(resolve(ROOT, 'DESIGN.md'), 'utf8')

describe('design guard', () => {
  const violations = scanRepo(APPROVED)
  const { unexpected, stale } = compareWithPending(violations, PENDING)

  it('finds no violation outside the approved exceptions and the pending list', () => {
    expect(
      unexpected.map((v) => `${v.file}:${v.line}  ${v.match}\n    → ${v.hint}`),
      '新違規：照提示改寫。不可為新程式加進 pending/；DESIGN.md 沒涵蓋就先問 An',
    ).toEqual([])
  })

  it('has no stale pending entry', () => {
    expect(
      stale.map((s) => `${s.ticket}: ${s.file} ${s.match} 列 ${s.listed} 處、實際剩 ${s.found} 處`),
      '已修掉的違規要同步更新 pending/<票號>.ts：count 改成實際數；0 就刪條目；整檔清空就刪檔',
    ).toEqual([])
  })

  it('names each pending file after its ticket, lists each ticket once, and keeps the ticket open in DESIGN.md §10.2', () => {
    const tickets = PENDING.map((p) => p.ticket)
    expect(new Set(tickets).size).toBe(tickets.length)
    for (const p of PENDING) {
      expect(p.path, p.ticket).toBe(`./pending/${p.ticket}.ts`)
      expect(designMd, `${p.ticket} 已不在 §10.2 待修清單：刪掉 pending/${p.ticket}.ts`).toMatch(new RegExp(`^\\|\\s*${p.ticket}\\s*\\|`, 'm'))
    }
  })

  it('lists each file and match at most once per ticket', () => {
    // The same file+match may be split across tickets (e.g. one occurrence is
    // text colour → DATAI-622, another a border → DATAI-623); within one ticket it is one entry.
    for (const p of PENDING) {
      const keys = p.entries.map((e) => `${e.file} ${e.match}`)
      expect(keys.length, p.ticket).toBe(new Set(keys).size)
    }
  })

  it('points every pending path at files that still exist', () => {
    const files = listFiles()
    for (const p of PENDING) for (const path of p.paths ?? []) {
      expect(files.some((f) => f.startsWith(path.prefix)), path.prefix).toBe(true)
    }
  })

  it('keeps every approved exception written in DESIGN.md and present in its files', () => {
    for (const a of APPROVED) {
      expect(designMd.includes(a.designRef), `DESIGN.md 找不到：${a.designRef}`).toBe(true)
      for (const f of a.files) {
        expect(existsSync(resolve(ROOT, f)), f).toBe(true)
        expect(readSource(f).includes(a.text), `${f} 已不再使用 ${a.text}：從 approved.ts 移除`).toBe(true)
      }
    }
  })

  it('keeps the rule-level outline-button calc() exception written in DESIGN.md', () => {
    expect(designMd.includes(OUTLINE_CALC_DESIGN_REF), `DESIGN.md 找不到：${OUTLINE_CALC_DESIGN_REF}`).toBe(true)
  })

  it('actually scans the site (guards against an empty file list)', () => {
    expect(listFiles().length).toBeGreaterThan(50)
    // Canary: the scanner still sees violations (the repo itself may one day have none).
    expect(findViolations('canary.tsx', "className=\"mt-[7px]\" style={{ color: '#123456' }}")).toHaveLength(2)
  })
})

describe('scanner boundaries', () => {
  it('approved Nav p-[11px] does not blank the middle of gap-[11px]', () => {
    const source = 'className="p-[11px] gap-[11px]"'
    expect(scanSource('components/layout/Nav.tsx', source, APPROVED).map((v) => v.match)).toEqual(['gap-[11px]'])
  })

  it('does not blank a sanctioned gradient embedded in a changed property value', () => {
    const glow = APPROVED.find((a) => a.text.startsWith('radial-gradient(ellipse 70%'))!
    const source = `style={{ background: '${glow.text}, linear-gradient(red, blue)' }}`
    expect(scanSource(glow.files[0], source, APPROVED).map((v) => v.match)).toContain('rgba(180,83,9,0.07)')
  })

  it('does not blank approved text used in concatenation or an interpolated template', () => {
    expect(scanSource('components/layout/Nav.tsx', '<div className={"hover:" + "p-[11px]"} />', APPROVED).map((v) => v.match)).toEqual(['p-[11px]'])
    expect(scanSource('components/layout/Nav.tsx', '<div className={`p-[11px]${extra}`} />', APPROVED).map((v) => v.match)).toEqual(['p-[11px]'])
    expect(scanSource('components/layout/Nav.tsx', '<div className={`p-[11px] ${extra}`} />', APPROVED)).toEqual([])
    expect(scanSource('components/layout/Nav.tsx', '<div className={`p-[11px]`} />', APPROVED)).toEqual([])
    const amber = APPROVED.find((a) => a.text === 'rgba(180,83,9,0.3)')!
    expect(scanSource(amber.files[0], `style={{ background: '${amber.text}' + suffix }}`, APPROVED).map((v) => v.match)).toContain(amber.text)
  })

  it('does not blank a wrapped or comment-separated gradient that is concatenated', () => {
    const glow = APPROVED.find((a) => a.text.startsWith('radial-gradient(ellipse 70%'))!
    for (const expression of [`('${glow.text}') + suffix`, `'${glow.text}' /* separator */ + suffix`]) {
      expect(scanSource(glow.files[0], `style={{ background: ${expression} }}`, APPROVED).map((v) => v.match)).toContain('rgba(180,83,9,0.07)')
    }
  })

  it('allows a complete approved token in multiline templates while checking its neighbours', () => {
    const file = 'components/layout/Nav.tsx'
    expect(scanSource(file, '<div className={`\n p-[11px]\n`} />', APPROVED)).toEqual([])
    expect(scanSource(file, '<div className={`\n p-[11px] gap-[11px]\n`} />', APPROVED).map((v) => v.match)).toEqual(['gap-[11px]'])
  })

  it('requires approved class tokens to be complete across static and unknown interpolations', () => {
    const file = 'components/layout/Nav.tsx'
    const matches = (value: string) => scanSource(file, `<div className={${value}} />`, APPROVED).map((v) => v.match)
    expect(matches('`hover:${"p-[11px]"}`')).toEqual(['p-[11px]'])
    expect(matches('`${"p-[11px]"}:hover`')).toEqual(['p-[11px]'])
    expect(matches('`${prefix}p-[11px]`')).toEqual(['p-[11px]'])
    expect(matches('`hover:${("p-[11px]")}`')).toEqual(['p-[11px]'])
    expect(matches('`hover:${`p-[11px]`}`')).toEqual(['p-[11px]'])
    expect(matches('`ok ${"p-[11px]"} end`')).toEqual([])
    expect(matches('`${"p-[11px]"}`')).toEqual([])
    expect(matches('"p-[11px]"')).toEqual([])
    expect(matches('`\n p-[11px]\n`')).toEqual([])
    expect(matches('`\n p-[11px] gap-[11px]\n`')).toEqual(['gap-[11px]'])
    expect(matches('`p-[11px]${extra}`')).toEqual(['p-[11px]'])
    expect(matches('`p-[11px] ${extra}`')).toEqual([])
    expect(matches('"p-[11px]" + suffix')).toEqual(['p-[11px]'])
  })

  it('requires approved whole values to cover a fully known template output', () => {
    const glow = APPROVED.find((a) => a.text.startsWith('radial-gradient(ellipse 70%'))!
    const matches = (value: string) => scanSource(glow.files[0], `<div style={{ background: ${value} }} />`, APPROVED).map((v) => v.match)
    expect(matches(`\`\${"${glow.text}"}\``)).toEqual([])
    expect(matches(`\`\${"${glow.text}"} extra\``)).toContain('rgba(180,83,9,0.07)')
    expect(matches(`\`\${"${glow.text}"}\${suffix}\``)).toContain('rgba(180,83,9,0.07)')
  })

  it('blanks only custom declarations in @theme and :root, including nested :root', () => {
    const source = '@theme { --good: #fff; } @theme static { --good: #eee; } @media (min-width: 1px) { :root { --good: #ddd; } .card { --bad: #f00; } }'
    expect(findViolations('app/site-base.css', blankSiteBaseTokens(source)).map((v) => v.match)).toEqual(['#f00'])
  })

  it('does not exempt nested ordinary selectors inside :root or @theme', () => {
    const source = ':root { .card { --bad: #f00; } --good: #fff; } @theme { .other { --bad: #0f0; } --good: #eee; }'
    expect(scanSource('app/site-base.css', source, []).map((v) => v.match)).toEqual(['#f00', '#0f0'])
  })

  it('does not exempt mixed :root and ordinary selectors', () => {
    expect(scanSource('app/site-base.css', ':root, .card { --bad: #f00; }', []).map((v) => v.match)).toEqual(['#f00'])
  })

  it('ignores quoted braces and escapes when locating token blocks', () => {
    expect(scanSource('app/site-base.css', ':root { --label: "}\\\""; --color-test: #f00; }', [])).toEqual([])
  })
})
