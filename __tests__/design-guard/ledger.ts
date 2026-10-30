// Bookkeeping for the design guard: today's deviations are frozen per fix
// ticket in pending/DATAI-xxx.ts. A violation is allowed only while its
// ticket still lists it; a listed count higher than what is found means a fix
// landed and the entry must shrink. The list can only get shorter.
import { type Kind, type Violation } from './rules'

export interface PendingEntry { file: string; match: string; count: number }
export interface PendingPath { prefix: string; kinds: Kind[] }
export interface PendingTicket { ticket: string; entries: PendingEntry[]; paths?: PendingPath[] }
export interface StaleEntry { ticket: string; file: string; match: string; listed: number; found: number }

const key = (file: string, match: string) => `${file}\u0000${match}`

export function compareWithPending(violations: Violation[], pending: PendingTicket[]) {
  const exempt = (v: Violation) =>
    pending.some((t) => t.paths?.some((p) => v.file.startsWith(p.prefix) && p.kinds.includes(v.kind)))

  const found = new Map<string, Violation[]>()
  for (const v of violations) {
    if (exempt(v)) continue
    const k = key(v.file, v.match)
    found.set(k, [...(found.get(k) ?? []), v])
  }

  const listed = new Map<string, number>()
  for (const t of pending) {
    for (const e of t.entries) {
      const k = key(e.file, e.match)
      listed.set(k, (listed.get(k) ?? 0) + e.count)
    }
  }

  const unexpected: Violation[] = []
  for (const [k, vs] of found) unexpected.push(...vs.slice(listed.get(k) ?? 0))

  const stale: StaleEntry[] = []
  for (const t of pending) {
    for (const e of t.entries) {
      const k = key(e.file, e.match)
      const n = found.get(k)?.length ?? 0
      const totalListed = listed.get(k) ?? 0
      if (n < totalListed) stale.push({ ticket: t.ticket, file: e.file, match: e.match, listed: e.count, found: n })
    }
  }
  return { unexpected, stale }
}

export const AI_MODE_PREFIXES = ['app/ai-mode-playground/', 'components/pages/ai-mode-playground/']

/** Only AI Mode has a rule-based ticket assignment; all other ownership needs An. */
export function ticketFor(v: Violation, _lineText: string): string {
  if (AI_MODE_PREFIXES.some((p) => v.file.startsWith(p))) return 'DATAI-630'
  throw new Error(`${v.file}:${v.line} ${v.match} 沒有對應的修正票，先問 An`)
}

export function buildPending(violations: Violation[], lineText: (v: Violation) => string): PendingTicket[] {
  const counts = new Map<string, Map<string, PendingEntry>>()
  for (const v of violations) {
    const ticket = ticketFor(v, lineText(v))
    if (ticket === 'DATAI-630' && v.kind === 'arbitrary') continue // covered by the path entry
    const entries = counts.get(ticket) ?? new Map<string, PendingEntry>()
    const e = entries.get(key(v.file, v.match)) ?? { file: v.file, match: v.match, count: 0 }
    e.count += 1
    entries.set(key(v.file, v.match), e)
    counts.set(ticket, entries)
  }
  if (!counts.has('DATAI-630')) counts.set('DATAI-630', new Map())
  const byFileThenMatch = (a: PendingEntry, b: PendingEntry) => a.file.localeCompare(b.file) || a.match.localeCompare(b.match)
  return [...counts.keys()].sort().map((ticket) => ({
    ticket,
    entries: [...counts.get(ticket)!.values()].sort(byFileThenMatch),
    ...(ticket === 'DATAI-630' ? { paths: AI_MODE_PREFIXES.map((prefix) => ({ prefix, kinds: ['arbitrary'] as Kind[] })) } : {}),
  }))
}

export function serializePending(t: PendingTicket): string {
  const lines = [
    "import type { PendingTicket } from '../ledger'",
    '',
    `// ${t.ticket} 的現有違規（DATAI-638 守門的待修白名單）。`,
    '// 修好就把 count 減掉；歸零刪條目；整檔清空刪檔。不可為新程式新增條目。',
    'const pending: PendingTicket = {',
    `  ticket: '${t.ticket}',`,
  ]
  if (t.paths?.length) {
    lines.push('  paths: [')
    for (const p of t.paths) lines.push(`    { prefix: ${JSON.stringify(p.prefix)}, kinds: ${JSON.stringify(p.kinds)} },`)
    lines.push('  ],')
  }
  lines.push('  entries: [')
  for (const e of t.entries) lines.push(`    { file: ${JSON.stringify(e.file)}, match: ${JSON.stringify(e.match)}, count: ${e.count} },`)
  lines.push('  ],', '}', '', 'export default pending', '')
  return lines.join('\n')
}
