import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import postcss from 'postcss'
import tailwindcss from '@tailwindcss/postcss'
import { beforeAll, describe, expect, it } from 'vitest'

// DESIGN.md §2.8 / §7.5: Tailwind v4 drops or renames theme values silently,
// so check what the site CSS actually compiles to, not only site-base.css.

const root = resolve(__dirname, '../..')
const entry = resolve(root, 'app/globals.css')

/** Lower-cases and drops whitespace and leading zeros, so `0.875rem` and `.875rem` compare equal. */
const norm = (v: string) => v.trim().toLowerCase().replace(/\s+/g, '').replace(/(^|[^\d.])0+\./g, '$1.')

let ast: postcss.Root

beforeAll(async () => {
  // `from` is the entry file so its @import and @source paths resolve as in the build.
  const result = await postcss([tailwindcss({ base: root })]).process(readFileSync(entry, 'utf8'), { from: entry })
  ast = postcss.parse(result.css)
}, 30_000)

/** Custom property values declared on :root (alone or in a selector list), keyed by the @media params ('' = none). */
function rootVars(): Map<string, Map<string, string>> {
  const out = new Map<string, Map<string, string>>()
  ast.walkDecls((d) => {
    if (!d.prop.startsWith('--')) return
    const rule = d.parent
    if (rule?.type !== 'rule' || !(rule as postcss.Rule).selectors.some((s) => s.trim() === ':root')) return
    let media = ''
    for (let p = rule.parent; p && p.type !== 'root'; p = p.parent) {
      if (p.type === 'atrule' && (p as postcss.AtRule).name === 'media') media = norm((p as postcss.AtRule).params)
    }
    if (!out.has(media)) out.set(media, new Map())
    out.get(media)!.set(d.prop, norm(d.value))
  })
  return out
}

describe('compiled site CSS (app/globals.css)', () => {
  it('generates .text-h3 as font-size: var(--text-h3)', () => {
    const decls: string[] = []
    ast.walkRules((r) => { if (r.selector === '.text-h3') r.walkDecls((d) => { decls.push(`${d.prop}:${norm(d.value)}`) }) })
    expect(decls).toContain('font-size:var(--text-h3)')
  })

  it('emits the display / h1 / h2 base values and their md / lg overrides', () => {
    const vars = rootVars()
    const base = vars.get('')
    expect(base?.get('--text-display')).toBe(norm('2.25rem'))
    expect(base?.get('--text-h1')).toBe(norm('2.25rem'))
    expect(base?.get('--text-h2')).toBe(norm('1.875rem'))
    const md = [...vars].find(([m]) => m.includes('48rem'))?.[1]
    expect(md?.get('--text-display')).toBe(norm('3.75rem'))
    expect(md?.get('--text-h1')).toBe(norm('3rem'))
    expect(md?.get('--text-h2')).toBe(norm('2.25rem'))
    const lg = [...vars].find(([m]) => m.includes('64rem'))?.[1]
    expect(lg?.get('--text-h2')).toBe(norm('3rem'))
  })

  it('keeps the four AI Mode compatibility variables with their old values', () => {
    const base = rootVars().get('')
    expect(base?.get('--font-size-h2')).toBe(norm('2.25rem'))
    expect(base?.get('--font-size-h3')).toBe(norm('1.5rem'))
    expect(base?.get('--font-size-small')).toBe(norm('0.875rem'))
    expect(base?.get('--font-size-caption')).toBe(norm('0.75rem'))
  })
})
