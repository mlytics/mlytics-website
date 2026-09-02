/**
 * Legacy CDN-era URL matcher.
 *
 * The old mlytics.com marketing site (pre-Cortex) had a large tree of
 * CDN product pages that no longer exist. GA shows ~227 such URLs still
 * receiving traffic over 90 days, spanning 73 distinct pages.
 *
 * When a visitor lands on the 404 page from one of these paths, the CDN
 * variant is shown instead of the generic one.
 *
 * Locale prefixes used by the old site: /zh/, /zh-tw/, /zh-hans/, /zh-hant/,
 * /tw/, /tc/, /sc/, /en/ — so matching runs on path *segments*, not a prefix.
 */

/** Legacy section roots that only ever held CDN-platform content. */
export const LEGACY_SECTIONS = [
  'features',
  'solutions',
  'platform',
  'video-stream',
  'use-case',
]

/** Product/feature keywords from the old CDN catalogue. */
export const CDN_KEYWORDS = [
  'cdn',
  'pulse',
  'origin-shield',
  'china-access',
  'china-to-global',
  'ddos',
  'load-balancing',
  'bot-management',
  'access-control',
  'enhanced-security',
  'security-operations',
  'real-user-monitoring',
  'web-application-firewall',
  'power-ups',
  'dns',
  'ssl',
  'waf',
]

/**
 * Sections that must never trigger the CDN variant, even when a CDN keyword
 * appears in the slug. Editorial URLs such as
 * /blog/choosing-the-best-cdn-provider/ contain "cdn" but the visitor is a
 * reader, not a buyer — dropping them into a sales CTA misreads their intent.
 */
export const EXCLUDED_SECTIONS = ['blog', 'knowledge', 'category']

/**
 * Keywords are matched as whole tokens inside a path segment, delimited by
 * the separators slugs actually use. An unanchored substring test would fire
 * on unrelated English words — "impulse" contains "pulse", "hassle" contains
 * "ssl", "wafer" contains "waf", "dnstack" contains "dns" — and show the
 * sales CTA to visitors with no CDN intent at all.
 */
const BOUNDARY_BEFORE = '(?:^|[-_.])'
const BOUNDARY_AFTER = '(?:[-_.]|$)'

function keywordInSegment(segment: string, keyword: string): boolean {
  return new RegExp(BOUNDARY_BEFORE + keyword + BOUNDARY_AFTER).test(segment)
}

/**
 * Returns true when `pathname` looks like a legacy CDN-era product URL.
 * Case-insensitive; tolerant of trailing slashes and /index.html suffixes.
 *
 * Keep this in step with `buildVariantScript()` in ./variantScript — the
 * static 404 page has to make the same decision before React loads, and
 * cdnPaths.test.ts asserts the two agree on every sample path.
 */
export function isCdnLegacyPath(pathname: string): boolean {
  const segments = pathname.toLowerCase().split('/').filter(Boolean)

  if (segments.some((s) => EXCLUDED_SECTIONS.includes(s))) return false
  if (segments.some((s) => LEGACY_SECTIONS.includes(s))) return true

  return segments.some((s) => CDN_KEYWORDS.some((k) => keywordInSegment(s, k)))
}
