'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { trackCTA } from '@/lib/analytics'

type SubmitStatus = 'idle' | 'loading' | 'success' | 'error'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

function validateEmail(value: string): string {
  if (!value) return 'Email is required.'
  if (!EMAIL_RE.test(value)) return 'Please enter a valid email address.'
  return ''
}

type InlineEmailCTAProps = {
  /** trackCTA position — keep the page's existing source string for analytics continuity */
  ctaLabel: string
  /** sent as HubSpot context.pageName so submissions are attributable per page */
  pageName: string
  className?: string
}

export function InlineEmailCTA({ ctaLabel, pageName, className }: InlineEmailCTAProps) {
  const [email, setEmail] = useState('')
  const [emailError, setEmailError] = useState('')
  const [status, setStatus] = useState<SubmitStatus>('idle')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const err = validateEmail(email)
    if (err) { setEmailError(err); return }
    setStatus('loading')
    try {
      const res = await fetch(
        'https://api.hsforms.com/submissions/v3/integration/submit/4284310/eacc7796-0d94-42fd-bc9b-4b31e9beb7b7',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            fields: [{ objectTypeId: '0-1', name: 'email', value: email }],
            context: { pageUri: window.location.href, pageName },
          }),
        }
      )
      if (!res.ok) throw new Error('HubSpot submission failed')
      trackCTA('Get Early Access', ctaLabel)
      setStatus('success')
    } catch {
      setStatus('error')
    }
  }

  if (status === 'success') {
    return (
      <div className={`relative flex flex-col items-center ${className ?? ''}`}>
        {/* Burst anchor — zero height, emojis fly out absolutely */}
        <div className="relative w-0 h-0" aria-hidden="true">
          {[
            { emoji: '🎉', x: -55, y: -55, r: -25 },
            { emoji: '✨', x: 50, y: -65, r: 15 },
            { emoji: '💫', x: -30, y: -75, r: -10 },
            { emoji: '🎊', x: 60, y: -35, r: 40 },
            { emoji: '⭐', x: -55, y: -25, r: -35 },
            { emoji: '🌟', x: 25, y: -80, r: 20 },
          ].map((p, i) => (
            <motion.span
              key={i}
              initial={{ opacity: 1, x: 0, y: 0, scale: 1 }}
              animate={{ opacity: 0, x: p.x, y: p.y, scale: 0.4, rotate: p.r }}
              transition={{ duration: 0.9, delay: i * 0.04, ease: 'easeOut' }}
              style={{ position: 'absolute', fontSize: '1.1rem', transform: 'translate(-50%, -50%)' }}
            >
              {p.emoji}
            </motion.span>
          ))}
          <motion.span
            initial={{ y: 0, opacity: 1, scale: 1 }}
            animate={{ y: -60, opacity: 0, scale: 0.7 }}
            transition={{ duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] }}
            style={{ position: 'absolute', fontSize: '2.4rem', transform: 'translate(-50%, -50%)' }}
          >
            ✉️
          </motion.span>
        </div>
        <motion.p
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35, duration: 0.4 }}
          className="text-sm font-medium text-primary"
        >
          You&apos;re on the list — we&apos;ll be in touch! 🎉
        </motion.p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} noValidate className={`flex flex-col items-center gap-2 w-full max-w-md ${className ?? ''}`}>
      <div className={`flex items-center w-full rounded-full border bg-white pl-5 pr-1 py-1 transition-colors focus-within:border-primary ${emailError ? 'border-red-400' : 'border-line'}`}>
        <input
          type="email"
          required
          value={email}
          onChange={e => { setEmail(e.target.value); if (emailError) setEmailError('') }}
          onBlur={() => setEmailError(validateEmail(email))}
          placeholder="Enter your email"
          aria-invalid={!!emailError}
          aria-describedby={emailError ? `${ctaLabel}-email-error` : undefined}
          className="flex-1 min-w-0 text-base md:text-sm outline-none bg-transparent py-2 text-ink placeholder:text-ink-subtle"
        />
        <button
          type="submit"
          disabled={status === 'loading'}
          className="shrink-0 px-4 md:px-5 py-2.5 rounded-full text-sm font-semibold transition-all hover:opacity-90 active:scale-[0.98] bg-primary text-white disabled:opacity-60 whitespace-nowrap"
        >
          {status === 'loading' ? 'Sending…' : (
            <>
              <span className="sm:hidden">Join Early</span>
              <span className="hidden sm:inline">Get Early Access</span>
            </>
          )}
        </button>
      </div>
      {emailError && (
        <p id={`${ctaLabel}-email-error`} className="text-xs text-red-500 self-start pl-4">
          {emailError}
        </p>
      )}
      {status === 'error' && !emailError && (
        <p className="text-xs text-red-500">
          Something went wrong — please try again.
        </p>
      )}
    </form>
  )
}
