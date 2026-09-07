'use client'

import { motion } from 'framer-motion'
import { Eyebrow } from '@/components/ui/Eyebrow'

type ComparisonRow = [dimension: string, common: string, mlytics: string]

const ROWS: ComparisonRow[] = [
  ['Network choice', "One provider's internal routing or fixed Multi-CDN weights", 'Measured cross-provider quality drives active steering'],
  ['Decision data', 'Provider telemetry or a single synthetic metric', 'RUM and synthetic monitoring combine real experience with active probes'],
  ['Granularity', 'Country and large-region rules', 'Country, region, ISP, ASN, CDN, time, and workload-aware strategies'],
  ['Execution', 'Dashboards, DNS, and CDN management in separate tools', 'Route, Observe, and Decide connect telemetry directly to routing'],
  ['Existing CDNs', 'Migration, replacement, or separate integration', 'Customer-provided CDNs remain monitored and participate in steering'],
  ['Cache & origin', 'Independent edge caches across providers', 'Origin Shield consolidates cache misses and improves origin offload'],
  ['Dynamic delivery', 'Edge or basic HTTP measurements', 'End-to-end latency, timeout, 5xx, and availability to application endpoints'],
  ['Operations', 'Performance charts and traffic usage', 'Quality trends, traffic share, policy, and routing outcomes together'],
]

export function EngineComparison() {
  return (
    <section className="section-light py-16 lg:py-20">
      <div className="max-w-5xl mx-auto px-6">
        <motion.div
          className="mb-11"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.5 }}
        >
          <Eyebrow className="mb-3 block">Industry differentiation</Eyebrow>
          <h2 className="section-heading text-ink mb-4">More than multiple CDN contracts.</h2>
          <p className="text-base max-w-3xl text-ink-muted">
            The difference is the operating system around delivery: independent data, automated
            decisions, origin efficiency, and visible control.
          </p>
        </motion.div>

        <div
          role="region"
          aria-label="Multi-CDN approach comparison"
          tabIndex={0}
          className="overflow-x-auto rounded-2xl border border-line bg-white"
        >
          <table className="w-full border-collapse min-w-[46rem]">
            <thead>
              <tr>
                <th className="label-eyebrow text-left px-5 py-4 bg-primary text-white">
                  Dimension
                </th>
                <th className="label-eyebrow text-left px-5 py-4 bg-primary text-white">
                  Common approach
                </th>
                <th className="label-eyebrow text-left px-5 py-4 bg-primary text-white">
                  Mlytics Decisive Engine
                </th>
              </tr>
            </thead>
            <tbody>
              {ROWS.map(([dimension, common, mlytics]) => (
                <tr key={dimension}>
                  <td className="align-top px-5 py-4 border-t border-line text-sm font-bold text-ink w-1/5">
                    {dimension}
                  </td>
                  <td className="align-top px-5 py-4 border-t border-line text-sm text-ink-muted w-2/5">
                    {common}
                  </td>
                  <td className="align-top px-5 py-4 border-t border-line text-sm font-semibold text-primary">
                    {mlytics}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  )
}
