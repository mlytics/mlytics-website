import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import type { Dispatch } from 'react'
import type { ListenStatus, PlaygroundAction } from './playground-logic'

/**
 * Binds the Listen experience to a real `<audio>` element. The element is the
 * only time source: progress, completion and pauses all come from its media
 * events, and the reducer guards make repeated events no-ops. There is no
 * timer fallback — if the audio cannot load, the experience goes to `error`.
 *
 * `play` / `restart` / `retry` must be called synchronously inside the click
 * handler so iOS Safari treats playback as user-initiated.
 *
 * Media events only count while a session is live: status playing/paused, or
 * a user-started play() still in flight. A late `error` after stop/reset/tab
 * switch is ignored, and a resume from OS/hardware media keys while the UI is
 * idle or completed is paused straight back.
 */
export function useListenAudio(dispatch: Dispatch<PlaygroundAction>, onError: () => void, status: ListenStatus) {
  const audioRef = useRef<HTMLAudioElement>(null)
  const onErrorRef = useRef(onError)
  // Current status for event handlers without stale closures. A layout effect
  // keeps it in step during commit, before any media task can run.
  const statusRef = useRef(status)
  // True from a user-initiated play() until its `play` event or promise
  // settles. Handlers dispatch before calling play(), but the commit can land
  // after a synchronous `play` event, so status alone cannot tell them apart.
  const userPlayPendingRef = useRef(false)
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

  useLayoutEffect(() => {
    statusRef.current = status
  }, [status])

  const isLive = useCallback(
    () => userPlayPendingRef.current || statusRef.current === 'playing' || statusRef.current === 'paused',
    [],
  )

  const fail = useCallback(() => {
    if (failedRef.current || !isLive()) return
    failedRef.current = true
    dispatch({ type: 'listen/error' })
    onErrorRef.current()
  }, [dispatch, isLive])

  const play = useCallback(() => {
    const audio = audioRef.current
    if (!audio) return
    failedRef.current = false
    userPlayPendingRef.current = true
    // AbortError means a later pause()/load() interrupted this play() — not a failure.
    Promise.resolve(audio.play()).then(
      () => { userPlayPendingRef.current = false },
      (error: unknown) => {
        if ((error as { name?: string } | null)?.name !== 'AbortError') fail()
        userPlayPendingRef.current = false
      },
    )
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
    userPlayPendingRef.current = false
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
      onPlay: () => {
        if (userPlayPendingRef.current || statusRef.current === 'playing' || statusRef.current === 'paused') {
          userPlayPendingRef.current = false
          dispatch({ type: 'listen/mediaPlay' })
          return
        }
        // Media keys resumed the element while the UI is idle/completed/error:
        // undo it, leaving currentTime where stop() or the end left it.
        audioRef.current?.pause()
      },
      onError: () => fail(),
      // Keeps the button in step if mute changes outside it (e.g. OS media controls).
      onVolumeChange: () => setMuted(Boolean(audioRef.current?.muted)),
    }),
    [dispatch, fail],
  )

  return { audioRef, audioProps, play, pause, restart, retry, stop, muted, toggleMute }
}
