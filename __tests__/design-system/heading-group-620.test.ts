import { readFileSync, readdirSync, statSync } from 'node:fs'
import { join, resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

// DATAI-620 (DECISIONS #56, #58): heading group = eyebrow (inline, "tight") + .section-heading h2
// + description; h2 → description 16 (mb-4), description max 576 (max-w-xl), group → content 48 (mb-12).
// Location checks for the positions this ticket fixed; not a site-wide guard.
const root = resolve(__dirname, '../..')
const read = (f: string) => readFileSync(resolve(root, f), 'utf8')
const walk = (d: string): string[] =>
  readdirSync(resolve(root, d)).flatMap((n) => {
    const p = join(d, n)
    return statSync(resolve(root, p)).isDirectory() ? walk(p) : p.endsWith('.tsx') && !p.endsWith('.stories.tsx') ? [p] : []
  })
const SITE = [...walk('components'), ...walk('app')].filter((f) => !f.includes('ai-mode-playground'))

describe('eyebrow → h2 is tight (DESIGN.md §3.8)', () => {
  it.each(SITE)('%s: no <Eyebrow> with block or mb-*', (f) => {
    expect(read(f).match(/<Eyebrow[^>]*className="[^"]*(?:\bblock\b|\bmb-\d)/g) ?? []).toEqual([])
  })
  it('Flywheel eyebrow carries no margin', () => {
    expect(read('components/home/FlywheelSection.tsx')).toContain('className="label-eyebrow text-on-dark"')
  })
})

const FOOTER = [
  'components/home/FinalCTA.tsx',
  'components/pages/brands/BrandPageCTA.tsx',
  'components/pages/publishers/PublisherPageCTA.tsx',
  'components/pages/developers/DeveloperPageCTA.tsx',
  'components/pages/partnership/PartnershipCTA.tsx',
  'components/pages/decisive-engine/DecisiveEnginePageCTA.tsx',
]
describe('footer CTA heading group (DESIGN.md §5.4)', () => {
  it.each(FOOTER)('%s: h2 mb-4, description max-w-xl centred', (f) => {
    const s = read(f)
    expect(s).toContain('<h2 className="section-heading text-white mb-4">')
    expect(s).toContain('<p className="text-base max-w-xl mx-auto mb-8 text-on-dark">')
    expect(s).not.toContain('section-heading text-white mb-3')
  })
})

describe('description width 576 (DESIGN.md §2.12, §4.3)', () => {
  it.each([
    ['components/pages/brands/BrandAEOVsMonitoring.tsx', 'text-base max-w-xl mx-auto mt-4 text-ink-muted'],
    ['components/pages/publishers/KnowledgeBaseSection.tsx', '<p className="text-base max-w-xl mx-auto text-on-dark">'],
    ['components/pages/publishers/LayerOverview.tsx', '<p className="text-base max-w-xl mx-auto text-on-dark">'],
    ['components/pages/publishers/ZeroClickSection.tsx', '<p className="text-base max-w-xl mx-auto text-ink-muted">'],
    ['components/pages/publishers/ContentOwnerVerticals.tsx', '<p className="text-base leading-relaxed max-w-xl mx-auto text-ink-muted">'],
    ['components/home/IntentRefinerySection.tsx', '<p className="text-base leading-relaxed max-w-xl text-ink-muted">'],
    ['components/pages/decisive-engine/DecisionLoop.tsx', '<p className="text-base max-w-xl mx-auto text-ink-muted">'],
    ['components/pages/decisive-engine/EngineAdvantages.tsx', '<p className="text-base max-w-xl mx-auto text-ink-muted">'],
    ['components/pages/decisive-engine/EngineComparison.tsx', '<p className="text-base max-w-xl mx-auto text-ink-muted">'],
    ['components/home/FlywheelSection.tsx', 'className="text-base leading-relaxed max-w-xl mb-12 text-on-dark/85"'],
  ])('%s', (f, cls) => {
    expect(read(f)).toContain(cls)
    expect(read(f)).not.toMatch(/<p className="text-base max-w-3xl/)
  })
})

describe('group → content 48 (DESIGN.md §4.3)', () => {
  it.each([
    'components/pages/decisive-engine/DecisionLoop.tsx',
    'components/pages/decisive-engine/DecisiveEnginePageCTA.tsx',
    'components/pages/decisive-engine/EngineAdvantages.tsx',
    'components/pages/decisive-engine/EngineComparison.tsx',
    'components/pages/decisive-engine/EngineUseCases.tsx',
  ])('%s: mb-11 → mb-12', (f) => {
    expect(read(f)).toContain('className="text-center max-w-3xl mx-auto mb-12"')
    expect(read(f)).not.toContain('mb-11')
  })
  it.each([
    ['components/pages/developers/DeveloperSpecs.tsx', 'className="text-center mb-12"'],
    ['components/pages/publishers/KnowledgeBaseSection.tsx', '<div className="text-center mb-12">'],
    ['components/pages/publishers/ZeroClickSection.tsx', 'className="text-center mb-12"'],
    ['components/pages/publishers/LayerOverview.tsx', 'className="text-center mb-12"'],
    ['components/pages/partnership/PartnershipEarnings.tsx', 'className="text-center mb-12"'],
  ])('%s', (f, cls) => {
    expect(read(f)).toContain(cls)
    expect(read(f)).not.toMatch(/text-center mb-1[04]"/)
  })
})

describe('h2 → description 16 and Flywheel h2 (DESIGN.md §2.7, §4.3)', () => {
  it('ContentOwnerVerticals h2 mb-4', () => {
    expect(read('components/pages/publishers/ContentOwnerVerticals.tsx')).toContain('<h2 className="section-heading mb-4 text-ink">')
  })
  it('Flywheel h2 uses .section-heading', () => {
    const s = read('components/home/FlywheelSection.tsx')
    expect(s).toContain('className="section-heading mb-4 text-white"')
    expect(s).not.toContain('text-3xl md:text-4xl')
    expect(s).not.toContain('<br />') // DECISIONS #59: line breaks come from text-balance
  })
})

describe('muted eyebrow role (DESIGN.md §3.8, #56)', () => {
  it('SolutionPitches left column uses label-eyebrow text-ink-muted, not an Eyebrow colour prop', () => {
    const s = read('components/pages/publishers/SolutionPitches.tsx')
    expect(s).toContain('<span className="label-eyebrow text-ink-muted">')
    expect(s).not.toContain('color="var(--color-ink-muted)"')
  })
})
