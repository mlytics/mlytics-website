import { useCallback, useEffect, useRef, useState } from 'react'
import type { RefObject } from 'react'
import { LISTEN_DURATION_SECONDS } from './ai-mode-playground-copy'
import { activeSentenceIndex } from './playground-logic'
import type { ListenStatus } from './playground-logic'

const prefersReducedMotion = () =>
  typeof window !== 'undefined' && Boolean(window.matchMedia?.('(prefers-reduced-motion: reduce)').matches)

/**
 * Drives the Listen progress fill width straight on the DOM node, never
 * through React state or the reducer (which keeps whole-second `elapsed` for
 * aria and captures). While playing it follows `currentTime / duration` every
 * animation frame for smooth, continuous motion; the loop stops on any other
 * status and on unmount. With reduced motion there is no loop: the width
 * follows the whole-second `elapsed` from timeupdate. The bar is display-only,
 * never seekable — seeking would let users fake the completion signal.
 *
 * It also tracks the transcript sentence being spoken (flat index, -1 for
 * none). Only while playing or paused is a sentence active; the index lives in
 * a ref and React state changes only when the sentence changes, so the panel
 * does not re-render per frame. No live-region announcement is made for it.
 */
export function useListenFill(
  audioRef: RefObject<HTMLAudioElement | null>,
  status: ListenStatus,
  elapsed: number,
  active: boolean,
) {
  const fillRef = useRef<HTMLSpanElement>(null)
  const sentenceRef = useRef(-1)
  const [activeSentence, setActiveSentence] = useState(-1)
  const smooth = active && status === 'playing' && !prefersReducedMotion()
  const tracking = active && (status === 'playing' || status === 'paused')

  const updateSentence = useCallback((index: number) => {
    if (sentenceRef.current === index) return
    sentenceRef.current = index
    setActiveSentence(index)
  }, [])

  // Outside the rAF loop (paused, or reduced motion) the sentence follows the
  // element's own timeupdate/seeked events; idle, completed and error clear it.
  useEffect(() => {
    if (!tracking) {
      updateSentence(-1)
      return
    }
    if (smooth) return
    const audio = audioRef.current
    if (!audio) return
    const sync = () => updateSentence(activeSentenceIndex(audio.currentTime))
    sync()
    audio.addEventListener('timeupdate', sync)
    audio.addEventListener('seeked', sync)
    return () => {
      audio.removeEventListener('timeupdate', sync)
      audio.removeEventListener('seeked', sync)
    }
  }, [audioRef, smooth, tracking, updateSentence])

  // Every state where the width comes from state (or the paused position).
  useEffect(() => {
    const fill = fillRef.current
    if (!active || smooth || !fill) return
    let ratio = status === 'completed' ? 1 : elapsed / LISTEN_DURATION_SECONDS
    const audio = audioRef.current
    if (status === 'paused' && audio && Number.isFinite(audio.duration) && audio.duration > 0) {
      ratio = audio.currentTime / audio.duration
    }
    fill.style.width = `${Math.min(1, Math.max(0, ratio)) * 100}%`
  }, [active, audioRef, elapsed, smooth, status])

  useEffect(() => {
    if (!smooth) return
    let frame = 0
    const step = () => {
      const fill = fillRef.current
      const audio = audioRef.current
      if (fill && audio && Number.isFinite(audio.duration) && audio.duration > 0) {
        fill.style.width = `${Math.min(1, Math.max(0, audio.currentTime / audio.duration)) * 100}%`
      }
      if (audio) updateSentence(activeSentenceIndex(audio.currentTime))
      frame = window.requestAnimationFrame(step)
    }
    step()
    return () => window.cancelAnimationFrame(frame)
  }, [audioRef, smooth, updateSentence])

  return { fillRef, activeSentence }
}
