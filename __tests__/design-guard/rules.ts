// Scanning rules for the design guard. DESIGN.md is the source of truth:
// §2.1 colour tokens, §2.3 transparency (two bases, fixed alpha ladder),
// §2.7／§2.9 type, §2.10 spacing scale. These functions only look at one
// file's text; repo-wide bookkeeping lives in ledger.ts.
import postcss from 'postcss'
import ts from 'typescript'

export type Kind = 'hex' | 'color-fn' | 'named-color' | 'arbitrary' | 'opacity'

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

type LiteralContext = { output: string; offsets: Array<number | null>; combined: boolean }

const wrappedExpression = (node: ts.Node): ts.Expression | undefined => {
  if (ts.isParenthesizedExpression(node) || ts.isAsExpression(node) || ts.isSatisfiesExpression(node) || ts.isTypeAssertionExpression(node) || ts.isNonNullExpression(node)) return node.expression
  return undefined
}

const unwrapExpression = (node: ts.Expression): ts.Expression => {
  const expression = wrappedExpression(node)
  return expression ? unwrapExpression(expression) : node
}

function literalContexts(source: string): LiteralContext[] {
  const file = ts.createSourceFile('approved.tsx', source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX)
  const contexts: LiteralContext[] = []
  const combined = (node: ts.Node): boolean => {
    let current = node
    while (current.parent) {
      if (ts.isBinaryExpression(current.parent) && current.parent.operatorToken.kind === ts.SyntaxKind.PlusToken) return true
      current = current.parent
    }
    return false
  }
  const build = (node: ts.Expression, sourceFile = file): LiteralContext => {
    node = unwrapExpression(node)
    if (ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node)) {
      const start = node.getStart(sourceFile) + 1
      const end = node.getEnd() - 1
      const raw = source.slice(start, end)
      if (raw.includes('\\') || raw !== node.text) return { output: '\0', offsets: [null], combined: false }
      return { output: raw, offsets: raw.split('').map((_, index) => start + index), combined: false }
    }
    if (ts.isTemplateExpression(node)) {
      let output = ''
      const offsets: Array<number | null> = []
      const append = (start: number, end: number) => {
        const raw = source.slice(start, end)
        if (raw.includes('\\')) { output += '\0'; offsets.push(null); return }
        output += raw
        for (let i = start; i < end; i++) offsets.push(i)
      }
      append(node.head.getStart(sourceFile) + 1, node.head.getEnd() - 2)
      for (const span of node.templateSpans) {
        const part = build(span.expression, sourceFile)
        output += part.output
        offsets.push(...part.offsets)
        const tail = span.literal
        append(tail.getStart(sourceFile) + 1, tail.getEnd() - (ts.isTemplateTail(tail) ? 1 : 2))
      }
      return { output, offsets, combined: false }
    }
    return { output: '\0', offsets: [null], combined: false }
  }
  const visit = (node: ts.Node) => {
    if (ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node) || ts.isTemplateExpression(node)) {
      const context = build(node)
      contexts.push({ ...context, combined: combined(node) })
      return // The outer template owns every nested literal.
    }
    ts.forEachChild(node, visit)
  }
  visit(file)
  // Angle-bracket assertions are invalid in TSX, so collect only those wrappers
  // from a TS parse. Keeping this second pass assertion-only avoids interpreting
  // ordinary JSX through the TS grammar.
  const tsFile = ts.createSourceFile('approved.ts', source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS)
  const assertionOwners = new Set<string>()
  const visitAssertions = (node: ts.Node) => {
    if (ts.isTypeAssertionExpression(node)) {
      let owner: ts.Expression = node
      for (let parent = node.parent; parent; parent = parent.parent) {
        if (ts.isTemplateExpression(parent)) owner = parent
        if (ts.isSourceFile(parent)) break
      }
      const key = `${owner.pos}:${owner.end}`
      if (!assertionOwners.has(key)) {
        assertionOwners.add(key)
        const context = build(owner, tsFile)
        contexts.push({ ...context, combined: combined(owner) })
      }
      return
    }
    ts.forEachChild(node, visitAssertions)
  }
  visitAssertions(tsFile)
  return contexts
}

/** Blanks approved occurrences using one immutable AST snapshot of the original source. */
export function blankApprovedTexts(source: string, approvals: ReadonlyArray<{ text: string; wholeValue?: boolean }>): string {
  const contexts = literalContexts(source)
  const positions = new Set<number>()
  for (const { text, wholeValue } of approvals) {
    if (!text) continue
    for (const context of contexts) {
      if (context.combined) continue
      for (let at = context.output.indexOf(text); at >= 0; at = context.output.indexOf(text, at + 1)) {
        const end = at + text.length
        const complete = wholeValue
          ? at === 0 && end === context.output.length
          : (at === 0 || /\s/.test(context.output[at - 1])) && (end === context.output.length || /\s/.test(context.output[end]))
        if (!complete) continue
        const offsets = context.offsets.slice(at, end)
        if (offsets.some((offset) => offset === null)) continue
        for (const offset of offsets) positions.add(offset!)
      }
    }
  }
  const chars = source.split('')
  for (const offset of positions) if (chars[offset] !== '\n') chars[offset] = ' '
  return chars.join('')
}

/** Blanks a complete class token or property value, never a substring of a longer token. */
export function blankText(source: string, text: string, wholeValue = false): string {
  return blankApprovedTexts(source, [{ text, wholeValue }])
}

const lineOf = (source: string, index: number) => source.slice(0, index).split('\n').length

// Colour-length hex (3/4/6/8 digits) not preceded by a letter, digit or `&` (HTML entity;
// `_` is allowed so `shadow-[0_0_0_1px_#fff]` is seen)
// and not followed by a word char or hyphen (so `#section-2` and `#faq` are not colours).
const HEX = /(?<![&0-9A-Za-z])#(?:[0-9a-fA-F]{8}|[0-9a-fA-F]{6}|[0-9a-fA-F]{4}|[0-9a-fA-F]{3})(?![\w-])/g
const COLOR_FN_START = /(?<![A-Za-z0-9-])(?:rgba?|hsla?|oklch|oklab|lab|lch|hwb|color(?:-mix)?)\(/gi
const RGBA = /^rgba?\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*(?:,\s*(\d*\.?\d+)\s*)?\)$/i

function* colourFunctions(code: string): Generator<{ index: number; match: string }> {
  let coveredUntil = 0
  for (const start of code.matchAll(COLOR_FN_START)) {
    if (start.index! < coveredUntil) continue
    const open = start.index! + start[0].length - 1
    let depth = 1
    let end = open + 1
    for (; end < code.length && depth > 0; end++) {
      if (code[end] === '(') depth++
      if (code[end] === ')') depth--
    }
    if (depth === 0) {
      coveredUntil = end
      yield { index: start.index!, match: code.slice(start.index!, end) }
    }
  }
}

// CSS named colours only; special paint keywords such as transparent and currentColor
// are intentionally absent. The context scanner below avoids prose and Tailwind tokens.
const NAMED_COLORS = new Set(`aliceblue antiquewhite aqua aquamarine azure beige bisque black blanchedalmond blue blueviolet brown burlywood cadetblue chartreuse chocolate coral cornflowerblue cornsilk crimson cyan darkblue darkcyan darkgoldenrod darkgray darkgreen darkgrey darkkhaki darkmagenta darkolivegreen darkorange darkorchid darkred darksalmon darkseagreen darkslateblue darkslategray darkslategrey darkturquoise darkviolet deeppink deepskyblue dimgray dimgrey dodgerblue firebrick floralwhite forestgreen fuchsia gainsboro ghostwhite gold goldenrod gray green greenyellow grey honeydew hotpink indianred indigo ivory khaki lavender lavenderblush lawngreen lemonchiffon lightblue lightcoral lightcyan lightgoldenrodyellow lightgray lightgreen lightgrey lightpink lightsalmon lightseagreen lightskyblue lightslategray lightslategrey lightsteelblue lightyellow lime limegreen linen magenta maroon mediumaquamarine mediumblue mediumorchid mediumpurple mediumseagreen mediumslateblue mediumspringgreen mediumturquoise mediumvioletred midnightblue mintcream mistyrose moccasin navajowhite navy oldlace olive olivedrab orange orangered orchid palegoldenrod palegreen paleturquoise palevioletred papayawhip peachpuff peru pink plum powderblue purple rebeccapurple red rosybrown royalblue saddlebrown salmon sandybrown seagreen seashell sienna silver skyblue slateblue slategray slategrey snow springgreen steelblue tan teal thistle tomato turquoise violet wheat white whitesmoke yellow yellowgreen`.split(' '))

function namedInValue(value: string, base: number, push: (index: number, match: string) => void) {
  const withoutReferences = value.replace(/url\([^)]*\)/gi, blank)
  for (const word of withoutReferences.matchAll(/(?<![\w-])[a-z]+(?![\w-])/gi)) {
    if (NAMED_COLORS.has(word[0].toLowerCase())) push(base + word.index!, word[0])
  }
}

const CSS_NAMED_COLOUR_PROPERTY = /^(?:(?:-webkit-)?mask-image|background(?:-color|-image)?|border(?:-(?:top|right|bottom|left|inline(?:-start|-end)?|block(?:-start|-end)?))?(?:-color)?|outline(?:-color)?|text-decoration(?:-color)?|box-shadow|text-shadow|accent-color|caret-color|column-rule-color|flood-color|lighting-color|stop-color|text-emphasis-color|-webkit-text-fill-color|-webkit-text-stroke-color|scrollbar-color|fill|stroke|color|--[\w-]+)$/i
const STYLE_NAMED_COLOUR_PROPERTIES = new Set([
  'background', 'backgroundcolor', 'backgroundimage',
  'border', 'bordercolor', 'bordertop', 'bordertopcolor', 'borderright', 'borderrightcolor',
  'borderbottom', 'borderbottomcolor', 'borderleft', 'borderleftcolor', 'borderinline',
  'borderinlinecolor', 'borderinlinestart', 'borderinlinestartcolor', 'borderinlineend',
  'borderinlineendcolor', 'borderblock', 'borderblockcolor', 'borderblockstart',
  'borderblockstartcolor', 'borderblockend', 'borderblockendcolor',
  'outline', 'outlinecolor', 'textdecoration', 'textdecorationcolor', 'boxshadow', 'textshadow',
  'accentcolor', 'caretcolor', 'columnrulecolor', 'floodcolor', 'lightingcolor', 'stopcolor',
  'textemphasiscolor', 'webkittextfillcolor', 'webkittextstrokecolor', 'scrollbarcolor',
  'fill', 'stroke', 'color', 'filter', 'maskimage', 'webkitmaskimage',
])
const SVG_NAMED_COLOUR_ATTRIBUTES = new Set(['fill', 'stroke', 'color', 'stopcolor', 'floodcolor', 'lightingcolor'])

const propertyName = (name: ts.PropertyName): string | undefined => {
  if (ts.isIdentifier(name) || ts.isStringLiteral(name) || ts.isNumericLiteral(name)) return name.text
  if (ts.isComputedPropertyName(name) && (ts.isStringLiteral(name.expression) || ts.isNoSubstitutionTemplateLiteral(name.expression))) return name.expression.text
  return undefined
}

const jsxAttributeName = (name: ts.JsxAttributeName) => name.getText().replace(/-/g, '').toLowerCase()

function scanStaticStringLeaves(sourceFile: ts.SourceFile, source: string, node: ts.Node, push: (index: number, match: string) => void) {
  if (ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node)) {
    const start = node.getStart(sourceFile) + 1
    const value = source.slice(start, node.getEnd() - 1)
    namedInValue(value, start, push)
    return
  }
  if (ts.isTemplateExpression(node)) {
    const scanPart = (start: number, end: number) => {
      const value = source.slice(start, end)
      namedInValue(value, start, push)
    }
    scanPart(node.head.getStart(sourceFile) + 1, node.head.getEnd() - 2)
    for (const span of node.templateSpans) {
      scanStaticStringLeaves(sourceFile, source, span.expression, push)
      const tail = span.literal
      scanPart(tail.getStart(sourceFile) + 1, tail.getEnd() - (ts.isTemplateTail(tail) ? 1 : 2))
    }
    return
  }
  const expression = wrappedExpression(node)
  if (expression) {
    scanStaticStringLeaves(sourceFile, source, expression, push)
    return
  }
  if (ts.isConditionalExpression(node)) {
    scanStaticStringLeaves(sourceFile, source, node.whenTrue, push)
    scanStaticStringLeaves(sourceFile, source, node.whenFalse, push)
    return
  }
  if (ts.isBinaryExpression(node) && [
    ts.SyntaxKind.PlusToken,
    ts.SyntaxKind.AmpersandAmpersandToken,
    ts.SyntaxKind.BarBarToken,
    ts.SyntaxKind.QuestionQuestionToken,
  ].includes(node.operatorToken.kind)) {
    scanStaticStringLeaves(sourceFile, source, node.left, push)
    scanStaticStringLeaves(sourceFile, source, node.right, push)
  }
}

function staticStringExpression(node: ts.Expression): string | undefined {
  node = unwrapExpression(node)
  return ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node) ? node.text : undefined
}

type StyleEntry = ts.PropertyAssignment | null // null is an unresolved spread that may set maskMode
type StyleOutcome = StyleEntry[]

function styleOutcomes(expression: ts.Expression): StyleOutcome[] {
  expression = unwrapExpression(expression)
  if (ts.isConditionalExpression(expression)) return [...styleOutcomes(expression.whenTrue), ...styleOutcomes(expression.whenFalse)]
  if (ts.isBinaryExpression(expression)) {
    const leftIsObject = ts.isObjectLiteralExpression(unwrapExpression(expression.left))
    if (expression.operatorToken.kind === ts.SyntaxKind.AmpersandAmpersandToken) {
      return leftIsObject ? styleOutcomes(expression.right) : [[], ...styleOutcomes(expression.right)]
    }
    if (expression.operatorToken.kind === ts.SyntaxKind.BarBarToken || expression.operatorToken.kind === ts.SyntaxKind.QuestionQuestionToken) {
      if (leftIsObject) return styleOutcomes(expression.left)
      return [...styleOutcomes(expression.left), ...styleOutcomes(expression.right)]
    }
  }
  if (!ts.isObjectLiteralExpression(expression)) return [[null]]
  let outcomes: StyleOutcome[] = [[]]
  for (const property of expression.properties) {
    if (ts.isPropertyAssignment(property)) {
      outcomes = outcomes.map((entries) => [...entries, property])
      continue
    }
    if (ts.isSpreadAssignment(property)) {
      const spreadOutcomes = styleOutcomes(property.expression)
      outcomes = outcomes.flatMap((entries) => spreadOutcomes.map((spread) => [...entries, ...spread]))
      continue
    }
    // A shorthand or computed member may define maskMode; keep the mode uncertain.
    outcomes = outcomes.map((entries) => [...entries, null])
  }
  return outcomes
}

function alphaMaskOutcome(entries: StyleOutcome): boolean {
  let mode: string | null | undefined
  for (const entry of entries) {
    if (entry === null) { mode = null; continue }
    const name = propertyName(entry.name)?.replace(/-/g, '').toLowerCase()
    if (name === 'maskmode' || name === 'webkitmaskmode') mode = staticStringExpression(entry.initializer) ?? null
  }
  return mode === undefined || (mode !== null && alphaModeList(mode))
}

function namedColoursInTsx(code: string, push: (index: number, match: string) => void): boolean {
  const sourceFile = ts.createSourceFile('named-colours.tsx', code, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX)
  let foundStyleAttribute = false
  const visitStyles = (node: ts.Node) => {
    if (ts.isJsxAttribute(node) && jsxAttributeName(node.name) === 'style' && node.initializer && ts.isJsxExpression(node.initializer) && node.initializer.expression) {
      foundStyleAttribute = true
      const seen = new Map<string, { index: number; match: string }>()
      for (const outcome of styleOutcomes(node.initializer.expression)) {
        const alphaMask = alphaMaskOutcome(outcome)
        for (const property of outcome) {
          if (!property) continue
          const rawName = propertyName(property.name)
          const name = rawName?.replace(/-/g, '').toLowerCase()
          if (!name || !STYLE_NAMED_COLOUR_PROPERTIES.has(name)) continue
          if ((name === 'maskimage' || name === 'webkitmaskimage') && alphaMask) continue
          if (name === 'filter' && !/drop-shadow\s*\(/i.test(property.initializer.getText(sourceFile))) continue
          scanStaticStringLeaves(sourceFile, code, property.initializer, (index, match) => {
            const key = `${index}:${match}`
            seen.set(key, { index, match })
          })
        }
      }
      for (const { index, match } of [...seen.values()].sort((a, b) => a.index - b.index)) push(index, match)
      return
    }
    ts.forEachChild(node, visitStyles)
  }
  visitStyles(sourceFile)

  const visitAttributes = (node: ts.Node) => {
    if (ts.isJsxAttribute(node) && SVG_NAMED_COLOUR_ATTRIBUTES.has(jsxAttributeName(node.name)) && node.initializer) {
      if (ts.isStringLiteral(node.initializer)) scanStaticStringLeaves(sourceFile, code, node.initializer, push)
      else if (ts.isJsxExpression(node.initializer) && node.initializer.expression) scanStaticStringLeaves(sourceFile, code, node.initializer.expression, push)
      return
    }
    ts.forEachChild(node, visitAttributes)
  }
  visitAttributes(sourceFile)
  return foundStyleAttribute
}

function namedColours(file: string, code: string, push: (index: number, match: string) => void) {
  if (file.endsWith('.css')) {
    try {
      const root = postcss.parse(code)
      root.walkDecls((decl) => {
        const property = decl.prop.toLowerCase()
        const filter = property === 'filter'
        if (!CSS_NAMED_COLOUR_PROPERTY.test(property) && !filter) return
        if (filter && !/drop-shadow\s*\(/i.test(decl.value)) return
        if (/^(?:-webkit-)?mask-image$/.test(property)) {
          const siblings = decl.parent?.nodes?.filter((node): node is postcss.Declaration => node.type === 'decl' && node.prop.toLowerCase() === 'mask-mode') ?? []
          let winner: postcss.Declaration | undefined
          for (const mode of siblings) if (!winner || (mode.important && !winner.important) || mode.important === winner.important) winner = mode
          if (!winner || alphaModeList(winner.value)) return
        }
        const start = decl.source?.start?.offset
        if (start === undefined) return
        const valueStart = start + decl.prop.length + (decl.raws.between ?? ':').length
        namedInValue(decl.value, valueStart, push)
      })
      return
    } catch {
      // Invalid CSS cannot prove mask mode or provide PostCSS source offsets.
      const declarations = /(?:^|[;{}])\s*([-\w]+)\s*:\s*([^;{}]*)/gim
      for (const m of code.matchAll(declarations)) {
        const property = m[1]
        const value = m[2]
        if (!CSS_NAMED_COLOUR_PROPERTY.test(property) && !(property.toLowerCase() === 'filter' && /drop-shadow\s*\(/i.test(value))) continue
        namedInValue(value, m.index! + m[0].lastIndexOf(value), push)
      }
      return
    }
  }
  const foundStyleAttribute = namedColoursInTsx(code, push)
  if (!foundStyleAttribute && /\bstyle\s*=/.test(code)) {
    // Unit-sized source fragments and diagnostic callers sometimes pass only
    // `style={{ ... }}` rather than a complete JSX element. Parse the same
    // syntax in a harmless wrapper and translate every offset back to source.
    const prefix = 'const __guard = <div '
    namedColoursInTsx(`${prefix}${code} />`, (index, match) => push(index - prefix.length, match))
  }
}

const alphaModeList = (mode: string) => mode.split(',').every((part) => part.trim().toLowerCase() === 'alpha')

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
const BRACKET_ATOM = String.raw`[^\[\]\s'"\x60]`
const BRACKET_LEVEL_1 = String.raw`(?:${BRACKET_ATOM}|\[${BRACKET_ATOM}*\])+`
const BRACKET_LEVEL_2 = String.raw`(?:${BRACKET_ATOM}|\[${BRACKET_LEVEL_1}\])+`
const VARIANT = String.raw`(?:\*+|[\w-]+(?:-\[${BRACKET_LEVEL_2}\])?(?:/[\w-]+)?|\[${BRACKET_LEVEL_2}\]):`
const ARBITRARY = new RegExp(String.raw`(?<![\w\-[\]:/*])((?:${VARIANT})*)(-?)([a-z][a-z0-9]*(?:-[a-z0-9]+)*)-\[([^\]\s'"\x60]+)\]`, 'g')

const SPACING = /^(?:p|px|py|pt|pr|pb|pl|ps|pe|m|mx|my|mt|mr|mb|ml|ms|me|gap|gap-x|gap-y|space-x|space-y)$/
// ONE list of colour utilities, used by the arbitrary-colour check and the opacity check.
// Longer names come first so `inset-shadow`/`drop-shadow` are never read as `shadow`.
const COLOR_UTILITY_NAMES =
  '(?:drop-shadow|inset-shadow|inset-ring|ring-offset|placeholder|border-[trblxyse]|border|text|bg|fill|stroke|ring|outline|from|via|to|decoration|divide|caret|accent|shadow)'
const COLOR_UTILITY = new RegExp(`^${COLOR_UTILITY_NAMES}$`)
const COLOR_VALUE = /^(?:#|rgba?\(|hsla?\(|oklch\(|oklab\(|lab\(|lch\(|hwb\(|color(?:-mix)?\(|color:|var\(--color)/
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
  let containsNamed = false
  namedInValue(value.replace(/_/g, ' '), 0, () => { containsNamed = true })
  if (COLOR_UTILITY.test(utility) && (COLOR_VALUE.test(value) || containsNamed)) {
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
  String.raw`(?<![\w\-[\]:/*])((?:${VARIANT})*)(-?)(${COLOR_UTILITY_NAMES})-([a-z][a-z0-9]*(?:-[a-z0-9]+)*)/(\d+(?:\.\d+)?|\[[^\]\s'"\x60]+\])(?![\w/\-[])`,
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
  for (const m of colourFunctions(code)) {
    const hint = colorFnHint(m.match)
    if (hint) push(m.index, 'color-fn', m.match, hint)
  }
  namedColours(file, code, (index, match) => push(index, 'named-color', match, 'DESIGN.md §2.1：可見顏色請改用色彩 token 或白色 Tailwind class'))
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
