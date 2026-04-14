'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'

type Layer = { num: string; name: string; price: string; tag: string; desc: string }

function LayerCard({ item, i }: { item: Layer; i: number }) {
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
      {/* Hover — glow from top-right corner */}
      <motion.div
        className="absolute inset-0 pointer-events-none z-0"
        style={{
          background: 'radial-gradient(ellipse 70% 60% at 100% 0%, rgba(168,197,195,0.22) 0%, rgba(168,197,195,0.08) 45%, transparent 75%)',
        }}
        initial={{ opacity: 0 }}
        animate={{ opacity: hovered ? 1 : 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
      />

      {/* Border brightens on hover */}
      <motion.div
        className="absolute inset-0 rounded-2xl pointer-events-none z-0"
        animate={hovered
          ? { boxShadow: '0 0 0 1px rgba(168,197,195,0.28), 0 6px 28px rgba(34,93,89,0.24)' }
          : { boxShadow: '0 0 0 1px transparent' }
        }
        transition={{ duration: 0.25 }}
      />

      {/* Content */}
      <div className="relative z-10 flex flex-col flex-1">
        <p className="text-[10px] font-semibold uppercase tracking-widest mb-3" style={{ color: 'rgba(168,197,195,0.6)' }}>
          {item.num} · {item.tag}
        </p>
        <h3 className="text-xl font-bold text-white leading-snug mb-2">{item.name}</h3>
        <p className="text-sm font-bold mb-6" style={{ color: '#F59E0B' }}>{item.price}</p>
        <p className="text-sm leading-relaxed mt-auto" style={{ color: '#A8C5C3', borderTop: '1px solid rgba(168,197,195,0.1)', paddingTop: 16 }}>
          {item.desc}
        </p>
      </div>
    </motion.div>
  )
}

const LAYERS: Layer[] = [
  {
    num: '01',
    name: 'Decisive Engine',
    price: '$1,000 / mo',
    tag: 'Infrastructure',
    desc: 'Content delivery under 50ms. One API replaces your CDN contracts. 20% TCO reduction from day one.',
  },
  {
    num: '02',
    name: 'AI Q&A Widget',
    price: '$5,000 / mo',
    tag: 'AI Layer',
    desc: '$0.10 per article vs $250 human cost. Every article becomes an active intent capture point.',
  },
  {
    num: '03',
    name: 'Full Conversation CPL',
    price: 'Revenue share',
    tag: 'Monetization',
    desc: 'Strong-intent readers matched to brand partners. CPL revenue from content you already own.',
  },
]

export function LayerOverview() {
  return (
    <section className="section-dark py-20 lg:py-28 relative overflow-hidden">
      {/* Background glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse 900px 500px at 50% 50%, rgba(34,93,89,0.18) 0%, transparent 70%)' }}
      />

      <div className="max-w-5xl mx-auto px-6 relative z-10">
        {/* Header */}
        <motion.div
          className="text-center mb-14"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.5 }}
        >
          <span className="inline-block text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: '#A8C5C3' }}>
            Product Suite
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Three layers. One integration.</h2>
          <p className="text-base max-w-lg mx-auto" style={{ color: '#A8C5C3' }}>
            Start with infrastructure. Add AI. Unlock monetization. Each layer compounds the last.
          </p>
        </motion.div>

        {/* Layer cards */}
        <div className="grid md:grid-cols-3 gap-5">
          {LAYERS.map((item, i) => (
            <LayerCard key={item.num} item={item} i={i} />
          ))}
        </div>

        {/* Bottom note */}
        <motion.p
          className="text-center text-xs mt-10"
          style={{ color: 'rgba(168,197,195,0.5)' }}
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          Start with any layer. Add the next when ready.
        </motion.p>
      </div>
    </section>
  )
}
