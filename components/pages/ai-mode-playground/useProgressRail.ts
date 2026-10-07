import { useEffect, useLayoutEffect, useState } from 'react'
import type { RefObject } from 'react'
import { pickActiveStage, progressFillPx } from './playground-logic'

export function useProgressRail(flowRef: RefObject<HTMLElement | null>, rebindKey: string): number {
  const [activeIndex, setActiveIndex] = useState(0)

  useEffect(() => {
    const flow = flowRef.current
    if (!flow) return

    const stages = Array.from(flow.querySelectorAll<HTMLElement>(':scope [data-stage]'))
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
          const nodeRect = stage.querySelector<HTMLElement>('[class*="stageNode"]')?.getBoundingClientRect()
          const rect = nodeRect ?? stage.getBoundingClientRect()
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

  useLayoutEffect(() => {
    const flow = flowRef.current
    if (!flow) return
    const stages = Array.from(flow.querySelectorAll<HTMLElement>(':scope [data-stage]'))
    if (!stages.length) {
      flow.style.setProperty('--progress-fill', '0px')
      return
    }
    const flowTop = flow.getBoundingClientRect().top
    const activeStage = stages[Math.min(activeIndex, stages.length - 1)]
    const lastStage = stages[stages.length - 1]
    const activeNode = activeStage.querySelector<HTMLElement>('[class*="stageNode"]')
    const activeRect = activeNode?.getBoundingClientRect() ?? activeStage.getBoundingClientRect()
    const lastRect = lastStage.getBoundingClientRect()
    const fill = progressFillPx({
      activeIndex,
      count: stages.length,
      nodeCenterFromFlowTop: activeRect.top - flowTop + activeRect.height / 2,
      lastStageBottomFromFlowTop: lastRect.bottom - flowTop,
    })
    flow.style.setProperty('--progress-fill', `${fill}px`)
  }, [activeIndex, flowRef, rebindKey])

  return activeIndex
}
