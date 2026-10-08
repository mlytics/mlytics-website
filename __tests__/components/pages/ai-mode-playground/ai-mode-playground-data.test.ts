import { describe, expect, it } from 'vitest'
import { DEFAULT_LENS, isPlaygroundLens, readLensFromSearch } from '@/components/pages/ai-mode-playground/ai-mode-playground-data'

describe('isPlaygroundLens', () => {
  it('accepts the two supported lenses', () => {
    expect(isPlaygroundLens('content-owners')).toBe(true)
    expect(isPlaygroundLens('brands')).toBe(true)
  })

  // The three retired values still resolve through `readLensFromSearch`, but
  // they are not lens values any more: nothing inside the app may hold one.
  it('rejects the retired lens values', () => {
    expect(isPlaygroundLens('media')).toBe(false)
    expect(isPlaygroundLens('publisher')).toBe(false)
    expect(isPlaygroundLens('brand')).toBe(false)
  })

  it('rejects anything else', () => {
    expect(isPlaygroundLens('garbage')).toBe(false)
    expect(isPlaygroundLens('Content-Owners')).toBe(false)
    expect(isPlaygroundLens('')).toBe(false)
    expect(isPlaygroundLens(null)).toBe(false)
    expect(isPlaygroundLens(undefined)).toBe(false)
    expect(isPlaygroundLens(1)).toBe(false)
    expect(isPlaygroundLens(['brands'])).toBe(false)
  })
})

it('defaults to the content-owners lens', () => {
  expect(DEFAULT_LENS).toBe('content-owners')
})

describe('readLensFromSearch', () => {
  it('reads a valid lens from a query string', () => {
    expect(readLensFromSearch('?lens=content-owners')).toBe('content-owners')
    expect(readLensFromSearch('?lens=brands')).toBe('brands')
  })

  // DATAI-555 writes the lens into the address bar, so every value this page
  // has ever shipped is a link someone already holds. Dropping an alias would
  // silently fall back to the default lens instead of erroring, so all three
  // have to keep resolving: `publisher` and `brand` went out with DATAI-555,
  // and `media` was live long enough to reach UAT links.
  it('resolves every retired lens value that reached a user URL', () => {
    expect(readLensFromSearch('?lens=publisher')).toBe('content-owners')
    expect(readLensFromSearch('?lens=media')).toBe('content-owners')
    expect(readLensFromSearch('?lens=brand')).toBe('brands')
  })

  it('resolves a legacy alias when other params are present', () => {
    expect(readLensFromSearch('?utm_source=jira&lens=publisher&x=1')).toBe('content-owners')
    expect(readLensFromSearch('?utm_source=jira&lens=brand&x=1')).toBe('brands')
  })

  it('reads a valid lens when other params are present', () => {
    expect(readLensFromSearch('?utm_source=jira&lens=content-owners&x=1')).toBe('content-owners')
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
    expect(readLensFromSearch('?lens=Brands')).toBeNull()
  })

  it('returns null for names inherited from Object.prototype', () => {
    expect(readLensFromSearch('?lens=toString')).toBeNull()
    expect(readLensFromSearch('?lens=constructor')).toBeNull()
    expect(readLensFromSearch('?lens=__proto__')).toBeNull()
    expect(readLensFromSearch('?lens=hasOwnProperty')).toBeNull()
  })
})
