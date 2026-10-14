import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

// Every page the site asks search engines to index (public/sitemap.xml) must
// also be discoverable by AI crawlers through public/llms.txt. Adding a page
// to the sitemap without a matching llms.txt link fails this test.

const SITE_ORIGIN = 'https://www.mlytics.com'
const sitemap = readFileSync(resolve(__dirname, '../../public/sitemap.xml'), 'utf8')
const llms = readFileSync(resolve(__dirname, '../../public/llms.txt'), 'utf8')

/** Site path with a trailing slash; null when the URL points off-site. */
function toSitePath(url: string): string | null {
  const parsed = new URL(url, SITE_ORIGIN)
  if (parsed.origin !== SITE_ORIGIN) return null
  return parsed.pathname.endsWith('/') ? parsed.pathname : `${parsed.pathname}/`
}

function sitemapPaths(xml: string): string[] {
  return [...xml.matchAll(/<loc>\s*([^<\s]+)\s*<\/loc>/g)].map((m) => toSitePath(m[1])!)
}

/** Targets of Markdown links `[label](url)` that point at this site. */
function llmsLinkPaths(text: string): Set<string> {
  const paths = [...text.matchAll(/\]\(([^)\s]+)\)/g)].map((m) => toSitePath(m[1]))
  return new Set(paths.filter((p): p is string => p !== null))
}

describe('public/llms.txt covers public/sitemap.xml', () => {
  it('reads a non-empty sitemap', () => {
    expect(sitemapPaths(sitemap).length).toBeGreaterThan(1)
  })

  it('links every sitemap page', () => {
    const linked = llmsLinkPaths(llms)
    // `/` is excluded on purpose: the homepage is the site itself, which
    // llms.txt already names in its H1 and summary. Linking the homepage from
    // a file that describes the homepage adds nothing for an AI crawler.
    const missing = sitemapPaths(sitemap).filter((path) => path !== '/' && !linked.has(path))
    expect(missing, `Sitemap pages missing from public/llms.txt: ${missing.join(', ')}`).toEqual([])
  })
})
