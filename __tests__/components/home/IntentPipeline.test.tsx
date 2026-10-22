import { act, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import { IntentPipeline } from '@/components/home/IntentPipeline'
import { stubReducedMotion } from '../../helpers/matchMedia'

// The carousel only cycles while the widget is in view: report it in view.
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
class NoopResizeObserver { observe() {} unobserve() {} disconnect() {} }

beforeEach(() => {
  vi.stubGlobal('IntersectionObserver', InViewObserver)
  vi.stubGlobal('ResizeObserver', NoopResizeObserver)
})
afterEach(() => {
  vi.useRealTimers()
  vi.unstubAllGlobals()
})

const expandedIndex = () =>
  screen.getAllByRole('button').findIndex((r) => r.getAttribute('aria-expanded') === 'true')

it('rows are buttons that expose and control their description', () => {
  stubReducedMotion(false)
  render(<IntentPipeline />)
  const rows = screen.getAllByRole('button')
  expect(rows).toHaveLength(5)
  rows.forEach((r, i) => {
    expect(r).toHaveAttribute('type', 'button')
    expect(r).toHaveAttribute('aria-expanded', i === 0 ? 'true' : 'false')
    const panel = document.getElementById(r.getAttribute('aria-controls')!)
    expect(panel).not.toBeNull()
    expect(panel).toHaveAttribute('aria-hidden', i === 0 ? 'false' : 'true')
  })
  fireEvent.click(rows[2])
  expect(rows[2]).toHaveAttribute('aria-expanded', 'true')
  expect(rows[0]).toHaveAttribute('aria-expanded', 'false')
})

it('row content uses only phrasing elements (no div or p inside a button)', () => {
  stubReducedMotion(false)
  render(<IntentPipeline />)
  for (const r of screen.getAllByRole('button')) {
    expect(r.querySelector('div, p')).toBeNull()
    expect(r).toHaveTextContent(/\S/)
  }
})

it('auto-cycles every 3s normally', () => {
  stubReducedMotion(false)
  vi.useFakeTimers()
  render(<IntentPipeline />)
  act(() => { vi.advanceTimersByTime(3000) })
  expect(expandedIndex()).toBe(1)
  act(() => { vi.advanceTimersByTime(3000) })
  expect(expandedIndex()).toBe(2)
})

it('does not auto-cycle with reduced motion', () => {
  stubReducedMotion(true)
  vi.useFakeTimers()
  render(<IntentPipeline />)
  for (let tick = 0; tick < 6; tick++) {
    act(() => { vi.advanceTimersByTime(3000) })
    expect(expandedIndex()).toBe(0)
  }
})

it('pauses while keyboard focus is inside and resumes after', () => {
  stubReducedMotion(false)
  vi.useFakeTimers()
  render(<IntentPipeline />)
  const rows = screen.getAllByRole('button')
  act(() => { rows[0].focus() })
  act(() => { vi.advanceTimersByTime(6000) })
  expect(rows[0]).toHaveAttribute('aria-expanded', 'true')
  act(() => { rows[0].blur() })
  act(() => { vi.advanceTimersByTime(3000) })
  expect(rows[1]).toHaveAttribute('aria-expanded', 'true')
})

it('a click still stops auto-cycling for good', () => {
  stubReducedMotion(false)
  vi.useFakeTimers()
  render(<IntentPipeline />)
  fireEvent.click(screen.getAllByRole('button')[3])
  act(() => { vi.advanceTimersByTime(12000) })
  expect(expandedIndex()).toBe(3)
})

it('turning reduced motion on mid-way returns to the first row; later clicks stick', () => {
  const mq = stubReducedMotion(false)
  vi.useFakeTimers()
  render(<IntentPipeline />)
  act(() => { vi.advanceTimersByTime(6000) })
  expect(expandedIndex()).toBe(2)
  act(() => mq.set(true))
  expect(expandedIndex()).toBe(0)
  fireEvent.click(screen.getAllByRole('button')[1])
  act(() => { vi.advanceTimersByTime(9000) })
  expect(expandedIndex()).toBe(1)
})
