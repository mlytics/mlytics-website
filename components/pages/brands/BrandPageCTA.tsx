'use client'

import { useContactModal } from '@/context/contact-modal-context'

export function BrandPageCTA() {
  const { open } = useContactModal()
  return (
    <section className="py-16 text-center" style={{ background: '#F59E0B' }}>
      <div className="max-w-2xl mx-auto px-6">
        <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">
          Want to see your target audience in our network?
        </h2>
        <p className="text-base mb-8 text-white/80">
          We'll run a real audience snapshot using your ICP criteria against our live 4M WAU data.
        </p>
        <button
          onClick={open}
          className="px-8 py-3.5 rounded-full text-sm font-semibold bg-white text-[#225D59] hover:bg-gray-50 transition-all active:scale-[0.98]"
        >
          Get a Personalized Demo
        </button>
      </div>
    </section>
  )
}
