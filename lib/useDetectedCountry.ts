'use client'

import { useEffect, useState } from 'react'

const DETECT_TIMEOUT_MS = 2500

/** Detects the visitor's country via IP geolocation, falling back to `fallbackIso2` on failure or timeout. */
export function useDetectedCountry(fallbackIso2: string) {
  const [iso2, setIso2] = useState(fallbackIso2)

  useEffect(() => {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), DETECT_TIMEOUT_MS)

    fetch('https://get.geojs.io/v1/ip/country.json', { signal: controller.signal })
      .then(res => res.json())
      .then((data: { country?: string }) => {
        if (data.country) setIso2(data.country.toLowerCase())
      })
      .catch(() => {
        // keep fallbackIso2
      })
      .finally(() => clearTimeout(timeout))

    return () => {
      clearTimeout(timeout)
      controller.abort()
    }
  }, [])

  return iso2
}
