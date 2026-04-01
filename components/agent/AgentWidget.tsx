'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MessageCircle, X, ChevronDown } from 'lucide-react'
import { useAgent } from '@/lib/agent-context'
import { useContactModal } from '@/context/contact-modal-context'
import { PUBLISHER_FLOW, BRAND_FLOW, DEVELOPER_FLOW } from '@/lib/agent-data'
import { AgentDialog } from './AgentDialog'

export function AgentWidget() {
  const { heroCompleted, persona } = useAgent()
  const { open: openContact } = useContactModal()
  const [open, setOpen] = useState(false)

  if (!heroCompleted) return null

  const flow = persona === 'publisher' ? PUBLISHER_FLOW
    : persona === 'brand' ? BRAND_FLOW
    : persona === 'developer' ? DEVELOPER_FLOW
    : null

  return (
    <div className="fixed bottom-6 right-6 z-40 flex flex-col items-end gap-3">
      <AnimatePresence>
        {open && flow && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 12 }}
            transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] }}
            className="w-[340px] max-h-[520px] overflow-y-auto rounded-2xl shadow-2xl"
            style={{ background: '#1A3D3A', border: '1.5px solid rgba(34,93,89,0.6)' }}
          >
            <div className="flex items-center justify-between px-4 py-3 border-b" style={{ borderColor: 'rgba(34,93,89,0.6)' }}>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                <span className="text-xs font-semibold text-white tracking-wider uppercase">Decision Engine</span>
              </div>
              <button onClick={() => setOpen(false)} className="text-[#A8C5C3] hover:text-white transition-colors">
                <ChevronDown size={16} />
              </button>
            </div>
            <div className="p-3">
              <AgentDialog flow={flow} variant="hero" />
            </div>
            <div className="px-4 pb-4 pt-1">
              <button
                onClick={() => { setOpen(false); openContact() }}
                className="w-full py-2.5 rounded-xl text-xs font-semibold text-white/80 border transition-colors"
                style={{ borderColor: 'rgba(34,93,89,0.5)' }}
              >
                Skip to POC discussion →
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        onClick={() => setOpen(v => !v)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="w-14 h-14 rounded-full shadow-xl flex items-center justify-center relative"
        style={{ background: '#225D59' }}
      >
        <AnimatePresence mode="wait">
          {open
            ? <motion.span key="x" initial={{ scale: 0.5 }} animate={{ scale: 1 }} exit={{ scale: 0.5 }}><X size={22} className="text-white" /></motion.span>
            : <motion.span key="chat" initial={{ scale: 0.5 }} animate={{ scale: 1 }} exit={{ scale: 0.5 }}><MessageCircle size={22} className="text-white" /></motion.span>
          }
        </AnimatePresence>
        {!open && (
          <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-amber-400 text-[9px] font-bold text-white flex items-center justify-center">1</span>
        )}
      </motion.button>
    </div>
  )
}
