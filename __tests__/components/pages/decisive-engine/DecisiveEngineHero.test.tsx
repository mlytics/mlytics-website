import React from 'react'
import { render, screen } from '@testing-library/react'
import { DecisiveEngineHero } from '@/components/pages/decisive-engine/DecisiveEngineHero'

vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
      <div {...props}>{children}</div>
    ),
  },
}))

vi.mock('@/components/pages/decisive-engine/CdnQualityCard', () => ({
  CdnQualityCard: () => <div data-testid="cdn-quality-card" />,
}))

describe('DecisiveEngineHero', () => {
  it('renders the H1 with all three verbs', () => {
    render(<DecisiveEngineHero />)
    const h1 = screen.getByRole('heading', { level: 1 })
    expect(h1).toHaveTextContent('Route.')
    expect(h1).toHaveTextContent('Observe.')
    expect(h1).toHaveTextContent('Decide.')
  })

  it('renders the eyebrow', () => {
    render(<DecisiveEngineHero />)
    expect(screen.getByText('Mlytics Multi-CDN Intelligence')).toBeInTheDocument()
  })

  it('renders the lead copy verbatim', () => {
    render(<DecisiveEngineHero />)
    expect(
      screen.getByText(
        'Decisive Engine turns real-world network data into active Multi-CDN traffic decisions—helping every market use the right delivery path at the right moment.'
      )
    ).toBeInTheDocument()
  })

  it('renders all five capability pills', () => {
    render(<DecisiveEngineHero />)
    for (const pill of [
      'Real User Monitoring',
      'Synthetic Monitoring',
      'ISP / ASN Intelligence',
      'Multi-CDN Steering',
      'Origin Optimization',
    ]) {
      expect(screen.getByText(pill)).toBeInTheDocument()
    }
  })

  it('renders all four stat items', () => {
    render(<DecisiveEngineHero />)
    for (const stat of ['RUM + Synthetic', 'Cross-provider', 'ISP-aware', 'Closed loop']) {
      expect(screen.getByText(stat)).toBeInTheDocument()
    }
    for (const desc of [
      'Two complementary data sources',
      'Decisions across multiple CDNs',
      'Market and network granularity',
      'Telemetry converted into action',
    ]) {
      expect(screen.getByText(desc)).toBeInTheDocument()
    }
  })

  it('embeds the CDN quality card', () => {
    render(<DecisiveEngineHero />)
    expect(screen.getByTestId('cdn-quality-card')).toBeInTheDocument()
  })

  it('renders the stat descriptions at the /85 on-dark text step, not /70', () => {
    render(<DecisiveEngineHero />)
    for (const desc of [
      'Two complementary data sources',
      'Decisions across multiple CDNs',
      'Market and network granularity',
      'Telemetry converted into action',
    ]) {
      const el = screen.getByText(desc)
      expect(el).toHaveClass('text-on-dark/85')
      expect(el.className).not.toMatch(/text-on-dark\/70\b/)
    }
  })
})
