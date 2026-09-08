import React from 'react'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { EngineFAQ } from '@/components/pages/decisive-engine/EngineFAQ'

vi.mock('framer-motion', () => ({
  AnimatePresence: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  motion: {
    div: ({ children, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
      <div {...props}>{children}</div>
    ),
  },
}))

const QUESTIONS = [
  'How is this different from contracting with two CDNs ourselves?',
  'How does Mlytics decide which CDN serves a given user, and how quickly does it react?',
  'Do we have to replace our current CDN provider?',
  'Does this only help static assets, or also APIs and dynamic traffic?',
  'What happens when one CDN degrades in the middle of a live event?',
  'Where can we go deeper before talking to sales?',
]

const LINKS: { label: string; href: string }[] = [
  {
    label: 'RUM and Multi-CDN strategy',
    href: 'https://learning.mlytics.com/web-monitoring/how-to-implement-rum-for-multi-cdn-strategy/',
  },
  {
    label: 'Origin Shield, origin load balancing, and synthetic monitoring',
    href: 'https://www.mlytics.com/blog/mlytics-update-bolstering-origin-shield-and-enhancing-reflex-of-smart-load-balancer-and-pulse/',
  },
  {
    label: "Static and dynamic websites — what's the difference?",
    href: 'https://www.mlytics.com/blog/static-and-dynamic-websites-whats-the-difference/',
  },
  {
    label: "Reimagining Chinese games' success in the globe",
    href: 'https://www.mlytics.com/blog/reimagining-chinese-games-success-in-the-globe/',
  },
  {
    label: 'Global gaming data to reduce costs and increase efficiency',
    href: 'https://www.mlytics.com/blog/global-gaming-data-to-reduce-costs-and-increase-efficiency/',
  },
  {
    label: 'Achieving 41% monthly cost savings for e-commerce',
    href: 'https://www.mlytics.com/blog/achieving-41-monthly-cost-savings-for-e-commerce-with-mlytics-smart-load-balancing/',
  },
]

function getJsonLd(container: HTMLElement) {
  const script = container.querySelector('script[type="application/ld+json"]')
  expect(script).not.toBeNull()
  return JSON.parse(script!.innerHTML)
}

describe('EngineFAQ', () => {
  it('renders the FAQ header', () => {
    render(<EngineFAQ />)
    expect(screen.getByText('FAQ')).toBeInTheDocument()
    expect(
      screen.getByRole('heading', { level: 2, name: 'Common questions.' })
    ).toBeInTheDocument()
  })

  it('renders all six questions verbatim', () => {
    render(<EngineFAQ />)
    for (const q of QUESTIONS) {
      expect(screen.getByText(q)).toBeInTheDocument()
    }
  })

  it('renders exactly six accordion questions, no more and no fewer', () => {
    render(<EngineFAQ />)
    const buttons = screen.getAllByRole('button')
    expect(buttons).toHaveLength(QUESTIONS.length)
  })

  it('starts with every answer collapsed', () => {
    render(<EngineFAQ />)
    for (const label of ["Contracting with two CDNs", 'go deeper into the mechanics']) {
      expect(screen.queryByText(new RegExp(label))).not.toBeInTheDocument()
    }
    for (const link of LINKS) {
      expect(screen.queryByRole('link', { name: link.label })).not.toBeInTheDocument()
    }
  })

  it('opens an answer on click and closes it again on a second click', async () => {
    const user = userEvent.setup()
    render(<EngineFAQ />)

    const question = QUESTIONS[0]
    const button = screen.getByText(question).closest('button') as HTMLElement

    expect(screen.queryByText(/fixed traffic-split weights/)).not.toBeInTheDocument()

    await user.click(button)
    expect(screen.getByText(/fixed traffic-split weights/)).toBeInTheDocument()

    await user.click(button)
    expect(screen.queryByText(/fixed traffic-split weights/)).not.toBeInTheDocument()
  })

  it('closes the previously open answer when a different question is opened', async () => {
    const user = userEvent.setup()
    render(<EngineFAQ />)

    const firstButton = screen.getByText(QUESTIONS[0]).closest('button') as HTMLElement
    const secondButton = screen.getByText(QUESTIONS[1]).closest('button') as HTMLElement

    await user.click(firstButton)
    expect(screen.getByText(/fixed traffic-split weights/)).toBeInTheDocument()

    await user.click(secondButton)
    expect(screen.getByText(/Observe combines real user monitoring/)).toBeInTheDocument()
    expect(screen.queryByText(/fixed traffic-split weights/)).not.toBeInTheDocument()
  })

  it('renders all six reference links with correct labels and hrefs once the last answer is opened', async () => {
    const user = userEvent.setup()
    render(<EngineFAQ />)

    const lastButton = screen.getByText(QUESTIONS[5]).closest('button') as HTMLElement
    await user.click(lastButton)

    for (const { label, href } of LINKS) {
      expect(screen.getByRole('link', { name: label })).toHaveAttribute('href', href)
    }
  })

  it('opens the six reference links safely in a new tab', async () => {
    const user = userEvent.setup()
    render(<EngineFAQ />)

    const lastButton = screen.getByText(QUESTIONS[5]).closest('button') as HTMLElement
    await user.click(lastButton)

    const external = screen
      .getAllByRole('link')
      .filter((a) => a.getAttribute('href')?.startsWith('http'))
    expect(external).toHaveLength(6)
    for (const link of external) {
      expect(link).toHaveAttribute('target', '_blank')
      expect(link).toHaveAttribute('rel', 'noopener noreferrer')
    }
  })

  it('embeds a FAQPage JSON-LD schema with all six questions and answers', () => {
    const { container } = render(<EngineFAQ />)
    const schema = getJsonLd(container)

    expect(schema['@context']).toBe('https://schema.org')
    expect(schema['@type']).toBe('FAQPage')
    expect(schema.mainEntity).toHaveLength(6)

    schema.mainEntity.forEach((entity: { '@type': string; name: string; acceptedAnswer: { '@type': string; text: string } }, i: number) => {
      expect(entity['@type']).toBe('Question')
      expect(entity.name).toBe(QUESTIONS[i])
      expect(entity.acceptedAnswer['@type']).toBe('Answer')
      expect(typeof entity.acceptedAnswer.text).toBe('string')
      expect(entity.acceptedAnswer.text.length).toBeGreaterThan(0)
    })
  })

  it('represents the six reference links as plain text (label and URL) inside the JSON-LD answer, since schema.org text cannot carry markup', () => {
    const { container } = render(<EngineFAQ />)
    const schema = getJsonLd(container)
    const lastAnswerText: string = schema.mainEntity[5].acceptedAnswer.text

    // No HTML/JSX ever makes it into the plain-text schema field.
    expect(lastAnswerText).not.toMatch(/<[a-z][\s\S]*>/i)

    for (const { label, href } of LINKS) {
      expect(lastAnswerText).toContain(label)
      expect(lastAnswerText).toContain(href)
    }
  })
})
