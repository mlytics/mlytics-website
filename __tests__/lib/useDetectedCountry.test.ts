import { renderHook, waitFor } from '@testing-library/react'
import { useDetectedCountry } from '@/lib/useDetectedCountry'

describe('useDetectedCountry', () => {
  it('resolves to the country returned by the geo-IP API', async () => {
    global.fetch = vi.fn().mockResolvedValueOnce({ json: () => Promise.resolve({ country: 'JP' }) })
    const { result } = renderHook(() => useDetectedCountry('tw'))
    await waitFor(() => expect(result.current).toBe('jp'))
  })

  it('resolves to a different country on a different response (not hardcoded)', async () => {
    global.fetch = vi.fn().mockResolvedValueOnce({ json: () => Promise.resolve({ country: 'US' }) })
    const { result } = renderHook(() => useDetectedCountry('tw'))
    await waitFor(() => expect(result.current).toBe('us'))
  })

  it('falls back to the given default when the API call fails', async () => {
    global.fetch = vi.fn().mockRejectedValueOnce(new Error('network error'))
    const { result } = renderHook(() => useDetectedCountry('tw'))
    await new Promise(r => setTimeout(r, 10))
    expect(result.current).toBe('tw')
  })

  it('falls back to the given default when the response has no country field', async () => {
    global.fetch = vi.fn().mockResolvedValueOnce({ json: () => Promise.resolve({}) })
    const { result } = renderHook(() => useDetectedCountry('tw'))
    await new Promise(r => setTimeout(r, 10))
    expect(result.current).toBe('tw')
  })
})
