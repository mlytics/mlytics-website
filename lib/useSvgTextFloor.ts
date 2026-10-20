'use client'

import { useEffect, type RefObject } from 'react'

type Options = {
  /** Smallest on-screen font size in px. */
  minPx?: number
  /** Media query the floor applies under; outside it the authored sizes stay. */
  media?: string
}

// Keeps every <text> inside a scaling SVG at or above `minPx` on screen
// (DESIGN.md §2.7: nothing smaller than 12px). The SVG scales with the
// layout, so a fixed font-size attribute is too small on some widths and
// too large on others; this enlarges a label only while it is below the
// floor and restores the authored size once it is not. With `media`, the
// floor applies only while that query matches (approved exceptions, §10.1).
// A <text> with data-text-floor="off" is never enlarged and keeps its
// authored size at every width; use it only for a §10.1 approved exception.
export function useSvgTextFloor(ref: RefObject<SVGSVGElement | null>, options: Options = {}) {
  const { minPx = 12, media } = options

  useEffect(() => {
    const svg = ref.current
    if (!svg) return

    // Environments without matchMedia (e.g. jsdom) count as matching.
    const mql = media && typeof window.matchMedia === 'function' ? window.matchMedia(media) : null

    const apply = () => {
      const texts = svg.querySelectorAll('text')
      if (mql && !mql.matches) {
        texts.forEach((text) => { text.style.fontSize = '' })
        return
      }
      const vb = svg.viewBox.baseVal
      if (!vb || !vb.width || !vb.height || !svg.clientWidth || !svg.clientHeight) return
      const scale = Math.min(svg.clientWidth / vb.width, svg.clientHeight / vb.height)
      texts.forEach((text) => {
        if (text.getAttribute('data-text-floor') === 'off') {
          text.style.fontSize = ''
          return
        }
        let base = text.getAttribute('data-base-font-size')
        if (base === null) {
          base = text.getAttribute('font-size') ?? ''
          text.setAttribute('data-base-font-size', base)
        }
        const authored = parseFloat(base)
        if (!authored) return
        text.style.fontSize = authored * scale < minPx ? `${minPx / scale}px` : ''
      })
    }

    apply()
    mql?.addEventListener('change', apply)
    // Environments without ResizeObserver (e.g. jsdom) keep the first pass.
    const observer = typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(apply)
    observer?.observe(svg)
    return () => {
      mql?.removeEventListener('change', apply)
      observer?.disconnect()
    }
  }, [ref, minPx, media])
}
