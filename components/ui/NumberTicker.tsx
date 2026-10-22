'use client'

import { useEffect, useRef, useState } from 'react'
import { usePrefersReducedMotion } from '@/lib/usePrefersReducedMotion'

interface NumberTickerProps {
  value: number
  duration?: number
  prefix?: string
  suffix?: string
  className?: string
  formatter?: (v: number) => string
}

export function NumberTicker({ value, duration = 1200, prefix = '', suffix = '', className = '', formatter }: NumberTickerProps) {
  const [displayed, setDisplayed] = useState(0)
  const startRef = useRef<number | null>(null)
  const rafRef = useRef<number | null>(null)
  const startValueRef = useRef(0)
  const reduce = usePrefersReducedMotion()

  useEffect(() => {
    // Reduced motion: show the final value at once (DESIGN.md §8.4).
    if (reduce) { setDisplayed(value); return }
    startValueRef.current = displayed
    startRef.current = null
    if (rafRef.current) cancelAnimationFrame(rafRef.current)

    function step(ts: number) {
      if (!startRef.current) startRef.current = ts
      const elapsed = ts - startRef.current
      const progress = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      const current = Math.round(startValueRef.current + (value - startValueRef.current) * eased)
      setDisplayed(current)
      if (progress < 1) rafRef.current = requestAnimationFrame(step)
    }

    rafRef.current = requestAnimationFrame(step)
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current) }
  }, [value, duration, reduce]) // eslint-disable-line react-hooks/exhaustive-deps

  const display = formatter ? formatter(displayed) : displayed.toLocaleString()
  return <span className={className}>{prefix}{display}{suffix}</span>
}
