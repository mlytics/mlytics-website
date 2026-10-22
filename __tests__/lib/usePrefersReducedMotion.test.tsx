import { act, renderHook } from '@testing-library/react'
import { afterEach, expect, it, vi } from 'vitest'
import { usePrefersReducedMotion } from '@/lib/usePrefersReducedMotion'
import { stubReducedMotion } from '../helpers/matchMedia'

afterEach(() => vi.unstubAllGlobals())

it('reflects the OS setting and follows changes', () => {
  const mq = stubReducedMotion(false)
  const { result } = renderHook(() => usePrefersReducedMotion())
  expect(result.current).toBe(false)
  act(() => mq.set(true))
  expect(result.current).toBe(true)
})

it('is false without matchMedia', () => {
  vi.stubGlobal('matchMedia', undefined)
  const { result } = renderHook(() => usePrefersReducedMotion())
  expect(result.current).toBe(false)
})
