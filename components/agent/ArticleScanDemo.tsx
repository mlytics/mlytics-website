'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import {
  DEMO_ARTICLES, DEMO_EXT_ARTICLES, DEFAULT_DEMO_ARTICLE_ID,
  type DemoExtArticle,
} from '@/lib/agent-data'

type Phase = 'scanning' | 'articles' | 'done'

interface ArticleScanDemoProps {
  articleId?: string
  isDark?: boolean
  onComplete: () => void
  onProgress?: () => void
}

export function ArticleScanDemo({ articleId = DEFAULT_DEMO_ARTICLE_ID, isDark = true, onComplete, onProgress }: ArticleScanDemoProps) {
  const textPrimary = isDark ? '#FAFAFA' : '#1A1A1A'
  const textSecondary = isDark ? '#A8C5C3' : '#5A5A5A'
  const cardBg = isDark ? 'rgba(34,93,89,0.08)' : 'rgba(34,93,89,0.06)'
  const cardBorder = isDark ? 'rgba(34,93,89,0.3)' : 'rgba(34,93,89,0.2)'
  const tagBg = isDark ? 'rgba(34,93,89,0.2)' : 'rgba(34,93,89,0.12)'
  const extBg = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(34,93,89,0.04)'
  const extBorder = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(34,93,89,0.12)'
  const trackBg = isDark ? 'rgba(255,255,255,0.1)' : 'rgba(34,93,89,0.1)'
  const prefersReduced = useReducedMotion()
  const delay = (ms: number) => prefersReduced ? 0 : ms

  const article = DEMO_ARTICLES.find(a => a.id === articleId) ?? DEMO_ARTICLES[0]
  const extArticles: DemoExtArticle[] = DEMO_EXT_ARTICLES[articleId] ?? DEMO_EXT_ARTICLES[DEFAULT_DEMO_ARTICLE_ID]

  const [phase, setPhase] = useState<Phase>('scanning')
  const [visibleArts, setVisibleArts] = useState(0)
  const [scanProgress, setScanProgress] = useState(0)

  useEffect(() => {
    let cancelled = false
    const run = async () => {
      // Scanning phase
      for (let i = 1; i <= 20; i++) {
        await new Promise(r => setTimeout(r, delay(60)))
        if (cancelled) return
        setScanProgress(i / 20 * 100)
        if (i === 20) onProgress?.()
      }
      await new Promise(r => setTimeout(r, delay(400)))
      if (cancelled) return

      // Articles phase — skip questions entirely
      setPhase('articles')
      onProgress?.()
      for (let i = 1; i <= extArticles.length; i++) {
        await new Promise(r => setTimeout(r, delay(300)))
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
      <div className="rounded-xl border p-3" style={{ borderColor: cardBorder, background: cardBg }}>
        <div className="flex items-center gap-2 mb-2">
          <span
            className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
            style={{ background: tagBg, color: textSecondary }}
          >
            {article.category}
          </span>
          <span className="text-[10px]" style={{ color: textSecondary }}>
            Analyzing content structure…
          </span>
        </div>
        <p className="text-xs font-medium leading-snug text-left" style={{ color: textPrimary }}>
          {article.title}
        </p>
        <div className="mt-2.5 h-1 rounded-full overflow-hidden" style={{ background: trackBg }}>
          <motion.div
            className="h-full rounded-full"
            style={{ background: '#F59E0B' }}
            initial={{ width: 0 }}
            animate={{ width: `${scanProgress}%` }}
            transition={{ duration: prefersReduced ? 0 : 0.08 }}
          />
        </div>
      </div>

      {/* Extended articles — Decision Engine follow-up content */}
      <AnimatePresence>
        {(phase === 'articles' || phase === 'done') && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-1.5"
          >
            <p
              className="text-[10px] font-semibold uppercase tracking-wider"
              style={{ color: textSecondary }}
            >
              Decision Engine generating follow-up content
            </p>
            {extArticles.slice(0, visibleArts).map(a => {
              const inner = (
                <>
                  <div className="flex-1 min-w-0 text-left">
                    <p className="text-xs font-medium leading-snug line-clamp-1" style={{ color: textPrimary }}>
                      {a.title}
                    </p>
                    <p className="text-[10px] mt-0.5 line-clamp-1" style={{ color: textSecondary }}>
                      {a.summary}
                    </p>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="text-xs font-bold" style={{ color: '#F59E0B' }}>{a.cost}</p>
                    <p className="text-[9px]" style={{ color: textSecondary }}>Cost</p>
                  </div>
                </>
              )
              const cardStyle = { background: extBg, border: `1px solid ${extBorder}` }
              const cardClass = `flex items-start gap-2 rounded-lg p-2 transition-opacity${a.url ? ' hover:opacity-80 cursor-pointer' : ''}`
              return (
                <motion.div
                  key={a.id}
                  initial={{ opacity: 0, x: -6 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: prefersReduced ? 0 : 0.18 }}
                >
                  {a.url ? (
                    <a
                      href={a.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={cardClass}
                      style={cardStyle}
                    >
                      {inner}
                    </a>
                  ) : (
                    <div className={cardClass} style={cardStyle}>
                      {inner}
                    </div>
                  )}
                </motion.div>
              )
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
