import type { Metadata } from 'next'
import Link from 'next/link'
import { LegacyPlaygroundRedirect } from './LegacyPlaygroundRedirect'

const DESTINATION = '/ai-mode-playground/'

/** No `robots: { index: false }` on purpose. `noindex` and `canonical` pull in
 *  opposite directions — a noindexed page's canonical tends to be dropped — and
 *  the honest signal for a moved page is the canonical. There is no
 *  duplicate-content risk: this stub is one sentence. */
export const metadata: Metadata = {
  title: { absolute: 'Moved · Mlytics' },
  alternates: { canonical: DESTINATION },
}

/** `next.config.ts` uses `output: 'export'`, so `redirects()` produces nothing
 *  — there is no server to serve them. A prerendered stub is the only static
 *  way to catch the UAT links that already point at the old route. */
export default function LegacyPlaygroundRedirectPage() {
  return (
    <div className="mx-auto max-w-xl px-6 py-32 text-center">
      {/* Do NOT add a `<meta http-equiv="refresh">` here, at any delay. A
          non-zero delay is WCAG F40 — a documented failure of SC 2.2.1 Timing
          Adjustable — and a zero delay races hydration. It bought nothing
          either way: the tag drops `?lens=`, so the no-JS visitor it was meant
          to serve landed on the wrong lens anyway. When JS does not run, WCAG's
          own advice is to offer a link instead of a timed jump, which is what
          the paragraph below is. */}
      <LegacyPlaygroundRedirect destination={DESTINATION} />
      <p className="text-base text-ink-muted">
        This page has moved to{' '}
        <Link href={DESTINATION} className="font-semibold text-primary underline">
          Mlytics AI Mode
        </Link>
        .
      </p>
    </div>
  )
}
