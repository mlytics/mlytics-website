import React from 'react'
import { render, screen } from '@testing-library/react'
import { EngineUseCases } from '@/components/pages/decisive-engine/EngineUseCases'

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

describe('EngineUseCases', () => {
  it('renders the section heading', () => {
    render(<EngineUseCases />)
    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent(
      'Built for delivery that changes by market and moment.'
    )
  })

  it('renders the eyebrow text exactly', () => {
    render(<EngineUseCases />)
    expect(screen.getByText('High-value use cases')).toBeInTheDocument()
  })

  it('renders exactly seven use cases', () => {
    render(<EngineUseCases />)
    expect(screen.getAllByRole('heading', { level: 3 })).toHaveLength(7)
  })

  it('renders every retained use case title', () => {
    render(<EngineUseCases />)
    for (const title of [
      'Gaming & large updates',
      'Sportsbook & iGaming',
      'OTT, VoD & live events',
      'Global commerce',
      'APIs & dynamic apps',
      'AI Gateway',
      'China outbound',
    ]) {
      expect(screen.getByRole('heading', { level: 3, name: title })).toBeInTheDocument()
    }
  })

  it('renders every use case body paragraph verbatim', () => {
    render(<EngineUseCases />)
    for (const body of [
      'Distribute launch peaks and high-concurrency downloads across CDNs while Origin Shield reduces repeated origin pressure.',
      'Use dynamic endpoint and long-connection quality to steer real-time odds, API, SSE, and WebSocket traffic.',
      'Allocate traffic using regional quality, availability, and capacity during media peaks and major broadcasts.',
      'Adapt CDN selection to changing country and ISP conditions across storefront assets and dynamic transactions.',
      'Measure application endpoints through different CDNs and use end-to-end service quality in routing decisions.',
      'Improve user-to-gateway network paths and streaming stability while integrating DDoS, WAF, API, and bot protection.',
      'Use market and ISP measurements to select delivery paths for cross-border and locally diverse network conditions.',
    ]) {
      expect(screen.getByText(body)).toBeInTheDocument()
    }
  })

  it('does not render the Bring-your-own CDN use case', () => {
    render(<EngineUseCases />)
    expect(
      screen.queryByRole('heading', { level: 3, name: 'Bring-your-own CDN' })
    ).not.toBeInTheDocument()
  })
})
