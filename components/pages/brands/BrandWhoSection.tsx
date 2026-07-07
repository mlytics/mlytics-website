'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Landmark, ShoppingBag, Heart, Car, Monitor } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { Eyebrow } from '@/components/ui/Eyebrow'

const VERTICALS: { num: string; Icon: LucideIcon; label: string; desc: string }[] = [
  { num: '01', Icon: Landmark,    label: 'Financial Services', desc: 'Banks, insurance, investment funds — audiences actively researching before committing.' },
  { num: '02', Icon: ShoppingBag, label: 'Consumer Brands',    desc: 'Products with considered purchase cycles where intent signals determine conversion.' },
  { num: '03', Icon: Heart,       label: 'Health & Wellness',  desc: 'Research-heavy decisions where trust and context matter as much as the message.' },
  { num: '04', Icon: Car,         label: 'Automotive',          desc: 'High-intent, long consideration cycles — the right moment is everything.' },
  { num: '05', Icon: Monitor,     label: 'Technology',          desc: 'B2C and prosumer software & hardware with audiences already in AI-powered research flows.' },
]

function VerticalCard({ item, i }: { item: typeof VERTICALS[0]; i: number }) {
  const [hovered, setHovered] = useState(false)

  return (
    <motion.div
      className="relative rounded-2xl p-6 flex flex-col overflow-hidden cursor-default bg-white"
      style={{
        border: '1px solid #E8E8E8',
      }}
      initial={{ opacity: 0, y: 32 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.45, delay: i * 0.08, ease: 'easeOut' }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Hover glow */}
      <motion.div
        className="absolute inset-0 pointer-events-none z-0"
        style={{
          background: 'radial-gradient(ellipse 70% 60% at 100% 0%, rgba(34,93,89,0.07) 0%, rgba(34,93,89,0.02) 50%, transparent 75%)',
        }}
        initial={{ opacity: 0 }}
        animate={{ opacity: hovered ? 1 : 0 }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
      />
      <motion.div
        className="absolute inset-0 rounded-2xl pointer-events-none z-0"
        animate={hovered
          ? { boxShadow: '0 0 0 1px rgba(34,93,89,0.18), 0 6px 24px rgba(34,93,89,0.1)' }
          : { boxShadow: '0 0 0 1px transparent' }
        }
        transition={{ duration: 0.25 }}
      />

      {/* Content */}
      <div className="relative z-10 flex flex-col flex-1">
        <p className="label-eyebrow mb-3" style={{ color: 'var(--color-ink-subtle)' }}>
          {item.num} · Who this is for
        </p>
        <div className="mb-3 w-9 h-9 rounded-lg flex items-center justify-center bg-primary/8">
          <item.Icon size={18} strokeWidth={1.7} className="text-primary" />
        </div>
        <h3 className="text-base font-bold leading-snug text-ink">{item.label}</h3>
        <p className="text-sm leading-relaxed mt-4 pt-4 text-ink-muted" style={{ borderTop: '1px solid #EFEFEF' }}>
          {item.desc}
        </p>
      </div>
    </motion.div>
  )
}

export function BrandWhoSection() {
  return (
    <section className="section-light py-16 lg:py-20">
      <div className="max-w-5xl mx-auto px-6">
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.5 }}
        >
          <Eyebrow color="#A0A0A0" className="mb-3">
            Who this is for
          </Eyebrow>
          <h2 className="section-heading text-ink">
            Which industries are most exposed to AI search disrupting ad performance?
          </h2>
        </motion.div>

        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          {VERTICALS.map((item, i) => (
            <VerticalCard key={item.num} item={item} i={i} />
          ))}
        </div>
      </div>
    </section>
  )
}
