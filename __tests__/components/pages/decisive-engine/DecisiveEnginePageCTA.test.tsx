import React from 'react'
import { render, screen } from '@testing-library/react'
import { DecisiveEnginePageCTA } from '@/components/pages/decisive-engine/DecisiveEnginePageCTA'

vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
      <div {...props}>{children}</div>
    ),
  },
}))

vi.mock('next/link', () => ({
  default: ({
    href,
    children,
    className,
  }: {
    href: string
    children: React.ReactNode
    className?: string
  }) => (
    <a href={href} className={className}>
      {children}
    </a>
  ),
}))

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

  it('renders exactly six reference links', () => {
    render(<DecisiveEnginePageCTA />)
    const external = screen
      .getAllByRole('link')
      .filter((a) => a.getAttribute('href')?.startsWith('http'))
    expect(external).toHaveLength(6)
  })

  it('does not link to the mislabelled developers page', () => {
    render(<DecisiveEnginePageCTA />)
    const hrefs = screen.getAllByRole('link').map((a) => a.getAttribute('href'))
    expect(hrefs).not.toContain('https://www.mlytics.com/developers')
  })

  it('opens external references safely in a new tab', () => {
    render(<DecisiveEnginePageCTA />)
    const external = screen
      .getAllByRole('link')
      .filter((a) => a.getAttribute('href')?.startsWith('http'))
    for (const link of external) {
      expect(link).toHaveAttribute('target', '_blank')
      expect(link).toHaveAttribute('rel', 'noopener noreferrer')
    }
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

  it('renders the references eyebrow verbatim', () => {
    render(<DecisiveEnginePageCTA />)
    expect(screen.getByText('Official references')).toBeInTheDocument()
  })

  it('renders the references section heading verbatim', () => {
    render(<DecisiveEnginePageCTA />)
    expect(
      screen.getByRole('heading', { level: 2, name: 'Explore the underlying capabilities.' })
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

  it('renders each reference link label pinned to its own correct href', () => {
    render(<DecisiveEnginePageCTA />)
    const expected: { label: string; href: string }[] = [
      {
        label: 'RUM and Multi-CDN strategy',
        href: 'https://learning.mlytics.com/web-monitoring/how-to-implement-rum-for-multi-cdn-strategy/',
      },
      {
        label: 'Origin Shield, origin load balancing, and synthetic monitoring',
        href: 'https://www.mlytics.com/blog/mlytics-update-bolstering-origin-shield-and-enhancing-reflex-of-smart-load-balancer-and-pulse/',
      },
      {
        label: "Static and dynamic websites — what's the difference?",
        href: 'https://www.mlytics.com/blog/static-and-dynamic-websites-whats-the-difference/',
      },
      {
        label: "Reimagining Chinese games' success in the globe",
        href: 'https://www.mlytics.com/blog/reimagining-chinese-games-success-in-the-globe/',
      },
      {
        label: 'Global gaming data to reduce costs and increase efficiency',
        href: 'https://www.mlytics.com/blog/global-gaming-data-to-reduce-costs-and-increase-efficiency/',
      },
      {
        label: 'Achieving 41% monthly cost savings for e-commerce',
        href: 'https://www.mlytics.com/blog/achieving-41-monthly-cost-savings-for-e-commerce-with-mlytics-smart-load-balancing/',
      },
    ]

    for (const { label, href } of expected) {
      expect(screen.getByRole('link', { name: label })).toHaveAttribute('href', href)
    }
  })
})
