'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'

type EarningItem = { num: string; tag: string; title: string; value: string; desc: string }

const EARNINGS: EarningItem[] = [
  {
    num: '01',
    tag: 'Content Layer',
    title: 'Activated Answer Pages',
    value: 'AEO-ready inventory',
    desc: 'Up to 10,000 pages structured and hosted — zero technical setup required.',
  },
  {
    num: '02',
    tag: 'Revenue Share',
    title: 'Brand Interaction Revenue Share',
    value: 'Up to 25% revenue share',
    desc: 'Earned on qualified interactions within your content. Branded Answers is the first supported format.',
  },
  {
    num: '03',
    tag: 'Cooperation',
    title: 'Brand Cooperation Reward',
    value: 'Additional reward',
    desc: 'Refer or propose a brand deal — earn on top of your revenue share, per the partner agreement.',
  },
]

function EarningCard({ item, i }: { item: EarningItem; i: number }) {
  const [hovered, setHovered] = useState(false)

  return (
    <motion.div
      className="relative rounded-2xl p-7 flex flex-col overflow-hidden cursor-default"
      style={{
        background: 'rgba(34,93,89,0.22)',
        border: '1px solid rgba(168,197,195,0.1)',
      }}
      initial={{ opacity: 0, y: 32 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.45, delay: i * 0.1, ease: 'easeOut' }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Hover glow */}
      <motion.div
        className="absolute inset-0 pointer-events-none z-0"
        style={{
          background:
            'radial-gradient(ellipse 70% 60% at 100% 0%, rgba(168,197,195,0.22) 0%, rgba(168,197,195,0.08) 45%, transparent 75%)',
        }}
        initial={{ opacity: 0 }}
        animate={{ opacity: hovered ? 1 : 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
      />
      <motion.div
        className="absolute inset-0 rounded-2xl pointer-events-none z-0"
        animate={
          hovered
            ? { boxShadow: '0 0 0 1px rgba(168,197,195,0.28), 0 6px 28px rgba(34,93,89,0.24)' }
            : { boxShadow: '0 0 0 1px transparent' }
        }
        transition={{ duration: 0.25 }}
      />

      {/* Content */}
      <div className="relative z-10 flex flex-col flex-1">
        <p
          className="text-[10px] font-semibold uppercase tracking-widest mb-3"
          style={{ color: 'rgba(168,197,195,0.6)' }}
        >
          {item.num} · {item.tag}
        </p>
        <h3 className="text-xl font-bold text-white leading-snug mb-2">{item.title}</h3>
        <p className="text-sm font-bold mb-6" style={{ color: '#F59E0B' }}>
          {item.value}
        </p>
        <p
          className="text-sm leading-relaxed mt-auto"
          style={{
            color: '#A8C5C3',
            borderTop: '1px solid rgba(168,197,195,0.1)',
            paddingTop: 16,
          }}
        >
          {item.desc}
        </p>
      </div>
    </motion.div>
  )
}

export function PartnershipEarnings() {
  return (
    <section className="section-dark py-20 lg:py-28 relative overflow-hidden">
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse 900px 500px at 50% 50%, rgba(34,93,89,0.18) 0%, transparent 70%)',
        }}
      />

      <div className="max-w-5xl mx-auto px-6 relative z-10">
        <motion.div
          className="text-center mb-14"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.5 }}
        >
          <span
            className="inline-block text-xs font-semibold uppercase tracking-widest mb-3"
            style={{ color: '#A8C5C3' }}
          >
            Partner Benefits
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            What do media partners get — and how do they earn?
          </h2>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-5">
          {EARNINGS.map((item, i) => (
            <EarningCard key={item.num} item={item} i={i} />
          ))}
        </div>
      </div>
    </section>
  )
}
