import { HeroSection } from '@/components/home/HeroSection'
import { IntentRefinerySection } from '@/components/home/IntentRefinerySection'
import { FlywheelSection } from '@/components/home/FlywheelSection'
import { IdentityCards } from '@/components/home/IdentityCards'
import { FinalCTA } from '@/components/home/FinalCTA'

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <IntentRefinerySection />
      <FlywheelSection />
      <IdentityCards />
      <FinalCTA />
    </>
  )
}
