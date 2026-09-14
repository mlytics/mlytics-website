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

    expect(screen.getByRole('link', { name: 'AI Mode' })).toHaveStyle({
      color: '#fff',
      fontWeight: 600,
    })
  })
})
