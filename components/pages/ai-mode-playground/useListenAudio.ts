import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { Dispatch } from 'react'
import type { PlaygroundAction } from './playground-logic'

/**
 * Binds the Listen experience to a real `<audio>` element. The element is the
 * only time source: progress, completion and pauses all come from its media
 * events, and the reducer guards make repeated events no-ops. There is no
 * timer fallback — if the audio cannot load, the experience goes to `error`.
 *
 * `play` / `restart` / `retry` must be called synchronously inside the click
 * handler so iOS Safari treats playback as user-initiated.
 */
export function useListenAudio(dispatch: Dispatch<PlaygroundAction>, onError: () => void) {
  const audioRef = useRef<HTMLAudioElement>(null)
  const onErrorRef = useRef(onError)
  // A failed load can surface twice (play() rejects and the element fires
  // `error`); only the first one reports until the user tries again.
  const failedRef = useRef(false)
  // Mute is a player preference, not a signal: it never touches the reducer
  // or captures, works before play, and survives replay/reset/tab switches
  // (nothing here resets `audio.muted`; load() does not either).
  const [muted, setMuted] = useState(false)

  useEffect(() => {
    onErrorRef.current = onError
  }, [onError])

  const fail = useCallback(() => {
    if (failedRef.current) return
    failedRef.current = true
    dispatch({ type: 'listen/error' })
    onErrorRef.current()
  }, [dispatch])

  const play = useCallback(() => {
    const audio = audioRef.current
    if (!audio) return
    failedRef.current = false
    // AbortError means a later pause()/load() interrupted this play() — not a failure.
    Promise.resolve(audio.play()).catch((error: unknown) => {
      if ((error as { name?: string } | null)?.name !== 'AbortError') fail()
    })
  }, [fail])

  const pause = useCallback(() => {
    audioRef.current?.pause()
  }, [])

  const restart = useCallback(() => {
    const audio = audioRef.current
    if (!audio) return
    audio.currentTime = 0
    play()
  }, [play])

  const retry = useCallback(() => {
    audioRef.current?.load()
    play()
  }, [play])

  const toggleMute = useCallback(() => {
    const audio = audioRef.current
    if (!audio) return
    audio.muted = !audio.muted
    setMuted(audio.muted)
  }, [])

  const stop = useCallback(() => {
    const audio = audioRef.current
    if (!audio) return
    if (!audio.paused) audio.pause()
    audio.currentTime = 0
  }, [])

  useEffect(() => {
    const audio = audioRef.current
    return () => {
      if (!audio) return
      if (!audio.paused) audio.pause()
      audio.currentTime = 0
    }
  }, [])

  const audioProps = useMemo(
    () => ({
      onTimeUpdate: () => {
        const audio = audioRef.current
        if (audio) dispatch({ type: 'listen/progress', elapsed: audio.currentTime })
      },
      onEnded: () => dispatch({ type: 'listen/complete' }),
      // Playback reaching the end also fires `pause`; that one is not a user
      // pause, so it must not flash "paused" before `ended` completes it.
      onPause: () => {
        if (!audioRef.current?.ended) dispatch({ type: 'listen/mediaPause' })
      },
      onPlay: () => dispatch({ type: 'listen/mediaPlay' }),
      onError: () => fail(),
      // Keeps the button in step if mute changes outside it (e.g. OS media controls).
      onVolumeChange: () => setMuted(Boolean(audioRef.current?.muted)),
    }),
    [dispatch, fail],
  )

  return { audioRef, audioProps, play, pause, restart, retry, stop, muted, toggleMute }
}
