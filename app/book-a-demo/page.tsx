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
        className="section-dark pt-32 pb-12 text-center border-b border-on-dark/12"
      >
        <div className="max-w-2xl mx-auto px-6">
          <span
            className="label-eyebrow-pill mb-4 bg-primary/40 text-on-dark"
          >
            Contact Sales
          </span>
          <h1 className="text-4xl md:text-5xl font-bold text-white leading-tight mb-4">
            Let&apos;s use your data to talk.
          </h1>
          <p className="text-base max-w-xl mx-auto text-on-dark">
            We&apos;ll get back to you as soon as possible.
          </p>
        </div>
      </div>

      <section className="section-white py-16 lg:py-28">
        <div className="max-w-lg mx-auto px-6">
          <Suspense>
            <BookADemoForm />
          </Suspense>
        </div>
      </section>
    </>
  )
}
