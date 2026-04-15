'use client'

import { useState, useEffect, useRef, Fragment } from 'react'
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

type MessageItem = { role: 'agent' | 'user'; text: string; isTyping?: boolean }

export function AgentDialog({ flow, onComplete, variant = 'hero' }: AgentDialogProps) {
  const { persona, setPersona, addHistory, setHeroCompleted } = useAgent()
  const { open: openContact } = useContactModal()
  const router = useRouter()

  const [stepIdx, setStepIdx] = useState(0)
  const [messages, setMessages] = useState<MessageItem[]>([
    { role: 'agent', text: '', isTyping: true },
  ])
  const [showInput, setShowInput] = useState(false)
  const [urlInput, setUrlInput] = useState('')
  const [showUrlInput, setShowUrlInput] = useState(false)
  const [demoComplete, setDemoComplete] = useState(false)
  // demoVisible stays true once the demo starts — ArticleScanDemo is never unmounted
  const [demoVisible, setDemoVisible] = useState(false)
  // Index in messages[] after which ArticleScanDemo is inserted (fixed once set)
  const demoInsertAfterIdxRef = useRef(-1)
  // dynamicMaxH is used as maxHeight when idle, and as height+maxHeight when engaged
  const [dynamicMaxH, setDynamicMaxH] = useState<string>('60vh')
  const [engaged, setEngaged] = useState(false)

  const scrollBodyRef = useRef<HTMLDivElement>(null)
  const dialogRef = useRef<HTMLDivElement>(null)
  // Captures window.scrollY after scroll settles; used to detect upward scroll-away
  const engagedScrollYRef = useRef(0)
  // Tracks whether the previous render was engaged — lets us skip position recalc on un-engage
  const wasEngagedRef = useRef(false)

  const currentStep = flow[stepIdx]
  const isDark = variant === 'hero'

  function resolveMessage(step: AgentStep): string {
    if (step.personalizedMessages && persona) {
      return step.personalizedMessages[persona] ?? step.agentMessage
    }
    return step.agentMessage
  }

  // ── Typewriter: mutates the last message in-place ──────────────────────────

  useEffect(() => {
    const msg = resolveMessage(currentStep)
    setShowInput(false)

    if (!msg) {
      setMessages(prev => {
        const next = [...prev]
        next[next.length - 1] = { role: 'agent', text: '', isTyping: false }
        return next
      })
      setShowInput(true)
      return
    }

    let i = 0
    const interval = setInterval(() => {
      i++
      const done = i >= msg.length
      setMessages(prev => {
        const next = [...prev]
        next[next.length - 1] = { role: 'agent', text: msg.slice(0, i), isTyping: !done }
        return next
      })
      if (done) {
        clearInterval(interval)
        setShowInput(true)
        addHistory({ role: 'agent', content: msg })
      }
    }, 18)
    return () => clearInterval(interval)
  }, [stepIdx]) // eslint-disable-line react-hooks/exhaustive-deps

  // Auto-scroll the chat body to bottom on new content
  useEffect(() => {
    const body = scrollBodyRef.current
    if (body) body.scrollTo({ top: body.scrollHeight, behavior: 'smooth' })
  }, [messages, showInput])

  useEffect(() => {
    setDemoComplete(false)
  }, [stepIdx])

  // When the demo step's typewriter finishes (showInput becomes true on the demo step),
  // record the message index and mark the demo as permanently visible.
  useEffect(() => {
    if (currentStep.inputType === 'demo' && showInput && !demoVisible) {
      demoInsertAfterIdxRef.current = messages.length - 1
      setDemoVisible(true)
    }
  }, [showInput]) // eslint-disable-line react-hooks/exhaustive-deps

  // ── maxHeight / height management ─────────────────────────────────────────

  useEffect(() => {
    function update() {
      if (!dialogRef.current || engaged) return
      const rect = dialogRef.current.getBoundingClientRect()
      const available = window.innerHeight - rect.top - 24
      setDynamicMaxH(`${Math.max(220, Math.round(available))}px`)
    }
    // Only do the initial position calculation on mount, NOT when transitioning
    // from engaged→idle (the dialog is still at the top of the viewport at that
    // point, so rect.top would be ~80px and we'd compute a huge maxHeight again).
    if (!engaged && !wasEngagedRef.current) update()
    wasEngagedRef.current = engaged
    window.addEventListener('resize', update)
    return () => window.removeEventListener('resize', update)
  }, [engaged])

  function applyEngagedMaxH() {
    if (!dialogRef.current) return
    const rect = dialogRef.current.getBoundingClientRect()
    const avail = window.innerHeight - rect.top - 24
    setDynamicMaxH(`${Math.max(400, Math.round(avail))}px`)
    engagedScrollYRef.current = window.scrollY
  }

  function resetConversation() {
    setStepIdx(0)
    setMessages([{ role: 'agent', text: '', isTyping: true }])
    setShowInput(false)
    setShowUrlInput(false)
    setUrlInput('')
    setDemoComplete(false)
    setDemoVisible(false)
    demoInsertAfterIdxRef.current = -1
    // Reset to a safe idle height — the height management effect won't overwrite
    // this because wasEngagedRef prevents it from recalculating on un-engage.
    setDynamicMaxH('60vh')
  }

  // Collapse and reset when user scrolls significantly upward past the engagement point
  useEffect(() => {
    if (!engaged) return
    // One-shot guard: the scroll event can fire many times before React cleans up the
    // listener, causing resetConversation() to run repeatedly and produce visual jumps.
    let collapsed = false
    function onScroll() {
      if (collapsed) return
      // 150px threshold — large enough to avoid accidental collapse on mobile momentum scroll
      if (window.scrollY < engagedScrollYRef.current - 150) {
        collapsed = true
        setEngaged(false)
        resetConversation()
      }
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [engaged]) // eslint-disable-line react-hooks/exhaustive-deps

  // ── Engage & scroll ───────────────────────────────────────────────────────

  function engageAndScroll() {
    if (engaged) return
    setEngaged(true)

    if (!dialogRef.current) return

    // Reset engagement reference to current position so the scroll-away listener
    // doesn't use a stale value from a previous engagement session and fire immediately.
    engagedScrollYRef.current = window.scrollY

    // Synchronous rect capture before any React re-renders change the layout
    const rect = dialogRef.current.getBoundingClientRect()

    // Set a safe immediate cap so the dialog doesn't grow unconstrained while scrolling
    const immediateAvail = window.innerHeight - rect.top - 24
    setDynamicMaxH(`${Math.max(300, Math.round(immediateAvail))}px`)

    // Nav hides on scroll-down, so target a small top margin instead of reserving nav height
    const scrollNeeded = rect.top - 16
    if (Math.abs(scrollNeeded) < 5) {
      applyEngagedMaxH()
      return
    }

    window.scrollTo({ top: window.scrollY + scrollNeeded, behavior: 'smooth' })

    // Poll until scroll stabilises, then expand to full available height
    let lastY = window.scrollY
    let stableCount = 0
    const poll = setInterval(() => {
      const y = window.scrollY
      if (Math.abs(y - lastY) < 1) {
        stableCount++
        if (stableCount >= 3) {
          clearInterval(poll)
          applyEngagedMaxH()
        }
      } else {
        stableCount = 0
      }
      lastY = y
    }, 50)
  }

  // ── Conversation advance ──────────────────────────────────────────────────

  function advance(userLabel: string, userValue: string) {
    engageAndScroll()
    setShowInput(false)
    addHistory({ role: 'user', content: userLabel })

    if (currentStep.id === 'step1-persona') {
      setPersona(userValue as AgentPersona)
    }

    if (currentStep.id === 'step2-demo-choice' && userValue === 'custom') {
      setMessages(prev => [...prev, { role: 'user', text: userLabel }])
      setShowUrlInput(true)
      return
    }

    if (currentStep.inputType === 'cta') {
      setMessages(prev => [...prev, { role: 'user', text: userLabel }])
      setHeroCompleted()
      if (userValue.startsWith('/')) router.push(userValue)
      return
    }

    const next = stepIdx + 1
    if (next < flow.length) {
      // Atomically add user bubble + next agent placeholder in one state update
      setMessages(prev => [
        ...prev,
        { role: 'user', text: userLabel },
        { role: 'agent', text: '', isTyping: true },
      ])
      setStepIdx(next)
    } else {
      setMessages(prev => [...prev, { role: 'user', text: userLabel }])
      onComplete?.(persona)
    }
  }

  function handleUrlSubmit() {
    const url = urlInput.trim()
    if (!url) return
    addHistory({ role: 'user', content: url })
    setMessages(prev => [
      ...prev,
      { role: 'user', text: url },
      {
        role: 'agent',
        text: "We'll run a real-time analysis on your article. Our team will use this as the starting point for your POC.",
        isTyping: false,
      },
    ])
    setShowUrlInput(false)
    setUrlInput('')
    setShowInput(false)
    setTimeout(() => openContact(), 400)
  }

  // ── Derived ───────────────────────────────────────────────────────────────

  const ctaStep = currentStep.inputType === 'cta'
  const ctaOption =
    currentStep.options?.find(o => {
      if (persona === 'publisher') return o.value === '/content-owners'
      if (persona === 'brand') return o.value === '/brands'
      if (persona === 'developer') return o.value === '/developers'
      return false
    }) ?? currentStep.options?.[0]

  const borderColor = isDark ? 'rgba(34,93,89,0.7)' : '#E5E5E5'
  const bg = isDark ? 'rgba(18,46,44,0.88)' : 'rgba(255,255,255,0.97)'

  const showPills = showInput && currentStep.inputType === 'pills' && !showUrlInput
  const showCta = showInput && ctaStep && ctaOption && !showUrlInput
  const showDemoContinue = currentStep.inputType === 'demo' && demoComplete
  const hasInputContent = showPills || showCta || showUrlInput || showDemoContinue

  // Last agent message (used in initial/idle layout)
  const lastMsg = messages[messages.length - 1]

  return (
    <div
      ref={dialogRef}
      className="w-full rounded-2xl flex flex-col"
      style={{
        // When engaged: force the dialog to fill the space (height + maxHeight).
        // When idle: only cap with maxHeight so the dialog auto-sizes to content.
        ...(engaged
          ? { height: dynamicMaxH, maxHeight: dynamicMaxH }
          : { maxHeight: dynamicMaxH }),
        transition:
          'height 0.5s cubic-bezier(0.4, 0, 0.2, 1), max-height 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
        border: `1.5px solid ${borderColor}`,
        background: bg,
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        boxShadow: isDark
          ? '0 2px 0 rgba(168,197,195,0.08) inset, 0 12px 48px rgba(0,0,0,0.55), 0 0 0 1px rgba(34,93,89,0.25)'
          : '0 4px 24px rgba(0,0,0,0.10)',
        overflow: 'hidden',
      }}
    >
      {/* ── Header ── */}
      <div
        className="flex-shrink-0 flex items-center justify-between px-4 py-3 border-b"
        style={{ borderColor, background: isDark ? 'rgba(34,93,89,0.45)' : '#225D59' }}
      >
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse" />
          <span className="text-xs font-semibold tracking-widest uppercase text-white">
            Decision Engine
          </span>
        </div>
        <span className="text-xs font-medium text-white/60">LIVE</span>
      </div>

      {!engaged ? (
        // ── Initial layout: original card-style, no history ──────────────────
        <div ref={scrollBodyRef} className="flex-1 overflow-y-auto min-h-0">
          {/* Agent message as a plain card */}
          <div className="px-4 pt-3 pb-2">
            <div
              className="rounded-xl px-3 py-2.5 text-sm leading-relaxed text-left"
              style={{
                background: isDark ? 'rgba(34,93,89,0.25)' : 'rgba(34,93,89,0.06)',
                color: isDark ? '#FAFAFA' : '#1A1A1A',
              }}
            >
              {(lastMsg?.text ?? '').split('\n').map((line, j, arr) => (
                <span key={j}>
                  {line}
                  {j < arr.length - 1 && <br />}
                </span>
              ))}
              {lastMsg?.isTyping && (
                <span className="cursor-blink ml-0.5 opacity-70">|</span>
              )}
            </div>
          </div>

          {/* Pills inline in the initial view */}
          {showPills && (
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
        </div>
      ) : (
        // ── Engaged layout: full chat conversation ────────────────────────────
        <>
          <div
            ref={scrollBodyRef}
            className="flex-1 overflow-y-auto min-h-0 px-4 py-3 space-y-2"
          >
            {messages.map((msg, i) => (
              <Fragment key={i}>
                <div className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div
                    className="max-w-[85%] rounded-xl px-3 py-2 text-sm leading-relaxed text-left"
                    style={
                      msg.role === 'agent'
                        ? {
                            background: isDark ? 'rgba(34,93,89,0.25)' : 'rgba(34,93,89,0.06)',
                            color: isDark ? '#FAFAFA' : '#1A1A1A',
                          }
                        : { background: '#225D59', color: 'white' }
                    }
                  >
                    {msg.text.split('\n').map((line, j, arr) => (
                      <span key={j}>
                        {line}
                        {j < arr.length - 1 && <br />}
                      </span>
                    ))}
                    {msg.isTyping && (
                      <span className="cursor-blink ml-0.5 opacity-70">|</span>
                    )}
                  </div>
                </div>

                {/* ArticleScanDemo is rendered after its trigger message and stays
                    mounted permanently (demoInsertAfterIdxRef never changes once set),
                    so its internal animation state survives stepIdx changes. */}
                {demoVisible && i === demoInsertAfterIdxRef.current && (
                  <div className="mt-1">
                    <ArticleScanDemo
                      isDark={isDark}
                      onProgress={() => {
                        const body = scrollBodyRef.current
                        if (body) body.scrollTo({ top: body.scrollHeight, behavior: 'smooth' })
                      }}
                      onComplete={() => {
                        setDemoComplete(true)
                        setTimeout(() => {
                          const body = scrollBodyRef.current
                          if (body) body.scrollTo({ top: body.scrollHeight, behavior: 'smooth' })
                        }, 50)
                      }}
                    />
                  </div>
                )}
              </Fragment>
            ))}

            <div className="h-1" /* scroll anchor */ />
          </div>

          {/* ── Pinned input area ── */}
          <AnimatePresence>
            {hasInputContent && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
                className="flex-shrink-0 border-t px-4 py-3"
                style={{ borderColor }}
              >
                {showPills && (
                  <div className="flex flex-wrap gap-2">
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

                {showUrlInput && (
                  <div className="flex gap-2">
                    <input
                      autoFocus
                      type="url"
                      value={urlInput}
                      onChange={e => setUrlInput(e.target.value)}
                      onKeyDown={e => {
                        if (e.key === 'Enter') handleUrlSubmit()
                      }}
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
                )}

                {showCta && ctaOption && (
                  <button
                    onClick={() => advance(ctaOption.label, ctaOption.value)}
                    className="w-full py-3 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90 active:scale-[0.98]"
                    style={{ background: '#225D59' }}
                  >
                    {ctaOption.label} →
                  </button>
                )}

                {showDemoContinue && (
                  <motion.button
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    onClick={() => {
                      const next = stepIdx + 1
                      if (next < flow.length) {
                        setMessages(prev => [
                          ...prev,
                          { role: 'agent', text: '', isTyping: true },
                        ])
                        setStepIdx(next)
                      } else {
                        onComplete?.(persona)
                      }
                    }}
                    className="w-full py-3 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90 active:scale-[0.98]"
                    style={{ background: '#225D59' }}
                  >
                    See what this means for you →
                  </motion.button>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </>
      )}
    </div>
  )
}
