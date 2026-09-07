import React from 'react'
import { render, screen } from '@testing-library/react'
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

  it('renders the Observe copy verbatim', () => {
    render(<DecisionLoop />)
    expect(
      screen.getByText(/Combine RUM and synthetic measurements across countries, regions, ISPs/)
    ).toBeInTheDocument()
  })

  it('numbers the steps 1 to 3', () => {
    render(<DecisionLoop />)
    for (const n of ['1', '2', '3']) {
      expect(screen.getByText(n)).toBeInTheDocument()
    }
  })
})
