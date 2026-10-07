import { useRef, type KeyboardEvent } from 'react'
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
import type { Captures, PlaygroundState } from './playground-logic'
import styles from './ExperiencePanel.module.css'

export type ExperiencePanelProps = {
  state: PlaygroundState
  captures: Captures
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
                  <div className={styles.feedback} role="radiogroup" aria-label={UI.quote.feedbackLabel}>
                    {QUOTE_FEEDBACK_OPTIONS.map((feedback) => (
                      <button
                        className={styles.feedbackOption}
                        key={feedback}
                        type="button"
                        role="radio"
                        aria-checked={state.quote.feedback === feedback}
                        onClick={() => onFeedback(feedback)}
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
            <div className={styles.cardHeader}>
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
