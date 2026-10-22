import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import postcss from 'postcss'
import tailwindcss from '@tailwindcss/postcss'
import { beforeAll, expect, it } from 'vitest'

// DESIGN.md §8.4: with reduced motion on, smooth scrolling is switched off in
// the compiled site CSS (site-base.css sets html { scroll-behavior: smooth }).
const root = resolve(__dirname, '../..')
const entry = resolve(root, 'app/globals.css')
let ast: postcss.Root

beforeAll(async () => {
  const result = await postcss([tailwindcss({ base: root })]).process(readFileSync(entry, 'utf8'), { from: entry })
  ast = postcss.parse(result.css)
}, 30_000)

function htmlScrollBehavior(inReduce: boolean) {
  const found: string[] = []
  ast.walkDecls('scroll-behavior', (d) => {
    const rule = d.parent as postcss.Rule
    if (rule?.type !== 'rule' || !rule.selectors.some((s) => s.trim() === 'html')) return
    let reduce = false
    for (let p = rule.parent; p && p.type !== 'root'; p = p.parent) {
      if (p.type === 'atrule' && /prefers-reduced-motion:\s*reduce/.test((p as postcss.AtRule).params)) reduce = true
    }
    if (reduce === inReduce) found.push(`${d.value}${d.important ? ' !important' : ''}`)
  })
  return found
}

it('keeps smooth scrolling by default', () => {
  expect(htmlScrollBehavior(false)).toEqual(['smooth'])
})

it('turns smooth scrolling off under prefers-reduced-motion: reduce', () => {
  expect(htmlScrollBehavior(true)).toEqual(['auto !important'])
})
