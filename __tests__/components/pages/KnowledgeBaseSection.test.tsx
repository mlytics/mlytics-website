import { act, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import { MotionGlobalConfig } from 'framer-motion'
import { KnowledgeBaseSection } from '@/components/pages/publishers/KnowledgeBaseSection'
import { stubReducedMotion } from '../../helpers/matchMedia'

// Let AnimatePresence swap panels at once inside jsdom.
beforeEach(() => { MotionGlobalConfig.skipAnimations = true })
afterEach(() => {
  MotionGlobalConfig.skipAnimations = false
  vi.useRealTimers()
  vi.unstubAllGlobals()
})

it('exposes a tablist with one selected tab controlling the panel', () => {
  stubReducedMotion(false)
  render(<KnowledgeBaseSection />)
  const tabs = screen.getAllByRole('tab')
  expect(tabs).toHaveLength(4)
  expect(screen.getByRole('tablist')).toHaveAttribute('aria-orientation', 'vertical')
  expect(screen.getByRole('tablist')).toHaveAccessibleName('AI infrastructure steps')
  expect(tabs[0]).toHaveAttribute('aria-selected', 'true')
  expect(tabs[1]).toHaveAttribute('aria-selected', 'false')
  expect(tabs[0]).toHaveAttribute('tabindex', '0')
  expect(tabs[1]).toHaveAttribute('tabindex', '-1')
  tabs.forEach((t) => expect(t).toHaveAttribute('type', 'button'))
  const panel = screen.getByRole('tabpanel')
  expect(tabs[0]).toHaveAttribute('aria-controls', panel.id)
  expect(panel).toHaveAttribute('aria-labelledby', tabs[0].id)
})

it('arrow keys, Home and End move selection and focus (wrapping)', () => {
  stubReducedMotion(false)
  render(<KnowledgeBaseSection />)
  const tabs = () => screen.getAllByRole('tab')
  tabs()[0].focus()
  fireEvent.keyDown(tabs()[0], { key: 'ArrowDown' })
  expect(tabs()[1]).toHaveAttribute('aria-selected', 'true'); expect(tabs()[1]).toHaveFocus()
  fireEvent.keyDown(tabs()[1], { key: 'ArrowUp' }); expect(tabs()[0]).toHaveFocus()
  fireEvent.keyDown(tabs()[0], { key: 'ArrowLeft' }); expect(tabs()[3]).toHaveFocus()
  fireEvent.keyDown(tabs()[3], { key: 'ArrowRight' }); expect(tabs()[0]).toHaveFocus()
  fireEvent.keyDown(tabs()[0], { key: 'End' }); expect(tabs()[3]).toHaveFocus()
  fireEvent.keyDown(tabs()[3], { key: 'Home' }); expect(tabs()[0]).toHaveFocus()
  expect(tabs()[0]).toHaveAttribute('aria-selected', 'true')
  expect(screen.getByRole('tabpanel')).toHaveAttribute('aria-labelledby', tabs()[0].id)
})

it('dots have readable labels and keep focus after switching', async () => {
  stubReducedMotion(false)
  render(<KnowledgeBaseSection />)
  const name = 'Show step 3: Quality guardrails'
  const dot = screen.getByRole('button', { name })
  dot.focus(); fireEvent.click(dot)
  await waitFor(() => expect(screen.getByRole('button', { name })).toHaveFocus())
  expect(screen.getByRole('button', { name })).toHaveAttribute('aria-current', 'true')
  expect(screen.getByRole('button', { name: 'Show step 1: Content ingestion & structuring' })).not.toHaveAttribute('aria-current')
  expect(screen.getAllByRole('tab')[2]).toHaveAttribute('aria-selected', 'true')
})

it('reduced motion: no auto-advance and no progress bar', () => {
  stubReducedMotion(true)
  vi.useFakeTimers()
  const { container } = render(<KnowledgeBaseSection />)
  for (let tick = 0; tick < 3; tick++) {
    act(() => { vi.advanceTimersByTime(6000) })
    expect(screen.getAllByRole('tab')[0]).toHaveAttribute('aria-selected', 'true')
  }
  expect(container.querySelector('[data-progress]')).toBeNull()
})

it('normal: progress bar shows, advances after 6s, pauses while keyboard focus is inside', () => {
  stubReducedMotion(false)
  vi.useFakeTimers()
  const { container } = render(<KnowledgeBaseSection />)
  expect(container.querySelectorAll('[data-progress]')).toHaveLength(1)
  act(() => { vi.advanceTimersByTime(6000) })
  expect(screen.getAllByRole('tab')[1]).toHaveAttribute('aria-selected', 'true')
  act(() => { screen.getAllByRole('tab')[1].focus() })
  act(() => { vi.advanceTimersByTime(13000) })
  expect(screen.getAllByRole('tab')[1]).toHaveAttribute('aria-selected', 'true')
  act(() => { screen.getAllByRole('tab')[1].blur() })
  act(() => { vi.advanceTimersByTime(6000) })
  expect(screen.getAllByRole('tab')[2]).toHaveAttribute('aria-selected', 'true')
})

it('normal: focus left behind by a mouse click does not stop the carousel', () => {
  stubReducedMotion(false)
  vi.useFakeTimers()
  render(<KnowledgeBaseSection />)
  const tab = screen.getAllByRole('tab')[2]
  act(() => {
    fireEvent.pointerDown(tab)
    tab.focus()
    fireEvent.click(tab)
  })
  expect(tab).toHaveAttribute('aria-selected', 'true')
  act(() => { vi.advanceTimersByTime(6000) })
  expect(screen.getAllByRole('tab')[3]).toHaveAttribute('aria-selected', 'true')
})

it('normal: the progress bar stands still while keyboard focus is inside, like on hover', async () => {
  stubReducedMotion(false)
  const { container } = render(<KnowledgeBaseSection />)
  const bar = () => container.querySelector('[data-progress] > *') as HTMLElement
  // Unfocused: the bar fills (animations are skipped, so it jumps to 100%).
  await waitFor(() => expect(bar().style.width).toBe('100%'))
  const tabs = () => screen.getAllByRole('tab')
  act(() => { tabs()[0].focus() })
  fireEvent.keyDown(tabs()[0], { key: 'ArrowDown' })
  expect(tabs()[1]).toHaveFocus()
  // The new step's bar mounts at 0% and stays there while focus is inside.
  await new Promise((r) => setTimeout(r, 50))
  expect(bar().style.width).toBe('0%')
  // Focus leaves: the bar fills again.
  act(() => { tabs()[1].blur() })
  await waitFor(() => expect(bar().style.width).toBe('100%'))
})

it('progress bar markup uses only phrasing elements inside the tab button', () => {
  stubReducedMotion(false)
  render(<KnowledgeBaseSection />)
  for (const t of screen.getAllByRole('tab')) expect(t.querySelector('div, p')).toBeNull()
})

it('turning reduced motion on mid-way returns to step 1; later clicks and arrow keys stick', () => {
  const mq = stubReducedMotion(false)
  vi.useFakeTimers()
  render(<KnowledgeBaseSection />)
  const tabs = () => screen.getAllByRole('tab')
  act(() => { vi.advanceTimersByTime(12000) })
  expect(tabs()[2]).toHaveAttribute('aria-selected', 'true')
  act(() => mq.set(true))
  expect(tabs()[0]).toHaveAttribute('aria-selected', 'true')
  fireEvent.click(tabs()[1])
  act(() => { vi.advanceTimersByTime(13000) })
  expect(tabs()[1]).toHaveAttribute('aria-selected', 'true')
  fireEvent.keyDown(tabs()[1], { key: 'ArrowDown' })
  act(() => { vi.advanceTimersByTime(13000) })
  expect(tabs()[2]).toHaveAttribute('aria-selected', 'true')
})
