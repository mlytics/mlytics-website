import React from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { IdentityCards } from '@/components/home/IdentityCards'

vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
      <div {...props}>{children}</div>
    ),
  },
}))

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

function stubWidth(width: number) {
  vi.stubGlobal('matchMedia', vi.fn((query: string) => {
    const m = /min-width:\s*([\d.]+)rem/.exec(query)
    const min = m ? parseFloat(m[1]) * 16 : 0
    return { matches: width >= min, media: query, onchange: null,
      addEventListener: vi.fn(), removeEventListener: vi.fn(),
      addListener: vi.fn(), removeListener: vi.fn(), dispatchEvent: vi.fn() }
  }))
}

describe('tracking (DATAI-628, DECISIONS #53)', () => {
  const FULL = [
    ['See media and content plan', 'home_identity_content_owners'],
    ['See brand plan', 'home_identity_brands'],
    ['See developer plan', 'home_identity_developers'],
  ] as const

  it.each([375, 1280])('records the full on-screen label at %ipx', async (w) => {
    stubWidth(w)
    render(<IdentityCards />)
    const links = screen.getAllByRole('link')
    for (let i = 0; i < 3; i++) await userEvent.click(links[i])
    expect(trackCTA.mock.calls).toEqual(FULL.map(([l, p]) => [l, p]))
  })

  it.each([768, 1023])('records "Learn more" with the card position at %ipx', async (w) => {
    stubWidth(w)
    render(<IdentityCards />)
    const links = screen.getAllByRole('link')
    for (let i = 0; i < 3; i++) await userEvent.click(links[i])
    expect(trackCTA.mock.calls).toEqual(FULL.map(([, p]) => ['Learn more', p]))
  })
})
