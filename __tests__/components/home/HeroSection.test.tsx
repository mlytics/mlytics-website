import React from 'react'
import { render, screen } from '@testing-library/react'
import { HeroSection } from '@/components/home/HeroSection'

// Mock framer-motion — AnimatePresence + motion.span used for rotating words
vi.mock('framer-motion', () => ({
  AnimatePresence: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  motion: {
    span: ({ children, ...props }: React.HTMLAttributes<HTMLSpanElement>) => (
      <span {...props}>{children}</span>
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
vi.mock('@/components/agent/AgentDialog', () => ({
  AgentDialog: () => null,
}))
vi.mock('@/components/agent/CortexLiveDemo', () => ({
  CortexLiveDemo: () => null,
}))

describe('HeroSection', () => {
  describe('headline', () => {
    it('renders the static H1 text', () => {
      render(<HeroSection />)
      expect(
        screen.getByRole('heading', { level: 1 })
      ).toHaveTextContent('A Discovery and Answer Engine')
    })

    it('renders the first rotating word on initial load', () => {
      render(<HeroSection />)
      expect(
        screen.getByText('that puts your brand inside AI answers')
      ).toBeInTheDocument()
    })
  })

  describe('tagline', () => {
    it('renders the new tagline', () => {
      render(<HeroSection />)
      expect(
        screen.getByText('Built for businesses ready to monetise the AI era.')
      ).toBeInTheDocument()
    })
  })

  describe('CTA', () => {
    it('renders Book a Demo link pointing to /book-a-demo', () => {
      render(<HeroSection />)
      const link = screen.getByRole('link', { name: /book a demo/i })
      expect(link).toHaveAttribute('href', '/book-a-demo')
    })
  })
})
