import { act, render } from '@testing-library/react'
import { afterEach, expect, it, vi } from 'vitest'
import { WorldMapDots } from '@/components/home/WorldMapDots'
import { stubReducedMotion } from '../../helpers/matchMedia'

afterEach(() => {
  vi.useRealTimers()
  vi.unstubAllGlobals()
})

it('adds no signal pings when reduced motion is on', () => {
  stubReducedMotion(true)
  vi.useFakeTimers()
  const { container } = render(<WorldMapDots />)
  act(() => { vi.advanceTimersByTime(10000) })
  expect(container.querySelectorAll('.ping-ring')).toHaveLength(0)
})

it('adds pings otherwise, and removes each one after 3s', () => {
  stubReducedMotion(false)
  vi.useFakeTimers()
  const { container } = render(<WorldMapDots />)
  const first = container.querySelector('.ping-ring')
  expect(first).not.toBeNull()
  // The interval fires every 1.4–2.4s, so new pings keep arriving…
  act(() => { vi.advanceTimersByTime(3000) })
  expect(container.querySelectorAll('.ping-ring').length).toBeGreaterThan(0)
  // …while the first one is gone once its 3s are up.
  expect(container.contains(first)).toBe(false)
})

it('clears pings and pending timers when reduced motion turns on', () => {
  const mq = stubReducedMotion(false)
  vi.useFakeTimers()
  const { container } = render(<WorldMapDots />)
  expect(container.querySelectorAll('.ping-ring').length).toBeGreaterThan(0)
  act(() => mq.set(true))
  expect(container.querySelectorAll('.ping-ring')).toHaveLength(0)
  expect(vi.getTimerCount()).toBe(0)
})

it('the base dot map renders either way', () => {
  stubReducedMotion(true)
  const { container } = render(<WorldMapDots />)
  expect(container.querySelectorAll('circle').length).toBeGreaterThan(100)
})
