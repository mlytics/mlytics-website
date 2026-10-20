import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join, relative, resolve, sep } from 'node:path'
import type { ApprovedException } from './approved'
import { blankText, findViolations, type Violation } from './rules'

export const ROOT = resolve(__dirname, '../..')
const SCAN_DIRS = ['app', 'components']
const SKIP = new Set(['app/site-base.css']) // token definitions live here

const scanned = (rel: string) => /\.(tsx?|css)$/.test(rel) && !/\.(stories|test)\.tsx?$/.test(rel) && !SKIP.has(rel)

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

export function scanRepo(approved: ApprovedException[]): Violation[] {
  return listFiles().flatMap((file) => {
    let source = readSource(file)
    for (const a of approved) if (a.files.includes(file)) source = blankText(source, a.text)
    return findViolations(file, source)
  })
}
