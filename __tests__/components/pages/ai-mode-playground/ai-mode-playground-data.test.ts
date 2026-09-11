import { describe, expect, it } from 'vitest'
import { isLedgerLens, readLensFromSearch } from '@/components/pages/ai-mode-playground/ai-mode-playground-data'

describe('isLedgerLens', () => {
  it('accepts the two supported lenses', () => {
    expect(isLedgerLens('publisher')).toBe(true)
    expect(isLedgerLens('brand')).toBe(true)
  })

  it('rejects anything else', () => {
    expect(isLedgerLens('garbage')).toBe(false)
    expect(isLedgerLens('Publisher')).toBe(false)
    expect(isLedgerLens('')).toBe(false)
    expect(isLedgerLens(null)).toBe(false)
    expect(isLedgerLens(undefined)).toBe(false)
    expect(isLedgerLens(1)).toBe(false)
    expect(isLedgerLens(['brand'])).toBe(false)
  })
})

describe('readLensFromSearch', () => {
  it('reads a valid lens from a query string', () => {
    expect(readLensFromSearch('?lens=publisher')).toBe('publisher')
    expect(readLensFromSearch('?lens=brand')).toBe('brand')
  })

  it('reads a valid lens when other params are present', () => {
    expect(readLensFromSearch('?utm_source=jira&lens=publisher&x=1')).toBe('publisher')
  })

  it('returns null when the lens param is missing', () => {
    expect(readLensFromSearch('')).toBeNull()
    expect(readLensFromSearch('?')).toBeNull()
    expect(readLensFromSearch('?utm_source=jira')).toBeNull()
  })

  it('returns null for an unsupported lens value', () => {
    expect(readLensFromSearch('?lens=garbage')).toBeNull()
    expect(readLensFromSearch('?lens=')).toBeNull()
    expect(readLensFromSearch('?lens=Brand')).toBeNull()
  })
})
