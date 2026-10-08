import { describe, expect, it } from 'vitest'
import { metadata } from '@/app/ai-mode-playground/page'
import { PAGE_META } from '@/components/pages/ai-mode-playground/ai-mode-playground-copy'

const asText = (v: unknown) => JSON.stringify(v)

describe('AI Mode Playground metadata', () => {
  it('uses the copy module title and description', () => {
    expect(metadata.title).toEqual({ absolute: PAGE_META.title })
    expect(metadata.description).toBe(PAGE_META.description)
  })

  it('canonical 指向新路徑', () => {
    expect(metadata.alternates?.canonical).toBe('/ai-mode-playground/')
  })

  it('openGraph url 指向新路徑', () => {
    expect(metadata.openGraph?.url).toBe('https://www.mlytics.com/ai-mode-playground/')
    expect(metadata.openGraph?.title).toBe(PAGE_META.title)
    expect(metadata.twitter?.title).toBe(PAGE_META.title)
  })

  it('metadata 完全不出現 Cortex、publisher、reader', () => {
    expect(asText(metadata)).not.toMatch(/cortex|publisher|reader/i)
  })
})
