import { vi } from 'vitest'

/**
 * jsdom does not implement media playback. This stub gives every
 * HTMLMediaElement its own paused/ended/currentTime state and fires the media
 * events a browser would, so components can be driven through real events.
 * Spies are created with vi.spyOn, so vi.restoreAllMocks() removes them.
 */
export const STUB_DURATION = 26.641

type MediaState = { paused: boolean; ended: boolean; currentTime: number; error: { code: number } | null }

/**
 * `async: true` queues the play/pause events that play()/pause() fire as
 * microtasks instead of dispatching them synchronously, closer to a browser,
 * which fires them from a queued task. The test drivers (tick/end/fail) stay
 * synchronous either way.
 */
export function stubMedia({ async = false }: { async?: boolean } = {}) {
  const states = new WeakMap<HTMLMediaElement, MediaState>()
  const pendingRejections: string[] = []
  const stateOf = (element: HTMLMediaElement) => {
    let state = states.get(element)
    if (!state) {
      state = { paused: true, ended: false, currentTime: 0, error: null }
      states.set(element, state)
    }
    return state
  }
  const fire = (element: HTMLMediaElement, type: string) => element.dispatchEvent(new Event(type))
  const fireFromMethod = (element: HTMLMediaElement, type: string) => {
    if (async) queueMicrotask(() => fire(element, type))
    else fire(element, type)
  }
  const proto = HTMLMediaElement.prototype

  const play = vi.spyOn(proto, 'play').mockImplementation(function (this: HTMLMediaElement) {
    const rejection = pendingRejections.shift()
    if (rejection) {
      const error = new Error(rejection)
      error.name = rejection
      return Promise.reject(error)
    }
    const state = stateOf(this)
    // A persistent media error (until load()) leaves play() hanging: it never
    // settles and fires nothing, like a browser stuck on a failed source.
    if (state.error) return new Promise<void>(() => {})
    if (state.ended) {
      state.ended = false
      state.currentTime = 0
    }
    if (state.paused) {
      state.paused = false
      fireFromMethod(this, 'play')
    }
    return Promise.resolve()
  })
  const pause = vi.spyOn(proto, 'pause').mockImplementation(function (this: HTMLMediaElement) {
    const state = stateOf(this)
    if (state.paused) return
    state.paused = true
    fireFromMethod(this, 'pause')
  })
  const load = vi.spyOn(proto, 'load').mockImplementation(function (this: HTMLMediaElement) {
    const state = stateOf(this)
    state.paused = true
    state.ended = false
    state.currentTime = 0
    state.error = null
  })
  vi.spyOn(proto, 'paused', 'get').mockImplementation(function (this: HTMLMediaElement) { return stateOf(this).paused })
  vi.spyOn(proto, 'ended', 'get').mockImplementation(function (this: HTMLMediaElement) { return stateOf(this).ended })
  // jsdom omits some media getters; give them a neutral, configurable base
  // (a fresh element: no error, NETWORK_EMPTY) so they can be spied on and
  // vi.restoreAllMocks() returns them to that base.
  for (const [name, value] of [['error', null], ['networkState', 0]] as const) {
    if (!Object.getOwnPropertyDescriptor(proto, name)?.get) {
      Object.defineProperty(proto, name, { configurable: true, get: () => value })
    }
  }
  vi.spyOn(proto, 'error', 'get').mockImplementation(function (this: HTMLMediaElement) {
    return stateOf(this).error as MediaError | null
  })
  // NETWORK_NO_SOURCE (3) while errored, else NETWORK_IDLE (1).
  vi.spyOn(proto, 'networkState', 'get').mockImplementation(function (this: HTMLMediaElement) {
    return stateOf(this).error ? 3 : 1
  })
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
    /** Leaves a persistent `audio.error` (cleared only by load()), then fires `error`. */
    failPersistently(audio: HTMLMediaElement, code = 2) {
      stateOf(audio).error = { code }
      fire(audio, 'error')
    },
    stateOf,
  }
}

export type MediaStub = ReturnType<typeof stubMedia>
