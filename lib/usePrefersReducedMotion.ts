'use client'
import { useSyncExternalStore } from 'react'

// DESIGN.md §8.4: non-framer animations (rAF counters, setInterval carousels,
// SVG <animateMotion>) stop on their own when the OS asks for reduced motion.
export const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)'

function query(): MediaQueryList | null {
  return typeof window !== 'undefined' && typeof window.matchMedia === 'function'
    ? window.matchMedia(REDUCED_MOTION_QUERY)
    : null
}

function subscribe(onChange: () => void) {
  const mql = query()
  mql?.addEventListener('change', onChange)
  return () => mql?.removeEventListener('change', onChange)
}

export function usePrefersReducedMotion(): boolean {
  return useSyncExternalStore(subscribe, () => query()?.matches ?? false, () => false)
}
