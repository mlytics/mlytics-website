import { act, render } from '@testing-library/react'
import { afterEach, expect, it, vi } from 'vitest'
import { MotionGlobalConfig } from 'framer-motion'
import { ReducedMotion } from '@/components/layout/ReducedMotion'
import { stubReducedMotion } from '../../helpers/matchMedia'

afterEach(() => { vi.unstubAllGlobals(); MotionGlobalConfig.skipAnimations = false })

it('skips framer-motion animations while reduce is on, and follows changes', () => {
  const mq = stubReducedMotion(true)
  const { container } = render(<ReducedMotion />)
  expect(container).toBeEmptyDOMElement()
  expect(MotionGlobalConfig.skipAnimations).toBe(true)
  act(() => mq.set(false))
  expect(MotionGlobalConfig.skipAnimations).toBe(false)
})
