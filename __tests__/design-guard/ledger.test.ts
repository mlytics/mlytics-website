import { describe, expect, it } from 'vitest'
import type { Violation } from './rules'
import { buildPending, compareWithPending, serializePending, ticketFor, type PendingTicket } from './ledger'

const v = (file: string, match: string, kind: Violation['kind'] = 'hex', line = 1): Violation => ({ file, line, kind, match, hint: 'h' })

describe('compareWithPending', () => {
  const pending: PendingTicket[] = [
    { ticket: 'DATAI-623', entries: [{ file: 'a.tsx', match: '#fff', count: 2 }] },
    { ticket: 'DATAI-630', entries: [], paths: [{ prefix: 'ai/', kinds: ['arbitrary'] }] },
  ]

  it('passes when found equals listed', () => {
    expect(compareWithPending([v('a.tsx', '#fff'), v('a.tsx', '#fff')], pending)).toEqual({ unexpected: [], stale: [] })
  })

  it('reports the extra occurrences as unexpected', () => {
    const extra = v('a.tsx', '#fff', 'hex', 9)
    const result = compareWithPending([v('a.tsx', '#fff'), v('a.tsx', '#fff'), extra], pending)
    expect(result.unexpected).toEqual([extra])
  })

  it('reports violations that are not listed at all', () => {
    const other = v('b.tsx', '#000')
    expect(compareWithPending([v('a.tsx', '#fff'), v('a.tsx', '#fff'), other], pending).unexpected).toEqual([other])
  })

  it('reports an entry as stale when fewer occurrences remain', () => {
    expect(compareWithPending([v('a.tsx', '#fff')], pending).stale).toEqual([
      { ticket: 'DATAI-623', file: 'a.tsx', match: '#fff', listed: 2, found: 1 },
    ])
  })

  it('exempts a path prefix only for the listed kinds', () => {
    const arb = v('ai/x.tsx', 'p-[7px]', 'arbitrary')
    const hex = v('ai/x.tsx', '#000', 'hex')
    const result = compareWithPending([v('a.tsx', '#fff'), v('a.tsx', '#fff'), arb, hex], pending)
    expect(result.unexpected).toEqual([hex])
  })

  it('detects stale entries when two tickets list the same file+match', () => {
    const pending2 = [
      { ticket: 'DATAI-622', entries: [{ file: 'a.tsx', match: 'rgba(168,197,195,0.5)', count: 1 }] },
      { ticket: 'DATAI-623', entries: [{ file: 'a.tsx', match: 'rgba(168,197,195,0.5)', count: 1 }] },
    ]
    const one = compareWithPending([v('a.tsx', 'rgba(168,197,195,0.5)', 'color-fn')], pending2)
    expect(one.stale).toEqual([
      { ticket: 'DATAI-622', file: 'a.tsx', match: 'rgba(168,197,195,0.5)', listed: 1, found: 1 },
      { ticket: 'DATAI-623', file: 'a.tsx', match: 'rgba(168,197,195,0.5)', listed: 1, found: 1 },
    ])
    const two = compareWithPending([v('a.tsx', 'rgba(168,197,195,0.5)', 'color-fn'), v('a.tsx', 'rgba(168,197,195,0.5)', 'color-fn')], pending2)
    expect(two.stale).toEqual([])
    expect(two.unexpected).toEqual([])
  })
})

describe('ticketFor', () => {
  it('sends AI Mode files to DATAI-630', () => {
    expect(ticketFor(v('components/pages/ai-mode-playground/X.module.css', '#fff'), '')).toBe('DATAI-630')
  })

  it('sends sub-12px arbitrary font sizes to DATAI-556', () => {
    expect(ticketFor(v('a.tsx', 'text-[10px]', 'arbitrary'), '')).toBe('DATAI-556')
  })

  it('sends on-dark text below .85 to DATAI-622 and other colours to DATAI-623', () => {
    expect(ticketFor(v('a.tsx', 'rgba(168,197,195,0.5)', 'color-fn'), "style={{ color: 'rgba(168,197,195,0.5)' }}")).toBe('DATAI-622')
    expect(ticketFor(v('a.tsx', 'rgba(168,197,195,0.5)', 'color-fn'), "style={{ borderColor: 'rgba(168,197,195,0.5)' }}")).toBe('DATAI-623')
    expect(ticketFor(v('a.tsx', '#fff'), "{ color: '#fff' }")).toBe('DATAI-623')
  })

  it('distinguishes color from background-color and border-color in CSS', () => {
    expect(ticketFor(v('a.tsx', 'rgba(168,197,195,0.5)', 'color-fn'), '.x { background-color: rgba(168,197,195,0.5); }')).toBe('DATAI-623')
    expect(ticketFor(v('a.tsx', 'rgba(168,197,195,0.5)', 'color-fn'), '.x { color: rgba(168,197,195,0.5); }')).toBe('DATAI-622')
  })

  it('refuses to guess for an arbitrary value with no fix ticket', () => {
    expect(() => ticketFor(v('a.tsx', 'mt-[7px]', 'arbitrary'), '')).toThrow(/先問 An/)
  })
})

describe('buildPending / serializePending', () => {
  it('groups by ticket, file and match, and always adds the AI Mode path entry', () => {
    const tickets = buildPending([v('a.tsx', '#fff'), v('a.tsx', '#fff'), v('a.tsx', 'text-[10px]', 'arbitrary')], () => '')
    expect(tickets.map((t) => t.ticket)).toEqual(['DATAI-556', 'DATAI-623', 'DATAI-630'])
    expect(tickets[1].entries).toEqual([{ file: 'a.tsx', match: '#fff', count: 2 }])
    expect(tickets[2].paths?.map((p) => p.prefix)).toEqual(['app/ai-mode-playground/', 'components/pages/ai-mode-playground/'])
  })

  it('writes a module that default-exports the ticket', () => {
    const text = serializePending({ ticket: 'DATAI-623', entries: [{ file: 'a.tsx', match: "it's", count: 1 }] })
    expect(text).toContain("ticket: 'DATAI-623'")
    expect(text).toContain('{ file: "a.tsx", match: "it\'s", count: 1 }')
    expect(text).toContain('export default pending')
  })
})
