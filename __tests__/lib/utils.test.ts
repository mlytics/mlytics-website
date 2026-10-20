import { cn } from '@/lib/utils'

describe('cn', () => {
  it('keeps a text-* size token next to a text colour', () => {
    expect(cn('text-h3 text-white')).toBe('text-h3 text-white')
  })

  it('lets a later font size replace a text-* size token', () => {
    expect(cn('text-h3', 'text-sm')).toBe('text-sm')
  })

  it('still merges text colours', () => {
    expect(cn('text-white', 'text-ink')).toBe('text-ink')
  })
})
