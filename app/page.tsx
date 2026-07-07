import type { Metadata } from 'next'
import { HeroSection } from '@/components/home/HeroSection'
import { IntentRefinerySection } from '@/components/home/IntentRefinerySection'
import { FlywheelSection } from '@/components/home/FlywheelSection'
import { IdentityCards } from '@/components/home/IdentityCards'
import { FinalCTA } from '@/components/home/FinalCTA'

export const metadata: Metadata = {
  title: { absolute: 'Mlytics | Discovery and Answer Engine for Business' },
  description: 'Mlytics Cortex captures and verifies purchase-intent signals the moment users express them, charges brands only after intent is confirmed, and helps content and media businesses turn reader engagement into sustainably monetizable assets.',
  openGraph: {
    title: 'Mlytics | Discovery and Answer Engine for Business',
    description: 'Mlytics Cortex captures and verifies purchase-intent signals the moment users express them, charges brands only after intent is confirmed, and helps content and media businesses turn reader engagement into sustainably monetizable assets.',
    url: 'https://www.mlytics.com/',
  },
  twitter: {
    title: 'Mlytics | Discovery and Answer Engine for Business',
    description: 'Mlytics Cortex captures and verifies purchase-intent signals the moment users express them, charges brands only after intent is confirmed, and helps content and media businesses turn reader engagement into sustainably monetizable assets.',
  },
  alternates: { canonical: '/' },
}

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <IdentityCards />
      <FlywheelSection />
      <IntentRefinerySection />
      <FinalCTA />
    </>
  )
}
