import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import type { RefObject } from 'react'
import { pickActiveStage, progressFillPx } from './playground-logic'

const STAGE_SELECTOR = ':scope [data-stage]'
const NODE_SELECTOR = '[data-stage-node]'

function nodeRect(stage: HTMLElement): DOMRect {
  return stage.querySelector<HTMLElement>(NODE_SELECTOR)?.getBoundingClientRect() ?? stage.getBoundingClientRect()
}

/**
 * `rebindKey` changes when the set of stage elements is replaced (the lens);
 * `measureKey` changes when stage content changes without replacing the
 * elements (experience, chat answer), so the fill is re-measured. Size changes
 * from anything else (viewport width, wrapping) are picked up by observing the
 * flow element itself.
 */
export function useProgressRail(
  flowRef: RefObject<HTMLElement | null>,
  rebindKey: string,
  measureKey = '',
): number {
  const [activeIndex, setActiveIndex] = useState(0)
  const activeIndexRef = useRef(activeIndex)

  useEffect(() => {
    const flow = flowRef.current
    if (!flow) return

    const stages = Array.from(flow.querySelectorAll<HTMLElement>(STAGE_SELECTOR))
    if (typeof IntersectionObserver === 'undefined') {
      setActiveIndex(0)
      return
    }

    const visibility = stages.map(() => false)
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const index = stages.indexOf(entry.target as HTMLElement)
          if (index >= 0) visibility[index] = entry.isIntersecting
        })
        const tops = stages.map((stage) => {
          const rect = nodeRect(stage)
          return rect.top + rect.height / 2
        })
        const nextIndex = pickActiveStage(tops, visibility, window.innerHeight * 0.35)
        if (nextIndex !== null) setActiveIndex(nextIndex)
      },
      { rootMargin: '-8% 0px -55% 0px', threshold: [0, 0.25, 0.5, 1] },
    )

    stages.forEach((stage) => observer.observe(stage))
    return () => observer.disconnect()
  }, [flowRef, rebindKey])

  const measure = useCallback(() => {
    const flow = flowRef.current
    if (!flow) return
    const stages = Array.from(flow.querySelectorAll<HTMLElement>(STAGE_SELECTOR))
    if (!stages.length) {
      flow.style.setProperty('--progress-fill', '0px')
      return
    }
    const index = activeIndexRef.current
    const flowTop = flow.getBoundingClientRect().top
    const activeRect = nodeRect(stages[Math.min(index, stages.length - 1)])
    const lastRect = stages[stages.length - 1].getBoundingClientRect()
    const fill = progressFillPx({
      activeIndex: index,
      count: stages.length,
      nodeCenterFromFlowTop: activeRect.top - flowTop + activeRect.height / 2,
      lastStageBottomFromFlowTop: lastRect.bottom - flowTop,
    })
    flow.style.setProperty('--progress-fill', `${fill}px`)
  }, [flowRef])

  useLayoutEffect(() => {
    activeIndexRef.current = activeIndex
    measure()
  }, [activeIndex, measure, rebindKey, measureKey])

  useEffect(() => {
    const flow = flowRef.current
    if (!flow) return
    if (typeof ResizeObserver !== 'undefined') {
      const observer = new ResizeObserver(() => measure())
      observer.observe(flow)
      return () => observer.disconnect()
    }
    window.addEventListener('resize', measure)
    return () => window.removeEventListener('resize', measure)
  }, [flowRef, measure, rebindKey])

  return activeIndex
}
