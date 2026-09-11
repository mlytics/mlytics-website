import type { Metadata } from 'next'
import { AiModePlayground } from '@/components/pages/ai-mode-playground/AiModePlayground'
import styles from './AiModePlaygroundPage.module.css'

const TITLE = 'Mlytics AI Mode · Mlytics'
const DESCRIPTION =
  'Try Mlytics AI Mode inside a real article — ask, quote, and listen — and see the media value and brand value each interaction creates.'

export const metadata: Metadata = {
  title: { absolute: TITLE },
  description: DESCRIPTION,
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: 'https://www.mlytics.com/ai-mode-playground/',
  },
  twitter: {
    title: TITLE,
    description: DESCRIPTION,
  },
  alternates: { canonical: '/ai-mode-playground/' },
}

export default function AiModePlaygroundPage() {
  return (
    <div className={`${styles.routeSurface} section-white`}>
      <section
        className={`${styles.hero} ai-mode-playground-hero section-dark pt-32 pb-12 text-center`}
        style={{ borderBottom: '1px solid rgba(168,197,195,0.12)' }}
      >
        <div className="max-w-3xl mx-auto px-6">
          <span
            className="inline-block text-xs font-semibold uppercase tracking-widest mb-4 px-3 py-1.5 rounded-full"
            style={{ background: 'rgba(34,93,89,0.4)', color: 'var(--color-on-dark)', border: '1px solid rgba(34,93,89,0.6)' }}
          >
            Mlytics AI Mode
          </span>
          <h1 className="text-4xl md:text-5xl font-bold text-white leading-tight mb-4 text-balance">
            One signal. Two values.
          </h1>
          <p className="text-base max-w-xl mx-auto" style={{ color: 'var(--color-on-dark)' }}>
            Explore how Mlytics AI Mode helps users ask, decide, and listen — while giving you a clear view of the value created.
          </p>
        </div>
      </section>
      <AiModePlayground />
    </div>
  )
}
