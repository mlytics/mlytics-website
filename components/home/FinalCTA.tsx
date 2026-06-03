'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { trackCTA } from '@/lib/analytics'

export function FinalCTA() {
  const router = useRouter()
  const [website, setWebsite] = useState('')

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    trackCTA('Get Started', 'home_cta')
    router.push(`/book-a-demo${website ? `?website=${encodeURIComponent(website)}` : ''}`)
  }

  return (
    <section className="section-dark py-16 text-center">
      <div className="max-w-2xl mx-auto px-6">
        <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">
          What does Mlytics Cortex mean for your business?
        </h2>
        <p className="text-base mb-8" style={{ color: '#A8C5C3' }}>
          Paste your website. We'll use your actual data to run a real analysis — not a generic demo.
        </p>
        <form onSubmit={handleSubmit} className="flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-2 py-2 max-w-md mx-auto">
          <input
            type="url"
            value={website}
            onChange={e => setWebsite(e.target.value)}
            placeholder="https://your-website.com"
            className="flex-1 bg-transparent text-sm text-white placeholder-white/40 outline-none px-3 min-w-0"
          />
          <button
            type="submit"
            className="flex-shrink-0 px-5 py-2 rounded-full text-sm font-semibold text-[#225D59] bg-white hover:bg-gray-100 transition-all active:scale-[0.98]"
          >
            Get Started
          </button>
        </form>
      </div>
    </section>
  )
}
