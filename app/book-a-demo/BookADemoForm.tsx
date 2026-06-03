'use client'

import { useEffect, useRef, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle, ChevronDown, Search } from 'lucide-react'
import { allCountries } from 'country-telephone-data'
import { trackAG } from '@/lib/analytics'

function isoToFlag(iso2: string) {
  return iso2.toUpperCase().replace(/./g, c =>
    String.fromCodePoint(c.charCodeAt(0) + 0x1F1A5)
  )
}

interface Country { name: string; iso2: string; dialCode: string }
const COUNTRIES: Country[] = (allCountries as Country[]).filter(c => c.dialCode)

const inputCls = 'w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-[#225D59] transition-colors'
const labelCls = 'block text-xs font-medium text-gray-600 mb-1'

function CountryCodePicker({ value, onChange }: { value: Country; onChange: (c: Country) => void }) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const containerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const filtered = query.trim()
    ? COUNTRIES.filter(c =>
        c.name.toLowerCase().includes(query.toLowerCase()) ||
        c.dialCode.includes(query) ||
        c.iso2.toLowerCase().includes(query.toLowerCase())
      )
    : COUNTRIES

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 50)
    else setQuery('')
  }, [open])

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  return (
    <div ref={containerRef} className="relative flex-shrink-0">
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="flex items-center gap-1 px-2 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-[#225D59] transition-colors bg-white whitespace-nowrap"
        style={{ minWidth: 90 }}
      >
        <span>{isoToFlag(value.iso2)}</span>
        <span className="text-gray-700">+{value.dialCode}</span>
        <ChevronDown size={12} className="text-gray-400 ml-0.5" />
      </button>
      {open && (
        <div className="absolute left-0 top-full mt-1 z-50 bg-white border border-gray-200 rounded-xl shadow-xl overflow-hidden" style={{ width: 260 }}>
          <div className="p-2 border-b border-gray-100 flex items-center gap-2">
            <Search size={13} className="text-gray-400 flex-shrink-0" />
            <input ref={inputRef} value={query} onChange={e => setQuery(e.target.value)}
              placeholder="Search country or code..."
              className="flex-1 text-sm outline-none text-gray-700 placeholder-gray-400" />
          </div>
          <div className="overflow-y-auto" style={{ maxHeight: 220 }}>
            {filtered.length === 0 ? (
              <p className="px-3 py-3 text-xs text-gray-400 text-center">No results</p>
            ) : filtered.map(c => (
              <button key={`${c.iso2}-${c.dialCode}`} type="button"
                onClick={() => { onChange(c); setOpen(false) }}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-sm hover:bg-gray-50 transition-colors text-left"
                style={{ background: c.iso2 === value.iso2 ? 'rgba(34,93,89,0.06)' : undefined }}
              >
                <span className="flex-shrink-0 text-base">{isoToFlag(c.iso2)}</span>
                <span className="flex-1 text-gray-700 truncate">{c.name.replace(/\s*\(.*?\)\s*/g, '').trim()}</span>
                <span className="text-gray-400 text-xs flex-shrink-0">+{c.dialCode}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export function BookADemoForm() {
  const searchParams = useSearchParams()
  const [submitted, setSubmitted] = useState(false)
  const [selectedCountry, setSelectedCountry] = useState<Country>(
    COUNTRIES.find(c => c.iso2 === 'tw') ?? COUNTRIES[0]
  )
  const [form, setForm] = useState({
    firstName: '', lastName: '',
    email: '', phone: '',
    company: '', website: searchParams.get('website') ?? '',
  })
  const openTimeRef = useRef<number>(Date.now())

  useEffect(() => { openTimeRef.current = Date.now() }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    try {
      await fetch(
        'https://api.hsforms.com/submissions/v3/integration/submit/4284310/b9751670-5043-401f-b789-22ef2d735f89',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            fields: [
              { name: 'firstname', value: form.firstName },
              { name: 'lastname', value: form.lastName },
              { name: 'email', value: form.email },
              { name: 'phone', value: `+${selectedCountry.dialCode} ${form.phone}`.trim() },
              { name: 'company', value: form.company },
              { name: 'website', value: form.website },
            ],
            context: {
              pageUri: window.location.href,
              pageName: 'Book a Demo',
            },
          }),
        }
      )
    } catch (err) {
      console.error('[HubSpot] submit error', err)
    }
    setSubmitted(true)
    trackAG('contact_form_submit', {
      page_audience: 'book_a_demo',
      time_to_submit_ms: Date.now() - openTimeRef.current,
    })
  }

  const set = (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm(p => ({ ...p, [field]: e.target.value }))

  return (
    <AnimatePresence mode="wait">
      {submitted ? (
        <motion.div
          key="success"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center text-center py-16 gap-4"
        >
          <div className="w-16 h-16 rounded-full flex items-center justify-center" style={{ background: 'rgba(34,93,89,0.1)' }}>
            <CheckCircle size={32} style={{ color: '#225D59' }} />
          </div>
          <div>
            <p className="text-xl font-semibold text-gray-900">Request received.</p>
            <p className="text-sm text-gray-500 mt-1">We'll get back to you as soon as possible.</p>
          </div>
        </motion.div>
      ) : (
        <motion.form key="form" onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>First Name *</label>
              <input required value={form.firstName} onChange={set('firstName')} className={inputCls} placeholder="Jane" />
            </div>
            <div>
              <label className={labelCls}>Last Name *</label>
              <input required value={form.lastName} onChange={set('lastName')} className={inputCls} placeholder="Smith" />
            </div>
          </div>
          <div>
            <label className={labelCls}>Email *</label>
            <input required type="email" value={form.email} onChange={set('email')} className={inputCls} placeholder="jane@company.com" />
          </div>
          <div>
            <label className={labelCls}>Phone</label>
            <div className="flex gap-2">
              <CountryCodePicker value={selectedCountry} onChange={setSelectedCountry} />
              <input type="tel" value={form.phone} onChange={set('phone')} className={inputCls} placeholder="" />
            </div>
          </div>
          <div>
            <label className={labelCls}>Company *</label>
            <input required value={form.company} onChange={set('company')} className={inputCls} placeholder="Your company name" />
          </div>
          <div>
            <label className={labelCls}>Website *</label>
            <input required value={form.website} onChange={set('website')} className={inputCls} placeholder="https://example.com" />
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
  )
}
