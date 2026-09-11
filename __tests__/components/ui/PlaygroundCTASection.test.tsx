import React from 'react'
import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { PlaygroundCTASection } from '@/components/ui/PlaygroundCTASection'

vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
      <div {...props}>{children}</div>
    ),
  },
}))

vi.mock('next/link', () => ({
  default: ({ href, children, className, onClick }: {
    href: string
    children: React.ReactNode
    className?: string
    onClick?: () => void
  }) => <a href={href} className={className} onClick={onClick}>{children}</a>,
}))

const trackCTA = vi.hoisted(() => vi.fn())
vi.mock('@/lib/analytics', () => ({ trackCTA }))

afterEach(() => {
  cleanup()
  trackCTA.mockClear()
})

const publisherProps = {
  eyebrow: 'Try the experience',
  heading: 'What does this look like inside your article?',
  body: 'Walk through one article with the Cortex widget, and watch reader signals land on the Media value ledger as they happen.',
  ctaLabel: 'Try AI Mode',
  lens: 'publisher' as const,
  trackingPosition: 'content_owners_playground',
}

describe('PlaygroundCTASection', () => {
  it('renders the eyebrow, heading and body it is given', () => {
    render(<PlaygroundCTASection {...publisherProps} />)

    expect(screen.getByText('Try the experience')).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent(
      'What does this look like inside your article?',
    )
    expect(screen.getByText(publisherProps.body)).toBeInTheDocument()
  })

  it('links to the playground with the publisher lens', () => {
    render(<PlaygroundCTASection {...publisherProps} />)

    expect(screen.getByRole('link', { name: 'Try AI Mode' }))
      .toHaveAttribute('href', '/cortex-playground/?lens=publisher')
  })

  it('links to the playground with the brand lens', () => {
    render(<PlaygroundCTASection {...publisherProps} lens="brand" />)

    expect(screen.getByRole('link', { name: 'Try AI Mode' }))
      .toHaveAttribute('href', '/cortex-playground/?lens=brand')
  })

  it('renders exactly one link', () => {
    render(<PlaygroundCTASection {...publisherProps} />)
    expect(screen.getAllByRole('link')).toHaveLength(1)
  })

  it('sits on a light section surface', () => {
    const { container } = render(<PlaygroundCTASection {...publisherProps} />)
    expect(container.firstElementChild).toHaveClass('section-white')
  })

  it('tracks the click with the label and position it is given', async () => {
    render(<PlaygroundCTASection {...publisherProps} />)

    await userEvent.click(screen.getByRole('link', { name: 'Try AI Mode' }))

    expect(trackCTA).toHaveBeenCalledWith('Try AI Mode', 'content_owners_playground')
  })

  it('renders the light tone when no tone is given', () => {
    const { container: implicit } = render(<PlaygroundCTASection {...publisherProps} />)
    const implicitHtml = implicit.innerHTML
    cleanup()

    const { container: explicit } = render(
      <PlaygroundCTASection {...publisherProps} tone="light" />,
    )

    expect(implicitHtml).toBe(explicit.innerHTML)
  })
})

describe('PlaygroundCTASection — dark tone', () => {
  const darkProps = { ...publisherProps, tone: 'dark' as const }

  it('renders no section wrapper of its own, so the host section shows through', () => {
    const { container } = render(<PlaygroundCTASection {...darkProps} />)

    const root = container.firstElementChild
    expect(root?.tagName).not.toBe('SECTION')
    expect(container.querySelector('section')).toBeNull()
    expect(root).not.toHaveClass('section-white')
    expect(container.querySelector('.section-white')).toBeNull()
    expect(container.querySelector('.section-dark')).toBeNull()
  })

  it('renders no mint gradient backdrop of its own', () => {
    const { container } = render(<PlaygroundCTASection {...darkProps} />)

    expect(container.querySelector('[aria-hidden="true"]')).toBeNull()
    expect(container.innerHTML).not.toContain('radial-gradient')
  })

  it.each([
    ['light', publisherProps],
    ['dark', darkProps],
  ])('gives the %s tone the site-wide primary pill button', (_tone, props) => {
    render(<PlaygroundCTASection {...props} />)

    const link = screen.getByRole('link', { name: 'Try AI Mode' })
    expect(link).toHaveClass('rounded-full')
    expect(link).toHaveClass('bg-primary')
    expect(link).not.toHaveClass('pill-btn')
    expect(link).not.toHaveClass('pill-btn--dark')
    expect(link).not.toHaveClass('rounded-xl')
    expect(link.getAttribute('style')).toBeNull()
  })

  it('styles the button identically in both tones', () => {
    render(<PlaygroundCTASection {...publisherProps} />)
    const lightClass = screen
      .getByRole('link', { name: 'Try AI Mode' })
      .getAttribute('class')
    cleanup()

    render(<PlaygroundCTASection {...darkProps} />)
    const darkClass = screen
      .getByRole('link', { name: 'Try AI Mode' })
      .getAttribute('class')

    expect(darkClass).toBe(lightClass)
    expect(darkClass).toBe(
      'inline-flex items-center justify-center px-6 py-3 rounded-full text-sm font-semibold text-white bg-primary transition-all hover:opacity-90',
    )
  })

  it('links and tracks exactly as the light tone does', async () => {
    const { container: light } = render(<PlaygroundCTASection {...publisherProps} lens="brand" />)
    const lightHref = light.querySelector('a')?.getAttribute('href')
    await userEvent.click(screen.getByRole('link', { name: 'Try AI Mode' }))
    const lightCalls = trackCTA.mock.calls.slice()
    cleanup()
    trackCTA.mockClear()

    render(<PlaygroundCTASection {...darkProps} lens="brand" />)
    const darkLink = screen.getByRole('link', { name: 'Try AI Mode' })
    await userEvent.click(darkLink)

    expect(darkLink).toHaveAttribute('href', '/cortex-playground/?lens=brand')
    expect(darkLink.getAttribute('href')).toBe(lightHref)
    expect(trackCTA.mock.calls).toEqual(lightCalls)
    expect(trackCTA).toHaveBeenCalledWith('Try AI Mode', 'content_owners_playground')
  })

  it('keeps the same copy and a single link', () => {
    render(<PlaygroundCTASection {...darkProps} />)

    expect(screen.getByText('Try the experience')).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent(
      'What does this look like inside your article?',
    )
    expect(screen.getByText(publisherProps.body)).toBeInTheDocument()
    expect(screen.getAllByRole('link')).toHaveLength(1)
  })
})
