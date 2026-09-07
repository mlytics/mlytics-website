import React from 'react'
import { render, screen, within } from '@testing-library/react'
import { EngineComparison } from '@/components/pages/decisive-engine/EngineComparison'

vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
      <div {...props}>{children}</div>
    ),
  },
}))

describe('EngineComparison', () => {
  it('renders the section heading', () => {
    render(<EngineComparison />)
    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent(
      'More than multiple CDN contracts.'
    )
  })

  it('renders the eyebrow text exactly', () => {
    render(<EngineComparison />)
    expect(screen.getByText('Industry differentiation')).toBeInTheDocument()
  })

  it('renders the intro paragraph verbatim', () => {
    render(<EngineComparison />)
    expect(
      screen.getByText(
        'The difference is the operating system around delivery: independent data, automated decisions, origin efficiency, and visible control.'
      )
    ).toBeInTheDocument()
  })

  it('renders the three column headers', () => {
    render(<EngineComparison />)
    const headers = screen.getAllByRole('columnheader')
    expect(headers).toHaveLength(3)
    expect(headers[0]).toHaveTextContent('Dimension')
    expect(headers[1]).toHaveTextContent('Common approach')
    expect(headers[2]).toHaveTextContent('Mlytics Decisive Engine')
  })

  it('marks every column header with scope="col" for header-to-cell association', () => {
    render(<EngineComparison />)
    const headers = screen.getAllByRole('columnheader')
    expect(headers).toHaveLength(3)
    headers.forEach((header) => {
      expect(header).toHaveAttribute('scope', 'col')
    })
  })

  it('renders exactly eight body rows', () => {
    render(<EngineComparison />)
    const body = screen.getAllByRole('rowgroup')[1]
    expect(within(body).getAllByRole('row')).toHaveLength(8)
  })

  it('renders every dimension label', () => {
    render(<EngineComparison />)
    for (const dim of [
      'Network choice',
      'Decision data',
      'Granularity',
      'Execution',
      'Existing CDNs',
      'Cache & origin',
      'Dynamic delivery',
      'Operations',
    ]) {
      expect(screen.getByText(dim)).toBeInTheDocument()
    }
  })

  it('makes the scroll container keyboard focusable', () => {
    render(<EngineComparison />)
    expect(screen.getByRole('region', { name: /comparison/i })).toHaveAttribute('tabindex', '0')
  })

  it('renders every row verbatim, scoped to its own row', () => {
    render(<EngineComparison />)
    const expected: [string, string, string][] = [
      [
        'Network choice',
        "One provider's internal routing or fixed Multi-CDN weights",
        'Measured cross-provider quality drives active steering',
      ],
      [
        'Decision data',
        'Provider telemetry or a single synthetic metric',
        'RUM and synthetic monitoring combine real experience with active probes',
      ],
      [
        'Granularity',
        'Country and large-region rules',
        'Country, region, ISP, ASN, CDN, time, and workload-aware strategies',
      ],
      [
        'Execution',
        'Dashboards, DNS, and CDN management in separate tools',
        'Route, Observe, and Decide connect telemetry directly to routing',
      ],
      [
        'Existing CDNs',
        'Migration, replacement, or separate integration',
        'Customer-provided CDNs remain monitored and participate in steering',
      ],
      [
        'Cache & origin',
        'Independent edge caches across providers',
        'Origin Shield consolidates cache misses and improves origin offload',
      ],
      [
        'Dynamic delivery',
        'Edge or basic HTTP measurements',
        'End-to-end latency, timeout, 5xx, and availability to application endpoints',
      ],
      [
        'Operations',
        'Performance charts and traffic usage',
        'Quality trends, traffic share, policy, and routing outcomes together',
      ],
    ]

    const body = screen.getAllByRole('rowgroup')[1]
    const rows = within(body).getAllByRole('row')
    expect(rows).toHaveLength(expected.length)

    rows.forEach((row, i) => {
      const [dimension, common, mlytics] = expected[i]
      const rowScope = within(row)
      expect(rowScope.getByText(dimension)).toBeInTheDocument()
      expect(rowScope.getByText(common)).toBeInTheDocument()
      expect(rowScope.getByText(mlytics)).toBeInTheDocument()
    })
  })
})
