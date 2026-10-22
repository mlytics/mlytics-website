import { render } from '@testing-library/react'
import { afterEach, expect, it, vi } from 'vitest'
import { FlywheelDiagram } from '@/components/home/FlywheelDiagram'
import { stubReducedMotion } from '../../helpers/matchMedia'

afterEach(() => vi.unstubAllGlobals())

it('drops the travelling animation when reduced motion is on', () => {
  stubReducedMotion(true)
  const { container } = render(<FlywheelDiagram />)
  expect(container.querySelector('animateMotion')).toBeNull()
  // The particle rests at the top of the ring: (CX, CY - R) = (200, 62).
  const particle = container.querySelector('circle[r="5"]')!
  expect(particle).toHaveAttribute('cx', '200')
  expect(particle).toHaveAttribute('cy', '62')
})

it('keeps it otherwise', () => {
  stubReducedMotion(false)
  const { container } = render(<FlywheelDiagram />)
  expect(container.querySelector('animateMotion')).not.toBeNull()
  const particle = container.querySelector('circle[r="5"]')!
  expect(particle).not.toHaveAttribute('cx')
  expect(particle).not.toHaveAttribute('cy')
})
