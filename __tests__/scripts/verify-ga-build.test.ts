import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { execFileSync } from 'child_process'
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, rmSync } from 'fs'
import { tmpdir } from 'os'
import path from 'path'
import { GA_PROD_ID, GA_UAT_ID } from '@/lib/ga'

const SCRIPT = path.resolve(__dirname, '../../scripts/verify-ga-build.sh')
const page = (body: string) =>
  `<html><head><script src="/_next/static/chunks/a.js"></script></head><body>${body}</body></html>`
const loader = `<script id="ga-loader">(function(){var ids={"www.mlytics.com":"${GA_PROD_ID}","mlytics.co":"${GA_UAT_ID}"};})();</script>`

let out: string
beforeEach(() => { out = mkdtempSync(path.join(tmpdir(), 'ga-out-')) })
afterEach(() => rmSync(out, { recursive: true, force: true }))

function verify(env: string) {
  return verifyAt(env, out)
}

function verifyAt(env: string, dir: string) {
  try {
    const stdout = execFileSync('bash', [SCRIPT, env, dir], { encoding: 'utf8', stdio: 'pipe' })
    return { code: 0, text: stdout }
  } catch (e) {
    const err = e as { status: number; stdout: string; stderr: string }
    return { code: err.status, text: `${err.stdout}${err.stderr}` }
  }
}

describe('verify-ga-build.sh (DATAI-681)', () => {
  it('passes a build where every Next page has the loader', () => {
    writeFileSync(path.join(out, 'index.html'), page(loader))
    mkdirSync(path.join(out, 'brands'))
    writeFileSync(path.join(out, 'brands', 'index.html'), page(loader))
    // public/ files that are not Next pages are ignored
    writeFileSync(path.join(out, 'saved.html'), '<html>no next assets</html>')
    expect(verify('prod').code).toBe(0)
    expect(verify('uat').code).toBe(0)
  })

  it('fails when out/ is missing', () => {
    rmSync(out, { recursive: true, force: true })
    const r = verify('prod')
    expect(r.code).toBe(1)
    expect(r.text).toMatch(/npm run build/)
  })

  it('fails on an old build that still has id=undefined', () => {
    writeFileSync(path.join(out, 'index.html'),
      page('<link rel="preload" href="https://www.googletagmanager.com/gtag/js?id=undefined" as="script"/>'))
    const r = verify('prod')
    expect(r.code).toBe(1)
    expect(r.text).toMatch(/id=undefined/)
  })

  it('fails when a Next page has no loader', () => {
    writeFileSync(path.join(out, 'index.html'), page(loader))
    mkdirSync(path.join(out, 'brands'))
    writeFileSync(path.join(out, 'brands', 'index.html'), page(''))
    const r = verify('prod')
    expect(r.code).toBe(1)
    expect(r.text).toMatch(/brands\/index\.html/)
  })

  it('fails when either id is missing from the homepage', () => {
    // Both ids ship in the same build, so either environment needs both.
    const cases = [
      { ids: `{"mlytics.co":"${GA_UAT_ID}"}`, missing: GA_PROD_ID },
      { ids: `{"www.mlytics.com":"${GA_PROD_ID}"}`, missing: GA_UAT_ID },
    ]
    for (const { ids, missing } of cases) {
      writeFileSync(path.join(out, 'index.html'), page(`<script id="ga-loader">var ids=${ids}</script>`))
      for (const env of ['prod', 'uat']) {
        const r = verify(env)
        expect(r.code).toBe(1)
        expect(r.text).toContain(missing)
      }
    }
  })

  it('rejects an unknown environment even when the build is valid', () => {
    writeFileSync(path.join(out, 'index.html'), page(loader))
    const r = verify('staging')
    expect(r.code).toBe(1)
    expect(r.text).toContain('uat 或 prod')
  })

  it('lists missing pages relative to out/ when the path has a trailing slash', () => {
    writeFileSync(path.join(out, 'index.html'), page(loader))
    mkdirSync(path.join(out, 'brands'))
    writeFileSync(path.join(out, 'brands', 'index.html'), page(''))
    const r = verifyAt('prod', `${out}/`)
    expect(r.code).toBe(1)
    expect(r.text).toMatch(/^brands\/index\.html$/m)
    expect(r.text).not.toContain(out)
  })

  it('uses the same ids as lib/ga.ts', () => {
    const src = readFileSync(SCRIPT, 'utf8')
    expect(src).toContain(`PROD_GA_ID="${GA_PROD_ID}"`)
    expect(src).toContain(`UAT_GA_ID="${GA_UAT_ID}"`)
  })
})
