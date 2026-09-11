'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { CortexPlaygroundWidget } from './CortexPlaygroundWidget'
import { SignalLedger } from './SignalLedger'
import {
  ARTICLE,
  CHAT_CONTENT,
  CortexEvent,
  CortexLens,
  CortexMode,
  LISTEN_CONTENT,
  QUOTE_CONTENT,
  readLensFromSearch,
  resolveLensCopy,
} from './cortex-playground-data'
import styles from './CortexPlayground.module.css'

const MODES: Array<{ id: CortexMode; label: string; sublabel: string }> = [
  { id: 'chat', label: 'Chat', sublabel: 'Ask' },
  { id: 'quote', label: 'Make a quote', sublabel: 'Amplify' },
  { id: 'listen', label: 'Listen', sublabel: 'Attend' },
]

type ResetSchedule =
  | { kind: 'animation-frame'; handle: number }
  | { kind: 'timeout'; handle: number }

const PLAYGROUND_TOP_OFFSET = 18

function getSiteHeaderBottom() {
  if (typeof window === 'undefined' || typeof document === 'undefined') return 0

  return Array.from(document.querySelectorAll<HTMLElement>('header, nav')).reduce((bottom, element) => {
    const position = window.getComputedStyle(element).position
    if (position !== 'fixed' && position !== 'sticky') return bottom

    const rect = element.getBoundingClientRect()
    if (!Number.isFinite(rect.height) || rect.height <= 0) return bottom
    return Math.max(bottom, rect.height)
  }, 0)
}

export function CortexPlayground() {
  const [mode, setMode] = useState<CortexMode>('chat')
  const [lens, setLens] = useState<CortexLens>('brand')
  const [events, setEvents] = useState<CortexEvent[]>([])
  const [scrollDepth, setScrollDepth] = useState(0)
  const [widgetImpression, setWidgetImpression] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null)
  const [quoteFeedback, setQuoteFeedback] = useState<string | null>(null)
  const [quoteSignature, setQuoteSignature] = useState('')
  const [quoteGenerated, setQuoteGenerated] = useState(false)
  const [quoteActionStatus, setQuoteActionStatus] = useState<string | null>(null)
  const [audioPlaying, setAudioPlaying] = useState(false)
  const [audioElapsedSeconds, setAudioElapsedSeconds] = useState(0)
  const [resetEpoch, setResetEpoch] = useState(0)
  const [resetting, setResetting] = useState(false)

  const articleRef = useRef<HTMLElement>(null)
  const playgroundRef = useRef<HTMLElement>(null)
  const widgetRef = useRef<HTMLDivElement>(null)
  const resetEpochRef = useRef(0)
  const resettingRef = useRef(false)
  const eventSequenceRef = useRef(0)
  const widgetClickedRef = useRef(false)
  const widgetImpressionRef = useRef(false)
  const scrollDepthRef = useRef(0)
  const impressionArmedRef = useRef(true)
  const scrollTrackingArmedRef = useRef(true)
  const sponsoredAttentionEmittedRef = useRef(false)
  const quoteAmplificationEmittedRef = useRef(false)
  const trackingCleanupRef = useRef<(() => void) | null>(null)
  const audioTimerRef = useRef<number | null>(null)
  const resetScheduleRef = useRef<ResetSchedule | null>(null)

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

  // Keep the address bar honest: once the reader switches lens by hand, a
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
  // handed to it already carries `__NA` — which Next's own `HistoryUpdater`
  // stamps onto every entry — so passing the current state straight back
  // would skip Next's canonical-URL sync and leave it on the old lens. With
  // `null`, Next's `copyNextJsInternalHistoryState` puts `__NA` and the
  // internal tree back itself and the canonical URL follows the address bar.
  const handleLensChange = useCallback((nextLens: CortexLens) => {
    setLens(nextLens)
    const params = new URLSearchParams(window.location.search)
    params.set('lens', nextLens)
    window.history.replaceState(
      null,
      '',
      `${window.location.pathname}?${params.toString()}${window.location.hash}`,
    )
  }, [])

  const emitEvent = useCallback((event: Omit<CortexEvent, 'id' | 'lensCopy'>) => {
    if (resettingRef.current || resetEpochRef.current !== resetEpoch) return
    const lensCopy = resolveLensCopy({ ...event, ...event.context })
    const nextEvent: CortexEvent = {
      ...event,
      id: `${resetEpochRef.current}-${++eventSequenceRef.current}`,
      lensCopy,
    }
    setEvents((current) => [nextEvent, ...current])
  }, [resetEpoch])

  const isWidgetVisible = useCallback(() => {
    const widget = widgetRef.current
    if (!widget) return false
    const rect = widget.getBoundingClientRect()
    return rect.top < window.innerHeight && rect.bottom > 0
  }, [])

  const emitWidgetImpression = useCallback(() => {
    if (resettingRef.current || widgetImpressionRef.current || !impressionArmedRef.current || !isWidgetVisible()) return
    widgetImpressionRef.current = true
    setWidgetImpression(true)
    emitEvent({
      kind: 'widget_impression',
      title: 'Widget entered viewport',
      detail: 'Reader reached the article-end experience.',
      tone: 'raw',
      context: { mode },
    })
  }, [emitEvent, isWidgetVisible, mode])

  const handleQuestion = (index: number) => {
    if (resettingRef.current) return
    impressionArmedRef.current = true
    emitWidgetImpression()
    setSelectedIndex(index)
    if (!widgetClickedRef.current) {
      widgetClickedRef.current = true
      emitEvent({ kind: 'widget_click', title: CHAT_CONTENT.questions[index], detail: 'Reader interacted with the widget.', tone: 'raw', context: { mode: 'chat' } })
    }
    CHAT_CONTENT.signals.forEach((signal) => emitEvent({ ...signal, tone: 'signal', context: { mode: 'chat' } }))
  }

  const handleQuote = (index: number) => {
    if (resettingRef.current) return
    impressionArmedRef.current = true
    emitWidgetImpression()
    if (selectedIndex !== index) {
      setQuoteGenerated(false)
      setQuoteActionStatus(null)
      quoteAmplificationEmittedRef.current = false
    }
    setSelectedIndex(index)
    if (!widgetClickedRef.current) {
      widgetClickedRef.current = true
      emitEvent({ kind: 'widget_click', title: QUOTE_CONTENT.options[index].text, detail: 'Reader interacted with the widget.', tone: 'raw', context: { mode: 'quote' } })
    }
    const resonance = QUOTE_CONTENT.signals.find((signal) => signal.kind === 'content_resonance')
    if (resonance) emitEvent({ ...resonance, tone: 'signal', context: { mode: 'quote' } })
  }

  const handleGenerateQuote = () => {
    if (resettingRef.current || selectedIndex === null || !quoteFeedback) return
    setQuoteGenerated(true)
    if (!quoteAmplificationEmittedRef.current) {
      quoteAmplificationEmittedRef.current = true
      const amplification = QUOTE_CONTENT.signals.find((signal) => signal.kind === 'amplification_ready')
      if (amplification) emitEvent({ ...amplification, tone: 'signal', context: { mode: 'quote' } })
    }
  }

  const handleListen = () => {
    if (resettingRef.current) return
    const starting = !audioPlaying
    setAudioPlaying(starting)
    if (!starting) return
    impressionArmedRef.current = true
    emitWidgetImpression()
    if (!widgetClickedRef.current) {
      widgetClickedRef.current = true
      emitEvent({ kind: 'widget_click', title: 'Listening started', detail: 'Reader interacted with the widget.', tone: 'raw', context: { mode: 'listen' } })
      LISTEN_CONTENT.signals.forEach((signal) => emitEvent({ ...signal, tone: 'signal', context: { mode: 'listen' } }))
    }
  }

  const clearAudioTimer = useCallback(() => {
    if (audioTimerRef.current !== null) {
      window.clearInterval(audioTimerRef.current)
      audioTimerRef.current = null
    }
  }, [])

  const clearResetSchedule = useCallback(() => {
    const resetSchedule = resetScheduleRef.current
    if (resetSchedule !== null) {
      if (resetSchedule.kind === 'animation-frame') {
        window.cancelAnimationFrame(resetSchedule.handle)
      } else {
        window.clearTimeout(resetSchedule.handle)
      }
      resetScheduleRef.current = null
    }
  }, [])

  const handleReset = useCallback((nextMode: CortexMode = 'chat') => {
    if (resettingRef.current) return
    resettingRef.current = true
    trackingCleanupRef.current?.()
    trackingCleanupRef.current = null
    clearAudioTimer()
    clearResetSchedule()
    const nextEpoch = resetEpochRef.current + 1
    resetEpochRef.current = nextEpoch
    const playground = playgroundRef.current
    const headerBottom = getSiteHeaderBottom()
    const scrollTarget = playground
      ? Math.max(0, playground.getBoundingClientRect().top + window.scrollY - (headerBottom + PLAYGROUND_TOP_OFFSET))
      : 0
    setResetting(true)
    setResetEpoch(nextEpoch)
    setMode(nextMode)
    setEvents([])
    setScrollDepth(0)
    setWidgetImpression(false)
    setSelectedIndex(null)
    setQuoteFeedback(null)
    setQuoteSignature('')
    setQuoteGenerated(false)
    setQuoteActionStatus(null)
    setAudioPlaying(false)
    setAudioElapsedSeconds(0)
    widgetClickedRef.current = false
    widgetImpressionRef.current = false
    scrollDepthRef.current = 0
    impressionArmedRef.current = false
    scrollTrackingArmedRef.current = false
    sponsoredAttentionEmittedRef.current = false
    quoteAmplificationEmittedRef.current = false
    window.scrollTo({ top: scrollTarget, left: 0, behavior: 'auto' })

    const finishReset = () => {
      resetScheduleRef.current = null
      if (!resettingRef.current || resetEpochRef.current !== nextEpoch) return
      resettingRef.current = false
      setResetting(false)
      window.scrollTo({ top: scrollTarget, left: 0, behavior: 'auto' })
    }
    if (typeof window.requestAnimationFrame === 'function') {
      resetScheduleRef.current = { kind: 'animation-frame', handle: window.requestAnimationFrame(finishReset) }
    } else {
      resetScheduleRef.current = { kind: 'timeout', handle: window.setTimeout(finishReset, 0) }
    }
  }, [clearAudioTimer, clearResetSchedule])

  const handleModeChange = (nextMode: CortexMode) => {
    if (nextMode !== mode) handleReset(nextMode)
  }

  useEffect(() => {
    if (!audioPlaying || resetting) return
    const timerEpoch = resetEpochRef.current
    audioTimerRef.current = window.setInterval(() => {
      if (resettingRef.current || resetEpochRef.current !== timerEpoch) {
        clearAudioTimer()
        return
      }
      setAudioElapsedSeconds((current) => {
        const next = Math.min(LISTEN_CONTENT.durationSeconds, current + 1)
        if (next >= LISTEN_CONTENT.sponsoredAttentionThresholdSeconds && !sponsoredAttentionEmittedRef.current) {
          sponsoredAttentionEmittedRef.current = true
          emitEvent({ kind: 'business-signal', title: 'Brand moment reached', detail: 'sponsored_attention shows sustained attention around the audio experience.', tone: 'signal', context: { mode: 'listen', signalKind: 'sponsored_attention' } })
        }
        if (next >= LISTEN_CONTENT.durationSeconds) setAudioPlaying(false)
        return next
      })
    }, 1000)
    return clearAudioTimer
  }, [audioPlaying, clearAudioTimer, emitEvent, resetting])

  useEffect(() => {
    if (resetting) return
    const mountedEpoch = resetEpochRef.current
    const article = articleRef.current
    const widget = widgetRef.current
    if (!article || !widget) return

    const onScroll = () => {
      if (resettingRef.current || mountedEpoch !== resetEpochRef.current || !scrollTrackingArmedRef.current) return
      impressionArmedRef.current = true
      const rect = article.getBoundingClientRect()
      const progress = Math.max(0, Math.min(100, ((window.innerHeight - rect.top) / Math.max(1, rect.height)) * 100))
      for (const threshold of [25, 50, 75, 100]) {
        if (progress >= threshold && scrollDepthRef.current < threshold) {
          scrollDepthRef.current = threshold
          setScrollDepth(threshold)
          emitEvent({ kind: 'article_scroll', title: `${threshold}% scroll depth`, detail: 'Reader continued through the article.', tone: 'raw', context: { mode, threshold } })
        }
      }
    }
    const onScrollIntent = (event: Event) => {
      if (resettingRef.current || mountedEpoch !== resetEpochRef.current) return
      if (event.type === 'keydown' && !['ArrowDown', 'ArrowUp', 'End', 'Home', 'PageDown', 'PageUp', ' '].includes((event as KeyboardEvent).key)) return
      scrollTrackingArmedRef.current = true
    }
    const observer = typeof IntersectionObserver === 'undefined' ? null : new IntersectionObserver((entries) => {
      if (resettingRef.current || mountedEpoch !== resetEpochRef.current || !impressionArmedRef.current) return
      if (entries.some((entry) => entry.target === widget && entry.isIntersecting)) emitWidgetImpression()
    }, { threshold: 0.2 })

    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('wheel', onScrollIntent, { passive: true })
    window.addEventListener('touchmove', onScrollIntent, { passive: true })
    window.addEventListener('keydown', onScrollIntent)
    observer?.observe(widget)

    const cleanup = () => {
      observer?.disconnect()
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('wheel', onScrollIntent)
      window.removeEventListener('touchmove', onScrollIntent)
      window.removeEventListener('keydown', onScrollIntent)
    }
    trackingCleanupRef.current = cleanup
    return () => {
      cleanup()
      if (trackingCleanupRef.current === cleanup) trackingCleanupRef.current = null
    }
  }, [emitEvent, emitWidgetImpression, mode, resetEpoch, resetting])

  return (
    <section className={styles.playgroundSection} aria-labelledby="playground-heading">
      <div className={styles.container}>
        <div className={styles.sectionIntro}>
          <div><span className={styles.eyebrow}>Try the experience</span><h2 className="section-heading mb-4 text-ink" id="playground-heading">A small surface for a big shift.</h2></div>
          <p className="mx-auto max-w-xl text-base leading-relaxed text-ink-muted">Choose a mode to see how one article can meet different reader intent.</p>
        </div>
        <section ref={playgroundRef} className={styles.playground} aria-label="Cortex Playground">
          <div className={styles.workspace}>
            <div className={styles.modeBar}>
              <span className={styles.modeLabel}>Choose an experience</span>
              <div className={styles.modeTabs} role="tablist" aria-label="Cortex experiences">
                {MODES.map((item) => (
                  <button key={item.id} type="button" role="tab" aria-selected={mode === item.id} aria-controls="cortex-widget" onClick={() => handleModeChange(item.id)}>
                    {item.label}<small>{item.sublabel}</small>
                  </button>
                ))}
                <button type="button" role="tab" aria-selected="false" aria-disabled="true" disabled>More to come<small>Coming soon</small></button>
              </div>
            </div>
            <div className={styles.readerPanel}>
              <div className={styles.readerColumn}>
                <div className={styles.readerSubheader}>What the reader sees</div>
                <article ref={articleRef} className={styles.article} aria-labelledby="article-title">
                  <div className={styles.articleContext}><span><b>PUBLISHER ARTICLE</b><small>Source story</small></span><span>Cortex extends this story</span></div>
                  <div className={styles.articleKicker}>{ARTICLE.kicker}</div>
                  <h2 id="article-title">{ARTICLE.title}</h2>
                  <p className={styles.standfirst}>{ARTICLE.standfirst}</p>
                  <div className={styles.rule} />
                  {ARTICLE.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
                  <CortexPlaygroundWidget
                    mode={mode}
                    selectedIndex={selectedIndex}
                    quoteFeedback={quoteFeedback}
                    quoteSignature={quoteSignature}
                    quoteGenerated={quoteGenerated}
                    quoteActionStatus={quoteActionStatus}
                    audioPlaying={audioPlaying}
                    audioElapsedSeconds={audioElapsedSeconds}
                    widgetRef={widgetRef}
                    onQuestion={handleQuestion}
                    onQuote={handleQuote}
                    onFeedback={setQuoteFeedback}
                    onSignature={setQuoteSignature}
                    onGenerateQuote={handleGenerateQuote}
                    onQuoteAction={(action) => {
                      setQuoteActionStatus(action === 'download' ? 'quote card downloaded' : `${action.toUpperCase()} share recorded`)
                      if (action !== 'download' && !events.some((event) => event.kind === 'share')) {
                        const copy = lens === 'brand' ? 'Content carried outward' : 'Reader amplification completed'
                        emitEvent({ kind: 'share', title: copy, detail: 'The selected quote moved beyond the article through a local mock share action.', tone: 'raw', context: { mode: 'quote' } })
                      }
                    }}
                    onAskAnother={() => setSelectedIndex(null)}
                    onListen={handleListen}
                  />
                </article>
              </div>
            </div>
          </div>
          <SignalLedger lens={lens} mode={mode} events={events} scrollDepth={scrollDepth} widgetImpression={widgetImpression} onLensChange={handleLensChange} />
          <button className={styles.startOver} type="button" aria-label="Start over" disabled={resetting} onClick={() => handleReset()}>
            <span className={styles.startOverIcon} aria-hidden="true">↻</span><span className={styles.startOverLabel}>START OVER</span>
          </button>
        </section>
      </div>
    </section>
  )
}
