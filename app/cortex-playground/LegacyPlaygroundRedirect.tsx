'use client'

import { useEffect } from 'react'

/** The real redirect. `<meta http-equiv="refresh">` can only point at a fixed
 *  URL, so it drops `?lens=` — and DATAI-555 put those deep links into
 *  circulation. Carrying `search` and `hash` across keeps a shared
 *  `/cortex-playground/?lens=brand` landing on the Brand lens. */
export function LegacyPlaygroundRedirect({ destination }: { destination: string }) {
  useEffect(() => {
    const { search, hash } = window.location
    window.location.replace(`${destination}${search}${hash}`)
  }, [destination])

  return null
}
