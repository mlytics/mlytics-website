import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

// DATAI-619 (DECISIONS #29-1, #30-1, #37-1, #62, #64): section rhythm and containers.
// General content blocks py-16 lg:py-28; footer width follows the page; /decisive-engine/ white;
// FAQ after a dark block uses the general top; card grids gap-5; /content-owners/ FAQ entry = line + FAQ;
// divider seams 48 (mobile/tablet) / 64 (desktop) on each side of the line.
// Location checks for the positions this ticket fixed; not a site-wide guard.
const root = resolve(__dirname, '../..')
const read = (f: string) => readFileSync(resolve(root, f), 'utf8')

const GENERAL: [string, string][] = [
  ['components/pages/brands/BrandPainSection.tsx', 'section-white py-16 lg:py-28'],
  ['components/ui/PlaygroundCTASection.tsx', 'section-white relative overflow-hidden py-16 lg:py-28'],
  ['components/pages/publishers/ZeroClickSection.tsx', 'section-white py-16 lg:py-28'],
  ['components/pages/publishers/SolutionPitches.tsx', 'section-white py-16 lg:py-28 border-t border-line'],
  ['components/pages/publishers/KnowledgeBaseSection.tsx', 'section-dark py-16 lg:py-28 relative'],
  ['components/pages/publishers/LayerOverview.tsx', 'section-dark py-16 lg:py-28 relative'],
  ['components/pages/developers/DeveloperSpecs.tsx', 'section-white py-16 lg:py-28'],
  ['components/pages/developers/AILayerSection.tsx', 'section-dark py-16 lg:py-28 relative'],
  ['components/pages/developers/InfraPartners.tsx', 'section-white py-16 lg:py-28 border-t border-line'],
  ['components/pages/partnership/PartnershipMembership.tsx', 'section-white py-16 lg:py-28'],
  ['components/pages/partnership/PartnershipEarnings.tsx', 'section-dark py-16 lg:py-28 relative'],
  ['components/pages/decisive-engine/DecisionLoop.tsx', 'section-white py-16 lg:py-28'],
  ['components/pages/decisive-engine/EngineAdvantages.tsx', 'section-white py-16 lg:py-28'],
  ['components/pages/decisive-engine/EngineComparison.tsx', 'section-white py-16 lg:py-28'],
  ['components/pages/decisive-engine/EngineUseCases.tsx', 'section-white py-16 lg:py-28'],
  ['components/pages/decisive-engine/DecisiveEnginePageCTA.tsx', 'section-dark py-16 lg:py-28'],
  ['components/home/IdentityCards.tsx', 'section-white py-16 lg:py-28'],
  ['components/home/FlywheelSection.tsx', 'section-dark py-16 lg:py-28'],
  ['components/home/IntentRefinerySection.tsx', 'section-white py-16 lg:py-28'],
  ['app/privacy-policy/page.tsx', 'section-white py-16 lg:py-28'],
  ['app/terms-of-service/page.tsx', 'section-white py-16 lg:py-28'],
  ['app/book-a-demo/page.tsx', 'section-white py-16 lg:py-28'],
]

describe('general content blocks py-16 lg:py-28 (DESIGN.md §2.11)', () => {
  it.each(GENERAL)('%s', (f, cls) => {
    const s = read(f)
    expect(s).toContain(cls)
    expect(s).not.toMatch(/<section className="section-(?:white|dark|light)[^"]*\b(?:py-16 lg:py-20|py-20 lg:py-28)\b/)
  })
})

describe('outer edges of linked blocks use the general distance', () => {
  it('/brands/', () => {
    expect(read('components/pages/brands/BrandGEOSection.tsx')).toContain('relative z-10 pt-16 lg:pt-28 pb-12 lg:pb-16" ref={mauRef}')
    expect(read('components/ui/PlaygroundCTASection.tsx')).toContain('pt-12 lg:pt-16 pb-16 lg:pb-28 text-center')
    expect(read('components/pages/brands/BrandAEOVsMonitoring.tsx')).toContain('section-white pt-16 lg:pt-28 pb-12 lg:pb-16')
  })
  it('/partnership/', () => {
    expect(read('components/pages/partnership/PartnershipHowItWorks.tsx')).toContain('section-white pt-16 lg:pt-28 pb-12 lg:pb-16')
    expect(read('components/pages/partnership/PartnershipResponsibilities.tsx')).toContain('section-white pt-12 lg:pt-16 pb-16 lg:pb-28')
  })
})

describe('/content-owners/ FAQ entry = line + FAQ (DESIGN.md §6.2, DECISIONS #62)', () => {
  it('Trusted by block ends at 48 / 64 before the line', () => {
    expect(read('components/pages/publishers/ContentOwnerVerticals.tsx')).toContain('section-white pt-16 lg:pt-28 pb-12 lg:pb-16')
  })
  it('a line sits between ContentOwnerVerticals and ContentOwnerFAQ', () => {
    expect(read('app/content-owners/page.tsx')).toMatch(
      /<ContentOwnerVerticals \/>\s*<div className="section-white">\s*<div className="max-w-5xl mx-auto px-6">\s*<div className="h-px bg-line" \/>\s*<\/div>\s*<\/div>\s*<ContentOwnerFAQ \/>/,
    )
  })
})

const SEAMS: [string, string, string[]][] = [
  ['components/pages/brands/BrandAEOVsMonitoring.tsx', 'section-white pt-16 lg:pt-28 pb-12 lg:pb-16', ['pb-8"']],
  ['components/pages/publishers/ContentOwnerVerticals.tsx', 'section-white pt-16 lg:pt-28 pb-12 lg:pb-16', ['pb-8"']],
  ['components/pages/brands/BrandFAQ.tsx', 'section-white pt-12 lg:pt-16 pb-16 lg:pb-20', ['pt-8 pb-16 lg:pb-20']],
  ['components/pages/publishers/ContentOwnerFAQ.tsx', 'section-white pt-12 lg:pt-16 pb-16 lg:pb-20', ['pt-8 pb-16 lg:pb-20']],
  ['components/pages/partnership/PartnershipHowItWorks.tsx', 'section-white pt-16 lg:pt-28 pb-12 lg:pb-16', ['pt-16 lg:pt-28 pb-10']],
  ['components/pages/partnership/PartnershipResponsibilities.tsx', 'section-white pt-12 lg:pt-16 pb-16 lg:pb-28', ['pt-10 pb-16']],
  ['components/pages/brands/BrandGEOSection.tsx', 'relative z-10 pt-16 lg:pt-28 pb-12 lg:pb-16" ref={mauRef}', ['lg:pt-28 pb-16"', 'lg:pt-20 pb-16']],
  ['components/pages/brands/BrandGEOSection.tsx', 'max-w-5xl mx-auto px-6 relative z-10 pt-12 lg:pt-16 pb-12 lg:pb-16', ['lg:pt-28 pb-16"', 'lg:pt-20 pb-16']],
  ['components/ui/PlaygroundCTASection.tsx', 'pt-12 lg:pt-16 pb-16 lg:pb-28 text-center', ['pt-16 lg:pt-20 pb-16 lg:pb-28']],
]

describe('divider seams 48／64 (DESIGN.md §2.11, DECISIONS #64)', () => {
  it.each(SEAMS)('%s: %s', (f, cls, old) => {
    const s = read(f)
    expect(s).toContain(cls)
    for (const o of old) expect(s).not.toContain(o)
  })
})

describe('/decisive-engine/ (DESIGN.md §6.3)', () => {
  it('no light-grey blocks', () => {
    for (const f of ['DecisionLoop', 'EngineComparison']) {
      expect(read(`components/pages/decisive-engine/${f}.tsx`)).not.toContain('section-light')
    }
  })
  it('FAQ after the dark block uses the general top', () => {
    expect(read('components/pages/decisive-engine/EngineFAQ.tsx')).toContain('section-white pt-16 lg:pt-28 pb-16 lg:pb-20')
  })
  it('no dividers between the four white blocks (DECISIONS #62-2)', () => {
    for (const f of ['EngineAdvantages', 'EngineComparison', 'EngineUseCases']) {
      expect(read(`components/pages/decisive-engine/${f}.tsx`)).not.toMatch(/<section className="section-white[^"]*border-t/)
    }
  })
})

describe('containers (DESIGN.md §2.12)', () => {
  it('/developers/ partners 1024', () => {
    const s = read('components/pages/developers/InfraPartners.tsx')
    expect(s).toContain('<div className="max-w-5xl mx-auto px-6">')
    expect(s).not.toContain('max-w-4xl')
  })
  it('footer follows the page width', () => {
    const s = read('components/layout/Footer.tsx')
    expect(s).toContain("className={`${p === '/' ? 'max-w-6xl' : 'max-w-5xl'} mx-auto px-6 py-12`}")
    expect(s).not.toContain('<div className="max-w-6xl mx-auto px-6 py-12">')
  })
})

describe('card grids gap-5 (DESIGN.md §4.8)', () => {
  it.each([
    ['components/home/IdentityCards.tsx', 'grid md:grid-cols-3 gap-5'],
    ['components/pages/brands/BrandPainSection.tsx', 'grid md:grid-cols-2 gap-5 mb-14'],
  ])('%s', (f, cls) => {
    expect(read(f)).toContain(cls)
    expect(read(f)).not.toMatch(/grid md:grid-cols-[23] gap-6/)
  })
})
