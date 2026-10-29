import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

// DATAI-625 (DECISIONS #47): atom styles unified across the site.
const root = resolve(__dirname, '../..')
const read = (f: string) => readFileSync(resolve(root, f), 'utf8')
const HERO_FILES = [
  'app/brands/page.tsx', 'app/book-a-demo/page.tsx', 'app/content-owners/page.tsx',
  'app/privacy-policy/page.tsx', 'app/terms-of-service/page.tsx', 'app/developers/page.tsx',
  'components/pages/decisive-engine/DecisiveEngineHero.tsx',
  'components/pages/partnership/PartnershipHero.tsx',
]

describe('Hero pill (DESIGN.md §3.9)', () => {
  it.each(HERO_FILES)('%s uses the standard class string, no hand-written pill', (f) => {
    const src = read(f)
    expect(src).toContain('label-eyebrow-pill mb-4 bg-primary/40 text-on-dark"')
    expect(src).not.toMatch(/tracking-widest mb-4 px-3 py-1\.5 rounded-full/)
    expect(src).not.toMatch(/label-eyebrow-pill[^"]*border/)
  })
  it('the class carries the 1px primary .6 border and a 16px line height', () => {
    const css = read('app/site-base.css')
    const block = css.slice(css.indexOf('.label-eyebrow-pill {'), css.indexOf('}', css.indexOf('.label-eyebrow-pill {')))
    expect(block).toContain('line-height: 1rem;')
    expect(block).toContain('@apply border border-primary/60;')
  })
})

describe('form focus (DESIGN.md §3.7, §3.10)', () => {
  it('BookADemoForm no longer strips the focus outline; search icon is 12', () => {
    const src = read('app/book-a-demo/BookADemoForm.tsx')
    expect(src).not.toMatch(/outline-none/)
    expect(src).toContain('<Search size={12}')
  })
  it('InlineEmailCTA draws the ring on the pill container, coloured by tone', () => {
    const src = read('components/ui/InlineEmailCTA.tsx')
    expect(src).toContain('has-[input:focus-visible]:outline-2 has-[input:focus-visible]:outline-offset-2')
    expect(src).toMatch(/tone === 'dark' \? 'has-\[input:focus-visible\]:outline-on-dark' : 'has-\[input:focus-visible\]:outline-primary'/)
  })
})

describe('Eyebrow colour via props (DESIGN.md §3.8)', () => {
  it.each(['components/ui/PlaygroundCTASection.tsx', 'components/pages/brands/BrandGEOSection.tsx', 'components/pages/developers/AILayerSection.tsx'])(
    '%s does not override Eyebrow colour through className', (f) => {
      expect(read(f)).not.toMatch(/<Eyebrow[^>]*className=[^>]*text-on-dark/)
    })
})

describe('badges, card padding, info pills', () => {
  it('identity cards use the large 48 badge with 28 below', () => {
    expect(read('components/home/IdentityCards.tsx')).toContain('grid place-items-center w-12 h-12 rounded-2xl bg-primary text-white mb-7')
  })
  it.each(['components/pages/decisive-engine/EngineAdvantages.tsx', 'components/pages/partnership/PartnershipEarnings.tsx', 'components/pages/publishers/LayerOverview.tsx'])(
    '%s has no p-7', (f) => { expect(read(f)).not.toMatch(/\bp-7\b/) })
  it('info pills are px-3 py-1 with no border', () => {
    expect(read('components/pages/decisive-engine/DecisiveEngineHero.tsx')).toContain('px-3 py-1 rounded-full text-xs font-semibold bg-on-dark/8 text-on-dark')
    expect(read('components/pages/decisive-engine/DecisiveEngineHero.tsx')).not.toContain("border: '1px solid rgba(168,197,195,0.25)'")
    expect(read('components/pages/partnership/PartnershipMembership.tsx').match(/px-3 py-1 rounded-full text-xs font-semibold shrink-0/g)).toHaveLength(2)
    expect(read('components/pages/partnership/PartnershipMembership.tsx')).not.toContain('rgba(34,93,89,0.12)')
    expect(read('components/home/IntentPipeline.tsx')).toContain("px-3 py-1 rounded-full text-xs font-semibold bg-on-dark/8 ${isOpen ? 'text-white' : 'text-on-dark'}")
    expect(read('components/pages/decisive-engine/DecisionLoop.tsx')).toContain('px-3 py-1 rounded-full text-xs font-semibold bg-primary/8 text-primary')
  })
  it('pipeline node badge border is 1px', () => {
    expect(read('components/home/IntentPipeline.tsx')).not.toMatch(/2px solid \$\{layer\.borderColor\}/)
  })
  it('content-owners step tabs draw the focus ring inside (clipped by overflow-hidden)', () => {
    expect(read('components/pages/publishers/KnowledgeBaseSection.tsx')).toContain('focus-visible:-outline-offset-2')
  })
})
