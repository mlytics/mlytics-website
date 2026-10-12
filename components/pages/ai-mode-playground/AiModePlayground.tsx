'use client'

import { useCallback, useEffect, useReducer, useRef, useState } from 'react'
import {
  ANNOUNCE,
  EXPERIENCE_LABELS,
  LENS_LABELS,
  LISTEN_AUDIO_SRC,
  UI,
} from './ai-mode-playground-copy'
import type { ExperienceId, PlaygroundLens, ShareAction } from './ai-mode-playground-copy'
import { DEFAULT_LENS, readLensFromSearch } from './ai-mode-playground-data'
import { deriveCaptures, INITIAL_STATE, playgroundReducer } from './playground-logic'
import type { PlaygroundAction } from './playground-logic'
import { DecisionFlow } from './DecisionFlow'
import { useNavOffset } from './useNavOffset'
import { useListenAudio } from './useListenAudio'
import { useListenFill } from './useListenFill'
import { ExperiencePanel } from './ExperiencePanel'
import styles from './AiModePlayground.module.css'

type PendingEffect = 'chat' | 'signal' | null

export function AiModePlayground() {
  const [state, dispatch] = useReducer(playgroundReducer, INITIAL_STATE)
  const [lens, setLens] = useState<PlaygroundLens>(DEFAULT_LENS)
  const [announcement, setAnnouncement] = useState('')
  const rootRef = useRef<HTMLDivElement>(null)
  const signalRef = useRef<HTMLParagraphElement>(null)
  const pendingEffectRef = useRef<PendingEffect>(null)
  const previousListenStatusRef = useRef(state.listen.status)
  const announceHandleRef = useRef<{ kind: 'raf' | 'timeout'; id: number } | null>(null)
  useNavOffset(rootRef)

  // The deep-linked lens is read from the URL here rather than through
  // `useSearchParams`: on a prerendered route that hook opts everything below
  // the nearest Suspense boundary out of prerendering and into client-side
  // rendering, which would turn the whole playground into CSR. A mount-once
  // effect keeps the page prerendered; the trade-off is that it does not react
  // to client-side query changes on the same route (back/forward), and no UI
  // path here produces one. Reading window during render would break hydration.
  useEffect(() => {
    const fromUrl = readLensFromSearch(window.location.search)
    if (fromUrl) setLens(fromUrl)
  }, [])

  const cancelPendingAnnouncement = useCallback(() => {
    const handle = announceHandleRef.current
    announceHandleRef.current = null
    if (!handle) return
    if (handle.kind === 'raf') window.cancelAnimationFrame?.(handle.id)
    else window.clearTimeout(handle.id)
  }, [])

  const announce = useCallback((value: string) => {
    cancelPendingAnnouncement()
    setAnnouncement('')
    const setNext = () => {
      announceHandleRef.current = null
      setAnnouncement(value)
    }
    announceHandleRef.current =
      typeof window.requestAnimationFrame === 'function'
        ? { kind: 'raf', id: window.requestAnimationFrame(setNext) }
        : { kind: 'timeout', id: window.setTimeout(setNext, 0) }
  }, [cancelPendingAnnouncement])

  useEffect(() => cancelPendingAnnouncement, [cancelPendingAnnouncement])

  const handleListenError = useCallback(() => announce(ANNOUNCE.listenError), [announce])
  const listenAudio = useListenAudio(dispatch, handleListenError, state.listen.status)
  const { fillRef: listenFillRef, activeSentence } = useListenFill(listenAudio.audioRef, state.listen.status, state.listen.elapsed, state.experience === 'listen')

  // A focus effect is only queued when the action actually changes state. The
  // reducer is pure, so running it here first is safe; if it hands the same
  // state back, the effect below would never run and a queued focus move would
  // linger until some unrelated later change (typing a signature) fired it.
  const dispatchWithEffect = (action: PlaygroundAction, effect: PendingEffect) => {
    if (playgroundReducer(state, action) === state) return false
    pendingEffectRef.current = effect
    dispatch(action)
    return true
  }

  const focusSignal = useCallback(() => {
    // 'instant', not 'auto': 'auto' defers to the computed `scroll-behavior`,
    // and globals.css sets `html { scroll-behavior: smooth }`, so reduced-motion
    // users would still get a smooth scroll.
    const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
    const behavior: ScrollBehavior = reduced ? 'instant' : 'smooth'
    // Chat and every other completion land the same way: the focused signal
    // copy is centred rather than aligned to the top, so the sticky nav +
    // customer tabs shell cannot cover it, even on short phone viewports.
    signalRef.current?.scrollIntoView?.({ block: 'center', behavior })
    signalRef.current?.focus({ preventScroll: true })
  }, [])

  // Keep the address bar honest: once the user switches lens by hand, a
  // copied URL has to reopen on the lens they are looking at. `replaceState`
  // rather than `pushState` so tab switching does not stack history entries
  // and trap Back on this page. Every other query param and the hash survive
  // the switch, but `URLSearchParams.toString()` re-serialises the whole
  // string, so it comes back normalised rather than byte-for-byte as it
  // arrived (`~` as `%7E`, a space as `+`, a valueless `?debug` as `debug=`).
  // The parsed result on the server is the same either way.
  //
  // The first argument is `null`, not `window.history.state`: Next patches
  // `replaceState` and early-returns to the unpatched one whenever the state
  // handed to it already carries `__NA` — which Next's own `HistoryUpdater` stamps
  // onto every entry — so passing the current state straight back would skip Next's
  // canonical-URL sync and leave it on the old lens. With `null`, Next's
  // `copyNextJsInternalHistoryState` puts `__NA` and the internal tree back itself and
  // the canonical URL follows the address bar.
  const handleLensChange = useCallback((nextLens: PlaygroundLens) => {
    if (nextLens === lens) return
    setLens(nextLens)
    const params = new URLSearchParams(window.location.search)
    params.set('lens', nextLens)
    window.history.replaceState(null, '', `${window.location.pathname}?${params.toString()}${window.location.hash}`)
    // Same rule as the stage 01/02 completion ticks: only the capture of the
    // experience on screen counts, so a Chat answer does not claim a capture
    // while Quote is open and still showing its empty defaults.
    const hasCurrentCapture = Boolean(deriveCaptures(state)[state.experience])
    announce(hasCurrentCapture ? ANNOUNCE.customerSwitchedWithCapture : ANNOUNCE.customerSwitched(LENS_LABELS[nextLens]))
  }, [announce, lens, state])

  const handleSelectExperience = (id: ExperienceId) => {
    // Re-selecting the tab already selected is a no-op: nothing to re-announce.
    if (id === state.experience) return
    // Leaving Listen always rewinds the audio, completed or not.
    if (state.experience === 'listen') listenAudio.stop()
    dispatch({ type: 'experience/select', id })
    announce(ANNOUNCE.experienceSelected(EXPERIENCE_LABELS[id]))
  }

  const handleReset = () => {
    // ExperiencePanel moves focus to the current tab itself; no queued effect.
    const label = EXPERIENCE_LABELS[state.experience]
    if (state.experience === 'listen') listenAudio.stop()
    dispatch({ type: 'experience/reset' })
    announce(ANNOUNCE.reset(label))
  }

  const handleChooseQuestion = (index: 0 | 1 | 2) => {
    // Re-choosing the answer already chosen is a no-op: no re-announce, no focus move.
    if (!dispatchWithEffect({ type: 'chat/choose', index }, 'chat')) return
    announce(ANNOUNCE.chatAnswered)
  }

  // Quote completes on the first share click or on the reveal link, never on
  // picking a line or a feeling: those only record and announce, so focus
  // stays where the user is working. A new line starts a new round (the
  // reducer clears its feedback and shares), so its first share jumps again.
  const handleSelectQuote = (index: 0 | 1 | 2) => {
    // Re-selecting the line already selected changes nothing: no re-announce.
    if (!dispatchWithEffect({ type: 'quote/select', index }, null)) return
    announce(ANNOUNCE.quoteSelected)
  }

  const handleFeedback = (value: string) => {
    // Re-activating the checked radio is a no-op: no re-announce.
    if (!dispatchWithEffect({ type: 'quote/feedback', value }, null)) return
    announce(ANNOUNCE.feedbackSelected(value))
  }

  const handleSignature = (value: string) => dispatch({ type: 'quote/signature', value })

  // The first share of a round completes Quote and moves to the signal;
  // later, different shares are recorded in place without a jump. Repeating a
  // share already recorded changes nothing (the reducer returns the same state).
  const handleShare = (action: ShareAction) => {
    const isFirst = state.quote.shareActions.length === 0
    if (!dispatchWithEffect({ type: 'quote/share', action }, isFirst ? 'signal' : null)) return
    announce(isFirst ? ANNOUNCE.completed(EXPERIENCE_LABELS.quote) : ANNOUNCE.shareRecorded(UI.quote.actions[action]))
  }

  // Fallback completion once a line and a feeling are picked: moves to the
  // signal and announces completion, but records no share.
  const handleRevealSignal = () => {
    if (state.quote.index === null || !state.quote.feedback) return
    focusSignal()
    announce(ANNOUNCE.completed(EXPERIENCE_LABELS.quote))
  }

  // The explicit action is dispatched before the media call: the element's own
  // play/pause events then land on a state that already matches and are
  // no-ops, whether the browser fires them synchronously or as a later task.
  // The media call still runs synchronously inside the click (iOS autoplay).
  const handleListenToggle = () => {
    const isPlaying = state.listen.status === 'playing'
    dispatch({ type: 'listen/toggle' })
    if (isPlaying) listenAudio.pause()
    else listenAudio.play()
    announce(isPlaying ? ANNOUNCE.listenPaused : ANNOUNCE.listenPlaying)
  }

  const handleListenReplay = () => {
    dispatch({ type: 'listen/replay' })
    listenAudio.restart()
    announce(ANNOUNCE.listenPlaying)
  }

  const handleListenRetry = () => {
    dispatch({ type: 'listen/replay' })
    listenAudio.retry()
    announce(ANNOUNCE.listenPlaying)
  }

  useEffect(() => {
    const previous = previousListenStatusRef.current
    previousListenStatusRef.current = state.listen.status
    if (state.listen.status === 'completed' && previous !== 'completed') {
      pendingEffectRef.current = 'signal'
      announce(ANNOUNCE.completed(EXPERIENCE_LABELS.listen))
    }
  }, [announce, state.listen.status])

  useEffect(() => {
    const pending = pendingEffectRef.current
    if (!pending) return
    pendingEffectRef.current = null
    focusSignal()
  }, [focusSignal, state])

  const captures = deriveCaptures(state)

  return (
    <div ref={rootRef} className={styles.playground} data-playground-root>
      <ExperiencePanel
        state={state}
        onSelectExperience={handleSelectExperience}
        onReset={handleReset}
        onChooseQuestion={handleChooseQuestion}
        onSelectQuote={handleSelectQuote}
        onFeedback={handleFeedback}
        onSignature={handleSignature}
        onShare={handleShare}
        onRevealSignal={handleRevealSignal}
        onListenToggle={handleListenToggle}
        onListenReplay={handleListenReplay}
        onListenRetry={handleListenRetry}
        listenFillRef={listenFillRef}
        activeSentence={activeSentence}
        listenMuted={listenAudio.muted}
        onListenToggleMute={listenAudio.toggleMute}
      />
      <DecisionFlow
        lens={lens}
        onLensChange={handleLensChange}
        experience={state.experience}
        chatQuestionIndex={state.chatQuestionIndex}
        captures={captures}
        signalRef={signalRef}
      />
      <audio ref={listenAudio.audioRef} src={LISTEN_AUDIO_SRC} preload="none" {...listenAudio.audioProps} />
      <div className={styles.announcer} role="status" aria-live="polite" aria-atomic="true">
        {announcement}
      </div>
    </div>
  )
}
