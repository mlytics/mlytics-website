import React from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { HeroSection } from '@/components/home/HeroSection'

// Mock framer-motion — AnimatePresence + motion.span used for rotating words
vi.mock('framer-motion', () => ({
  AnimatePresence: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  motion: {
    span: ({ children, ...props }: React.HTMLAttributes<HTMLSpanElement>) => (
      <span {...props}>{children}</span>
    ),
    p: ({ children, ...props }: React.HTMLAttributes<HTMLParagraphElement>) => (
      <p {...props}>{children}</p>
    ),
  },
}))

// Mock next/link
vi.mock('next/link', () => ({
  default: ({
    href,
    children,
    className,
    onClick,
  }: {
    href: string
    children: React.ReactNode
    className?: string
    onClick?: () => void
  }) => (
    <a href={href} className={className} onClick={onClick}>
      {children}
    </a>
  ),
}))

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn() }),
}))

// Mock heavy child components that are hidden / irrelevant to copy
vi.mock('@/components/home/WorldMapDots', () => ({
  WorldMapDots: () => null,
}))
vi.mock('@/components/home/LogoMarquee', () => ({
  LogoMarquee: () => null,
}))

describe('HeroSection', () => {
  describe('headline', () => {
    it('renders the static H1 text', () => {
      render(<HeroSection />)
      expect(
        screen.getByRole('heading', { level: 1 })
      ).toHaveTextContent('Discovery and Answer Engine')
    })

    it('renders the first rotating word on initial load', () => {
      render(<HeroSection />)
      expect(
        screen.getByText('that puts your brand inside AI answers')
      ).toBeInTheDocument()
    })
  })

  describe('early access form', () => {
    it('renders email input', () => {
      render(<HeroSection />)
      expect(screen.getByPlaceholderText(/enter your email/i)).toBeInTheDocument()
    })

    it('renders Get Early Access button', () => {
      render(<HeroSection />)
      expect(screen.getByRole('button', { name: /get early access/i })).toBeInTheDocument()
    })

    it('shows success message after successful submission', async () => {
      global.fetch = vi.fn().mockResolvedValueOnce({ ok: true })
      render(<HeroSection />)
      await userEvent.type(screen.getByPlaceholderText(/enter your email/i), 'test@example.com')
      await userEvent.click(screen.getByRole('button', { name: /get early access/i }))
      expect(await screen.findByText(/you're on the list/i)).toBeInTheDocument()
    })

    it('shows validation error for invalid email on submit', async () => {
      render(<HeroSection />)
      await userEvent.type(screen.getByPlaceholderText(/enter your email/i), 'notanemail')
      await userEvent.click(screen.getByRole('button', { name: /get early access/i }))
      expect(screen.getByText(/please enter a valid email address/i)).toBeInTheDocument()
    })

    it('shows required error when submitting empty input', async () => {
      render(<HeroSection />)
      await userEvent.click(screen.getByRole('button', { name: /get early access/i }))
      expect(screen.getByText(/email is required/i)).toBeInTheDocument()
    })

    it('clears validation error when user starts typing', async () => {
      render(<HeroSection />)
      await userEvent.click(screen.getByRole('button', { name: /get early access/i }))
      expect(screen.getByText(/email is required/i)).toBeInTheDocument()
      await userEvent.type(screen.getByPlaceholderText(/enter your email/i), 'a')
      expect(screen.queryByText(/email is required/i)).not.toBeInTheDocument()
    })
  })
})
