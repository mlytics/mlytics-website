import { readFileSync } from 'node:fs'
import { act, cleanup, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import AiModePlaygroundPage from '@/app/ai-mode-playground/page'
import { AiModePlayground } from '@/components/pages/ai-mode-playground/AiModePlayground'
import {
  ANNOUNCE,
  CHAT_QUESTIONS,
  EXPERIENCE_DEFAULT_OBSERVATION,
  EXPERIENCE_LABELS,
  HERO,
  LENS_LABELS,
  PATHS,
  UI,
} from '@/components/pages/ai-mode-playground/ai-mode-playground-copy'

let intersectionObserverCallback: IntersectionObserverCallback | null = null
let scrolledElement: HTMLElement | null = null

beforeEach(() => {
  window.history.replaceState({}, '', '/ai-mode-playground/')
  vi.stubGlobal('IntersectionObserver', vi.fn(function IntersectionObserver(callback: IntersectionObserverCallback) {
    intersectionObserverCallback = callback
    return { observe: vi.fn(), disconnect: vi.fn() }
  }))
  if (!HTMLElement.prototype.scrollIntoView) HTMLElement.prototype.scrollIntoView = () => {}
  vi.spyOn(HTMLElement.prototype, 'scrollIntoView').mockImplementation(function (this: HTMLElement) { scrolledElement = this })
  vi.stubGlobal('matchMedia', vi.fn(() => ({ matches: false, addListener: vi.fn(), removeListener: vi.fn() })))
})

afterEach(() => {
  cleanup()
  intersectionObserverCallback = null
  scrolledElement = null
  vi.useRealTimers()
  vi.restoreAllMocks()
  vi.unstubAllGlobals()
})

const experienceTab = (label: string) => screen.getByRole('tab', { name: label })
const customerTab = (label: string) => screen.getByRole('tab', { name: label })

function setupTimers() {
  vi.useFakeTimers({ shouldAdvanceTime: true })
  return userEvent.setup({ advanceTimers: (milliseconds) => vi.advanceTimersByTime(milliseconds) })
}

describe('AiModePlayground interactions', () => {
  it('captures a Chat answer, centres and focuses the raw signal, and announces it', async () => {
    const user = setupTimers()
    render(<AiModePlayground />)
    const focus = vi.spyOn(HTMLElement.prototype, 'focus')
    await user.click(screen.getByRole('button', { name: CHAT_QUESTIONS[0] }))
    await act(async () => { vi.runAllTimers() })
    const signal = document.getElementById('stage-02-copy')
    expect(scrolledElement).toBe(signal)
    expect(HTMLElement.prototype.scrollIntoView).toHaveBeenCalledTimes(1)
    expect(HTMLElement.prototype.scrollIntoView).toHaveBeenCalledWith({ block: 'center', behavior: 'smooth' })
    expect(focus.mock.contexts.filter((element) => element === signal)).toHaveLength(1)
    expect(focus.mock.calls[focus.mock.contexts.indexOf(signal)]).toEqual([{ preventScroll: true }])
    expect(signal).toHaveFocus()
    expect(screen.getByText(PATHS['content-owners'][0].chatVariants[0].question)).toBeInTheDocument()
    expect(screen.getAllByRole('status')).toHaveLength(1)
    expect(screen.getByRole('status')).toHaveTextContent(ANNOUNCE.chatAnswered)
  })

  it('switches the customer lens and announces whether a capture is present', async () => {
    const user = setupTimers()
    render(<AiModePlayground />)
    await user.click(screen.getByRole('button', { name: CHAT_QUESTIONS[0] }))
    await user.click(experienceTab(EXPERIENCE_LABELS.quote))
    await user.click(customerTab(LENS_LABELS.brands))
    await act(async () => { vi.runAllTimers() })
    // Only the current experience's capture counts: the Chat answer does not
    // make the switch "with capture" while Quote is open and empty.
    expect(screen.getByRole('status')).toHaveTextContent(ANNOUNCE.customerSwitched(LENS_LABELS.brands))
    await user.click(experienceTab(EXPERIENCE_LABELS.chat))
    expect(screen.getByText(PATHS.brands[0].chatVariants[0].question)).toBeInTheDocument()

    cleanup()
    // The first switch rewrote the URL to ?lens=brands; start the second
    // mount from the default lens again so the click is a real switch.
    window.history.replaceState({}, '', '/ai-mode-playground/')
    render(<AiModePlayground />)
    await user.click(customerTab(LENS_LABELS.brands))
    await act(async () => { vi.runAllTimers() })
    expect(screen.getByRole('status')).toHaveTextContent(ANNOUNCE.customerSwitched(LENS_LABELS.brands))
  })

  it('announces the lens switch with capture only when the current experience has one', async () => {
    const user = setupTimers()
    render(<AiModePlayground />)
    await user.click(screen.getByRole('button', { name: CHAT_QUESTIONS[0] }))
    await user.click(customerTab(LENS_LABELS.brands))
    await act(async () => { vi.runAllTimers() })
    expect(screen.getByRole('status')).toHaveTextContent(ANNOUNCE.customerSwitchedWithCapture)

    await user.click(experienceTab(EXPERIENCE_LABELS.quote))
    await user.click(screen.getByRole('button', { name: /Before you choose/ }))
    await user.click(customerTab(LENS_LABELS['content-owners']))
    await act(async () => { vi.runAllTimers() })
    expect(screen.getByRole('status')).toHaveTextContent(ANNOUNCE.customerSwitchedWithCapture)
  })

  it('uses experience defaults when switching and restores the independent Chat capture', async () => {
    const user = setupTimers()
    render(<AiModePlayground />)
    await user.click(screen.getByRole('button', { name: CHAT_QUESTIONS[0] }))
    await user.click(experienceTab(EXPERIENCE_LABELS.quote))
    expect(screen.getByText(EXPERIENCE_DEFAULT_OBSERVATION.quote)).toBeInTheDocument()
    await waitFor(() => expect(screen.getByText(PATHS['content-owners'][0].question)).toBeInTheDocument())
    await user.click(experienceTab(EXPERIENCE_LABELS.chat))
    expect(screen.getByText(/The user picked “iPhone 18 Pro full specs/)).toBeInTheDocument()
  })

  it('focuses and announces a completed Quote, then records a LINE action', async () => {
    const user = setupTimers()
    render(<AiModePlayground />)
    await user.click(experienceTab(EXPERIENCE_LABELS.quote))
    await user.click(screen.getByRole('button', { name: /Before you choose/ }))
    const focus = vi.spyOn(HTMLElement.prototype, 'focus')
    await user.click(screen.getByRole('radio', { name: 'Helpful' }))
    await act(async () => { vi.runAllTimers() })
    const signal = document.getElementById('stage-02-copy')
    expect(focus.mock.contexts.filter((element) => element === signal)).toHaveLength(1)
    expect(focus.mock.calls[focus.mock.contexts.indexOf(signal)]).toEqual([{ preventScroll: true }])
    expect(document.getElementById('stage-02-copy')).toHaveFocus()
    expect(scrolledElement).toBe(document.getElementById('stage-02-copy'))
    expect(HTMLElement.prototype.scrollIntoView).toHaveBeenLastCalledWith({ block: 'center', behavior: 'smooth' })
    expect(screen.getByText(/responded “Helpful”/)).toBeInTheDocument()
    expect(screen.getByRole('status')).toHaveTextContent(ANNOUNCE.completed(EXPERIENCE_LABELS.quote))
    await user.click(screen.getByRole('button', { name: UI.quote.actions.line }))
    expect(document.getElementById('stage-02-copy')).toHaveTextContent(UI.quote.actions.line)
  })

  it('completes Quote when a line is picked after the feedback: focuses the signal and announces completion', async () => {
    const user = setupTimers()
    render(<AiModePlayground />)
    await user.click(experienceTab(EXPERIENCE_LABELS.quote))
    await user.click(screen.getByRole('radio', { name: 'Helpful' }))
    await act(async () => { vi.runAllTimers() })
    // Feedback alone does not complete Quote: no focus move, no scroll.
    expect(screen.getByRole('status')).toHaveTextContent(ANNOUNCE.feedbackSelected('Helpful'))
    expect(HTMLElement.prototype.scrollIntoView).not.toHaveBeenCalled()
    expect(document.getElementById('stage-02-copy')).not.toHaveFocus()

    const focus = vi.spyOn(HTMLElement.prototype, 'focus')
    await user.click(screen.getByRole('button', { name: /Before you choose/ }))
    await act(async () => { vi.runAllTimers() })
    const signal = document.getElementById('stage-02-copy')
    expect(screen.getByRole('status')).toHaveTextContent(ANNOUNCE.completed(EXPERIENCE_LABELS.quote))
    expect(screen.getByRole('status')).not.toHaveTextContent(ANNOUNCE.quoteSelected)
    expect(scrolledElement).toBe(signal)
    expect(HTMLElement.prototype.scrollIntoView).toHaveBeenCalledTimes(1)
    expect(HTMLElement.prototype.scrollIntoView).toHaveBeenCalledWith({ block: 'center', behavior: 'smooth' })
    expect(focus.mock.calls[focus.mock.contexts.indexOf(signal)]).toEqual([{ preventScroll: true }])
    expect(signal).toHaveFocus()
    expect(screen.getByText(/responded “Helpful”/)).toBeInTheDocument()
  })

  it('still announces a plain line selection when no feedback has been picked yet', async () => {
    const user = setupTimers()
    render(<AiModePlayground />)
    await user.click(experienceTab(EXPERIENCE_LABELS.quote))
    const lineButton = screen.getByRole('button', { name: /Before you choose/ })
    await user.click(lineButton)
    await act(async () => { vi.runAllTimers() })
    expect(screen.getByRole('status')).toHaveTextContent(ANNOUNCE.quoteSelected)
    expect(HTMLElement.prototype.scrollIntoView).not.toHaveBeenCalled()
    expect(document.getElementById('stage-02-copy')).not.toHaveFocus()
  })

  for (const [name, complete] of [
    ['Chat answer', async (user: ReturnType<typeof userEvent.setup>) => {
      await user.click(screen.getByRole('button', { name: CHAT_QUESTIONS[0] }))
    }],
    ['completed Quote', async (user: ReturnType<typeof userEvent.setup>) => {
      await user.click(experienceTab(EXPERIENCE_LABELS.quote))
      await user.click(screen.getByRole('button', { name: /Before you choose/ }))
      await user.click(screen.getByRole('radio', { name: 'Helpful' }))
    }],
  ] as const) {
    it(`scrolls instantly for reduced-motion users after a ${name}, overriding the smooth html scroll-behavior`, async () => {
      vi.stubGlobal('matchMedia', vi.fn((query: string) => ({
        matches: query === '(prefers-reduced-motion: reduce)',
        addListener: vi.fn(),
        removeListener: vi.fn(),
      })))
      const user = setupTimers()
      render(<AiModePlayground />)
      await complete(user)
      await act(async () => { vi.runAllTimers() })
      expect(scrolledElement).toBe(document.getElementById('stage-02-copy'))
      expect(HTMLElement.prototype.scrollIntoView).toHaveBeenCalledTimes(1)
      expect(HTMLElement.prototype.scrollIntoView).toHaveBeenCalledWith({ block: 'center', behavior: 'instant' })
      expect(document.getElementById('stage-02-copy')).toHaveFocus()
    })
  }

  it('ignores a repeated share action so a later keystroke keeps focus and nothing is re-announced', async () => {
    const user = setupTimers()
    render(<AiModePlayground />)
    await user.click(experienceTab(EXPERIENCE_LABELS.quote))
    await user.click(screen.getByRole('button', { name: /Before you choose/ }))
    await user.click(screen.getByRole('button', { name: UI.quote.actions.line }))
    await act(async () => { vi.runAllTimers() })
    expect(document.getElementById('stage-02-copy')).toHaveFocus()
    expect(screen.getByRole('status')).toHaveTextContent(ANNOUNCE.shareRecorded(UI.quote.actions.line))

    const requestFrame = vi.spyOn(window, 'requestAnimationFrame')
    const lineButton = screen.getByRole('button', { name: UI.quote.actions.line })
    await user.click(lineButton)
    await act(async () => { vi.runAllTimers() })
    expect(requestFrame).not.toHaveBeenCalled()
    expect(lineButton).toHaveFocus()
    expect(screen.getByRole('status')).toHaveTextContent(ANNOUNCE.shareRecorded(UI.quote.actions.line))

    const input = screen.getByRole('textbox', { name: UI.quote.signatureLabel })
    await user.click(input)
    await user.type(input, 'A')
    await act(async () => { vi.runAllTimers() })
    expect(input).toHaveValue('A')
    expect(document.activeElement).toBe(input)
  })

  it('ignores re-activating the checked feedback radio: nothing is re-announced and focus stays put', async () => {
    const user = setupTimers()
    render(<AiModePlayground />)
    await user.click(experienceTab(EXPERIENCE_LABELS.quote))
    await user.click(screen.getByRole('button', { name: /Before you choose/ }))
    await user.click(screen.getByRole('radio', { name: 'Helpful' }))
    await act(async () => { vi.runAllTimers() })
    expect(document.getElementById('stage-02-copy')).toHaveFocus()
    expect(screen.getByRole('status')).toHaveTextContent(ANNOUNCE.completed(EXPERIENCE_LABELS.quote))

    const helpful = screen.getByRole('radio', { name: 'Helpful' })
    helpful.focus()
    const requestFrame = vi.spyOn(window, 'requestAnimationFrame')
    const scrollCalls = vi.mocked(HTMLElement.prototype.scrollIntoView).mock.calls.length
    await user.keyboard(' ')
    await act(async () => { vi.runAllTimers() })
    expect(helpful).toHaveAttribute('aria-checked', 'true')
    expect(requestFrame).not.toHaveBeenCalled()
    expect(vi.mocked(HTMLElement.prototype.scrollIntoView).mock.calls.length).toBe(scrollCalls)
    expect(helpful).toHaveFocus()
    expect(screen.getByRole('status')).toHaveTextContent(ANNOUNCE.completed(EXPERIENCE_LABELS.quote))
  })

  it('ignores re-choosing the chosen Chat answer: nothing is re-announced and focus stays put', async () => {
    const user = setupTimers()
    render(<AiModePlayground />)
    await user.click(screen.getByRole('button', { name: CHAT_QUESTIONS[0] }))
    await act(async () => { vi.runAllTimers() })
    expect(document.getElementById('stage-02-copy')).toHaveFocus()

    const answer = screen.getByRole('button', { name: CHAT_QUESTIONS[0] })
    const requestFrame = vi.spyOn(window, 'requestAnimationFrame')
    await user.click(answer)
    await act(async () => { vi.runAllTimers() })
    expect(requestFrame).not.toHaveBeenCalled()
    expect(answer).toHaveFocus()
    expect(screen.getByRole('status')).toHaveTextContent(ANNOUNCE.chatAnswered)
  })

  it('focuses the current experience tab exactly once on reset', async () => {
    const user = setupTimers()
    render(<AiModePlayground />)
    await user.click(screen.getByRole('button', { name: CHAT_QUESTIONS[0] }))
    await act(async () => { vi.runAllTimers() })
    const focus = vi.spyOn(HTMLElement.prototype, 'focus')
    await user.click(screen.getByRole('button', { name: UI.reset }))
    await act(async () => { vi.runAllTimers() })
    const chatTab = experienceTab(EXPERIENCE_LABELS.chat)
    expect(focus.mock.contexts.filter((element) => element === chatTab)).toHaveLength(1)
    expect(chatTab).toHaveFocus()
  })

  it('cancels a queued announcement when unmounted', async () => {
    const requestFrame = vi.fn(() => 42)
    const cancelFrame = vi.fn()
    vi.stubGlobal('requestAnimationFrame', requestFrame)
    vi.stubGlobal('cancelAnimationFrame', cancelFrame)
    const user = userEvent.setup()
    const { unmount } = render(<AiModePlayground />)
    await user.click(screen.getByRole('button', { name: CHAT_QUESTIONS[0] }))
    expect(requestFrame).toHaveBeenCalled()
    expect(cancelFrame).not.toHaveBeenCalled()
    unmount()
    expect(cancelFrame).toHaveBeenCalledWith(42)
  })

  it('captures Listen start and completion at 32 seconds', async () => {
    const user = setupTimers()
    render(<AiModePlayground />)
    await user.click(experienceTab(EXPERIENCE_LABELS.listen))
    await user.click(screen.getByRole('button', { name: UI.listen.play }))
    expect(screen.getByText(/The user pressed play and started listening/)).toBeInTheDocument()
    await act(async () => { vi.advanceTimersByTime(32000) })
    await act(async () => { vi.runAllTimers() })
    expect(document.getElementById('stage-01-copy')).toHaveTextContent('The user listened to the 32-second audio from start to finish.')
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '32')
    expect(document.getElementById('stage-02-copy')).toHaveFocus()
    expect(screen.getByRole('status')).toHaveTextContent(ANNOUNCE.completed(EXPERIENCE_LABELS.listen))
  })

  it('resets incomplete Listen when switching away and back', async () => {
    const user = setupTimers()
    render(<AiModePlayground />)
    await user.click(experienceTab(EXPERIENCE_LABELS.listen))
    await user.click(screen.getByRole('button', { name: UI.listen.play }))
    await act(async () => { vi.advanceTimersByTime(5000) })
    await user.click(experienceTab(EXPERIENCE_LABELS.chat))
    await user.click(experienceTab(EXPERIENCE_LABELS.listen))
    expect(screen.getByText(EXPERIENCE_DEFAULT_OBSERVATION.listen)).toBeInTheDocument()
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '0')
  })

  it('resets only the current Quote slice while the Chat capture survives', async () => {
    const user = setupTimers()
    render(<AiModePlayground />)
    await user.click(screen.getByRole('button', { name: CHAT_QUESTIONS[0] }))
    await user.click(experienceTab(EXPERIENCE_LABELS.quote))
    await user.click(screen.getByRole('button', { name: /Before you choose/ }))
    await user.click(screen.getByRole('button', { name: UI.reset }))
    await user.click(experienceTab(EXPERIENCE_LABELS.chat))
    expect(screen.getByText(/The user picked “iPhone 18 Pro full specs/)).toBeInTheDocument()
    await user.click(experienceTab(EXPERIENCE_LABELS.quote))
    expect(screen.getByText(UI.quote.previewEmpty)).toBeInTheDocument()
  })

  it('keeps the route hero and does not render forbidden legacy words', async () => {
    render(<AiModePlaygroundPage />)
    const routeSurface = document.querySelector('.section-white')!
    const hero = document.querySelector('.ai-mode-playground-hero')!
    expect(routeSurface).toContainElement(hero as HTMLElement)
    expect(routeSurface).toContainElement(document.querySelector('[data-playground-root]') as HTMLElement)
    expect(hero).toHaveClass('section-dark')
    expect(hero).not.toHaveClass('section-white')
    expect(screen.getByRole('heading', { level: 1, name: HERO.title })).toHaveClass('text-white', 'text-4xl', 'md:text-5xl')
    expect(screen.getByText(HERO.eyebrow)).toHaveStyle({ color: 'var(--color-on-dark)' })
    expect(screen.getByText(HERO.copy)).toBeInTheDocument()
    expect(readFileSync('app/ai-mode-playground/page.tsx', 'utf8')).not.toMatch(/heroBackdrop|heroGradient/)
    expect(readFileSync('app/ai-mode-playground/AiModePlaygroundPage.module.css', 'utf8')).not.toMatch(/heroBackdrop|heroGradient/)
    const assertNoForbiddenWords = () => {
      expect(document.body.textContent).not.toMatch(/reader|publisher|cortex/i)
      expect(document.body.innerHTML).not.toMatch(/reader|publisher|cortex/i)
    }
    assertNoForbiddenWords()
    const user = userEvent.setup()
    await user.click(screen.getByRole('button', { name: CHAT_QUESTIONS[0] }))
    assertNoForbiddenWords()
    await user.click(experienceTab(EXPERIENCE_LABELS.quote))
    await user.click(screen.getByRole('button', { name: /Before you choose/ }))
    await user.click(screen.getByRole('radio', { name: 'Helpful' }))
    assertNoForbiddenWords()
    await user.click(experienceTab(EXPERIENCE_LABELS.listen))
    await user.click(screen.getByRole('button', { name: UI.listen.play }))
    assertNoForbiddenWords()
  })

  it('uses manual experience arrows so focus movement does not activate or discard captures', async () => {
    const user = userEvent.setup()
    render(<AiModePlayground />)
    await user.click(screen.getByRole('button', { name: CHAT_QUESTIONS[0] }))
    const chatTab = experienceTab(EXPERIENCE_LABELS.chat)
    chatTab.focus()
    await user.keyboard('{ArrowRight}')
    expect(experienceTab(EXPERIENCE_LABELS.quote)).toHaveFocus()
    expect(chatTab).toHaveAttribute('aria-selected', 'true')
    expect(screen.getByText(/The user picked “iPhone 18 Pro full specs/)).toBeInTheDocument()
  })
})
