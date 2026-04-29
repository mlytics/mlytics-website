'use client'

import { useState, useEffect, useRef, Fragment } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { type AgentStep, type AgentPersona, type StylistProduct, type StyleCard, type ReaderProduct, getStylistRecommendation, getReaderProduct, STYLIST_FLOW, READER_FLOW } from '@/lib/agent-data'
import { useAgent } from '@/lib/agent-context'
import { ArticleScanDemo } from './ArticleScanDemo'
import { ArticleQnADemo } from './ArticleQnADemo'
import { useContactModal } from '@/context/contact-modal-context'

// ── Style card carousel ────────────────────────────────────────────────────────

function StyleCardCarousel({
  cards,
  isDark,
  onSelect,
  frozenValue,
}: {
  cards: StyleCard[]
  isDark: boolean
  onSelect?: (label: string, value: string) => void
  frozenValue?: string
}) {
  const [selected, setSelected] = useState<string | null>(frozenValue ?? null)
  const frozen = frozenValue !== undefined

  function handleClick(card: StyleCard) {
    if (frozen || selected) return
    setSelected(card.value)
    setTimeout(() => onSelect?.(card.label, card.value), 300)
  }

  return (
    <div
      className="overflow-x-auto"
      style={{
        scrollSnapType: 'x mandatory',
        scrollbarWidth: 'none',
        msOverflowStyle: 'none',
        WebkitOverflowScrolling: 'touch',
        paddingBottom: 8,
      }}
    >
      <div className="flex gap-2.5" style={{ width: 'max-content', paddingRight: 8 }}>
        {cards.map(card => {
          const isSelected = selected === card.value
          const isDimmed = selected !== null && !isSelected
          return (
            <button
              key={card.value}
              onClick={() => handleClick(card)}
              disabled={frozen || !!selected}
              style={{
                width: 120,
                height: 168,
                scrollSnapAlign: 'start',
                flexShrink: 0,
                borderRadius: 12,
                border: `2px solid ${isSelected ? (isDark ? 'rgba(168,197,195,0.85)' : '#225D59') : 'transparent'}`,
                overflow: 'hidden',
                cursor: (frozen || selected) ? 'default' : 'pointer',
                opacity: isDimmed ? 0.3 : 1,
                transition: 'opacity 0.25s ease, border-color 0.2s ease, transform 0.15s ease',
                transform: isSelected ? 'scale(1.04)' : 'scale(1)',
                position: 'relative',
                padding: 0,
                background: '#1A1A1A',
              }}
            >
              {/* Photo */}
              <img
                src={card.imageUrl}
                alt={card.label}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  display: 'block',
                }}
                draggable={false}
              />
              {/* Selected checkmark overlay */}
              {isSelected && (
                <span
                  style={{
                    position: 'absolute',
                    top: 8,
                    right: 8,
                    width: 22,
                    height: 22,
                    borderRadius: '50%',
                    background: isDark ? 'rgba(168,197,195,0.92)' : '#225D59',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 12,
                    color: 'white',
                    boxShadow: '0 1px 6px rgba(0,0,0,0.3)',
                  }}
                >
                  ✓
                </span>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────

interface AgentDialogProps {
  flow: AgentStep[]
  mode?: 'cortex' | 'stylist'
  onComplete?: (persona: AgentPersona) => void
  variant?: 'hero' | 'page'
  bottomPadding?: number
  onEngage?: () => void
  onReset?: () => void
}

type MessageItem = { role: 'agent' | 'user'; text: string; isTyping?: boolean; isThinking?: boolean }

export function AgentDialog({ flow, mode = 'cortex', onComplete, variant = 'hero', bottomPadding = 0, onEngage, onReset }: AgentDialogProps) {
  const { persona, setPersona, addHistory, setHeroCompleted } = useAgent()
  const { open: openContact } = useContactModal()
  const router = useRouter()

  // Internal flow & mode — can be switched mid-conversation when user picks __stylist__
  const originalFlowRef = useRef(flow)
  const [currentFlow, setCurrentFlow] = useState(flow)
  const [currentMode, setCurrentMode] = useState<'cortex' | 'stylist' | 'reader'>(mode)
  // Bumped whenever the active flow changes so the typewriter effect re-runs even if stepIdx stays 0
  const [flowVersion, setFlowVersion] = useState(0)

  const [stepIdx, setStepIdx] = useState(0)
  const [messages, setMessages] = useState<MessageItem[]>([
    { role: 'agent', text: '', isTyping: true },
  ])
  const [showInput, setShowInput] = useState(false)
  const [urlInput, setUrlInput] = useState('')
  const [showUrlInput, setShowUrlInput] = useState(false)
  const [demoComplete, setDemoComplete] = useState(false)
  const [stylistAnswers, setStylistAnswers] = useState<string[]>([])
  const [stylistProduct, setStylistProduct] = useState<StylistProduct | null>(null)
  const [readerQuestionId, setReaderQuestionId] = useState<string>('')
  const [readerProduct, setReaderProduct] = useState<ReaderProduct | null>(null)
  // Index in messages[] after which ArticleQnADemo is inserted (fixed once set)
  const readerArticleInsertAfterIdxRef = useRef(-1)
  // Index in messages[] for the reader product card insertion (fixed once set)
  const readerProductCardInsertAfterIdxRef = useRef(-1)
  // demoVisible stays true once the demo starts — ArticleScanDemo is never unmounted
  const [demoVisible, setDemoVisible] = useState(false)
  // Index in messages[] after which ArticleScanDemo is inserted (fixed once set)
  const demoInsertAfterIdxRef = useRef(-1)
  // Index in messages[] for the product-card insertion (fixed once set)
  const productCardInsertAfterIdxRef = useRef(-1)
  // Index in messages[] after which the style-card carousel is rendered inline
  const [styleCardInsertAfterIdx, setStyleCardInsertAfterIdx] = useState(-1)
  const styleCardsCache = useRef<StyleCard[]>([])
  const [selectedStyleValue, setSelectedStyleValue] = useState<string | null>(null)
  // dynamicMaxH is used as maxHeight when idle, and as height+maxHeight when engaged
  const [dynamicMaxH, setDynamicMaxH] = useState<string>('60vh')
  // Stylist mode starts in engaged state so the full chat layout is visible from step 1
  const [engaged, setEngaged] = useState(mode === 'stylist')

  const scrollBodyRef = useRef<HTMLDivElement>(null)
  const dialogRef = useRef<HTMLDivElement>(null)
  // Captures window.scrollY after scroll settles; used to detect upward scroll-away
  const engagedScrollYRef = useRef(0)
  // Tracks whether the previous render was engaged — lets us skip position recalc on un-engage
  const wasEngagedRef = useRef(mode === 'stylist')

  const currentStep = currentFlow[stepIdx]
  const isDark = variant === 'hero'

  function resolveMessage(step: AgentStep): string {
    if (step.resolveFromStylistAnswer) {
      const { index, messages } = step.resolveFromStylistAnswer
      const answerLabel = stylistAnswers[index] ?? ''
      // Check longest keys first to avoid partial matches (e.g. 'Under $300' before '$300')
      const keys = Object.keys(messages).sort((a, b) => b.length - a.length)
      for (const key of keys) {
        if (answerLabel.includes(key)) return messages[key]
      }
      return Object.values(messages)[0] ?? step.agentMessage
    }
    if (step.readerMessages && readerQuestionId) {
      return step.readerMessages[readerQuestionId] ?? step.agentMessage
    }
    if (step.personalizedMessages && persona) {
      return step.personalizedMessages[persona] ?? step.agentMessage
    }
    return step.agentMessage
  }

  // ── Typewriter: mutates the last message in-place ──────────────────────────

  useEffect(() => {
    setShowInput(false)

    // Thinking steps: skip typewriter, mark bubble as thinking, immediately signal ready
    if (currentStep.inputType === 'thinking') {
      setMessages(prev => {
        const next = [...prev]
        next[next.length - 1] = { role: 'agent', text: '', isThinking: true }
        return next
      })
      setShowInput(true)
      return
    }

    const msg = resolveMessage(currentStep)

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
  }, [stepIdx, flowVersion]) // eslint-disable-line react-hooks/exhaustive-deps

  // Auto-scroll: immediate (double-rAF) for new messages and demo mount
  useEffect(() => {
    const body = scrollBodyRef.current
    if (!body) return
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        body.scrollTo({ top: body.scrollHeight, behavior: 'smooth' })
      })
    })
  }, [messages, demoVisible])

  // Auto-scroll: delayed for showInput — waits for pinned footer animation (200ms) to finish
  useEffect(() => {
    if (!showInput) return
    const body = scrollBodyRef.current
    if (!body) return
    const timer = setTimeout(() => {
      body.scrollTo({ top: body.scrollHeight, behavior: 'smooth' })
    }, 250)
    return () => clearTimeout(timer)
  }, [showInput])

  useEffect(() => {
    setDemoComplete(false)
  }, [stepIdx])

  // For stylist mode: notify parent and compute height on mount (already engaged)
  useEffect(() => {
    if (mode !== 'stylist') return
    onEngage?.()
    engagedScrollYRef.current = window.scrollY
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        applyEngagedMaxH()
      })
    })
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Auto-advance when demo finishes — no button needed
  useEffect(() => {
    if (!demoComplete) return
    const timer = setTimeout(() => {
      const next = stepIdx + 1
      if (next < currentFlow.length) {
        setMessages(prev => [
          ...prev,
          { role: 'agent', text: '', isTyping: true },
        ])
        setStepIdx(next)
      } else {
        onComplete?.(persona)
      }
    }, 600)
    return () => clearTimeout(timer)
  }, [demoComplete]) // eslint-disable-line react-hooks/exhaustive-deps

  // Auto-advance for 'message' steps — no user interaction needed
  useEffect(() => {
    if (currentStep.inputType !== 'message' || !showInput) return
    const delay = currentStep.autoAdvanceDelay ?? 500
    const timer = setTimeout(() => {
      const next = stepIdx + 1
      if (next < currentFlow.length) {
        setMessages(prev => [
          ...prev,
          { role: 'agent', text: '', isTyping: true },
        ])
        setStepIdx(next)
      }
    }, delay)
    return () => clearTimeout(timer)
  }, [showInput, stepIdx]) // eslint-disable-line react-hooks/exhaustive-deps

  // Auto-advance for 'thinking' steps — remove the dots bubble then start the next message
  useEffect(() => {
    if (currentStep.inputType !== 'thinking' || !showInput) return
    const timer = setTimeout(() => {
      const next = stepIdx + 1
      if (next < currentFlow.length) {
        setMessages(prev => [
          // Drop the thinking bubble; the next agent message takes its place
          ...prev.filter(m => !m.isThinking),
          { role: 'agent', text: '', isTyping: true },
        ])
        setStepIdx(next)
      }
    }, 800)
    return () => clearTimeout(timer)
  }, [showInput, stepIdx]) // eslint-disable-line react-hooks/exhaustive-deps

  // Auto-advance for 'product-card' steps — record insert position, show card, then move on
  useEffect(() => {
    if (currentStep.inputType !== 'product-card' || !showInput) return
    // Pin the card's position in the message list so it persists after auto-advance
    if (productCardInsertAfterIdxRef.current === -1) {
      productCardInsertAfterIdxRef.current = messages.length - 1
    }
    const timer = setTimeout(() => {
      const next = stepIdx + 1
      if (next < currentFlow.length) {
        setMessages(prev => [
          ...prev,
          { role: 'agent', text: '', isTyping: true },
        ])
        setStepIdx(next)
      }
    }, 2000)
    return () => clearTimeout(timer)
  }, [showInput, stepIdx]) // eslint-disable-line react-hooks/exhaustive-deps

  // Pin the style-card carousel position in the message list when it becomes interactive
  useEffect(() => {
    if (currentStep.inputType === 'style-cards' && showInput && styleCardInsertAfterIdx === -1) {
      setStyleCardInsertAfterIdx(messages.length - 1)
      styleCardsCache.current = currentStep.styleCards ?? []
    }
  }, [showInput, stepIdx, flowVersion]) // eslint-disable-line react-hooks/exhaustive-deps

  // Pin the ArticleQnADemo position when the reader-article step becomes interactive
  useEffect(() => {
    if (currentStep.inputType === 'reader-article' && showInput && readerArticleInsertAfterIdxRef.current === -1) {
      readerArticleInsertAfterIdxRef.current = messages.length - 1
    }
  }, [showInput, stepIdx, flowVersion]) // eslint-disable-line react-hooks/exhaustive-deps

  // Pin the reader product card position (reader mode uses its own ref)
  useEffect(() => {
    if (currentStep.inputType === 'product-card' && showInput && readerProductCardInsertAfterIdxRef.current === -1 && currentMode === 'reader') {
      readerProductCardInsertAfterIdxRef.current = messages.length - 1
    }
  }, [showInput, stepIdx, currentMode]) // eslint-disable-line react-hooks/exhaustive-deps

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
      const available = window.innerHeight - rect.top - bottomPadding - 24
      setDynamicMaxH(`${Math.max(260, Math.round(available))}px`)
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
    const avail = window.innerHeight - rect.top - bottomPadding - 24
    setDynamicMaxH(`${Math.max(400, Math.round(avail))}px`)
    engagedScrollYRef.current = window.scrollY
  }

  function resetConversation() {
    setCurrentFlow(originalFlowRef.current)
    setCurrentMode(mode)
    setFlowVersion(v => v + 1)
    setStepIdx(0)
    setMessages([{ role: 'agent', text: '', isTyping: true }])
    setShowInput(false)
    setShowUrlInput(false)
    setUrlInput('')
    setDemoComplete(false)
    setDemoVisible(false)
    demoInsertAfterIdxRef.current = -1
    productCardInsertAfterIdxRef.current = -1
    setStyleCardInsertAfterIdx(-1)
    styleCardsCache.current = []
    setSelectedStyleValue(null)
    setStylistAnswers([])
    setStylistProduct(null)
    setReaderQuestionId('')
    setReaderProduct(null)
    readerArticleInsertAfterIdxRef.current = -1
    readerProductCardInsertAfterIdxRef.current = -1
    setEngaged(false)
    setDynamicMaxH('60vh')
    onReset?.()
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
    onEngage?.()

    if (!dialogRef.current) return

    // Reset engagement reference to current position so the scroll-away listener
    // doesn't use a stale value from a previous engagement session and fire immediately.
    engagedScrollYRef.current = window.scrollY

    // Synchronous rect capture before any React re-renders change the layout
    const rect = dialogRef.current.getBoundingClientRect()

    // On mobile/tablet the nav stays visible (64px); on desktop it hides on scroll
    const navH = window.innerWidth < 1024 ? 64 : 0

    // Do NOT change maxHeight here — growing the dialog before scrolling causes the
    // flex justify-center container to re-center it upward, shifting rect.top under the nav.
    // The dialog keeps its idle size during the scroll; applyEngagedMaxH expands it after.

    // Reserve nav height as top margin on mobile/tablet; desktop nav hides so 16px is enough
    const scrollNeeded = rect.top - navH - 16
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
    if (userValue === '__reader__') {
      engageAndScroll()
      setShowInput(false)
      addHistory({ role: 'user', content: userLabel })
      setReaderQuestionId('')
      setReaderProduct(null)
      readerArticleInsertAfterIdxRef.current = -1
      readerProductCardInsertAfterIdxRef.current = -1
      productCardInsertAfterIdxRef.current = -1
      setMessages(prev => [
        ...prev,
        { role: 'user', text: userLabel },
        { role: 'agent', text: '', isTyping: true },
      ])
      setCurrentFlow(READER_FLOW)
      setCurrentMode('reader')
      setFlowVersion(v => v + 1)
      setStepIdx(0)
      return
    }

    if (userValue === '__stylist__') {
      // Same interaction as other pills: show user bubble → agent starts typing → flow switches internally
      engageAndScroll()
      setShowInput(false)
      addHistory({ role: 'user', content: userLabel })
      setStylistAnswers([])
      setStylistProduct(null)
      productCardInsertAfterIdxRef.current = -1
      setStyleCardInsertAfterIdx(-1)
      styleCardsCache.current = []
      setSelectedStyleValue(null)
      setMessages(prev => [
        ...prev,
        { role: 'user', text: userLabel },
        { role: 'agent', text: '', isTyping: true },
      ])
      setCurrentFlow(STYLIST_FLOW)
      setCurrentMode('stylist')
      setFlowVersion(v => v + 1)
      setStepIdx(0)
      return
    }

    engageAndScroll()
    setShowInput(false)
    addHistory({ role: 'user', content: userLabel })

    if (currentStep.id === 'step1-persona') {
      setPersona(userValue as AgentPersona)
    }

    if (currentStep.collectsStylistAnswer) {
      const updated = [...stylistAnswers, userLabel]
      setStylistAnswers(updated)
      // After the 3rd answer (budget), pre-compute the recommendation
      if (updated.length === 3) {
        setStylistProduct(getStylistRecommendation(updated))
      }
    }

    // Reader flow: capture selected question id from reader-article step
    if (currentStep.inputType === 'reader-article') {
      setReaderQuestionId(userValue)
    }

    // Reader flow: after budget selection, pre-compute the reader product
    if (currentStep.id === 'reader-preference') {
      setReaderProduct(getReaderProduct(userValue))
    }

    if (currentStep.inputType === 'cta') {
      setMessages(prev => [...prev, { role: 'user', text: userLabel }])
      setHeroCompleted()
      if (userValue.startsWith('/')) router.push(userValue)
      else if (currentStep.options?.[0]?.value.startsWith('/')) router.push(currentStep.options[0].value)
      return
    }

    const next = stepIdx + 1
    if (next < currentFlow.length) {
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

  const isStylist = currentMode === 'stylist'
  const isReader = currentMode === 'reader'
  const borderColor = isDark ? 'rgba(34,93,89,0.7)' : '#E5E5E5'
  const bg = isDark ? 'rgba(18,46,44,0.88)' : 'rgba(255,255,255,0.97)'
  const headerBg = isDark ? 'rgba(34,93,89,0.45)' : '#225D59'

  const ctaStep = currentStep.inputType === 'cta'
  const ctaOption = (isStylist || isReader)
    ? (currentStep.options?.find(o => {
        if (persona === 'publisher') return o.value === '/content-owners'
        if (persona === 'brand') return o.value === '/brands'
        if (persona === 'developer') return o.value === '/developers'
        return false
      }) ?? currentStep.options?.[0])
    : (currentStep.options?.find(o => {
        if (persona === 'publisher') return o.value === '/content-owners'
        if (persona === 'brand') return o.value === '/brands'
        if (persona === 'developer') return o.value === '/developers'
        return false
      }) ?? currentStep.options?.[0])

  const stepOptions =
    (persona && currentStep.personalizedOptions?.[persona]) ?? currentStep.options

  const showPills = showInput && currentStep.inputType === 'pills' && !showUrlInput
  const showCta = showInput && ctaStep && ctaOption && !showUrlInput
  const hasInputContent = showPills || showCta || showUrlInput

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
        style={{ borderColor, background: headerBg }}
      >
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-white/70 animate-pulse" />
          <span className="text-xs font-semibold tracking-widest uppercase text-white">
            Mlytics Cortex
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
              {lastMsg?.isThinking ? (
                <div className="flex gap-1 items-center" style={{ height: 18 }}>
                  <span className="thinking-dot" style={{ background: isDark ? 'rgba(250,250,250,0.6)' : 'rgba(34,93,89,0.5)' }} />
                  <span className="thinking-dot" style={{ background: isDark ? 'rgba(250,250,250,0.6)' : 'rgba(34,93,89,0.5)', animationDelay: '0.18s' }} />
                  <span className="thinking-dot" style={{ background: isDark ? 'rgba(250,250,250,0.6)' : 'rgba(34,93,89,0.5)', animationDelay: '0.36s' }} />
                </div>
              ) : (
                <>
                  {(lastMsg?.text ?? '').split('\n').map((line, j, arr) => (
                    <span key={j}>
                      {line}
                      {j < arr.length - 1 && <br />}
                    </span>
                  ))}
                  {lastMsg?.isTyping && (
                    <span className="cursor-blink ml-0.5 opacity-70">|</span>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Pills inline in the initial view */}
          {showPills && (
            <div className="px-4 pb-4 flex flex-wrap gap-2">
              {stepOptions?.map(opt => (
                <button
                  key={opt.label}
                  onClick={() => advance(opt.label, opt.value)}
                  className={(opt.value === '__stylist__' || opt.value === '__reader__') ? 'pill-btn pill-btn--stylist' : (isDark ? 'pill-btn pill-btn--dark' : 'pill-btn')}
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
                    {msg.isThinking ? (
                      <div className="flex gap-1 items-center" style={{ height: 18 }}>
                        <span className="thinking-dot" style={{ background: isDark ? 'rgba(250,250,250,0.6)' : 'rgba(34,93,89,0.5)' }} />
                        <span className="thinking-dot" style={{ background: isDark ? 'rgba(250,250,250,0.6)' : 'rgba(34,93,89,0.5)', animationDelay: '0.18s' }} />
                        <span className="thinking-dot" style={{ background: isDark ? 'rgba(250,250,250,0.6)' : 'rgba(34,93,89,0.5)', animationDelay: '0.36s' }} />
                      </div>
                    ) : (
                      <>
                        {msg.text.split('\n').map((line, j, arr) => (
                          <span key={j}>
                            {line}
                            {j < arr.length - 1 && <br />}
                          </span>
                        ))}
                        {msg.isTyping && (
                          <span className="cursor-blink ml-0.5 opacity-70">|</span>
                        )}
                      </>
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
                      articleId={persona === 'publisher' || persona === 'brand' || persona === 'developer' ? 'media-ai' : undefined}
                      showIntentStrength={persona === 'brand' || persona === 'developer'}
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

                {/* Style card carousel — inline in chat, interactive or frozen */}
                {isStylist && styleCardsCache.current.length > 0 && msg.role === 'agent' && i === styleCardInsertAfterIdx && (
                  <motion.div
                    className="mt-2"
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.35, ease: 'easeOut' }}
                  >
                    <StyleCardCarousel
                      cards={styleCardsCache.current}
                      isDark={isDark}
                      frozenValue={selectedStyleValue ?? undefined}
                      onSelect={(label, value) => {
                        setSelectedStyleValue(value)
                        advance(label, value)
                      }}
                    />
                  </motion.div>
                )}

                {/* ArticleQnADemo — pinned after the reader-article step message */}
                {isReader && readerArticleInsertAfterIdxRef.current !== -1 && msg.role === 'agent' && i === readerArticleInsertAfterIdxRef.current && (
                  <motion.div
                    className="mt-2"
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.35, ease: 'easeOut' }}
                  >
                    <ArticleQnADemo
                      isDark={isDark}
                      onSelect={(label, value) => advance(label, value)}
                    />
                  </motion.div>
                )}

                {/* Reader product card — pinned at the product-card step message index */}
                {isReader && readerProduct && msg.role === 'agent' && i === readerProductCardInsertAfterIdxRef.current && (
                  <motion.div
                    className="mt-2 rounded-xl overflow-hidden"
                    style={{
                      border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'}`,
                      background: isDark ? 'rgba(18,46,44,0.7)' : 'white',
                      boxShadow: isDark
                        ? '0 4px 24px rgba(0,0,0,0.4)'
                        : '0 4px 20px rgba(0,0,0,0.08)',
                    }}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.45, ease: 'easeOut' }}
                  >
                    {/* ── Photo hero with gradient overlay ── */}
                    <div style={{ position: 'relative', paddingBottom: '56.25%', overflow: 'hidden', background: '#111' }}>
                      <img
                        src={readerProduct.imageUrl}
                        alt={readerProduct.name}
                        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                      />
                      <div style={{
                        position: 'absolute', inset: 0,
                        background: 'linear-gradient(to top, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0.15) 55%, transparent 100%)',
                      }} />
                      <div style={{ position: 'absolute', bottom: 10, left: 12, right: 12 }}>
                        <p style={{ fontSize: 8.5, fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.55)', marginBottom: 2 }}>
                          {readerProduct.brand}
                        </p>
                        <p style={{ fontSize: 17, fontWeight: 800, color: 'white', lineHeight: 1.1, letterSpacing: '-0.02em', marginBottom: 3 }}>
                          {readerProduct.name}
                        </p>
                        <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.65)', lineHeight: 1.35, fontWeight: 400 }}>
                          {readerProduct.tagline}
                        </p>
                      </div>
                    </div>

                    {/* ── Key stats row ── */}
                    <div style={{
                      display: 'flex',
                      borderBottom: `1px solid ${isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.06)'}`,
                    }}>
                      {readerProduct.highlights.map((h, hi) => (
                        <div
                          key={hi}
                          style={{
                            flex: 1,
                            padding: '10px 0',
                            textAlign: 'center',
                            borderRight: hi < readerProduct.highlights.length - 1
                              ? `1px solid ${isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.06)'}` : 'none',
                          }}
                        >
                          <p style={{ fontSize: 19, fontWeight: 800, color: isDark ? '#FAFAFA' : '#1A1A1A', lineHeight: 1, marginBottom: 3, letterSpacing: '-0.03em' }}>
                            {h.value}
                          </p>
                          <p style={{ fontSize: 8.5, fontWeight: 500, color: isDark ? 'rgba(250,250,250,0.4)' : '#AAA', textTransform: 'uppercase', letterSpacing: '0.07em' }}>
                            {h.label}
                          </p>
                        </div>
                      ))}
                    </div>

                    {/* ── CTA ── */}
                    <div style={{ padding: '10px 12px' }}>
                      <a
                        href={readerProduct.ctaHref}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          display: 'block',
                          textAlign: 'center',
                          fontSize: 11,
                          fontWeight: 700,
                          color: 'white',
                          background: '#225D59',
                          borderRadius: 8,
                          padding: '8px 0',
                          textDecoration: 'none',
                          letterSpacing: '0.02em',
                          transition: 'opacity 0.15s',
                        }}
                        onMouseEnter={e => (e.currentTarget.style.opacity = '0.85')}
                        onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
                      >
                        {readerProduct.ctaLabel} →
                      </a>
                    </div>
                  </motion.div>
                )}

                {/* Stylist product card — pinned at the product-card step message index */}
                {isStylist && stylistProduct && msg.role === 'agent' && i === productCardInsertAfterIdxRef.current && (
                  <motion.div
                    className="mt-2 rounded-xl overflow-hidden"
                    style={{
                      border: '1px solid rgba(34,93,89,0.14)',
                      background: isDark ? 'rgba(18,46,44,0.55)' : 'white',
                      boxShadow: '0 2px 12px rgba(0,0,0,0.07)',
                    }}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, ease: 'easeOut' }}
                  >
                    <div className="flex">
                      {/* Product image */}
                      <div style={{ width: 96, flexShrink: 0, background: '#F5F0EB' }}>
                        <img
                          src={stylistProduct.imageUrl}
                          alt={stylistProduct.name}
                          style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                        />
                      </div>

                      {/* Product info */}
                      <div style={{ flex: 1, padding: '12px 14px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minWidth: 0 }}>
                        <div>
                          <p style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#225D59', marginBottom: 3 }}>
                            {stylistProduct.brand}
                          </p>
                          <p style={{ fontSize: 13, fontWeight: 700, color: isDark ? '#F5F5F5' : '#1A1A1A', marginBottom: 4, lineHeight: 1.3 }}>
                            {stylistProduct.name}
                          </p>
                          <p style={{ fontSize: 11, color: isDark ? 'rgba(245,245,245,0.55)' : '#7A7A7A', lineHeight: 1.45, marginBottom: 8 }}>
                            {stylistProduct.stylistNote}
                          </p>
                        </div>

                        <div className="flex items-center justify-between">
                          <p style={{ fontSize: 13, fontWeight: 700, color: isDark ? '#A8C5C3' : '#225D59' }}>
                            {stylistProduct.price}
                          </p>
                          <a
                            href={stylistProduct.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                              fontSize: 11,
                              fontWeight: 600,
                              color: 'white',
                              background: '#225D59',
                              borderRadius: 6,
                              padding: '4px 10px',
                              textDecoration: 'none',
                              whiteSpace: 'nowrap',
                              transition: 'opacity 0.15s',
                            }}
                            onMouseEnter={e => (e.currentTarget.style.opacity = '0.82')}
                            onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
                          >
                            Shop now →
                          </a>
                        </div>
                      </div>
                    </div>
                  </motion.div>
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
                className="flex-shrink-0 border-t"
                style={{ borderColor }}
              >
                {showPills && (
                  <div className="px-4 py-3 flex flex-wrap gap-2">
                    {stepOptions?.map(opt => (
                      <button
                        key={opt.label}
                        onClick={() => advance(opt.label, opt.value)}
                        className={(opt.value === '__stylist__' || opt.value === '__reader__') ? 'pill-btn pill-btn--stylist' : (isDark ? 'pill-btn pill-btn--dark' : 'pill-btn')}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                )}

                {showUrlInput && (
                  <div className="px-4 py-3 flex gap-2">
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
                  <div className="px-4 py-3">
                    <button
                      onClick={() => advance(ctaOption.label, ctaOption.value)}
                      className="w-full py-3 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90 active:scale-[0.98]"
                      style={{ background: '#225D59' }}
                    >
                      {ctaOption.label} →
                    </button>
                  </div>
                )}

              </motion.div>
            )}
          </AnimatePresence>
        </>
      )}
    </div>
  )
}
