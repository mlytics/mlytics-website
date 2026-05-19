'use client'

import { useState, useEffect, useRef, Fragment } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { type AgentStep, type AgentPersona, type ReaderProduct, getReaderProduct, HERO_FLOW, READER_FLOW, PUBLISHER_FLOW, BRAND_FLOW, DEVELOPER_FLOW, READER_QUESTIONS, READER_PRODUCTS } from '@/lib/agent-data'
import { useAgent } from '@/lib/agent-context'
import { ArticleScanDemo } from './ArticleScanDemo'
import { ArticleQnADemo } from './ArticleQnADemo'
import { trackAG } from '@/lib/analytics'

function detectFlowName(flow: AgentStep[]): string {
  if (flow === HERO_FLOW) return 'HERO_FLOW'
  if (flow === READER_FLOW) return 'READER_FLOW'
  if (flow === PUBLISHER_FLOW) return 'PUBLISHER_FLOW'
  if (flow === BRAND_FLOW) return 'BRAND_FLOW'
  if (flow === DEVELOPER_FLOW) return 'DEVELOPER_FLOW'
  return 'UNKNOWN_FLOW'
}

// ─────────────────────────────────────────────────────────────────────────────

interface AgentDialogProps {
  flow: AgentStep[]
  onComplete?: (persona: AgentPersona) => void
  variant?: 'hero' | 'page'
  bottomPadding?: number
  onEngage?: () => void
  onReset?: () => void
}

type MessageItem = { role: 'agent' | 'user'; text: string; isTyping?: boolean; isThinking?: boolean }

export function AgentDialog({ flow, onComplete, variant = 'hero', bottomPadding = 0, onEngage, onReset }: AgentDialogProps) {
  const mode = 'cortex'
  const { persona, setPersona, addHistory, setHeroCompleted } = useAgent()
  const router = useRouter()

  const originalFlowRef = useRef(flow)
  const [currentFlow, setCurrentFlow] = useState(flow)
  const [currentMode, setCurrentMode] = useState<'cortex' | 'reader'>(mode)
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
  const [readerQuestionId, setReaderQuestionId] = useState<string>('')
  const [readerProduct, setReaderProduct] = useState<ReaderProduct | null>(null)
  // Index in messages[] after which ArticleQnADemo is inserted (fixed once set)
  const readerArticleInsertAfterIdxRef = useRef(-1)
  // Index in messages[] where the Answer Page card replaces the agent bubble (fixed once set)
  const readerAnswerInsertAfterIdxRef = useRef(-1)
  // Index in messages[] for the reader product card insertion (fixed once set)
  const readerProductCardInsertAfterIdxRef = useRef(-1)
  // demoVisible stays true once the demo starts — ArticleScanDemo is never unmounted
  const [demoVisible, setDemoVisible] = useState(false)
  // Index in messages[] after which ArticleScanDemo is inserted (fixed once set)
  const demoInsertAfterIdxRef = useRef(-1)
  // Index in messages[] for the product-card insertion (fixed once set)
  const productCardInsertAfterIdxRef = useRef(-1)
  // dynamicMaxH is used as maxHeight when idle, and as height+maxHeight when engaged
  const [dynamicMaxH, setDynamicMaxH] = useState<string>('60vh')
  const [engaged, setEngaged] = useState(false)

  const scrollBodyRef = useRef<HTMLDivElement>(null)
  const dialogRef = useRef<HTMLDivElement>(null)
  // Captures window.scrollY after scroll settles; used to detect upward scroll-away
  const engagedScrollYRef = useRef(0)

  // Preload car images so they're ready when the reader product card appears
  useEffect(() => {
    Object.values(READER_PRODUCTS).forEach(p => {
      const img = new window.Image()
      img.src = p.imageUrl
    })
  }, [])

  // FR-07: impression tracking — fires once when the dialog enters the viewport
  useEffect(() => {
    if (!dialogRef.current) return
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !impressionTrackedRef.current) {
        impressionTrackedRef.current = true
        trackAG('agentdialog_impression', { flow: currentFlowNameRef.current })
        observer.disconnect()
      }
    }, { threshold: 0.5 })
    observer.observe(dialogRef.current)
    return () => observer.disconnect()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // FR-07: step_view + step_duration — fires on every step change
  useEffect(() => {
    const step = currentFlow[stepIdx]
    if (!step) return
    const now = Date.now()
    if (prevStepIdRef.current) {
      trackAG('agentdialog_step_duration', {
        flow: currentFlowNameRef.current,
        step_id: prevStepIdRef.current,
        duration_ms: now - trackStartTimeRef.current,
      })
    }
    trackAG('agentdialog_step_view', {
      flow: currentFlowNameRef.current,
      step_id: step.id,
      step_index: stepIdx,
    })
    trackStartTimeRef.current = now
    prevStepIdRef.current = step.id
  }, [stepIdx, flowVersion]) // eslint-disable-line react-hooks/exhaustive-deps

  // FR-07: flow_abandon — fires on page unload if flow was never completed
  useEffect(() => {
    function handleUnload() {
      if (!flowCompletedRef.current && prevStepIdRef.current) {
        trackAG('agentdialog_flow_abandon', {
          flow: currentFlowNameRef.current,
          last_step_id: prevStepIdRef.current,
          persona: selectedPersonaRef.current || persona || '',
        })
      }
    }
    window.addEventListener('beforeunload', handleUnload)
    return () => window.removeEventListener('beforeunload', handleUnload)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps
  // Analytics tracking refs (FR-07)
  const trackStartTimeRef = useRef<number>(Date.now())
  const prevStepIdRef = useRef<string>('')
  const currentFlowNameRef = useRef<string>(detectFlowName(flow))
  const flowCompletedRef = useRef<boolean>(false)
  const selectedPersonaRef = useRef<string>('')
  const impressionTrackedRef = useRef<boolean>(false)

  // Tracks whether the previous render was engaged — lets us skip position recalc on un-engage
  const wasEngagedRef = useRef(false)

  const currentStep = currentFlow[stepIdx]
  const isDark = variant === 'hero'

  function resolveMessage(step: AgentStep): string {
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

  // True when user has intentionally scrolled up (pauses auto-scroll)
  const userScrolledUpRef = useRef(false)

  const scrollToBottom = () => {
    const body = scrollBodyRef.current
    if (!body) return
    if (!engaged) return
    if (userScrolledUpRef.current) return
    body.scrollTop = body.scrollHeight
  }

  // wheel/touch: detect user intent to scroll up — never fires on programmatic scrollTop changes
  // scroll: detect when user has returned to the bottom — resume auto-scroll
  useEffect(() => {
    const body = scrollBodyRef.current
    if (!body) return

    const onWheel = (e: WheelEvent) => {
      if (e.deltaY < 0) userScrolledUpRef.current = true   // scrolling up → pause
    }
    const onTouchStart = (() => {
      let startY = 0
      const start = (e: TouchEvent) => { startY = e.touches[0].clientY }
      const move = (e: TouchEvent) => {
        if (e.touches[0].clientY > startY) userScrolledUpRef.current = true  // dragging down = scrolling up
      }
      return { start, move }
    })()
    const onScroll = () => {
      const distFromBottom = body.scrollHeight - body.scrollTop - body.clientHeight
      if (distFromBottom <= 20) userScrolledUpRef.current = false  // back at bottom → resume
    }

    body.addEventListener('wheel', onWheel, { passive: true })
    body.addEventListener('touchstart', onTouchStart.start, { passive: true })
    body.addEventListener('touchmove', onTouchStart.move, { passive: true })
    body.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      body.removeEventListener('wheel', onWheel)
      body.removeEventListener('touchstart', onTouchStart.start)
      body.removeEventListener('touchmove', onTouchStart.move)
      body.removeEventListener('scroll', onScroll)
    }
  }, [engaged]) // eslint-disable-line react-hooks/exhaustive-deps

  // Auto-scroll on every message change — instant scroll so no racing with user scroll
  useEffect(() => {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => scrollToBottom())
    })
  }, [messages, demoVisible]) // eslint-disable-line react-hooks/exhaustive-deps

  // Auto-scroll: delayed for showInput — waits for pinned footer animation (200ms) to finish
  useEffect(() => {
    if (!showInput) return
    const timer = setTimeout(() => scrollToBottom(), 250)
    return () => clearTimeout(timer)
  }, [showInput]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    setDemoComplete(false)
  }, [stepIdx])

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
        if (!flowCompletedRef.current) {
          flowCompletedRef.current = true
          trackAG('agentdialog_flow_complete', {
            flow: currentFlowNameRef.current,
            persona: selectedPersonaRef.current || persona || '',
          })
        }
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
    }, 500)
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
    }, 1200)
    return () => clearTimeout(timer)
  }, [showInput, stepIdx]) // eslint-disable-line react-hooks/exhaustive-deps

  // Pin the ArticleQnADemo position when the reader-article step finishes typing
  useEffect(() => {
    if (currentStep.id === 'reader-article' && showInput && readerArticleInsertAfterIdxRef.current === -1) {
      readerArticleInsertAfterIdxRef.current = messages.length - 1
    }
  }, [showInput, stepIdx, flowVersion]) // eslint-disable-line react-hooks/exhaustive-deps

  // Pin the Answer Page card position at the reader-answer step
  useEffect(() => {
    if (currentStep.id === 'reader-answer' && showInput && readerAnswerInsertAfterIdxRef.current === -1) {
      readerAnswerInsertAfterIdxRef.current = messages.length - 1
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
      setDynamicMaxH(`${Math.max(320, Math.round(available))}px`)
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
    setReaderQuestionId('')
    setReaderProduct(null)
    readerArticleInsertAfterIdxRef.current = -1
    readerAnswerInsertAfterIdxRef.current = -1
    readerProductCardInsertAfterIdxRef.current = -1
    setEngaged(false)
    setDynamicMaxH('60vh')
    // Reset analytics tracking state for fresh session
    flowCompletedRef.current = false
    currentFlowNameRef.current = detectFlowName(originalFlowRef.current)
    prevStepIdRef.current = ''
    selectedPersonaRef.current = ''
    trackStartTimeRef.current = Date.now()
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
    // User interacted — resume auto-scroll so new content is visible
    userScrolledUpRef.current = false

    // FR-07: track every button click
    trackAG('agentdialog_button_click', {
      flow: currentFlowNameRef.current,
      step_id: currentStep.id,
      button_label: userLabel,
      button_value: userValue,
    })

    if (userValue === '__reader__') {
      currentFlowNameRef.current = 'READER_FLOW'
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

    engageAndScroll()
    setShowInput(false)
    addHistory({ role: 'user', content: userLabel })

    if (currentStep.id === 'step1-persona') {
      setPersona(userValue as AgentPersona)
      selectedPersonaRef.current = userValue
      // Split analytics flow by persona so GA4 filters don't need a separate persona dimension
      if (userValue === 'publisher') currentFlowNameRef.current = 'PUBLISHER_FLOW'
      else if (userValue === 'brand') currentFlowNameRef.current = 'BRAND_FLOW'
      else if (userValue === 'developer') currentFlowNameRef.current = 'DEVELOPER_FLOW'
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
      if (!flowCompletedRef.current) {
        flowCompletedRef.current = true
        trackAG('agentdialog_flow_complete', {
          flow: currentFlowNameRef.current,
          persona: selectedPersonaRef.current || persona || '',
        })
      }
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
      if (!flowCompletedRef.current) {
        flowCompletedRef.current = true
        trackAG('agentdialog_flow_complete', {
          flow: currentFlowNameRef.current,
          persona: selectedPersonaRef.current || persona || '',
        })
      }
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
    setTimeout(() => router.push('/book-a-demo'), 400)
  }

  // ── Derived ───────────────────────────────────────────────────────────────

  const isReader = currentMode === 'reader'
  const borderColor = isDark ? 'rgba(34,93,89,0.7)' : '#E5E5E5'
  const bg = isDark ? 'rgba(18,46,44,0.88)' : 'rgba(255,255,255,0.97)'
  const headerBg = isDark ? 'rgba(34,93,89,0.45)' : '#225D59'

  const ctaStep = currentStep.inputType === 'cta'
  const ctaOption = currentStep.options?.find(o => {
    if (persona === 'publisher') return o.value === '/content-owners'
    if (persona === 'brand') return o.value === '/brands'
    if (persona === 'developer') return o.value === '/developers'
    return false
  }) ?? currentStep.options?.[0]

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
                  className={opt.value === '__reader__' ? 'pill-btn pill-btn--stylist' : (isDark ? 'pill-btn pill-btn--dark' : 'pill-btn')}
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
                {/* Skip rendering an empty agent bubble when the Answer Page card fills that slot */}
                <div className={`flex ${(isReader && i === readerAnswerInsertAfterIdxRef.current && msg.role === 'agent' && !msg.text && !msg.isTyping) ? 'hidden' : (msg.role === 'user' ? 'justify-end' : 'justify-start')}`}>
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
                      onProgress={() => scrollToBottom()}
                      onComplete={() => {
                        setDemoComplete(true)
                        setTimeout(() => scrollToBottom(), 50)
                      }}
                    />
                  </div>
                )}

                {/* ArticleQnADemo — pinned after the reader-article step message, only when bubble is done typing */}
                {isReader && readerArticleInsertAfterIdxRef.current !== -1 && msg.role === 'agent' && i === readerArticleInsertAfterIdxRef.current && !msg.isTyping && (
                  <motion.div
                    className="mt-2"
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.35, ease: 'easeOut' }}
                  >
                    <ArticleQnADemo
                      isDark={isDark}
                      disabled={messages[messages.length - 1]?.isTyping === true}
                      onSelect={(label, value) => advance(label, value)}
                    />
                  </motion.div>
                )}

                {/* Answer Page card — replaces the empty reader-answer bubble, only after prior bubble done */}
                {isReader && readerAnswerInsertAfterIdxRef.current !== -1 && msg.role === 'agent' && i === readerAnswerInsertAfterIdxRef.current && !msg.isTyping && (() => {
                  const q = READER_QUESTIONS.find(rq => rq.id === readerQuestionId)
                  if (!q) return null
                  const cardBg = isDark ? 'rgba(255,255,255,0.04)' : 'white'
                  const cardBorder = isDark ? 'rgba(255,255,255,0.1)' : '#E5E5E5'
                  const textPrimary = isDark ? '#FAFAFA' : '#1A1A1A'
                  const textSecondary = isDark ? 'rgba(250,250,250,0.55)' : '#7A7A7A'
                  const dividerColor = isDark ? 'rgba(255,255,255,0.08)' : '#EEEEEE'
                  return (
                    <motion.div
                      className="mt-2 rounded-xl overflow-hidden"
                      style={{ border: `1px solid ${cardBorder}`, background: cardBg, boxShadow: isDark ? 'none' : '0 2px 12px rgba(0,0,0,0.07)' }}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.35, ease: 'easeOut' }}
                    >
                      {/* Header */}
                      <div
                        className="flex items-center gap-2 px-3 py-2 border-b"
                        style={{ borderColor: cardBorder }}
                      >
                        <div
                          className="w-4 h-4 rounded-sm flex items-center justify-center flex-shrink-0"
                          style={{ background: '#225D59' }}
                        >
                          <span style={{ fontSize: 7, fontWeight: 900, color: 'white', letterSpacing: '-0.02em' }}>M</span>
                        </div>
                        <span style={{ fontSize: 10, fontWeight: 600, color: textSecondary, letterSpacing: '0.04em' }}>
                          ANSWER PAGE
                        </span>
                      </div>
                      {/* Question */}
                      <div className="px-3 pt-2.5 pb-2">
                        <p style={{ fontSize: 12, fontWeight: 700, color: textPrimary, lineHeight: 1.4, marginBottom: 0 }}>
                          {q.text}
                        </p>
                      </div>
                      {/* Divider */}
                      <div style={{ height: 1, background: dividerColor, marginLeft: 12, marginRight: 12 }} />
                      {/* Answer */}
                      <div className="px-3 pt-2 pb-3">
                        <p style={{ fontSize: 11, color: textSecondary, lineHeight: 1.65, whiteSpace: 'pre-wrap' }}>
                          {q.answer}
                        </p>
                      </div>
                    </motion.div>
                  )
                })()}

                {/* Reader product card — pinned at the product-card step message index, only after bubble done */}
                {isReader && readerProduct && msg.role === 'agent' && i === readerProductCardInsertAfterIdxRef.current && !msg.isTyping && (
                  <motion.div
                    className="mt-2"
                    style={{ maxWidth: 300 }}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.45, ease: 'easeOut' }}
                  >
                    <div
                      style={{
                        borderRadius: 12,
                        overflow: 'hidden',
                        border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)'}`,
                        background: isDark ? 'rgba(18,46,44,0.7)' : 'white',
                        boxShadow: isDark ? '0 4px 20px rgba(0,0,0,0.35)' : '0 2px 16px rgba(0,0,0,0.07)',
                      }}
                    >
                      {/* Photo */}
                      <div style={{ aspectRatio: '1/1', overflow: 'hidden', background: '#e8e8e8' }}>
                        <img
                          src={readerProduct.imageUrl}
                          alt={readerProduct.name}
                          style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', opacity: 0, transition: 'opacity 0.3s ease' }}
                          onLoad={e => { (e.currentTarget as HTMLImageElement).style.opacity = '1' }}
                          onError={e => { (e.currentTarget as HTMLImageElement).style.opacity = '1' }}
                        />
                      </div>

                      {/* Text */}
                      <div style={{ padding: '10px 12px 8px', textAlign: 'left' }}>
                        {/* Header block */}
                        <p style={{ fontSize: 8, fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', color: isDark ? 'rgba(250,250,250,0.35)' : '#BBBBBB', marginBottom: 3 }}>
                          {readerProduct.brand}
                        </p>
                        <p style={{ fontSize: 15, fontWeight: 800, color: isDark ? '#FFFFFF' : '#111111', lineHeight: 1.15, letterSpacing: '-0.025em', marginBottom: 4 }}>
                          {readerProduct.name}
                        </p>
                        <p style={{ fontSize: 10, fontWeight: 400, color: isDark ? 'rgba(250,250,250,0.65)' : '#555', lineHeight: 1.45, marginBottom: 0 }}>
                          {readerProduct.tagline}
                        </p>

                        {/* Divider */}
                        <div style={{ height: 1, background: isDark ? 'rgba(255,255,255,0.08)' : '#EEEEEE', margin: '8px 0' }} />

                        {/* Features */}
                        <ul style={{ margin: '0 0 8px', padding: 0, listStyle: 'none' }}>
                          {readerProduct.features.map((f, fi) => (
                            <li key={fi} style={{ display: 'flex', alignItems: 'baseline', gap: 5, marginBottom: 3 }}>
                              <span style={{ fontSize: 8, color: '#225D59', flexShrink: 0 }}>▸</span>
                              <span style={{ fontSize: 9.5, color: isDark ? 'rgba(250,250,250,0.65)' : '#555', lineHeight: 1.45 }}>{f}</span>
                            </li>
                          ))}
                        </ul>

                        {/* CTA */}
                        <a
                          href={readerProduct.ctaHref}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{
                            display: 'block',
                            textAlign: 'center',
                            fontSize: 10.5,
                            fontWeight: 700,
                            color: 'white',
                            background: '#225D59',
                            borderRadius: 7,
                            padding: '7px 0',
                            textDecoration: 'none',
                            letterSpacing: '0.02em',
                            transition: 'opacity 0.15s',
                          }}
                          onMouseEnter={e => (e.currentTarget.style.opacity = '0.82')}
                          onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
                        >
                          {readerProduct.ctaLabel}
                        </a>
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
                        className={opt.value === '__reader__' ? 'pill-btn pill-btn--stylist' : (isDark ? 'pill-btn pill-btn--dark' : 'pill-btn')}
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
                      {ctaOption.label}
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
