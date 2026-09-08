import React from 'react'
import { render, screen, within } from '@testing-library/react'
import { EngineAdvantages } from '@/components/pages/decisive-engine/EngineAdvantages'

vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
      <div {...props}>{children}</div>
    ),
    article: ({ children, ...props }: React.HTMLAttributes<HTMLElement>) => (
      <article {...props}>{children}</article>
    ),
  },
}))

describe('EngineAdvantages', () => {
  it('renders the section heading', () => {
    render(<EngineAdvantages />)
    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent(
      'Control across providers, markets, and workloads.'
    )
  })

  it('renders the eyebrow text exactly', () => {
    render(<EngineAdvantages />)
    expect(screen.getByText('Core advantages')).toBeInTheDocument()
  })

  it('renders the intro paragraph verbatim', () => {
    render(<EngineAdvantages />)
    expect(
      screen.getByText(
        'Mlytics adds an independent decision layer above CDN delivery, giving teams the data and control to optimize performance and resilience at global scale.'
      )
    ).toBeInTheDocument()
  })

  it('renders exactly nine advantages', () => {
    render(<EngineAdvantages />)
    expect(screen.getAllByRole('heading', { level: 3 })).toHaveLength(9)
  })

  it('renders every advantage title', () => {
    render(<EngineAdvantages />)
    for (const title of [
      'Cross-CDN intelligence',
      'RUM + synthetic data',
      'ISP-level precision',
      'Availability-first steering',
      'Bring-your-own CDN',
      'Flexible policy',
      'Transparent decisions',
      'Origin efficiency',
      'Static + dynamic optimization',
    ]) {
      expect(screen.getByRole('heading', { level: 3, name: title })).toBeInTheDocument()
    }
  })

  it('numbers the advantages 01 through 09', () => {
    render(<EngineAdvantages />)
    expect(screen.getByText('01')).toBeInTheDocument()
    expect(screen.getByText('09')).toBeInTheDocument()
  })

  it('renders every advantage body paragraph verbatim', () => {
    render(<EngineAdvantages />)
    for (const body of [
      'Compare measured quality across providers and convert the result into active traffic steering.',
      'Unify actual last-mile experience with proactive global testing for a fuller quality picture.',
      'Build strategies around country, region, ISP, ASN, CDN, time window, and content type.',
      'Use service health, timeouts, connection failures, and errors to keep traffic on healthy paths.',
      'Monitor customer-provided CDN platforms and include them in Decisive Engine steering.',
      'Combine automation with traffic ratios, thresholds, regional rules, capacity, cost, and manual overrides.',
      'See quality trends, traffic share, applied strategy, and routing results through Pulse and analytics.',
      'Consolidate cache misses through Origin Shield to improve tiered-cache efficiency and origin offload.',
      'Use download and cache signals for assets, and end-to-end availability signals for APIs and applications.',
    ]) {
      expect(screen.getByText(body)).toBeInTheDocument()
    }
  })

  it('pairs each card number with its own title and body, not just present somewhere on the page', () => {
    render(<EngineAdvantages />)
    const cards = screen.getAllByRole('heading', { level: 3 }).map((heading) => {
      const card = heading.closest('article')
      if (!card) throw new Error('heading is not inside an article card')
      return within(card)
    })

    const expected = [
      { num: '01', title: 'Cross-CDN intelligence' },
      { num: '02', title: 'RUM + synthetic data' },
      { num: '03', title: 'ISP-level precision' },
      { num: '04', title: 'Availability-first steering' },
      { num: '05', title: 'Bring-your-own CDN' },
      { num: '06', title: 'Flexible policy' },
      { num: '07', title: 'Transparent decisions' },
      { num: '08', title: 'Origin efficiency' },
      { num: '09', title: 'Static + dynamic optimization' },
    ]

    expect(cards).toHaveLength(expected.length)

    cards.forEach((card, i) => {
      expect(card.getByText(expected[i].num)).toBeInTheDocument()
      expect(
        card.getByRole('heading', { level: 3, name: expected[i].title })
      ).toBeInTheDocument()
    })
  })
})
