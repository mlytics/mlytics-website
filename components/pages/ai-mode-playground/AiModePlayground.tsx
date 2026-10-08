'use client'

import { useCallback, useEffect, useReducer, useRef, useState } from 'react'
import {
  ANNOUNCE,
  EXPERIENCE_LABELS,
  LENS_LABELS,
  UI,
} from './ai-mode-playground-copy'
import type { ExperienceId, PlaygroundLens, ShareAction } from './ai-mode-playground-copy'
import { DEFAULT_LENS, readLensFromSearch } from './ai-mode-playground-data'
import { deriveCaptures, INITIAL_STATE, playgroundReducer } from './playground-logic'
import type { PlaygroundAction } from './playground-logic'
import { DecisionFlow } from './DecisionFlow'
import { useNavOffset } from './useNavOffset'
import { ExperiencePanel } from './ExperiencePanel'
import styles from './AiModePlayground.module.css'

type PendingEffect = 'chat' | 'signal' | null

export function AiModePlayground() {
  const [state, dispatch] = useReducer(playgroundReducer, INITIAL_STATE)
  const [lens, setLens] = useState<PlaygroundLens>(DEFAULT_LENS)
  const [announcement, setAnnouncement] = useState('')
  const rootRef = useRef<HTMLDivElement>(null)
  const titleRef = useRef<HTMLHeadingElement>(null)
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
    dispatch({ type: 'experience/select', id })
    announce(ANNOUNCE.experienceSelected(EXPERIENCE_LABELS[id]))
  }

  const handleReset = () => {
    // ExperiencePanel moves focus to the current tab itself; no queued effect.
    const label = EXPERIENCE_LABELS[state.experience]
    dispatch({ type: 'experience/reset' })
    announce(ANNOUNCE.reset(label))
  }

  const handleChooseQuestion = (index: 0 | 1 | 2) => {
    // Re-choosing the answer already chosen is a no-op: no re-announce, no focus move.
    if (!dispatchWithEffect({ type: 'chat/choose', index }, 'chat')) return
    announce(ANNOUNCE.chatAnswered)
  }

  const handleSelectQuote = (index: 0 | 1 | 2) => {
    dispatch({ type: 'quote/select', index })
    announce(ANNOUNCE.quoteSelected)
  }

  const handleFeedback = (value: string) => {
    // Re-activating the checked radio is a no-op: no re-announce, no focus move.
    if (!dispatchWithEffect({ type: 'quote/feedback', value }, state.quote.index !== null ? 'signal' : null)) return
    announce(state.quote.index === null ? ANNOUNCE.feedbackSelected(value) : ANNOUNCE.completed(EXPERIENCE_LABELS.quote))
  }

  const handleSignature = (value: string) => dispatch({ type: 'quote/signature', value })

  const handleShare = (action: ShareAction) => {
    if (state.quote.shareActions.includes(action)) return
    if (!dispatchWithEffect({ type: 'quote/share', action }, 'signal')) return
    announce(ANNOUNCE.shareRecorded(UI.quote.actions[action]))
  }

  const handleListenToggle = () => {
    const isPlaying = state.listen.status === 'playing'
    dispatch({ type: 'listen/toggle' })
    announce(isPlaying ? ANNOUNCE.listenPaused : ANNOUNCE.listenPlaying)
  }

  const handleListenReplay = () => {
    dispatch({ type: 'listen/replay' })
    announce(ANNOUNCE.listenPlaying)
  }

  useEffect(() => {
    if (state.listen.status !== 'playing') return
    const timer = window.setInterval(() => dispatch({ type: 'listen/tick' }), 1000)
    return () => window.clearInterval(timer)
  }, [state.listen.status])

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
    const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
    if (pending === 'chat') {
      titleRef.current?.scrollIntoView?.({ behavior: reduced ? 'auto' : 'smooth', block: 'start' })
      signalRef.current?.focus({ preventScroll: true })
    } else {
      // Centre rather than align to the top so the sticky nav + customer tabs
      // shell cannot cover the signal copy once it is scrolled into view.
      signalRef.current?.scrollIntoView?.({ block: 'center', behavior: reduced ? 'auto' : 'smooth' })
      signalRef.current?.focus({ preventScroll: true })
    }
  }, [state])

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
        onListenToggle={handleListenToggle}
        onListenReplay={handleListenReplay}
      />
      <DecisionFlow
        lens={lens}
        onLensChange={handleLensChange}
        experience={state.experience}
        chatQuestionIndex={state.chatQuestionIndex}
        captures={captures}
        signalRef={signalRef}
        titleRef={titleRef}
      />
      <div className={styles.announcer} role="status" aria-live="polite" aria-atomic="true">
        {announcement}
      </div>
    </div>
  )
}
