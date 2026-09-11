import React from 'react'
import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import PublishersPage from '@/app/content-owners/page'

vi.mock('framer-motion', () => ({
  AnimatePresence: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  useInView: () => true,
  motion: {
    div: ({ children, ...props }: React.HTMLAttributes<HTMLDivElement>) => <div {...props}>{children}</div>,
    article: ({ children, ...props }: React.HTMLAttributes<HTMLElement>) => <article {...props}>{children}</article>,
    p: ({ children, ...props }: React.HTMLAttributes<HTMLParagraphElement>) => <p {...props}>{children}</p>,
    span: ({ children, ...props }: React.HTMLAttributes<HTMLSpanElement>) => <span {...props}>{children}</span>,
    h3: ({ children, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => <h3 {...props}>{children}</h3>,
    rect: (props: React.ComponentProps<'rect'>) => <rect {...props} />,
    circle: (props: React.ComponentProps<'circle'>) => <circle {...props} />,
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

afterEach(cleanup)

describe('PublishersPage playground entry point', () => {
  it('renders the playground entry-point copy verbatim', () => {
    render(<PublishersPage />)

    expect(screen.getByRole('heading', {
      level: 2,
      name: 'What does this look like inside your article?',
    })).toBeInTheDocument()
    expect(screen.getByText(
      'Walk through one article with the Cortex widget, and watch reader signals land on the Media value ledger as they happen.',
    )).toBeInTheDocument()
  })

  it('links to the playground with the publisher lens', () => {
    render(<PublishersPage />)

    expect(screen.getByRole('link', { name: 'Try AI Mode' }))
      .toHaveAttribute('href', '/cortex-playground/?lens=publisher')
  })

  it('places the entry point after The Solution and before AI Infrastructure', () => {
    render(<PublishersPage />)

    const headings = screen.getAllByRole('heading', { level: 2 }).map((h) => h.textContent?.trim())
    const solution = headings.indexOf('Who gets paid when AI uses your content?')
    const entry = headings.indexOf('What does this look like inside your article?')
    const infrastructure = headings.indexOf(
      "How should a publisher's content be structured for AI retrieval and citation?",
    )

    expect(solution).toBeGreaterThanOrEqual(0)
    expect(infrastructure).toBeGreaterThanOrEqual(0)
    expect(entry).toBeGreaterThan(solution)
    expect(entry).toBeLessThan(infrastructure)
  })

  it('leaves the bottom email CTA as the only other conversion surface', () => {
    render(<PublishersPage />)

    expect(screen.getByRole('heading', {
      level: 2,
      name: "Want to see your site's real intent data?",
    })).toBeInTheDocument()
  })
})
