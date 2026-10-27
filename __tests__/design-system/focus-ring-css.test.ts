import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import postcss from 'postcss'
import tailwindcss from '@tailwindcss/postcss'
import { beforeAll, expect, it } from 'vitest'

// DESIGN.md §3.7 (DECISIONS #47): one site-wide focus ring in the compiled site CSS.
const root = resolve(__dirname, '../..')
const entry = resolve(root, 'app/globals.css')
let ast: postcss.Root
beforeAll(async () => {
  const result = await postcss([tailwindcss({ base: root })]).process(readFileSync(entry, 'utf8'), { from: entry })
  ast = postcss.parse(result.css)
}, 30_000)

function decls(selector: string) {
  const out: Record<string, string> = {}
  ast.walkRules((r) => {
    if (r.selectors.map((s) => s.replace(/\s+/g, ' ').trim()).includes(selector)) r.walkDecls((d) => { out[d.prop] = d.value })
  })
  return out
}

it('focus ring: 2px primary, offset 2px', () => {
  const d = decls(':focus-visible')
  expect(d.outline).toBe('2px solid var(--color-primary)')
  expect(d['outline-offset']).toBe('2px')
})
it('focus ring inside dark sections uses on-dark', () => {
  expect(decls('.section-dark :focus-visible')['outline-color']).toBe('var(--color-on-dark)')
})
it('white or surface panels inside dark sections switch back to primary', () => {
  expect(decls('.section-dark :is([class~="bg-white"], [class~="bg-surface"]) :focus-visible')['outline-color']).toBe('var(--color-primary)')
})
it('Nav no longer carries its own focus ring classes', () => {
  const nav = readFileSync(resolve(root, 'components/layout/Nav.tsx'), 'utf8')
  expect(nav).not.toMatch(/FOCUS_RING|focus-visible:outline/)
})
