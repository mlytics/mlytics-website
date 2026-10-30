import React from 'react'
import { render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { Footer } from '@/components/layout/Footer'

const usePathnameMock = vi.fn()

vi.mock('next/navigation', () => ({
  usePathname: () => usePathnameMock(),
}))

vi.mock('next/link', () => ({
  default: ({
    href,
    children,
    className,
    style,
  }: {
    href: string
    children: React.ReactNode
    className?: string
    style?: React.CSSProperties
  }) => (
    <a href={href} className={className} style={style}>
      {children}
    </a>
  ),
}))

describe('Footer', () => {
  beforeEach(() => {
    usePathnameMock.mockReturnValue('/')
  })

  it('renders the AI Mode link between Partnership and Contact', () => {
    render(<Footer />)

    const solutions = screen.getByText('Solutions').closest('div') as HTMLElement
    const links = Array.from(solutions.querySelectorAll('a'))
    const playgroundLink = screen.getByRole('link', { name: 'AI Mode' }) as HTMLAnchorElement

    expect(playgroundLink).toHaveAttribute('href', '/ai-mode-playground')
    expect(links.indexOf(playgroundLink)).toBe(links.findIndex((link) => link.textContent === 'Partnership') + 1)
    expect(links.indexOf(playgroundLink)).toBe(links.findIndex((link) => link.textContent === 'Contact') - 1)
  })

  it('uses the active styling when the AI Mode pathname is current', () => {
    usePathnameMock.mockReturnValue('/ai-mode-playground/')
    render(<Footer />)

    expect(screen.getByRole('link', { name: 'AI Mode' })).toHaveClass('text-white', 'font-semibold')
    expect(screen.getByRole('link', { name: 'Brands' })).not.toHaveClass('text-white')
  })

  it('uses the home content width (1152) on the home page', () => {
    usePathnameMock.mockReturnValue('/')
    const { container } = render(<Footer />)
    expect(container.querySelector('footer > div')).toHaveClass('max-w-6xl')
  })

  it('uses the inner page content width (1024) on other pages', () => {
    usePathnameMock.mockReturnValue('/brands/')
    const { container } = render(<Footer />)
    expect(container.querySelector('footer > div')).toHaveClass('max-w-5xl')
    expect(container.querySelector('footer > div')).not.toHaveClass('max-w-6xl')
  })
})
