import { describe, expect, it } from 'vitest'
import { isLedgerLens, readLensFromSearch } from '@/components/pages/ai-mode-playground/ai-mode-playground-data'

describe('isLedgerLens', () => {
  it('accepts the two supported lenses', () => {
    expect(isLedgerLens('media')).toBe(true)
    expect(isLedgerLens('brand')).toBe(true)
  })

  it('rejects anything else, including the retired lens value', () => {
    expect(isLedgerLens('publisher')).toBe(false)
    expect(isLedgerLens('garbage')).toBe(false)
    expect(isLedgerLens('Media')).toBe(false)
    expect(isLedgerLens('')).toBe(false)
    expect(isLedgerLens(null)).toBe(false)
    expect(isLedgerLens(undefined)).toBe(false)
    expect(isLedgerLens(1)).toBe(false)
    expect(isLedgerLens(['brand'])).toBe(false)
  })
})

describe('readLensFromSearch', () => {
  it('reads a valid lens from a query string', () => {
    expect(readLensFromSearch('?lens=media')).toBe('media')
    expect(readLensFromSearch('?lens=brand')).toBe('brand')
  })

  // DATAI-555 writes the lens into the address bar, so `?lens=publisher` is a
  // link people already hold. Dropping the alias would silently fall back to
  // the default lens instead of erroring, so it has to keep resolving.
  it('keeps publisher as a legacy alias for media', () => {
    expect(readLensFromSearch('?lens=publisher')).toBe('media')
    expect(readLensFromSearch('?utm_source=jira&lens=publisher&x=1')).toBe('media')
  })

  it('reads a valid lens when other params are present', () => {
    expect(readLensFromSearch('?utm_source=jira&lens=media&x=1')).toBe('media')
  })

  it('returns null when the lens param is missing', () => {
    expect(readLensFromSearch('')).toBeNull()
    expect(readLensFromSearch('?')).toBeNull()
    expect(readLensFromSearch('?utm_source=jira')).toBeNull()
  })

  it('returns null for an unsupported lens value', () => {
    expect(readLensFromSearch('?lens=bogus')).toBeNull()
    expect(readLensFromSearch('?lens=garbage')).toBeNull()
    expect(readLensFromSearch('?lens=')).toBeNull()
    expect(readLensFromSearch('?lens=Brand')).toBeNull()
  })
})
