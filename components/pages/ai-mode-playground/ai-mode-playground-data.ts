import type { PlaygroundLens } from './ai-mode-playground-copy'

export type { PlaygroundLens } from './ai-mode-playground-copy'

export const PLAYGROUND_LENSES = ['content-owners', 'brands'] as const

export const DEFAULT_LENS: PlaygroundLens = 'content-owners'

/** Legacy URL values remain readable so links already shared by users keep working. */
export const LEGACY_LENS_ALIASES: Record<string, PlaygroundLens> = {
  publisher: 'content-owners',
  media: 'content-owners',
  brand: 'brands',
}

export function isPlaygroundLens(value: unknown): value is PlaygroundLens {
  return typeof value === 'string' && (PLAYGROUND_LENSES as readonly string[]).includes(value)
}

/** Read the browser URL without coupling the pure helper to React or browser globals. */
export function readLensFromSearch(search: string): PlaygroundLens | null {
  const value = new URLSearchParams(search).get('lens')
  if (isPlaygroundLens(value)) return value
  if (value !== null && Object.hasOwn(LEGACY_LENS_ALIASES, value)) return LEGACY_LENS_ALIASES[value]
  return null
}
