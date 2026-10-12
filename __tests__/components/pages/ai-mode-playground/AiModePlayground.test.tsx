import { readFileSync } from 'node:fs'
import { Profiler } from 'react'
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
  LISTEN_AUDIO_SRC,
  PATHS,
  UI,
} from '@/components/pages/ai-mode-playground/ai-mode-playground-copy'
import { stubMedia, type MediaStub } from './media-element-stub'

let intersectionObserverCallback: IntersectionObserverCallback | null = null
let scrolledElement: HTMLElement | null = null
let media: MediaStub

beforeEach(() => {
  media = stubMedia()
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
const listenAudio = () => document.querySelector('audio') as HTMLAudioElement
const CAPTURE_COMPLETED_OBSERVATION = 'The user played the full 27-second audio overview. Both sponsor messages (demo sponsor: Mlytics) played.'

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

  it('picking a line and a feeling never moves focus; the first share completes Quote and later shares record in place', async () => {
    const user = setupTimers()
    render(<AiModePlayground />)
    await user.click(experienceTab(EXPERIENCE_LABELS.quote))
    await user.click(screen.getByRole('button', { name: /Before you choose/ }))
    const helpful = screen.getByRole('radio', { name: 'Helpful' })
    await user.click(helpful)
    await act(async () => { vi.runAllTimers() })
    const signal = document.getElementById('stage-02-copy')
    // Line + feeling only record and announce: no scroll, no focus move.
    expect(HTMLElement.prototype.scrollIntoView).not.toHaveBeenCalled()
    expect(signal).not.toHaveFocus()
    expect(helpful).toHaveFocus()
    expect(screen.getByRole('status')).toHaveTextContent(ANNOUNCE.feedbackSelected('Helpful'))
    expect(screen.getByText(/responded “Helpful”/)).toBeInTheDocument()

    // The first share completes Quote: one smooth centred scroll, one focus move.
    const focus = vi.spyOn(HTMLElement.prototype, 'focus')
    await user.click(screen.getByRole('button', { name: UI.quote.actions.line }))
    await act(async () => { vi.runAllTimers() })
    expect(focus.mock.contexts.filter((element) => element === signal)).toHaveLength(1)
    expect(focus.mock.calls[focus.mock.contexts.indexOf(signal)]).toEqual([{ preventScroll: true }])
    expect(signal).toHaveFocus()
    expect(scrolledElement).toBe(signal)
    expect(HTMLElement.prototype.scrollIntoView).toHaveBeenCalledTimes(1)
    expect(HTMLElement.prototype.scrollIntoView).toHaveBeenCalledWith({ block: 'center', behavior: 'smooth' })
    expect(screen.getByRole('status')).toHaveTextContent(ANNOUNCE.completed(EXPERIENCE_LABELS.quote))

    // A different, later share is recorded without another jump.
    const fb = screen.getByRole('button', { name: UI.quote.actions.fb })
    await user.click(fb)
    await act(async () => { vi.runAllTimers() })
    expect(HTMLElement.prototype.scrollIntoView).toHaveBeenCalledTimes(1)
    expect(fb).toHaveFocus()
    expect(screen.getByRole('status')).toHaveTextContent(ANNOUNCE.shareRecorded(UI.quote.actions.fb))
    expect(signal).toHaveTextContent('LINE and FB share buttons')
  })

  it('picking a line after the feedback does not complete Quote: no scroll, no focus move', async () => {
    const user = setupTimers()
    render(<AiModePlayground />)
    await user.click(experienceTab(EXPERIENCE_LABELS.quote))
    await user.click(screen.getByRole('radio', { name: 'Helpful' }))
    await act(async () => { vi.runAllTimers() })
    expect(screen.getByRole('status')).toHaveTextContent(ANNOUNCE.feedbackSelected('Helpful'))

    const line = screen.getByRole('button', { name: /Before you choose/ })
    await user.click(line)
    await act(async () => { vi.runAllTimers() })
    expect(screen.getByRole('status')).toHaveTextContent(ANNOUNCE.quoteSelected)
    expect(HTMLElement.prototype.scrollIntoView).not.toHaveBeenCalled()
    expect(document.getElementById('stage-02-copy')).not.toHaveFocus()
    expect(line).toHaveFocus()
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
    ['Quote share', async (user: ReturnType<typeof userEvent.setup>) => {
      await user.click(experienceTab(EXPERIENCE_LABELS.quote))
      await user.click(screen.getByRole('button', { name: /Before you choose/ }))
      await user.click(screen.getByRole('button', { name: UI.quote.actions.line }))
    }],
    ['Quote reveal link', async (user: ReturnType<typeof userEvent.setup>) => {
      await user.click(experienceTab(EXPERIENCE_LABELS.quote))
      await user.click(screen.getByRole('button', { name: /Before you choose/ }))
      await user.click(screen.getByRole('radio', { name: 'Helpful' }))
      await user.click(screen.getByRole('button', { name: UI.quote.revealSignal }))
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
    expect(screen.getByRole('status')).toHaveTextContent(ANNOUNCE.completed(EXPERIENCE_LABELS.quote))

    const requestFrame = vi.spyOn(window, 'requestAnimationFrame')
    const lineButton = screen.getByRole('button', { name: UI.quote.actions.line })
    await user.click(lineButton)
    await act(async () => { vi.runAllTimers() })
    expect(requestFrame).not.toHaveBeenCalled()
    expect(lineButton).toHaveFocus()
    expect(screen.getByRole('status')).toHaveTextContent(ANNOUNCE.completed(EXPERIENCE_LABELS.quote))

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
    const helpful = screen.getByRole('radio', { name: 'Helpful' })
    await user.click(helpful)
    await act(async () => { vi.runAllTimers() })
    // Picking a feeling records and announces only: focus stays on the radio.
    expect(helpful).toHaveFocus()
    expect(document.getElementById('stage-02-copy')).not.toHaveFocus()
    expect(screen.getByRole('status')).toHaveTextContent(ANNOUNCE.feedbackSelected('Helpful'))

    const requestFrame = vi.spyOn(window, 'requestAnimationFrame')
    const scrollCalls = vi.mocked(HTMLElement.prototype.scrollIntoView).mock.calls.length
    await user.keyboard(' ')
    await act(async () => { vi.runAllTimers() })
    expect(helpful).toHaveAttribute('aria-checked', 'true')
    expect(requestFrame).not.toHaveBeenCalled()
    expect(vi.mocked(HTMLElement.prototype.scrollIntoView).mock.calls.length).toBe(scrollCalls)
    expect(vi.mocked(HTMLElement.prototype.scrollIntoView)).not.toHaveBeenCalled()
    expect(helpful).toHaveFocus()
    expect(screen.getByRole('status')).toHaveTextContent(ANNOUNCE.feedbackSelected('Helpful'))
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

  it('ignores re-selecting the selected Quote line: nothing is re-announced', async () => {
    const user = setupTimers()
    render(<AiModePlayground />)
    await user.click(experienceTab(EXPERIENCE_LABELS.quote))
    const line = screen.getByRole('button', { name: /Before you choose/ })
    await user.click(line)
    await act(async () => { vi.runAllTimers() })
    expect(screen.getByRole('status')).toHaveTextContent(ANNOUNCE.quoteSelected)

    const requestFrame = vi.spyOn(window, 'requestAnimationFrame')
    await user.click(line)
    await act(async () => { vi.runAllTimers() })
    expect(requestFrame).not.toHaveBeenCalled()
    expect(line).toHaveAttribute('aria-pressed', 'true')
    expect(line).toHaveFocus()
    expect(screen.getByRole('status')).toHaveTextContent(ANNOUNCE.quoteSelected)
  })

  it('ignores re-selecting the selected experience tab: nothing is re-announced', async () => {
    const user = setupTimers()
    render(<AiModePlayground />)
    await user.click(experienceTab(EXPERIENCE_LABELS.quote))
    await act(async () => { vi.runAllTimers() })
    expect(screen.getByRole('status')).toHaveTextContent(ANNOUNCE.experienceSelected(EXPERIENCE_LABELS.quote))

    const requestFrame = vi.spyOn(window, 'requestAnimationFrame')
    await user.click(experienceTab(EXPERIENCE_LABELS.quote))
    experienceTab(EXPERIENCE_LABELS.quote).focus()
    await user.keyboard('{Enter}')
    await user.keyboard(' ')
    await act(async () => { vi.runAllTimers() })
    expect(requestFrame).not.toHaveBeenCalled()
    expect(experienceTab(EXPERIENCE_LABELS.quote)).toHaveAttribute('aria-selected', 'true')
    expect(screen.getByRole('status')).toHaveTextContent(ANNOUNCE.experienceSelected(EXPERIENCE_LABELS.quote))
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

  it('captures Listen start and completion at 27 seconds', async () => {
    const user = setupTimers()
    const focus = vi.spyOn(HTMLElement.prototype, 'focus')
    render(<AiModePlayground />)
    await user.click(experienceTab(EXPERIENCE_LABELS.listen))
    await user.click(screen.getByRole('button', { name: UI.listen.play }))
    expect(media.play).toHaveBeenCalledOnce()
    expect(document.getElementById('stage-01-copy')).toHaveTextContent('The user pressed play and started the article’s audio overview.')
    await act(async () => { media.tick(listenAudio(), 5.4) })
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '5')
    await act(async () => { media.end(listenAudio()) })
    await act(async () => { vi.runOnlyPendingTimers() })
    expect(document.getElementById('stage-01-copy')).toHaveTextContent('The user played the full 27-second audio overview. Both sponsor messages (demo sponsor: Mlytics) played.')
    expect(document.getElementById('stage-02-copy')).toHaveTextContent('Played: 27 of 27 seconds (100%). Sponsor message impressions (demo sponsor: Mlytics): 2 of 2.')
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '27')
    expect(screen.getByRole('button', { name: UI.listen.replay })).toBeInTheDocument()
    expect(document.getElementById('stage-02-copy')).toHaveFocus()
    expect(focus.mock.contexts.filter((element) => (element as HTMLElement).id === 'stage-02-copy')).toHaveLength(1)
    expect(screen.getByRole('status')).toHaveTextContent(ANNOUNCE.completed(EXPERIENCE_LABELS.listen))
  })

  it('renders a single hidden audio element pointing at the versioned overview', () => {
    render(<AiModePlayground />)
    const audios = document.querySelectorAll('audio')
    expect(audios).toHaveLength(1)
    expect(audios[0]).toHaveAttribute('src', LISTEN_AUDIO_SRC)
    expect(audios[0]).toHaveAttribute('preload', 'none')
    expect(audios[0]).not.toHaveAttribute('controls')
  })

  it('stops and rewinds incomplete Listen when switching away and back', async () => {
    const user = setupTimers()
    render(<AiModePlayground />)
    await user.click(experienceTab(EXPERIENCE_LABELS.listen))
    await user.click(screen.getByRole('button', { name: UI.listen.play }))
    await act(async () => { media.tick(listenAudio(), 5) })
    await user.click(experienceTab(EXPERIENCE_LABELS.chat))
    expect(media.pause).toHaveBeenCalled()
    expect(listenAudio().paused).toBe(true)
    expect(listenAudio().currentTime).toBe(0)
    await user.click(experienceTab(EXPERIENCE_LABELS.listen))
    expect(screen.getByText(EXPERIENCE_DEFAULT_OBSERVATION.listen)).toBeInTheDocument()
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '0')
  })

  it('stops and rewinds the audio when Listen is reset', async () => {
    const user = setupTimers()
    render(<AiModePlayground />)
    await user.click(experienceTab(EXPERIENCE_LABELS.listen))
    await user.click(screen.getByRole('button', { name: UI.listen.play }))
    await act(async () => { media.tick(listenAudio(), 5) })
    await user.click(screen.getByRole('button', { name: UI.reset }))
    expect(media.pause).toHaveBeenCalled()
    expect(listenAudio().currentTime).toBe(0)
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '0')
    expect(screen.getByRole('button', { name: UI.listen.play })).toBeInTheDocument()
    expect(screen.getByText(EXPERIENCE_DEFAULT_OBSERVATION.listen)).toBeInTheDocument()
  })

  it('pauses the audio from the Pause button and announces it', async () => {
    const user = setupTimers()
    render(<AiModePlayground />)
    await user.click(experienceTab(EXPERIENCE_LABELS.listen))
    await user.click(screen.getByRole('button', { name: UI.listen.play }))
    await user.click(screen.getByRole('button', { name: UI.listen.pause }))
    expect(media.pause).toHaveBeenCalledOnce()
    expect(listenAudio().paused).toBe(true)
    await act(async () => { vi.runOnlyPendingTimers() })
    expect(screen.getByRole('button', { name: UI.listen.play })).toBeInTheDocument()
    expect(screen.getByRole('status')).toHaveTextContent(ANNOUNCE.listenPaused)
    expect(document.getElementById('stage-01-copy')).toHaveTextContent('Playback paused at 0 seconds (0%), before the opening sponsor message (demo sponsor: Mlytics) finished.')
  })

  it('replays from the start after completion', async () => {
    const user = setupTimers()
    render(<AiModePlayground />)
    await user.click(experienceTab(EXPERIENCE_LABELS.listen))
    await user.click(screen.getByRole('button', { name: UI.listen.play }))
    await act(async () => { media.end(listenAudio()) })
    media.setCurrentTime.mockClear()
    media.play.mockClear()
    await user.click(screen.getByRole('button', { name: UI.listen.replay }))
    expect(media.setCurrentTime).toHaveBeenCalledWith(0)
    expect(media.play).toHaveBeenCalledOnce()
    expect(listenAudio().paused).toBe(false)
    expect(listenAudio().currentTime).toBe(0)
    expect(screen.getByRole('button', { name: UI.listen.pause })).toBeInTheDocument()
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '0')
  })

  it('follows an external pause without announcing it', async () => {
    const user = setupTimers()
    render(<AiModePlayground />)
    await user.click(experienceTab(EXPERIENCE_LABELS.listen))
    await user.click(screen.getByRole('button', { name: UI.listen.play }))
    await act(async () => { vi.runOnlyPendingTimers() })
    expect(screen.getByRole('status')).toHaveTextContent(ANNOUNCE.listenPlaying)
    await act(async () => { listenAudio().pause() })
    await act(async () => { vi.runOnlyPendingTimers() })
    expect(screen.getByRole('button', { name: UI.listen.play })).toBeInTheDocument()
    expect(screen.getByRole('status')).toHaveTextContent(ANNOUNCE.listenPlaying)
    await act(async () => { void listenAudio().play() })
    expect(screen.getByRole('button', { name: UI.listen.pause })).toBeInTheDocument()
  })

  it('does not flash paused when playback ends, and completes once', async () => {
    const user = setupTimers()
    render(<AiModePlayground />)
    await user.click(experienceTab(EXPERIENCE_LABELS.listen))
    await user.click(screen.getByRole('button', { name: UI.listen.play }))
    const audio = listenAudio()
    await act(async () => {
      const state = media.stateOf(audio)
      state.paused = true
      state.ended = true
      audio.dispatchEvent(new Event('pause'))
    })
    expect(screen.getByRole('button', { name: UI.listen.pause })).toBeInTheDocument()
    await act(async () => { audio.dispatchEvent(new Event('ended')) })
    await act(async () => { audio.dispatchEvent(new Event('ended')) })
    await act(async () => { vi.runOnlyPendingTimers() })
    expect(screen.getByRole('button', { name: UI.listen.replay })).toBeInTheDocument()
    expect(screen.getByRole('status')).toHaveTextContent(ANNOUNCE.completed(EXPERIENCE_LABELS.listen))
  })

  it('shows an honest error state when play() is rejected, then retries', async () => {
    const user = setupTimers()
    render(<AiModePlayground />)
    await user.click(experienceTab(EXPERIENCE_LABELS.listen))
    media.rejectNextPlay('NotSupportedError')
    await user.click(screen.getByRole('button', { name: UI.listen.play }))
    await act(async () => { vi.runOnlyPendingTimers() })
    expect(document.getElementById('listen-error')).toHaveTextContent(UI.listen.error)
    const retry = screen.getByRole('button', { name: UI.listen.retry })
    expect(retry).toHaveAttribute('aria-describedby', 'listen-error')
    expect(screen.getByRole('status')).toHaveTextContent(ANNOUNCE.listenError)
    expect(screen.getByText(EXPERIENCE_DEFAULT_OBSERVATION.listen)).toBeInTheDocument()
    // The element's own error event after the rejection does not re-announce.
    await act(async () => { media.fail(listenAudio()) })
    media.play.mockClear()
    await user.click(retry)
    expect(media.load).toHaveBeenCalledOnce()
    expect(media.play).toHaveBeenCalledOnce()
    await act(async () => { vi.runOnlyPendingTimers() })
    expect(screen.getByRole('button', { name: UI.listen.pause })).toBeInTheDocument()
    expect(document.getElementById('listen-error')).not.toBeInTheDocument()
    expect(screen.getByRole('status')).toHaveTextContent(ANNOUNCE.listenPlaying)
  })

  it('ignores an AbortError from an interrupted play()', async () => {
    const user = setupTimers()
    render(<AiModePlayground />)
    await user.click(experienceTab(EXPERIENCE_LABELS.listen))
    media.rejectNextPlay('AbortError')
    await user.click(screen.getByRole('button', { name: UI.listen.play }))
    await act(async () => { vi.runOnlyPendingTimers() })
    expect(document.getElementById('listen-error')).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: UI.listen.pause })).toBeInTheDocument()
  })

  it('moves to the error state when the media element fires error', async () => {
    const user = setupTimers()
    render(<AiModePlayground />)
    await user.click(experienceTab(EXPERIENCE_LABELS.listen))
    await user.click(screen.getByRole('button', { name: UI.listen.play }))
    await act(async () => { media.fail(listenAudio()) })
    await act(async () => { vi.runOnlyPendingTimers() })
    expect(screen.getByRole('button', { name: UI.listen.retry })).toBeInTheDocument()
    expect(document.getElementById('listen-error')).toBeInTheDocument()
    expect(screen.getByRole('status')).toHaveTextContent(ANNOUNCE.listenError)
  })

  it('pauses the audio on unmount', async () => {
    const user = setupTimers()
    const { unmount } = render(<AiModePlayground />)
    await user.click(experienceTab(EXPERIENCE_LABELS.listen))
    await user.click(screen.getByRole('button', { name: UI.listen.play }))
    const audio = listenAudio()
    media.pause.mockClear()
    unmount()
    expect(media.pause).toHaveBeenCalled()
    expect(audio.paused).toBe(true)
    expect(audio.currentTime).toBe(0)
  })

  it('moves the fill smoothly from the audio clock on animation frames while playing, without React state', async () => {
    const user = setupTimers()
    render(<AiModePlayground />)
    await user.click(experienceTab(EXPERIENCE_LABELS.listen))
    const fill = screen.getByRole('progressbar').firstElementChild as HTMLElement
    expect(fill.style.width).toBe('0%')
    await user.click(screen.getByRole('button', { name: UI.listen.play }))
    // Sub-second motion: the reducer still says 2 s, the bar follows currentTime exactly.
    await act(async () => { media.tick(listenAudio(), 2.2) })
    media.stateOf(listenAudio()).currentTime = 2.6641
    await act(async () => { vi.advanceTimersByTime(20) })
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '2')
    expect(parseFloat(fill.style.width)).toBeCloseTo(10, 5)
    // Pausing stops the loop and keeps the exact paused position.
    await user.click(screen.getByRole('button', { name: UI.listen.pause }))
    media.stateOf(listenAudio()).currentTime = 20
    await act(async () => { vi.advanceTimersByTime(100) })
    expect(parseFloat(fill.style.width)).toBeCloseTo(10, 5)
    await act(async () => { media.end(listenAudio()) })
    expect(fill.style.width).toBe('100%')
    await user.click(screen.getByRole('button', { name: UI.reset }))
    expect(fill.style.width).toBe('0%')
  })

  it('cancels the animation frame loop on pause and on unmount', async () => {
    const user = setupTimers()
    const cancel = vi.spyOn(window, 'cancelAnimationFrame')
    const { unmount } = render(<AiModePlayground />)
    await user.click(experienceTab(EXPERIENCE_LABELS.listen))
    await user.click(screen.getByRole('button', { name: UI.listen.play }))
    const before = cancel.mock.calls.length
    await user.click(screen.getByRole('button', { name: UI.listen.pause }))
    expect(cancel.mock.calls.length).toBeGreaterThan(before)
    await user.click(screen.getByRole('button', { name: UI.listen.play }))
    const beforeUnmount = cancel.mock.calls.length
    unmount()
    expect(cancel.mock.calls.length).toBeGreaterThan(beforeUnmount)
  })

  it('with reduced motion the fill steps with whole seconds and reaches 100% on completion', async () => {
    vi.stubGlobal('matchMedia', vi.fn((query: string) => ({ matches: query.includes('reduce'), addListener: vi.fn(), removeListener: vi.fn() })))
    const user = setupTimers()
    render(<AiModePlayground />)
    await user.click(experienceTab(EXPERIENCE_LABELS.listen))
    const fill = screen.getByRole('progressbar').firstElementChild as HTMLElement
    await user.click(screen.getByRole('button', { name: UI.listen.play }))
    await act(async () => { media.tick(listenAudio(), 13.9) })
    await act(async () => { vi.advanceTimersByTime(100) })
    // One ratio source: currentTime / the element's real duration (26.641 s in the stub).
    expect(parseFloat(fill.style.width)).toBeCloseTo((13.9 / 26.641) * 100, 5)
    // Pausing keeps the same ratio, so the bar does not jump.
    await user.click(screen.getByRole('button', { name: UI.listen.pause }))
    expect(parseFloat(fill.style.width)).toBeCloseTo((13.9 / 26.641) * 100, 5)
    await user.click(screen.getByRole('button', { name: UI.listen.play }))
    expect(parseFloat(fill.style.width)).toBeCloseTo((13.9 / 26.641) * 100, 5)
    await act(async () => { media.end(listenAudio()) })
    expect(fill.style.width).toBe('100%')
  })

  it('highlights the sentence being spoken while playing and paused, and clears it otherwise', async () => {
    const user = setupTimers()
    render(<AiModePlayground />)
    await user.click(experienceTab(EXPERIENCE_LABELS.listen))
    await user.click(screen.getByText(UI.listen.transcript))
    const current = () => Array.from(document.querySelectorAll('[data-sentence][aria-current="true"]')).map((element) => element.getAttribute('data-sentence'))
    expect(current()).toEqual([])
    await user.click(screen.getByRole('button', { name: UI.listen.play }))
    await act(async () => { media.tick(listenAudio(), 4); vi.advanceTimersByTime(20) })
    expect(current()).toEqual(['1'])
    await act(async () => { media.tick(listenAudio(), 15); vi.advanceTimersByTime(20) })
    expect(current()).toEqual(['4'])
    await user.click(screen.getByRole('button', { name: UI.listen.pause }))
    expect(current()).toEqual(['4'])
    await user.click(screen.getByRole('button', { name: UI.listen.play }))
    await act(async () => { media.end(listenAudio()) })
    expect(current()).toEqual([])
    await user.click(screen.getByRole('button', { name: UI.listen.replay }))
    await act(async () => { media.tick(listenAudio(), 24.5); vi.advanceTimersByTime(20) })
    expect(current()).toEqual(['7'])
    await user.click(screen.getByRole('button', { name: UI.reset }))
    expect(current()).toEqual([])
    expect(screen.getByRole('status')).not.toHaveTextContent(/Mlytics/)
  })

  it('with reduced motion the highlight follows timeupdate', async () => {
    vi.stubGlobal('matchMedia', vi.fn((query: string) => ({ matches: query.includes('reduce'), addListener: vi.fn(), removeListener: vi.fn() })))
    const user = setupTimers()
    const frames = vi.spyOn(window, 'requestAnimationFrame')
    render(<AiModePlayground />)
    await user.click(experienceTab(EXPERIENCE_LABELS.listen))
    await user.click(screen.getByRole('button', { name: UI.listen.play }))
    frames.mockClear()
    await act(async () => { media.tick(listenAudio(), 5.5) })
    expect(document.querySelector('[data-sentence="2"]')).toHaveAttribute('aria-current', 'true')
    expect(frames).not.toHaveBeenCalled()
  })

  it('does not re-render the playground on animation frames when the sentence is unchanged', async () => {
    const user = setupTimers()
    let renders = 0
    render(<Profiler id="playground" onRender={() => { renders += 1 }}><AiModePlayground /></Profiler>)
    await user.click(experienceTab(EXPERIENCE_LABELS.listen))
    await user.click(screen.getByRole('button', { name: UI.listen.play }))
    await act(async () => { media.tick(listenAudio(), 8.2); vi.advanceTimersByTime(20) })
    await act(async () => { vi.runOnlyPendingTimers() })
    const settled = renders
    // ~60 frames of sub-second motion inside one sentence and one whole second.
    for (let frame = 0; frame < 60; frame += 1) {
      media.stateOf(listenAudio()).currentTime = 8.2 + frame * 0.01
      await act(async () => { vi.advanceTimersByTime(16) })
    }
    expect(renders).toBe(settled)
  })

  it('updates the stage 02 signal live every whole second without announcing it', async () => {
    const user = setupTimers()
    render(<AiModePlayground />)
    await user.click(experienceTab(EXPERIENCE_LABELS.listen))
    await user.click(screen.getByRole('button', { name: UI.listen.play }))
    await act(async () => { vi.runOnlyPendingTimers() })
    const status = screen.getByRole('status')
    expect(status).toHaveTextContent(ANNOUNCE.listenPlaying)
    const stage02 = document.getElementById('stage-02-copy')!
    // Stage 02 is not a live region and sits outside one.
    expect(stage02.closest('[aria-live], [role="status"], [role="log"], [role="alert"]')).toBeNull()
    const announcements: string[] = []
    const observer = new MutationObserver(() => announcements.push(status.textContent ?? ''))
    observer.observe(status, { childList: true, characterData: true, subtree: true })
    await act(async () => { media.tick(listenAudio(), 5.2); vi.advanceTimersByTime(20) })
    expect(stage02).toHaveTextContent('Played so far: 5 of 27 seconds (19%).')
    await act(async () => { media.tick(listenAudio(), 6.1); vi.advanceTimersByTime(20) })
    expect(stage02).toHaveTextContent('Played so far: 6 of 27 seconds (22%).')
    await act(async () => { vi.runOnlyPendingTimers() })
    observer.disconnect()
    expect(announcements).toEqual([])
    expect(status).toHaveTextContent(ANNOUNCE.listenPlaying)
  })

  it('mute is a stable-name toggle that sets audio.muted, works before play and persists, without touching signals', async () => {
    const user = setupTimers()
    render(<AiModePlayground />)
    await user.click(experienceTab(EXPERIENCE_LABELS.listen))
    const mute = () => screen.getByRole('button', { name: UI.listen.mute })
    expect(mute()).toHaveAttribute('aria-pressed', 'false')
    expect(mute().querySelector('svg.lucide-volume-2')).not.toBeNull()
    expect(listenAudio().muted).toBe(false)

    // Pre-set before play.
    await user.click(mute())
    expect(listenAudio().muted).toBe(true)
    expect(mute()).toHaveAttribute('aria-pressed', 'true')
    expect(mute()).toHaveAccessibleName(UI.listen.mute)
    expect(mute().querySelector('svg.lucide-volume-x')).not.toBeNull()

    await user.click(screen.getByRole('button', { name: UI.listen.play }))
    await act(async () => { media.tick(listenAudio(), 5.2); vi.advanceTimersByTime(20) })
    const signals = () => [document.getElementById('stage-01-copy')?.textContent, document.getElementById('stage-02-copy')?.textContent]
    const muted = signals()
    await user.click(mute())
    expect(listenAudio().muted).toBe(false)
    expect(signals()).toEqual(muted)
    expect(listenAudio().paused).toBe(false)
    await user.click(mute())
    expect(signals()).toEqual(muted)

    // Persists across completion + Replay, Reset and a tab switch.
    await act(async () => { media.end(listenAudio()) })
    await user.click(screen.getByRole('button', { name: UI.listen.replay }))
    expect(listenAudio().muted).toBe(true)
    await user.click(screen.getByRole('button', { name: UI.reset }))
    expect(listenAudio().muted).toBe(true)
    expect(mute()).toHaveAttribute('aria-pressed', 'true')
    await user.click(experienceTab(EXPERIENCE_LABELS.chat))
    await user.click(experienceTab(EXPERIENCE_LABELS.listen))
    expect(listenAudio().muted).toBe(true)
    expect(mute()).toHaveAttribute('aria-pressed', 'true')
    expect(mute()).toHaveAccessibleName(UI.listen.mute)
  })

  it('follows a mute change made outside the button (volumechange)', async () => {
    const user = setupTimers()
    render(<AiModePlayground />)
    await user.click(experienceTab(EXPERIENCE_LABELS.listen))
    await act(async () => {
      listenAudio().muted = true
      listenAudio().dispatchEvent(new Event('volumechange'))
    })
    expect(screen.getByRole('button', { name: UI.listen.mute })).toHaveAttribute('aria-pressed', 'true')
  })

  const watchAnnouncements = () => {
    const status = screen.getByRole('status')
    const seen: string[] = []
    const observer = new MutationObserver(() => seen.push(status.textContent ?? ''))
    observer.observe(status, { childList: true, characterData: true, subtree: true })
    return { seen, stop: () => observer.disconnect() }
  }

  it.each([
    ['a tab switch', async (user: ReturnType<typeof setupTimers>) => {
      await user.click(experienceTab(EXPERIENCE_LABELS.chat))
    }],
    ['Reset', async (user: ReturnType<typeof setupTimers>) => {
      await user.click(screen.getByRole('button', { name: UI.reset }))
    }],
    ['completion', async () => {
      await act(async () => { media.end(listenAudio()) })
    }],
  ] as const)('ignores a late media error after %s: no state change, no announcement', async (_name, leave) => {
    const user = setupTimers()
    render(<AiModePlayground />)
    await user.click(experienceTab(EXPERIENCE_LABELS.listen))
    await user.click(screen.getByRole('button', { name: UI.listen.play }))
    await act(async () => { media.tick(listenAudio(), 5.2) })
    await leave(user)
    await act(async () => { vi.runOnlyPendingTimers() })
    const before = document.getElementById('stage-01-copy')?.textContent
    const statusBefore = screen.getByRole('status').textContent
    const watch = watchAnnouncements()
    await act(async () => { media.fail(listenAudio()) })
    await act(async () => { vi.runOnlyPendingTimers() })
    watch.stop()
    expect(watch.seen).toEqual([])
    expect(screen.getByRole('status').textContent).toBe(statusBefore)
    expect(screen.getByRole('status')).not.toHaveTextContent(ANNOUNCE.listenError)
    expect(document.getElementById('stage-01-copy')?.textContent).toBe(before)
    if (screen.queryByRole('tab', { name: EXPERIENCE_LABELS.listen, selected: false })) {
      await user.click(experienceTab(EXPERIENCE_LABELS.listen))
    }
    expect(document.getElementById('listen-error')).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: UI.listen.retry })).not.toBeInTheDocument()
  })

  it('pauses a media-key resume while the UI is idle, keeping currentTime where stop() left it', async () => {
    const user = setupTimers()
    render(<AiModePlayground />)
    await user.click(experienceTab(EXPERIENCE_LABELS.listen))
    await user.click(screen.getByRole('button', { name: UI.listen.play }))
    await act(async () => { media.tick(listenAudio(), 5.2) })
    await user.click(experienceTab(EXPERIENCE_LABELS.chat))
    expect(listenAudio().currentTime).toBe(0)
    // OS/hardware media key: play() without any UI click.
    await act(async () => { void listenAudio().play() })
    expect(listenAudio().paused).toBe(true)
    expect(listenAudio().currentTime).toBe(0)
    await user.click(experienceTab(EXPERIENCE_LABELS.listen))
    expect(screen.getByRole('button', { name: UI.listen.play })).toBeInTheDocument()
    expect(screen.getByText(EXPERIENCE_DEFAULT_OBSERVATION.listen)).toBeInTheDocument()
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '0')
  })

  it('pauses a media-key resume after completion and stays completed', async () => {
    const user = setupTimers()
    render(<AiModePlayground />)
    await user.click(experienceTab(EXPERIENCE_LABELS.listen))
    await user.click(screen.getByRole('button', { name: UI.listen.play }))
    await act(async () => { media.end(listenAudio()) })
    await act(async () => { void listenAudio().play() })
    expect(listenAudio().paused).toBe(true)
    expect(screen.getByRole('button', { name: UI.listen.replay })).toBeInTheDocument()
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '27')
    expect(document.getElementById('stage-01-copy')).toHaveTextContent(CAPTURE_COMPLETED_OBSERVATION)
  })

  it('after an error, Reset then Play reloads the stale source before playing and the session proceeds', async () => {
    const user = setupTimers()
    render(<AiModePlayground />)
    await user.click(experienceTab(EXPERIENCE_LABELS.listen))
    await user.click(screen.getByRole('button', { name: UI.listen.play }))
    await act(async () => { media.failPersistently(listenAudio()) })
    expect(screen.getByRole('button', { name: UI.listen.retry })).toBeInTheDocument()
    expect(listenAudio().error).not.toBeNull()
    await user.click(screen.getByRole('button', { name: UI.reset }))
    media.load.mockClear()
    media.play.mockClear()
    await user.click(screen.getByRole('button', { name: UI.listen.play }))
    expect(media.load).toHaveBeenCalledOnce()
    expect(media.play).toHaveBeenCalledOnce()
    expect(media.load.mock.invocationCallOrder[0]).toBeLessThan(media.play.mock.invocationCallOrder[0])
    expect(listenAudio().error).toBeNull()
    expect(listenAudio().paused).toBe(false)
    await act(async () => { media.tick(listenAudio(), 4.2) })
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '4')
    expect(screen.getByRole('button', { name: UI.listen.pause })).toBeInTheDocument()
  })

  it('after an error, a tab switch then a Play that fails again still surfaces the error state', async () => {
    const user = setupTimers()
    render(<AiModePlayground />)
    await user.click(experienceTab(EXPERIENCE_LABELS.listen))
    await user.click(screen.getByRole('button', { name: UI.listen.play }))
    await act(async () => { media.failPersistently(listenAudio()) })
    await user.click(experienceTab(EXPERIENCE_LABELS.chat))
    await user.click(experienceTab(EXPERIENCE_LABELS.listen))
    media.load.mockClear()
    await user.click(screen.getByRole('button', { name: UI.listen.play }))
    expect(media.load).toHaveBeenCalledOnce()
    await act(async () => { media.failPersistently(listenAudio()) })
    await act(async () => { vi.runOnlyPendingTimers() })
    expect(screen.getByRole('button', { name: UI.listen.retry })).toBeInTheDocument()
    expect(document.getElementById('listen-error')).toHaveTextContent(UI.listen.error)
    expect(screen.getByRole('status')).toHaveTextContent(ANNOUNCE.listenError)
  })

  it('a healthy element is not reloaded on Play', async () => {
    const user = setupTimers()
    render(<AiModePlayground />)
    await user.click(experienceTab(EXPERIENCE_LABELS.listen))
    await user.click(screen.getByRole('button', { name: UI.listen.play }))
    await user.click(screen.getByRole('button', { name: UI.listen.pause }))
    await user.click(screen.getByRole('button', { name: UI.listen.play }))
    expect(media.load).not.toHaveBeenCalled()
  })

  it('an error pauses buffered audio and keeps its position', async () => {
    const user = setupTimers()
    render(<AiModePlayground />)
    await user.click(experienceTab(EXPERIENCE_LABELS.listen))
    await user.click(screen.getByRole('button', { name: UI.listen.play }))
    await act(async () => { media.tick(listenAudio(), 5.2) })
    expect(listenAudio().paused).toBe(false)
    media.pause.mockClear()
    await act(async () => { media.fail(listenAudio()) })
    expect(media.pause).toHaveBeenCalledOnce()
    expect(listenAudio().paused).toBe(true)
    expect(listenAudio().currentTime).toBe(5.2)
    expect(screen.getByRole('button', { name: UI.listen.retry })).toBeInTheDocument()
    expect(screen.getByText(UI.listen.status.unavailable)).toBeInTheDocument()
  })

  it('the screen-reader status says Paused while paused', async () => {
    const user = setupTimers()
    render(<AiModePlayground />)
    await user.click(experienceTab(EXPERIENCE_LABELS.listen))
    expect(screen.getByText(UI.listen.status.ready)).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: UI.listen.play }))
    expect(screen.getByText(UI.listen.status.playing)).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: UI.listen.pause }))
    expect(screen.getByText(UI.listen.status.paused)).toBeInTheDocument()
    expect(screen.queryByText(UI.listen.status.ready)).not.toBeInTheDocument()
  })

  it('an error mid-playback keeps the last partial signal', async () => {
    const user = setupTimers()
    render(<AiModePlayground />)
    await user.click(experienceTab(EXPERIENCE_LABELS.listen))
    await user.click(screen.getByRole('button', { name: UI.listen.play }))
    await act(async () => { media.tick(listenAudio(), 5.2) })
    await act(async () => { media.fail(listenAudio()) })
    expect(document.getElementById('listen-error')).toHaveTextContent('The audio couldn’t play. Try again.')
    expect(document.getElementById('stage-01-copy')).toHaveTextContent('The audio stopped at 5 seconds (19%) because playback failed. The opening sponsor message (demo sponsor: Mlytics) played.')
    expect(document.getElementById('stage-02-copy')).toHaveTextContent('Stopped by a playback error at 5 of 27 seconds (19%). Opening sponsor message (demo sponsor: Mlytics): played.')
  })

  describe('with media events queued asynchronously (closer to a browser)', () => {
    beforeEach(() => { media = stubMedia({ async: true }) })

    it('toggle play/pause ends in the state of the last click', async () => {
      const user = setupTimers()
      render(<AiModePlayground />)
      await user.click(experienceTab(EXPERIENCE_LABELS.listen))
      await user.click(screen.getByRole('button', { name: UI.listen.play }))
      await act(async () => { await Promise.resolve() })
      expect(screen.getByRole('button', { name: UI.listen.pause })).toBeInTheDocument()
      await user.click(screen.getByRole('button', { name: UI.listen.pause }))
      await act(async () => { await Promise.resolve() })
      expect(listenAudio().paused).toBe(true)
      expect(screen.getByRole('button', { name: UI.listen.play })).toBeInTheDocument()
      expect(screen.getByText(UI.listen.status.paused)).toBeInTheDocument()
      await user.click(screen.getByRole('button', { name: UI.listen.play }))
      await act(async () => { await Promise.resolve() })
      expect(listenAudio().paused).toBe(false)
      expect(screen.getByRole('button', { name: UI.listen.pause })).toBeInTheDocument()
    })

    it('Replay after completion plays from 0 and is not undone by the queued play event', async () => {
      const user = setupTimers()
      render(<AiModePlayground />)
      await user.click(experienceTab(EXPERIENCE_LABELS.listen))
      await user.click(screen.getByRole('button', { name: UI.listen.play }))
      await act(async () => { await Promise.resolve() })
      await act(async () => { media.end(listenAudio()) })
      await user.click(screen.getByRole('button', { name: UI.listen.replay }))
      await act(async () => { await Promise.resolve() })
      expect(listenAudio().paused).toBe(false)
      expect(listenAudio().currentTime).toBe(0)
      expect(screen.getByRole('button', { name: UI.listen.pause })).toBeInTheDocument()
      expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '0')
    })

    it('a queued error after a tab switch changes nothing and announces nothing', async () => {
      const user = setupTimers()
      render(<AiModePlayground />)
      await user.click(experienceTab(EXPERIENCE_LABELS.listen))
      await user.click(screen.getByRole('button', { name: UI.listen.play }))
      await act(async () => { await Promise.resolve() })
      await user.click(experienceTab(EXPERIENCE_LABELS.chat))
      await act(async () => { vi.runOnlyPendingTimers() })
      const watch = watchAnnouncements()
      await act(async () => {
        queueMicrotask(() => media.fail(listenAudio()))
        await Promise.resolve()
      })
      await act(async () => { vi.runOnlyPendingTimers() })
      watch.stop()
      expect(watch.seen).toEqual([])
      await user.click(experienceTab(EXPERIENCE_LABELS.listen))
      expect(document.getElementById('listen-error')).not.toBeInTheDocument()
      expect(screen.getByRole('button', { name: UI.listen.play })).toBeInTheDocument()
    })
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
    // The Brands lens renders its own path, evidence, and CTA copy.
    await user.click(customerTab(LENS_LABELS.brands))
    expect(customerTab(LENS_LABELS.brands)).toHaveAttribute('aria-selected', 'true')
    expect(screen.getByText(PATHS.brands[0].question)).toBeInTheDocument()
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

describe('Quote completion: share and reveal link', () => {
  const reveal = () => screen.queryByRole('button', { name: UI.quote.revealSignal })
  const line = (pattern: RegExp) => screen.getByRole('button', { name: pattern })

  it('shows the reveal link only once a line and a feeling are both picked', async () => {
    const user = setupTimers()
    render(<AiModePlayground />)
    await user.click(experienceTab(EXPERIENCE_LABELS.quote))
    await user.click(screen.getByRole('radio', { name: 'Helpful' }))
    expect(reveal()).not.toBeInTheDocument()
    await user.click(experienceTab(EXPERIENCE_LABELS.chat))
    await user.click(experienceTab(EXPERIENCE_LABELS.quote))
    await user.click(screen.getByRole('button', { name: UI.reset }))
    await user.click(line(/Before you choose/))
    expect(reveal()).not.toBeInTheDocument()
    await user.click(screen.getByRole('radio', { name: 'Helpful' }))
    expect(reveal()).toBeInTheDocument()
  })

  it('the reveal link focuses and scrolls to the signal once, announces completion, and records no share', async () => {
    const user = setupTimers()
    render(<AiModePlayground />)
    await user.click(experienceTab(EXPERIENCE_LABELS.quote))
    await user.click(line(/Before you choose/))
    await user.click(screen.getByRole('radio', { name: 'Helpful' }))
    const focus = vi.spyOn(HTMLElement.prototype, 'focus')
    await user.click(reveal()!)
    await act(async () => { vi.runAllTimers() })
    const signal = document.getElementById('stage-02-copy')
    expect(scrolledElement).toBe(signal)
    expect(HTMLElement.prototype.scrollIntoView).toHaveBeenCalledTimes(1)
    expect(HTMLElement.prototype.scrollIntoView).toHaveBeenCalledWith({ block: 'center', behavior: 'smooth' })
    expect(focus.mock.contexts.filter((element) => element === signal)).toHaveLength(1)
    expect(focus.mock.calls[focus.mock.contexts.indexOf(signal)]).toEqual([{ preventScroll: true }])
    expect(signal).toHaveFocus()
    expect(screen.getByRole('status')).toHaveTextContent(ANNOUNCE.completed(EXPERIENCE_LABELS.quote))
    expect(signal).not.toHaveTextContent(/share button/)
    // The link stays available after it is used.
    expect(reveal()).toBeInTheDocument()
  })

  it('picking a different line starts a new round: the reveal link hides until a feeling is picked again', async () => {
    const user = setupTimers()
    render(<AiModePlayground />)
    await user.click(experienceTab(EXPERIENCE_LABELS.quote))
    await user.click(line(/Before you choose/))
    await user.click(screen.getByRole('radio', { name: 'Helpful' }))
    expect(reveal()).toBeInTheDocument()
    await user.click(line(/Useful answers/))
    expect(reveal()).not.toBeInTheDocument()
  })

  it('the first share completes Quote even without a feeling', async () => {
    const user = setupTimers()
    render(<AiModePlayground />)
    await user.click(experienceTab(EXPERIENCE_LABELS.quote))
    await user.click(line(/Before you choose/))
    await user.click(screen.getByRole('button', { name: UI.quote.actions.share }))
    await act(async () => { vi.runAllTimers() })
    expect(HTMLElement.prototype.scrollIntoView).toHaveBeenCalledTimes(1)
    expect(document.getElementById('stage-02-copy')).toHaveFocus()
    expect(screen.getByRole('status')).toHaveTextContent(ANNOUNCE.completed(EXPERIENCE_LABELS.quote))
    expect(document.getElementById('stage-02-copy')).toHaveTextContent('generic share button')
  })

  it('after the reveal link, the first share still completes Quote and the link stays visible', async () => {
    const user = setupTimers()
    render(<AiModePlayground />)
    await user.click(experienceTab(EXPERIENCE_LABELS.quote))
    await user.click(line(/Before you choose/))
    await user.click(screen.getByRole('radio', { name: 'Helpful' }))
    await user.click(reveal()!)
    await act(async () => { vi.runAllTimers() })
    expect(HTMLElement.prototype.scrollIntoView).toHaveBeenCalledTimes(1)
    await user.click(screen.getByRole('button', { name: UI.quote.actions.line }))
    await act(async () => { vi.runAllTimers() })
    expect(HTMLElement.prototype.scrollIntoView).toHaveBeenCalledTimes(2)
    expect(document.getElementById('stage-02-copy')).toHaveFocus()
    expect(screen.getByRole('status')).toHaveTextContent(ANNOUNCE.completed(EXPERIENCE_LABELS.quote))
    expect(reveal()).toBeInTheDocument()
  })

  it('after a different line, the next share jumps again', async () => {
    const user = setupTimers()
    render(<AiModePlayground />)
    await user.click(experienceTab(EXPERIENCE_LABELS.quote))
    await user.click(line(/Before you choose/))
    await user.click(screen.getByRole('button', { name: UI.quote.actions.line }))
    await act(async () => { vi.runAllTimers() })
    expect(HTMLElement.prototype.scrollIntoView).toHaveBeenCalledTimes(1)
    await user.click(line(/Useful answers/))
    await act(async () => { vi.runAllTimers() })
    expect(HTMLElement.prototype.scrollIntoView).toHaveBeenCalledTimes(1)
    await user.click(screen.getByRole('button', { name: UI.quote.actions.line }))
    await act(async () => { vi.runAllTimers() })
    expect(HTMLElement.prototype.scrollIntoView).toHaveBeenCalledTimes(2)
    expect(document.getElementById('stage-02-copy')).toHaveFocus()
    expect(screen.getByRole('status')).toHaveTextContent(ANNOUNCE.completed(EXPERIENCE_LABELS.quote))
  })
})
