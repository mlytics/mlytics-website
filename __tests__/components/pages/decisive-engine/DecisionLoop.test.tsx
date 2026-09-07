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

  it('pairs each hidden step number with its own card heading', () => {
    render(<DecisionLoop />)
    const expectations: [string, string][] = [
      ['Observe', '1'],
      ['Decide', '2'],
      ['Route', '3'],
    ]
    for (const [title, number] of expectations) {
      const heading = screen.getByRole('heading', { level: 3, name: title })
      const card = heading.closest('article')
      expect(card).not.toBeNull()
      const scoped = within(card as HTMLElement)
      expect(scoped.getByText(number)).toHaveAttribute('aria-hidden', 'true')
    }
  })
})
