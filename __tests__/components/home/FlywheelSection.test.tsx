import { act, render, screen, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import { FlywheelSection } from '@/components/home/FlywheelSection'
import { stubReducedMotion } from '../../helpers/matchMedia'

// framer-motion's useInView needs an IntersectionObserver; this one reports
// every observed element as in view right away.
class InViewObserver {
  cb: IntersectionObserverCallback
  constructor(cb: IntersectionObserverCallback) { this.cb = cb }
  observe(el: Element) {
    this.cb([{ isIntersecting: true, target: el, intersectionRatio: 1 } as IntersectionObserverEntry], this as unknown as IntersectionObserver)
  }
  unobserve() {}
  disconnect() {}
  takeRecords() { return [] }
}

beforeEach(() => { vi.stubGlobal('IntersectionObserver', InViewObserver) })
afterEach(() => vi.unstubAllGlobals())

it('shows the final MAU number at once when reduced motion is on', () => {
  stubReducedMotion(true)
  render(<FlywheelSection />)
  expect(screen.getByText('15,000,000')).toBeInTheDocument()
})

it('still counts up otherwise', async () => {
  stubReducedMotion(false)
  render(<FlywheelSection />)
  expect(screen.queryByText('15,000,000')).toBeNull()
  await waitFor(() => expect(screen.getByText('15,000,000')).toBeInTheDocument(), { timeout: 4000 })
})

it('switching reduced motion on mid-count shows the final number at once, and it stays', async () => {
  const mq = stubReducedMotion(false)
  render(<FlywheelSection />)
  await new Promise((r) => setTimeout(r, 200))
  expect(screen.queryByText('15,000,000')).toBeNull()
  act(() => mq.set(true))
  expect(screen.getByText('15,000,000')).toBeInTheDocument()
  // The old animation loop must not keep writing smaller values.
  await new Promise((r) => setTimeout(r, 300))
  expect(screen.getByText('15,000,000')).toBeInTheDocument()
})

it('switching reduced motion off after the number is shown keeps it (no recount from 0)', async () => {
  const mq = stubReducedMotion(true)
  render(<FlywheelSection />)
  expect(screen.getByText('15,000,000')).toBeInTheDocument()
  act(() => mq.set(false))
  await new Promise((r) => setTimeout(r, 200))
  expect(screen.getByText('15,000,000')).toBeInTheDocument()
})

it('a finished count stays put when reduced motion goes on and off again', async () => {
  const mq = stubReducedMotion(false)
  render(<FlywheelSection />)
  await waitFor(() => expect(screen.getByText('15,000,000')).toBeInTheDocument(), { timeout: 4000 })
  act(() => mq.set(true))
  act(() => mq.set(false))
  await new Promise((r) => setTimeout(r, 200))
  expect(screen.getByText('15,000,000')).toBeInTheDocument()
})
