import React from 'react'
import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { ContentOwnerVerticals } from '@/components/pages/publishers/ContentOwnerVerticals'

vi.mock('framer-motion', () => ({
  motion: new Proxy({}, {
    get: (_, tag: string) => ({ children, variants, whileHover, initial, animate, whileInView, viewport, transition, ...props }: Record<string, unknown> & { children?: React.ReactNode }) =>
      React.createElement(tag, props, children),
  }),
}))

vi.mock('next/link', () => ({
  default: ({ href, children, className, onClick }: {
    href: string; children: React.ReactNode; className?: string
    onClick?: React.MouseEventHandler<HTMLAnchorElement>
  }) => (
    <a href={href} className={className} onClick={(e) => { e.preventDefault(); onClick?.(e) }}>{children}</a>
  ),
}))

const trackCTA = vi.hoisted(() => vi.fn())
vi.mock('@/lib/analytics', () => ({ trackCTA }))

afterEach(() => { cleanup(); trackCTA.mockClear() })

describe('ContentOwnerVerticals — Talk to us card (DATAI-628, #31-11)', () => {
  it('records the on-screen text, not "Get Started"', async () => {
    render(<ContentOwnerVerticals />)
    await userEvent.click(screen.getByRole('link', { name: /Talk to us/ }))
    expect(trackCTA).toHaveBeenCalledTimes(1)
    expect(trackCTA).toHaveBeenCalledWith('Talk to us', 'content_owners_section')
  })
})
