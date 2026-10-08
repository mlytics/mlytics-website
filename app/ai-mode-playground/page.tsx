import type { Metadata } from 'next'
import { AiModePlayground } from '@/components/pages/ai-mode-playground/AiModePlayground'
import { HERO, PAGE_META } from '@/components/pages/ai-mode-playground/ai-mode-playground-copy'
import styles from './AiModePlaygroundPage.module.css'

export const metadata: Metadata = {
  title: { absolute: PAGE_META.title },
  description: PAGE_META.description,
  openGraph: {
    title: PAGE_META.title,
    description: PAGE_META.description,
    url: 'https://www.mlytics.com/ai-mode-playground/',
  },
  twitter: {
    title: PAGE_META.title,
    description: PAGE_META.description,
  },
  alternates: { canonical: '/ai-mode-playground/' },
}

export default function AiModePlaygroundPage() {
  return (
    <div className={`${styles.routeSurface} section-white`}>
      <section className={`${styles.hero} ai-mode-playground-hero section-dark pt-32 pb-12 text-center`}>
        <div className={styles.heroInner}>
          <span
            className="inline-flex items-center text-xs font-bold uppercase tracking-[.12em] leading-none mb-4 px-2.5 py-1.5 rounded-full"
            style={{ background: 'rgba(34,93,89,0.4)', color: 'var(--color-on-dark)', border: '1px solid rgba(168,197,195,0.45)' }}
          >
            {HERO.eyebrow}
          </span>
          <h1 className={`${styles.heroTitle} text-4xl md:text-5xl font-bold text-white text-balance`}>
            {HERO.title}
          </h1>
          <p className={`${styles.heroCopy} text-base max-w-xl mx-auto`} style={{ color: 'var(--color-on-dark)' }}>
            {HERO.copy}
          </p>
        </div>
      </section>
      <AiModePlayground />
    </div>
  )
}
