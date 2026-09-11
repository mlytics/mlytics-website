import { describe, expect, it } from 'vitest'
import { isCortexLens, readLensFromSearch } from '@/components/pages/cortex-playground/cortex-playground-data'

describe('isCortexLens', () => {
  it('accepts the two supported lenses', () => {
    expect(isCortexLens('publisher')).toBe(true)
    expect(isCortexLens('brand')).toBe(true)
  })

  it('rejects anything else', () => {
    expect(isCortexLens('garbage')).toBe(false)
    expect(isCortexLens('Publisher')).toBe(false)
    expect(isCortexLens('')).toBe(false)
    expect(isCortexLens(null)).toBe(false)
    expect(isCortexLens(undefined)).toBe(false)
    expect(isCortexLens(1)).toBe(false)
    expect(isCortexLens(['brand'])).toBe(false)
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
