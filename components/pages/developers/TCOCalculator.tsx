'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { calculateTCO } from '@/lib/calculator-data'
import { NumberTicker } from '@/components/ui/NumberTicker'
import { useContactModal } from '@/context/contact-modal-context'

const CDN_PRESETS = [
  { label: '$500/mo', value: 500 },
  { label: '$2,000/mo', value: 2000 },
  { label: '$5,000/mo', value: 5000 },
  { label: '$10,000/mo', value: 10000 },
]

export function TCOCalculator() {
  const [cdnCost, setCdnCost] = useState(2000)
  const [inputVal, setInputVal] = useState('')
  const [calculated, setCalculated] = useState(false)
  const { open } = useContactModal()

  const result = calculated ? calculateTCO(cdnCost) : null

  function handleCalculate() {
    const custom = parseInt(inputVal.replace(/[$,]/g, ''), 10)
    if (!isNaN(custom) && custom > 0) setCdnCost(custom)
    setCalculated(true)
  }

  return (
    <section className="section-light py-16">
      <div className="max-w-3xl mx-auto px-6">
        <div className="text-center mb-10">
          <span className="inline-block text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: '#225D59' }}>
            TCO Calculator
          </span>
          <h2 className="text-2xl md:text-3xl font-bold mb-2" style={{ color: '#1A1A1A' }}>
            Calculate your infrastructure savings
          </h2>
          <p className="text-sm" style={{ color: '#6B6B6B' }}>
            30 seconds to a number you can bring to your engineering manager.
          </p>
        </div>

        <div className="bg-white rounded-2xl border p-6 space-y-6" style={{ borderColor: '#E5E5E5' }}>
          <div>
            <label className="block text-sm font-semibold mb-3" style={{ color: '#1A1A1A' }}>Current monthly CDN spend</label>
            <div className="flex flex-wrap gap-2 mb-3">
              {CDN_PRESETS.map(p => (
                <button
                  key={p.value}
                  onClick={() => { setCdnCost(p.value); setInputVal(''); setCalculated(false) }}
                  className="px-4 py-2 rounded-full text-sm font-medium transition-all"
                  style={cdnCost === p.value && !inputVal
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
              placeholder="Or enter custom amount, e.g. $8,000"
              value={inputVal}
              onChange={e => { setInputVal(e.target.value); setCalculated(false) }}
              className="w-full px-3 py-2 text-sm rounded-lg border focus:outline-none transition-colors"
              style={{ borderColor: '#E5E5E5' }}
            />
          </div>

          <button
            onClick={handleCalculate}
            className="w-full py-3 rounded-xl text-sm font-semibold transition-all hover:bg-[rgba(34,93,89,0.08)] active:scale-[0.98]"
            style={{ color: '#225D59', border: '1.5px solid #225D59', background: 'transparent' }}
          >
            Calculate my savings
          </button>

          <AnimatePresence>
            {result && (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4 pt-2 border-t"
                style={{ borderColor: '#E5E5E5' }}
              >
                <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: '#9B9B9B' }}>Your TCO estimate</p>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {[
                    { label: 'Monthly savings', value: result.monthlySavings, prefix: '$', suffix: '' },
                    { label: 'Annual savings', value: result.annualSavings, prefix: '$', suffix: '' },
                    { label: 'P99 latency', display: result.latencyReduction },
                    { label: 'Break-even', display: result.breakEvenMonths > 12 ? 'Immediate' : `${result.breakEvenMonths} month${result.breakEvenMonths > 1 ? 's' : ''}` },
                  ].map((item, i) => (
                    <div key={i} className="p-3 rounded-xl text-center" style={{ background: '#FAFAFA', border: '1px solid #E5E5E5' }}>
                      <p className="text-[10px] uppercase tracking-wider mb-1" style={{ color: '#9B9B9B' }}>{item.label}</p>
                      <p className="text-xl font-bold" style={{ color: '#225D59' }}>
                        {'value' in item ? (
                          <NumberTicker value={item.value ?? 0} prefix={item.prefix} suffix={item.suffix} duration={900} />
                        ) : item.display}
                      </p>
                    </div>
                  ))}
                </div>

                {result.monthlySavings > 0 && (
                  <div className="p-4 rounded-xl" style={{ background: 'rgba(34,93,89,0.06)', border: '1px solid rgba(34,93,89,0.15)' }}>
                    <p className="text-sm font-medium" style={{ color: '#225D59' }}>
                      Decisive Engine costs <strong>$1,000/month</strong>. At your current CDN spend of ${cdnCost.toLocaleString()}, the 20% savings cover the fee and leave you <strong>${result.monthlySavings.toLocaleString()}/month</strong> ahead — plus P99 latency under 50ms.
                    </p>
                  </div>
                )}

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
