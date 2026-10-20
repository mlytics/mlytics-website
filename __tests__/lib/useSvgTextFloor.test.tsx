import { render } from '@testing-library/react'
import { useRef } from 'react'
import { useSvgTextFloor } from '@/lib/useSvgTextFloor'

let roCallback: (() => void) | null = null
beforeEach(() => {
  roCallback = null
  globalThis.ResizeObserver = class {
    constructor(cb: () => void) { roCallback = cb }
    observe() {}
    disconnect() {}
  } as unknown as typeof ResizeObserver
})

function setSize(svg: SVGSVGElement, w: number, h: number) {
  Object.defineProperty(svg, 'clientWidth', { configurable: true, value: w })
  Object.defineProperty(svg, 'clientHeight', { configurable: true, value: h })
}

function Chart({ onSvg }: { onSvg: (s: SVGSVGElement) => void }) {
  const ref = useRef<SVGSVGElement | null>(null)
  useSvgTextFloor(ref)
  return (
    <svg ref={(el) => { ref.current = el; if (el) onSvg(el) }} viewBox="0 0 400 200">
      <text fontSize="10">small</text>
      <text fontSize="30">big</text>
    </svg>
  )
}

it('enlarges only text whose on-screen size is below 12px', () => {
  let svg!: SVGSVGElement
  render(<Chart onSvg={(s) => { svg = s; setSize(s, 200, 100) }} />) // scale 0.5
  const [small, big] = svg.querySelectorAll('text')
  expect(small.style.fontSize).toBe('24px') // 10×0.5=5 → 12/0.5
  expect(big.style.fontSize).toBe('')       // 30×0.5=15 ≥ 12
})

it('clears the override when the chart grows past the floor', () => {
  let svg!: SVGSVGElement
  render(<Chart onSvg={(s) => { svg = s; setSize(s, 200, 100) }} />)
  const small = svg.querySelectorAll('text')[0]
  setSize(svg, 800, 400) // scale 2 → 20
  roCallback!()
  expect(small.style.fontSize).toBe('')
  expect(small.getAttribute('data-base-font-size')).toBe('10')
})

it('uses the tighter axis when letterboxed (meet)', () => {
  let svg!: SVGSVGElement
  render(<Chart onSvg={(s) => { svg = s; setSize(s, 400, 100) }} />) // x 1.0, y 0.5
  expect(svg.querySelectorAll('text')[0].style.fontSize).toBe('24px')
})

describe('with a media query', () => {
  let matches = false
  let changeListener: (() => void) | null = null
  const originalMatchMedia = window.matchMedia
  beforeEach(() => {
    matches = false
    changeListener = null
    window.matchMedia = ((query: string) => ({
      get matches() { return matches },
      media: query,
      addEventListener: (_: string, cb: () => void) => { changeListener = cb },
      removeEventListener: () => { changeListener = null },
    })) as unknown as typeof window.matchMedia
  })
  afterEach(() => { window.matchMedia = originalMatchMedia })

  function MediaChart({ onSvg }: { onSvg: (s: SVGSVGElement) => void }) {
    const ref = useRef<SVGSVGElement | null>(null)
    useSvgTextFloor(ref, { media: '(min-width: 48rem)' })
    return (
      <svg ref={(el) => { ref.current = el; if (el) onSvg(el) }} viewBox="0 0 400 200">
        <text fontSize="10">small</text>
      </svg>
    )
  }

  it('leaves the authored size when the media query does not match', () => {
    let svg!: SVGSVGElement
    render(<MediaChart onSvg={(s) => { svg = s; setSize(s, 200, 100) }} />) // scale 0.5
    expect(svg.querySelectorAll('text')[0].style.fontSize).toBe('')
  })

  it('applies the floor once the media query starts matching', () => {
    let svg!: SVGSVGElement
    render(<MediaChart onSvg={(s) => { svg = s; setSize(s, 200, 100) }} />)
    const small = svg.querySelectorAll('text')[0]
    expect(small.style.fontSize).toBe('')
    matches = true
    changeListener!()
    expect(small.style.fontSize).toBe('24px')
  })
})

it('skips text marked data-text-floor="off" and still enlarges the rest', () => {
  let svg!: SVGSVGElement
  function OptOutChart() {
    const ref = useRef<SVGSVGElement | null>(null)
    useSvgTextFloor(ref)
    return (
      <svg ref={(el) => { ref.current = el; if (el) { svg = el; setSize(el, 200, 100) } }} viewBox="0 0 400 200">
        <text fontSize="10" data-text-floor="off">kept</text>
        <text fontSize="10">enlarged</text>
      </svg>
    )
  }
  render(<OptOutChart />) // scale 0.5
  const [kept, enlarged] = svg.querySelectorAll('text')
  expect(kept.style.fontSize).toBe('')
  expect(enlarged.style.fontSize).toBe('24px')
})
