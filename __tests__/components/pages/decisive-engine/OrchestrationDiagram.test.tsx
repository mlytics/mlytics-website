import React from 'react'
import { render, screen } from '@testing-library/react'
import { OrchestrationDiagram } from '@/components/pages/decisive-engine/OrchestrationDiagram'

vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
      <div {...props}>{children}</div>
    ),
  },
}))

describe('OrchestrationDiagram', () => {
  it('renders the eyebrow', () => {
    render(<OrchestrationDiagram />)
    expect(screen.getByText('One orchestration layer')).toBeInTheDocument()
  })

  it('renders the section heading', () => {
    render(<OrchestrationDiagram />)
    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent(
      'From network signals to global delivery.'
    )
    // toHaveTextContent does a substring match; pin the exact string too so
    // truncation or appended text is also caught (see task-4 brief note on
    // the recurring under-specified-copy-assertion defect).
    expect(
      screen.getByText('From network signals to global delivery.')
    ).toBeInTheDocument()
  })

  it('labels both columns', () => {
    render(<OrchestrationDiagram />)
    expect(screen.getByText('Observe')).toBeInTheDocument()
    expect(screen.getByText('Deliver')).toBeInTheDocument()
  })

  it('renders the three Observe boxes with verbatim titles and descriptions', () => {
    render(<OrchestrationDiagram />)
    expect(screen.getByText('Real users')).toBeInTheDocument()
    expect(screen.getByText('Last-mile experience from actual traffic')).toBeInTheDocument()
    expect(screen.getByText('Synthetic probes')).toBeInTheDocument()
    expect(screen.getByText('Proactive CDN and endpoint measurements')).toBeInTheDocument()
    expect(screen.getByText('Service health')).toBeInTheDocument()
    expect(screen.getByText('Latency, timeout, errors, and availability')).toBeInTheDocument()
  })

  it('renders the three Deliver boxes with verbatim titles and descriptions', () => {
    render(<OrchestrationDiagram />)
    expect(screen.getByText('Multiple CDNs')).toBeInTheDocument()
    expect(screen.getByText('Provider and regional path diversity')).toBeInTheDocument()
    expect(screen.getByText('Origin Shield')).toBeInTheDocument()
    expect(screen.getByText('Tiered cache and origin offload')).toBeInTheDocument()
    expect(screen.getByText('Applications')).toBeInTheDocument()
    expect(
      screen.getByText('Web, API, media, gaming, and AI services')
    ).toBeInTheDocument()
  })

  it('renders the engine core heading and paragraph verbatim', () => {
    render(<OrchestrationDiagram />)
    expect(screen.getByRole('heading', { level: 3, name: 'Decisive Engine' })).toBeInTheDocument()
    expect(
      screen.getByText(
        'Cross-CDN decision intelligence that aligns quality, availability, capacity, and policy.'
      )
    ).toBeInTheDocument()
  })

  it('renders the engine core with all six tags', () => {
    render(<OrchestrationDiagram />)
    expect(screen.getByRole('heading', { level: 3, name: 'Decisive Engine' })).toBeInTheDocument()
    for (const tag of [
      'Performance',
      'Availability',
      'Capacity',
      'Traffic share',
      'Cost',
      'Manual control',
    ]) {
      expect(screen.getByText(tag)).toBeInTheDocument()
    }
  })
})
