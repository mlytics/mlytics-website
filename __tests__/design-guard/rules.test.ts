import { describe, expect, it } from 'vitest'
import { blankText, findViolations, parseRgba, stripComments } from './rules'

const found = (file: string, src: string) => findViolations(file, src).map((v) => `${v.kind} ${v.match}`)
const hintOf = (src: string) => findViolations('a.tsx', src)[0]?.hint ?? ''

describe('stripComments', () => {
  it('blanks block and whole-line comments and keeps line numbers', () => {
    const src = 'a\n/* #fff\n */\n// #000\nb'
    const out = stripComments(src)
    expect(out.split('\n')).toHaveLength(5)
    expect(out).not.toContain('#')
    expect(out.startsWith('a\n')).toBe(true)
    expect(out.endsWith('\nb')).toBe(true)
  })

  it('blanks JSX comments', () => {
    expect(stripComments('<div>{/* #fff */}</div>')).not.toContain('#')
  })

  it('keeps a trailing // because it may sit inside a URL string', () => {
    expect(stripComments("const u = 'https://x.com'")).toContain('https://x.com')
  })
})

describe('blankText', () => {
  it('replaces every occurrence with spaces of the same length', () => {
    expect(blankText('a p-[11px] b p-[11px]', 'p-[11px]')).toBe('a          b         ')
  })
})

describe('hex colours', () => {
  it('flags hard-coded hex', () => {
    expect(found('a.tsx', "style={{ color: '#fff' }}")).toEqual(['hex #fff'])
    expect(found('a.tsx', "background: '#FFFFFF'")).toEqual(['hex #FFFFFF'])
  })

  it('ignores HTML entities, comments and anchors that are not colour-length hex', () => {
    expect(found('a.tsx', "'&#123;' /* #fff */ href=\"#faq\" href=\"#section-2\"")).toEqual([])
  })

  it('finds hex inside underscore-separated arbitrary values', () => {
    expect(found('a.tsx', 'className="shadow-[0_0_0_1px_#fff]"')).toEqual(['hex #fff'])
  })

  it('reports the 1-based line', () => {
    expect(findViolations('a.tsx', "\n\n'#fff'")[0].line).toBe(3)
  })
})

describe('rgba / rgb / hsl', () => {
  it('allows the two bases on the ladder', () => {
    expect(found('a.tsx', "'rgba(34,93,89,0.4)' 'rgba(168, 197, 195, .85)' 'rgba(34,93,89,0.06)'")).toEqual([])
  })

  it('flags an off-ladder alpha and names the nearest step', () => {
    expect(found('a.tsx', "'rgba(34,93,89,0.5)'")).toEqual(['color-fn rgba(34,93,89,0.5)'])
    expect(hintOf("'rgba(34,93,89,0.5)'")).toContain('0.55')
  })

  it('flags other colours, opaque bases and hsl', () => {
    expect(found('a.tsx', "'rgba(0,0,0,0.08)' 'rgb(34,93,89)' 'hsl(0 0% 100%)'")).toEqual([
      'color-fn rgba(0,0,0,0.08)',
      'color-fn rgb(34,93,89)',
      'color-fn hsl(0 0% 100%)',
    ])
  })

  it('parses bases and alpha', () => {
    expect(parseRgba('rgba(168,197,195,0.5)')).toEqual({ base: 'on-dark', alpha: 0.5 })
    expect(parseRgba('rgb(34, 93, 89)')).toEqual({ base: 'primary', alpha: null })
    expect(parseRgba('rgba(0,0,0,.1)')).toEqual({ base: null, alpha: 0.1 })
    expect(parseRgba('hsl(0 0% 100%)')).toBeNull()
  })
})

describe('Tailwind arbitrary values', () => {
  it('flags spacing and suggests the 4px step', () => {
    expect(found('a.tsx', 'className="pt-[96px]"')).toEqual(['arbitrary pt-[96px]'])
    expect(hintOf('className="pt-[96px]"')).toContain('pt-24')
    expect(hintOf('className="-mr-[11px]"')).toContain('-mr-2')
    expect(found('a.tsx', 'className="md:gap-[14px] space-y-[1.5rem]"')).toEqual([
      'arbitrary md:gap-[14px]',
      'arbitrary space-y-[1.5rem]',
    ])
  })

  it('flags font size, letter spacing and line height', () => {
    expect(found('a.tsx', 'className="text-[10px] tracking-[.12em] leading-[1.1]"')).toEqual([
      'arbitrary text-[10px]',
      'arbitrary tracking-[.12em]',
      'arbitrary leading-[1.1]',
    ])
  })

  it('flags colour values (the hex inside is reported too)', () => {
    expect(found('a.tsx', 'className="bg-[#fff]"')).toEqual(['hex #fff', 'arbitrary bg-[#fff]'])
    expect(found('a.tsx', 'className="border-t-[var(--color-line)]"')).toEqual(['arbitrary border-t-[var(--color-line)]'])
  })

  it('allows the outline-button calc() padding anywhere (DESIGN.md §2.10 例外 3)', () => {
    expect(found('a.tsx', 'className="px-[calc(1.5rem-1px)] py-[calc(0.75rem-1px)] px-[calc(1rem-1px)]"')).toEqual([])
    expect(found('a.tsx', 'className="mt-[calc(1rem-1px)] px-[calc(1rem-2px)]"')).toEqual([
      'arbitrary mt-[calc(1rem-1px)]',
      'arbitrary px-[calc(1rem-2px)]',
    ])
  })

  it('does not flag layout structure', () => {
    const layout = [
      'grid-cols-[260px_1fr]', 'md:grid-rows-[auto_auto]', 'w-[10px]', 'h-[2.6em]', 'z-[60]',
      'min-w-[46rem]', 'max-w-[80rem]', 'scale-[0.98]', 'active:scale-[0.98]', 'max-[420px]:h-[2.6em]',
      'border-[1.5px]', 'left-[28px]', 'md:h-[170px]',
    ]
    expect(found('a.tsx', `className="${layout.join(' ')}"`)).toEqual([])
  })

  it('keeps the variant chain in the match', () => {
    expect(found('a.tsx', 'className="max-[420px]:text-[27px]"')).toEqual(['arbitrary max-[420px]:text-[27px]'])
  })

  it('finds colour functions inside underscore-separated arbitrary values', () => {
    expect(found('a.tsx', 'className="shadow-[0_0_0_1px_rgba(0,0,0,0.1)]"')).toEqual(['color-fn rgba(0,0,0,0.1)'])
    expect(found('a.tsx', 'className="shadow-[0_4px_20px_rgba(0,0,0,0.08)]"')).toEqual(['color-fn rgba(0,0,0,0.08)'])
  })

  it('catches arbitrary variants, child selectors and named groups as prefixes', () => {
    expect(found('a.tsx', 'className="[&>svg]:p-[3px]"')).toEqual(['arbitrary [&>svg]:p-[3px]'])
    expect(found('a.tsx', 'className="[&_svg]:text-[10px]"')).toEqual(['arbitrary [&_svg]:text-[10px]'])
    expect(found('a.tsx', 'className="*:mt-[7px]"')).toEqual(['arbitrary *:mt-[7px]'])
    expect(found('a.tsx', 'className="group-hover/item:mt-[7px]"')).toEqual(['arbitrary group-hover/item:mt-[7px]'])
  })

  it('does not look for class names in CSS files', () => {
    expect(found('a.module.css', '.x { padding: 14px; color: #fff; }')).toEqual(['hex #fff'])
  })
})
