import React from 'react'
import { render, screen } from '@testing-library/react'
import NotFoundContent from '@/components/not-found/NotFoundContent'

vi.mock('next/link', () => ({
  default: ({
    href,
    children,
    className,
    ...rest
  }: {
    href: string
    children: React.ReactNode
    className?: string
  }) => (
    <a href={href} className={className} {...rest}>
      {children}
    </a>
  ),
}))

describe('NotFoundContent — CDN variant', () => {
  it('points the primary CTA at the Decisive Engine page', () => {
    render(<NotFoundContent />)
    const cta = screen.getByRole('link', { name: 'Explore Multi-CDN' })
    expect(cta).toHaveAttribute('href', '/decisive-engine')
    expect(cta).toHaveTextContent('Explore More')
  })

  it('keeps Contact Us as the secondary CTA', () => {
    render(<NotFoundContent />)
    expect(screen.getByRole('link', { name: 'Contact Us' })).toHaveAttribute(
      'href',
      '/book-a-demo'
    )
  })

  it('keeps Back to Home in the default variant only', () => {
    render(<NotFoundContent />)
    const cdn = document.querySelector('.nf-cdn') as HTMLElement
    const fallback = document.querySelector('.nf-default') as HTMLElement
    expect(cdn.querySelector('a[href="/"]')).toBeNull()
    expect(fallback.querySelector('a[href="/"]')).not.toBeNull()
  })

  it('leaves the CDN variant copy unchanged', () => {
    render(<NotFoundContent />)
    expect(
      screen.getByText('This page has moved, but our Multi-CDN service is still available.')
    ).toBeInTheDocument()
  })

  it('leaves the default variant untouched', () => {
    render(<NotFoundContent />)
    expect(screen.getByText('404')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Page not found' })).toBeInTheDocument()
    expect(
      screen.getByText("The page you're looking for doesn't exist or has been moved.")
    ).toBeInTheDocument()
    const fallback = document.querySelector('.nf-default') as HTMLElement
    const homeLink = fallback.querySelector('a[href="/"]')
    expect(homeLink).not.toBeNull()
    expect(homeLink).toHaveTextContent('Back to Home')
  })
})
