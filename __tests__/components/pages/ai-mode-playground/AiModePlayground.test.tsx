import { readFileSync } from 'node:fs'
import { act, cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, afterEach, describe, expect, it, vi } from 'vitest'
import AiModePlaygroundPage from '@/app/ai-mode-playground/page'
import { AiModePlayground } from '@/components/pages/ai-mode-playground/AiModePlayground'

const pageSource = readFileSync('app/ai-mode-playground/page.tsx', 'utf8')
const playgroundCss = readFileSync('components/pages/ai-mode-playground/AiModePlayground.module.css', 'utf8')
const pageCss = readFileSync('app/ai-mode-playground/AiModePlaygroundPage.module.css', 'utf8')

function getTab(name: RegExp) {
  return screen.getByRole('tab', { name })
}

function getLens(name: RegExp) {
  return screen.getByRole('tab', { name })
}

// Both tablists on the page are made of `role="tab"`, so any count of the mode
// tabs has to be scoped to the mode tablist rather than the whole document.
function modeTabs() {
  return within(screen.getByRole('tablist', { name: /ai mode experiences/i })).getAllByRole('tab')
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

describe('AiModePlaygroundPage', () => {
  it('wraps the Hero and playground in one white route surface', () => {
    const { container } = render(<AiModePlaygroundPage />)

    const routeSurface = container.firstElementChild
    expect(routeSurface).toHaveClass('section-white')
    expect(routeSurface).toContainElement(screen.getByRole('heading', {
      level: 1,
      name: 'One signal. Two values.',
    }))
    expect(routeSurface).toContainElement(screen.getByRole('region', { name: 'Mlytics AI Mode playground' }))
  })

  it('keeps the complete Hero copy inside a route-scoped Hero', () => {
    render(<AiModePlaygroundPage />)

    const heading = screen.getByRole('heading', {
      level: 1,
      name: 'One signal. Two values.',
    })
    const hero = heading.closest('section')

    expect(hero).toHaveClass('ai-mode-playground-hero')
    expect(within(hero as HTMLElement).getByText('Mlytics AI Mode', { exact: true })).toBeInTheDocument()
    expect(within(hero as HTMLElement).getByText(
      'Explore how Mlytics AI Mode helps users ask, decide, and listen — while giving you a clear view of the value created.',
      { exact: true },
    )).toBeInTheDocument()
    expect(within(hero as HTMLElement).queryByText(
      'Local interaction demo · no live AI/API call',
      { exact: true },
    )).not.toBeInTheDocument()
    expect(pageSource).not.toMatch(/WorldMapDots/)
  })

  // The Hero and the "Try the experience" section read as near-duplicates of
  // each other: same white ground, same centred eyebrow-plus-heading stack, a
  // short scroll apart. Going dark, the way /content-owners/ does, is what
  // separates them.
  it('Hero 走深色底，與 /content-owners/ 同一組 token', () => {
    render(<AiModePlaygroundPage />)
    const hero = screen.getByRole('heading', { level: 1, name: 'One signal. Two values.' }).closest('section')

    expect(hero).toHaveClass('section-dark')
    expect(hero).not.toHaveClass('section-white')
    expect(screen.getByRole('heading', { level: 1, name: 'One signal. Two values.' })).toHaveClass('text-white', 'text-4xl', 'md:text-5xl')
    expect(within(hero as HTMLElement).getByText('Mlytics AI Mode', { exact: true })).toHaveStyle({ color: 'var(--color-on-dark)' })
  })

  it('為淺色 Hero 設計的漸層背景已移除', () => {
    render(<AiModePlaygroundPage />)

    expect(pageSource).not.toMatch(/heroBackdrop|heroGradient/)
    expect(pageCss).not.toMatch(/\.heroBackdrop|\.heroGradient/)
    expect(pageCss).not.toMatch(/\.hero\s*\{[^}]*background:\s*var\(--bg-white\)/)
  })
})

describe('AiModePlayground', () => {
  it('starts in Chat with three article questions and a disabled More to come tab', () => {
    render(<AiModePlayground />)

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

    render(<AiModePlayground />)
    expect(modeTabs()).toHaveLength(4)
    expect(getTab(/more to come/i)).toBeDisabled()
  })

  it('佔位 tab 是第四顆，帶完整的 disabled 語意與 Coming soon 小字', () => {
    render(<AiModePlayground />)
    const tabs = modeTabs()
    const placeholder = tabs[3]

    expect(placeholder).toBe(getTab(/more to come/i))
    expect(placeholder).toHaveAttribute('aria-selected', 'false')
    expect(placeholder).toHaveAttribute('aria-disabled', 'true')
    expect(placeholder).toBeDisabled()
    expect(placeholder.querySelector('small')?.textContent).toBe('Coming soon')
    expect(tabs.slice(0, 3).every((t) => !(t as HTMLButtonElement).disabled)).toBe(true)
  })

  it('佔位 tab 取代那行說明文字，且 disabled 態用 token 上色', () => {
    render(<AiModePlayground />)
    expect(screen.queryByText(/more modes coming soon/i)).not.toBeInTheDocument()
    expect(playgroundCss).not.toMatch(/\.modeNote/)
    expect(playgroundCss).toMatch(/\.modeTabs button:disabled\s*\{[^}]*color:\s*var\(--color-ink-subtle\)/)
  })

  // The card outline around the article repeated a boundary the subheader's
  // bottom rule already draws, and a rounded card inside a rounded workspace
  // read as a box in a box.
  it('文章卡不再有圓弧邊框，分界交給 userSubheader 的底線', () => {
    expect(playgroundCss).not.toMatch(/\.article\s*\{[^}]*border:/)
    expect(playgroundCss).not.toMatch(/\.article\s*\{[^}]*border-radius:/)
    expect(playgroundCss).toMatch(/\.article\s*\{[^}]*background:\s*var\(--bg-white\)/)
    expect(playgroundCss).toMatch(/\.article\s*\{[^}]*padding:\s*30px\s+34px\s+38px/)
    expect(playgroundCss).toMatch(/\.userSubheader\s*\{[^}]*border-bottom:\s*1px solid/)
  })

  it('renders Start over as a playground-level control instead of inside SignalLedger', () => {
    render(<AiModePlayground />)

    const reset = screen.getByRole('button', { name: /start over/i })
    expect(reset.closest('aside')).toBeNull()
    expect(reset.closest('section[aria-label="Mlytics AI Mode playground"]')).toBeInTheDocument()
  })

  it('keeps the route surface aligned with the hosted layout baseline', () => {
    render(<AiModePlayground />)

    const playground = screen.getByRole('region', { name: 'Mlytics AI Mode playground' })
    const reset = screen.getByRole('button', { name: /start over/i })

    expect(playgroundCss).toMatch(/\.container\s*\{\s*width:\s*min\(1152px,\s*calc\(100%\s*-\s*48px\)\);/)
    expect(playgroundCss).toMatch(/\.playgroundSection\s*\{[^}]*padding:\s*80px\s+0\s+5\.5rem;/)
    expect(playgroundCss).not.toMatch(/\.playgroundSection\s*\{\s*padding-top:\s*3rem;/)
    expect(playgroundCss).toMatch(/\.sectionIntro\s*\{[^}]*display:\s*grid;[^}]*align-items:\s*start;[^}]*grid-template-columns:\s*1fr;[^}]*gap:\s*1rem;/)
    expect(playgroundCss).toMatch(/\.sectionIntro\s*\{[^}]*justify-items:\s*center;[^}]*text-align:\s*center;/)
    const introHeading = screen.getByRole('heading', { level: 2, name: 'A small surface for a big shift.' })
    const introDescription = screen.getByText('Choose a mode to see how one article can meet different user intent.', { exact: true })
    expect(introHeading).toHaveClass('section-heading', 'text-ink')
    expect(introDescription).toHaveClass('text-base', 'leading-relaxed', 'text-ink-muted', 'max-w-xl', 'mx-auto')
    expect(playgroundCss).not.toMatch(/\.sectionIntro h2\s*\{/)
    expect(playgroundCss).not.toMatch(/\.sectionIntro p\s*\{/)
    expect(playgroundCss).not.toMatch(/@media\s*\(max-width:\s*680px\)[\s\S]*\.sectionIntro\s*\{[^}]*grid-template-columns:/)
    expect(playgroundCss).not.toMatch(/@media\s*\(max-width:\s*680px\)[\s\S]*\.sectionIntro p\s*\{[^}]*max-width:\s*none;/)
    expect(playgroundCss).toMatch(/\.modeLabel\s*\{[^}]*display:\s*none/)
    expect(playgroundCss).toMatch(/\.modeTabs\s*\{[^}]*grid-template-columns:\s*repeat\(4,\s*minmax\(0,\s*1fr\)\)/)
    expect(playgroundCss).toMatch(/\.userPanel\s*\{[^}]*padding:\s*0/)
    expect(playgroundCss).toMatch(/\.article\s*\{[^}]*padding:\s*30px\s+34px\s+38px/)
    expect(playgroundCss).toMatch(/\.articleContext\s*\{[^}]*margin:\s*-30px\s+-34px\s+24px/)
    expect(playgroundCss).toMatch(/\.ledgerBody\s*\{[^}]*padding:\s*0\s+20px\s+20px/)
    expect(playgroundCss).toMatch(/\.metrics\s*\{[^}]*margin:\s*0\s+-20px/)
    expect(playgroundCss).toMatch(/\.eventStream\s*\{[^}]*gap:\s*0/)
    expect(playgroundCss).toMatch(/\.startOver\s*\{[^}]*position:\s*absolute[^}]*right:\s*14px[^}]*bottom:\s*14px/)
    expect(reset.parentElement).toBe(playground)
  })

  it('keeps the hosted widget footer exact and collapses an empty chat status', () => {
    render(<AiModePlayground />)

    expect(screen.getByText('POWERED BY MLYTICS AI', { exact: true })).toBeInTheDocument()
    expect(screen.queryByText('POWERED BY MLYTICS AI · NO LIVE AI/API CALL', { exact: true })).not.toBeInTheDocument()
    expect(playgroundCss).toMatch(/\.widgetStatus:empty\s*\{[^}]*min-height:\s*0\s*;/)
  })

  it('shows the selected Chat answer and lets the user ask another question', async () => {
    const user = userEvent.setup()
    render(<AiModePlayground />)

    await user.click(screen.getByRole('button', { name: /at what age should a large-breed dog/i }))

    expect(screen.getByText(/the senior threshold can arrive earlier/i)).toBeInTheDocument()
    expect(screen.getByText('Thornwell Senior Joint Formula')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /ask another question/i })).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /ask another question/i }))
    expect(screen.getByRole('button', { name: /which joint-support ingredients/i })).toBeInTheDocument()
  })

  it('shows a distinct answer for the joint-support ingredients question', async () => {
    const user = userEvent.setup()
    render(<AiModePlayground />)

    await user.click(screen.getByRole('button', { name: /which joint-support ingredients/i }))

    expect(screen.getByText(/does not name a single joint-support ingredient/i)).toBeInTheDocument()
    expect(screen.queryByText(/the senior threshold can arrive earlier/i)).not.toBeInTheDocument()
  })

  it('shows a distinct answer for the stiffness-after-walks question', async () => {
    const user = userEvent.setup()
    render(<AiModePlayground />)

    await user.click(screen.getByRole('button', { name: /is stiffness after walks/i }))

    expect(screen.getByText(/slower walk, stiffness after resting, or avoiding the stairs/i)).toBeInTheDocument()
    expect(screen.queryByText(/does not name a single joint-support ingredient/i)).not.toBeInTheDocument()
  })

  it('requires a quote and feedback before generating a two-column quote preview', async () => {
    const user = userEvent.setup()
    render(<AiModePlayground />)
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
    render(<AiModePlayground />)
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
    render(<AiModePlayground />)
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

  it('projects the same raw events differently in Media and Brand lenses', async () => {
    const user = userEvent.setup()
    render(<AiModePlayground />)
    await user.click(screen.getByRole('button', { name: /at what age should a large-breed dog/i }))

    await user.click(getLens(/media and content/i))
    expect(getLens(/media and content/i)).toHaveAttribute('aria-selected', 'true')
    expect(document.getElementById('lens-panel-content-owners')).not.toHaveAttribute('hidden')
    expect(screen.getByText('Topic preference captured')).toBeInTheDocument()
    expect(screen.getByText(/user relationship grow/i)).toBeInTheDocument()

    await user.click(getLens(/^brand/i))
    expect(getLens(/^brand/i)).toHaveAttribute('aria-selected', 'true')
    expect(document.getElementById('lens-panel-brands')).not.toHaveAttribute('hidden')
    expect(screen.getByText('Active need surfaced')).toBeInTheDocument()
    expect(screen.getByText(/demand behind the interaction/i)).toBeInTheDocument()
  })

  it('renders the hosted listen waveform density', async () => {
    const user = userEvent.setup()
    render(<AiModePlayground />)
    await user.click(getTab(/listen/i))

    expect(screen.getByTestId('ai-mode-waveform').children).toHaveLength(70)
  })

  it('emits quote resonance on selection and amplification only after generation', async () => {
    const user = userEvent.setup()
    render(<AiModePlayground />)
    await user.click(getTab(/make a quote/i))
    await waitFor(() => expect(screen.getByRole('button', { name: /start over/i })).toBeEnabled())
    await user.click(screen.getByRole('button', { name: /weight and cumulative joint load/i }))
    const activeLedger = within(document.getElementById('lens-panel-brands') as HTMLElement)

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

    render(<AiModePlayground />)
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
      ({ unmount } = render(<AiModePlayground />))

      const playground = screen.getByRole('region', { name: 'Mlytics AI Mode playground' })
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
      ({ unmount } = render(<AiModePlayground />))

      const playground = screen.getByRole('region', { name: 'Mlytics AI Mode playground' })
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
      ({ unmount } = render(<AiModePlayground />))

      const playground = screen.getByRole('region', { name: 'Mlytics AI Mode playground' })
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
      render(<AiModePlayground />)
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
      render(<AiModePlayground />)
      const playground = screen.getByRole('region', { name: 'Mlytics AI Mode playground' })
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
    render(<AiModePlayground />)
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

    render(<AiModePlayground />)
    const widget = screen.getByTestId('ai-mode-widget')
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
      render(<AiModePlayground />)
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
      render(<AiModePlayground />)
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

describe('AiModePlayground attribute-level naming', () => {
  it('attribute 層也不殘留 Cortex（textContent 抓不到這些）', () => {
    const { container } = render(<AiModePlayground />)
    expect(container.innerHTML).not.toMatch(/cortex/i)
  })

  it('playground 容器的 aria-label 與 Task 9 的 Playwright 選擇器一致', () => {
    const { container } = render(<AiModePlayground />)
    expect(container.querySelector('[aria-label="Mlytics AI Mode playground"]')).not.toBeNull()
  })
})

describe('AI Mode Playground 詞彙', () => {
  it('整頁不出現 reader / publisher / Cortex', () => {
    const { container } = render(<AiModePlayground />)
    expect(container.textContent).not.toMatch(/reader|publisher|cortex/i)
  })

  it('attribute 層也不殘留 reader / publisher / Cortex', () => {
    const { container } = render(<AiModePlayground />)
    expect(container.innerHTML).not.toMatch(/reader|publisher|cortex/i)
  })

  it('讀者欄標題改為 What the user sees', () => {
    const { getByText } = render(<AiModePlayground />)
    expect(getByText(/what the user sees/i)).toBeInTheDocument()
  })

  it('左欄標示為 MEDIA ARTICLE', () => {
    const { getByText } = render(<AiModePlayground />)
    expect(getByText('MEDIA ARTICLE')).toBeInTheDocument()
  })
})

describe('右欄首視線與裝飾標籤精簡（Task 11）', () => {
  it('右欄在未互動時就顯示引導，而不是只有空的 metrics 列', () => {
    const { getAllByText } = render(<AiModePlayground />)
    const guides = getAllByText(/nothing captured yet/i)
    expect(guides.some((node) => node.closest('[hidden]') === null)).toBe(true)
  })

  it('ledgerPanel 排在 metrics 之上，讓 heading 與引導成為首視線', () => {
    expect(playgroundCss).toMatch(/\.ledgerPanel\s*\{[^}]*order:\s*0/)
    expect(playgroundCss).toMatch(/\.metrics\s*\{[^}]*order:\s*1/)
  })

  it('已移除純裝飾的 Source story 標籤', () => {
    const { queryByText } = render(<AiModePlayground />)
    expect(queryByText(/^source story$/i)).not.toBeInTheDocument()
  })

  it('已移除 LIVE PLAYGROUND 裝飾標籤（由 CSS ::after 產生，DOM 查不到）', () => {
    expect(playgroundCss).not.toMatch(/live playground/i)
  })

  it('MEDIA ARTICLE 保留——它說明左欄是媒體方的原生文章', () => {
    const { getByText } = render(<AiModePlayground />)
    expect(getByText('MEDIA ARTICLE')).toBeInTheDocument()
  })
})
