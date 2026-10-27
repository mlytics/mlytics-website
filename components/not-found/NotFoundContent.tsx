import Link from 'next/link'

/**
 * Same-origin, like every other book-a-demo CTA in the app (Nav, Footer,
 * ContentOwnerVerticals). An absolute production URL would send staging and
 * local traffic to the live site.
 */
const BOOK_A_DEMO = '/book-a-demo'

/** Destination for the CDN variant's primary CTA (DATAI-553). */
const DECISIVE_ENGINE = '/decisive-engine'

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
        className="inline-block text-xs font-semibold uppercase tracking-widest mb-4 px-3 py-1.5 rounded-full bg-primary/40 text-on-dark border border-primary/60"
      >
        Multi-CDN
      </span>

      <h1 className="text-3xl md:text-4xl font-bold text-white mb-4 text-balance">
        Looking for Multi-CDN?
      </h1>

      {/* Kept short so it sits on a single line from md upward. */}
      <p className="text-base mb-8 text-on-dark">
        This page has moved, but our Multi-CDN service is still available.
      </p>

      <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
        {/* Primary now leads to the product page: visitors arriving from legacy
            Multi-CDN URLs want the capability, not the sales form. Contact Us
            stays one step away, and repeats at the bottom of that page.
            The extra context is visually hidden text appended after the visible
            label, not an aria-label: WCAG 2.5.3 (Label in Name) requires the
            accessible name to contain the visible label, and an aria-label
            replaces the accessible name outright rather than extending it — do
            not "simplify" this back to aria-label. The space before the hidden
            span is a real separating character (invisible to sighted users,
            since nothing renders after it): without it the accessible-name
            computation joins the two text nodes with no separator at all,
            producing "Explore MoreMulti-CDN" instead of the intended
            "Explore More Multi-CDN". */}
        <Link
          href={DECISIVE_ENGINE}
          className="inline-flex items-center justify-center px-6 py-3 rounded-full text-sm font-semibold text-white bg-primary transition-opacity hover:opacity-90"
        >
          Explore More <span className="sr-only">Multi-CDN</span>
        </Link>
        {/* Secondary is the design system's dark outline pill (DESIGN.md
            §3.5). .pill-btn already gives it 14/600 text, a 1px border and the
            same 44px height as the solid primary beside it, so it needs no
            overrides. */}
        <Link
          href={BOOK_A_DEMO}
          className="pill-btn pill-btn--dark"
        >
          Contact Us
        </Link>
      </div>
    </div>
  )
}

/** Generic variant — unchanged from the original 404. */
function DefaultNotFound() {
  return (
    <div className="nf-default max-w-lg mx-auto">
      <p className="text-7xl font-bold mb-4 text-primary">
        404
      </p>
      <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">Page not found</h1>
      <p className="text-base mb-8 text-on-dark">
        The page you&apos;re looking for doesn&apos;t exist or has been moved.
      </p>
      <Link
        href="/"
        className="inline-flex items-center justify-center px-6 py-3 rounded-full text-sm font-semibold text-white bg-primary transition-opacity hover:opacity-90"
      >
        Back to Home
      </Link>
    </div>
  )
}
