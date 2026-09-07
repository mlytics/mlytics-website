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
    const cta = screen.getByRole('link', { name: 'Explore More Multi-CDN' })
    expect(cta).toHaveAttribute('href', '/decisive-engine')
    // Visible label is the anchor's own leading text node, not the sr-only
    // suffix. It carries one trailing space (invisible to sighted users,
    // rendered as ordinary trailing whitespace) so the accessible-name
    // computation joins it to the hidden suffix with a real separator —
    // trim before comparing so the assertion still reads as "Explore More".
    expect(cta.firstChild?.textContent?.trim()).toBe('Explore More')
  })

  it('gives the primary CTA an accessible name that contains its visible label (WCAG 2.5.3)', () => {
    render(<NotFoundContent />)
    // Capture the actual runtime-computed accessible name via Testing
    // Library's own accname implementation (the matcher callback receives
    // it directly), rather than asserting against a hardcoded literal —
    // so a regression that changes the computed name still gets caught.
    let capturedName = ''
    const cta = screen.getByRole('link', {
      name: (accessibleName) => {
        if (accessibleName.startsWith('Explore More')) {
          capturedName = accessibleName
          return true
        }
        return false
      },
    })
    const visibleLabel = cta.firstChild?.textContent?.trim() ?? ''
    expect(visibleLabel).toBe('Explore More')
    expect(capturedName).toBe('Explore More Multi-CDN')
    expect(capturedName).toContain(visibleLabel)
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
