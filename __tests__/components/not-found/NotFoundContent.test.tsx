import React from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import NotFoundContent from '@/components/not-found/NotFoundContent'
import NotFound, { metadata } from '@/app/not-found'

vi.mock('next/link', () => ({
  default: ({ href, children, className, onClick, ...rest }: {
    href: string
    children: React.ReactNode
    className?: string
    onClick?: React.MouseEventHandler<HTMLAnchorElement>
  }) => (
    <a href={href} className={className} {...rest}
      onClick={(e) => { e.preventDefault(); onClick?.(e) }}>
      {children}
    </a>
  ),
}))

const trackCTA = vi.hoisted(() => vi.fn())
vi.mock('@/lib/analytics', () => ({ trackCTA }))
afterEach(() => { trackCTA.mockClear(); vi.unstubAllGlobals() })

// Release branch (DATAI-681): the CDN-specific 404 (#41) is switched off, so
// only the generic variant ships.
describe('NotFoundContent — generic variant only', () => {
  it('renders the generic 404 copy', () => {
    render(<NotFoundContent />)
    expect(screen.getByText('404')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Page not found' })).toBeInTheDocument()
    expect(
      screen.getByText("The page you're looking for doesn't exist or has been moved.")
    ).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Back to Home' })).toHaveAttribute('href', '/')
  })

  it('does not render the CDN variant', () => {
    render(<NotFoundContent />)
    expect(screen.queryByText('Looking for Multi-CDN?')).toBeNull()
    expect(document.querySelector('.nf-cdn')).toBeNull()
    expect(document.querySelector('a[href="/decisive-engine"]')).toBeNull()
    expect(screen.getAllByRole('link')).toHaveLength(1)
  })

  it('clicking Back to Home records Back to Home at not_found', async () => {
    render(<NotFoundContent />)
    await userEvent.click(screen.getByRole('link', { name: 'Back to Home' }))
    expect(trackCTA).toHaveBeenCalledTimes(1)
    expect(trackCTA).toHaveBeenCalledWith('Back to Home', 'not_found')
  })
})

describe('app/not-found page', () => {
  it('keeps the page title', () => {
    expect(metadata).toEqual({ title: '404 — Page Not Found' })
  })

  it('does not inject the variant script', () => {
    const { container } = render(<NotFound />)
    expect(container.querySelector('script')).toBeNull()
    expect(screen.getByRole('heading', { name: 'Page not found' })).toBeInTheDocument()
  })
})
