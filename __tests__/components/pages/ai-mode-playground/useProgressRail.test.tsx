import { act, render, screen, waitFor } from '@testing-library/react'
import { useRef } from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { useProgressRail } from '@/components/pages/ai-mode-playground/useProgressRail'

let observers: Array<{ callback: IntersectionObserverCallback; observe: ReturnType<typeof vi.fn>; disconnect: ReturnType<typeof vi.fn> }> = []

let resizeCallbacks: Array<() => void> = []
// Geometry: the flow starts at y=100, each stage is 200px tall, and each
// stage's node sits `nodeOffset` px below its stage top with a 36px height.
let nodeOffset = 20

function mockRects() {
  vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockImplementation(function (this: HTMLElement) {
    const rect = (top: number, height: number) => ({ top, height, bottom: top + height, left: 0, right: 0, width: 0, x: 0, y: top, toJSON: () => ({}) }) as DOMRect
    if (this.hasAttribute('data-flow')) return rect(100, 1000)
    const stage = this.closest<HTMLElement>('[data-stage]')
    if (!stage) return rect(0, 0)
    const stageTop = 100 + (Number(stage.dataset.stage) - 1) * 200
    if (this.hasAttribute('data-stage-node')) return rect(stageTop + nodeOffset, 36)
    return rect(stageTop, 200)
  })
}

function Harness({ rebindKey, measureKey }: { rebindKey: string; measureKey?: string }) {
  const flowRef = useRef<HTMLDivElement>(null)
  const activeIndex = useProgressRail(flowRef, rebindKey, measureKey)
  return (
    <div ref={flowRef} data-flow>
      {['01', '02', '03', '04', '05'].map((stage) => (
        <section data-stage={stage} key={stage}>
          <span data-stage-node>{stage}</span>
        </section>
      ))}
      <output data-testid="active-index">{activeIndex}</output>
    </div>
  )
}

beforeEach(() => {
  observers = []
  resizeCallbacks = []
  nodeOffset = 20
  vi.stubGlobal('IntersectionObserver', vi.fn(function IntersectionObserver(callback: IntersectionObserverCallback) {
    const observer = { callback, observe: vi.fn(), disconnect: vi.fn() }
    observers.push(observer)
    return observer
  }))
})

afterEach(() => {
  vi.restoreAllMocks()
  vi.unstubAllGlobals()
})

function activateStage04(container: HTMLElement) {
  const stage = container.querySelector('[data-stage="04"]')!
  act(() => {
    observers[observers.length - 1].callback([{ target: stage, isIntersecting: true } as IntersectionObserverEntry], {} as IntersectionObserver)
  })
}

describe('useProgressRail', () => {
  it('observes five stages and updates the active index and fill', async () => {
    mockRects()
    const { container } = render(<Harness rebindKey="content-owners" />)
    await waitFor(() => expect(observers).toHaveLength(1))
    expect(observers[0].observe).toHaveBeenCalledTimes(5)

    const flow = container.firstElementChild as HTMLElement
    activateStage04(container)

    expect(screen.getByTestId('active-index')).toHaveTextContent('3')
    // Node 04 centre: (100 + 600 + 20) - 100 + 18 = 638 → fill 638 - 18 = 620.
    // Measuring the stage box instead of [data-stage-node] would give 682.
    expect(flow.style.getPropertyValue('--progress-fill')).toBe('620px')
  })

  it('picks the visible stage whose node centre is nearest 35% of the viewport height', async () => {
    mockRects()
    const { container } = render(<Harness rebindKey="content-owners" />)
    await waitFor(() => expect(observers).toHaveLength(1))
    // Node centres: stage 02 at 338, stage 03 at 538; their midpoint is 438.
    // innerHeight 1240 → anchor 434 (stage 02); 1260 → 441 (stage 03). A
    // factor of .34 or .36 would flip one of the two outcomes.
    const fire = (innerHeight: number) => {
      Object.defineProperty(window, 'innerHeight', { configurable: true, value: innerHeight })
      act(() => {
        observers[0].callback(
          ['02', '03'].map((n) => ({ target: container.querySelector(`[data-stage="${n}"]`)!, isIntersecting: true }) as IntersectionObserverEntry),
          {} as IntersectionObserver,
        )
      })
    }
    const original = window.innerHeight
    try {
      fire(1240)
      expect(screen.getByTestId('active-index')).toHaveTextContent('1')
      fire(1260)
      expect(screen.getByTestId('active-index')).toHaveTextContent('2')
    } finally {
      Object.defineProperty(window, 'innerHeight', { configurable: true, value: original })
    }
  })

  it('re-measures the fill when the flow resizes', async () => {
    mockRects()
    vi.stubGlobal('ResizeObserver', vi.fn(function ResizeObserver(callback: () => void) {
      resizeCallbacks.push(callback)
      return { observe: vi.fn(), disconnect: vi.fn() }
    }))
    const { container } = render(<Harness rebindKey="content-owners" />)
    await waitFor(() => expect(observers).toHaveLength(1))
    activateStage04(container)
    const flow = container.firstElementChild as HTMLElement
    expect(flow.style.getPropertyValue('--progress-fill')).toBe('620px')
    expect(resizeCallbacks.length).toBeGreaterThan(0)

    nodeOffset = 50
    act(() => resizeCallbacks.forEach((callback) => callback()))
    expect(flow.style.getPropertyValue('--progress-fill')).toBe('650px')
  })

  it('falls back to window resize without ResizeObserver', async () => {
    mockRects()
    vi.stubGlobal('ResizeObserver', undefined)
    const { container } = render(<Harness rebindKey="content-owners" />)
    await waitFor(() => expect(observers).toHaveLength(1))
    activateStage04(container)
    const flow = container.firstElementChild as HTMLElement
    nodeOffset = 70
    act(() => { window.dispatchEvent(new Event('resize')) })
    expect(flow.style.getPropertyValue('--progress-fill')).toBe('670px')
  })

  it('re-measures when the content key changes without rebinding observers', async () => {
    mockRects()
    vi.stubGlobal('ResizeObserver', undefined)
    const { container, rerender } = render(<Harness rebindKey="content-owners" measureKey="chat:" />)
    await waitFor(() => expect(observers).toHaveLength(1))
    activateStage04(container)
    const flow = container.firstElementChild as HTMLElement
    nodeOffset = 40
    rerender(<Harness rebindKey="content-owners" measureKey="chat:1" />)
    expect(flow.style.getPropertyValue('--progress-fill')).toBe('640px')
    expect(observers).toHaveLength(1)
  })

  it('disconnects and rebinds when the key changes', async () => {
    const { rerender } = render(<Harness rebindKey="content-owners" />)
    await waitFor(() => expect(observers).toHaveLength(1))
    rerender(<Harness rebindKey="brands" />)
    await waitFor(() => expect(observers).toHaveLength(2))
    expect(observers[0].disconnect).toHaveBeenCalledTimes(1)
    expect(observers[1].observe).toHaveBeenCalledTimes(5)
  })

  it('returns zero without IntersectionObserver', () => {
    vi.stubGlobal('IntersectionObserver', undefined)
    render(<Harness rebindKey="content-owners" />)
    expect(screen.getByTestId('active-index')).toHaveTextContent('0')
  })
})
