import {
  CAPTURE,
  CHAT_QUESTIONS,
  EXPERIENCE_DEFAULT_OBSERVATION,
  LISTEN_DURATION_SECONDS,
  QUOTE_OPTIONS,
  UI,
} from './ai-mode-playground-copy'
import type { BusinessPath, ExperienceId, ShareAction } from './ai-mode-playground-copy'

export type ListenStatus = 'idle' | 'playing' | 'paused' | 'completed'

export type PlaygroundState = {
  experience: ExperienceId
  chatQuestionIndex: 0 | 1 | 2 | null
  quote: {
    index: 0 | 1 | 2 | null
    feedback: string
    signature: string
    shareActions: ShareAction[]
  }
  listen: { status: ListenStatus; elapsed: number }
}

export const INITIAL_STATE: PlaygroundState = {
  experience: 'chat',
  chatQuestionIndex: null,
  quote: { index: null, feedback: '', signature: '', shareActions: [] },
  listen: { status: 'idle', elapsed: 0 },
}

export type Capture = { observation: string; rawSignal: string }
export type Captures = Partial<Record<ExperienceId, Capture>>

export type PlaygroundAction =
  | { type: 'experience/select'; id: ExperienceId }
  | { type: 'experience/reset' }
  | { type: 'chat/choose'; index: 0 | 1 | 2 }
  | { type: 'quote/select'; index: 0 | 1 | 2 }
  | { type: 'quote/feedback'; value: string }
  | { type: 'quote/signature'; value: string }
  | { type: 'quote/share'; action: ShareAction }
  | { type: 'listen/toggle' }
  | { type: 'listen/replay' }
  | { type: 'listen/tick' }

const resetQuote = () => ({ index: null, feedback: '', signature: '', shareActions: [] as ShareAction[] })

export function playgroundReducer(state: PlaygroundState, action: PlaygroundAction): PlaygroundState {
  switch (action.type) {
    case 'experience/select': {
      if (action.id === state.experience) return state
      const listen =
        state.experience === 'listen' && state.listen.status !== 'completed'
          ? { status: 'idle' as const, elapsed: 0 }
          : state.listen
      return { ...state, experience: action.id, listen }
    }
    case 'experience/reset': {
      if (state.experience === 'chat') return { ...state, chatQuestionIndex: null }
      if (state.experience === 'quote') return { ...state, quote: resetQuote() }
      return { ...state, listen: { status: 'idle', elapsed: 0 } }
    }
    case 'chat/choose':
      return { ...state, chatQuestionIndex: action.index }
    case 'quote/select': {
      if (state.quote.index === action.index) return state
      const quote =
        state.quote.index !== null
          ? { index: action.index, feedback: '', signature: '', shareActions: [] }
          : { ...state.quote, index: action.index }
      return { ...state, quote }
    }
    case 'quote/feedback':
      return { ...state, quote: { ...state.quote, feedback: action.value } }
    case 'quote/signature':
      return { ...state, quote: { ...state.quote, signature: action.value } }
    case 'quote/share':
      if (state.quote.index === null || state.quote.shareActions.includes(action.action)) return state
      return { ...state, quote: { ...state.quote, shareActions: [...state.quote.shareActions, action.action] } }
    case 'listen/toggle': {
      if (state.listen.status === 'playing') return { ...state, listen: { ...state.listen, status: 'paused' } }
      if (state.listen.status === 'completed') return { ...state, listen: { status: 'playing', elapsed: 0 } }
      return { ...state, listen: { ...state.listen, status: 'playing' } }
    }
    case 'listen/replay':
      return { ...state, listen: { status: 'playing', elapsed: 0 } }
    case 'listen/tick':
      if (state.listen.status !== 'playing') return state
      if (state.listen.elapsed >= LISTEN_DURATION_SECONDS - 1) {
        return { ...state, listen: { status: 'completed', elapsed: LISTEN_DURATION_SECONDS } }
      }
      return { ...state, listen: { status: 'playing', elapsed: state.listen.elapsed + 1 } }
  }
}

export function deriveCaptures(state: PlaygroundState): Captures {
  const captures: Captures = {}
  if (state.chatQuestionIndex !== null) captures.chat = CAPTURE.chat(CHAT_QUESTIONS[state.chatQuestionIndex])
  if (state.quote.index !== null) {
    captures.quote = CAPTURE.quote({
      quote: QUOTE_OPTIONS[state.quote.index],
      feedback: state.quote.feedback,
      shareActions: state.quote.shareActions.map((action) => UI.quote.actions[action]),
    })
  }
  if (state.listen.status === 'playing' || state.listen.status === 'paused') captures.listen = CAPTURE.listenStarted
  if (state.listen.status === 'completed') captures.listen = CAPTURE.listenCompleted
  return captures
}

export function activePathContent(
  path: BusinessPath,
  experience: ExperienceId,
  chatQuestionIndex: number | null,
) {
  if (experience === 'chat' && chatQuestionIndex !== null && chatQuestionIndex >= 0 && chatQuestionIndex <= 2) {
    return path.chatVariants[chatQuestionIndex]
  }
  return path
}

export function formatTime(seconds: number): string {
  return `00:${String(Math.max(0, Math.floor(seconds))).padStart(2, '0')}`
}

export function nextTabIndex(key: string, current: number, count: number): number | null {
  if (count <= 0) return null
  if (key === 'Home') return 0
  if (key === 'End') return count - 1
  if (key === 'ArrowRight' || key === 'ArrowDown') return (current + 1 + count) % count
  if (key === 'ArrowLeft' || key === 'ArrowUp') return (current - 1 + count) % count
  return null
}

export function pickActiveStage(tops: number[], visible: boolean[], anchor: number): number | null {
  let active: number | null = null
  let distance = Number.POSITIVE_INFINITY
  tops.forEach((top, index) => {
    if (!visible[index]) return
    const nextDistance = Math.abs(top - anchor)
    if (nextDistance < distance) {
      active = index
      distance = nextDistance
    }
  })
  return active
}

export type StageState = { position: 'active' | 'past' | 'upcoming'; complete: boolean }

export function stageStates(count: number, activeIndex: number, captures: Captures): StageState[] {
  const hasInteractionCapture = Object.values(captures).some(Boolean)
  const hasSignalCapture = Object.values(captures).some((capture) => Boolean(capture?.rawSignal))
  return Array.from({ length: count }, (_, index) => ({
    position: index < activeIndex ? 'past' : index === activeIndex ? 'active' : 'upcoming',
    complete: index === 0 ? hasInteractionCapture : index === 1 ? hasSignalCapture : false,
  }))
}

export function progressFillPx({
  activeIndex,
  count,
  nodeCenterFromFlowTop,
  lastStageBottomFromFlowTop,
}: {
  activeIndex: number
  count: number
  nodeCenterFromFlowTop: number
  lastStageBottomFromFlowTop: number
}): number {
  const distance = activeIndex === count - 1 ? lastStageBottomFromFlowTop : nodeCenterFromFlowTop
  return Math.max(0, distance - 18)
}

export { EXPERIENCE_DEFAULT_OBSERVATION }
