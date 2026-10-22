'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import type { KeyboardEvent as ReactKeyboardEvent, ReactNode } from 'react'
import Link from 'next/link'

import { usePathname } from 'next/navigation'
import { motion, AnimatePresence, useIsPresent, useReducedMotion } from 'framer-motion'
import { Menu, X } from 'lucide-react'
import { trackCTA } from '@/lib/analytics'

const NAV_LINKS = [
  { label: 'Media and Content', href: '/content-owners' },
  { label: 'Brands', href: '/brands' },
  { label: 'Developers', href: '/developers' },
  { label: 'Partnership', href: '/partnership' },
]

const AI_MODE_HREF = '/ai-mode-playground'

// Analytics position for the solid Try AI Mode button in the <1024px nav bar.
const MOBILE_BAR_POSITION = 'nav_mobile_header'

// Tailwind v4's `lg` breakpoint (64rem): the desktop nav takes over from here.
// Written in rem, as Tailwind does, so it agrees with the `lg:` classes even
// when the browser's default font size is larger than 16px.
const DESKTOP_QUERY = '(min-width: 64rem)'

const FOCUS_RING = 'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary'

// Primary: the 36px solid pill (DESIGN.md §3.2, nav only).
const PRIMARY_BTN = 'px-4 py-2 rounded-full text-sm font-semibold text-white transition-opacity hover:opacity-90 bg-primary'

// Secondary: the site's one outline-button definition, `.pill-btn`
// (app/site-base.css, DESIGN.md §3.4). It lives in the components layer, so
// these padding utilities override its 44px padding and size it to 36, the
// same height as PRIMARY_BTN; the padding subtracts its 1px border.
const SECONDARY_BTN = 'pill-btn px-[calc(1rem-1px)] py-[calc(0.5rem-1px)]'

// Bottom pair in the mobile overlay (equal-width cells of a 2-column grid):
// the 44px outline `.pill-btn` and the §3.2 standard 44 solid pill.
const OVERLAY_SOLID_BTN =
  'inline-flex items-center justify-center px-6 py-3 rounded-full text-sm font-semibold text-white bg-primary transition-opacity hover:opacity-90 whitespace-nowrap'

const FOCUSABLE = 'a[href], button:not([disabled])'

// A tap on the hamburger this soon after closing is the second tap of a
// double-tap on X (the fading dialog no longer catches clicks), so it is
// ignored rather than reopening the menu.
const REOPEN_GUARD_MS = 250

// Exposes AnimatePresence's presence to a render prop, so the menu can turn
// itself inert while its exit fade plays.
function PresenceGate({ children }: { children: (present: boolean) => ReactNode }) {
  const present = useIsPresent()
  return <>{children(present)}</>
}

export function Nav() {
  const pathname = usePathname()
  const reduceMotion = useReducedMotion()
  const [scrolled, setScrolled] = useState(false)
  const [visible, setVisible] = useState(true)
  // The menu is "open for a path": navigating anywhere else closes it without
  // an effect, because `mobileOpen` stops matching the new pathname.
  const [menuPath, setMenuPath] = useState<string | null>(null)
  const [seenPath, setSeenPath] = useState(pathname)
  if (seenPath !== pathname) {
    // Forget the stale path too, so navigating back to it (browser Back)
    // does not reopen the menu.
    setSeenPath(pathname)
    if (menuPath !== null) setMenuPath(null)
  }
  const mobileOpen = menuPath === pathname
  const lastScrollY = useRef(0)
  const navRef = useRef<HTMLElement>(null)
  const menuButtonRef = useRef<HTMLButtonElement>(null)
  const dialogRef = useRef<HTMLDivElement>(null)
  const closeButtonRef = useRef<HTMLButtonElement>(null)
  // Whether closing should hand focus back to the hamburger. False when the
  // menu closes because the viewport grew to desktop (the hamburger is gone).
  const restoreFocus = useRef(true)
  // When the menu last closed (Date.now()), for the reopen guard.
  const lastClosedAt = useRef(0)

  const normalizedPathname = pathname.replace(/\/$/, '') || '/'
  const isAiModePage = normalizedPathname === AI_MODE_HREF

  const openMenu = () => {
    if (Date.now() - lastClosedAt.current < REOPEN_GUARD_MS) return
    restoreFocus.current = true
    setMenuPath(pathname)
  }
  const closeMenu = useCallback(() => {
    lastClosedAt.current = Date.now()
    setMenuPath(null)
  }, [])

  useEffect(() => {
    // Desktop = Tailwind `lg` (64rem), read from one MediaQueryList. Falls back
    // to the 16px equivalent where matchMedia is unavailable.
    const mql = typeof window.matchMedia === 'function' ? window.matchMedia(DESKTOP_QUERY) : null
    const isDesktop = () => (mql ? mql.matches : window.innerWidth >= 1024)

    const handler = () => {
      const currentY = window.scrollY
      const diff = currentY - lastScrollY.current

      setScrolled(currentY > 20)

      // Only apply hide/show on desktop (`lg`, 64rem). Below that the bar is
      // always shown — including after the window narrows while it was hidden
      // at desktop width.
      if (isDesktop()) {
        if (currentY < 60) {
          setVisible(true)
        } else if (diff > 6) {
          setVisible(false)
        } else if (diff < -4) {
          setVisible(true)
        }
      } else {
        setVisible(true)
      }

      lastScrollY.current = currentY
    }
    const onResize = () => {
      if (!isDesktop()) setVisible(true)
    }
    window.addEventListener('scroll', handler, { passive: true })
    window.addEventListener('resize', onResize)
    return () => {
      window.removeEventListener('scroll', handler)
      window.removeEventListener('resize', onResize)
    }
  }, [])

  useEffect(() => {
    if (!mobileOpen) return

    // 1. Scroll lock, padding the body by the scrollbar width it removes.
    const html = document.documentElement
    const body = document.body
    const prev = {
      htmlOverflow: html.style.overflow,
      bodyOverflow: body.style.overflow,
      bodyPaddingRight: body.style.paddingRight,
    }
    const scrollbar = html.clientWidth > 0 ? window.innerWidth - html.clientWidth : 0
    html.style.overflow = 'hidden'
    body.style.overflow = 'hidden'
    if (scrollbar > 0) body.style.paddingRight = `${scrollbar}px`

    // 2. Move focus into the dialog.
    const frame = window.requestAnimationFrame(() => closeButtonRef.current?.focus())

    // 3. The overlay is mobile-only: growing to desktop closes it.
    const mql = typeof window.matchMedia === 'function' ? window.matchMedia(DESKTOP_QUERY) : null
    const onChange = (e: MediaQueryListEvent) => {
      if (e.matches) {
        restoreFocus.current = false
        closeMenu()
      }
    }
    mql?.addEventListener?.('change', onChange)

    // 4. Everything behind the modal is inert.
    const inertTargets = [navRef.current, document.querySelector('main'), document.querySelector('footer')]
      .filter((el): el is HTMLElement => !!el && !el.hasAttribute('inert'))
    inertTargets.forEach(el => el.setAttribute('inert', ''))

    return () => {
      window.cancelAnimationFrame(frame)
      mql?.removeEventListener?.('change', onChange)
      inertTargets.forEach(el => el.removeAttribute('inert'))
      html.style.overflow = prev.htmlOverflow
      body.style.overflow = prev.bodyOverflow
      body.style.paddingRight = prev.bodyPaddingRight
      // 5. Hand focus back to the control that opened the menu.
      if (restoreFocus.current) menuButtonRef.current?.focus()
    }
  }, [mobileOpen, closeMenu])

  const onDialogKeyDown = (e: ReactKeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Escape') {
      e.preventDefault()
      closeMenu()
      return
    }
    if (e.key !== 'Tab' || !dialogRef.current) return
    const items = Array.from(dialogRef.current.querySelectorAll<HTMLElement>(FOCUSABLE))
    if (items.length === 0) return
    const first = items[0]
    const last = items[items.length - 1]
    const index = items.indexOf(document.activeElement as HTMLElement)
    if (index === -1) {
      // Focus is on the dialog container (blank-space click): enter the list
      // from the end the key points to.
      e.preventDefault()
      ;(e.shiftKey ? last : first).focus()
    } else if (e.shiftKey && index === 0) {
      e.preventDefault()
      last.focus()
    } else if (!e.shiftKey && index === items.length - 1) {
      e.preventDefault()
      first.focus()
    }
  }

  const navBg = scrolled
    ? 'bg-white/80 backdrop-blur-sm border-b border-gray-100/50 shadow-sm'
    : 'bg-white/80 backdrop-blur-sm border-b border-gray-100/50'

  const logoColor = 'text-primary'
  const linkColor = 'text-ink-muted hover:text-primary'
  const activeLinkColor = 'text-primary'

  const logo = (
    <img
      src="/logo.svg"
      alt="Mlytics"
      width={96}
      height={17}
    />
  )

  return (
    <>
      <nav
        ref={navRef}
        className={`fixed top-0 left-0 right-0 z-50 transition-[transform,box-shadow] duration-300 ${navBg}`}
        style={{
          transform: visible ? 'translateY(0)' : 'translateY(-100%)',
          pointerEvents: visible ? 'auto' : 'none',
        }}
      >
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            {logo}
          </Link>

          {/* Desktop links */}
          <div className="hidden lg:flex items-center gap-8">
            {NAV_LINKS.map(link => (
              <Link
                key={link.href}
                href={link.href}
                className={`text-sm transition-colors ${
                  normalizedPathname === link.href ? `${activeLinkColor} font-semibold` : `${linkColor} font-medium`
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* CTA */}
          <div className="hidden lg:flex items-center gap-3">
            <Link
              href="/book-a-demo"
              onClick={() => trackCTA('Book a Demo', 'nav')}
              className={`${SECONDARY_BTN} ${FOCUS_RING}`}
            >
              Book a Demo
            </Link>
            <Link
              href={AI_MODE_HREF}
              onClick={() => trackCTA('Try AI Mode', 'nav')}
              aria-current={isAiModePage ? 'page' : undefined}
              className={`${PRIMARY_BTN} ${FOCUS_RING}`}
            >
              Try AI Mode
            </Link>
          </div>

          {/* Mobile bar: solid Try AI Mode, then the hamburger */}
          <div className="flex items-center gap-2 lg:hidden">
            <Link
              href={AI_MODE_HREF}
              onClick={() => trackCTA('Try AI Mode', MOBILE_BAR_POSITION)}
              aria-current={isAiModePage ? 'page' : undefined}
              className={`${PRIMARY_BTN} whitespace-nowrap ${FOCUS_RING}`}
            >
              Try AI Mode
            </Link>
            {/* 44×44px touch target via padding; -mr offsets right padding so icon stays visually flush */}
            <button
              ref={menuButtonRef}
              type="button"
              className={`-mr-[11px] p-[11px] transition-colors ${logoColor} ${FOCUS_RING}`}
              onClick={openMenu}
              aria-label="Open menu"
              aria-expanded={mobileOpen}
              aria-controls="mobile-menu"
              aria-haspopup="dialog"
            >
              <Menu size={22} />
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile menu: a full-screen dialog. Rendered as a sibling of <nav>, not
          inside it: the nav's transform and backdrop-filter make it the
          containing block for fixed descendants, which would clip the overlay
          to the 65px bar. Not a <nav>/<header> either — useNavOffset and the
          e2e suites look the site bar up by those tags. */}
      <AnimatePresence>
        {mobileOpen && (
          <PresenceGate key="mobile-menu">
            {present => (
              <motion.div
                id="mobile-menu"
                ref={dialogRef}
                role="dialog"
                aria-modal="true"
                aria-label="Site menu"
                onKeyDown={onDialogKeyDown}
                // Focusable (not tabbable) so a click on blank space lands focus on
                // the dialog rather than <body>; keydown then still reaches the
                // Escape / focus-trap handler.
                tabIndex={-1}
                // While the exit fade plays the dialog is already closed: keep it
                // out of the accessibility tree and unclickable.
                inert={!present}
                aria-hidden={present ? undefined : true}
                initial={reduceMotion ? false : { opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={reduceMotion ? { opacity: 0, transition: { duration: 0 } } : { opacity: 0 }}
                transition={{ duration: 0.18 }}
                className={`lg:hidden fixed inset-0 z-[60] flex flex-col h-dvh bg-white overflow-y-auto overscroll-contain outline-none ${present ? '' : 'pointer-events-none'}`}
              >
                <div className="shrink-0 border-b border-line">
                  <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
                    <Link href="/" onClick={closeMenu} className={`flex items-center ${FOCUS_RING}`}>
                      {logo}
                    </Link>
                    <button
                      ref={closeButtonRef}
                      type="button"
                      className={`-mr-[11px] p-[11px] transition-colors ${logoColor} ${FOCUS_RING}`}
                      onClick={closeMenu}
                      aria-label="Close menu"
                    >
                      <X size={22} />
                    </button>
                  </div>
                </div>

                <ul className="flex-1 px-6">
                  {NAV_LINKS.map(link => {
                    const active = normalizedPathname === link.href
                    return (
                      <li key={link.href} className="border-b border-line">
                        <Link
                          href={link.href}
                          onClick={closeMenu}
                          aria-current={active ? 'page' : undefined}
                          className={`flex items-center min-h-14 py-4 text-base ${
                            active ? 'text-primary font-semibold' : 'text-ink font-medium'
                          } ${FOCUS_RING}`}
                        >
                          {link.label}
                        </Link>
                      </li>
                    )
                  })}
                </ul>

                <div className="shrink-0 grid grid-cols-2 gap-3 px-6 pt-4 pb-[max(1.5rem,env(safe-area-inset-bottom))] border-t border-line">
                  <Link
                    href="/book-a-demo"
                    onClick={() => { trackCTA('Book a Demo', 'nav_mobile'); closeMenu() }}
                    className={`pill-btn ${FOCUS_RING}`}
                  >
                    Book a Demo
                  </Link>
                  <Link
                    href={AI_MODE_HREF}
                    onClick={() => { trackCTA('Try AI Mode', 'nav_mobile'); closeMenu() }}
                    aria-current={isAiModePage ? 'page' : undefined}
                    className={`${OVERLAY_SOLID_BTN} ${FOCUS_RING}`}
                  >
                    Try AI Mode
                  </Link>
                </div>
              </motion.div>
            )}
          </PresenceGate>
        )}
      </AnimatePresence>
    </>
  )
}
