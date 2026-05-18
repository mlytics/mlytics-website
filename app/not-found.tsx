import Link from 'next/link'

export const metadata = { title: '404 — Page Not Found | Mlytics' }

export default function NotFound() {
  return (
    <div className="section-dark min-h-[70vh] flex items-center justify-center text-center px-6">
      <div className="max-w-lg mx-auto">
        <p className="text-7xl font-bold mb-4" style={{ color: '#225D59' }}>404</p>
        <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">Page not found</h1>
        <p className="text-base mb-8" style={{ color: '#A8C5C3' }}>
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <Link
          href="/"
          className="inline-block px-6 py-3 rounded-full text-sm font-semibold text-white transition-all hover:opacity-90"
          style={{ background: '#225D59' }}
        >
          Back to Home
        </Link>
      </div>
    </div>
  )
}
