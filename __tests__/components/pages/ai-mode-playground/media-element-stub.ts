import { vi } from 'vitest'

/**
 * jsdom does not implement media playback. This stub gives every
 * HTMLMediaElement its own paused/ended/currentTime state and fires the media
 * events a browser would, so components can be driven through real events.
 * Spies are created with vi.spyOn, so vi.restoreAllMocks() removes them.
 */
export const STUB_DURATION = 26.641

type MediaState = { paused: boolean; ended: boolean; currentTime: number }

export function stubMedia() {
  const states = new WeakMap<HTMLMediaElement, MediaState>()
  const pendingRejections: string[] = []
  const stateOf = (element: HTMLMediaElement) => {
    let state = states.get(element)
    if (!state) {
      state = { paused: true, ended: false, currentTime: 0 }
      states.set(element, state)
    }
    return state
  }
  const fire = (element: HTMLMediaElement, type: string) => element.dispatchEvent(new Event(type))
  const proto = HTMLMediaElement.prototype

  const play = vi.spyOn(proto, 'play').mockImplementation(function (this: HTMLMediaElement) {
    const rejection = pendingRejections.shift()
    if (rejection) {
      const error = new Error(rejection)
      error.name = rejection
      return Promise.reject(error)
    }
    const state = stateOf(this)
    if (state.ended) {
      state.ended = false
      state.currentTime = 0
    }
    if (state.paused) {
      state.paused = false
      fire(this, 'play')
    }
    return Promise.resolve()
  })
  const pause = vi.spyOn(proto, 'pause').mockImplementation(function (this: HTMLMediaElement) {
    const state = stateOf(this)
    if (state.paused) return
    state.paused = true
    fire(this, 'pause')
  })
  const load = vi.spyOn(proto, 'load').mockImplementation(function (this: HTMLMediaElement) {
    const state = stateOf(this)
    state.paused = true
    state.ended = false
    state.currentTime = 0
  })
  vi.spyOn(proto, 'paused', 'get').mockImplementation(function (this: HTMLMediaElement) { return stateOf(this).paused })
  vi.spyOn(proto, 'ended', 'get').mockImplementation(function (this: HTMLMediaElement) { return stateOf(this).ended })
  vi.spyOn(proto, 'duration', 'get').mockImplementation(() => STUB_DURATION)
  vi.spyOn(proto, 'currentTime', 'get').mockImplementation(function (this: HTMLMediaElement) { return stateOf(this).currentTime })
  const setCurrentTime = vi.spyOn(proto, 'currentTime', 'set').mockImplementation(function (this: HTMLMediaElement, value: number) {
    const state = stateOf(this)
    state.currentTime = value
    if (value < STUB_DURATION) state.ended = false
  })

  return {
    play,
    pause,
    load,
    setCurrentTime,
    /** The next play() call rejects with a DOMException-like error of this name. */
    rejectNextPlay(name: string) {
      pendingRejections.push(name)
    },
    /** Moves playback to `time` seconds and fires `timeupdate`. */
    tick(audio: HTMLMediaElement, time: number) {
      stateOf(audio).currentTime = time
      fire(audio, 'timeupdate')
    },
    /** Natural end of playback: paused + ended, then `pause` and `ended` like a browser. */
    end(audio: HTMLMediaElement) {
      const state = stateOf(audio)
      state.currentTime = STUB_DURATION
      state.paused = true
      state.ended = true
      fire(audio, 'pause')
      fire(audio, 'ended')
    },
    /** A media error (network/decode). */
    fail(audio: HTMLMediaElement) {
      fire(audio, 'error')
    },
    stateOf,
  }
}

export type MediaStub = ReturnType<typeof stubMedia>
