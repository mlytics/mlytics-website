import { describe, expect, it } from 'vitest'
import { metadata } from '@/app/ai-mode-playground/page'

const asText = (v: unknown) => JSON.stringify(v)

describe('AI Mode Playground metadata', () => {
  it('title 使用 Mlytics AI Mode', () => {
    expect(metadata.title).toEqual({ absolute: 'Mlytics AI Mode · Mlytics' })
  })

  it('canonical 指向新路徑', () => {
    expect(metadata.alternates?.canonical).toBe('/ai-mode-playground/')
  })

  it('openGraph url 指向新路徑', () => {
    expect(metadata.openGraph?.url).toBe('https://www.mlytics.com/ai-mode-playground/')
  })

  it('metadata 完全不出現 Cortex、publisher、reader', () => {
    expect(asText(metadata)).not.toMatch(/cortex|publisher|reader/i)
  })
})
