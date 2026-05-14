'use client'

import { useEffect } from 'react'
import { trackAG, getPage } from '@/lib/analytics'

const SECTION_NAMES: Record<string, string[]> = {
  home: ['hero', 'attention', 'how_it_works', 'entry_point', 'cta'],
  brands: ['hero', 'value_prop', 'features', 'entry_point', 'cta'],
  'content-owners': ['hero', 'value_prop', 'features', 'entry_point', 'cta'],
  developers: ['hero', 'value_prop', 'features', 'entry_point', 'cta'],
}

/**
 * FR-04: Section view tracking.
 * Observes all <section> elements on the page. Fires view_section once per section
 * when it enters the viewport (30% threshold). Safe to mount globally in layout.tsx.
 */
export function SectionViewTracker() {
  useEffect(() => {
    const currentPage = getPage()
    const pageNames = SECTION_NAMES[currentPage] ?? []
    const viewed = new Set<string>()

    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return
        const allSections = Array.from(document.querySelectorAll('section'))
        const idx = allSections.indexOf(entry.target as HTMLElement)
        const sectionId = pageNames[idx] ?? `section_${idx}`
        if (viewed.has(sectionId)) return
        viewed.add(sectionId)
        trackAG('view_section', {
          section_id: sectionId,
          section_index: idx,
          page_audience: currentPage,
        })
      })
    }, { threshold: 0.3 })

    // Sections may not be in the DOM yet on first render — wait a tick
    const timer = setTimeout(() => {
      document.querySelectorAll('section').forEach(s => observer.observe(s))
    }, 0)

    return () => {
      clearTimeout(timer)
      observer.disconnect()
    }
  }, [])

  return null
}
