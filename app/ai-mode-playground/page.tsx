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
      <section className={`${styles.hero} ai-mode-playground-hero section-white pt-32 pb-12`}>
        <div className={styles.heroBackdrop} aria-hidden="true">
          <div className={styles.heroGradient} />
        </div>
        <div className={`${styles.heroContent} mx-auto max-w-3xl px-6 text-center`}>
          <span className="label-eyebrow-pill bg-primary/10 text-primary">Mlytics AI Mode</span>
          <h1 className="mt-6 text-4xl font-bold leading-tight tracking-tight text-balance text-ink md:text-5xl">One signal. Two values.</h1>
          <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-ink-muted">Explore how Mlytics AI Mode helps users ask, decide, and listen — while giving you a clear view of the value created.</p>
        </div>
      </section>
      <AiModePlayground />
    </div>
  )
}
