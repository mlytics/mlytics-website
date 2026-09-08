'use client'

import { motion } from 'framer-motion'
import { Eyebrow } from '@/components/ui/Eyebrow'

type ArchBox = { title: string; desc: string }

const OBSERVE: ArchBox[] = [
  { title: 'Real users', desc: 'Last-mile experience from actual traffic' },
  { title: 'Synthetic probes', desc: 'Proactive CDN and endpoint measurements' },
  { title: 'Service health', desc: 'Latency, timeout, errors, and availability' },
]

const DELIVER: ArchBox[] = [
  { title: 'Multiple CDNs', desc: 'Provider and regional path diversity' },
  { title: 'Origin Shield', desc: 'Tiered cache and origin offload' },
  { title: 'Applications', desc: 'Web, API, media, gaming, and AI services' },
]

const TAGS = ['Performance', 'Availability', 'Capacity', 'Traffic share', 'Cost', 'Manual control']

const BOX_STYLE = {
  background: 'rgba(168,197,195,0.06)',
  border: '1px solid rgba(168,197,195,0.25)',
}

function ArchColumn({ label, boxes }: { label: string; boxes: ArchBox[] }) {
  return (
    <div className="grid gap-4 content-start">
      <span className="label-eyebrow text-on-dark/85">{label}</span>
      {boxes.map((box) => (
        <div key={box.title} className="p-5 rounded-2xl" style={BOX_STYLE}>
          <b className="block text-on-dark font-bold mb-1">{box.title}</b>
          <span className="text-sm text-on-dark/85">{box.desc}</span>
        </div>
      ))}
    </div>
  )
}

export function OrchestrationDiagram() {
  return (
    <section className="section-dark py-16 lg:py-20">
      <div className="max-w-5xl mx-auto px-6">
        <motion.div
          className="text-center max-w-3xl mx-auto mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.5 }}
        >
          <Eyebrow dark className="mb-3 block">
            One orchestration layer
          </Eyebrow>
          <h2 className="section-heading text-white">
            From network signals to global delivery.
          </h2>
        </motion.div>

        <div className="grid lg:grid-cols-[1fr_1.25fr_1fr] gap-5 items-stretch">
          <ArchColumn label="Observe" boxes={OBSERVE} />

          <div
            className="grid content-center text-center p-8 rounded-3xl"
            style={{
              background: 'rgba(34,93,89,0.4)',
              border: '1px solid rgba(168,197,195,0.4)',
            }}
          >
            <span className="mx-auto grid place-items-center w-20 h-20 rounded-3xl bg-primary text-white text-2xl font-black mb-5">
              DE
            </span>
            <h3 className="text-2xl font-bold text-white mb-3">Decisive Engine</h3>
            <p className="text-sm text-on-dark mb-6">
              Cross-CDN decision intelligence that aligns quality, availability, capacity, and
              policy.
            </p>
            <div className="flex flex-wrap gap-2 justify-center">
              {TAGS.map((tag) => (
                <span key={tag} className="px-3 py-1.5 rounded-full text-xs text-on-dark">
                  {tag}
                </span>
              ))}
            </div>
          </div>

          <ArchColumn label="Deliver" boxes={DELIVER} />
        </div>
      </div>
    </section>
  )
}
