'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { simulateAudience } from '@/lib/calculator-data'
import { NumberTicker } from '@/components/ui/NumberTicker'
import { useContactModal } from '@/context/contact-modal-context'

type AgeRange = '25-34' | '35-44' | '45-54' | '55+'
type BehaviorTag = 'researching' | 'comparing' | 'ready'
type InterestCategory = 'finance' | 'insurance' | 'health' | 'tech'

const AGES: { label: string; value: AgeRange }[] = [
  { label: '25–34', value: '25-34' },
  { label: '35–44', value: '35-44' },
  { label: '45–54', value: '45-54' },
  { label: '55+', value: '55+' },
]
const BEHAVIORS: { label: string; value: BehaviorTag; desc: string }[] = [
  { label: 'Researching', value: 'researching', desc: 'Exploring options' },
  { label: 'Comparing', value: 'comparing', desc: 'Evaluating choices' },
  { label: 'Ready to buy', value: 'ready', desc: 'Decision-ready' },
]
const INTERESTS: { label: string; value: InterestCategory }[] = [
  { label: 'Finance & Investing', value: 'finance' },
  { label: 'Insurance', value: 'insurance' },
  { label: 'Health & Medical', value: 'health' },
  { label: 'Software & Tech', value: 'tech' },
]

export function AudienceSimulator() {
  const [age, setAge] = useState<AgeRange>('35-44')
  const [behavior, setBehavior] = useState<BehaviorTag>('comparing')
  const [interest, setInterest] = useState<InterestCategory>('finance')
  const [simulated, setSimulated] = useState(false)
  const { open } = useContactModal()

  const result = simulated ? simulateAudience(age, behavior, interest) : null

  return (
    <section className="section-light py-16">
      <div className="max-w-3xl mx-auto px-6">
        <div className="text-center mb-10">
          <span className="inline-block text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: '#225D59' }}>
            Audience Snapshot Simulator
          </span>
          <h2 className="text-2xl md:text-3xl font-bold mb-2" style={{ color: '#1A1A1A' }}>
            Who's in our 4M WAU network?
          </h2>
          <p className="text-sm" style={{ color: '#6B6B6B' }}>
            Define your target audience and see how many match in our network right now.
          </p>
        </div>

        <div className="bg-white rounded-2xl border p-6 space-y-6" style={{ borderColor: '#E5E5E5' }}>
          {/* Age */}
          <div>
            <label className="block text-sm font-semibold mb-3" style={{ color: '#1A1A1A' }}>Target Age Range</label>
            <div className="flex gap-2 flex-wrap">
              {AGES.map(a => (
                <button
                  key={a.value}
                  onClick={() => { setAge(a.value); setSimulated(false) }}
                  className="px-4 py-2 rounded-full text-sm font-medium transition-all"
                  style={age === a.value
                    ? { background: '#225D59', color: 'white' }
                    : { background: '#FAFAFA', color: '#6B6B6B', border: '1px solid #E5E5E5' }
                  }
                >
                  {a.label}
                </button>
              ))}
            </div>
          </div>

          {/* Behavior */}
          <div>
            <label className="block text-sm font-semibold mb-3" style={{ color: '#1A1A1A' }}>Buying Behavior</label>
            <div className="grid grid-cols-3 gap-2">
              {BEHAVIORS.map(b => (
                <button
                  key={b.value}
                  onClick={() => { setBehavior(b.value); setSimulated(false) }}
                  className="p-3 rounded-xl text-left transition-all"
                  style={behavior === b.value
                    ? { background: '#225D59', color: 'white', border: '1px solid #225D59' }
                    : { background: '#FAFAFA', color: '#6B6B6B', border: '1px solid #E5E5E5' }
                  }
                >
                  <p className="text-sm font-semibold">{b.label}</p>
                  <p className={`text-[10px] ${behavior === b.value ? 'text-white/70' : 'text-gray-400'}`}>{b.desc}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Interest */}
          <div>
            <label className="block text-sm font-semibold mb-3" style={{ color: '#1A1A1A' }}>Interest Category</label>
            <div className="grid grid-cols-2 gap-2">
              {INTERESTS.map(int => (
                <button
                  key={int.value}
                  onClick={() => { setInterest(int.value); setSimulated(false) }}
                  className="px-4 py-2.5 rounded-xl text-sm font-medium transition-all text-left"
                  style={interest === int.value
                    ? { background: '#225D59', color: 'white' }
                    : { background: '#FAFAFA', color: '#6B6B6B', border: '1px solid #E5E5E5' }
                  }
                >
                  {int.label}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={() => setSimulated(true)}
            className="w-full py-3 rounded-xl text-sm font-semibold transition-all hover:bg-[rgba(34,93,89,0.08)] active:scale-[0.98]"
            style={{ color: '#225D59', border: '1.5px solid #225D59', background: 'transparent' }}
          >
            Show my audience snapshot
          </button>

          <AnimatePresence>
            {result && (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4 pt-2 border-t"
                style={{ borderColor: '#E5E5E5' }}
              >
                <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: '#9B9B9B' }}>Audience snapshot</p>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  <div className="p-4 rounded-xl text-center" style={{ background: 'rgba(34,93,89,0.06)', border: '1px solid rgba(34,93,89,0.15)' }}>
                    <p className="text-[10px] uppercase tracking-wider mb-1" style={{ color: '#9B9B9B' }}>Matching users/week</p>
                    <p className="text-2xl font-bold" style={{ color: '#225D59' }}>
                      <NumberTicker value={result.matchingUsers} duration={1000} formatter={v => v.toLocaleString()} />
                    </p>
                  </div>
                  <div className="p-4 rounded-xl text-center" style={{ background: '#FAFAFA', border: '1px solid #E5E5E5' }}>
                    <p className="text-[10px] uppercase tracking-wider mb-1" style={{ color: '#9B9B9B' }}>CPL estimate</p>
                    <p className="text-2xl font-bold" style={{ color: '#F59E0B' }}>
                      $<NumberTicker value={result.cpl} duration={900} />
                    </p>
                  </div>
                  <div className="p-4 rounded-xl text-center" style={{ background: '#FAFAFA', border: '1px solid #E5E5E5' }}>
                    <p className="text-[10px] uppercase tracking-wider mb-1" style={{ color: '#9B9B9B' }}>Intent confidence</p>
                    <p className="text-2xl font-bold" style={{ color: '#225D59' }}>
                      <NumberTicker value={Math.round(result.confidence * 100)} duration={900} suffix="%" />
                    </p>
                  </div>
                </div>

                <div>
                  <p className="text-xs font-semibold mb-2" style={{ color: '#9B9B9B' }}>Primary platforms</p>
                  <div className="flex flex-wrap gap-2">
                    {result.platforms.map(p => (
                      <span key={p} className="text-xs px-2.5 py-1 rounded-full" style={{ background: 'rgba(34,93,89,0.08)', color: '#225D59' }}>
                        {p}
                      </span>
                    ))}
                  </div>
                </div>

                <button onClick={open} className="w-full py-3 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90 active:scale-[0.98]" style={{ background: '#225D59', border: '1.5px solid transparent' }}>
                  Validate with your real data
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  )
}
