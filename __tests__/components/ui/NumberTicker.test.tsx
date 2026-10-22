import { render, screen, waitFor } from '@testing-library/react'
import { afterEach, expect, it, vi } from 'vitest'
import { NumberTicker } from '@/components/ui/NumberTicker'
import { stubReducedMotion } from '../../helpers/matchMedia'

afterEach(() => vi.unstubAllGlobals())

it('shows the final value at once when reduced motion is on', () => {
  stubReducedMotion(true)
  render(<NumberTicker value={85} suffix="%" />)
  expect(screen.getByText('85%')).toBeInTheDocument()
})

it('still counts up from 0 otherwise', async () => {
  stubReducedMotion(false)
  render(<NumberTicker value={85} suffix="%" duration={50} />)
  expect(screen.getByText('0%')).toBeInTheDocument()
  await waitFor(() => expect(screen.getByText('85%')).toBeInTheDocument())
})
