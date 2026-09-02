/**
 * Regression tests for the legacy CDN URL matcher.
 *
 * The path samples below are real URLs that GA recorded hitting the 404 page
 * over 90 days (GA4 property 537719977, hostname www.mlytics.com) — they come
 * from the legacy pre-Cortex marketing site, whose CDN product tree was
 * removed. 508 distinct 404 URLs were observed; ~225 of them match this
 * predicate.
 *
 * The samples are hard-coded rather than read from that export on purpose: the
 * export is a point-in-time snapshot, so asserting against it would make this
 * test drift with the data instead of pinning the behaviour.
 */
import { describe, it, expect } from 'vitest'
import { isCdnLegacyPath } from '@/components/not-found/cdnPaths'
import { buildVariantScript } from '@/components/not-found/variantScript'

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
  '/features/cdn-ddos-protection/',
  '/features/',
  // solutions / platform / use-case / video-stream sections
  '/solutions/china-access/',
  '/solutions/ott-streaming/',
  '/solutions/cost-reduction/',
  '/solutions/maximize-website-availability/',
  '/solutions/multi-cdn-performance-orchestration/',
  '/platform/overview',
  '/platform/decisive-engine',
  '/use-case/gaming',
  '/use-case/video-on-demand/',
  '/video-stream/multi-cdn-management/',
  '/video-stream/low-latency-live-streaming/',
  '/products/multi-cdn/',
  '/multi-cdn',
  '/cdn',
  '/lp/mlytics-five-benefits-of-multi-cdn',
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
  '/knowledge/what-is-a-cdn/',
  '/blog/category/multi-cdn/',
  '/aigc_experience.html',
  '/decisive_engine.html',
  '/some-random-page/',
  '/wp-admin',
  '/user/login',
  // Keywords must not match inside unrelated words. An unanchored substring
  // test fired on all four of these.
  '/marketing/impulse-buying-trends/',
  '/support/hassle-free-onboarding/',
  '/products/wafer-thin-design/',
  '/news/dnstack/',
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

/**
 * The static 404 page has to reach the same verdict before any bundle loads,
 * so the inline script re-implements the algorithm over the same rule data.
 * This pins the two together — if one is edited without the other, this fails.
 */
describe('inline variant script agrees with isCdnLegacyPath', () => {
  const run = (pathname: string): 'cdn' | 'default' | undefined => {
    let stamped: string | undefined
    const fakeDocument = {
      documentElement: {
        setAttribute: (name: string, value: string) => {
          if (name === 'data-nf') stamped = value
        },
      },
    }
    // eslint-disable-next-line no-new-func
    new Function('location', 'document', buildVariantScript())(
      { pathname },
      fakeDocument,
    )
    return stamped as 'cdn' | 'default' | undefined
  }

  it.each([...CDN_PATHS, ...NON_CDN_PATHS, '/', ''])(
    'same verdict for: %s',
    (path) => {
      expect(run(path)).toBe(isCdnLegacyPath(path) ? 'cdn' : 'default')
    },
  )

  it('always stamps the attribute, so CSS has something to key on', () => {
    expect(run('/anything/at/all')).toBeDefined()
  })
})
