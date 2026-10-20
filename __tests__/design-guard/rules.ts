// Scanning rules for the design guard. DESIGN.md is the source of truth:
// §2.1 colour tokens, §2.3 transparency (two bases, fixed alpha ladder),
// §2.7／§2.9 type, §2.10 spacing scale. These functions only look at one
// file's text; repo-wide bookkeeping lives in ledger.ts.

export type Kind = 'hex' | 'color-fn' | 'arbitrary' | 'opacity'

export interface Violation {
  file: string
  line: number
  kind: Kind
  match: string
  hint: string
}

export const ALPHA_LADDER = [0.06, 0.08, 0.12, 0.25, 0.4, 0.55, 0.6, 0.7, 0.85]

const BASES: Record<string, 'primary' | 'on-dark'> = {
  '34,93,89': 'primary',
  '168,197,195': 'on-dark',
}

/** Every character except newlines becomes a space, so offsets and line numbers survive. */
export const blank = (s: string) => s.replace(/[^\n]/g, ' ')

/**
 * Blanks block comments (including JSX `{/* … *\/}`) and whole-line `//`
 * comments. A trailing `//` after code is kept: it may sit inside a URL string.
 */
export function stripComments(source: string): string {
  return source.replace(/\/\*[\s\S]*?\*\//g, blank).replace(/^[ \t]*\/\/.*$/gm, blank)
}

/** Blanks every exact occurrence of `text`. */
export const blankText = (source: string, text: string) => source.split(text).join(blank(text))

const lineOf = (source: string, index: number) => source.slice(0, index).split('\n').length

// Colour-length hex (3/4/6/8 digits) not preceded by a letter, digit or `&` (HTML entity;
// `_` is allowed so `shadow-[0_0_0_1px_#fff]` is seen)
// and not followed by a word char or hyphen (so `#section-2` and `#faq` are not colours).
const HEX = /(?<![&0-9A-Za-z])#(?:[0-9a-fA-F]{8}|[0-9a-fA-F]{6}|[0-9a-fA-F]{4}|[0-9a-fA-F]{3})(?![\w-])/g
const COLOR_FN = /(?<![A-Za-z0-9-])(?:rgba?|hsla?)\([^)]*\)/g
const RGBA = /^rgba?\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*(?:,\s*(\d*\.?\d+)\s*)?\)$/

export function parseRgba(match: string): { base: 'primary' | 'on-dark' | null; alpha: number | null } | null {
  const m = match.match(RGBA)
  if (!m) return null
  return { base: BASES[`${m[1]},${m[2]},${m[3]}`] ?? null, alpha: m[4] === undefined ? null : Number(m[4]) }
}

const nearestStep = (a: number) =>
  ALPHA_LADDER.reduce((best, step) => (Math.abs(step - a) < Math.abs(best - a) ? step : best))

function colorFnHint(match: string): string | null {
  const rgba = parseRgba(match)
  if (!rgba) return 'DESIGN.md §2.1／§2.3：改用色彩 token；透明色只准 primary rgba(34,93,89,α) 與 on-dark rgba(168,197,195,α)'
  if (!rgba.base) return 'DESIGN.md §2.3：透明色只准 primary 與 on-dark 兩個基色；不透明色改用 §2.1 色彩 token'
  if (rgba.alpha === null) return `DESIGN.md §2.1：這是 ${rgba.base} 的不透明色，改用色彩 token（例：text-${rgba.base}／bg-${rgba.base}）`
  if (!ALPHA_LADDER.includes(rgba.alpha)) return `DESIGN.md §2.3：α ${rgba.alpha} 不在階梯，就近改為 ${nearestStep(rgba.alpha)}`
  return null
}

// A class token with an arbitrary value: optional variant chain (variants may
// themselves be arbitrary, e.g. `max-[420px]:`, `[&>svg]:`, `*:`, `group-hover/item:`), optional leading minus,
// utility name, `-[value]`. The lookbehind stops matches starting mid-token.
const ARBITRARY = /(?<![\w\-[\]:/*])((?:(?:[\w/-]+(?:-\[[^\]\s]+\])?|\[[^\]\s]+\]|\*):)*)(-?)([a-z][a-z0-9]*(?:-[a-z0-9]+)*)-\[([^\]\s'"`]+)\]/g

const SPACING = /^(?:p|px|py|pt|pr|pb|pl|ps|pe|m|mx|my|mt|mr|mb|ml|ms|me|gap|gap-x|gap-y|space-x|space-y)$/
// ONE list of colour utilities, used by the arbitrary-colour check and the opacity check.
// Longer names come first so `inset-shadow`/`drop-shadow` are never read as `shadow`.
const COLOR_UTILITY_NAMES =
  '(?:drop-shadow|inset-shadow|inset-ring|ring-offset|placeholder|border-[trblxyse]|border|text|bg|fill|stroke|ring|outline|from|via|to|decoration|divide|caret|accent|shadow)'
const COLOR_UTILITY = new RegExp(`^${COLOR_UTILITY_NAMES}$`)
const COLOR_VALUE = /^(?:#|rgba?\(|hsla?\(|color:|var\(--color)/
const OUTLINE_PADDING = /^p[xy]?$/
const OUTLINE_CALC = /^calc\(\d*\.?\d+rem-1px\)$/
/** The DESIGN.md wording that sanctions OUTLINE_CALC; repo.test.ts checks it is still there. */
export const OUTLINE_CALC_DESIGN_REF = '外框按鈕可用扣掉 1px 框線的 `calc()` 內距'

const toPx = (value: string): number | null => {
  const px = value.match(/^(\d*\.?\d+)px$/)
  if (px) return Number(px[1])
  const rem = value.match(/^(\d*\.?\d+)rem$/)
  return rem ? Number(rem[1]) * 16 : null
}

function arbitraryHint(minus: string, utility: string, value: string): string | null {
  if (COLOR_UTILITY.test(utility) && COLOR_VALUE.test(value)) {
    return 'DESIGN.md §2.1／§2.3：顏色不可寫成方括號，改用色彩 token class（例：bg-primary、text-on-dark、bg-primary/8）'
  }
  if (SPACING.test(utility)) {
    // DESIGN.md §2.10 例外 3: outline buttons subtract the 1px border from their padding.
    if (OUTLINE_PADDING.test(utility) && OUTLINE_CALC.test(value)) return null
    const px = toPx(value)
    if (px !== null && px % 4 === 0) return `DESIGN.md §2.10：改用 4px 整數級 ${minus}${utility}-${px / 4}`
    if (px !== null) return `DESIGN.md §2.10：${px}px 不在 4px 刻度，往下取為 ${minus}${utility}-${Math.floor(px / 4)}`
    return 'DESIGN.md §2.10：間距只用 4px 整數級（Tailwind 1＝4px）'
  }
  if (utility === 'text') return 'DESIGN.md §2.7：依文字角色選字級（最小 12px，例：text-xs＝12、text-sm＝14）'
  if (utility === 'tracking') return 'DESIGN.md §2.9：字距只用表列寫法（.label-eyebrow 內建 0.1em；tracking-tight 只限首頁 Hero）'
  if (utility === 'leading') return 'DESIGN.md §2.9：行高用 leading-relaxed／leading-tight／leading-snug／leading-none'
  return null
}

// A colour utility with an opacity modifier: `<variants>?<utility>-<colour>/<alpha>`, alpha an
// integer percent (`/30`) or a bracket value (`/[0.3]`, `/[.3]`, `/[30%]`). Same prefix handling as ARBITRARY.
const OPACITY = new RegExp(
  String.raw`(?<![\w\-[\]:/*])((?:(?:[\w/-]+(?:-\[[^\]\s]+\])?|\[[^\]\s]+\]|\*):)*)(-?)(${COLOR_UTILITY_NAMES})-([a-z][a-z0-9]*(?:-[a-z0-9]+)*)/(\d+(?:\.\d+)?|\[[^\]\s'"\x60]+\])(?![\w/\-[])`,
  'g',
)
const TEXT_SIZE = /^(?:xs|sm|base|lg|[2-9]?xl)$/ // `text-sm/6` is font-size/line-height, not a colour
const OPACITY_BASES = ['primary', 'on-dark']

function opacityAlpha(raw: string): number | null {
  if (/^\d+(?:\.\d+)?$/.test(raw)) return Number(raw) / 100
  const pct = raw.match(/^\[(\d*\.?\d+)%\]$/)
  if (pct) return Number(pct[1]) / 100
  const num = raw.match(/^\[(\d*\.?\d+)\]$/)
  return num ? Number(num[1]) : null
}

function opacityHint(utility: string, colour: string, rawAlpha: string): string | null {
  if (utility === 'text' && TEXT_SIZE.test(colour)) return null
  const alpha = opacityAlpha(rawAlpha)
  if (alpha === null) return null
  if (!OPACITY_BASES.includes(colour)) return 'DESIGN.md §2.3：透明色只准 primary 與 on-dark 兩個基色（例：bg-primary/8、text-on-dark/85）'
  if (alpha >= 1) return `DESIGN.md §2.3：α 1 是不透明，直接用色彩 token class 不加透明度修飾（例：${utility}-${colour}）`
  if (alpha <= 0) return `DESIGN.md §2.3：α 0 是全透明，改用 ${utility}-transparent 或移除`
  if (!ALPHA_LADDER.includes(alpha)) {
    const near = nearestStep(alpha)
    return `DESIGN.md §2.3：α ${Number(alpha.toFixed(4))} 不在階梯，就近改為 ${near}（例：${utility}-${colour}/${Math.round(near * 100)}）`
  }
  return null
}

export function findViolations(file: string, source: string): Violation[] {
  const code = stripComments(source)
  const out: Violation[] = []
  const push = (index: number, kind: Kind, match: string, hint: string) =>
    out.push({ file, line: lineOf(code, index), kind, match, hint })

  for (const m of code.matchAll(HEX)) {
    push(m.index!, 'hex', m[0], 'DESIGN.md §2.1：不可寫死色碼，改用色彩 token（例：白色用 text-white／bg-white）')
  }
  for (const m of code.matchAll(COLOR_FN)) {
    const hint = colorFnHint(m[0])
    if (hint) push(m.index!, 'color-fn', m[0], hint)
  }
  if (!file.endsWith('.css')) {
    for (const m of code.matchAll(ARBITRARY)) {
      const hint = arbitraryHint(m[2], m[3], m[4])
      if (hint) push(m.index!, 'arbitrary', m[0], hint)
    }
    for (const m of code.matchAll(OPACITY)) {
      const hint = opacityHint(m[3], m[4], m[5])
      if (hint) push(m.index!, 'opacity', m[0], hint)
    }
  }
  return out
}
