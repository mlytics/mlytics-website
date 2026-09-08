import React from 'react'
import { render, screen, within } from '@testing-library/react'
import { DecisionLoop } from '@/components/pages/decisive-engine/DecisionLoop'

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

describe('DecisionLoop', () => {
  it('renders the section heading', () => {
    render(<DecisionLoop />)
    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent(
      'Monitoring becomes routing action.'
    )
  })

  it('renders all three loop steps', () => {
    render(<DecisionLoop />)
    for (const step of ['Observe', 'Decide', 'Route']) {
      expect(screen.getByRole('heading', { level: 3, name: step })).toBeInTheDocument()
    }
  })

  it('renders all three body paragraphs verbatim in full', () => {
    render(<DecisionLoop />)
    expect(
      screen.getByText(
        'Combine RUM and synthetic measurements across countries, regions, ISPs, ASNs, CDN providers, time windows, and content types.'
      )
    ).toBeInTheDocument()
    expect(
      screen.getByText(
        'Evaluate availability, latency, TTFB, download performance, capacity, traffic ratios, cost conditions, and customer-defined policy.'
      )
    ).toBeInTheDocument()
    expect(
      screen.getByText(
        'Steer traffic through DNS and Multi-CDN orchestration, moving each market toward an appropriate healthy delivery path.'
      )
    ).toBeInTheDocument()
  })

  it("renders the Observe card's three absorbed tags", () => {
    render(<DecisionLoop />)
    const card = within(
      screen.getByRole('heading', { level: 3, name: 'Observe' }).closest('article') as HTMLElement
    )
    expect(card.getByText('Real users')).toBeInTheDocument()
    expect(card.getByText('Synthetic probes')).toBeInTheDocument()
    expect(card.getByText('Service health')).toBeInTheDocument()
  })

  it("renders the Decide card's six absorbed tags", () => {
    render(<DecisionLoop />)
    const card = within(
      screen.getByRole('heading', { level: 3, name: 'Decide' }).closest('article') as HTMLElement
    )
    for (const tag of [
      'Performance',
      'Availability',
      'Capacity',
      'Traffic share',
      'Cost',
      'Manual control',
    ]) {
      expect(card.getByText(tag)).toBeInTheDocument()
    }
  })

  it("renders the Route card's three absorbed tags", () => {
    render(<DecisionLoop />)
    const card = within(
      screen.getByRole('heading', { level: 3, name: 'Route' }).closest('article') as HTMLElement
    )
    expect(card.getByText('Multiple CDNs')).toBeInTheDocument()
    expect(card.getByText('Origin Shield')).toBeInTheDocument()
    expect(card.getByText('Applications')).toBeInTheDocument()
  })
})
