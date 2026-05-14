/**
 * Shared analytics utility for Mlytics website.
 * All GA4 event tracking goes through trackAG so there's one place to update.
 */

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void
  }
}

export function trackAG(name: string, params?: Record<string, unknown>) {
  try {
    if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
      window.gtag('event', name, params ?? {})
    }
  } catch { /* silent — tracking must never break the site */ }
}

export function getPage(): string {
  try {
    const p = window.location.pathname.replace(/\/$/, '')
    return !p ? 'home' : p.replace(/^\//, '').replace(/\//g, '_')
  } catch { return 'unknown' }
}

/** FR-01: CTA click. Call this alongside every openContact() or navigation CTA. */
export function trackCTA(label: string, position: string) {
  trackAG('click_cta', {
    cta_label: label,
    cta_position: position,
    page_audience: getPage(),
  })
}
