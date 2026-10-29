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
  it('replaces every complete literal class token with spaces of the same length', () => {
    expect(blankText('className="p-[11px] p-[11px]"', 'p-[11px]')).toBe(`className="${' '.repeat(17)}"`)
  })

  it('requires complete class tokens and complete property values', () => {
    expect(blankText('p-[11px] gap-[11px] hover:p-[11px]', 'p-[11px]')).toContain('gap-[11px] hover:p-[11px]')
    expect(blankText("'rgba(180,83,9,0.3), red'", 'rgba(180,83,9,0.3)', true)).toContain('rgba(180,83,9,0.3)')
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
    expect(parseRgba('RGBA(34,93,89,0.4)')).toEqual({ base: 'primary', alpha: 0.4 })
  })

  it('finds upper-case colour functions without rejecting compliant upper-case RGBA', () => {
    expect(found('a.tsx', "'OKLCH(50% 0.1 20)' 'RGBA(34,93,89,0.4)'")).toEqual(['color-fn OKLCH(50% 0.1 20)'])
  })
})

describe('new colour syntax regressions', () => {
  it('captures a complete nested color-mix value', () => {
    expect(found('a.module.css', 'background: color-mix(in srgb, var(--color-primary) 18%, transparent);')).toEqual(['color-fn color-mix(in srgb, var(--color-primary) 18%, transparent)'])
  })

  it('catches named colours in visible style contexts', () => {
    expect(found('a.tsx', "style={{ color: 'white', background: 'linear-gradient(black, red)' }}")).toEqual(['named-color white', 'named-color black', 'named-color red'])
  })

  it('captures every added colour function through nested parentheses', () => {
    const values = ['oklch(50% 0.1 20)', 'oklab(0.5 0.1 0.1)', 'lab(50% 0 0)', 'lch(50% 0 0)', 'hwb(0 0% 0%)', 'color(display-p3 1 0 0)', 'color(from var(--brand) srgb r g b / calc(alpha * .5))', 'color-mix(in srgb, var(--color-primary) 18%, transparent)']
    expect(found('a.module.css', values.map((x) => `color: ${x};`).join('\n'))).toEqual(values.map((x) => `color-fn ${x}`))
  })

  it('flags color() in Tailwind arbitrary colour utilities', () => {
    expect(found('a.tsx', 'className="bg-[color(display-p3_1_0_0)]"')).toEqual([
      'color-fn color(display-p3_1_0_0)',
      'arbitrary bg-[color(display-p3_1_0_0)]',
    ])
  })

  it('reports a nested colour function once as its complete outer match', () => {
    expect(found('a.module.css', 'background: color-mix(in srgb, rgb(255 0 0) 18%, transparent);')).toEqual(['color-fn color-mix(in srgb, rgb(255 0 0) 18%, transparent)'])
  })

  it('flags named colours in SVG stroke, visible CSS gradients, and arbitrary colour values', () => {
    expect(found('a.tsx', '<path stroke="white" /> className="bg-[red]"')).toEqual(['named-color white', 'arbitrary bg-[red]'])
    expect(found('a.module.css', '.a { background: linear-gradient(black, white); }')).toEqual(['named-color black', 'named-color white'])
    expect(found('a.module.css', '.a { border: 1px solid red; --custom: blue; }')).toEqual(['named-color red', 'named-color blue'])
  })

  it('catches static JSX expression attributes and quoted style keys', () => {
    expect(found('a.tsx', `<path stroke={"white"} fill={'red'} style={{ "color": "blue" }} />`)).toEqual(['named-color blue', 'named-color white', 'named-color red'])
  })

  it('catches static template literal SVG colours', () => {
    expect(found('a.tsx', '<path stroke={`white`} />')).toEqual(['named-color white'])
  })

  it('catches border-inline and text-decoration shorthand named colours', () => {
    expect(found('a.module.css', '.a { border-inline-color: red; text-decoration: underline blue; }')).toEqual(['named-color red', 'named-color blue'])
  })

  it('catches named colours in every visible CSS colour context', () => {
    const properties = [
      'accent-color: red',
      'caret-color: blue',
      'column-rule-color: green',
      'flood-color: gold',
      'lighting-color: white',
      'stop-color: black',
      'text-emphasis-color: purple',
      '-webkit-text-fill-color: orange',
      '-webkit-text-stroke-color: pink',
      'scrollbar-color: teal silver',
      'filter: blur(1px) drop-shadow(0 0 2px brown)',
    ]
    expect(found('a.module.css', `.x { ${properties.join('; ')}; }`)).toEqual([
      'named-color red',
      'named-color blue',
      'named-color green',
      'named-color gold',
      'named-color white',
      'named-color black',
      'named-color purple',
      'named-color orange',
      'named-color pink',
      'named-color teal',
      'named-color silver',
      'named-color brown',
    ])
  })

  it('catches named colours in CSS and TSX colour shorthands', () => {
    expect(found('a.module.css', '.x { column-rule: 1px solid red; text-emphasis: filled blue; -webkit-text-stroke: 1px green; }')).toEqual([
      'named-color red', 'named-color blue', 'named-color green',
    ])
    expect(found('a.tsx', `<div style={{ columnRule: '1px solid red', textEmphasis: 'filled blue', WebkitTextStroke: '1px green' }} />`)).toEqual([
      'named-color red', 'named-color blue', 'named-color green',
    ])
  })

  it('catches conditional static string leaves in TSX style and SVG colour contexts', () => {
    const source = `<svg
      style={{ accentColor: active ? 'red' : ('blue' as string), filter: active ? 'drop-shadow(0 0 2px green)' : undefined }}
      stroke={active ? 'white' : 'black'}
      floodColor={active ? \`gold\` : \`purple\`}
    />`
    expect(found('a.tsx', source)).toEqual([
      'named-color red',
      'named-color blue',
      'named-color green',
      'named-color white',
      'named-color black',
      'named-color gold',
      'named-color purple',
    ])
  })

  it('catches visible colours inside inline style-object spreads', () => {
    expect(found('a.tsx', `<div style={{ ...(active ? { color: 'red' } : { color: 'blue' }) }} />`)).toEqual([
      'named-color red',
      'named-color blue',
    ])
  })

  it('resolves inline spread mask modes conservatively without losing alpha masks', () => {
    expect(found('a.tsx', `<div style={{ ...{ maskMode: 'luminance' }, maskImage: 'linear-gradient(black, white)' }} />`)).toEqual([
      'named-color black',
      'named-color white',
    ])
    expect(found('a.tsx', `<div style={{ ...{ maskMode: 'alpha' }, maskImage: 'linear-gradient(black, white)' }} />`)).toEqual([])
    expect(found('a.tsx', `<div style={{ ...(active ? { maskMode: 'alpha' } : { maskMode: 'luminance' }), maskImage: 'linear-gradient(black, white)' }} />`)).toEqual([
      'named-color black',
      'named-color white',
    ])
  })

  it('uses the final inline style mask mode for mask images inside spreads', () => {
    const blocked = ['named-color black', 'named-color white']
    expect(found('a.tsx', `<div style={{ ...{ maskImage: 'linear-gradient(black, white)', maskMode: 'alpha' }, maskMode: 'luminance' }} />`)).toEqual(blocked)
    expect(found('a.tsx', `<div style={{ ...{ maskImage: 'linear-gradient(black, white)', maskMode: 'luminance' }, maskMode: 'alpha' }} />`)).toEqual([])
  })

  it('scans value-producing logical spread branches and their final mask modes', () => {
    expect(found('a.tsx', `<div style={{ ...(enabled && { color: 'red' }), ...(choice || { color: 'blue' }), ...(option ?? { color: 'green' }) }} />`)).toEqual([
      'named-color red', 'named-color blue', 'named-color green',
    ])
    expect(found('a.tsx', `<div style={{ ...(enabled && { maskImage: 'linear-gradient(black, white)' }), maskMode: 'luminance' }} />`)).toEqual([
      'named-color black', 'named-color white',
    ])
    expect(found('a.tsx', `<div style={{ ...(theme === 'red' && { color: 'blue' }) }} />`)).toEqual(['named-color blue'])
    expect(found('a.tsx', `<div style={{ ...({ color: 'red' } || { color: 'blue' }), ...({ color: 'green' } ?? { color: 'gold' }) }} />`)).toEqual([
      'named-color red', 'named-color green',
    ])
  })

  it('scans only value-producing conditional branches, not tests or type nodes', () => {
    expect(found('a.tsx', `<div style={{ color: theme === 'red' ? 'var(--color-primary)' : 'currentColor' }} />`)).toEqual([])
    expect(found('a.tsx', `<path stroke={value as 'red' | 'blue'} />`)).toEqual([])
  })

  it('catches conditional colours inside a drop-shadow template interpolation', () => {
    expect(found('a.tsx', `<div style={{ filter: \`drop-shadow(0 0 2px \${active ? 'red' : 'blue'})\` }} />`)).toEqual([
      'named-color red',
      'named-color blue',
    ])
  })

  it('keeps interpolated URL and var names inside their full CSS value', () => {
    expect(found('a.tsx', `<div style={{ filter: \`url(/\${'red'}.svg) drop-shadow(0 0 2px var(--color-primary))\` }} />`)).toEqual([])
    expect(found('a.tsx', `<div style={{ filter: \`drop-shadow(0 0 2px var(--\${'red'}))\` }} />`)).toEqual([])
    expect(found('a.tsx', `<div style={{ filter: \`drop-shadow(0 0 2px \${'red'})\` }} />`)).toEqual(['named-color red'])
  })

  it.each([['LF', '\n'], ['CRLF', '\r\n'], ['CR', '\r']])('scans template colours with %s source newlines', (_, newline) => {
    const source = '<div style={{ background: `linear-gradient(' + newline + 'red, blue' + newline + ')` }} />'
    expect(found('a.tsx', source)).toEqual(['named-color red', 'named-color blue'])
  })

  it('scans decoded JavaScript colour escapes at their source line', () => {
    expect(found('a.tsx', '<div style={{ color: "r\\u0065d" }} />')).toEqual(['named-color red'])
    expect(found('a.tsx', '<path stroke={"\\x72ed"} />')).toEqual(['named-color red'])
    expect(findViolations('a.tsx', '\n<div style={{ color: "r\\u0065d" }} />')[0]?.line).toBe(2)
  })

  it('keeps prose and Tailwind text-white outside named-colour contexts', () => {
    expect(found('a.tsx', `const prose = condition ? 'red' : 'blue'; <p className="text-white">white prose</p>`)).toEqual([])
    expect(found('a.module.css', '.x { content: "red"; filter: blur(2px); }')).toEqual([])
  })

  it('matches CSS colour property names without case sensitivity', () => {
    expect(found('a.module.css', '.x { COLOR: red; }')).toEqual(['named-color red'])
  })

  it('catches named colours in CSS and TSX var fallbacks, including nested var', () => {
    expect(found('a.module.css', '.x { color: var(--missing-color, red); }')).toEqual(['named-color red'])
    expect(found('a.module.css', '.x { background: var(--outer, var(--inner, red)); }')).toEqual(['named-color red'])
    expect(found('a.tsx', "style={{ color: 'var(--missing-color, red)' }}")).toEqual(['named-color red'])
    expect(found('a.tsx', "style={{ color: 'var(--red)' }}")).toEqual([])
  })

  it('catches named colours inside compound arbitrary colour utilities', () => {
    expect(found('a.tsx', 'className="bg-[linear-gradient(red,blue)] shadow-[0_0_1px_red]"')).toEqual([
      'arbitrary bg-[linear-gradient(red,blue)]', 'arbitrary shadow-[0_0_1px_red]',
    ])
    expect(found('a.tsx', 'className="bg-[url(/red.png)] bg-[var(--color-red)]"')).toEqual(['arbitrary bg-[var(--color-red)]'])
  })

  it('allows alpha masks and ordinary prose or Tailwind white tokens', () => {
    const source = "const label = 'Microsoft Azure'; <div className=\"text-white bg-white bg-transparent\" style={{ maskImage: 'linear-gradient(black 10%, transparent 100%)', WebkitMaskImage: 'linear-gradient(black 82%, transparent 100%)', color: 'currentColor' }} />"
    expect(found('a.tsx', source)).toEqual([])
    expect(found('a.module.css', '.a { mask-image: linear-gradient(black, transparent); color: inherit; }')).toEqual([])
  })

  it('does not exempt luminance masks', () => {
    expect(found('a.tsx', "style={{ maskMode: 'luminance', maskImage: 'linear-gradient(black, white)' }}")).toEqual(['named-color black', 'named-color white'])
    expect(found('a.module.css', '.a { mask-image: linear-gradient(black, white); mask-mode: luminance; }')).toEqual(['named-color black', 'named-color white'])
  })

  it('handles WebkitMaskImage and static luminance template strings', () => {
    expect(found('a.tsx', "style={{ WebkitMaskImage: 'linear-gradient(black, transparent)' }}")).toEqual([])
    expect(found('a.tsx', 'style={{ maskMode: `luminance`, WebkitMaskImage: `linear-gradient(black, white)` }}')).toEqual(['named-color black', 'named-color white'])
  })

  it('resolves quoted mask keys and case-insensitive alpha mode', () => {
    expect(found('a.tsx', 'style={{ "maskMode": "luminance", "WebkitMaskImage": "linear-gradient(black, white)" }}')).toEqual(['named-color black', 'named-color white'])
    expect(found('a.module.css', '.a { mask-image: linear-gradient(black, white); mask-mode: ALPHA; }')).toEqual([])
  })

  it('treats mask mode lists and unresolved modes conservatively', () => {
    expect(found('a.module.css', '.a { mask-image: linear-gradient(black, white); mask-mode: alpha, luminance; }')).toEqual(['named-color black', 'named-color white'])
    expect(found('a.module.css', '.a { mask-image: linear-gradient(black, white); mask-mode: var(--mask-mode); }')).toEqual(['named-color black', 'named-color white'])
  })

  it('uses the final CSS mask-mode declaration and accepts alpha-only lists', () => {
    expect(found('a.module.css', '.x { mask-image: linear-gradient(black, white); mask-mode: luminance; mask-mode: alpha; }')).toEqual([])
    expect(found('a.module.css', '.x { mask-image: linear-gradient(black, white); mask-mode: alpha; mask-mode: luminance; }')).toEqual(['named-color black', 'named-color white'])
    expect(found('a.module.css', '.x { mask-image: linear-gradient(black, white); mask-mode: alpha, ALPHA; }')).toEqual([])
    expect(found('a.tsx', "style={{ maskMode: 'alpha, ALPHA', maskImage: 'linear-gradient(black, white)' }}")).toEqual([])
    expect(found('a.tsx', "style={{ maskMode: 'ALPHA', maskImage: 'linear-gradient(black, white)' }}")).toEqual([])
  })

  it('keeps alpha mask mode through transparent TypeScript wrappers', () => {
    expect(found('a.tsx', `<div style={{ maskMode: ('alpha' as const)!, maskImage: 'linear-gradient(black, white)' }} />`)).toEqual([])
    expect(found('a.tsx', `<div style={{ maskMode: ('luminance' satisfies string), maskImage: 'linear-gradient(black, white)' }} />`)).toEqual([
      'named-color black',
      'named-color white',
    ])
  })

  it('resolves wrapped computed mask keys and conservatively handles unknown keys', () => {
    const blocked = ['named-color black', 'named-color white']
    expect(found('a.tsx', `<div style={{ [('maskMode')]: 'luminance', maskImage: 'linear-gradient(black, white)' }} />`)).toEqual(blocked)
    expect(found('a.tsx', `<div style={{ ['maskMode' as const]: 'luminance', maskImage: 'linear-gradient(black, white)' }} />`)).toEqual(blocked)
    expect(found('a.tsx', `<div style={{ [dynamicKey]: 'luminance', maskImage: 'linear-gradient(black, white)' }} />`)).toEqual(blocked)
    expect(found('a.tsx', `<div style={{ [dynamicKey]: 'luminance', maskMode: 'alpha', maskImage: 'linear-gradient(black, white)' }} />`)).toEqual([])
  })

  it('honours mask-mode importance and declaration order within the direct CSS rule', () => {
    const check = (declarations: string, image = 'mask-image') => found('a.module.css', `.x { ${image}: linear-gradient(black, white); ${declarations} }`)
    const blocked = ['named-color black', 'named-color white']
    expect(check('mask-mode: luminance !important; mask-mode: alpha;')).toEqual(blocked)
    expect(check('mask-mode: alpha !important; mask-mode: luminance;')).toEqual([])
    expect(check('mask-mode: alpha !important; mask-mode: luminance !important;')).toEqual(blocked)
    expect(check('mask-mode: luminance !important; mask-mode: alpha !important;')).toEqual([])
    expect(check('mask-mode: alpha; mask-mode: luminance;')).toEqual(blocked)
    expect(check('mask-mode: luminance; mask-mode: alpha;')).toEqual([])
    expect(check('mask-mode: ALPHA, alpha ! /*comment*/ important;', '-webkit-mask-image')).toEqual([])
    expect(check('mask-mode: var(--mode) !important; mask-mode: alpha;')).toEqual(blocked)
    expect(check('')).toEqual([])
  })

  it('does not borrow mask-mode from adjacent or nested CSS rules', () => {
    const blocked = ['named-color black', 'named-color white']
    expect(found('a.module.css', '.a { mask-image: linear-gradient(black, white); } .b { mask-mode: luminance; }')).toEqual([])
    expect(found('a.module.css', '.a { mask-mode: luminance; .b { mask-mode: alpha; } mask-image: linear-gradient(black, white); }')).toEqual(blocked)
    expect(found('a.module.css', '.a { mask-mode: alpha; .b { mask-mode: luminance; } mask-image: linear-gradient(black, white); }')).toEqual([])
    expect(found('a.module.css', '.a { mask-image: linear-gradient(black, white); mask-mode: alpha;')).toEqual(blocked)
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

describe('new Tailwind variant regressions', () => {
  it('keeps the complete **: and named group-data prefix', () => {
    expect(found('a.tsx', 'className="**:mt-[7px] group-data-[state=open]/item:gap-[7px]"')).toEqual([
      'arbitrary **:mt-[7px]', 'arbitrary group-data-[state=open]/item:gap-[7px]',
    ])
  })

  it('keeps the same new prefixes for opacity modifiers', () => {
    expect(found('a.tsx', 'className="**:bg-white/10 group-data-[state=open]/item:text-white/50"')).toEqual([
      'opacity **:bg-white/10', 'opacity group-data-[state=open]/item:text-white/50',
    ])
  })

  it('keeps arbitrary selectors with nested brackets in arbitrary-value matches', () => {
    expect(found('a.tsx', 'className="[&[data-active]]:mt-[7px] group-[&[data-active]]/item:gap-[7px]"')).toEqual([
      'arbitrary [&[data-active]]:mt-[7px]',
      'arbitrary group-[&[data-active]]/item:gap-[7px]',
    ])
  })

  it('keeps arbitrary selectors with nested brackets in opacity matches', () => {
    expect(found('a.tsx', 'className="hover:[&[data-active]]:bg-white/50"')).toEqual([
      'opacity hover:[&[data-active]]:bg-white/50',
    ])
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

  it('keeps the longer utility names winning for base colours', () => {
    for (const c of ['ring-offset-primary/8', 'inset-shadow-primary/8', 'drop-shadow-primary/8', 'border-s-primary/8', 'inset-ring-on-dark/85']) {
      expect(found('a.tsx', `className="${c}"`)).toEqual([])
    }
    expect(found('a.tsx', 'className="ring-offset-primary/10"')).toEqual(['opacity ring-offset-primary/10'])
    expect(hintOf('className="ring-offset-primary/10"')).toContain('0.12')
  })

  it('rounds alpha in the hint to at most 4 decimals', () => {
    expect(hintOf('className="text-on-dark/84.9"')).toContain('α 0.849 ')
    expect(hintOf('className="text-on-dark/84.9"')).not.toContain('0.8490000')
  })
})
