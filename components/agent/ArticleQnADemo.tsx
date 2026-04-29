'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { READER_QUESTIONS, type ReaderQuestion } from '@/lib/agent-data'


interface ArticleQnADemoProps {
  isDark?: boolean
  onSelect: (label: string, value: string) => void
}

export function ArticleQnADemo({ isDark = true, onSelect }: ArticleQnADemoProps) {
  const [selected, setSelected] = useState<string | null>(null)
  const frozen = selected !== null

  const textPrimary = isDark ? '#FAFAFA' : '#1A1A1A'
  const textSecondary = isDark ? 'rgba(250,250,250,0.55)' : '#7A7A7A'
  const cardBg = isDark ? 'rgba(255,255,255,0.04)' : 'white'
  const cardBorder = isDark ? 'rgba(255,255,255,0.1)' : '#E5E5E5'
  const questionHoverBg = isDark ? 'rgba(34,93,89,0.25)' : 'rgba(34,93,89,0.06)'
  const questionSelectedBg = isDark ? 'rgba(34,93,89,0.4)' : 'rgba(34,93,89,0.1)'
  const questionBorder = isDark ? 'rgba(34,93,89,0.5)' : '#225D59'

  function handleClick(q: ReaderQuestion) {
    if (frozen) return
    setSelected(q.id)
    setTimeout(() => onSelect(q.text, q.id), 250)
  }

  return (
    <div className="w-full space-y-2 text-sm">
      {/* Article card */}
      <div
        className="rounded-xl overflow-hidden"
        style={{ border: `1px solid ${cardBorder}`, background: cardBg }}
      >
        {/* Source bar */}
        <div
          className="flex items-center gap-2 px-3 py-2 border-b"
          style={{ borderColor: cardBorder }}
        >
          <div
            className="w-4 h-4 rounded-sm flex items-center justify-center flex-shrink-0"
            style={{ background: '#E31837' }}
          >
            <span style={{ fontSize: 7, fontWeight: 900, color: 'white', letterSpacing: '-0.02em' }}>N</span>
          </div>
          <span style={{ fontSize: 10, fontWeight: 600, color: textSecondary, letterSpacing: '0.04em' }}>
            NEWSWEEK · AUTOMOTIVE
          </span>
          <span
            className="ml-auto flex-shrink-0"
            style={{ fontSize: 9, color: textSecondary }}
          >
            Apr 21, 2026
          </span>
        </div>

        {/* Article body */}
        <div className="px-3 py-2.5">
          <p
            style={{
              fontSize: 12,
              fontWeight: 700,
              color: textPrimary,
              lineHeight: 1.4,
              marginBottom: 6,
            }}
          >
            New York Drivers Can Now Get Up to $2,000 Toward a New Electric Car
          </p>
          <p style={{ fontSize: 10.5, color: textSecondary, lineHeight: 1.5 }}>
            Thousands of New York drivers can now qualify for up to $2,000 off the purchase or lease
            of a new electric vehicle, after Governor Hochul announced an additional $30 million in
            state funding for the Drive Clean Rebate program...{' '}
            <a
              href="https://www.newsweek.com/new-york-drivers-can-now-get-up-to-2000-toward-a-new-electric-car-11860785"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                fontSize: 10,
                fontWeight: 600,
                color: isDark ? '#A8C5C3' : '#225D59',
                textDecoration: 'underline',
                letterSpacing: '0.01em',
              }}
            >
              Read full article
            </a>
          </p>
        </div>
      </div>

      {/* Questions list */}
      <div className="space-y-1.5">
        {READER_QUESTIONS.map((q, idx) => {
          const isSelected = selected === q.id
          const isDimmed = frozen && !isSelected

          return (
            <motion.button
              key={q.id}
              onClick={() => handleClick(q)}
              disabled={frozen}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: isDimmed ? 0.35 : 1, y: 0 }}
              transition={{ duration: 0.25, delay: idx * 0.06 }}
              className="w-full text-left rounded-lg px-3 py-2.5"
              style={{
                border: `1.5px solid ${isSelected ? questionBorder : cardBorder}`,
                background: isSelected ? questionSelectedBg : cardBg,
                cursor: frozen ? 'default' : 'pointer',
                transition: 'background 0.2s ease, border-color 0.2s ease',
              }}
              onMouseEnter={e => {
                if (!frozen) (e.currentTarget as HTMLElement).style.background = questionHoverBg
              }}
              onMouseLeave={e => {
                if (!frozen) (e.currentTarget as HTMLElement).style.background = cardBg
              }}
            >
              <div className="flex items-start gap-2">
                {/* Question number */}
                <span
                  className="flex-shrink-0 w-4 h-4 rounded-full flex items-center justify-center mt-0.5"
                  style={{
                    fontSize: 9,
                    fontWeight: 700,
                    background: isSelected ? '#225D59' : (isDark ? 'rgba(255,255,255,0.1)' : 'rgba(34,93,89,0.1)'),
                    color: isSelected ? 'white' : (isDark ? 'rgba(250,250,250,0.6)' : '#225D59'),
                    transition: 'background 0.2s, color 0.2s',
                  }}
                >
                  {idx + 1}
                </span>

                <div className="flex-1 min-w-0">
                  <p style={{ fontSize: 11, color: textPrimary, lineHeight: 1.45, fontWeight: isSelected ? 600 : 400 }}>
                    {q.text}
                  </p>
                </div>
              </div>
            </motion.button>
          )
        })}
      </div>

      {/* Product annotation */}
      <AnimatePresence>
        {!frozen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex items-center gap-1.5 px-1"
          >
            <span
              className="w-1.5 h-1.5 rounded-full animate-pulse"
              style={{ background: '#225D59' }}
            />
            <span style={{ fontSize: 9.5, color: textSecondary, letterSpacing: '0.02em' }}>
              <span style={{ color: isDark ? '#A8C5C3' : '#225D59', fontWeight: 600 }}>
                01 AI Q&A Widget
              </span>
              {' '}— Every article becomes an interactive answer surface
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
