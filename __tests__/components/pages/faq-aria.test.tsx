import { fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { BrandFAQ } from '@/components/pages/brands/BrandFAQ'
import { ContentOwnerFAQ } from '@/components/pages/publishers/ContentOwnerFAQ'
import { EngineFAQ } from '@/components/pages/decisive-engine/EngineFAQ'

// framer-motion's whileInView needs an IntersectionObserver; jsdom has none.
beforeEach(() => {
  vi.stubGlobal('IntersectionObserver', class { observe() {} unobserve() {} disconnect() {} takeRecords() { return [] } })
})
afterEach(() => vi.unstubAllGlobals())

describe.each([
  ['BrandFAQ', BrandFAQ],
  ['ContentOwnerFAQ', ContentOwnerFAQ],
  ['EngineFAQ', EngineFAQ],
])('%s', (_, FAQ) => {
  it('every question is a button that exposes and controls its answer', () => {
    const { container } = render(<FAQ />)
    const buttons = screen.getAllByRole('button')
    expect(buttons.length).toBeGreaterThan(0)
    const ids = buttons.map((b) => b.getAttribute('aria-controls'))
    expect(new Set(ids).size).toBe(ids.length)
    for (const b of buttons) {
      expect(b).toHaveAttribute('type', 'button')
      expect(b).toHaveAttribute('aria-expanded', 'false')
      const id = b.getAttribute('aria-controls')!
      expect(id).toBeTruthy()
      expect(container.querySelector(`[id="${id}"]`)).not.toBeNull()
    }
    fireEvent.click(buttons[0])
    expect(buttons[0]).toHaveAttribute('aria-expanded', 'true')
    const region = container.querySelector(`[id="${buttons[0].getAttribute('aria-controls')}"]`)!
    expect(region.textContent!.length).toBeGreaterThan(0)
    fireEvent.click(buttons[0])
    expect(buttons[0]).toHaveAttribute('aria-expanded', 'false')
  })

  it('answer containers are empty while collapsed', () => {
    const { container } = render(<FAQ />)
    for (const b of screen.getAllByRole('button')) {
      const region = container.querySelector(`[id="${b.getAttribute('aria-controls')}"]`)!
      expect(region.textContent).toBe('')
    }
  })
})
