import React from 'react'
import { render, screen } from '@testing-library/react'
import { IdentityCards } from '@/components/home/IdentityCards'

vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
      <div {...props}>{children}</div>
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

describe('IdentityCards', () => {
  describe('structure', () => {
    it('renders exactly 3 CTA links', () => {
      render(<IdentityCards />)
      expect(screen.getAllByRole('link')).toHaveLength(3)
    })
  })

  describe('headings', () => {
    it('renders the eyebrow text', () => {
      render(<IdentityCards />)
      expect(screen.getByText('Who are you?')).toBeInTheDocument()
    })

    it('renders the h2 heading', () => {
      render(<IdentityCards />)
      expect(
        screen.getByRole('heading', {
          level: 2,
          name: /What does Mlytics Cortex offer brands, media and content owners, and developers/,
        })
      ).toBeInTheDocument()
    })
  })

  describe('card content', () => {
    it('renders all persona names', () => {
      render(<IdentityCards />)
      expect(screen.getByText('Media and Content Owner')).toBeInTheDocument()
      expect(screen.getByText('Brand')).toBeInTheDocument()
      expect(screen.getByText('Developer')).toBeInTheDocument()
    })

    it('renders all hook texts', () => {
      render(<IdentityCards />)
      expect(
        screen.getByText(/85% of searches end without a click/)
      ).toBeInTheDocument()
      expect(
        screen.getByText(/60%\+ of buyers get answers from AI/)
      ).toBeInTheDocument()
      expect(
        screen.getByText(/Fragmented CDN contracts/)
      ).toBeInTheDocument()
    })

    it('renders CTA links with correct hrefs', () => {
      render(<IdentityCards />)
      expect(
        screen.getByRole('link', { name: /See media and content plan/ })
      ).toHaveAttribute('href', '/content-owners')
      expect(
        screen.getByRole('link', { name: /See brand plan/ })
      ).toHaveAttribute('href', '/brands')
      expect(
        screen.getByRole('link', { name: /See developer plan/ })
      ).toHaveAttribute('href', '/developers')
    })
  })

  describe('accessibility', () => {
    it('has exactly one h2 heading', () => {
      render(<IdentityCards />)
      expect(screen.getAllByRole('heading', { level: 2 })).toHaveLength(1)
    })

    it('all 3 links have accessible names', () => {
      render(<IdentityCards />)
      const links = screen.getAllByRole('link')
      expect(links).toHaveLength(3)
      links.forEach((link) => {
        expect(link).toHaveAccessibleName()
      })
    })
  })

  describe('snapshot', () => {
    it('matches snapshot', () => {
      const { container } = render(<IdentityCards />)
      expect(container).toMatchSnapshot()
    })
  })
})
