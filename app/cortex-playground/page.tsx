import type { Metadata } from 'next'
import { CortexPlayground } from '@/components/pages/cortex-playground/CortexPlayground'
import styles from './CortexPlaygroundPage.module.css'

export const metadata: Metadata = {
  title: { absolute: 'Cortex Playground · Mlytics' },
  description: 'Explore a local Cortex Playground showing how readers can ask, decide, and listen inside one article.',
  openGraph: {
    title: 'Cortex Playground · Mlytics',
    description: 'Explore a local Cortex Playground showing how readers can ask, decide, and listen inside one article.',
    url: 'https://www.mlytics.com/cortex-playground/',
  },
  twitter: {
    title: 'Cortex Playground · Mlytics',
    description: 'Explore a local Cortex Playground showing how readers can ask, decide, and listen inside one article.',
  },
  alternates: { canonical: '/cortex-playground/' },
}

export default function CortexPlaygroundPage() {
  return (
    <div className={`${styles.routeSurface} section-white`}>
      <section className={`${styles.hero} cortex-playground-hero section-white pt-32 pb-12`}>
        <div className={styles.heroBackdrop} aria-hidden="true">
          <div className={styles.heroGradient} />
        </div>
        <div className={`${styles.heroContent} mx-auto max-w-3xl px-6 text-center`}>
          <span className="label-eyebrow-pill bg-primary/10 text-primary">Cortex Playground</span>
          <h1 className="mt-6 text-4xl font-bold leading-tight tracking-tight text-balance text-ink md:text-5xl">One signal. Two values.</h1>
          <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-ink-muted">Explore how Cortex helps readers ask, decide, and listen — while giving publishers a clear view of the value created.</p>
        </div>
      </section>
      <CortexPlayground />
    </div>
  )
}
