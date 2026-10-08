import { describe, expect, it } from 'vitest'
import {
  activePathContent,
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

  it('maps listen lifecycle to started/completed captures', () => {
    let state = playgroundReducer(INITIAL_STATE, { type: 'listen/toggle' })
    expect(deriveCaptures(state).listen).toEqual(CAPTURE.listenStarted)
    state = playgroundReducer(state, { type: 'listen/toggle' })
    expect(deriveCaptures(state).listen).toEqual(CAPTURE.listenStarted)
    state = playgroundReducer(state, { type: 'listen/toggle' })
    for (let i = 0; i < 32; i += 1) state = playgroundReducer(state, { type: 'listen/tick' })
    expect(deriveCaptures(state).listen).toEqual(CAPTURE.listenCompleted)
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
    state = playgroundReducer(state, { type: 'listen/tick' })
    expect(playgroundReducer(state, { type: 'experience/select', id: 'quote' }).listen).toEqual({ status: 'idle', elapsed: 0 })

    state = playgroundReducer(INITIAL_STATE, { type: 'experience/select', id: 'listen' })
    state = playgroundReducer(state, { type: 'listen/toggle' })
    for (let i = 0; i < 32; i += 1) state = playgroundReducer(state, { type: 'listen/tick' })
    expect(playgroundReducer(state, { type: 'experience/select', id: 'quote' }).listen).toEqual({ status: 'completed', elapsed: 32 })
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

  it('completes listen at 32, ignores paused ticks, and restarts completed listen', () => {
    let state = playgroundReducer(INITIAL_STATE, { type: 'listen/toggle' })
    for (let i = 0; i < 31; i += 1) state = playgroundReducer(state, { type: 'listen/tick' })
    expect(state.listen).toEqual({ status: 'playing', elapsed: 31 })
    state = playgroundReducer(state, { type: 'listen/toggle' })
    expect(playgroundReducer(state, { type: 'listen/tick' })).toEqual(state)
    state = { ...state, listen: { status: 'completed', elapsed: 32 } }
    const restarted = playgroundReducer(state, { type: 'listen/toggle' })
    expect(restarted.listen).toEqual({ status: 'playing', elapsed: 0 })
    expect(deriveCaptures(restarted).listen).toEqual(CAPTURE.listenStarted)
    expect(playgroundReducer(state, { type: 'listen/replay' }).listen).toEqual({ status: 'playing', elapsed: 0 })
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
    expect(formatTime(0)).toBe('00:00')
    expect(formatTime(7)).toBe('00:07')
    expect(formatTime(32)).toBe('00:32')
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
    expect(stageStates(5, 2, { listen: CAPTURE.listenStarted }, 'listen').slice(0, 2).map((stage) => stage.complete)).toEqual([true, true])
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
