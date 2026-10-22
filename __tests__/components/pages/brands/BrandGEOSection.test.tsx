import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import { BrandGEOSection } from '@/components/pages/brands/BrandGEOSection'
import { stubReducedMotion } from '../../../helpers/matchMedia'

// Same shallow framer-motion mock as __tests__/app/brands/page.test.tsx: the
// MAU block is always "in view", so the counter starts on mount.
vi.mock('framer-motion', () => ({
  AnimatePresence: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  useInView: () => true,
  motion: {
    div: ({ children, ...props }: React.HTMLAttributes<HTMLDivElement>) => <div {...props}>{children}</div>,
    p: ({ children, ...props }: React.HTMLAttributes<HTMLParagraphElement>) => <p {...props}>{children}</p>,
    span: ({ children, ...props }: React.HTMLAttributes<HTMLSpanElement>) => <span {...props}>{children}</span>,
    rect: (props: React.ComponentProps<'rect'>) => <rect {...props} />,
    circle: (props: React.ComponentProps<'circle'>) => <circle {...props} />,
  },
}))

vi.mock('next/link', () => ({
  default: ({ href, children, className }: { href: string; children: React.ReactNode; className?: string }) =>
    <a href={href} className={className}>{children}</a>,
}))

beforeEach(() => {
  ;(SVGElement.prototype as unknown as { getTotalLength: () => number }).getTotalLength = () => 0
})
afterEach(() => vi.unstubAllGlobals())

it('shows the final MAU number at once when reduced motion is on', () => {
  stubReducedMotion(true)
  render(<BrandGEOSection />)
  expect(screen.getByText('15,000,000')).toBeInTheDocument()
})

it('still counts up otherwise', async () => {
  stubReducedMotion(false)
  render(<BrandGEOSection />)
  expect(screen.queryByText('15,000,000')).toBeNull()
  await waitFor(() => expect(screen.getByText('15,000,000')).toBeInTheDocument(), { timeout: 4000 })
})
