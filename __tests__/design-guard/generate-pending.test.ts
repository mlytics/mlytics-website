import { mkdirSync, readdirSync, rmSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { expect, it } from 'vitest'
import { APPROVED } from './approved'
import { buildPending, serializePending } from './ledger'
import { readSource, scanRepo } from './scan-repo'

// Regenerates pending/*.ts from the current violations. Skipped unless
// DESIGN_GUARD_WRITE=1. Only for the initial baseline or a rebase onto a main
// where fix tickets already landed — never to make room for new code.
// Regenerating overwrites hand-made ticket moves (as of 2026-10-20: SVG text fills at FlywheelDiagram.tsx and BrandGEOSection.tsx moved 623→622), so re-check DATAI-622 after regenerating.
it.runIf(process.env.DESIGN_GUARD_WRITE === '1')('writes pending/*.ts', () => {
  const dir = resolve(__dirname, 'pending')
  mkdirSync(dir, { recursive: true })
  for (const f of readdirSync(dir)) if (f.endsWith('.ts')) rmSync(resolve(dir, f))
  const lines = new Map<string, string[]>()
  const lineText = (v: { file: string; line: number }) => {
    if (!lines.has(v.file)) lines.set(v.file, readSource(v.file).split('\n'))
    return lines.get(v.file)![v.line - 1] ?? ''
  }
  const tickets = buildPending(scanRepo(APPROVED), lineText)
  for (const t of tickets) writeFileSync(resolve(dir, `${t.ticket}.ts`), serializePending(t))
  expect(tickets.length).toBeGreaterThan(0)
})
