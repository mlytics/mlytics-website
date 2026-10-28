import React from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { DecisiveEnginePageCTA } from '@/components/pages/decisive-engine/DecisiveEnginePageCTA'

vi.mock('framer-motion', () => ({
  AnimatePresence: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  motion: {
    div: ({ children, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
      <div {...props}>{children}</div>
    ),
  },
}))

vi.mock('next/link', () => ({
  default: ({ href, children, className, onClick, ...rest }: {
    href: string
    children: React.ReactNode
    className?: string
    onClick?: React.MouseEventHandler<HTMLAnchorElement>
  }) => (
    <a href={href} className={className} {...rest}
      onClick={(e) => { e.preventDefault(); onClick?.(e) }}>
      {children}
    </a>
  ),
}))

const trackCTA = vi.hoisted(() => vi.fn())
vi.mock('@/lib/analytics', () => ({ trackCTA }))
afterEach(() => { trackCTA.mockClear(); vi.unstubAllGlobals() })

describe('DecisiveEnginePageCTA', () => {
  it('renders the business outcome heading', () => {
    render(<DecisiveEnginePageCTA />)
    expect(
      screen.getByRole('heading', { level: 2, name: 'One control layer for global delivery.' })
    ).toBeInTheDocument()
  })

  it('renders all four outcome statements', () => {
    render(<DecisiveEnginePageCTA />)
    for (const outcome of [
      'Better regional performance through measured CDN selection',
      'Higher resilience through provider and path diversity',
      'Lower origin pressure through tiered-cache optimization',
      'Clearer operational control through visible routing policy',
    ]) {
      expect(screen.getByText(outcome)).toBeInTheDocument()
    }
  })

  it('does not link to the mislabelled developers page', () => {
    render(<DecisiveEnginePageCTA />)
    const hrefs = screen.getAllByRole('link').map((a) => a.getAttribute('href'))
    expect(hrefs).not.toContain('https://www.mlytics.com/developers')
  })

  it('renders the contact CTA pointing at book-a-demo', () => {
    render(<DecisiveEnginePageCTA />)
    expect(screen.getByRole('link', { name: 'Contact Us' })).toHaveAttribute(
      'href',
      '/book-a-demo'
    )
  })

  // --- Additional pinning assertions beyond the brief ---
  // Every visible English string must be pinned by an exact assertion so a
  // one-character alteration fails the suite.

  it('renders the dark-section eyebrow verbatim', () => {
    render(<DecisiveEnginePageCTA />)
    expect(screen.getByText('The business outcome')).toBeInTheDocument()
  })

  it('does not render the removed official references section', () => {
    render(<DecisiveEnginePageCTA />)
    expect(screen.queryByText('Official references')).not.toBeInTheDocument()
    expect(
      screen.queryByRole('heading', { level: 2, name: 'Explore the underlying capabilities.' })
    ).not.toBeInTheDocument()
  })

  it('renders the FAQ section between the business outcome and the contact CTA', () => {
    render(<DecisiveEnginePageCTA />)
    expect(
      screen.getByRole('heading', { level: 2, name: 'Common questions.' })
    ).toBeInTheDocument()
  })

  it('renders the final CTA heading verbatim', () => {
    render(<DecisiveEnginePageCTA />)
    expect(
      screen.getByRole('heading', {
        level: 2,
        name: 'Which markets are underperforming today?',
      })
    ).toBeInTheDocument()
  })

  it('renders the final CTA paragraph verbatim', () => {
    render(<DecisiveEnginePageCTA />)
    expect(
      screen.getByText(
        'Bring your traffic profile — we will map it against measured CDN quality.'
      )
    ).toBeInTheDocument()
  })

  it('tracks the closing Contact Us CTA (DATAI-628)', async () => {
    render(<DecisiveEnginePageCTA />)
    await userEvent.click(screen.getByRole('link', { name: 'Contact Us' }))
    expect(trackCTA).toHaveBeenCalledTimes(1)
    expect(trackCTA).toHaveBeenCalledWith('Contact Us', 'decisive_engine_cta')
  })
})
