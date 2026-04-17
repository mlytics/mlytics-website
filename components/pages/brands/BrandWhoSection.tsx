'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'

const VERTICALS = [
  { num: '01', icon: '🏦', label: 'Financial Services', desc: 'Banks, insurance, investment funds — audiences actively researching before committing.' },
  { num: '02', icon: '👟', label: 'Consumer Brands',    desc: 'Products with considered purchase cycles where intent signals determine conversion.' },
  { num: '03', icon: '❤️', label: 'Health & Wellness',  desc: 'Research-heavy decisions where trust and context matter as much as the message.' },
  { num: '04', icon: '🚗', label: 'Automotive',          desc: 'High-intent, long consideration cycles — the right moment is everything.' },
  { num: '05', icon: '💻', label: 'Technology',          desc: 'B2C and prosumer software & hardware with audiences already in AI-powered research flows.' },
]

function VerticalCard({ item, i }: { item: typeof VERTICALS[0]; i: number }) {
  const [hovered, setHovered] = useState(false)

  return (
    <motion.div
      className="relative rounded-2xl p-6 flex flex-col overflow-hidden cursor-default"
      style={{
        background: '#FFFFFF',
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
        <p className="text-[10px] font-semibold uppercase tracking-widest mb-3" style={{ color: '#C0C0C0' }}>
          {item.num} · Who this is for
        </p>
        <div className="text-2xl mb-3">{item.icon}</div>
        <h3 className="text-base font-bold leading-snug" style={{ color: '#1A1A1A' }}>{item.label}</h3>
        <p className="text-xs leading-relaxed mt-4 pt-4" style={{ color: '#6B6B6B', borderTop: '1px solid #EFEFEF' }}>
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
          <span className="inline-block text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: '#A0A0A0' }}>
            Who this is for
          </span>
          <h2 className="text-3xl md:text-4xl font-bold" style={{ color: '#1A1A1A' }}>
            For brand marketers tired of paying for impressions that don't convert.
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
