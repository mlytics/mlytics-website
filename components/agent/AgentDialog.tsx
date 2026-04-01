'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { type AgentStep, type AgentPersona } from '@/lib/agent-data'
import { useAgent } from '@/lib/agent-context'
import { ArticleScanDemo } from './ArticleScanDemo'
import { useContactModal } from '@/context/contact-modal-context'

interface AgentDialogProps {
  flow: AgentStep[]
  onComplete?: (persona: AgentPersona) => void
  variant?: 'hero' | 'page'
}

type HistoryItem = { role: 'agent' | 'user'; text: string }

export function AgentDialog({ flow, onComplete, variant = 'hero' }: AgentDialogProps) {
  const { persona, setPersona, addHistory, setHeroCompleted } = useAgent()
  const { open: openContact } = useContactModal()
  const router = useRouter()

  const [stepIdx, setStepIdx] = useState(0)
  const [history, setHistory] = useState<HistoryItem[]>([])
  const [typing, setTyping] = useState(false)
  const [displayedText, setDisplayedText] = useState('')
  const [showInput, setShowInput] = useState(false)
  const [urlInput, setUrlInput] = useState('')
  const [showUrlInput, setShowUrlInput] = useState(false)
  const [demoComplete, setDemoComplete] = useState(false)
  const [dynamicMaxH, setDynamicMaxH] = useState<string>('calc(100vh - 280px)')
  const historyEndRef = useRef<HTMLDivElement>(null)
  const scrollBodyRef = useRef<HTMLDivElement>(null)
  const dialogRef = useRef<HTMLDivElement>(null)

  const currentStep = flow[stepIdx]
  const isDark = variant === 'hero'

  // Resolve agent message (handle personalized)
  function resolveMessage(step: AgentStep): string {
    if (step.personalizedMessages && persona) {
      return step.personalizedMessages[persona] ?? step.agentMessage
    }
    return step.agentMessage
  }

  // Typewriter effect
  useEffect(() => {
    const msg = resolveMessage(currentStep)
    if (!msg) { setDisplayedText(''); setShowInput(true); return }
    setTyping(true)
    setShowInput(false)
    setDisplayedText('')
    let i = 0
    const interval = setInterval(() => {
      i++
      setDisplayedText(msg.slice(0, i))
      if (i >= msg.length) {
        clearInterval(interval)
        setTyping(false)
        setShowInput(true)
      }
    }, 18)
    return () => clearInterval(interval)
  }, [stepIdx]) // eslint-disable-line react-hooks/exhaustive-deps

  function scrollToBottom() {
    const body = scrollBodyRef.current
    if (body) body.scrollTo({ top: body.scrollHeight, behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [history, displayedText]) // eslint-disable-line react-hooks/exhaustive-deps

  // Reset demo state when step changes
  useEffect(() => {
    setDemoComplete(false)
  }, [stepIdx])

  // Dynamically cap maxHeight so dialog never overflows the viewport bottom
  useEffect(() => {
    function update() {
      if (!dialogRef.current) return
      const rect = dialogRef.current.getBoundingClientRect()
      const available = window.innerHeight - rect.top - 24 // 24px bottom breathing room
      setDynamicMaxH(`${Math.max(220, Math.round(available))}px`)
    }
    update()
    window.addEventListener('resize', update)
    return () => window.removeEventListener('resize', update)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  function pushHistory(agentMsg: string, userMsg?: string) {
    setHistory(prev => [
      ...prev,
      { role: 'agent', text: agentMsg },
      ...(userMsg ? [{ role: 'user' as const, text: userMsg }] : []),
    ])
    if (agentMsg) addHistory({ role: 'agent', content: agentMsg })
    if (userMsg) addHistory({ role: 'user', content: userMsg })
  }

  function advance(userLabel: string, userValue: string) {
    const agentMsg = resolveMessage(currentStep)
    pushHistory(agentMsg, userLabel)

    // Step 1: persona selection
    if (currentStep.id === 'step1-persona') {
      setPersona(userValue as AgentPersona)
    }

    // Step 2: demo choice — custom URL
    if (currentStep.id === 'step2-demo-choice' && userValue === 'custom') {
      setShowUrlInput(true)
      return
    }

    // Step 5: CTA navigation
    if (currentStep.inputType === 'cta') {
      setHeroCompleted()
      if (userValue.startsWith('/')) router.push(userValue)
      return
    }

    const next = stepIdx + 1
    if (next < flow.length) {
      setStepIdx(next)
    } else {
      onComplete?.(persona)
    }
  }

  function handleUrlSubmit() {
    const url = urlInput.trim()
    if (!url) return
    pushHistory(resolveMessage(currentStep), url)
    // Custom URL → POC CTA
    setHistory(prev => [
      ...prev,
      { role: 'agent', text: "We'll run a real-time analysis on your article. Our team will use this as the starting point for your POC." },
    ])
    setShowUrlInput(false)
    setUrlInput('')
    setShowInput(false)
    setTimeout(() => openContact(), 400)
  }

  // CTA step: show persona-specific button
  const ctaStep = currentStep.inputType === 'cta'
  const ctaOption = currentStep.options?.find(o => {
    if (persona === 'publisher') return o.value === '/publishers'
    if (persona === 'brand') return o.value === '/brands'
    if (persona === 'developer') return o.value === '/developers'
    return false
  }) ?? currentStep.options?.[0]

  const borderColor = isDark ? 'rgba(34,93,89,0.7)' : '#E5E5E5'
  // Opaque dark-teal background at 88% so world-map dots don't bleed through text
  const bg = isDark ? 'rgba(18,46,44,0.88)' : 'rgba(255,255,255,0.97)'

  return (
    <div
      ref={dialogRef}
      className="w-full rounded-2xl overflow-hidden flex flex-col"
      style={{
        maxHeight: dynamicMaxH,
        border: `1.5px solid ${borderColor}`,
        background: bg,
        // Frosted-glass layer for depth without losing the dot-map atmosphere
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        // Layered shadow: subtle ambient + deeper drop for "float" feel
        boxShadow: isDark
          ? '0 2px 0 rgba(168,197,195,0.08) inset, 0 12px 48px rgba(0,0,0,0.55), 0 0 0 1px rgba(34,93,89,0.25)'
          : '0 4px 24px rgba(0,0,0,0.10)',
      }}
    >
      {/* Header — pinned, never scrolls */}
      <div
        className="flex-shrink-0 flex items-center justify-between px-4 py-3 border-b"
        style={{ borderColor, background: isDark ? 'rgba(34,93,89,0.45)' : '#225D59' }}
      >
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse" />
          <span className="text-xs font-semibold tracking-widest uppercase text-white">Decision Engine</span>
        </div>
        <span className="text-xs font-medium text-white/60">LIVE</span>
      </div>

      {/* Scrollable body — grows up to maxHeight, never pushes page scrollbar */}
      <div ref={scrollBodyRef} className="flex-1 overflow-y-auto min-h-0">

        {/* Conversation history */}
        {history.length > 0 && (
          <div className="px-4 pt-3 pb-1 space-y-2">
            {history.map((item, i) => (
              <div key={i} className={`flex ${item.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div
                  className="max-w-[85%] rounded-xl px-3 py-2 text-xs leading-relaxed"
                  style={item.role === 'agent'
                    ? { background: isDark ? 'rgba(34,93,89,0.3)' : 'rgba(34,93,89,0.08)', color: isDark ? '#A8C5C3' : '#225D59' }
                    : { background: '#225D59', color: 'white' }
                  }
                >
                  {item.text}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Current agent message */}
        <div className="px-4 pt-3 pb-2">
          <div
            className="rounded-xl px-3 py-2.5 text-sm leading-relaxed"
            style={{ background: isDark ? 'rgba(34,93,89,0.25)' : 'rgba(34,93,89,0.06)', color: isDark ? '#FAFAFA' : '#1A1A1A' }}
          >
            {displayedText.split('\n').map((line, i) => (
              <span key={i}>{line}{i < displayedText.split('\n').length - 1 && <br />}</span>
            ))}
            {typing && <span className="cursor-blink ml-0.5 opacity-70">|</span>}
          </div>
        </div>

        {/* Demo scan */}
        {currentStep.inputType === 'demo' && showInput && (
          <div className="px-4 pb-3 space-y-3">
            <ArticleScanDemo
              onProgress={scrollToBottom}
              onComplete={() => {
                setDemoComplete(true)
                setTimeout(scrollToBottom, 50)
              }}
            />
            {/* Continue button — appears after demo finishes, user must click to advance */}
            <AnimatePresence>
              {demoComplete && (
                <motion.button
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  onClick={() => {
                    const next = stepIdx + 1
                    if (next < flow.length) setStepIdx(next)
                    else onComplete?.(persona)
                  }}
                  className="w-full py-3 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90 active:scale-[0.98]"
                  style={{ background: '#225D59' }}
                >
                  See what this means for you →
                </motion.button>
              )}
            </AnimatePresence>
          </div>
        )}

        {/* URL input */}
        <AnimatePresence>
          {showUrlInput && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="px-4 pb-4">
              <div className="flex gap-2">
                <input
                  autoFocus
                  type="url"
                  value={urlInput}
                  onChange={e => setUrlInput(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') handleUrlSubmit() }}
                  placeholder="https://your-article-url.com/..."
                  className="flex-1 px-3 py-2 text-sm rounded-lg border focus:outline-none transition-colors"
                  style={{
                    borderColor: isDark ? 'rgba(34,93,89,0.5)' : '#E5E5E5',
                    background: isDark ? 'rgba(255,255,255,0.06)' : 'white',
                    color: isDark ? '#FAFAFA' : '#1A1A1A',
                  }}
                />
                <button
                  onClick={handleUrlSubmit}
                  className="px-4 py-2 rounded-lg text-sm font-semibold text-white"
                  style={{ background: '#225D59' }}
                >
                  Analyze
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Pill options */}
        {showInput && currentStep.inputType === 'pills' && !showUrlInput && (
          <div className="px-4 pb-4 flex flex-wrap gap-2">
            {currentStep.options?.map(opt => (
              <button
                key={opt.value}
                onClick={() => advance(opt.label, opt.value)}
                className={isDark ? 'pill-btn pill-btn--dark' : 'pill-btn'}
              >
                {opt.label}
              </button>
            ))}
          </div>
        )}

        {/* CTA */}
        {showInput && ctaStep && ctaOption && !showUrlInput && (
          <div className="px-4 pb-4">
            <button
              onClick={() => advance(ctaOption.label, ctaOption.value)}
              className="w-full py-3 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90 active:scale-[0.98]"
              style={{ background: '#225D59' }}
            >
              {ctaOption.label} →
            </button>
          </div>
        )}

        {/* Auto-scroll anchor — always at the very bottom of content */}
        <div ref={historyEndRef} />
      </div>
    </div>
  )
}
