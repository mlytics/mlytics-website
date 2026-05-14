'use client'

import { useEffect } from 'react'
import { trackAG, getPage } from '@/lib/analytics'

const MILESTONES = [25, 50, 75, 90]

/**
 * Scroll depth tracking.
 * Fires scroll_depth once per milestone (25/50/75/90%) per page load.
 */
export function ScrollDepthTracker() {
  useEffect(() => {
    const currentPage = getPage()
    const tracked = new Set<number>()

    const handler = () => {
      const scrolled = window.scrollY + window.innerHeight
      const total = document.documentElement.scrollHeight
      if (total <= 0) return
      const pct = Math.round((scrolled / total) * 100)
      for (const m of MILESTONES) {
        if (pct >= m && !tracked.has(m)) {
          tracked.add(m)
          trackAG('scroll_depth', { page_audience: currentPage, depth_pct: m })
        }
      }
    }

    window.addEventListener('scroll', handler, { passive: true })
    return () => window.removeEventListener('scroll', handler)
  }, [])

  return null
}
