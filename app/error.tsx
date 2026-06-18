'use client'

import { useEffect } from 'react'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="flex-1 section-dark flex items-center justify-center text-center px-6 pt-32 pb-16">
      <div className="max-w-lg mx-auto">
        <p className="text-7xl font-bold mb-4" style={{ color: '#225D59' }}>!</p>
        <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">Something went wrong</h1>
        <p className="text-base mb-8" style={{ color: '#A8C5C3' }}>
          An unexpected error occurred. Please try again.
        </p>
        <button
          onClick={reset}
          className="inline-block px-6 py-3 rounded-full text-sm font-semibold text-white transition-all hover:opacity-90"
          style={{ background: '#225D59' }}
        >
          Try again
        </button>
      </div>
    </div>
  )
}
