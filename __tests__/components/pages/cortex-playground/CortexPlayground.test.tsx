import { readFileSync } from 'node:fs'
import { act, cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, afterEach, describe, expect, it, vi } from 'vitest'
import CortexPlaygroundPage from '@/app/cortex-playground/page'
import { CortexPlayground } from '@/components/pages/cortex-playground/CortexPlayground'

const pageSource = readFileSync('app/cortex-playground/page.tsx', 'utf8')
const playgroundCss = readFileSync('components/pages/cortex-playground/CortexPlayground.module.css', 'utf8')

function getTab(name: RegExp) {
  return screen.getByRole('tab', { name })
}

let intersectionObserverCallback: IntersectionObserverCallback | null = null

beforeEach(() => {
  intersectionObserverCallback = null
  vi.stubGlobal('IntersectionObserver', vi.fn(function IntersectionObserver(callback: IntersectionObserverCallback) {
    intersectionObserverCallback = callback
    return { observe: vi.fn(), disconnect: vi.fn() }
  }))
  vi.stubGlobal('scrollTo', vi.fn())
})

afterEach(() => {
  cleanup()
  vi.useRealTimers()
  vi.restoreAllMocks()
  vi.unstubAllGlobals()
})

describe('CortexPlaygroundPage', () => {
  it('wraps the Hero and playground in one white route surface', () => {
    const { container } = render(<CortexPlaygroundPage />)

    const routeSurface = container.firstElementChild
    expect(routeSurface).toHaveClass('section-white')
    expect(routeSurface).toContainElement(screen.getByRole('heading', {
      level: 1,
      name: 'One signal. Two values.',
    }))
    expect(routeSurface).toContainElement(screen.getByRole('region', { name: 'Cortex Playground' }))
  })

  it('keeps the complete Hero copy inside a route-scoped Hero', () => {
    render(<CortexPlaygroundPage />)

    const heading = screen.getByRole('heading', {
      level: 1,
      name: 'One signal. Two values.',
    })
    const hero = heading.closest('section')

    expect(hero).toHaveClass('cortex-playground-hero')
    expect(within(hero as HTMLElement).getByText('Cortex Playground', { exact: true })).toBeInTheDocument()
    expect(within(hero as HTMLElement).getByText(
      'Explore how Cortex helps readers ask, decide, and listen — while giving publishers a clear view of the value created.',
      { exact: true },
    )).toBeInTheDocument()
    expect(within(hero as HTMLElement).queryByText(
      'Local interaction demo · no live AI/API call',
      { exact: true },
    )).not.toBeInTheDocument()
    expect(pageSource).not.toMatch(/WorldMapDots/)
  })
})

describe('CortexPlayground', () => {
  it('starts in Chat with three article questions and a disabled More to come tab', () => {
    render(<CortexPlayground />)

    expect(getTab(/^Chat/)).toHaveAttribute('aria-selected', 'true')
    for (const tab of screen.getAllByRole('tab').filter((item) => !item.hasAttribute('disabled'))) {
      const controlledId = tab.getAttribute('aria-controls')
      expect(controlledId).toBeTruthy()
      expect(document.getElementById(controlledId ?? '')).toBeInTheDocument()
    }
    expect(screen.getByRole('button', { name: /at what age should a large-breed dog/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /which joint-support ingredients/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /is stiffness after walks/i })).toBeInTheDocument()
    expect(getTab(/more to come/i)).toBeDisabled()
    expect(screen.getByText('00 EVENTS')).toBeInTheDocument()
  })

  it('keeps More to come desktop-only and makes tablet/mobile mode tabs horizontally scrollable', () => {
    expect(playgroundCss).toMatch(/\.modeTabs\s*\{[^}]*display:\s*grid;[^}]*grid-template-columns:\s*repeat\(4,\s*minmax\(0,\s*1fr\)\)/)
    expect(playgroundCss).toMatch(/\.modeTabs button\s*\{[^}]*white-space:\s*nowrap;/)
    expect(playgroundCss).toMatch(/@media\s*\(max-width:\s*1024px\)[\s\S]*\.modeTabs\s*\{[^}]*display:\s*flex;[^}]*flex-wrap:\s*nowrap;[^}]*overflow-x:\s*auto;/)
    expect(playgroundCss).toMatch(/@media\s*\(max-width:\s*1024px\)[\s\S]*\.modeTabs button\s*\{[^}]*flex:\s*0 0 clamp\(/)
    expect(playgroundCss).toMatch(/@media\s*\(max-width:\s*1024px\)[\s\S]*\.modeTabs button:last-child\s*\{[^}]*display:\s*none;/)

    render(<CortexPlayground />)
    expect(getTab(/more to come/i)).toBeDisabled()
  })

  it('renders Start over as a playground-level control instead of inside SignalLedger', () => {
    render(<CortexPlayground />)

    const reset = screen.getByRole('button', { name: /start over/i })
    expect(reset.closest('aside')).toBeNull()
    expect(reset.closest('section[aria-label="Cortex Playground"]')).toBeInTheDocument()
  })

  it('keeps the route surface aligned with the hosted layout baseline', () => {
    render(<CortexPlayground />)

    const playground = screen.getByRole('region', { name: 'Cortex Playground' })
    const reset = screen.getByRole('button', { name: /start over/i })

    expect(playgroundCss).toMatch(/\.container\s*\{\s*width:\s*min\(1152px,\s*calc\(100%\s*-\s*48px\)\);/)
    expect(playgroundCss).toMatch(/\.playgroundSection\s*\{[^}]*padding:\s*80px\s+0\s+5\.5rem;/)
    expect(playgroundCss).not.toMatch(/\.playgroundSection\s*\{\s*padding-top:\s*3rem;/)
    expect(playgroundCss).toMatch(/\.sectionIntro\s*\{[^}]*display:\s*grid;[^}]*align-items:\s*start;[^}]*grid-template-columns:\s*1fr;[^}]*gap:\s*1rem;/)
    expect(playgroundCss).toMatch(/\.sectionIntro\s*\{[^}]*justify-items:\s*center;[^}]*text-align:\s*center;/)
    const introHeading = screen.getByRole('heading', { level: 2, name: 'A small surface for a big shift.' })
    const introDescription = screen.getByText('Choose a mode to see how one article can meet different reader intent.', { exact: true })
    expect(introHeading).toHaveClass('section-heading', 'text-ink')
    expect(introDescription).toHaveClass('text-base', 'leading-relaxed', 'text-ink-muted', 'max-w-xl', 'mx-auto')
    expect(playgroundCss).not.toMatch(/\.sectionIntro h2\s*\{/)
    expect(playgroundCss).not.toMatch(/\.sectionIntro p\s*\{/)
    expect(playgroundCss).not.toMatch(/@media\s*\(max-width:\s*680px\)[\s\S]*\.sectionIntro\s*\{[^}]*grid-template-columns:/)
    expect(playgroundCss).not.toMatch(/@media\s*\(max-width:\s*680px\)[\s\S]*\.sectionIntro p\s*\{[^}]*max-width:\s*none;/)
    expect(playgroundCss).toMatch(/\.modeLabel\s*\{[^}]*display:\s*none/)
    expect(playgroundCss).toMatch(/\.modeTabs\s*\{[^}]*grid-template-columns:\s*repeat\(4,\s*minmax\(0,\s*1fr\)\)/)
    expect(playgroundCss).toMatch(/\.readerPanel\s*\{[^}]*padding:\s*0/)
    expect(playgroundCss).toMatch(/\.article\s*\{[^}]*padding:\s*30px\s+34px\s+38px/)
    expect(playgroundCss).toMatch(/\.articleContext\s*\{[^}]*margin:\s*-30px\s+-34px\s+24px/)
    expect(playgroundCss).toMatch(/\.ledgerBody\s*\{[^}]*padding:\s*0\s+20px\s+20px/)
    expect(playgroundCss).toMatch(/\.metrics\s*\{[^}]*margin:\s*0\s+-20px/)
    expect(playgroundCss).toMatch(/\.eventStream\s*\{[^}]*gap:\s*0/)
    expect(playgroundCss).toMatch(/\.startOver\s*\{[^}]*position:\s*absolute[^}]*right:\s*14px[^}]*bottom:\s*14px/)
    expect(reset.parentElement).toBe(playground)
  })

  it('keeps the hosted widget footer exact and collapses an empty chat status', () => {
    render(<CortexPlayground />)

    expect(screen.getByText('POWERED BY MLYTICS AI', { exact: true })).toBeInTheDocument()
    expect(screen.queryByText('POWERED BY MLYTICS AI · NO LIVE AI/API CALL', { exact: true })).not.toBeInTheDocument()
    expect(playgroundCss).toMatch(/\.widgetStatus:empty\s*\{[^}]*min-height:\s*0\s*;/)
  })

  it('shows the selected Chat answer and lets the reader ask another question', async () => {
    const user = userEvent.setup()
    render(<CortexPlayground />)

    await user.click(screen.getByRole('button', { name: /at what age should a large-breed dog/i }))

    expect(screen.getByText(/the senior threshold can arrive earlier/i)).toBeInTheDocument()
    expect(screen.getByText('Thornwell Senior Joint Formula')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /ask another question/i })).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /ask another question/i }))
    expect(screen.getByRole('button', { name: /which joint-support ingredients/i })).toBeInTheDocument()
  })

  it('shows a distinct answer for the joint-support ingredients question', async () => {
    const user = userEvent.setup()
    render(<CortexPlayground />)

    await user.click(screen.getByRole('button', { name: /which joint-support ingredients/i }))

    expect(screen.getByText(/does not name a single joint-support ingredient/i)).toBeInTheDocument()
    expect(screen.queryByText(/the senior threshold can arrive earlier/i)).not.toBeInTheDocument()
  })

  it('shows a distinct answer for the stiffness-after-walks question', async () => {
    const user = userEvent.setup()
    render(<CortexPlayground />)

    await user.click(screen.getByRole('button', { name: /is stiffness after walks/i }))

    expect(screen.getByText(/slower walk, stiffness after resting, or avoiding the stairs/i)).toBeInTheDocument()
    expect(screen.queryByText(/does not name a single joint-support ingredient/i)).not.toBeInTheDocument()
  })

  it('requires a quote and feedback before generating a two-column quote preview', async () => {
    const user = userEvent.setup()
    render(<CortexPlayground />)
    await user.click(getTab(/make a quote/i))
    await waitFor(() => expect(screen.getByRole('button', { name: /start over/i })).toBeEnabled())

    const generate = screen.getByRole('button', { name: /generate quote card/i })
    expect(generate).toBeDisabled()

    await user.click(screen.getByRole('button', { name: /the senior threshold can arrive earlier/i }))
    expect(generate).toBeDisabled()
    await user.click(screen.getByRole('radio', { name: 'Great' }))
    expect(generate).toBeEnabled()
    await user.type(screen.getByPlaceholderText('Add your name'), 'An Chou')
    await user.click(generate)

    expect(screen.getByRole('region', { name: /quote preview/i })).toBeInTheDocument()
    expect(screen.getAllByText('The senior threshold can arrive earlier than many owners expect.')).toHaveLength(2)
    expect(screen.queryByText('Dr. Maya Chen · Thornwell')).not.toBeInTheDocument()
    expect(screen.queryByText(/quote by/i)).not.toBeInTheDocument()
    expect(screen.queryByText(/local mock: your quote card is ready/i)).not.toBeInTheDocument()
    expect(screen.queryByText(/actions stay local to this mock/i)).not.toBeInTheDocument()
  })

  it('exposes icon-only LINE and Facebook quote actions with distinct triggers', async () => {
    const user = userEvent.setup()
    render(<CortexPlayground />)
    await user.click(getTab(/make a quote/i))
    await waitFor(() => expect(screen.getByRole('button', { name: /start over/i })).toBeEnabled())
    await user.click(screen.getByRole('button', { name: /the senior threshold can arrive earlier/i }))
    await user.click(screen.getByRole('radio', { name: 'Great' }))
    await user.click(screen.getByRole('button', { name: /generate quote card/i }))

    const line = screen.getByRole('button', { name: 'Share on LINE' })
    const facebook = screen.getByRole('button', { name: 'Share on Facebook' })
    const download = screen.getByRole('button', { name: 'Download' })
    expect(line.className).toContain('quoteActionLine')
    expect(facebook.className).toContain('quoteActionFacebook')
    expect(download.className).toContain('quoteActionDownload')
    expect(line).toHaveTextContent('')
    expect(facebook).toHaveTextContent('')

    await user.click(line)
    expect(screen.getByText(/LINE share recorded/i)).toBeInTheDocument()

    await user.click(facebook)
    expect(screen.getByText(/FB share recorded/i)).toBeInTheDocument()
  })

  it('simulates Listen progress and emits the sponsored attention business signal', async () => {
    vi.useFakeTimers()
    render(<CortexPlayground />)
    fireEvent.click(getTab(/listen/i))
    act(() => {
      vi.runOnlyPendingTimers()
    })
    fireEvent.click(screen.getByRole('button', { name: 'Play' }))

    act(() => {
      vi.advanceTimersByTime(13_000)
    })

    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '13')
    expect(screen.getByText(/sponsored attention qualified/i)).toBeInTheDocument()
  })

  it('projects the same raw events differently in Publisher and Brand lenses', async () => {
    const user = userEvent.setup()
    render(<CortexPlayground />)
    await user.click(screen.getByRole('button', { name: /at what age should a large-breed dog/i }))

    await user.click(getTab(/publisher/i))
    expect(getTab(/publisher/i)).toHaveAttribute('aria-controls', 'lens-panel-publisher')
    expect(document.getElementById('lens-panel-publisher')).toHaveAttribute('aria-labelledby', 'lens-publisher')
    expect(screen.getByText('Topic preference captured')).toBeInTheDocument()
    expect(screen.getByText(/reader relationship grow/i)).toBeInTheDocument()

    await user.click(getTab(/brand/i))
    expect(getTab(/brand/i)).toHaveAttribute('aria-controls', 'lens-panel-brand')
    expect(document.getElementById('lens-panel-brand')).toHaveAttribute('aria-labelledby', 'lens-brand')
    expect(screen.getByText('Active need surfaced')).toBeInTheDocument()
    expect(screen.getByText(/demand behind the interaction/i)).toBeInTheDocument()
  })

  it('renders the hosted listen waveform density', async () => {
    const user = userEvent.setup()
    render(<CortexPlayground />)
    await user.click(getTab(/listen/i))

    expect(screen.getByTestId('cortex-waveform').children).toHaveLength(70)
  })

  it('emits quote resonance on selection and amplification only after generation', async () => {
    const user = userEvent.setup()
    render(<CortexPlayground />)
    await user.click(getTab(/make a quote/i))
    await waitFor(() => expect(screen.getByRole('button', { name: /start over/i })).toBeEnabled())
    await user.click(screen.getByRole('button', { name: /weight and cumulative joint load/i }))
    const activeLedger = within(screen.getByRole('tabpanel', { name: /brand/i }))

    expect(activeLedger.getAllByText('CONTENT_RESONANCE')).toHaveLength(1)
    expect(activeLedger.queryByText('AMPLIFICATION_READY')).not.toBeInTheDocument()

    await user.click(screen.getByRole('radio', { name: 'Useful' }))
    await user.click(screen.getByRole('button', { name: /generate quote card/i }))

    expect(activeLedger.getAllByText('CONTENT_RESONANCE')).toHaveLength(1)
    expect(activeLedger.getAllByText('AMPLIFICATION_READY')).toHaveLength(1)
    expect(activeLedger.getByText('AMPLIFICATION_READY').compareDocumentPosition(activeLedger.getByText('CONTENT_RESONANCE')) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()

    await user.click(screen.getByRole('button', { name: /regenerate quote card/i }))
    expect(activeLedger.getAllByText('AMPLIFICATION_READY')).toHaveLength(1)
  })

  it('disables Start over while reset cleanup is pending', () => {
    vi.useFakeTimers()

    render(<CortexPlayground />)
    const reset = screen.getByRole('button', { name: /start over/i })
    fireEvent.click(reset)

    expect(reset).toBeDisabled()
    act(() => vi.runOnlyPendingTimers())
    expect(reset).toBeEnabled()
  })

  it('scrolls again in the post-reset animation frame after Start over', () => {
    vi.useFakeTimers()
    const originalRequestAnimationFrame = window.requestAnimationFrame
    let finishReset: FrameRequestCallback | null = null
    let unmount = () => {}
    Object.defineProperty(window, 'requestAnimationFrame', {
      configurable: true,
      writable: true,
      value: vi.fn((callback: FrameRequestCallback) => {
        finishReset = callback
        return 1
      }),
    })

    try {
      ({ unmount } = render(<CortexPlayground />))

      const playground = screen.getByRole('region', { name: 'Cortex Playground' })
      vi.spyOn(playground, 'getBoundingClientRect').mockReturnValue({
        top: 132,
        bottom: 632,
        height: 500,
        width: 100,
        left: 0,
        right: 100,
        x: 0,
        y: 132,
        toJSON: () => ({}),
      } as DOMRect)
      vi.spyOn(window, 'scrollY', 'get').mockReturnValue(240)

      fireEvent.click(screen.getByRole('button', { name: /start over/i }))

      expect(window.scrollTo).toHaveBeenCalledTimes(1)
      expect(window.scrollTo).toHaveBeenNthCalledWith(1, { top: 354, left: 0, behavior: 'auto' })

      act(() => finishReset?.(16))

      expect(window.scrollTo).toHaveBeenCalledTimes(2)
      expect(window.scrollTo).toHaveBeenNthCalledWith(2, { top: 354, left: 0, behavior: 'auto' })
      expect(window.scrollTo).not.toHaveBeenCalledWith({ top: 0, left: 0, behavior: 'auto' })
    } finally {
      unmount()
      Object.defineProperty(window, 'requestAnimationFrame', {
        configurable: true,
        writable: true,
        value: originalRequestAnimationFrame,
      })
    }
  })

  it('places the playground below the visible fixed site nav when resetting', () => {
    vi.useFakeTimers()
    const originalRequestAnimationFrame = window.requestAnimationFrame
    let finishReset: FrameRequestCallback | null = null
    let unmount = () => {}
    const siteNav = document.createElement('nav')
    siteNav.style.position = 'fixed'
    vi.spyOn(siteNav, 'getBoundingClientRect').mockReturnValue({
      top: 0,
      bottom: 65,
      height: 65,
      width: 100,
      left: 0,
      right: 100,
      x: 0,
      y: 0,
      toJSON: () => ({}),
    } as DOMRect)
    document.body.appendChild(siteNav)
    Object.defineProperty(window, 'requestAnimationFrame', {
      configurable: true,
      writable: true,
      value: vi.fn((callback: FrameRequestCallback) => {
        finishReset = callback
        return 1
      }),
    })

    try {
      ({ unmount } = render(<CortexPlayground />))

      const playground = screen.getByRole('region', { name: 'Cortex Playground' })
      vi.spyOn(playground, 'getBoundingClientRect').mockReturnValue({
        top: 132,
        bottom: 632,
        height: 500,
        width: 100,
        left: 0,
        right: 100,
        x: 0,
        y: 132,
        toJSON: () => ({}),
      } as DOMRect)
      vi.spyOn(window, 'scrollY', 'get').mockReturnValue(240)

      fireEvent.click(screen.getByRole('button', { name: /start over/i }))

      expect(window.scrollTo).toHaveBeenNthCalledWith(1, { top: 289, left: 0, behavior: 'auto' })

      act(() => finishReset?.(16))

      expect(window.scrollTo).toHaveBeenNthCalledWith(2, { top: 289, left: 0, behavior: 'auto' })
    } finally {
      unmount()
      siteNav.remove()
      Object.defineProperty(window, 'requestAnimationFrame', {
        configurable: true,
        writable: true,
        value: originalRequestAnimationFrame,
      })
    }
  })

  it('uses the hidden fixed site nav height when its transform moves it above the viewport', () => {
    vi.useFakeTimers()
    const originalRequestAnimationFrame = window.requestAnimationFrame
    let finishReset: FrameRequestCallback | null = null
    let unmount = () => {}
    const siteNav = document.createElement('nav')
    siteNav.style.position = 'fixed'
    vi.spyOn(siteNav, 'getBoundingClientRect').mockReturnValue({
      top: -65,
      bottom: 0,
      height: 65,
      width: 100,
      left: 0,
      right: 100,
      x: 0,
      y: -65,
      toJSON: () => ({}),
    } as DOMRect)
    document.body.appendChild(siteNav)
    Object.defineProperty(window, 'requestAnimationFrame', {
      configurable: true,
      writable: true,
      value: vi.fn((callback: FrameRequestCallback) => {
        finishReset = callback
        return 1
      }),
    })

    try {
      ({ unmount } = render(<CortexPlayground />))

      const playground = screen.getByRole('region', { name: 'Cortex Playground' })
      vi.spyOn(playground, 'getBoundingClientRect').mockReturnValue({
        top: 132,
        bottom: 632,
        height: 500,
        width: 100,
        left: 0,
        right: 100,
        x: 0,
        y: 132,
        toJSON: () => ({}),
      } as DOMRect)
      vi.spyOn(window, 'scrollY', 'get').mockReturnValue(240)

      fireEvent.click(screen.getByRole('button', { name: /start over/i }))

      expect(window.scrollTo).toHaveBeenNthCalledWith(1, { top: 289, left: 0, behavior: 'auto' })

      act(() => finishReset?.(16))

      expect(window.scrollTo).toHaveBeenNthCalledWith(2, { top: 289, left: 0, behavior: 'auto' })
    } finally {
      unmount()
      siteNav.remove()
      Object.defineProperty(window, 'requestAnimationFrame', {
        configurable: true,
        writable: true,
        value: originalRequestAnimationFrame,
      })
    }
  })

  it('completes mode reset with a timeout when requestAnimationFrame is unavailable', () => {
    vi.useFakeTimers()
    const originalRequestAnimationFrame = window.requestAnimationFrame
    Object.defineProperty(window, 'requestAnimationFrame', { configurable: true, writable: true, value: undefined })

    try {
      render(<CortexPlayground />)
      fireEvent.click(getTab(/make a quote/i))

      const reset = screen.getByRole('button', { name: /start over/i })
      expect(reset).toBeDisabled()

      act(() => {
        vi.runOnlyPendingTimers()
      })

      expect(reset).toBeEnabled()
      const quote = screen.getByRole('button', { name: /weight and cumulative joint load/i })
      fireEvent.click(quote)
      expect(quote).toHaveAttribute('aria-pressed', 'true')
    } finally {
      Object.defineProperty(window, 'requestAnimationFrame', { configurable: true, writable: true, value: originalRequestAnimationFrame })
    }
  })

  it('scrolls again in the post-reset timeout when requestAnimationFrame is unavailable', () => {
    vi.useFakeTimers()
    const originalRequestAnimationFrame = window.requestAnimationFrame
    Object.defineProperty(window, 'requestAnimationFrame', { configurable: true, writable: true, value: undefined })

    try {
      render(<CortexPlayground />)
      const playground = screen.getByRole('region', { name: 'Cortex Playground' })
      vi.spyOn(playground, 'getBoundingClientRect').mockReturnValue({
        top: 132,
        bottom: 632,
        height: 500,
        width: 100,
        left: 0,
        right: 100,
        x: 0,
        y: 132,
        toJSON: () => ({}),
      } as DOMRect)
      vi.spyOn(window, 'scrollY', 'get').mockReturnValue(240)

      fireEvent.click(screen.getByRole('button', { name: /start over/i }))

      expect(window.scrollTo).toHaveBeenCalledTimes(1)
      act(() => vi.runOnlyPendingTimers())

      expect(window.scrollTo).toHaveBeenCalledTimes(2)
      expect(window.scrollTo).toHaveBeenNthCalledWith(2, { top: 354, left: 0, behavior: 'auto' })
    } finally {
      Object.defineProperty(window, 'requestAnimationFrame', { configurable: true, writable: true, value: originalRequestAnimationFrame })
    }
  })

  it('fully resets state and returns to the initial Chat surface', async () => {
    const user = userEvent.setup()
    render(<CortexPlayground />)
    await user.click(screen.getByRole('button', { name: /at what age should a large-breed dog/i }))
    await user.click(getTab(/make a quote/i))
    await waitFor(() => expect(screen.getByRole('button', { name: /start over/i })).toBeEnabled())
    await user.click(screen.getByRole('button', { name: /weight and cumulative joint load/i }))
    await user.click(screen.getByRole('radio', { name: 'Useful' }))
    await user.type(screen.getByPlaceholderText('Add your name'), 'An Chou')

    await user.click(screen.getByRole('button', { name: /start over/i }))

    expect(getTab(/^Chat/)).toHaveAttribute('aria-selected', 'true')
    expect(screen.getByText('00 EVENTS')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /at what age should a large-breed dog/i })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /generate quote card/i })).not.toBeInTheDocument()
    expect(screen.queryByDisplayValue('An Chou')).not.toBeInTheDocument()
  })

  it('clears tracking metrics and ignores stale callbacks after reset', () => {
    vi.useFakeTimers()
    vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockReturnValue({
      top: 0,
      bottom: 100,
      height: 100,
      width: 100,
      left: 0,
      right: 100,
      x: 0,
      y: 0,
      toJSON: () => ({}),
    } as DOMRect)

    render(<CortexPlayground />)
    const widget = screen.getByTestId('cortex-widget')
    const mountedObserverCallback = intersectionObserverCallback

    fireEvent.wheel(window)
    fireEvent.scroll(window)
    expect(screen.getByText('100%')).toBeInTheDocument()
    act(() => {
      mountedObserverCallback?.([{ target: widget, isIntersecting: true } as unknown as IntersectionObserverEntry], {} as IntersectionObserver)
    })
    expect(screen.getByText('Captured')).toBeInTheDocument()

    const reset = screen.getByRole('button', { name: /start over/i })
    fireEvent.click(reset)

    expect(reset).toBeDisabled()
    expect(screen.getByText('00 EVENTS')).toBeInTheDocument()
    expect(screen.getByText('0%')).toBeInTheDocument()
    expect(screen.getByText('Waiting')).toBeInTheDocument()

    act(() => {
      mountedObserverCallback?.([{ target: widget, isIntersecting: true } as unknown as IntersectionObserverEntry], {} as IntersectionObserver)
      fireEvent.scroll(window)
      vi.runOnlyPendingTimers()
    })

    expect(screen.getByText('00 EVENTS')).toBeInTheDocument()
    expect(screen.getByText('0%')).toBeInTheDocument()
    expect(screen.getByText('Waiting')).toBeInTheDocument()
  })

  it('clears audio state and stops the old timer when reset starts', () => {
    vi.useFakeTimers()
    const originalRequestAnimationFrame = window.requestAnimationFrame
    Object.defineProperty(window, 'requestAnimationFrame', { configurable: true, writable: true, value: undefined })

    try {
      render(<CortexPlayground />)
      fireEvent.click(getTab(/listen/i))
      act(() => vi.runOnlyPendingTimers())
      fireEvent.click(screen.getByRole('button', { name: 'Play' }))
      act(() => vi.advanceTimersByTime(2_000))
      expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '2')

      const reset = screen.getByRole('button', { name: /start over/i })
      fireEvent.click(reset)
      expect(reset).toBeDisabled()
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument()

      act(() => {
        vi.advanceTimersByTime(5_000)
        vi.runAllTimers()
      })

      expect(screen.getByText('00 EVENTS')).toBeInTheDocument()
      expect(screen.queryByText(/sponsored attention qualified/i)).not.toBeInTheDocument()
    } finally {
      Object.defineProperty(window, 'requestAnimationFrame', { configurable: true, writable: true, value: originalRequestAnimationFrame })
    }
  })

  it('finishes reset after Listen playback when requestAnimationFrame is unavailable', () => {
    vi.useFakeTimers()
    const originalRequestAnimationFrame = window.requestAnimationFrame
    Object.defineProperty(window, 'requestAnimationFrame', { configurable: true, writable: true, value: undefined })

    try {
      render(<CortexPlayground />)
      fireEvent.click(getTab(/listen/i))
      act(() => vi.runOnlyPendingTimers())
      fireEvent.click(screen.getByRole('button', { name: 'Play' }))

      const reset = screen.getByRole('button', { name: /start over/i })
      fireEvent.click(reset)

      expect(reset).toBeDisabled()
      expect(getTab(/^Chat/)).toHaveAttribute('aria-selected', 'true')
      expect(screen.getByText('00 EVENTS')).toBeInTheDocument()
      expect(screen.getByText('0%')).toBeInTheDocument()
      expect(screen.getByText('Waiting')).toBeInTheDocument()

      act(() => vi.runOnlyPendingTimers())

      expect(reset).toBeEnabled()
    } finally {
      Object.defineProperty(window, 'requestAnimationFrame', { configurable: true, writable: true, value: originalRequestAnimationFrame })
    }
  })
})
