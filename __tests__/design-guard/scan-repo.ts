import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join, relative, resolve, sep } from 'node:path'
import type { ApprovedException } from './approved'
import { blank, blankApprovedTexts, findViolations, stripComments, type Violation } from './rules'

export const ROOT = resolve(__dirname, '../..')
const SCAN_DIRS = ['app', 'components']
// app/site-base.css is scanned too: only custom-property declarations in
// @theme and :root definitions are exempt, not declarations in ordinary rules.
const TOKEN_FILE = 'app/site-base.css'

export function blankSiteBaseTokens(source: string): string {
  const structure = stripComments(source)
  const ranges: Array<[number, number]> = []
  const stack: boolean[] = []
  let segment = 0
  const declaration = (end: number) => {
    if (stack.at(-1) && /^\s*--[\w-]+\s*:/.test(structure.slice(segment, end))) ranges.push([segment, end])
  }
  let quote = ''
  for (let i = 0; i < structure.length; i++) {
    const ch = structure[i]
    if (quote) {
      if (ch === '\\') i++
      else if (ch === quote) quote = ''
      continue
    }
    if (ch === '"' || ch === "'" || ch === '`') { quote = ch; continue }
    if (ch === '{') {
      const header = structure.slice(segment, i).trim()
      const tokenBlock = /^@theme(?:\s+static)?$/.test(header) || header === ':root'
      const nestedTokenAtRule = Boolean(stack.at(-1)) && /^@(?:media|supports|container)\b/.test(header)
      stack.push(tokenBlock || nestedTokenAtRule)
      segment = i + 1
    } else if (ch === ';') {
      declaration(i + 1)
      segment = i + 1
    } else if (ch === '}') {
      declaration(i)
      stack.pop()
      segment = i + 1
    }
  }
  let result = source
  for (const [start, end] of ranges.reverse()) result = result.slice(0, start) + blank(result.slice(start, end)) + result.slice(end)
  return result
}

const scanned = (rel: string) => /\.(tsx?|css)$/.test(rel) && !/\.(stories|test)\.tsx?$/.test(rel)

function walk(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const full = join(dir, name)
    return statSync(full).isDirectory() ? walk(full) : [full]
  })
}

/** Repo-relative POSIX paths of every scanned file, sorted. */
export const listFiles = () =>
  SCAN_DIRS.flatMap((d) => walk(resolve(ROOT, d)))
    .map((f) => relative(ROOT, f).split(sep).join('/'))
    .filter(scanned)
    .sort()

export const readSource = (rel: string) => readFileSync(resolve(ROOT, rel), 'utf8')

export function scanSource(file: string, original: string, approved: ApprovedException[]): Violation[] {
  let source = file === TOKEN_FILE ? blankSiteBaseTokens(original) : original
  source = blankApprovedTexts(source, approved.filter((a) => a.files.includes(file)).map((a) => ({ text: a.text, wholeValue: a.scope === 'value' })))
  return findViolations(file, source)
}

export function scanRepo(approved: ApprovedException[]): Violation[] {
  return listFiles().flatMap((file) => scanSource(file, readSource(file), approved))
}
