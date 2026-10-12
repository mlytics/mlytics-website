import { useRef, useState, type FocusEvent, type KeyboardEvent, type RefObject } from 'react'
import { RotateCcw, Volume2, VolumeX } from 'lucide-react'
import {
  CHAT_QUESTIONS,
  EXPERIENCE_INSTRUCTIONS,
  EXPERIENCE_LABELS,
  LISTEN_DURATION_SECONDS,
  LISTEN_TRANSCRIPT,
  QUOTE_FEEDBACK_OPTIONS,
  QUOTE_OPTIONS,
  UI,
} from './ai-mode-playground-copy'
import type { ExperienceId, ShareAction } from './ai-mode-playground-copy'
import { formatTime, nextTabIndex } from './playground-logic'
import type { PlaygroundState } from './playground-logic'
import { SHARE_ICONS } from './ShareIcons'
import styles from './ExperiencePanel.module.css'

export type ExperiencePanelProps = {
  state: PlaygroundState
  onSelectExperience: (id: ExperienceId) => void
  onReset: () => void
  onChooseQuestion: (index: 0 | 1 | 2) => void
  onSelectQuote: (index: 0 | 1 | 2) => void
  onFeedback: (value: string) => void
  onSignature: (value: string) => void
  onShare: (action: ShareAction) => void
  onRevealSignal: () => void
  onListenToggle: () => void
  onListenReplay: () => void
  onListenRetry: () => void
  /** The playground writes the fill width on this node directly (smooth rAF motion). */
  listenFillRef?: RefObject<HTMLSpanElement | null>
  /** Flat index of the transcript sentence being spoken, -1 for none. */
  activeSentence?: number
  /** Player preference only; signals and captures never depend on it. */
  listenMuted?: boolean
  onListenToggleMute?: () => void
}

const EXPERIENCES: ExperienceId[] = ['chat', 'quote', 'listen']

export function ExperiencePanel({
  state,
  onSelectExperience,
  onReset,
  onChooseQuestion,
  onSelectQuote,
  onFeedback,
  onSignature,
  onShare,
  onRevealSignal,
  onListenToggle,
  onListenReplay,
  onListenRetry,
  listenFillRef,
  activeSentence = -1,
  listenMuted = false,
  onListenToggleMute,
}: ExperiencePanelProps) {
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([])
  const feedbackRefs = useRef<(HTMLButtonElement | null)[]>([])
  const checkedFeedbackIndex = QUOTE_FEEDBACK_OPTIONS.indexOf(state.quote.feedback)
  // While focus is inside the group, the focused radio is the tabbable one;
  // once focus leaves, the checked radio (or the first) takes over again.
  const [focusedFeedbackIndex, setFocusedFeedbackIndex] = useState<number | null>(null)
  const tabbableFeedbackIndex = focusedFeedbackIndex ?? (checkedFeedbackIndex >= 0 ? checkedFeedbackIndex : 0)
  const selectedQuote = state.quote.index
  const listenStatus = state.listen.status
  const listenLabel =
    listenStatus === 'completed'
      ? UI.listen.replay
      : listenStatus === 'playing'
        ? UI.listen.pause
        : listenStatus === 'error'
          ? UI.listen.retry
          : UI.listen.play
  const onListenClick =
    listenStatus === 'completed' ? onListenReplay : listenStatus === 'error' ? onListenRetry : onListenToggle

  const handleTabKeyDown = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    const next = nextTabIndex(event.key, index, EXPERIENCES.length)
    if (next !== null) {
      event.preventDefault()
      tabRefs.current[next]?.focus()
      return
    }
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      onSelectExperience(EXPERIENCES[index])
    }
  }

  // Radio group keyboard (owner decision): arrows and Home/End move focus only,
  // wrapping at either end; Space/Enter (native button activation) or a click
  // selects. Selection is what triggers the focus move to the raw signal.
  const handleFeedbackKeyDown = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    const count = QUOTE_FEEDBACK_OPTIONS.length
    let next: number | null = null
    if (event.key === 'ArrowRight' || event.key === 'ArrowDown') next = (index + 1) % count
    else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') next = (index - 1 + count) % count
    else if (event.key === 'Home') next = 0
    else if (event.key === 'End') next = count - 1
    if (next === null) return
    event.preventDefault()
    setFocusedFeedbackIndex(next)
    feedbackRefs.current[next]?.focus()
  }

  const handleFeedbackBlur = (event: FocusEvent<HTMLDivElement>) => {
    if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setFocusedFeedbackIndex(null)
  }

  const handleReset = () => {
    onReset()
    tabRefs.current[EXPERIENCES.indexOf(state.experience)]?.focus()
  }

  return (
    <section className={styles.panel}>
      <div className={styles.tabs} role="tablist" aria-label={UI.experienceTablistLabel}>
        {EXPERIENCES.map((experience, index) => (
          <button
            className={styles.tab}
            id={`experience-tab-${experience}`}
            key={experience}
            type="button"
            role="tab"
            aria-selected={state.experience === experience}
            aria-controls="experience-panel"
            tabIndex={state.experience === experience ? 0 : -1}
            ref={(element) => { tabRefs.current[index] = element }}
            onClick={() => onSelectExperience(experience)}
            onKeyDown={(event) => handleTabKeyDown(event, index)}
          >
            {EXPERIENCE_LABELS[experience]}
          </button>
        ))}
      </div>
      <div className={styles.instruction}>
        {EXPERIENCE_INSTRUCTIONS[state.experience]}
      </div>
      <div className={styles.panelBody} id="experience-panel" role="tabpanel" aria-labelledby={`experience-tab-${state.experience}`}>
        {state.experience === 'chat' && (
          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <h3 className={styles.cardTitle}>{UI.chat.title}</h3>
              <button className={styles.reset} type="button" onClick={handleReset}>{UI.reset}</button>
            </div>
            <ul className={styles.choiceList} aria-label={UI.chat.questionsLabel}>
              {CHAT_QUESTIONS.map((question, index) => {
                return (
                  <li className={styles.choiceItem} key={question}>
                    <button
                      className={styles.choice}
                      type="button"
                      aria-pressed={state.chatQuestionIndex === index}
                      onClick={() => onChooseQuestion(index as 0 | 1 | 2)}
                    >
                      {question}
                    </button>
                  </li>
                )
              })}
            </ul>
          </div>
        )}
        {state.experience === 'quote' && (
          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <h3 className={styles.cardTitle}>{UI.quote.title}</h3>
              <button className={styles.reset} type="button" onClick={handleReset}>{UI.reset}</button>
            </div>
            <div className={styles.quoteLayout}>
              <div className={styles.quoteControls}>
                <div className={styles.step}>
                  <p className={styles.stepLabel}>{UI.quote.step1}</p>
                  <ul className={styles.choiceList} aria-label={UI.quote.optionsLabel}>
                    {QUOTE_OPTIONS.map((quote, index) => (
                      <li className={styles.choiceItem} key={quote}>
                        <button
                          className={styles.choice}
                          type="button"
                          aria-pressed={selectedQuote === index}
                          onClick={() => onSelectQuote(index as 0 | 1 | 2)}
                        >
                          {quote}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className={styles.step}>
                  <p className={styles.stepLabel}>{UI.quote.step2}</p>
                  <div className={styles.feedback} role="radiogroup" aria-label={UI.quote.feedbackLabel} onBlur={handleFeedbackBlur}>
                    {QUOTE_FEEDBACK_OPTIONS.map((feedback, index) => (
                      <button
                        className={styles.feedbackOption}
                        key={feedback}
                        type="button"
                        role="radio"
                        aria-checked={state.quote.feedback === feedback}
                        tabIndex={index === tabbableFeedbackIndex ? 0 : -1}
                        ref={(element) => { feedbackRefs.current[index] = element }}
                        onClick={() => onFeedback(feedback)}
                        onFocus={() => setFocusedFeedbackIndex(index)}
                        onKeyDown={(event) => handleFeedbackKeyDown(event, index)}
                      >
                        {feedback}
                      </button>
                    ))}
                  </div>
                </div>
                <label className={styles.signature}>
                  <span className={styles.stepLabel}>{UI.quote.signatureLabel}</span>
                  <input
                    className={styles.signatureInput}
                    type="text"
                    value={state.quote.signature}
                    placeholder={UI.quote.signaturePlaceholder}
                    aria-label={UI.quote.signatureLabel}
                    onChange={(event) => onSignature(event.target.value)}
                  />
                </label>
              </div>
              <section className={styles.preview} role="region" aria-label={UI.quote.previewLabel}>
                {selectedQuote === null ? (
                  <p className={styles.previewEmpty}>{UI.quote.previewEmpty}</p>
                ) : (
                  <>
                    <div className={styles.quoteCard}>
                      <blockquote className={styles.quoteText}>{QUOTE_OPTIONS[selectedQuote]}</blockquote>
                      <p className={styles.signatureText}>{state.quote.signature.trim() || UI.quote.anonymous}</p>
                      <div className={styles.sponsor}>
                        <span className={styles.sponsorLabel}>{UI.quote.sponsoredBy}</span>
                        <img className={styles.sponsorLogo} src="/logo.svg" alt="Mlytics" width={115} />
                      </div>
                    </div>
                    <div className={styles.shareRow}>
                      <div className={styles.shareActions} role="group" aria-label={UI.quote.actionsLabel}>
                        {(Object.keys(UI.quote.actions) as ShareAction[]).map((action) => {
                          const Icon = SHARE_ICONS[action]
                          return (
                            <button className={styles.shareButton} key={action} type="button" onClick={() => onShare(action)}>
                              <Icon className={styles.shareIcon} aria-hidden="true" focusable="false" />
                              <span className={styles.shareLabel}>{UI.quote.actions[action]}</span>
                            </button>
                          )
                        })}
                      </div>
                      {state.quote.feedback !== '' && (
                        <button type="button" className={styles.revealSignal} onClick={onRevealSignal}>
                          {UI.quote.revealSignal}
                        </button>
                      )}
                    </div>
                  </>
                )}
              </section>
            </div>
          </div>
        )}
        {state.experience === 'listen' && (
          <div className={styles.card}>
            <div className={`${styles.cardHeader} ${styles.cardHeaderListen}`}>
              <h3 className={styles.cardTitle}>{UI.listen.title}</h3>
              <button className={styles.reset} type="button" onClick={handleReset}>{UI.reset}</button>
            </div>
            <div className={styles.listenVisual}>
              <button
                className={styles.listenToggle}
                type="button"
                aria-label={listenLabel}
                aria-describedby={listenStatus === 'error' ? 'listen-error' : undefined}
                onClick={onListenClick}
              >
                {listenStatus === 'completed' ? (
                  // lucide RotateCcw: the standard counter-clockwise replay glyph.
                  <RotateCcw className={styles.listenIcon} size={18} aria-hidden="true" focusable="false" />
                ) : listenStatus === 'playing' ? (
                  <svg className={styles.listenIcon} width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" focusable="false">
                    <path d="M7 5h3v14H7zM14 5h3v14h-3z" />
                  </svg>
                ) : (
                  <svg className={styles.listenIcon} width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" focusable="false">
                    <path d="M8 5v14l11-7L8 5Z" />
                  </svg>
                )}
                <span className={styles.buttonLabel}>{listenLabel}</span>
              </button>
              <div
                className={styles.listenProgress}
                role="progressbar"
                aria-label={UI.listen.progressLabel}
                aria-valuemin={0}
                aria-valuemax={LISTEN_DURATION_SECONDS}
                aria-valuenow={state.listen.elapsed}
                aria-valuetext={UI.listen.progressValueText(state.listen.elapsed, LISTEN_DURATION_SECONDS)}
              >
                {/* Width is written by useListenFill, not React, so re-renders never fight the rAF motion. */}
                <span className={styles.listenFill} ref={listenFillRef} />
              </div>
              {/* The total is hidden on phones (display: none); aria-valuetext still says "N of 27 seconds". */}
              <span className={styles.listenTime}>
                <span>{formatTime(state.listen.elapsed)}</span>
                <span className={styles.listenTimeTotal}>{` / ${formatTime(LISTEN_DURATION_SECONDS)}`}</span>
              </span>
              <span className={styles.listenStatus}>
                {listenStatus === 'completed'
                  ? UI.listen.status.completed
                  : listenStatus === 'playing'
                    ? UI.listen.status.playing
                    : listenStatus === 'paused'
                      ? UI.listen.status.paused
                      : listenStatus === 'error'
                      ? UI.listen.status.unavailable
                      : UI.listen.status.ready}
              </span>
              {/* Toggle button: the name stays "Mute" and aria-pressed carries the state (WCAG 4.1.2). */}
              <button
                className={styles.listenMute}
                type="button"
                aria-label={UI.listen.mute}
                aria-pressed={listenMuted}
                onClick={onListenToggleMute}
              >
                {listenMuted ? (
                  <VolumeX className={styles.listenIcon} size={18} aria-hidden="true" focusable="false" />
                ) : (
                  <Volume2 className={styles.listenIcon} size={18} aria-hidden="true" focusable="false" />
                )}
                <span className={styles.buttonLabel}>{UI.listen.mute}</span>
              </button>
            </div>
            {listenStatus === 'error' && (
              <p className={styles.listenError} id="listen-error">{UI.listen.error}</p>
            )}
            <details className={styles.transcript}>
              <summary className={styles.transcriptSummary}>{UI.listen.transcript}</summary>
              {LISTEN_TRANSCRIPT.map((paragraph, paragraphIndex) => {
                const offset = LISTEN_TRANSCRIPT.slice(0, paragraphIndex).reduce((sum, previous) => sum + previous.length, 0)
                return (
                  <p className={styles.transcriptParagraph} key={paragraphIndex}>
                    {paragraph.map((sentence, sentenceIndex) => {
                      const index = offset + sentenceIndex
                      return (
                        <span key={index}>
                          {sentenceIndex > 0 && ' '}
                          <span
                            className={styles.transcriptSentence}
                            data-sentence={index}
                            aria-current={index === activeSentence ? 'true' : undefined}
                          >
                            {sentence.text}
                          </span>
                        </span>
                      )
                    })}
                  </p>
                )
              })}
            </details>
          </div>
        )}
      </div>
    </section>
  )
}
