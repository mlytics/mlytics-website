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

describe('Tailwind opacity-modifier colours (DESIGN.md §2.3)', () => {
  it('allows the two bases on the ladder, with variants and bracket alpha', () => {
    expect(found('a.tsx', 'className="bg-primary/8 text-on-dark/85 hover:bg-primary/12 bg-primary/[0.25] text-on-dark/[.4] bg-primary/[40%]"')).toEqual([])
  })

  it('flags off-ladder alpha, other colours and keeps the variant chain in the match', () => {
    expect(found('a.tsx', 'className="bg-primary/30 bg-primary/[0.3] text-white/50 bg-black/20 shadow-black/10 md:text-on-dark/65 border-gray-100/50"')).toEqual([
      'opacity bg-primary/30',
      'opacity bg-primary/[0.3]',
      'opacity text-white/50',
      'opacity bg-black/20',
      'opacity shadow-black/10',
      'opacity md:text-on-dark/65',
      'opacity border-gray-100/50',
    ])
  })

  it('flags hover variants on white', () => {
    expect(found('a.tsx', 'className="hover:bg-white/10 border-t-white/8"')).toEqual(['opacity hover:bg-white/10', 'opacity border-t-white/8'])
  })

  it('names the nearest ladder step for an off-ladder alpha', () => {
    expect(hintOf('className="text-on-dark/65"')).toContain('0.7')
    expect(hintOf('className="bg-primary/[30%]"')).toContain('0.25')
  })

  it('says only the two bases are allowed for any other colour', () => {
    expect(hintOf('className="text-white/50"')).toContain('primary 與 on-dark')
  })

  it('does not flag fractions, plain opacity, aspect ratios, text-size/line-height or paths', () => {
    expect(found('a.tsx', `className="w-1/2 translate-x-1/2 opacity-50 aspect-16/9 grid-cols-[1fr_40px_1fr] text-sm/6 text-lg/7" href='/brands/' src="/img/bg-x/y.png"`)).toEqual([])
  })

  it('does not look for class names in CSS files', () => {
    expect(found('a.module.css', '.x { content: "bg-white/10"; }')).toEqual([])
  })

  it('covers Tailwind v4 colour utilities and reports the full token', () => {
    const cls = ['drop-shadow-white/50', 'inset-shadow-white/50', 'inset-ring-white/50', 'ring-offset-white/50', 'placeholder-white/50', 'border-s-white/50', 'border-e-white/50']
    for (const c of cls) expect(found('a.tsx', `className="${c}"`)).toEqual([`opacity ${c}`])
    expect(found('a.tsx', 'className="md:inset-shadow-black/10"')).toEqual(['opacity md:inset-shadow-black/10'])
    expect(found('a.tsx', 'className="text-sm/6 w-1/2 aspect-16/9"')).toEqual([])
  })

  it('shares the utility list with the arbitrary colour check', () => {
    expect(found('a.tsx', 'className="inset-ring-[#fff]"')).toEqual(['hex #fff', 'arbitrary inset-ring-[#fff]'])
  })

  it('takes a decimal alpha whole', () => {
    expect(found('a.tsx', 'className="bg-white/2.5"')).toEqual(['opacity bg-white/2.5'])
    expect(found('a.tsx', 'className="bg-primary/2.5"')).toEqual(['opacity bg-primary/2.5'])
    expect(hintOf('className="bg-primary/2.5"')).toContain('0.025')
  })

  it('says /100 is opaque and /0 is fully transparent', () => {
    expect(found('a.tsx', 'className="bg-primary/100 bg-primary/0"')).toEqual(['opacity bg-primary/100', 'opacity bg-primary/0'])
    expect(hintOf('className="bg-primary/100"')).toContain('不透明')
    expect(hintOf('className="bg-primary/100"')).not.toContain('就近')
    expect(hintOf('className="bg-primary/0"')).toContain('全透明')
    expect(hintOf('className="bg-primary/0"')).toContain('bg-transparent')
  })
})
