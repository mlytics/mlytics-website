import { useRef, useState, type FocusEvent, type KeyboardEvent } from 'react'
import {
  CHAT_QUESTIONS,
  EXPERIENCE_INSTRUCTIONS,
  EXPERIENCE_LABELS,
  LISTEN_DURATION_SECONDS,
  QUOTE_FEEDBACK_OPTIONS,
  QUOTE_OPTIONS,
  UI,
} from './ai-mode-playground-copy'
import type { ExperienceId, ShareAction } from './ai-mode-playground-copy'
import { formatTime, nextTabIndex } from './playground-logic'
import type { PlaygroundState } from './playground-logic'
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
  onListenToggle: () => void
  onListenReplay: () => void
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
  onListenToggle,
  onListenReplay,
}: ExperiencePanelProps) {
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([])
  const feedbackRefs = useRef<(HTMLButtonElement | null)[]>([])
  const checkedFeedbackIndex = QUOTE_FEEDBACK_OPTIONS.indexOf(state.quote.feedback)
  // While focus is inside the group, the focused radio is the tabbable one;
  // once focus leaves, the checked radio (or the first) takes over again.
  const [focusedFeedbackIndex, setFocusedFeedbackIndex] = useState<number | null>(null)
  const tabbableFeedbackIndex = focusedFeedbackIndex ?? (checkedFeedbackIndex >= 0 ? checkedFeedbackIndex : 0)
  const selectedQuote = state.quote.index
  const listenLabel =
    state.listen.status === 'completed'
      ? UI.listen.replay
      : state.listen.status === 'playing'
        ? UI.listen.pause
        : UI.listen.play

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
                      <blockquote className={styles.quoteText}>“{QUOTE_OPTIONS[selectedQuote]}”</blockquote>
                      <p className={styles.signatureText}>{state.quote.signature.trim() || UI.quote.anonymous}</p>
                      <div className={styles.sponsor}>
                        <span className={styles.sponsorLabel}>{UI.quote.sponsoredBy}</span>
                        <img className={styles.sponsorLogo} src="/logo.svg" alt="Mlytics" width={115} />
                      </div>
                    </div>
                    <div className={styles.shareActions} role="group" aria-label={UI.quote.actionsLabel}>
                      {(Object.keys(UI.quote.actions) as ShareAction[]).map((action) => (
                        <button className={styles.shareButton} key={action} type="button" onClick={() => onShare(action)}>
                          {UI.quote.actions[action]}
                        </button>
                      ))}
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
                onClick={state.listen.status === 'completed' ? onListenReplay : onListenToggle}
              >
                {state.listen.status === 'completed' ? (
                  <svg className={styles.listenIcon} width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true" focusable="false">
                    <path d="M20 11a8 8 0 1 0 2 5.3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    <path d="M20 4v7h-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                ) : state.listen.status === 'playing' ? (
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
              <div className={styles.listenTrack}>
                <div
                  className={styles.listenProgress}
                  role="progressbar"
                  aria-label={UI.listen.progressLabel}
                  aria-valuemin={0}
                  aria-valuemax={LISTEN_DURATION_SECONDS}
                  aria-valuenow={state.listen.elapsed}
                >
                  <span className={styles.listenFill} style={{ width: `${(state.listen.elapsed / LISTEN_DURATION_SECONDS) * 100}%` }} />
                </div>
                <div className={styles.listenMeta}>
                  <span className={styles.listenTime}>{formatTime(state.listen.elapsed)}</span>
                  <span className={styles.listenTime}>{formatTime(LISTEN_DURATION_SECONDS)}</span>
                  <span className={styles.listenStatus}>
                    {state.listen.status === 'completed'
                      ? UI.listen.status.completed
                      : state.listen.status === 'playing'
                        ? UI.listen.status.playing
                        : UI.listen.status.ready}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
