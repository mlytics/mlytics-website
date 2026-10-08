import { useEffect } from 'react'
import type { RefObject } from 'react'

const VAR_NAME = '--playground-sticky-top'
const STABLE_FRAMES = 3
// Safety net if a transitionend never arrives: stop polling after ~1s without movement.
const MAX_IDLE_FRAMES = 60

/** The site Nav is a fixed `<nav>` (or a fixed `<header>` wrapping one). */
function findFixedNav(): HTMLElement | null {
  const candidates = Array.from(document.querySelectorAll<HTMLElement>('header, nav'))
  return candidates.find((element) => window.getComputedStyle(element).position === 'fixed') ?? null
}

/**
 * Keeps `--playground-sticky-top` on the playground root equal to the visible
 * bottom edge of the fixed site Nav, so the sticky customer-tabs shell sits
 * flush under the Nav when it is shown and at the viewport top when the Nav
 * slides away. The value is capped at the stylesheet default (the Nav bar
 * height) so an expanded mobile menu inside the Nav never pushes the shell
 * down. It only mirrors the Nav's own movement and adds no animation.
 */
export function useNavOffset(rootRef: RefObject<HTMLElement | null>): void {
  useEffect(() => {
    const root = rootRef.current
    const nav = findFixedNav()
    if (!root || !nav) return

    const fallback = Number.parseFloat(window.getComputedStyle(root).getPropertyValue(VAR_NAME))
    const cap = Number.isFinite(fallback) && fallback > 0 ? fallback : Number.POSITIVE_INFINITY

    let frame: number | null = null
    const running = new Set<string>()
    let stableFrames = 0
    let last: number | null = null

    const measure = () => {
      const bottom = Math.min(cap, Math.max(0, nav.getBoundingClientRect().bottom))
      const rounded = Math.round(bottom * 100) / 100
      if (rounded === last) return false
      last = rounded
      root.style.setProperty(VAR_NAME, `${rounded}px`)
      return true
    }

    const tick = () => {
      frame = null
      stableFrames = measure() ? 0 : stableFrames + 1
      const keepPolling = running.size > 0 ? stableFrames < MAX_IDLE_FRAMES : stableFrames < STABLE_FRAMES
      if (keepPolling) frame = window.requestAnimationFrame(tick)
    }

    const schedule = () => {
      stableFrames = 0
      if (frame === null) frame = window.requestAnimationFrame(tick)
    }

    const onTransitionRun = (event: TransitionEvent) => {
      if (event.target !== nav) return
      running.add(event.propertyName)
      schedule()
    }
    const onTransitionStop = (event: TransitionEvent) => {
      if (event.target !== nav) return
      running.delete(event.propertyName)
      schedule()
    }

    measure()
    window.addEventListener('scroll', schedule, { passive: true })
    window.addEventListener('resize', schedule, { passive: true })
    nav.addEventListener('transitionrun', onTransitionRun)
    nav.addEventListener('transitionend', onTransitionStop)
    nav.addEventListener('transitioncancel', onTransitionStop)

    return () => {
      window.removeEventListener('scroll', schedule)
      window.removeEventListener('resize', schedule)
      nav.removeEventListener('transitionrun', onTransitionRun)
      nav.removeEventListener('transitionend', onTransitionStop)
      nav.removeEventListener('transitioncancel', onTransitionStop)
      if (frame !== null) window.cancelAnimationFrame(frame)
      root.style.removeProperty(VAR_NAME)
    }
  }, [rootRef])
}
