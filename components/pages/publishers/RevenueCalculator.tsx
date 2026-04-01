'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { calculatePublisherRevenue } from '@/lib/calculator-data'
import { NumberTicker } from '@/components/ui/NumberTicker'
import { useContactModal } from '@/context/contact-modal-context'

const PV_PRESETS = [
  { label: '100K', value: 100_000 },
  { label: '500K', value: 500_000 },
  { label: '1M', value: 1_000_000 },
  { label: '5M', value: 5_000_000 },
]

const CONTENT_TYPES = [
  { label: 'Finance & Investment', value: 'finance' },
  { label: 'Health & Medical', value: 'health' },
  { label: 'News & Information', value: 'news' },
  { label: 'Lifestyle', value: 'lifestyle' },
]

type ContentType = 'finance' | 'health' | 'news' | 'lifestyle'

export function RevenueCalculator() {
  const [pv, setPv] = useState<number>(500_000)
  const [pvInput, setPvInput] = useState('')
  const [contentType, setContentType] = useState<ContentType>('finance')
  const [calculated, setCalculated] = useState(false)
  const { open } = useContactModal()

  const result = calculated ? calculatePublisherRevenue(pv, contentType) : null

  function handleCalculate() {
    const custom = parseInt(pvInput.replace(/,/g, ''), 10)
    if (!isNaN(custom) && custom > 0) setPv(custom)
    setCalculated(true)
  }

  return (
    <section className="section-light py-16">
      <div className="max-w-3xl mx-auto px-6">
        <div className="text-center mb-10">
          <span className="inline-block text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: '#225D59' }}>
            Revenue Potential Calculator
          </span>
          <h2 className="text-2xl md:text-3xl font-bold mb-2" style={{ color: '#1A1A1A' }}>
            How much can your site earn?
          </h2>
          <p className="text-sm" style={{ color: '#6B6B6B' }}>
            Enter your monthly traffic and content type to get an estimate.
          </p>
        </div>

        <div className="bg-white rounded-2xl border p-6 space-y-6" style={{ borderColor: '#E5E5E5' }}>
          {/* Monthly PV */}
          <div>
            <label className="block text-sm font-semibold mb-3" style={{ color: '#1A1A1A' }}>Monthly Page Views</label>
            <div className="flex flex-wrap gap-2 mb-3">
              {PV_PRESETS.map(p => (
                <button
                  key={p.value}
                  onClick={() => { setPv(p.value); setPvInput(''); setCalculated(false) }}
                  className="px-4 py-2 rounded-full text-sm font-medium transition-all"
                  style={pv === p.value && !pvInput
                    ? { background: '#225D59', color: 'white' }
                    : { background: '#FAFAFA', color: '#6B6B6B', border: '1px solid #E5E5E5' }
                  }
                >
                  {p.label}
                </button>
              ))}
            </div>
            <input
              type="text"
              placeholder="Or enter custom number..."
              value={pvInput}
              onChange={e => { setPvInput(e.target.value); setCalculated(false) }}
              className="w-full px-3 py-2 text-sm rounded-lg border focus:outline-none transition-colors"
              style={{ borderColor: '#E5E5E5' }}
            />
          </div>

          {/* Content type */}
          <div>
            <label className="block text-sm font-semibold mb-3" style={{ color: '#1A1A1A' }}>Content Type</label>
            <div className="grid grid-cols-2 gap-2">
              {CONTENT_TYPES.map(ct => (
                <button
                  key={ct.value}
                  onClick={() => { setContentType(ct.value as ContentType); setCalculated(false) }}
                  className="px-4 py-2.5 rounded-xl text-sm font-medium transition-all text-left"
                  style={contentType === ct.value
                    ? { background: '#225D59', color: 'white' }
                    : { background: '#FAFAFA', color: '#6B6B6B', border: '1px solid #E5E5E5' }
                  }
                >
                  {ct.label}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={handleCalculate}
            className="w-full py-3 rounded-xl text-sm font-semibold transition-all hover:bg-[rgba(34,93,89,0.08)] active:scale-[0.98]"
            style={{ color: '#225D59', border: '1.5px solid #225D59', background: 'transparent' }}
          >
            Calculate my revenue potential
          </button>

          {/* Results */}
          <AnimatePresence>
            {result && (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4 pt-2 border-t"
                style={{ borderColor: '#E5E5E5' }}
              >
                <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: '#9B9B9B' }}>Estimated results</p>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {[
                    { label: 'Intent signals/mo', value: result.intentSignals, prefix: '', suffix: '' },
                    { label: 'Qualified leads', value: result.strongIntentLeads, prefix: '', suffix: '' },
                    { label: 'CPL revenue', value: result.cplRevenue, prefix: '$', suffix: '' },
                    { label: 'vs. current CPM', value: result.cpmRevenue, prefix: '$', suffix: '' },
                  ].map((item, i) => (
                    <div key={i} className="p-3 rounded-xl text-center" style={{ background: '#FAFAFA', border: '1px solid #E5E5E5' }}>
                      <p className="text-[10px] uppercase tracking-wider mb-1" style={{ color: '#9B9B9B' }}>{item.label}</p>
                      <p className="text-xl font-bold" style={{ color: '#225D59' }}>
                        <NumberTicker value={item.value} prefix={item.prefix} suffix={item.suffix} duration={900} />
                      </p>
                    </div>
                  ))}
                </div>

                {result.upliftRatio > 0 && (
                  <div className="p-4 rounded-xl" style={{ background: 'rgba(34,93,89,0.06)', border: '1px solid rgba(34,93,89,0.15)' }}>
                    <p className="text-sm font-medium" style={{ color: '#225D59' }}>
                      Decision Engine CPL revenue is <strong>{result.upliftRatio}× higher</strong> than your estimated current CPM revenue.
                    </p>
                  </div>
                )}

                <button
                  onClick={open}
                  className="w-full py-3 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90 active:scale-[0.98]"
                  style={{ background: '#225D59', border: '1.5px solid transparent' }}
                >
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
