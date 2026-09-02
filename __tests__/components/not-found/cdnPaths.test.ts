/**
 * Regression tests for the legacy CDN URL matcher.
 *
 * The path samples below are real URLs that GA recorded hitting the 404 page
 * over 90 days (GA4 property 537719977, hostname www.mlytics.com) — they come
 * from the legacy pre-Cortex marketing site, whose CDN product tree was
 * removed. 508 distinct 404 URLs were observed; 227 of them match this
 * predicate.
 *
 * The samples are hard-coded rather than read from that export on purpose: the
 * export is a point-in-time snapshot, so asserting against it would make this
 * test drift with the data instead of pinning the behaviour.
 */
import { describe, it, expect } from 'vitest'
import { isCdnLegacyPath } from '@/components/not-found/cdnPaths'

/** Must show the CDN variant. */
const CDN_PATHS = [
  // English product pages
  '/features/multi-cdn/',
  '/features/pulse/',
  '/features/smart-load-balancing/',
  '/features/origin-shield/',
  '/features/china-access/',
  '/features/bot-management/',
  '/features/ssl/',
  '/features/dns/',
  '/features/ddos-protection/',
  '/features/web-application-firewall/',
  '/features/synthetic-monitoring/',
  '/features/api-protection/',
  '/features/real-user-monitoring/',
  '/features/access-control/',
  '/features/power-ups/',
  '/features/routing-policy/',
  '/features/',
  // solutions / platform / use-case / video-stream sections
  '/solutions/china-access/',
  '/solutions/ott-streaming/',
  '/solutions/cost-reduction/',
  '/solutions/maximize-website-availability/',
  '/platform/overview',
  '/platform/decisive-engine',
  '/use-case/gaming',
  '/use-case/video-on-demand/',
  '/video-stream/multi-cdn-management/',
  '/video-stream/low-latency-live-streaming/',
  '/products/multi-cdn/',
  '/multi-cdn',
  // every locale prefix the old site used
  '/zh/features/multi-cdn/',
  '/zh-tw/features/pulse/',
  '/zh-tw/solutions/multi-cdn/',
  '/tw/features/ssl/',
  '/tc/features/multi-cdn/',
  '/sc/features/enhanced-security/',
  '/zh/solutions/ott-streaming/',
  // suffix / casing tolerance
  '/features/bot-management/index.html',
  '/FEATURES/Multi-CDN/',
  '/features/pulse',
]

/** Must show the generic variant. */
const NON_CDN_PATHS = [
  '/',
  '/pricing/',
  '/about/',
  '/careers/',
  '/terms/',
  '/privacy',
  '/signup/',
  '/login',
  '/contact/',
  '/case-studies/',
  '/company/',
  '/zh/',
  '/zh-hans/',
  '/zh-tw/careers/',
  '/zh/about/',
  '/sc/about/',
  '/lp/get-a-demo/',
  '/blog/choosing-the-best-cdn-provider/',
  '/zh-hans/blog/什么是服务质量（qos）？/',
  '/aigc_experience.html',
  '/decisive_engine.html',
  '/some-random-page/',
  '/wp-admin',
  '/user/login',
]

describe('isCdnLegacyPath', () => {
  it.each(CDN_PATHS)('matches legacy CDN path: %s', (path) => {
    expect(isCdnLegacyPath(path)).toBe(true)
  })

  it.each(NON_CDN_PATHS)('does not match: %s', (path) => {
    expect(isCdnLegacyPath(path)).toBe(false)
  })

  it('handles empty and root input without throwing', () => {
    expect(isCdnLegacyPath('')).toBe(false)
    expect(isCdnLegacyPath('/')).toBe(false)
  })
})
