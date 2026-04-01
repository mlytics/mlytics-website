'use client'

import { useContactModal } from '@/context/contact-modal-context'

export function FinalCTA() {
  const { open } = useContactModal()

  return (
    <section className="py-20 lg:py-28" style={{ background: '#225D59' }}>
      <div className="max-w-3xl mx-auto px-6 text-center">
        <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 leading-tight">
          What does Decision Engine mean for your business?
        </h2>
        <p className="text-base mb-8" style={{ color: 'rgba(255,255,255,0.7)' }}>
          Paste your website. We'll use your actual data to run a real analysis — not a generic demo.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={open}
            className="px-8 py-3.5 rounded-full text-sm font-semibold text-[#225D59] bg-white hover:bg-gray-50 transition-all active:scale-[0.98]"
          >
            See what the Decision Engine finds
          </button>
        </div>
      </div>
    </section>
  )
}
