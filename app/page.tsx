import type { Metadata } from 'next'
import { HeroSection } from '@/components/home/HeroSection'
import { IntentRefinerySection } from '@/components/home/IntentRefinerySection'
import { FlywheelSection } from '@/components/home/FlywheelSection'
import { IdentityCards } from '@/components/home/IdentityCards'
import { FinalCTA } from '@/components/home/FinalCTA'

export const metadata: Metadata = {
  title: 'AI Answer Monetization for Brands & Publishers',
  description: 'Mlytics Cortex puts brands inside the AI answers buyers trust and monetizes publisher AI traffic through a five-layer Intent Refinery.',
  openGraph: {
    title: 'AI Answer Monetization for Brands & Publishers | Mlytics Cortex',
    description: 'Mlytics Cortex puts brands inside the AI answers buyers trust and monetizes publisher AI traffic through a five-layer Intent Refinery.',
    url: 'https://www.mlytics.com/',
  },
  twitter: {
    title: 'AI Answer Monetization for Brands & Publishers | Mlytics Cortex',
    description: 'Mlytics Cortex puts brands inside the AI answers buyers trust and monetizes publisher AI traffic through a five-layer Intent Refinery.',
  },
  alternates: { canonical: '/' },
}

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <IdentityCards />
      <IntentRefinerySection />
      <FlywheelSection />
      <FinalCTA />
    </>
  )
}
