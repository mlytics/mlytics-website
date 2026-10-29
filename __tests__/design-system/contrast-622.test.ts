import { readFileSync, existsSync, readdirSync } from 'node:fs'
import { resolve, join } from 'node:path'
import { describe, expect, it } from 'vitest'

// DATAI-622 (DECISIONS #50, #52): text contrast to WCAG AA. Location checks only, not a site-wide guard.
const root = resolve(__dirname, '../..')
const read = (f: string) => readFileSync(resolve(root, f), 'utf8')
const live = (f: string) => read(f).replace(/\{\/\*[\s\S]*?\*\/\}/g, '').replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '')
const tsxUnder = (dir: string): string[] =>
  (readdirSync(resolve(root, dir), { recursive: true }) as string[])
    .filter((f) => f.endsWith('.tsx') && !f.includes('ai-mode-playground') && !f.endsWith('.stories.tsx'))
    .map((f) => join(dir, f))

describe('ink-subtle is never text (DESIGN.md §2.1, §8.1)', () => {
  it.each([...tsxUnder('app'), ...tsxUnder('components')])('%s', (f) => {
    expect(live(f)).not.toMatch(/(?:text|placeholder:text)-ink-subtle|--color-ink-subtle/)
  })
})

describe('placeholders use ink-muted (DESIGN.md §3.10)', () => {
  it('email field and /book-a-demo/ inputs', () => {
    expect(read('components/ui/InlineEmailCTA.tsx')).toContain('placeholder:text-ink-muted')
    expect(read('app/book-a-demo/BookADemoForm.tsx')).toContain("focus:border-primary transition-colors placeholder:text-ink-muted'")
  })
})

describe('dark-background mint text is >= .85 (DESIGN.md §2.3)', () => {
  it.each([
    ['components/home/FlywheelSection.tsx', /text-on-dark\/(?:55|65)/],
    ['components/home/FlywheelDiagram.tsx', /fill="rgba\(168,197,195,0\.75\)"/],
    ['components/pages/brands/BrandGEOSection.tsx', /text-on-dark\/(?:60|70)|rgba\(168,197,195,0\.(?:35|45)\)/],
    ['components/pages/developers/AILayerSection.tsx', /text-on-dark\/50/],
    ['components/pages/publishers/LayerOverview.tsx', /text-on-dark\/60|rgba\(168,197,195,0\.5\)/],
    ['components/pages/partnership/PartnershipEarnings.tsx', /text-on-dark\/60/],
    ['components/pages/publishers/KnowledgeBaseSection.tsx', /color: (?:isActive \? )?'rgba\(168,197,195,0\.(?:4|45|7)\)'/],
    ['components/pages/publishers/SolutionPitches.tsx', /text-on-dark\/60/],
  ])('%s has no sub-.85 mint text', (f, old) => {
    expect(read(f)).not.toMatch(old)
  })
  it('the touched text uses the agreed classes', () => {
    expect(read('components/home/FlywheelSection.tsx')).toContain('className="label-eyebrow text-on-dark"')
    expect(read('components/home/FlywheelSection.tsx').match(/text-on-dark\/85/g)).toHaveLength(2)
    expect(read('components/pages/brands/BrandGEOSection.tsx')).toContain('<span className="text-xs font-bold tabular-nums mb-2 text-on-dark/85">{step.num}</span>')
    expect(read('components/pages/developers/AILayerSection.tsx')).toContain('label-eyebrow mb-6 text-on-dark"')
    expect(read('components/pages/publishers/LayerOverview.tsx')).toContain('className="text-center text-xs mt-10 text-on-dark/85"')
    expect(read('components/pages/brands/BrandGEOSection.tsx')).toContain('text-left flex-1 text-on-dark">{item.desc}</span>')
    expect(read('components/pages/publishers/KnowledgeBaseSection.tsx')).toContain("<span className=\"text-xs text-on-dark/85\">Enterprise infrastructure powered by</span>")
  })
})

describe('selected states and primary backgrounds use white (DESIGN.md §2.3, DECISIONS #50)', () => {
  it('step list: selected number and label white, others on-dark (DECISIONS #52)', () => {
    const kb = read('components/pages/publishers/KnowledgeBaseSection.tsx')
    expect(kb).toContain("tabular-nums mb-1 ${isActive ? 'text-white' : 'text-on-dark'}`}")
    expect(kb).toContain("leading-snug ${isActive ? 'text-white' : 'text-on-dark'}`}")
  })
  it('dark card numbers turn white on hover (DESIGN.md §2.14, DECISIONS #52)', () => {
    const num = "label-eyebrow mb-3 transition-colors ${hovered ? 'text-white' : 'text-on-dark'}"
    expect(read('components/pages/publishers/LayerOverview.tsx')).toContain('<p className={`' + num + '`}>')
    expect(read('components/pages/partnership/PartnershipEarnings.tsx')).toContain('className={`' + num + '`}')
  })
  it('pipeline: selected row pill white', () => {
    expect(read('components/home/IntentPipeline.tsx')).toContain("bg-on-dark/8 ${isOpen ? 'text-white' : 'text-on-dark'}")
  })
  it('comparison card numbers on the primary bar are white', () => {
    expect(read('components/pages/publishers/SolutionPitches.tsx')).toContain('tabular-nums text-white')
  })
  it('404 and error page big glyph is white (DESIGN.md §6.7)', () => {
    expect(read('components/not-found/NotFoundContent.tsx')).toContain('text-7xl font-bold mb-4 text-white')
    expect(read('app/error.tsx')).toContain('text-7xl font-bold mb-4 text-white')
  })
  it('primary text no longer sits on the dark band; white panel label is primary', () => {
    expect(read('components/pages/brands/BrandGEOSection.tsx')).toContain('label-eyebrow-md mb-8 text-on-dark')
    expect(read('components/pages/publishers/KnowledgeBaseSection.tsx')).not.toContain('<Eyebrow dark>{STEPS[active].sub}</Eyebrow>')
  })
  it('decorative watermark is hidden from assistive tech (DECISIONS #50-4)', () => {
    expect(read('components/pages/publishers/KnowledgeBaseSection.tsx')).toContain('select-none" aria-hidden="true"')
  })
})

describe('guard ledger', () => {
  it('pending/DATAI-622.ts is gone', () => {
    expect(existsSync(resolve(root, '__tests__/design-guard/pending/DATAI-622.ts'))).toBe(false)
  })
})
