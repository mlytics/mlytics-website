import { HeroSection } from '@/components/home/HeroSection'
import { IntentRefinerySection } from '@/components/home/IntentRefinerySection'
import { FlywheelSection } from '@/components/home/FlywheelSection'
import { IdentityCards } from '@/components/home/IdentityCards'
import { CaseStudies } from '@/components/home/CaseStudies'
import { FinalCTA } from '@/components/home/FinalCTA'

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <IntentRefinerySection />
      <FlywheelSection />
      <IdentityCards />
      <CaseStudies />
      <FinalCTA />
    </>
  )
}
