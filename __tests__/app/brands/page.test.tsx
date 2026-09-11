import React from 'react'
import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest'
import BrandsPage from '@/app/brands/page'

vi.mock('framer-motion', () => ({
  AnimatePresence: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  useInView: () => true,
  motion: {
    div: ({ children, ...props }: React.HTMLAttributes<HTMLDivElement>) => <div {...props}>{children}</div>,
    article: ({ children, ...props }: React.HTMLAttributes<HTMLElement>) => <article {...props}>{children}</article>,
    p: ({ children, ...props }: React.HTMLAttributes<HTMLParagraphElement>) => <p {...props}>{children}</p>,
    span: ({ children, ...props }: React.HTMLAttributes<HTMLSpanElement>) => <span {...props}>{children}</span>,
    h3: ({ children, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => <h3 {...props}>{children}</h3>,
    rect: (props: React.ComponentProps<'rect'>) => <rect {...props} />,
    circle: (props: React.ComponentProps<'circle'>) => <circle {...props} />,
  },
}))

vi.mock('next/link', () => ({
  default: ({ href, children, className, onClick }: {
    href: string
    children: React.ReactNode
    className?: string
    onClick?: () => void
  }) => <a href={href} className={className} onClick={onClick}>{children}</a>,
}))

// Only `trackCTA` is stubbed; the rest of the module stays real so other
// sections on this page keep working.
const trackCTA = vi.hoisted(() => vi.fn())
vi.mock('@/lib/analytics', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@/lib/analytics')>()),
  trackCTA,
}))

// jsdom implements none of these browser APIs, and sections this page renders
// call all of them from mount effects.
beforeAll(() => {
  window.matchMedia = ((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  })) as unknown as typeof window.matchMedia
  ;(SVGElement.prototype as unknown as { getTotalLength: () => number }).getTotalLength = () => 0
  vi.stubGlobal('IntersectionObserver', vi.fn(function IntersectionObserver() {
    return { observe: vi.fn(), unobserve: vi.fn(), disconnect: vi.fn() }
  }))
  vi.stubGlobal('scrollTo', vi.fn())
})

afterEach(() => {
  cleanup()
  trackCTA.mockClear()
})

describe('BrandsPage playground entry point', () => {
  it('renders the playground entry-point copy verbatim', () => {
    render(<BrandsPage />)

    expect(screen.getByRole('heading', {
      level: 2,
      name: 'What does a placement inside an AI answer look like?',
    })).toBeInTheDocument()
    expect(screen.getByText(
      'Walk through one publisher article as a reader would, and watch intent, purchase stage, and placement opportunity land on the Brand value ledger.',
    )).toBeInTheDocument()
  })

  it('links to the playground with the brand lens', () => {
    render(<BrandsPage />)

    expect(screen.getByRole('link', { name: 'Try AI Mode' }))
      .toHaveAttribute('href', '/cortex-playground/?lens=brand')
  })

  // Both audience entry points carry the same `Try AI Mode` label, so
  // `cta_position` is the only field in GA that tells them apart. Asserted
  // against the real page rather than a fixture the test declares itself.
  it('tracks the click with this page own position', async () => {
    const user = userEvent.setup()
    render(<BrandsPage />)

    await user.click(screen.getByRole('link', { name: 'Try AI Mode' }))

    expect(trackCTA).toHaveBeenCalledWith('Try AI Mode', 'brands_playground')
  })

  // The entry point is dropped inside the dark Media AEO section, so it has to
  // be the embedded variant — the standalone one would nest a white `<section>`
  // with dark text and its own gradient in the middle of a dark ground.
  it('renders embedded in the dark section, not as its own white section', () => {
    render(<BrandsPage />)

    const link = screen.getByRole('link', { name: 'Try AI Mode' })
    expect(link.closest('section')).toHaveClass('section-dark')
    expect(link.closest('.section-white')).toBeNull()
  })

  it('places the entry point after Media AEO and before Execution vs. Monitoring', () => {
    render(<BrandsPage />)

    const headings = screen.getAllByRole('heading', { level: 2 }).map((h) => h.textContent?.trim())
    const mediaAeo = headings.indexOf('How does managed media AEO differ from open-web AEO strategies?')
    const entry = headings.indexOf('What does a placement inside an AI answer look like?')
    const execution = headings.indexOf("What's the difference between AEO monitoring and AEO execution?")

    expect(mediaAeo).toBeGreaterThanOrEqual(0)
    expect(execution).toBeGreaterThanOrEqual(0)
    expect(entry).toBeGreaterThan(mediaAeo)
    expect(entry).toBeLessThan(execution)
  })

  it('leaves the bottom email CTA in place', () => {
    render(<BrandsPage />)

    expect(screen.getByRole('heading', {
      level: 2,
      name: 'How does Media AEO work for your brand?',
    })).toBeInTheDocument()
  })
})
