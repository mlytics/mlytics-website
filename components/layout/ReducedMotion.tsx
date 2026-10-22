'use client'
import { useEffect } from 'react'
import { MotionGlobalConfig } from 'framer-motion'
import { REDUCED_MOTION_QUERY } from '@/lib/usePrefersReducedMotion'

// DESIGN.md §8.4: one site-wide switch for framer-motion. With reduced motion
// on, every framer-motion animation (entrance fades and slides, accordion
// heights, carousel transitions) jumps straight to its end state.
function apply(reduce: boolean) {
  MotionGlobalConfig.skipAnimations = reduce
}

// Set before any component mounts, so animations that start on first render
// are skipped too (child effects run before this component's effect).
if (typeof window !== 'undefined' && typeof window.matchMedia === 'function') {
  apply(window.matchMedia(REDUCED_MOTION_QUERY).matches)
}

export function ReducedMotion() {
  useEffect(() => {
    if (typeof window.matchMedia !== 'function') return
    const mql = window.matchMedia(REDUCED_MOTION_QUERY)
    apply(mql.matches)
    const onChange = (e: MediaQueryListEvent) => apply(e.matches)
    mql.addEventListener('change', onChange)
    return () => mql.removeEventListener('change', onChange)
  }, [])
  return null
}
