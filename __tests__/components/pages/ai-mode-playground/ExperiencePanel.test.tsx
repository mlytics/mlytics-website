import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useReducer } from 'react'
import { describe, expect, it, vi } from 'vitest'
import { ExperiencePanel } from '@/components/pages/ai-mode-playground/ExperiencePanel'
import {
  EXPERIENCE_INSTRUCTIONS,
  EXPERIENCE_LABELS,
  LISTEN_DURATION_SECONDS,
  LISTEN_TRANSCRIPT_SENTENCES,
  LISTEN_TRANSCRIPT_TEXT,
  QUOTE_FEEDBACK_OPTIONS,
  QUOTE_OPTIONS,
  UI,
} from '@/components/pages/ai-mode-playground/ai-mode-playground-copy'
import {
  INITIAL_STATE,
  playgroundReducer,
  type PlaygroundState,
} from '@/components/pages/ai-mode-playground/playground-logic'

function Harness({ initial = INITIAL_STATE, callbacks = {} }: { initial?: PlaygroundState; callbacks?: Record<string, (...args: unknown[]) => unknown> }) {
  const [state, dispatch] = useReducer(playgroundReducer, initial)
  return (
    <ExperiencePanel
      state={state}
      onSelectExperience={(id) => { callbacks.select?.(id); dispatch({ type: 'experience/select', id }) }}
      onReset={() => { callbacks.reset?.(); dispatch({ type: 'experience/reset' }) }}
      onChooseQuestion={(index) => { callbacks.choose?.(index); dispatch({ type: 'chat/choose', index }) }}
      onSelectQuote={(index) => { callbacks.quote?.(index); dispatch({ type: 'quote/select', index }) }}
      onFeedback={(value) => { callbacks.feedback?.(value); dispatch({ type: 'quote/feedback', value }) }}
      onSignature={(value) => { callbacks.signature?.(value); dispatch({ type: 'quote/signature', value }) }}
      onShare={(action) => { callbacks.share?.(action); dispatch({ type: 'quote/share', action }) }}
      onRevealSignal={() => { callbacks.reveal?.() }}
      onListenToggle={() => { callbacks.toggle?.(); dispatch({ type: 'listen/toggle' }) }}
      onListenReplay={() => { callbacks.replay?.(); dispatch({ type: 'listen/replay' }) }}
      onListenRetry={() => { callbacks.retry?.(); dispatch({ type: 'listen/replay' }) }}
    />
  )
}

describe('ExperiencePanel', () => {
  it('renders Chat, Quote, Listen tabs with roving tabIndex and manual activation', async () => {
    const user = userEvent.setup()
    const select = vi.fn()
    render(<Harness callbacks={{ select }} />)
    const tabs = screen.getAllByRole('tab')
    expect(tabs.map((tab) => tab.textContent)).toEqual(Object.values(EXPERIENCE_LABELS))
    expect(tabs.map((tab) => tab.getAttribute('tabindex'))).toEqual(['0', '-1', '-1'])
    tabs[0].focus()
    await user.keyboard('{ArrowRight}')
    expect(tabs[1]).toHaveFocus()
    expect(tabs[0]).toHaveAttribute('aria-selected', 'true')
    expect(select).not.toHaveBeenCalled()
    await user.keyboard('{Enter}')
    expect(select).toHaveBeenCalledWith('quote')
    await user.keyboard('{End}')
    await user.keyboard('{Enter}')
    expect(select).toHaveBeenCalledWith('listen')
    await user.keyboard('{Space}')
    expect(select).toHaveBeenCalledWith('listen')
  })

  it('updates the tabpanel label and instruction for the selected experience', () => {
    render(<Harness initial={{ ...INITIAL_STATE, experience: 'quote' }} />)
    expect(screen.getByRole('tabpanel')).toHaveAttribute('aria-labelledby', 'experience-tab-quote')
    expect(screen.getByText(EXPERIENCE_INSTRUCTIONS.quote)).toBeInTheDocument()
  })

  it('renders Chat questions, marks the selected question, and resets through the current tab', async () => {
    const user = userEvent.setup()
    const choose = vi.fn()
    const reset = vi.fn()
    render(<Harness initial={{ ...INITIAL_STATE, chatQuestionIndex: 1 }} callbacks={{ choose, reset }} />)
    const list = screen.getByRole('list', { name: UI.chat.questionsLabel })
    expect(list.querySelectorAll('li')).toHaveLength(3)
    const options = screen.getAllByRole('button', { pressed: true })
    expect(options).toHaveLength(1)
    expect(options[0]).toHaveTextContent('iPhone 18 Pro vs. iPhone Duo')
    expect(screen.queryByText(/grounded/i)).not.toBeInTheDocument()
    await user.click(screen.getAllByRole('button', { name: /iPhone 18 Pro full specs/i })[0])
    expect(choose).toHaveBeenCalledWith(0)
    await user.click(screen.getByRole('button', { name: UI.reset }))
    expect(reset).toHaveBeenCalledOnce()
    expect(screen.getByRole('tab', { name: EXPERIENCE_LABELS.chat })).toHaveFocus()
  })

  it('renders the Quote preview, controlled signature, feedback radios, and shares', async () => {
    const user = userEvent.setup()
    const callbacks = { quote: vi.fn(), feedback: vi.fn(), signature: vi.fn(), share: vi.fn() }
    const { rerender } = render(<Harness initial={{ ...INITIAL_STATE, experience: 'quote' }} callbacks={callbacks} />)
    expect(screen.getByText(UI.quote.previewEmpty)).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: UI.quote.actions.line })).not.toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: QUOTE_OPTIONS[0] }))
    expect(callbacks.quote).toHaveBeenCalledWith(0)

    const quoteState = { ...INITIAL_STATE, experience: 'quote' as const, quote: { index: 0 as const, feedback: '', signature: '', shareActions: [] } }
    rerender(<Harness key="quote-selected" initial={quoteState} callbacks={callbacks} />)
    // The gold CSS mark is the only quote symbol: the text carries no inline marks.
    expect(screen.getByRole('blockquote').textContent).toBe(QUOTE_OPTIONS[0])
    expect(screen.getByText(UI.quote.anonymous)).toBeInTheDocument()
    expect(screen.getByText(UI.quote.sponsoredBy)).toBeInTheDocument()
    expect(screen.getByRole('img', { name: 'Mlytics' })).toHaveAttribute('src', '/logo.svg')
    const input = screen.getByRole('textbox', { name: UI.quote.signatureLabel })
    await user.type(input, 'Ann')
    expect(callbacks.signature).toHaveBeenLastCalledWith('Ann')
    expect(input).toHaveFocus()
    expect(screen.getByText('Ann')).toBeInTheDocument()
    await user.click(screen.getByRole('radio', { name: 'Helpful' }))
    expect(callbacks.feedback).toHaveBeenCalledWith('Helpful')
    expect(screen.getByRole('radio', { name: 'Helpful' })).toHaveAttribute('aria-checked', 'true')
    expect(screen.getByRole('radio', { name: 'Resonates' })).toHaveAttribute('aria-checked', 'false')
    await user.click(screen.getByRole('button', { name: UI.quote.actions.fb }))
    expect(callbacks.share).toHaveBeenCalledWith('fb')
  })

  it('renders LINE, FB and Share buttons, each with one decorative icon', () => {
    const quoteState = { ...INITIAL_STATE, experience: 'quote' as const, quote: { index: 0 as const, feedback: '', signature: '', shareActions: [] } }
    render(<Harness initial={quoteState} />)
    const group = screen.getByRole('group', { name: UI.quote.actionsLabel })
    const buttons = Array.from(group.querySelectorAll('button'))
    expect(buttons.map((button) => button.textContent)).toEqual(['LINE', 'FB', 'Share'])
    for (const name of ['LINE', 'FB', 'Share']) {
      const button = screen.getByRole('button', { name })
      expect(button.querySelectorAll('svg')).toHaveLength(1)
      expect(button.querySelectorAll('svg[aria-hidden="true"]')).toHaveLength(1)
      expect(button.querySelector('svg')).toHaveAttribute('focusable', 'false')
    }
    expect(screen.queryByRole('button', { name: /Download/ })).not.toBeInTheDocument()
  })

  it('shows the reveal link only when a feeling is set, outside the share group, and calls onRevealSignal', async () => {
    const user = userEvent.setup()
    const reveal = vi.fn()
    const lineOnly = { ...INITIAL_STATE, experience: 'quote' as const, quote: { index: 0 as const, feedback: '', signature: '', shareActions: [] } }
    const { rerender } = render(<Harness initial={lineOnly} callbacks={{ reveal }} />)
    expect(screen.queryByRole('button', { name: UI.quote.revealSignal })).not.toBeInTheDocument()

    rerender(<Harness key="with-feeling" initial={{ ...lineOnly, quote: { ...lineOnly.quote, feedback: 'Helpful' } }} callbacks={{ reveal }} />)
    const link = screen.getByRole('button', { name: UI.quote.revealSignal })
    expect(link.textContent).toBe(UI.quote.revealSignal)
    expect(screen.getByRole('group', { name: UI.quote.actionsLabel })).not.toContainElement(link)
    await user.click(link)
    expect(reveal).toHaveBeenCalledTimes(1)
  })

  it('moves focus through feedback radios with arrows/Home/End and selects only on Space', async () => {
    const user = userEvent.setup()
    const feedback = vi.fn()
    const quoteState = { ...INITIAL_STATE, experience: 'quote' as const, quote: { index: 0 as const, feedback: '', signature: '', shareActions: [] } }
    render(<Harness initial={quoteState} callbacks={{ feedback }} />)
    const radios = screen.getAllByRole('radio')
    const tabindexes = () => radios.map((radio) => radio.getAttribute('tabindex'))
    const checked = () => radios.map((radio) => radio.getAttribute('aria-checked'))
    expect(radios.map((radio) => radio.textContent)).toEqual([...QUOTE_FEEDBACK_OPTIONS])
    // Nothing checked: only the first radio is in the tab order.
    expect(tabindexes()).toEqual(['0', '-1', '-1'])

    radios[0].focus()
    await user.keyboard('{ArrowRight}')
    expect(radios[1]).toHaveFocus()
    expect(tabindexes()).toEqual(['-1', '0', '-1'])
    await user.keyboard('{ArrowDown}')
    expect(radios[2]).toHaveFocus()
    await user.keyboard('{ArrowRight}')
    expect(radios[0]).toHaveFocus()
    await user.keyboard('{ArrowLeft}')
    expect(radios[2]).toHaveFocus()
    await user.keyboard('{ArrowUp}')
    expect(radios[1]).toHaveFocus()
    await user.keyboard('{Home}')
    expect(radios[0]).toHaveFocus()
    await user.keyboard('{End}')
    expect(radios[2]).toHaveFocus()
    expect(tabindexes()).toEqual(['-1', '-1', '0'])
    // Focus movement alone never selects.
    expect(feedback).not.toHaveBeenCalled()
    expect(checked()).toEqual(['false', 'false', 'false'])

    await user.keyboard('{ArrowLeft}')
    await user.keyboard(' ')
    expect(feedback).toHaveBeenCalledOnce()
    expect(feedback).toHaveBeenLastCalledWith(QUOTE_FEEDBACK_OPTIONS[1])
    expect(checked()).toEqual(['false', 'true', 'false'])

    // Leaving the group hands the tab stop back to the checked radio.
    await user.keyboard('{ArrowRight}')
    expect(tabindexes()).toEqual(['-1', '-1', '0'])
    await user.tab()
    expect(radios[2]).not.toHaveFocus()
    expect(tabindexes()).toEqual(['-1', '0', '-1'])
    expect(feedback).toHaveBeenCalledOnce()
  })

  it('renders Listen progress and changes play/pause/replay labels without a status role', async () => {
    const user = userEvent.setup()
    const toggle = vi.fn()
    const replay = vi.fn()
    const { rerender } = render(<Harness initial={{ ...INITIAL_STATE, experience: 'listen' }} callbacks={{ toggle, replay }} />)
    expect(screen.getByRole('button', { name: UI.listen.play })).toBeInTheDocument()
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '0')
    expect(screen.getByText('0:00').parentElement).toHaveTextContent('0:00 / 0:27')
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuetext', '0 of 27 seconds')
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuemax', String(LISTEN_DURATION_SECONDS))
    expect(screen.queryByRole('status')).not.toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: UI.listen.play }))
    expect(toggle).toHaveBeenCalledOnce()

    rerender(<Harness key="listen-playing" initial={{ ...INITIAL_STATE, experience: 'listen', listen: { status: 'playing', elapsed: 5 } }} callbacks={{ toggle, replay }} />)
    expect(screen.getByRole('button', { name: UI.listen.pause })).toBeInTheDocument()
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '5')
    expect(screen.getByText('0:05').parentElement).toHaveTextContent('0:05 / 0:27')
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuetext', '5 of 27 seconds')

    rerender(<Harness key="listen-completed" initial={{ ...INITIAL_STATE, experience: 'listen', listen: { status: 'completed', elapsed: 27 } }} callbacks={{ toggle, replay }} />)
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '27')
    await user.click(screen.getByRole('button', { name: UI.listen.replay }))
    expect(replay).toHaveBeenCalledOnce()
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '0')
  })

  const iconPaths = (button: HTMLElement) => {
    const svgs = button.querySelectorAll('svg')
    expect(svgs).toHaveLength(1)
    const svg = svgs[0]
    expect(svg).toHaveAttribute('aria-hidden', 'true')
    expect(svg).toHaveAttribute('focusable', 'false')
    expect(svg).toHaveAttribute('viewBox', '0 0 24 24')
    expect(svg).toHaveAttribute('width', '18')
    expect(svg).toHaveAttribute('height', '18')
    return { svg, paths: Array.from(svg.querySelectorAll('path')) }
  }

  it.each([
    ['idle', { status: 'idle', elapsed: 0 }, UI.listen.play],
    ['paused', { status: 'paused', elapsed: 7 }, UI.listen.play],
  ] as const)('renders the play icon on the Listen toggle when %s', (_name, listen, label) => {
    render(<Harness initial={{ ...INITIAL_STATE, experience: 'listen', listen }} />)
    const button = screen.getByRole('button', { name: label })
    const { svg, paths } = iconPaths(button)
    expect(svg).toHaveAttribute('fill', 'currentColor')
    expect(paths.map((path) => path.getAttribute('d'))).toEqual(['M8 5v14l11-7L8 5Z'])
    expect(button).toHaveTextContent(label)
  })

  it('renders the pause icon on the Listen toggle while playing', () => {
    render(<Harness initial={{ ...INITIAL_STATE, experience: 'listen', listen: { status: 'playing', elapsed: 5 } }} />)
    const button = screen.getByRole('button', { name: UI.listen.pause })
    const { svg, paths } = iconPaths(button)
    expect(svg).toHaveAttribute('fill', 'currentColor')
    expect(paths.map((path) => path.getAttribute('d'))).toEqual(['M7 5h3v14H7zM14 5h3v14h-3z'])
    expect(button).toHaveTextContent(UI.listen.pause)
  })

  it('renders the lucide RotateCcw replay icon on the Listen toggle when completed', () => {
    render(<Harness initial={{ ...INITIAL_STATE, experience: 'listen', listen: { status: 'completed', elapsed: 27 } }} />)
    const button = screen.getByRole('button', { name: UI.listen.replay })
    const { svg, paths } = iconPaths(button)
    expect(svg).toHaveClass('lucide', 'lucide-rotate-ccw')
    expect(svg.getAttribute('class')).toMatch(/listenIcon/)
    expect(svg).toHaveAttribute('fill', 'none')
    expect(svg).toHaveAttribute('stroke', 'currentColor')
    expect(svg).toHaveAttribute('stroke-width', '2')
    // The well-formed lucide glyph, not the old malformed arc + detached corner.
    expect(paths.map((path) => path.getAttribute('d'))).toEqual(['M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8', 'M3 3v5h5'])
    expect(button).toHaveTextContent(UI.listen.replay)
  })

  it('shows Try again with the play icon and a visible error message when the audio fails', async () => {
    const user = userEvent.setup()
    const retry = vi.fn()
    render(<Harness initial={{ ...INITIAL_STATE, experience: 'listen', listen: { status: 'error', elapsed: 4 } }} callbacks={{ retry }} />)
    const button = screen.getByRole('button', { name: UI.listen.retry })
    const { paths } = iconPaths(button)
    expect(paths.map((path) => path.getAttribute('d'))).toEqual(['M8 5v14l11-7L8 5Z'])
    expect(button).toHaveAttribute('aria-describedby', 'listen-error')
    expect(document.getElementById('listen-error')).toHaveTextContent(UI.listen.error)
    expect(screen.getByText(UI.listen.status.unavailable)).toBeInTheDocument()
    await user.click(button)
    expect(retry).toHaveBeenCalledOnce()
    expect(screen.getByRole('button', { name: UI.listen.pause })).not.toHaveAttribute('aria-describedby')
    expect(document.getElementById('listen-error')).not.toBeInTheDocument()
  })

  it('renders a closed transcript disclosure with the three narrated paragraphs', async () => {
    const user = userEvent.setup()
    render(<Harness initial={{ ...INITIAL_STATE, experience: 'listen' }} />)
    const summary = screen.getByText(UI.listen.transcript)
    expect(summary.tagName).toBe('SUMMARY')
    const details = summary.closest('details')!
    expect(details).not.toHaveAttribute('open')
    const paragraphs = Array.from(details.querySelectorAll('p')).map((p) => p.textContent)
    expect(paragraphs).toEqual([...LISTEN_TRANSCRIPT_TEXT])
    expect(paragraphs).toHaveLength(3)
    await user.click(summary)
    expect(details).toHaveAttribute('open')
  })

  it('renders one span per transcript sentence and marks only the active one', () => {
    const { rerender } = render(<ExperiencePanel {...panelProps(-1)} />)
    const sentences = () => Array.from(document.querySelectorAll('[data-sentence]'))
    expect(sentences().map((element) => element.textContent)).toEqual(LISTEN_TRANSCRIPT_SENTENCES.map((sentence) => sentence.text))
    expect(document.querySelectorAll('[aria-current]')).toHaveLength(0)
    rerender(<ExperiencePanel {...panelProps(4)} />)
    expect(sentences().filter((element) => element.getAttribute('aria-current') === 'true').map((element) => element.getAttribute('data-sentence'))).toEqual(['4'])
  })

  it('splits the Listen time label into the current time and a separately hideable total', () => {
    render(<Harness initial={{ ...INITIAL_STATE, experience: 'listen', listen: { status: 'paused', elapsed: 9 } }} />)
    const current = screen.getByText('0:09')
    const total = screen.getByText('/ 0:27')
    expect(current.tagName).toBe('SPAN')
    expect(total.tagName).toBe('SPAN')
    expect(total.textContent).toBe(' / 0:27')
    expect(current.parentElement).toBe(total.parentElement)
    expect(current.parentElement).toHaveTextContent('0:09 / 0:27')
    expect(current.parentElement!.children).toHaveLength(2)
    expect(total.className).toMatch(/listenTimeTotal/)
    // The total is still available to assistive tech through the progressbar.
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuetext', '9 of 27 seconds')
  })
})

const noop = () => {}
const panelProps = (activeSentence: number) => ({
  state: { ...INITIAL_STATE, experience: 'listen' as const, listen: { status: 'playing' as const, elapsed: 15 } },
  onSelectExperience: noop,
  onReset: noop,
  onChooseQuestion: noop,
  onSelectQuote: noop,
  onFeedback: noop,
  onSignature: noop,
  onShare: noop,
  onRevealSignal: noop,
  onListenToggle: noop,
  onListenReplay: noop,
  onListenRetry: noop,
  activeSentence,
})
