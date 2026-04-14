'use client'

import { useContactModal } from '@/context/contact-modal-context'

export function PublisherPageCTA() {
  const { open } = useContactModal()
  return (
    <section className="section-dark py-16 text-center">
      <div className="max-w-2xl mx-auto px-6">
        <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">
          Want to see your site's real intent data?
        </h2>
        <p className="text-base mb-8" style={{ color: '#A8C5C3' }}>
          Paste your article. We'll run a real analysis and show you what intent signals are leaving your site uncaptured.
        </p>
        <button
          onClick={open}
          className="px-8 py-3.5 rounded-full text-sm font-semibold text-[#225D59] bg-white hover:bg-gray-100 transition-all active:scale-[0.98]"
        >
          Get a Personalized Demo
        </button>
      </div>
    </section>
  )
}
