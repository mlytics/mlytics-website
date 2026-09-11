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

const mediaProps = {
  eyebrow: 'Try the experience',
  heading: 'What does this look like inside your article?',
  body: 'Walk through one article with the Cortex widget, and watch reader signals land on the Media value ledger as they happen.',
  ctaLabel: 'Try AI Mode',
  lens: 'media' as const,
  trackingPosition: 'content_owners_playground',
}

describe('PlaygroundCTASection', () => {
  it('renders the eyebrow, heading and body it is given', () => {
    render(<PlaygroundCTASection {...mediaProps} />)

    expect(screen.getByText('Try the experience')).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent(
      'What does this look like inside your article?',
    )
    expect(screen.getByText(mediaProps.body)).toBeInTheDocument()
  })

  it('links to the playground with the media lens', () => {
    render(<PlaygroundCTASection {...mediaProps} />)

    expect(screen.getByRole('link', { name: 'Try AI Mode' }))
      .toHaveAttribute('href', '/ai-mode-playground/?lens=media')
  })

  it('links to the playground with the brand lens', () => {
    render(<PlaygroundCTASection {...mediaProps} lens="brand" />)

    expect(screen.getByRole('link', { name: 'Try AI Mode' }))
      .toHaveAttribute('href', '/ai-mode-playground/?lens=brand')
  })

  it('renders exactly one link', () => {
    render(<PlaygroundCTASection {...mediaProps} />)
    expect(screen.getAllByRole('link')).toHaveLength(1)
  })

  it('sits on a light section surface', () => {
    const { container } = render(<PlaygroundCTASection {...mediaProps} />)
    expect(container.firstElementChild).toHaveClass('section-white')
  })

  it('tracks the click with the label and position it is given', async () => {
    render(<PlaygroundCTASection {...mediaProps} />)

    await userEvent.click(screen.getByRole('link', { name: 'Try AI Mode' }))

    expect(trackCTA).toHaveBeenCalledWith('Try AI Mode', 'content_owners_playground')
  })

  it('defaults to the standalone variant when none is given', () => {
    const { container } = render(<PlaygroundCTASection {...mediaProps} />)

    const root = container.firstElementChild
    expect(root?.tagName).toBe('SECTION')
    expect(root).toHaveClass('section-white')
  })
})

describe('PlaygroundCTASection — embedded variant', () => {
  const embeddedProps = { ...mediaProps, variant: 'embedded' as const }

  it('renders no section wrapper of its own, so the host section shows through', () => {
    const { container } = render(<PlaygroundCTASection {...embeddedProps} />)

    const root = container.firstElementChild
    expect(root?.tagName).not.toBe('SECTION')
    expect(container.querySelector('section')).toBeNull()
    expect(root).not.toHaveClass('section-white')
    expect(container.querySelector('.section-white')).toBeNull()
    expect(container.querySelector('.section-dark')).toBeNull()
  })

  it('renders no mint gradient backdrop of its own', () => {
    const { container } = render(<PlaygroundCTASection {...embeddedProps} />)

    expect(container.querySelector('[aria-hidden="true"]')).toBeNull()
    expect(container.innerHTML).not.toContain('radial-gradient')
  })

  it.each([
    ['standalone', mediaProps],
    ['embedded', embeddedProps],
  ])('gives the %s variant the site-wide primary pill button', (_variant, props) => {
    render(<PlaygroundCTASection {...props} />)

    const link = screen.getByRole('link', { name: 'Try AI Mode' })
    expect(link).toHaveClass('rounded-full')
    expect(link).toHaveClass('bg-primary')
    expect(link).not.toHaveClass('pill-btn')
    expect(link).not.toHaveClass('pill-btn--dark')
    expect(link).not.toHaveClass('rounded-xl')
    expect(link.getAttribute('style')).toBeNull()
  })

  it('styles the button identically in both variants', () => {
    render(<PlaygroundCTASection {...mediaProps} />)
    const standaloneClass = screen
      .getByRole('link', { name: 'Try AI Mode' })
      .getAttribute('class')
    cleanup()

    render(<PlaygroundCTASection {...embeddedProps} />)
    const embeddedClass = screen
      .getByRole('link', { name: 'Try AI Mode' })
      .getAttribute('class')

    expect(embeddedClass).toBe(standaloneClass)
  })

  it('links and tracks exactly as the standalone variant does', async () => {
    const { container: light } = render(<PlaygroundCTASection {...mediaProps} lens="brand" />)
    const lightHref = light.querySelector('a')?.getAttribute('href')
    await userEvent.click(screen.getByRole('link', { name: 'Try AI Mode' }))
    const lightCalls = trackCTA.mock.calls.slice()
    cleanup()
    trackCTA.mockClear()

    render(<PlaygroundCTASection {...embeddedProps} lens="brand" />)
    const embeddedLink = screen.getByRole('link', { name: 'Try AI Mode' })
    await userEvent.click(embeddedLink)

    expect(embeddedLink).toHaveAttribute('href', '/ai-mode-playground/?lens=brand')
    expect(embeddedLink.getAttribute('href')).toBe(lightHref)
    expect(trackCTA.mock.calls).toEqual(lightCalls)
    expect(trackCTA).toHaveBeenCalledWith('Try AI Mode', 'content_owners_playground')
  })

  it('keeps the same copy and a single link', () => {
    render(<PlaygroundCTASection {...embeddedProps} />)

    expect(screen.getByText('Try the experience')).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent(
      'What does this look like inside your article?',
    )
    expect(screen.getByText(mediaProps.body)).toBeInTheDocument()
    expect(screen.getAllByRole('link')).toHaveLength(1)
  })
})

describe('PlaygroundCTASection — text colour per variant', () => {
  const embeddedProps = { ...mediaProps, variant: 'embedded' as const }

  it('gives the standalone heading dark ink, never white', () => {
    render(<PlaygroundCTASection {...mediaProps} />)

    const heading = screen.getByRole('heading', { level: 2 })
    expect(heading).toHaveClass('text-ink')
    expect(heading).not.toHaveClass('text-white')
  })

  it('gives the embedded heading white, never dark ink', () => {
    render(<PlaygroundCTASection {...embeddedProps} />)

    const heading = screen.getByRole('heading', { level: 2 })
    expect(heading).toHaveClass('text-white')
    expect(heading).not.toHaveClass('text-ink')
  })

  it('gives the standalone body muted ink, never on-dark text', () => {
    render(<PlaygroundCTASection {...mediaProps} />)

    const body = screen.getByText(mediaProps.body)
    expect(body).toHaveClass('text-ink-muted')
    expect(body).not.toHaveClass('text-on-dark')
  })

  it('gives the embedded body on-dark text, never muted ink', () => {
    render(<PlaygroundCTASection {...embeddedProps} />)

    const body = screen.getByText(mediaProps.body)
    expect(body).toHaveClass('text-on-dark')
    expect(body).not.toHaveClass('text-ink-muted')
  })

  it('dims the embedded eyebrow against the dark ground', () => {
    render(<PlaygroundCTASection {...embeddedProps} />)

    expect(screen.getByText('Try the experience')).toHaveClass('text-on-dark/55')
  })
})
