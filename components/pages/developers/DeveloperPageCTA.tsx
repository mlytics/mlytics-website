'use client'

import { useContactModal } from '@/context/contact-modal-context'

export function DeveloperPageCTA() {
  const { open } = useContactModal()
  return (
    <section className="section-dark py-16 text-center" style={{ background: '#1A3D3A' }}>
      <div className="max-w-2xl mx-auto px-6">
        <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">
          Want to check compatibility with your current architecture?
        </h2>
        <p className="text-base mb-8" style={{ color: '#A8C5C3' }}>
          We'll schedule a technical evaluation — architecture review, compatibility check, and a realistic savings estimate.
        </p>
        <button
          onClick={open}
          className="px-8 py-3.5 rounded-full text-sm font-semibold text-white transition-all hover:opacity-90 active:scale-[0.98]"
          style={{ background: '#225D59' }}
        >
          Get a Personalized Demo
        </button>
      </div>
    </section>
  )
}
