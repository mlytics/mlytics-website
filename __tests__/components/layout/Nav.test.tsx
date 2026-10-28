import React from 'react'
import { act, fireEvent, render, screen, waitFor, within } from '@testing-library/react'
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

// Presence as reported by AnimatePresence; false = the exit fade is playing.
let mockIsPresent = true
vi.mock('framer-motion', () => ({
  AnimatePresence: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  useReducedMotion: () => false,
  useIsPresent: () => mockIsPresent,
  motion: {
    div: ({
      children,
      initial: _i,
      animate: _a,
      exit: _e,
      transition: _t,
      ...props
    }: React.HTMLAttributes<HTMLDivElement> & Record<string, unknown>) => <div {...props}>{children}</div>,
  },
}))

// Controllable matchMedia: `fireDesktop(true)` emits a change to ≥1024px.
type Listener = (e: { matches: boolean }) => void
let mqlListeners: Listener[] = []
const fireDesktop = (matches: boolean) => act(() => { mqlListeners.forEach(l => l({ matches })) })

const PRIMARY = ['bg-primary', 'text-white', 'rounded-full', 'px-4', 'py-2', 'text-sm', 'font-semibold']
// The outline look (white fill, 1px primary border, 14/600) comes from .pill-btn;
// the padding utilities size it to 36, the same height as PRIMARY.
const SECONDARY = ['pill-btn', 'px-[calc(1rem-1px)]', 'py-[calc(0.5rem-1px)]']
const AI_PATHS = ['/ai-mode-playground', '/ai-mode-playground/']

const navEl = () => document.querySelector('nav') as HTMLElement

// The desktop CTA group: the `hidden lg:flex` block holding Book a Demo inside <nav>.
const ctaGroup = () => {
  const book = within(navEl()).getByRole('link', { name: 'Book a Demo' })
  return book.parentElement as HTMLElement
}

const mobileBarLink = () => {
  const links = within(navEl()).getAllByRole('link', { name: 'Try AI Mode' })
  return links.find(l => l.parentElement?.className.includes('lg:hidden')) as HTMLElement
}

const hamburger = () => screen.getByRole('button', { name: 'Open menu', hidden: true })

const openMenu = async () => {
  await userEvent.click(hamburger())
  return screen.getByRole('dialog', { name: 'Site menu' })
}

// Reopening right after a close is ignored (double-tap guard, 250ms).
const afterReopenGuard = () => new Promise(r => setTimeout(r, 260))

const bottomGrid = (dialog: HTMLElement) =>
  within(dialog).getByRole('link', { name: 'Book a Demo' }).parentElement as HTMLElement

beforeEach(() => {
  mockPathname = '/'
  mockIsPresent = true
  vi.mocked(trackCTA).mockClear()
  mqlListeners = []
  vi.stubGlobal('matchMedia', vi.fn((query: string) => ({
    // Only the Nav's desktop query (Tailwind `lg`, 64rem = 1024px at 16px) matches, by width.
    get matches() { return query === '(min-width: 64rem)' && window.innerWidth >= 1024 },
    media: query,
    addEventListener: (_: string, l: Listener) => { mqlListeners.push(l) },
    removeEventListener: (_: string, l: Listener) => { mqlListeners = mqlListeners.filter(x => x !== l) },
    addListener: vi.fn(),
    removeListener: vi.fn(),
  })))
  document.documentElement.style.overflow = ''
  document.body.style.overflow = ''
  document.body.style.paddingRight = ''
})

afterEach(() => {
  vi.unstubAllGlobals()
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
  it('renders Book a Demo then Try AI Mode, with the right hrefs and wrapper classes', () => {
    render(<Nav />)
    const group = ctaGroup()
    expect(group).toHaveClass('hidden', 'lg:flex', 'items-center', 'gap-3')
    const links = within(group).getAllByRole('link')
    expect(links.map(l => l.textContent)).toEqual(['Book a Demo', 'Try AI Mode'])
    expect(links[0]).toHaveAttribute('href', '/book-a-demo')
    expect(links[1]).toHaveAttribute('href', '/ai-mode-playground')
  })

  it('styles Book a Demo as secondary (outline) and Try AI Mode as primary (solid)', () => {
    render(<Nav />)
    const [book, tryAi] = within(ctaGroup()).getAllByRole('link')
    expect(tryAi).toHaveClass(...PRIMARY)
    expect(tryAi).not.toHaveClass('bg-white')
    expect(book).toHaveClass(...SECONDARY)
    expect(book).not.toHaveClass('bg-primary')
  })

  it('tracks clicks with the nav position', async () => {
    render(<Nav />)
    const [book, tryAi] = within(ctaGroup()).getAllByRole('link')
    await userEvent.click(tryAi)
    expect(trackCTA).toHaveBeenLastCalledWith('Try AI Mode', 'nav')
    await userEvent.click(book)
    expect(trackCTA).toHaveBeenLastCalledWith('Book a Demo', 'nav')
  })
})

// DATAI-680: the nav is translucent white over the page; over a dark section
// the composite turns grey and text-ink-muted drops to 3.69:1. Desktop links
// use text-ink (same as the overlay links); hover and the current page stay primary.
describe('Nav desktop links', () => {
  it('uses text-ink for inactive links and primary for the current page', () => {
    mockPathname = '/brands/'
    render(<Nav />)
    const bar = screen.getByRole('navigation')
    const brands = within(bar).getByRole('link', { name: 'Brands' })
    expect(brands).toHaveClass('text-primary', 'font-semibold')
    for (const name of ['Media and Content', 'Developers', 'Partnership']) {
      const link = within(bar).getByRole('link', { name })
      expect(link).toHaveClass('text-ink', 'hover:text-primary', 'font-medium')
      expect(link).not.toHaveClass('text-ink-muted')
    }
  })
})

describe('Nav mobile bar (<1024px)', () => {
  it('shows a solid Try AI Mode link inside the lg:hidden wrapper, before the hamburger', () => {
    render(<Nav />)
    const link = mobileBarLink()
    const wrapper = link.parentElement as HTMLElement
    expect(wrapper).toHaveClass('flex', 'items-center', 'gap-2', 'lg:hidden')
    expect(wrapper).not.toHaveClass('hidden')
    expect(Array.from(wrapper.children)).toEqual([link, hamburger()])
    expect(link).toHaveAttribute('href', '/ai-mode-playground')
    expect(link).toHaveClass(...PRIMARY, 'whitespace-nowrap')
  })

  it('tracks with the nav_mobile_header position', async () => {
    render(<Nav />)
    await userEvent.click(mobileBarLink())
    expect(trackCTA).toHaveBeenLastCalledWith('Try AI Mode', 'nav_mobile_header')
  })

  it('exposes the hamburger as a dialog trigger', () => {
    render(<Nav />)
    const btn = hamburger()
    expect(btn).toHaveAttribute('aria-expanded', 'false')
    expect(btn).toHaveAttribute('aria-controls', 'mobile-menu')
    expect(btn).toHaveAttribute('aria-haspopup', 'dialog')
    expect(btn).toHaveClass('-mr-[11px]', 'p-[11px]', 'text-primary')
  })
})

describe('Nav aria-current', () => {
  it('marks every Try AI Mode as current on /ai-mode-playground (with or without trailing slash)', async () => {
    for (const p of AI_PATHS) {
      mockPathname = p
      const { unmount } = render(<Nav />)
      const [book, tryAi] = within(ctaGroup()).getAllByRole('link')
      expect(tryAi).toHaveAttribute('aria-current', 'page')
      expect(book).not.toHaveAttribute('aria-current')
      expect(mobileBarLink()).toHaveAttribute('aria-current', 'page')
      const dialog = await openMenu()
      expect(within(dialog).getByRole('link', { name: 'Try AI Mode' })).toHaveAttribute('aria-current', 'page')
      expect(within(dialog).getByRole('link', { name: 'Book a Demo' })).not.toHaveAttribute('aria-current')
      unmount()
    }
  })

  it('does not mark Try AI Mode elsewhere', async () => {
    for (const p of ['/', '/brands', '/ai-mode-playground-old', '/ai-mode']) {
      mockPathname = p
      const { unmount } = render(<Nav />)
      expect(within(ctaGroup()).getByRole('link', { name: 'Try AI Mode' })).not.toHaveAttribute('aria-current')
      expect(mobileBarLink()).not.toHaveAttribute('aria-current')
      const dialog = await openMenu()
      expect(within(dialog).getByRole('link', { name: 'Try AI Mode' })).not.toHaveAttribute('aria-current')
      unmount()
    }
  })

  it('marks the active overlay link', async () => {
    mockPathname = '/brands/'
    render(<Nav />)
    const dialog = await openMenu()
    const brands = within(dialog).getByRole('link', { name: 'Brands' })
    expect(brands).toHaveAttribute('aria-current', 'page')
    expect(brands).toHaveClass('text-primary', 'font-semibold')
    const devs = within(dialog).getByRole('link', { name: 'Developers' })
    expect(devs).not.toHaveAttribute('aria-current')
    expect(devs).toHaveClass('text-ink', 'font-medium')
  })
})

describe('Nav mobile overlay', () => {
  it('opens a full-screen modal dialog outside <nav> with header, links and bottom buttons', async () => {
    render(<Nav />)
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    const dialog = await openMenu()
    expect(dialog).toHaveAttribute('aria-modal', 'true')
    expect(dialog).toHaveAttribute('id', 'mobile-menu')
    expect(dialog).toHaveClass('lg:hidden', 'fixed', 'inset-0', 'z-[60]', 'flex', 'flex-col', 'h-dvh', 'bg-white')
    expect(navEl().contains(dialog)).toBe(false)
    expect(dialog.querySelector('nav, header')).toBeNull()
    expect(hamburger()).toHaveAttribute('aria-expanded', 'true')

    const logo = within(dialog).getByRole('link', { name: 'Mlytics' })
    expect(logo).toHaveAttribute('href', '/')
    expect(within(dialog).getByRole('button', { name: 'Close menu' })).toBeInTheDocument()

    const list = within(dialog).getByRole('list')
    const items = within(list).getAllByRole('listitem')
    expect(items).toHaveLength(4)
    items.forEach(li => expect(li).toHaveClass('border-b', 'border-line'))
    expect(within(list).getAllByRole('link').map(l => l.textContent)).toEqual([
      'Media and Content', 'Brands', 'Developers', 'Partnership',
    ])

    const grid = bottomGrid(dialog)
    expect(grid).toHaveClass('grid', 'grid-cols-2', 'gap-3')
    const ctas = within(grid).getAllByRole('link')
    expect(ctas.map(l => l.textContent)).toEqual(['Book a Demo', 'Try AI Mode'])
    expect(ctas[0]).toHaveAttribute('href', '/book-a-demo')
    expect(ctas[0]).toHaveClass('pill-btn')
    expect(ctas[0]).not.toHaveClass('h-11')
    expect(ctas[1]).toHaveAttribute('href', '/ai-mode-playground')
    expect(ctas[1]).toHaveClass('bg-primary', 'text-white', 'px-6', 'py-3', 'rounded-full')
    expect(ctas[1]).not.toHaveClass('h-11')
  })

  it('moves focus to Close menu after opening', async () => {
    render(<Nav />)
    const dialog = await openMenu()
    await waitFor(() => expect(within(dialog).getByRole('button', { name: 'Close menu' })).toHaveFocus())
  })

  it('traps Tab and Shift+Tab inside the dialog', async () => {
    render(<Nav />)
    const dialog = await openMenu()
    const close = within(dialog).getByRole('button', { name: 'Close menu' })
    const lastCta = within(bottomGrid(dialog)).getByRole('link', { name: 'Try AI Mode' })
    const logo = within(dialog).getByRole('link', { name: 'Mlytics' })
    await waitFor(() => expect(close).toHaveFocus())

    // Close is second in DOM order (after the logo), so Shift+Tab from it is
    // left to the browser; the wrap happens from the logo.
    fireEvent.keyDown(close, { key: 'Tab', shiftKey: true })
    expect(close).toHaveFocus()
    logo.focus()
    fireEvent.keyDown(logo, { key: 'Tab', shiftKey: true })
    expect(lastCta).toHaveFocus()

    fireEvent.keyDown(lastCta, { key: 'Tab' })
    expect(logo).toHaveFocus()
  })

  it('Shift+Tab from the first focusable wraps to the last', async () => {
    render(<Nav />)
    const dialog = await openMenu()
    const items = Array.from(dialog.querySelectorAll<HTMLElement>('a[href], button:not([disabled])'))
    expect(items[0]).toHaveAccessibleName('Mlytics')
    expect(items[1]).toHaveAccessibleName('Close menu')
    expect(items.at(-1)).toHaveTextContent('Try AI Mode')
    items[0].focus()
    fireEvent.keyDown(items[0], { key: 'Tab', shiftKey: true })
    expect(items.at(-1)).toHaveFocus()
  })

  it('is focusable but not tabbable, without a visible ring on the container', async () => {
    render(<Nav />)
    const dialog = await openMenu()
    expect(dialog).toHaveAttribute('tabindex', '-1')
    expect(dialog).toHaveClass('outline-none')
    // Initial focus still goes to Close, not the container.
    await waitFor(() => expect(within(dialog).getByRole('button', { name: 'Close menu' })).toHaveFocus())
  })

  it('a click on blank space focuses the dialog; Tab from there goes to the first focusable', async () => {
    render(<Nav />)
    const dialog = await openMenu()
    await waitFor(() => expect(within(dialog).getByRole('button', { name: 'Close menu' })).toHaveFocus())
    await userEvent.click(dialog)
    expect(document.activeElement).toBe(dialog)
    await userEvent.tab()
    expect(within(dialog).getByRole('link', { name: 'Mlytics' })).toHaveFocus()
  })

  it('Shift+Tab from the focused dialog container goes to the last focusable', async () => {
    render(<Nav />)
    const dialog = await openMenu()
    await waitFor(() => expect(within(dialog).getByRole('button', { name: 'Close menu' })).toHaveFocus())
    await userEvent.click(dialog)
    expect(document.activeElement).toBe(dialog)
    await userEvent.tab({ shift: true })
    expect(within(bottomGrid(dialog)).getByRole('link', { name: 'Try AI Mode' })).toHaveFocus()
  })

  it('a click on blank space keeps Escape working: closes and returns focus to the hamburger', async () => {
    render(<Nav />)
    const dialog = await openMenu()
    await waitFor(() => expect(within(dialog).getByRole('button', { name: 'Close menu' })).toHaveFocus())
    await userEvent.click(within(dialog).getByRole('list'))
    expect(document.activeElement).toBe(dialog)
    await userEvent.keyboard('{Escape}')
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(hamburger()).toHaveFocus()
  })

  it('Escape closes and returns focus to the hamburger', async () => {
    render(<Nav />)
    const dialog = await openMenu()
    const close = within(dialog).getByRole('button', { name: 'Close menu' })
    await waitFor(() => expect(close).toHaveFocus())
    fireEvent.keyDown(close, { key: 'Escape' })
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(hamburger()).toHaveFocus()
    expect(hamburger()).toHaveAttribute('aria-expanded', 'false')
  })

  it('the X button closes and returns focus to the hamburger', async () => {
    render(<Nav />)
    const dialog = await openMenu()
    await userEvent.click(within(dialog).getByRole('button', { name: 'Close menu' }))
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(hamburger()).toHaveFocus()
  })

  it('locks page scroll while open and restores the previous values', async () => {
    document.documentElement.style.overflow = 'scroll'
    document.body.style.overflow = 'auto'
    document.body.style.paddingRight = '3px'
    render(<Nav />)
    await openMenu()
    expect(document.documentElement.style.overflow).toBe('hidden')
    expect(document.body.style.overflow).toBe('hidden')
    await userEvent.click(screen.getByRole('button', { name: 'Close menu' }))
    expect(document.documentElement.style.overflow).toBe('scroll')
    expect(document.body.style.overflow).toBe('auto')
    expect(document.body.style.paddingRight).toBe('3px')
  })

  it('makes <nav>, <main> and <footer> inert while open', async () => {
    render(<><Nav /><main>page</main><footer>foot</footer></>)
    const main = document.querySelector('main')!
    const footer = document.querySelector('footer')!
    expect(navEl()).not.toHaveAttribute('inert')
    await openMenu()
    expect(navEl()).toHaveAttribute('inert')
    expect(main).toHaveAttribute('inert')
    expect(footer).toHaveAttribute('inert')
    await userEvent.click(screen.getByRole('button', { name: 'Close menu' }))
    expect(navEl()).not.toHaveAttribute('inert')
    expect(main).not.toHaveAttribute('inert')
    expect(footer).not.toHaveAttribute('inert')
  })

  it('closes when a link is clicked', async () => {
    render(<Nav />)
    const dialog = await openMenu()
    await userEvent.click(within(dialog).getByRole('link', { name: 'Developers' }))
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    await afterReopenGuard()
    const again = await openMenu()
    await userEvent.click(within(again).getByRole('link', { name: 'Mlytics' }))
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(trackCTA).not.toHaveBeenCalled()
  })

  it('bottom CTAs track nav_mobile and close the menu', async () => {
    render(<Nav />)
    let dialog = await openMenu()
    await userEvent.click(within(bottomGrid(dialog)).getByRole('link', { name: 'Try AI Mode' }))
    expect(trackCTA).toHaveBeenLastCalledWith('Try AI Mode', 'nav_mobile')
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()

    await afterReopenGuard()
    dialog = await openMenu()
    await userEvent.click(within(bottomGrid(dialog)).getByRole('link', { name: 'Book a Demo' }))
    expect(trackCTA).toHaveBeenLastCalledWith('Book a Demo', 'nav_mobile')
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('closes on route change', async () => {
    const { rerender } = render(<Nav />)
    await openMenu()
    mockPathname = '/brands/'
    rerender(<Nav />)
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(document.documentElement.style.overflow).toBe('')
    // Going back to the original path does not resurrect it.
    mockPathname = '/'
    rerender(<Nav />)
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('ignores a reopen within 250ms of closing (double-tap on X), then opens normally', () => {
    vi.useFakeTimers()
    try {
      render(<Nav />)
      fireEvent.click(hamburger())
      expect(screen.getByRole('dialog')).toBeInTheDocument()
      fireEvent.click(screen.getByRole('button', { name: 'Close menu' }))
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
      // Second tap of the double-tap lands on the hamburger immediately.
      fireEvent.click(hamburger())
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
      act(() => { vi.advanceTimersByTime(200) })
      fireEvent.click(hamburger())
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
      act(() => { vi.advanceTimersByTime(100) })
      fireEvent.click(hamburger())
      expect(screen.getByRole('dialog')).toBeInTheDocument()
    } finally {
      vi.useRealTimers()
    }
  })

  it('creates the desktop MediaQueryList once for the scroll/resize handlers', () => {
    render(<Nav />)
    const calls = vi.mocked(window.matchMedia).mock.calls.length
    for (let i = 0; i < 5; i++) {
      window.dispatchEvent(new Event('scroll'))
      window.dispatchEvent(new Event('resize'))
    }
    expect(vi.mocked(window.matchMedia).mock.calls.length).toBe(calls)
  })

  it('is interactive and announced while present', async () => {
    render(<Nav />)
    const dialog = await openMenu()
    expect(dialog).not.toHaveAttribute('inert')
    expect(dialog).not.toHaveAttribute('aria-hidden')
    expect(dialog).not.toHaveClass('pointer-events-none')
  })

  it('is inert, hidden from assistive tech and unclickable while its exit fade plays', async () => {
    mockIsPresent = false
    render(<Nav />)
    await userEvent.click(hamburger())
    const dialog = document.getElementById('mobile-menu') as HTMLElement
    expect(dialog).toHaveAttribute('inert')
    expect(dialog).toHaveAttribute('aria-hidden', 'true')
    expect(dialog).toHaveClass('pointer-events-none')
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('listens to the Tailwind lg query in rem', async () => {
    render(<Nav />)
    await openMenu()
    expect(window.matchMedia).toHaveBeenCalledWith('(min-width: 64rem)')
    expect(window.matchMedia).not.toHaveBeenCalledWith('(min-width: 1024px)')
  })

  it('closes when the viewport grows to ≥1024px, without moving focus to the hamburger', async () => {
    render(<Nav />)
    const dialog = await openMenu()
    await waitFor(() => expect(within(dialog).getByRole('button', { name: 'Close menu' })).toHaveFocus())
    fireDesktop(false)
    expect(screen.getByRole('dialog')).toBeInTheDocument()
    fireDesktop(true)
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(hamburger()).not.toHaveFocus()
    expect(mqlListeners).toHaveLength(0)
  })
})

describe('Nav scroll visibility', () => {
  const setWidth = (w: number) => { Object.defineProperty(window, 'innerWidth', { configurable: true, value: w }) }
  const scrollTo = (y: number) => act(() => {
    Object.defineProperty(window, 'scrollY', { configurable: true, value: y })
    window.dispatchEvent(new Event('scroll'))
  })
  let originalWidth: number

  beforeEach(() => { originalWidth = window.innerWidth })
  afterEach(() => { setWidth(originalWidth); Object.defineProperty(window, 'scrollY', { configurable: true, value: 0 }) })

  it('hides on scroll down at desktop width', () => {
    setWidth(1280)
    render(<Nav />)
    scrollTo(300)
    expect(navEl().style.transform).toBe('translateY(-100%)')
  })

  it('shows the bar again after narrowing below 1024px (resize)', () => {
    setWidth(1280)
    render(<Nav />)
    scrollTo(300)
    expect(navEl().style.transform).toBe('translateY(-100%)')
    setWidth(800)
    act(() => { window.dispatchEvent(new Event('resize')) })
    expect(navEl().style.transform).toBe('translateY(0)')
  })

  it('decides desktop by the matchMedia query, not innerWidth', () => {
    // Width says desktop but the rem query does not match (e.g. a larger
    // default font size): the bar must stay shown.
    setWidth(1280)
    vi.stubGlobal('matchMedia', vi.fn((query: string) => ({
      matches: false, media: query, addEventListener: vi.fn(), removeEventListener: vi.fn(),
    })))
    render(<Nav />)
    scrollTo(300)
    expect(navEl().style.transform).toBe('translateY(0)')
  })

  it('shows the bar again on the next scroll below 1024px', () => {
    setWidth(1280)
    render(<Nav />)
    scrollTo(300)
    expect(navEl().style.transform).toBe('translateY(-100%)')
    setWidth(375)
    scrollTo(600)
    expect(navEl().style.transform).toBe('translateY(0)')
  })
})
