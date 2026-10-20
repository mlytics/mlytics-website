/// <reference types="vite/client" />
import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'
import { APPROVED } from './approved'
import { compareWithPending, type PendingTicket } from './ledger'
import { OUTLINE_CALC_DESIGN_REF, findViolations } from './rules'
import { ROOT, listFiles, readSource, scanRepo } from './scan-repo'

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
