import type { Metadata } from 'next'
import Link from 'next/link'
import { LegacyPlaygroundRedirect } from './LegacyPlaygroundRedirect'

const DESTINATION = '/ai-mode-playground/'

export const metadata: Metadata = {
  title: { absolute: 'Moved · Mlytics' },
  robots: { index: false, follow: true },
  alternates: { canonical: DESTINATION },
}

/** `next.config.ts` uses `output: 'export'`, so `redirects()` produces nothing
 *  — there is no server to serve them. A prerendered stub is the only static
 *  way to catch the UAT links that already point at the old route. */
export default function LegacyPlaygroundRedirectPage() {
  return (
    <div className="mx-auto max-w-xl px-6 py-32 text-center">
      {/* The Metadata API cannot emit `http-equiv` (Next docs, generate-metadata
          "Unsupported Metadata" — it says to render the tag in the page), so it
          is written here and hoisted into <head> by React. No-JS fallback only:
          it loses the query string, which is why the client redirect exists. */}
      {/* The delay is deliberately 3, not 0: a meta refresh only starts its
          timer after the document `load` event, which hydration beats, but 0
          still leaves a narrow race — and the meta tag drops `?lens=`. Three
          seconds lets it take over only when JS never runs (chunk 404, CSP, an
          extension), by which point the clickable link below is on screen.
          Do not put it back to 0. */}
      <meta httpEquiv="refresh" content={`3; url=${DESTINATION}`} />
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
