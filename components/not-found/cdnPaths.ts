/**
 * Legacy CDN-era URL matcher.
 *
 * The old mlytics.com marketing site (pre-Cortex) had a large tree of
 * CDN product pages that no longer exist. GA shows 120 distinct such URLs
 * still receiving traffic over the last 90 days — see artifacts/404-urls-cdn.csv.
 *
 * When a visitor lands on the 404 page from one of these paths, we show the
 * CDN variant instead of the generic one.
 *
 * Locale prefixes used by the old site: /zh/, /zh-tw/, /zh-hans/, /zh-hant/,
 * /tw/, /tc/, /sc/, /en/ — so we match on path *segments*, not on a prefix.
 */

/** Legacy section roots that only ever held CDN-platform content. */
const LEGACY_SECTIONS = [
  'features',
  'solutions',
  'platform',
  'video-stream',
  'use-case',
]

/** Product/feature keywords from the old CDN catalogue. */
const CDN_KEYWORDS = [
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
const EXCLUDED_SECTIONS = ['blog', 'knowledge', 'category']

/**
 * Returns true when `pathname` looks like a legacy CDN-era product URL.
 * Case-insensitive; tolerant of trailing slashes and /index.html suffixes.
 */
export function isCdnLegacyPath(pathname: string): boolean {
  const path = pathname.toLowerCase()
  const segments = path.split('/').filter(Boolean)

  if (segments.some((s) => EXCLUDED_SECTIONS.includes(s))) return false

  if (segments.some((s) => LEGACY_SECTIONS.includes(s))) return true
  if (CDN_KEYWORDS.some((k) => path.includes(k))) return true

  return false
}
