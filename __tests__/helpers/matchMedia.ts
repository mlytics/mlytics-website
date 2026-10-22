import { vi } from 'vitest'

// Stubs window.matchMedia so only the reduced-motion query is controllable;
// every other query reports matches: false. `set` fires the change listeners.
export const REDUCE_QUERY = '(prefers-reduced-motion: reduce)'

export function stubReducedMotion(initial: boolean) {
  let matches = initial
  const listeners = new Set<(e: MediaQueryListEvent) => void>()
  vi.stubGlobal('matchMedia', vi.fn((query: string) => ({
    get matches() { return query === REDUCE_QUERY ? matches : false },
    media: query,
    onchange: null,
    addEventListener: (_: string, fn: (e: MediaQueryListEvent) => void) => { if (query === REDUCE_QUERY) listeners.add(fn) },
    removeEventListener: (_: string, fn: (e: MediaQueryListEvent) => void) => { listeners.delete(fn) },
    addListener: vi.fn(), removeListener: vi.fn(), dispatchEvent: vi.fn(),
  })))
  return {
    set(next: boolean) {
      matches = next
      listeners.forEach((fn) => fn({ matches: next } as MediaQueryListEvent))
    },
  }
}
