'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'

export function CortexLiveDemo() {
  const router = useRouter()
  const [value, setValue] = useState('')

  function handleSubmit() {
    const domain = value.trim()
    if (!domain) return
    router.push(`/book-a-demo?url=${encodeURIComponent(domain)}`)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1], delay: 0.3 }}
      className="flex items-center gap-2 bg-white border border-[#E5E5E5] rounded-full px-2 py-2 w-full max-w-lg mx-auto"
      style={{ boxShadow: '0 4px 20px rgba(0,0,0,0.07)' }}
    >
      <input
        type="text"
        value={value}
        onChange={e => setValue(e.target.value)}
        onKeyDown={e => e.key === 'Enter' && handleSubmit()}
        placeholder="yourbrand.com"
        autoComplete="off"
        className="flex-1 bg-transparent text-sm outline-none px-3 min-w-0"
        style={{ color: '#1A1A1A' }}
      />
      <button
        type="button"
        onClick={handleSubmit}
        className="flex-shrink-0 px-5 py-2 rounded-full text-sm font-semibold transition-all active:scale-[0.98] hover:opacity-90"
        style={{ background: '#225D59', color: 'white' }}
      >
        Check AI visibility
      </button>
    </motion.div>
  )
}
