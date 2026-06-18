import type { Metadata } from 'next'
import { Suspense } from 'react'
import { BookADemoForm } from './BookADemoForm'

export const metadata: Metadata = {
  title: { absolute: 'Book a Demo — Mlytics' },
  description: 'Schedule a personalized demo and see how Mlytics Cortex can work with your actual data.',
  openGraph: {
    title: 'Book a Demo — Mlytics',
    description: 'Schedule a personalized demo and see how Mlytics Cortex can work with your actual data.',
    url: 'https://www.mlytics.com/book-a-demo/',
  },
  twitter: {
    title: 'Book a Demo — Mlytics',
    description: 'Schedule a personalized demo and see how Mlytics Cortex can work with your actual data.',
  },
  alternates: { canonical: '/book-a-demo/' },
}

export default function BookADemoPage() {
  return (
    <>
      <div
        className="section-dark pt-32 pb-12 text-center"
        style={{ borderBottom: '1px solid rgba(168,197,195,0.12)' }}
      >
        <div className="max-w-2xl mx-auto px-6">
          <span
            className="inline-block text-xs font-semibold uppercase tracking-widest mb-4 px-3 py-1.5 rounded-full"
            style={{ background: 'rgba(34,93,89,0.4)', color: '#A8C5C3', border: '1px solid rgba(34,93,89,0.6)' }}
          >
            Contact Sales
          </span>
          <h1 className="text-4xl md:text-5xl font-bold text-white leading-tight mb-4">
            Let&apos;s use your data to talk.
          </h1>
          <p className="text-base max-w-xl mx-auto" style={{ color: '#A8C5C3' }}>
            We&apos;ll get back to you as soon as possible.
          </p>
        </div>
      </div>

      <section className="section-white py-16 lg:py-20">
        <div className="max-w-lg mx-auto px-6">
          <Suspense>
            <BookADemoForm />
          </Suspense>
        </div>
      </section>
    </>
  )
}
