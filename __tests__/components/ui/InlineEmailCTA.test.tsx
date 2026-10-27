import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { InlineEmailCTA } from '@/components/ui/InlineEmailCTA'

vi.mock('framer-motion', () => ({
  motion: {
    span: ({ children, ...props }: React.HTMLAttributes<HTMLSpanElement>) => (
      <span {...props}>{children}</span>
    ),
    p: ({ children, ...props }: React.HTMLAttributes<HTMLParagraphElement>) => (
      <p {...props}>{children}</p>
    ),
  },
}))

const trackCTAMock = vi.fn()
vi.mock('@/lib/analytics', () => ({
  trackCTA: (...args: unknown[]) => trackCTAMock(...args),
}))

describe('InlineEmailCTA', () => {
  beforeEach(() => {
    trackCTAMock.mockClear()
  })

  it('renders email input and Get Early Access button', () => {
    render(<InlineEmailCTA ctaLabel="brands_cta" pageName="Brands Page CTA" tone="dark" />)
    expect(screen.getByPlaceholderText(/enter your email/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /get early access/i })).toBeInTheDocument()
  })

  it('shows required error when submitting empty input', async () => {
    render(<InlineEmailCTA ctaLabel="brands_cta" pageName="Brands Page CTA" tone="dark" />)
    await userEvent.click(screen.getByRole('button', { name: /get early access/i }))
    expect(screen.getByText(/email is required/i)).toBeInTheDocument()
  })

  it('shows validation error for invalid email on submit', async () => {
    render(<InlineEmailCTA ctaLabel="brands_cta" pageName="Brands Page CTA" tone="dark" />)
    await userEvent.type(screen.getByPlaceholderText(/enter your email/i), 'notanemail')
    await userEvent.click(screen.getByRole('button', { name: /get early access/i }))
    expect(screen.getByText(/please enter a valid email address/i)).toBeInTheDocument()
  })

  it('clears validation error when user starts typing', async () => {
    render(<InlineEmailCTA ctaLabel="brands_cta" pageName="Brands Page CTA" tone="dark" />)
    await userEvent.click(screen.getByRole('button', { name: /get early access/i }))
    expect(screen.getByText(/email is required/i)).toBeInTheDocument()
    await userEvent.type(screen.getByPlaceholderText(/enter your email/i), 'a')
    expect(screen.queryByText(/email is required/i)).not.toBeInTheDocument()
  })

  it('submits to HubSpot, tracks with the given ctaLabel, and shows success', async () => {
    global.fetch = vi.fn().mockResolvedValueOnce({ ok: true })
    render(<InlineEmailCTA ctaLabel="developers_cta" pageName="Developers Page CTA" tone="dark" />)
    await userEvent.type(screen.getByPlaceholderText(/enter your email/i), 'test@example.com')
    await userEvent.click(screen.getByRole('button', { name: /get early access/i }))

    expect(await screen.findByText(/you're on the list/i)).toBeInTheDocument()
    expect(trackCTAMock).toHaveBeenCalledWith('Get Early Access', 'developers_cta')

    const [, options] = (global.fetch as ReturnType<typeof vi.fn>).mock.calls[0]
    const body = JSON.parse(options.body)
    expect(body.context.pageName).toBe('Developers Page CTA')
    expect(body.fields[0]).toMatchObject({ name: 'email', value: 'test@example.com' })
  })

  it('shows a generic error message when the request fails', async () => {
    global.fetch = vi.fn().mockResolvedValueOnce({ ok: false })
    render(<InlineEmailCTA ctaLabel="partnership_cta" pageName="Partnership Page CTA" tone="dark" />)
    await userEvent.type(screen.getByPlaceholderText(/enter your email/i), 'test@example.com')
    await userEvent.click(screen.getByRole('button', { name: /get early access/i }))
    expect(await screen.findByText(/something went wrong/i)).toBeInTheDocument()
  })
})

describe('InlineEmailCTA error colour follows tone (DESIGN.md §2.2)', () => {
  it.each([
    ['light', 'text-error', 'border-error'],
    ['dark', 'text-error-on-dark', 'border-error-on-dark'],
  ] as const)('tone=%s', (tone, textClass, borderClass) => {
    render(<InlineEmailCTA ctaLabel="t" pageName="T" tone={tone} />)
    const input = screen.getByPlaceholderText('Enter your email')
    fireEvent.change(input, { target: { value: 'abc' } })
    fireEvent.blur(input)
    const msg = screen.getByText(/valid email/i)
    expect(msg).toHaveClass(textClass)
    expect(msg.className).not.toMatch(/red-/)
    expect(input.parentElement).toHaveClass(borderClass)
  })
})
