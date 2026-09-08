import React from 'react'
import { render, screen } from '@testing-library/react'
import DecisiveEnginePage, { metadata } from '@/app/decisive-engine/page'

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

describe('DecisiveEnginePage', () => {
  it('assembles all seven sections, each proven by a distinctive rendered string', () => {
    render(<DecisiveEnginePage />)

    // 1. Hero
    expect(
      screen.getByRole('heading', { level: 1 })
    ).toHaveTextContent('Route. Observe. Decide.')
    expect(screen.getByText('Mlytics Multi-CDN Intelligence')).toBeInTheDocument()

    // 2. Decision loop
    expect(
      screen.getByRole('heading', { level: 2, name: 'Monitoring becomes routing action.' })
    ).toBeInTheDocument()

    // 3. Engine advantages
    expect(
      screen.getByRole('heading', {
        level: 2,
        name: 'Control across providers, markets, and workloads.',
      })
    ).toBeInTheDocument()

    // 4. Engine comparison
    expect(
      screen.getByRole('heading', { level: 2, name: 'More than multiple CDN contracts.' })
    ).toBeInTheDocument()

    // 5. Engine use cases
    expect(
      screen.getByRole('heading', {
        level: 2,
        name: 'Built for delivery that changes by market and moment.',
      })
    ).toBeInTheDocument()

    // 6. CTA — business outcome
    expect(
      screen.getByRole('heading', { level: 2, name: 'One control layer for global delivery.' })
    ).toBeInTheDocument()

    // 7. CTA — official references + final contact CTA
    expect(
      screen.getByRole('heading', { level: 2, name: 'Explore the underlying capabilities.' })
    ).toBeInTheDocument()
    expect(
      screen.getByRole('heading', {
        level: 2,
        name: 'Which markets are underperforming today?',
      })
    ).toBeInTheDocument()
  })

  it('sets the expected metadata title, description, and canonical', () => {
    expect(metadata.title).toBe('Decisive Engine — Route. Observe. Decide.')
    expect(metadata.description).toBe(
      'Data-driven Multi-CDN traffic steering powered by real user monitoring, synthetic monitoring, policy control, and origin optimization.'
    )
    expect(metadata.alternates).toEqual({ canonical: '/decisive-engine/' })
  })
})
