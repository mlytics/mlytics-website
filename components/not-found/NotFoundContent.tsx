import Link from 'next/link'

/**
 * Same-origin, like every other book-a-demo CTA in the app (Nav, Footer,
 * ContentOwnerVerticals). An absolute production URL would send staging and
 * local traffic to the live site.
 */
const BOOK_A_DEMO = '/book-a-demo'

/**
 * Both variants are rendered into the single prerendered 404.html; the inline
 * script in app/not-found.tsx stamps `data-nf` on <html> before first paint and
 * the .nf-cdn / .nf-default rules in globals.css reveal the right one. See
 * ./variantScript for why the choice cannot be made at render time.
 */
export default function NotFoundContent() {
  return (
    <>
      <CdnNotFound />
      <DefaultNotFound />
    </>
  )
}

/** Variant shown for legacy CDN / Multi-CDN URLs. */
function CdnNotFound() {
  return (
    <div className="nf-cdn max-w-xl mx-auto">
      {/* Eyebrow styling matches the dark hero pages (developers, brands,
          content-owners, book-a-demo, privacy-policy, terms-of-service). */}
      <span
        className="inline-block text-xs font-semibold uppercase tracking-widest mb-4 px-3 py-1.5 rounded-full"
        style={{
          background: 'rgba(34,93,89,0.4)',
          color: 'var(--color-on-dark)',
          border: '1px solid rgba(34,93,89,0.6)',
        }}
      >
        Multi-CDN
      </span>

      <h1 className="text-3xl md:text-4xl font-bold text-white mb-4 text-balance">
        Looking for Multi-CDN?
      </h1>

      {/* Kept short so it sits on a single line from md upward. */}
      <p className="text-base mb-8" style={{ color: 'var(--color-on-dark)' }}>
        This page has moved, but our Multi-CDN service is still available.
      </p>

      <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
        <Link
          href={BOOK_A_DEMO}
          className="inline-block px-6 py-3 rounded-full text-sm font-semibold text-white transition-all hover:opacity-90"
          style={{ background: 'var(--color-primary)' }}
        >
          Contact Us
        </Link>
        {/* Secondary uses the design system's .pill-btn--dark. Two overrides,
            both inline because a class would lose to .pill-btn's later cascade
            position: (1) .pill-btn's padding is smaller than the primary's;
            (2) its 1.5px border would otherwise make this button 3px taller
            than the borderless primary, so the vertical padding absorbs it. */}
        <Link
          href="/"
          className="pill-btn pill-btn--dark justify-center"
          style={{
            padding: 'calc(0.75rem - 1.5px) calc(1.5rem - 1.5px)',
            fontWeight: 600,
          }}
        >
          Back to Home
        </Link>
      </div>
    </div>
  )
}

/** Generic variant — unchanged from the original 404. */
function DefaultNotFound() {
  return (
    <div className="nf-default max-w-lg mx-auto">
      <p className="text-7xl font-bold mb-4" style={{ color: 'var(--color-primary)' }}>
        404
      </p>
      <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">Page not found</h1>
      <p className="text-base mb-8" style={{ color: 'var(--color-on-dark)' }}>
        The page you&apos;re looking for doesn&apos;t exist or has been moved.
      </p>
      <Link
        href="/"
        className="inline-block px-6 py-3 rounded-full text-sm font-semibold text-white transition-all hover:opacity-90"
        style={{ background: 'var(--color-primary)' }}
      >
        Back to Home
      </Link>
    </div>
  )
}
