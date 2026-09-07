import React from 'react'
import { render, screen } from '@testing-library/react'
import { CdnQualityCard } from '@/components/pages/decisive-engine/CdnQualityCard'

describe('CdnQualityCard', () => {
  it('renders the card heading', () => {
    render(<CdnQualityCard />)
    expect(screen.getByRole('heading', { level: 3 })).toHaveTextContent('Regional CDN Quality')
  })

  it('renders all three CDN rows with scores', () => {
    render(<CdnQualityCard />)
    expect(screen.getByText('CDN Alpha')).toBeInTheDocument()
    expect(screen.getByText('88')).toBeInTheDocument()
    expect(screen.getByText('CDN Beta')).toBeInTheDocument()
    expect(screen.getByText('73')).toBeInTheDocument()
    expect(screen.getByText('CDN Gamma')).toBeInTheDocument()
    expect(screen.getByText('62')).toBeInTheDocument()
  })

  it('renders the selected route line', () => {
    render(<CdnQualityCard />)
    expect(screen.getByText('Selected route: CDN Alpha')).toBeInTheDocument()
    expect(screen.getByText('Healthy')).toBeInTheDocument()
  })

  it('is labelled as illustrative for assistive technology', () => {
    render(<CdnQualityCard />)
    expect(screen.getByLabelText('Illustrative CDN quality view')).toBeInTheDocument()
  })
})
