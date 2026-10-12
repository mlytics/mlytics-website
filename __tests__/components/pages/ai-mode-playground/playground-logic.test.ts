import { describe, expect, it } from 'vitest'
import {
  activePathContent,
  activeSentenceIndex,
  deriveCaptures,
  formatTime,
  INITIAL_STATE,
  nextTabIndex,
  pickActiveStage,
  playgroundReducer,
  progressFillPx,
  stageStates,
} from '@/components/pages/ai-mode-playground/playground-logic'
import {
  ANNOUNCE,
  CAPTURE,
  CHAT_QUESTIONS,
  EXPERIENCE_DEFAULT_OBSERVATION,
  LISTEN_DURATION_SECONDS,
  LISTEN_OPENING_SPONSOR_END_SECONDS,
  LISTEN_TRANSCRIPT,
  LISTEN_TRANSCRIPT_SENTENCES,
  LISTEN_TRANSCRIPT_TEXT,
  PATHS,
  QUOTE_OPTIONS,
  UI,
} from '@/components/pages/ai-mode-playground/ai-mode-playground-copy'

describe('activePathContent', () => {
  it('uses chat variants only for chat, including question two', () => {
    for (const lens of ['content-owners', 'brands'] as const) {
      for (const path of PATHS[lens]) {
        expect(activePathContent(path, 'chat', 2)).toBe(path.chatVariants[2])
        expect(activePathContent(path, 'chat', null)).toBe(path)
        expect(activePathContent(path, 'quote', 1)).toBe(path)
        expect(activePathContent(path, 'listen', 1)).toBe(path)
      }
    }
  })
})

describe('deriveCaptures', () => {
  it('derives chat, quote, and listen captures from state', () => {
    expect(deriveCaptures(INITIAL_STATE)).toEqual({})

    const chatState = playgroundReducer(INITIAL_STATE, { type: 'chat/choose', index: 1 })
    expect(deriveCaptures(chatState)).toEqual({ chat: CAPTURE.chat(CHAT_QUESTIONS[1]) })

    const quoteState = playgroundReducer(INITIAL_STATE, { type: 'quote/select', index: 0 })
    expect(deriveCaptures(quoteState).quote).toEqual(
      CAPTURE.quote({ quote: QUOTE_OPTIONS[0], feedback: '', shareActions: [] }),
    )
  })

  it('preserves quote feedback and share labels in order', () => {
    let state = playgroundReducer(INITIAL_STATE, { type: 'quote/select', index: 0 })
    state = playgroundReducer(state, { type: 'quote/feedback', value: 'Helpful' })
    state = playgroundReducer(state, { type: 'quote/share', action: 'fb' })
    state = playgroundReducer(state, { type: 'quote/share', action: 'line' })
    expect(deriveCaptures(state).quote?.rawSignal).toContain(UI.quote.actions.fb)
    expect(deriveCaptures(state).quote?.rawSignal).toContain(UI.quote.actions.line)
    expect(deriveCaptures(state).quote?.rawSignal?.indexOf(UI.quote.actions.fb)).toBeLessThan(
      deriveCaptures(state).quote?.rawSignal?.indexOf(UI.quote.actions.line) ?? 0,
    )
  })

  it('names the generic Share button "generic" in the capture, never "Share share"', () => {
    let state = playgroundReducer(INITIAL_STATE, { type: 'quote/select', index: 0 })
    for (const action of ['line', 'fb', 'share'] as const) state = playgroundReducer(state, { type: 'quote/share', action })
    const all = deriveCaptures(state).quote?.rawSignal
    expect(all).toContain('clicked the LINE, FB, and generic share buttons')
    expect(all).not.toMatch(/Share share/i)

    let alone = playgroundReducer(INITIAL_STATE, { type: 'quote/select', index: 0 })
    alone = playgroundReducer(alone, { type: 'quote/share', action: 'share' })
    expect(deriveCaptures(alone).quote?.rawSignal).toContain('clicked the generic share button')
    expect(deriveCaptures(alone).quote?.rawSignal).not.toMatch(/Share share/i)
  })

  it('maps listen lifecycle to started/completed captures', () => {
    let state = playgroundReducer(INITIAL_STATE, { type: 'listen/toggle' })
    expect(deriveCaptures(state).listen).toEqual(CAPTURE.listen({ status: 'playing', elapsed: 0 }))
    state = playgroundReducer(state, { type: 'listen/toggle' })
    expect(deriveCaptures(state).listen).toEqual(CAPTURE.listen({ status: 'paused', elapsed: 0 }))
    state = playgroundReducer(state, { type: 'listen/toggle' })
    state = playgroundReducer(state, { type: 'listen/progress', elapsed: 12.4 })
    expect(deriveCaptures(state).listen?.rawSignal).toBe('Played so far: 12 of 27 seconds (44%). Opening sponsor message (demo sponsor: Mlytics): played. Closing sponsor message: not yet played.')
    state = playgroundReducer(state, { type: 'listen/complete' })
    expect(deriveCaptures(state).listen).toEqual(CAPTURE.listen({ status: 'completed', elapsed: 27 }))
    expect(deriveCaptures(INITIAL_STATE)).not.toHaveProperty('listen')
  })
})

describe('playgroundReducer', () => {
  it('returns the same state object when re-choosing the already-chosen Chat answer', () => {
    const state = playgroundReducer(INITIAL_STATE, { type: 'chat/choose', index: 1 })
    expect(playgroundReducer(state, { type: 'chat/choose', index: 1 })).toBe(state)
    expect(playgroundReducer(state, { type: 'chat/choose', index: 2 })).not.toBe(state)
    expect(playgroundReducer(state, { type: 'chat/choose', index: 2 }).chatQuestionIndex).toBe(2)
  })

  it('returns the same state object when re-selecting the already-selected feedback', () => {
    const state = playgroundReducer(
      playgroundReducer(INITIAL_STATE, { type: 'quote/select', index: 0 }),
      { type: 'quote/feedback', value: 'Helpful' },
    )
    expect(playgroundReducer(state, { type: 'quote/feedback', value: 'Helpful' })).toBe(state)
    expect(playgroundReducer(state, { type: 'quote/feedback', value: 'Resonates' })).not.toBe(state)
  })

  it('clears quote details only when selecting a different quote', () => {
    let state = playgroundReducer(INITIAL_STATE, { type: 'quote/select', index: 0 })
    state = playgroundReducer(state, { type: 'quote/feedback', value: 'Helpful' })
    state = playgroundReducer(state, { type: 'quote/signature', value: 'Ann' })
    state = playgroundReducer(state, { type: 'quote/share', action: 'fb' })
    const same = playgroundReducer(state, { type: 'quote/select', index: 0 })
    expect(same.quote).toEqual(state.quote)
    expect(playgroundReducer(state, { type: 'quote/select', index: 1 }).quote).toEqual({
      index: 1,
      feedback: '',
      signature: '',
      shareActions: [],
    })
  })

  it('stores feedback before a quote without creating a capture and dedupes shares', () => {
    let state = playgroundReducer(INITIAL_STATE, { type: 'quote/feedback', value: 'Helpful' })
    expect(state.quote.feedback).toBe('Helpful')
    expect(deriveCaptures(state)).toEqual({})
    state = playgroundReducer(state, { type: 'quote/select', index: 1 })
    state = playgroundReducer(state, { type: 'quote/share', action: 'fb' })
    state = playgroundReducer(state, { type: 'quote/share', action: 'fb' })
    expect(state.quote.shareActions).toEqual(['fb'])
    expect(playgroundReducer(INITIAL_STATE, { type: 'quote/share', action: 'line' })).toEqual(INITIAL_STATE)
  })

  it('resets incomplete listen when leaving it but preserves completed listen', () => {
    let state = playgroundReducer(INITIAL_STATE, { type: 'experience/select', id: 'listen' })
    state = playgroundReducer(state, { type: 'listen/toggle' })
    state = playgroundReducer(state, { type: 'listen/progress', elapsed: 1 })
    expect(playgroundReducer(state, { type: 'experience/select', id: 'quote' }).listen).toEqual({ status: 'idle', elapsed: 0 })

    state = playgroundReducer(INITIAL_STATE, { type: 'experience/select', id: 'listen' })
    state = playgroundReducer(state, { type: 'listen/toggle' })
    state = playgroundReducer(state, { type: 'listen/complete' })
    expect(playgroundReducer(state, { type: 'experience/select', id: 'quote' }).listen).toEqual({ status: 'completed', elapsed: 27 })
  })

  it('resets paused listen when leaving it', () => {
    let state = playgroundReducer(INITIAL_STATE, { type: 'experience/select', id: 'listen' })
    state = playgroundReducer(state, { type: 'listen/toggle' })
    state = playgroundReducer(state, { type: 'listen/toggle' })
    expect(state.listen.status).toBe('paused')
    expect(playgroundReducer(state, { type: 'experience/select', id: 'quote' }).listen).toEqual({ status: 'idle', elapsed: 0 })
  })

  it('keeps captures across experience switches and resets only the current slice', () => {
    let state = playgroundReducer(INITIAL_STATE, { type: 'chat/choose', index: 1 })
    state = playgroundReducer(state, { type: 'experience/select', id: 'quote' })
    state = playgroundReducer(state, { type: 'quote/select', index: 0 })
    state = playgroundReducer(state, { type: 'experience/select', id: 'chat' })
    expect(deriveCaptures(state)).toHaveProperty('chat')
    expect(deriveCaptures(state)).toHaveProperty('quote')
    state = playgroundReducer(state, { type: 'experience/reset' })
    expect(state.chatQuestionIndex).toBeNull()
    expect(state.quote.index).toBe(0)
  })

  it('resets only the quote slice while the quote experience is active', () => {
    let state = playgroundReducer(INITIAL_STATE, { type: 'chat/choose', index: 1 })
    state = playgroundReducer(state, { type: 'experience/select', id: 'quote' })
    state = playgroundReducer(state, { type: 'quote/select', index: 0 })
    state = playgroundReducer(state, { type: 'quote/feedback', value: 'Helpful' })
    state = playgroundReducer(state, { type: 'experience/reset' })
    expect(state.quote).toEqual({ index: null, feedback: '', signature: '', shareActions: [] })
    expect(state.chatQuestionIndex).toBe(1)
  })

  it('completes listen at 27 and restarts completed listen', () => {
    expect(LISTEN_DURATION_SECONDS).toBe(27)
    let state = playgroundReducer(INITIAL_STATE, { type: 'listen/toggle' })
    state = playgroundReducer(state, { type: 'listen/progress', elapsed: 26.6 })
    expect(state.listen).toEqual({ status: 'playing', elapsed: 26 })
    state = playgroundReducer(state, { type: 'listen/complete' })
    expect(state.listen).toEqual({ status: 'completed', elapsed: 27 })
    const restarted = playgroundReducer(state, { type: 'listen/toggle' })
    expect(restarted.listen).toEqual({ status: 'playing', elapsed: 0 })
    expect(deriveCaptures(restarted).listen).toEqual(CAPTURE.listen({ status: 'playing', elapsed: 0 }))
    expect(playgroundReducer(state, { type: 'listen/replay' }).listen).toEqual({ status: 'playing', elapsed: 0 })
  })
})

describe('playgroundReducer: media events', () => {
  const playing = { ...INITIAL_STATE, experience: 'listen' as const, listen: { status: 'playing' as const, elapsed: 3 } }
  const paused = { ...playing, listen: { status: 'paused' as const, elapsed: 3 } }
  const idle = { ...playing, listen: { status: 'idle' as const, elapsed: 0 } }
  const completed = { ...playing, listen: { status: 'completed' as const, elapsed: 27 } }
  const errored = { ...playing, listen: { status: 'error' as const, elapsed: 3 } }

  it('floors progress and returns the same reference when the second has not changed', () => {
    expect(playgroundReducer(playing, { type: 'listen/progress', elapsed: 3.9 })).toBe(playing)
    const next = playgroundReducer(playing, { type: 'listen/progress', elapsed: 5.4 })
    expect(next.listen).toEqual({ status: 'playing', elapsed: 5 })
    expect(playgroundReducer(next, { type: 'listen/progress', elapsed: 5.99 })).toBe(next)
    expect(playgroundReducer(paused, { type: 'listen/progress', elapsed: 8 }).listen).toEqual({ status: 'paused', elapsed: 8 })
  })

  it('clamps progress to 0..LISTEN_DURATION_SECONDS', () => {
    expect(playgroundReducer(playing, { type: 'listen/progress', elapsed: -4 }).listen.elapsed).toBe(0)
    expect(playgroundReducer(playing, { type: 'listen/progress', elapsed: 99 }).listen.elapsed).toBe(LISTEN_DURATION_SECONDS)
    expect(playgroundReducer(playing, { type: 'listen/progress', elapsed: Number.NaN })).toBe(playing)
  })

  it.each([['idle', idle], ['completed', completed], ['error', errored]] as const)('ignores progress when %s', (_name, state) => {
    expect(playgroundReducer(state, { type: 'listen/progress', elapsed: 9 })).toBe(state)
  })

  it('completes only from playing or paused', () => {
    expect(playgroundReducer(playing, { type: 'listen/complete' }).listen).toEqual({ status: 'completed', elapsed: 27 })
    expect(playgroundReducer(paused, { type: 'listen/complete' }).listen).toEqual({ status: 'completed', elapsed: 27 })
    expect(playgroundReducer(idle, { type: 'listen/complete' })).toBe(idle)
    expect(playgroundReducer(completed, { type: 'listen/complete' })).toBe(completed)
    expect(playgroundReducer(errored, { type: 'listen/complete' })).toBe(errored)
  })

  it('ignores a stale error unless playing or paused', () => {
    for (const state of [idle, completed, errored]) expect(playgroundReducer(state, { type: 'listen/error' })).toBe(state)
  })

  it('guards mediaPause and mediaPlay', () => {
    expect(playgroundReducer(playing, { type: 'listen/mediaPause' }).listen).toEqual({ status: 'paused', elapsed: 3 })
    for (const state of [paused, idle, completed, errored]) expect(playgroundReducer(state, { type: 'listen/mediaPause' })).toBe(state)
    expect(playgroundReducer(paused, { type: 'listen/mediaPlay' }).listen).toEqual({ status: 'playing', elapsed: 3 })
    for (const state of [playing, idle, completed, errored]) expect(playgroundReducer(state, { type: 'listen/mediaPlay' })).toBe(state)
  })

  it('moves to error keeping elapsed and the last partial signal, and retries through replay', () => {
    const next = playgroundReducer(playing, { type: 'listen/error' })
    expect(next.listen).toEqual({ status: 'error', elapsed: 3 })
    expect(deriveCaptures(next).listen).toEqual(CAPTURE.listen({ status: 'error', elapsed: 3 }))
    expect(playgroundReducer(paused, { type: 'listen/error' }).listen).toEqual({ status: 'error', elapsed: 3 })
    const atStart = playgroundReducer({ ...playing, listen: { status: 'playing', elapsed: 0 } }, { type: 'listen/error' })
    expect(atStart.listen.status).toBe('error')
    expect(deriveCaptures(atStart)).not.toHaveProperty('listen')
    expect(playgroundReducer(next, { type: 'listen/error' })).toBe(next)
    expect(playgroundReducer(next, { type: 'listen/replay' }).listen).toEqual({ status: 'playing', elapsed: 0 })
  })
})

describe('CAPTURE.listen', () => {
  const total = LISTEN_DURATION_SECONDS
  const opening = '(demo sponsor: Mlytics)'

  it('ties the opening sponsor threshold to the measured sentence timings', () => {
    expect(LISTEN_OPENING_SPONSOR_END_SECONDS).toBe(3)
    expect(LISTEN_TRANSCRIPT_SENTENCES[1].start).toBeGreaterThan(LISTEN_OPENING_SPONSOR_END_SECONDS - 1)
    expect(LISTEN_TRANSCRIPT_SENTENCES[1].start).toBeLessThanOrEqual(LISTEN_OPENING_SPONSOR_END_SECONDS + 1)
  })

  it.each([
    [0, 0],
    [1, 4],
    [2, 7],
  ])('playing at %i s (before the opening sponsor finishes) is state 1 at %i%%', (e, pct) => {
    expect(CAPTURE.listen({ status: 'playing', elapsed: e })).toEqual({
      observation: 'The user pressed play and started the article’s audio overview.',
      rawSignal: `Played so far: ${e} of ${total} seconds (${pct}%). Opening sponsor message ${opening}: in progress.`,
    })
  })

  it.each([
    [3, 11],
    [12, 44],
    [26, 96],
  ])('playing at %i s (past the opening sponsor) is state 2 at %i%%', (e, pct) => {
    expect(CAPTURE.listen({ status: 'playing', elapsed: e })).toEqual({
      observation: `The audio overview is playing and has played past the opening sponsor message ${opening}.`,
      rawSignal: `Played so far: ${e} of ${total} seconds (${pct}%). Opening sponsor message ${opening}: played. Closing sponsor message: not yet played.`,
    })
  })

  it.each([
    [3, 11],
    [12, 44],
  ])('paused at %i s (after the opening sponsor) is state 3 at %i%%', (e, pct) => {
    expect(CAPTURE.listen({ status: 'paused', elapsed: e })).toEqual({
      observation: `The user paused the audio at ${e} seconds (${pct}%). The opening sponsor message ${opening} played.`,
      rawSignal: `Paused at ${e} of ${total} seconds (${pct}%). Opening sponsor message ${opening}: played. Closing sponsor message: not played.`,
    })
  })

  it.each([
    [0, '0 seconds', 0],
    [1, '1 second', 4],
    [2, '2 seconds', 7],
  ])('paused at %i s (before the opening sponsor finishes) is state 4: "%s" at %i%%', (e, listened, pct) => {
    expect(CAPTURE.listen({ status: 'paused', elapsed: e })).toEqual({
      observation: `The user paused the audio at ${listened} (${pct}%), before the opening sponsor message ${opening} finished.`,
      rawSignal: `Paused at ${e} of ${total} seconds (${pct}%). Opening sponsor message ${opening}: not finished.`,
    })
  })

  it('completed is state 5 with both sponsor impressions', () => {
    expect(CAPTURE.listen({ status: 'completed', elapsed: 27 })).toEqual({
      observation: `The user played the full 27-second audio overview. Both sponsor messages ${opening} played.`,
      rawSignal: `Played: 27 of 27 seconds (100%). Sponsor message impressions ${opening}: 2 of 2.`,
    })
  })

  it('gives no listen capture when idle or when an error hit before any audio played', () => {
    expect(deriveCaptures({ ...INITIAL_STATE, listen: { status: 'idle', elapsed: 0 } })).not.toHaveProperty('listen')
    expect(deriveCaptures({ ...INITIAL_STATE, listen: { status: 'error', elapsed: 0 } })).not.toHaveProperty('listen')
  })

  it.each([
    [1, '1 second', 4, false],
    [2, '2 seconds', 7, false],
    [3, '3 seconds', 11, true],
    [12, '12 seconds', 44, true],
  ])('an error at %i s keeps the partial signal ("%s", %i%%)', (e, seconds, pct, openingPlayed) => {
    const expected = {
      observation: `The audio stopped at ${seconds} (${pct}%) because playback failed.${openingPlayed ? ` The opening sponsor message ${opening} played.` : ''}`,
      rawSignal: `Stopped by a playback error at ${e} of ${total} seconds (${pct}%). Opening sponsor message ${opening}: ${openingPlayed ? 'played' : 'not finished'}.`,
    }
    expect(CAPTURE.listen({ status: 'error', elapsed: e })).toEqual(expected)
    expect(deriveCaptures({ ...INITIAL_STATE, listen: { status: 'error', elapsed: e } }).listen).toEqual(expected)
  })
})

describe('activeSentenceIndex', () => {
  it('returns the last sentence that has started, on the measured timings', () => {
    expect(activeSentenceIndex(0)).toBe(0)
    expect(activeSentenceIndex(3.11)).toBe(0)
    expect(activeSentenceIndex(3.12)).toBe(1)
    expect(activeSentenceIndex(4)).toBe(1)
    expect(activeSentenceIndex(15)).toBe(4)
    expect(activeSentenceIndex(24.06)).toBe(7)
    expect(activeSentenceIndex(26.6)).toBe(7)
    expect(activeSentenceIndex(99)).toBe(7)
  })

  it('returns -1 for negative or non-finite times', () => {
    expect(activeSentenceIndex(-0.01)).toBe(-1)
    expect(activeSentenceIndex(Number.NaN)).toBe(-1)
    expect(activeSentenceIndex(Number.POSITIVE_INFINITY)).toBe(-1)
  })

  it('keeps the transcript verbatim and the timings ascending', () => {
    expect(LISTEN_TRANSCRIPT.map((paragraph) => paragraph.length)).toEqual([1, 5, 2])
    expect(LISTEN_TRANSCRIPT_SENTENCES.map((sentence) => sentence.start)).toEqual([0, 3.12, 5.32, 7.78, 14.22, 19.7, 22.66, 24.06])
    expect(LISTEN_TRANSCRIPT_TEXT[1]).toBe('Thinking about the iPhone 18 Pro? Here’s the short version of today’s story. The article walks through what’s new, how it compares with the iPhone Duo, and where it sits among this year’s flagship phones. If you’re deciding, start with what matters most to you: the camera, battery life, or price. Then come back to the full article for the details.')
  })
})

describe('pure helpers', () => {
  it('handles tab navigation and time formatting', () => {
    expect(nextTabIndex('ArrowRight', 2, 3)).toBe(0)
    expect(nextTabIndex('ArrowLeft', 0, 3)).toBe(2)
    expect(nextTabIndex('ArrowDown', 0, 3)).toBe(1)
    expect(nextTabIndex('ArrowUp', 1, 3)).toBe(0)
    expect(nextTabIndex('Home', 2, 3)).toBe(0)
    expect(nextTabIndex('End', 0, 3)).toBe(2)
    expect(nextTabIndex('a', 0, 3)).toBeNull()
    expect(formatTime(0)).toBe('0:00')
    expect(formatTime(7)).toBe('0:07')
    expect(formatTime(27)).toBe('0:27')
    expect(formatTime(65)).toBe('1:05')
    expect(formatTime(-3)).toBe('0:00')
  })

  it('picks the closest visible stage and ignores hidden stages', () => {
    expect(pickActiveStage([10, 20], [false, false], 15)).toBeNull()
    expect(pickActiveStage([10, 20, 30], [true, true, false], 24)).toBe(1)
    expect(pickActiveStage([10, 20, 30], [true, false, true], 20)).toBe(0)
  })

  it('derives stage state and progress fill', () => {
    expect(stageStates(5, 2, {}, 'chat')).toEqual([
      { position: 'past', complete: false },
      { position: 'past', complete: false },
      { position: 'active', complete: false },
      { position: 'upcoming', complete: false },
      { position: 'upcoming', complete: false },
    ])
    expect(stageStates(5, 2, { chat: CAPTURE.chat(CHAT_QUESTIONS[0]) }, 'chat').slice(0, 2).every((stage) => stage.complete)).toBe(true)
    expect(stageStates(5, 2, { chat: CAPTURE.chat(CHAT_QUESTIONS[0]) }, 'chat').slice(2).every((stage) => !stage.complete)).toBe(true)
    // Stages 01/02 follow the capture of the experience on screen, not any capture.
    expect(stageStates(5, 2, { chat: CAPTURE.chat(CHAT_QUESTIONS[0]) }, 'quote').map((stage) => stage.complete)).toEqual([false, false, false, false, false])
    expect(stageStates(5, 2, { listen: CAPTURE.listen({ status: 'playing', elapsed: 0 }) }, 'listen').slice(0, 2).map((stage) => stage.complete)).toEqual([true, true])
    expect(stageStates(5, 2, { listen: { observation: 'seen', rawSignal: '' } }, 'listen').slice(0, 2).map((stage) => stage.complete)).toEqual([true, false])
    expect(progressFillPx({ activeIndex: 4, count: 5, nodeCenterFromFlowTop: 50, lastStageBottomFromFlowTop: 8 })).toBe(0)
    expect(progressFillPx({ activeIndex: 4, count: 5, nodeCenterFromFlowTop: 50, lastStageBottomFromFlowTop: 80 })).toBe(62)
    expect(progressFillPx({ activeIndex: 2, count: 5, nodeCenterFromFlowTop: 50, lastStageBottomFromFlowTop: 80 })).toBe(32)
  })

  it('keeps the copy module as the source for default observations', () => {
    expect(EXPERIENCE_DEFAULT_OBSERVATION.chat).toContain('user')
    expect(ANNOUNCE.chatAnswered).toContain('customer decision flow')
  })
})
