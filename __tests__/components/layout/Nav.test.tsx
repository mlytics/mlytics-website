import React from 'react'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Nav } from '@/components/layout/Nav'
import { trackCTA } from '@/lib/analytics'

vi.mock('@/lib/analytics', () => ({ trackCTA: vi.fn() }))

let mockPathname = '/'
vi.mock('next/navigation', () => ({
  usePathname: () => mockPathname,
}))

vi.mock('next/link', () => ({
  default: ({
    href,
    children,
    ...rest
  }: { href: string; children: React.ReactNode } & React.AnchorHTMLAttributes<HTMLAnchorElement>) => (
    <a href={href} {...rest}>{children}</a>
  ),
}))

vi.mock('framer-motion', () => ({
  AnimatePresence: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  motion: {
    div: ({
      children,
      initial: _i,
      animate: _a,
      exit: _e,
      ...props
    }: React.HTMLAttributes<HTMLDivElement> & Record<string, unknown>) => <div {...props}>{children}</div>,
  },
}))

const PRIMARY = ['bg-primary', 'text-white', 'rounded-full', 'px-4', 'py-2', 'text-sm', 'font-semibold']
const SECONDARY = ['bg-white', 'text-primary', 'border-primary', 'border', 'rounded-full', 'text-sm', 'font-semibold']

const ctaGroup = () => {
  // The desktop CTA group is the only `hidden lg:flex` block that contains Book a Demo.
  const book = screen.getAllByRole('link', { name: 'Book a Demo' })[0]
  return book.parentElement as HTMLElement
}

const openMenu = async () => {
  await userEvent.click(screen.getByRole('button', { name: 'Open menu' }))
  // The mobile menu renders after the desktop group, so the last of each is the mobile one.
}

beforeEach(() => {
  mockPathname = '/'
  vi.mocked(trackCTA).mockClear()
})

describe('Nav center links', () => {
  it('no longer includes an "AI Mode" link', () => {
    render(<Nav />)
    expect(screen.queryByRole('link', { name: 'AI Mode' })).not.toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Media and Content' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Partnership' })).toBeInTheDocument()
  })
})

describe('Nav desktop CTA group', () => {
  it('renders Try AI Mode then Book a Demo, with the right hrefs', () => {
    render(<Nav />)
    const group = ctaGroup()
    expect(group.className).toContain('hidden')
    expect(group.className).toContain('lg:flex')
    expect(group.className).toContain('gap-3')
    const links = within(group).getAllByRole('link')
    expect(links.map(l => l.textContent)).toEqual(['Try AI Mode', 'Book a Demo'])
    expect(links[0]).toHaveAttribute('href', '/ai-mode-playground')
    expect(links[1]).toHaveAttribute('href', '/book-a-demo')
  })

  it('styles Try AI Mode as primary and Book a Demo as secondary', () => {
    render(<Nav />)
    const [tryAi, book] = within(ctaGroup()).getAllByRole('link')
    expect(tryAi).toHaveClass(...PRIMARY)
    expect(tryAi).not.toHaveClass('bg-white')
    expect(book).toHaveClass(...SECONDARY)
    expect(book).not.toHaveClass('bg-primary')
  })

  it('tracks clicks with the nav position', async () => {
    render(<Nav />)
    const [tryAi, book] = within(ctaGroup()).getAllByRole('link')
    await userEvent.click(tryAi)
    expect(trackCTA).toHaveBeenLastCalledWith('Try AI Mode', 'nav')
    await userEvent.click(book)
    expect(trackCTA).toHaveBeenLastCalledWith('Book a Demo', 'nav')
  })
})

describe('Nav aria-current', () => {
  it('marks Try AI Mode as the current page on /ai-mode-playground (with or without trailing slash)', async () => {
    for (const p of ['/ai-mode-playground', '/ai-mode-playground/']) {
      mockPathname = p
      const { unmount } = render(<Nav />)
      const [tryAi, book] = within(ctaGroup()).getAllByRole('link')
      expect(tryAi).toHaveAttribute('aria-current', 'page')
      expect(book).not.toHaveAttribute('aria-current')
      await openMenu()
      const mobileTry = screen.getAllByRole('link', { name: 'Try AI Mode' }).at(-1)!
      expect(mobileTry).toHaveAttribute('aria-current', 'page')
      unmount()
    }
  })

  it('does not mark Try AI Mode elsewhere', () => {
    mockPathname = '/brands'
    render(<Nav />)
    const [tryAi] = within(ctaGroup()).getAllByRole('link')
    expect(tryAi).not.toHaveAttribute('aria-current')
  })
})

describe('Nav mobile menu', () => {
  it('stacks Try AI Mode (solid) above Book a Demo (outline), both full width, after the links', async () => {
    render(<Nav />)
    await openMenu()
    const tryAi = screen.getAllByRole('link', { name: 'Try AI Mode' }).at(-1)!
    const book = screen.getAllByRole('link', { name: 'Book a Demo' }).at(-1)!
    const container = tryAi.parentElement as HTMLElement
    expect(book.parentElement).toBe(container)
    const items = within(container).getAllByRole('link').map(l => l.textContent)
    expect(items).toEqual([
      'Media and Content', 'Brands', 'Developers', 'Partnership', 'Try AI Mode', 'Book a Demo',
    ])
    expect(tryAi).toHaveAttribute('href', '/ai-mode-playground')
    expect(book).toHaveAttribute('href', '/book-a-demo')
    for (const el of [tryAi, book]) expect(el).toHaveClass('block', 'w-full', 'mt-2', 'rounded-full')
    expect(tryAi).toHaveClass('bg-primary', 'text-white', 'py-2.5')
    expect(book).toHaveClass('bg-white', 'text-primary', 'border-primary', 'border')
  })

  it('tracks with nav_mobile and closes the menu on click', async () => {
    render(<Nav />)
    await openMenu()
    await userEvent.click(screen.getAllByRole('link', { name: 'Try AI Mode' }).at(-1)!)
    expect(trackCTA).toHaveBeenLastCalledWith('Try AI Mode', 'nav_mobile')
    expect(screen.getByRole('button', { name: 'Open menu' })).toBeInTheDocument()

    await openMenu()
    await userEvent.click(screen.getAllByRole('link', { name: 'Book a Demo' }).at(-1)!)
    expect(trackCTA).toHaveBeenLastCalledWith('Book a Demo', 'nav_mobile')
    expect(screen.getByRole('button', { name: 'Open menu' })).toBeInTheDocument()
  })
})
