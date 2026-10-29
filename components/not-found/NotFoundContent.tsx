'use client'

import Link from 'next/link'
import { trackCTA } from '@/lib/analytics'

/**
 * The PROD release branch ships only the generic 404 (DATAI-681): the
 * CDN-specific variant (#41) and its variant script are switched off, so no
 * `data-nf` is stamped and the .nf-default block is always visible.
 */
export default function NotFoundContent() {
  return <DefaultNotFound />
}

/** Generic variant — unchanged from the original 404. */
function DefaultNotFound() {
  return (
    <div className="nf-default max-w-lg mx-auto">
      <p className="text-7xl font-bold mb-4 text-white">
        404
      </p>
      <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">Page not found</h1>
      <p className="text-base mb-8 text-on-dark">
        The page you&apos;re looking for doesn&apos;t exist or has been moved.
      </p>
      <Link
        href="/"
        onClick={() => trackCTA('Back to Home', 'not_found')}
        className="inline-flex items-center justify-center px-6 py-3 rounded-full text-sm font-semibold text-white bg-primary transition-opacity hover:opacity-90"
      >
        Back to Home
      </Link>
    </div>
  )
}
