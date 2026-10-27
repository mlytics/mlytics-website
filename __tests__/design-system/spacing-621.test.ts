import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

// DATAI-621 (DECISIONS #48 for DATAI-621): non-button half steps rounded down to the 4px scale.
// Location checks only; this is not a site-wide guard (DATAI-621 ruling 2 in DECISIONS #48, and #39).
const root = resolve(__dirname, '../..')
const read = (f: string) => readFileSync(resolve(root, f), 'utf8')
// Drop {/* … */} and /* … */ comments: the commented-out IdentityCards metrics stay as they are (DATAI-621 ruling 1).
const live = (f: string) => read(f).replace(/\{\/\*[\s\S]*?\*\/\}/g, '').replace(/\/\*[\s\S]*?\*\//g, '')
const HALF = /(?<![\w-])-?(?:p[xytblr]?|m[xytblr]?|gap(?:-[xy])?|space-[xy])-\d+\.5(?![\d])/g

describe('Hero pill padding (DESIGN.md §2.18, §3.9)', () => {
  it('.label-eyebrow-pill is 4px top/bottom, 12px left/right', () => {
    const css = read('app/site-base.css')
    const start = css.indexOf('.label-eyebrow-pill {')
    const block = css.slice(start, css.indexOf('}', start))
    expect(block).toContain('padding: 0.25rem 0.75rem;')
    expect(block).not.toContain('0.375rem')
  })
})

describe('half steps rounded down (DESIGN.md §2.10)', () => {
  it.each([
    'components/layout/Footer.tsx',
    'components/home/LogoMarquee.tsx',
    'components/home/IdentityCards.tsx',
    'components/home/IntentPipeline.tsx',
    'components/pages/publishers/KnowledgeBaseSection.tsx',
    'app/book-a-demo/BookADemoForm.tsx',
  ])('%s has no half-step spacing outside comments', (f) => {
    expect(live(f).match(HALF) ?? []).toEqual([])
  })
  it('exact replacements', () => {
    expect(read('components/layout/Footer.tsx')).toContain('inline-flex items-center p-1 -ml-1 rounded-lg')
    expect(read('components/home/LogoMarquee.tsx')).toContain('md:px-5 mb-1 md:mb-0')
    expect(read('components/home/IdentityCards.tsx')).toContain('<p className="text-sm text-ink-subtle">{card.products}</p>')
    expect(read('components/home/IntentPipeline.tsx')).toContain('pl-14 pr-4 py-3 rounded-xl')
    expect(read('components/home/IntentPipeline.tsx')).toContain('<span className="block text-sm text-on-dark">{layer.sublabel}</span>')
    const kb = read('components/pages/publishers/KnowledgeBaseSection.tsx')
    expect(kb).toContain('className="block mt-2 rounded-full overflow-hidden"')
    expect(kb.match(/gap-1(?![\d.])/g)).toHaveLength(4)
    const form = read('app/book-a-demo/BookADemoForm.tsx')
    expect(form).toContain('<ChevronDown size={12} className="text-ink-muted" />')
    expect(form).toContain('w-full flex items-center gap-2 px-3 py-2 text-sm')
  })
  it('keeps the approved exceptions (§2.10 例外 1–3)', () => {
    expect(read('components/ui/InlineEmailCTA.tsx')).toContain('py-2.5')
    expect(read('components/pages/partnership/PartnershipMembership.tsx')).toContain('mt-0.5 shrink-0 w-4 h-4')
    expect(read('components/pages/partnership/PartnershipResponsibilities.tsx').match(/mt-0\.5 shrink-0 w-4 h-4/g)).toHaveLength(2)
    expect(read('components/layout/Nav.tsx')).toContain('-mr-[11px] p-[11px]')
  })
})
