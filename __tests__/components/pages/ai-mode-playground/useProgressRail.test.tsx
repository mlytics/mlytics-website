import { act, render, screen, waitFor } from '@testing-library/react'
import { useRef } from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { useProgressRail } from '@/components/pages/ai-mode-playground/useProgressRail'

let observers: Array<{ callback: IntersectionObserverCallback; observe: ReturnType<typeof vi.fn>; disconnect: ReturnType<typeof vi.fn> }> = []

function Harness({ rebindKey }: { rebindKey: string }) {
  const flowRef = useRef<HTMLDivElement>(null)
  const activeIndex = useProgressRail(flowRef, rebindKey)
  return (
    <div ref={flowRef}>
      {['01', '02', '03', '04', '05'].map((stage) => <section data-stage={stage} key={stage} />)}
      <output data-testid="active-index">{activeIndex}</output>
    </div>
  )
}

beforeEach(() => {
  observers = []
  vi.stubGlobal('IntersectionObserver', vi.fn(function IntersectionObserver(callback: IntersectionObserverCallback) {
    const observer = { callback, observe: vi.fn(), disconnect: vi.fn() }
    observers.push(observer)
    return observer
  }))
})

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('useProgressRail', () => {
  it('observes five stages and updates the active index and fill', async () => {
    const { container } = render(<Harness rebindKey="content-owners" />)
    await waitFor(() => expect(observers).toHaveLength(1))
    expect(observers[0].observe).toHaveBeenCalledTimes(5)

    const stage = container.querySelector('[data-stage="04"]')!
    const flow = container.firstElementChild as HTMLElement
    act(() => {
      observers[0].callback([{ target: stage, isIntersecting: true } as IntersectionObserverEntry], {} as IntersectionObserver)
    })

    expect(screen.getByTestId('active-index')).toHaveTextContent('3')
    expect(flow.style.getPropertyValue('--progress-fill')).toBe('0px')
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
