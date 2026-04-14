'use client'

import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, CheckCircle } from 'lucide-react'
import { useContactModal } from '@/context/contact-modal-context'

export function ContactModal() {
  const { isOpen, close } = useContactModal()
  const [submitted, setSubmitted] = useState(false)
  const [form, setForm] = useState({ name: '', company: '', role: 'publisher', website: '', message: '' })
  const overlayRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!isOpen) { setTimeout(() => setSubmitted(false), 400) }
  }, [isOpen])

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => { if (e.key === 'Escape') close() }
    if (isOpen) document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [isOpen, close])

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    console.log('[POC Request]', form)
    setSubmitted(true)
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          ref={overlayRef}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(26,61,58,0.7)', backdropFilter: 'blur(4px)' }}
          onClick={e => { if (e.target === overlayRef.current) close() }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 12 }}
            transition={{ duration: 0.22, ease: [0.23, 1, 0.32, 1] }}
            className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="px-6 pt-6 pb-4 border-b border-gray-100">
              <button
                onClick={close}
                className="absolute top-4 right-4 p-1.5 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
              >
                <X size={18} />
              </button>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold mb-3"
                style={{ background: 'rgba(34,93,89,0.1)', color: '#225D59' }}>
                Get a Personalized Demo
              </div>
              <h2 className="text-xl font-bold text-gray-900">Let's use your data to talk.</h2>
              <p className="text-sm text-gray-500 mt-1">We'll be in touch within 24 hours.</p>
            </div>

            {/* Body */}
            <div className="px-6 py-5">
              <AnimatePresence mode="wait">
                {submitted ? (
                  <motion.div
                    key="success"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex flex-col items-center text-center py-8 gap-4"
                  >
                    <div className="w-14 h-14 rounded-full flex items-center justify-center"
                      style={{ background: 'rgba(34,93,89,0.1)' }}>
                      <CheckCircle size={28} style={{ color: '#225D59' }} />
                    </div>
                    <div>
                      <p className="text-lg font-semibold text-gray-900">Request received.</p>
                      <p className="text-sm text-gray-500 mt-1">We'll be in touch within 24 hours with a tailored POC proposal.</p>
                    </div>
                    <button
                      onClick={close}
                      className="mt-2 px-6 py-2 rounded-full text-sm font-medium text-white"
                      style={{ background: '#225D59' }}
                    >
                      Close
                    </button>
                  </motion.div>
                ) : (
                  <motion.form key="form" onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Name *</label>
                        <input
                          required
                          value={form.name}
                          onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                          className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-[#225D59] transition-colors"
                          placeholder="Jane Smith"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Company *</label>
                        <input
                          required
                          value={form.company}
                          onChange={e => setForm(p => ({ ...p, company: e.target.value }))}
                          className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-[#225D59] transition-colors"
                          placeholder="Acme Media"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">I am a...</label>
                        <select
                          value={form.role}
                          onChange={e => setForm(p => ({ ...p, role: e.target.value }))}
                          className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-[#225D59] transition-colors bg-white"
                        >
                          <option value="publisher">Content Owner / Media</option>
                          <option value="brand">Brand / Advertiser</option>
                          <option value="developer">Developer / Tech</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Website</label>
                        <input
                          value={form.website}
                          onChange={e => setForm(p => ({ ...p, website: e.target.value }))}
                          className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-[#225D59] transition-colors"
                          placeholder="https://example.com"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">What do you want to solve?</label>
                      <textarea
                        rows={3}
                        value={form.message}
                        onChange={e => setForm(p => ({ ...p, message: e.target.value }))}
                        className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-[#225D59] transition-colors resize-none"
                        placeholder="Tell us about your current setup and what you're hoping to achieve..."
                      />
                    </div>
                    <button
                      type="submit"
                      className="w-full py-3 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90 active:scale-[0.98]"
                      style={{ background: '#225D59' }}
                    >
                      Get a Personalized Demo
                    </button>
                  </motion.form>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
