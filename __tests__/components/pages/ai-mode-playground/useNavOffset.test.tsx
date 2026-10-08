import { render } from '@testing-library/react'
import { useRef } from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { useNavOffset } from '@/components/pages/ai-mode-playground/useNavOffset'

const VAR = '--playground-sticky-top'

let frames: Array<FrameRequestCallback> = []
let navBottom = 65
let nav: HTMLElement
let sheet: HTMLStyleElement

function flushFrame() {
  const pending = frames
  frames = []
  pending.forEach((callback) => callback(performance.now()))
}

function flushAll(limit = 200) {
  let count = 0
  while (frames.length && count < limit) {
    flushFrame()
    count += 1
  }
  return count
}

function Harness() {
  const rootRef = useRef<HTMLDivElement>(null)
  useNavOffset(rootRef)
  return <div ref={rootRef} className="root" data-testid="root" />
}

function transition(type: 'transitionrun' | 'transitionend' | 'transitioncancel', target: Element = nav, propertyName = 'transform') {
  const event = new Event(type, { bubbles: true }) as TransitionEvent
  Object.defineProperty(event, 'propertyName', { value: propertyName })
  target.dispatchEvent(event)
}

const value = (root: HTMLElement) => root.style.getPropertyValue(VAR)

beforeEach(() => {
  frames = []
  navBottom = 65
  sheet = document.createElement('style')
  sheet.textContent = `.root { ${VAR}: 65px; }`
  document.head.appendChild(sheet)
  nav = document.createElement('nav')
  nav.style.position = 'fixed'
  nav.innerHTML = '<a href="/">link</a>'
  vi.spyOn(nav, 'getBoundingClientRect').mockImplementation(() => ({ bottom: navBottom } as DOMRect))
  document.body.appendChild(nav)
  vi.stubGlobal('requestAnimationFrame', vi.fn((callback: FrameRequestCallback) => {
    frames.push(callback)
    return frames.length
  }))
  vi.stubGlobal('cancelAnimationFrame', vi.fn(() => { frames = [] }))
})

afterEach(() => {
  nav.remove()
  sheet.remove()
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
})

describe('useNavOffset', () => {
  it('writes the visible nav bottom on mount', () => {
    const { getByTestId } = render(<Harness />)
    expect(value(getByTestId('root'))).toBe('65px')
  })

  it('follows the nav to 0 when it hides on scroll, clamping negative bottoms', () => {
    const { getByTestId } = render(<Harness />)
    navBottom = -65
    window.dispatchEvent(new Event('scroll'))
    expect(value(getByTestId('root'))).toBe('65px')
    flushFrame()
    expect(value(getByTestId('root'))).toBe('0px')
  })

  it('throttles scroll to one frame request at a time', () => {
    render(<Harness />)
    window.dispatchEvent(new Event('scroll'))
    window.dispatchEvent(new Event('scroll'))
    window.dispatchEvent(new Event('scroll'))
    expect(frames).toHaveLength(1)
  })

  it('tracks every frame of the nav transition and stops polling after it ends', () => {
    const { getByTestId } = render(<Harness />)
    const root = getByTestId('root')
    transition('transitionrun')
    for (const bottom of [50, 30, 10]) {
      navBottom = bottom
      flushFrame()
      expect(value(root)).toBe(`${bottom}px`)
    }
    // Still running while the value holds steady: keep polling.
    flushFrame(); flushFrame(); flushFrame(); flushFrame()
    expect(frames).toHaveLength(1)
    navBottom = 0
    transition('transitionend')
    expect(flushAll()).toBeLessThan(10)
    expect(value(root)).toBe('0px')
    expect(frames).toHaveLength(0)
  })

  it('treats transitioncancel as the end of the transition', () => {
    render(<Harness />)
    transition('transitionrun')
    transition('transitioncancel')
    expect(flushAll()).toBeLessThan(10)
  })

  it('ignores transitions bubbling up from inside the nav', () => {
    render(<Harness />)
    transition('transitionrun', nav.querySelector('a')!, 'color')
    expect(frames).toHaveLength(0)
  })

  it('never exceeds the stylesheet default, so an open mobile menu cannot push the shell down', () => {
    const { getByTestId } = render(<Harness />)
    navBottom = 400
    window.dispatchEvent(new Event('resize'))
    flushFrame()
    expect(value(getByTestId('root'))).toBe('65px')
  })

  it('removes listeners, pending frames, and the inline value on unmount', () => {
    const { getByTestId, unmount } = render(<Harness />)
    const root = getByTestId('root')
    window.dispatchEvent(new Event('scroll'))
    unmount()
    expect(cancelAnimationFrame).toHaveBeenCalled()
    expect(value(root)).toBe('')
    window.dispatchEvent(new Event('scroll'))
    transition('transitionrun')
    expect(frames).toHaveLength(0)
  })

  for (const type of ['scroll', 'resize'] as const) {
    it(`stops listening to window ${type} after unmount`, () => {
      const { unmount } = render(<Harness />)
      // Mount writes synchronously and queues no frame, so a still-attached
      // listener would queue one on the next event.
      expect(frames).toHaveLength(0)
      unmount()
      window.dispatchEvent(new Event(type))
      expect(frames).toHaveLength(0)
    })
  }

  it('does nothing when there is no fixed nav', () => {
    nav.style.position = 'static'
    const { getByTestId } = render(<Harness />)
    window.dispatchEvent(new Event('scroll'))
    expect(frames).toHaveLength(0)
    expect(value(getByTestId('root'))).toBe('')
  })
})
