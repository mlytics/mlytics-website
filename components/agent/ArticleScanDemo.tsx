'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import {
  DEMO_ARTICLES, DEMO_QUESTIONS, DEMO_EXT_ARTICLES, DEFAULT_DEMO_ARTICLE_ID,
  type DemoQuestion, type DemoExtArticle,
} from '@/lib/agent-data'

type Phase = 'scanning' | 'questions' | 'articles' | 'done'

interface ArticleScanDemoProps {
  articleId?: string
  onComplete: () => void
  onProgress?: () => void
}

export function ArticleScanDemo({ articleId = DEFAULT_DEMO_ARTICLE_ID, onComplete, onProgress }: ArticleScanDemoProps) {
  const prefersReduced = useReducedMotion()
  const delay = (ms: number) => prefersReduced ? 0 : ms

  const article = DEMO_ARTICLES.find(a => a.id === articleId) ?? DEMO_ARTICLES[0]
  const questions: DemoQuestion[] = DEMO_QUESTIONS[articleId] ?? DEMO_QUESTIONS[DEFAULT_DEMO_ARTICLE_ID]
  const extArticles: DemoExtArticle[] = DEMO_EXT_ARTICLES[articleId] ?? DEMO_EXT_ARTICLES[DEFAULT_DEMO_ARTICLE_ID]

  const [phase, setPhase] = useState<Phase>('scanning')
  const [visibleQs, setVisibleQs] = useState(0)
  const [visibleArts, setVisibleArts] = useState(0)
  const [scanProgress, setScanProgress] = useState(0)

  useEffect(() => {
    let cancelled = false
    const run = async () => {
      for (let i = 1; i <= 20; i++) {
        await new Promise(r => setTimeout(r, delay(60)))
        if (cancelled) return
        setScanProgress(i / 20 * 100)
        if (i === 20) onProgress?.()
      }
      await new Promise(r => setTimeout(r, delay(300)))
      if (cancelled) return
      setPhase('questions')
      onProgress?.()
      for (let i = 1; i <= questions.length; i++) {
        await new Promise(r => setTimeout(r, delay(380)))
        if (cancelled) return
        setVisibleQs(i)
        onProgress?.()
      }
      await new Promise(r => setTimeout(r, delay(400)))
      if (cancelled) return
      setPhase('articles')
      onProgress?.()
      for (let i = 1; i <= extArticles.length; i++) {
        await new Promise(r => setTimeout(r, delay(280)))
        if (cancelled) return
        setVisibleArts(i)
        onProgress?.()
      }
      await new Promise(r => setTimeout(r, delay(500)))
      if (cancelled) return
      setPhase('done')
      onProgress?.()
      onComplete()
    }
    run()
    return () => { cancelled = true }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="w-full space-y-3 text-sm">
      {/* Article card */}
      <div className="rounded-xl border p-3" style={{ borderColor: 'rgba(34,93,89,0.3)', background: 'rgba(34,93,89,0.08)' }}>
        <div className="flex items-center gap-2 mb-2">
          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
            style={{ background: 'rgba(34,93,89,0.2)', color: '#A8C5C3' }}>
            {article.category}
          </span>
          <span className="text-[10px] text-[#A8C5C3]">Analyzing content structure…</span>
        </div>
        <p className="text-xs font-medium leading-snug" style={{ color: '#FAFAFA' }}>{article.title}</p>
        <div className="mt-2.5 h-1 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.1)' }}>
          <motion.div
            className="h-full rounded-full"
            style={{ background: '#F59E0B' }}
            initial={{ width: 0 }}
            animate={{ width: `${scanProgress}%` }}
            transition={{ duration: prefersReduced ? 0 : 0.08 }}
          />
        </div>
      </div>

      {/* Questions */}
      <AnimatePresence>
        {(phase === 'questions' || phase === 'articles' || phase === 'done') && (
          <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="space-y-1.5">
            <p className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: '#A8C5C3' }}>
              Reader intent signals detected
            </p>
            {questions.slice(0, visibleQs).map((q, i) => (
              <motion.div
                key={q.id}
                initial={{ opacity: 0, x: -6 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: prefersReduced ? 0 : 0.18 }}
                className="flex items-start gap-2"
              >
                <span className="shrink-0 mt-0.5 text-[10px] font-bold" style={{ color: '#A8C5C3' }}>{i + 1}.</span>
                <span className="flex-1 text-xs leading-snug" style={{ color: '#FAFAFA' }}>{q.text}</span>
                <span className={`shrink-0 text-[9px] font-semibold px-1.5 py-0.5 rounded-full ${
                  q.intentStrength === 'strong'
                    ? 'bg-amber-400/20 text-amber-300'
                    : 'bg-white/10 text-[#A8C5C3]'
                }`}>
                  {q.intentStrength === 'strong' ? '⚡ Strong' : 'Weak'}
                </span>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Extended articles */}
      <AnimatePresence>
        {(phase === 'articles' || phase === 'done') && (
          <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="space-y-1.5">
            <p className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: '#A8C5C3' }}>
              Decision Engine generating follow-up content
            </p>
            {extArticles.slice(0, visibleArts).map(a => (
              <motion.div
                key={a.id}
                initial={{ opacity: 0, x: -6 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: prefersReduced ? 0 : 0.18 }}
                className="flex items-start gap-2 rounded-lg p-2"
                style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)' }}
              >
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium leading-snug" style={{ color: '#FAFAFA' }}>{a.title}</p>
                  <p className="text-[10px] mt-0.5" style={{ color: '#A8C5C3' }}>{a.summary}</p>
                </div>
                <div className="shrink-0 text-right">
                  <p className="text-xs font-bold" style={{ color: '#F59E0B' }}>{a.cost}</p>
                  <p className="text-[9px]" style={{ color: '#A8C5C3' }}>{a.intentType}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
