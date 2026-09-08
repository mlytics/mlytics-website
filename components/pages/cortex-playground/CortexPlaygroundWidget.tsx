import type { RefObject } from 'react'
import type { CortexMode, QuoteSource } from './cortex-playground-data'
import { CHAT_CONTENT, LISTEN_CONTENT, QUOTE_CONTENT, WAVEFORM_BARS } from './cortex-playground-data'
import styles from './CortexPlayground.module.css'

type WidgetProps = {
  mode: CortexMode
  selectedIndex: number | null
  quoteFeedback: string | null
  quoteSignature: string
  quoteGenerated: boolean
  quoteActionStatus: string | null
  audioPlaying: boolean
  audioElapsedSeconds: number
  widgetRef?: RefObject<HTMLDivElement | null>
  onQuestion: (index: number) => void
  onQuote: (index: number) => void
  onFeedback: (feedback: string) => void
  onSignature: (signature: string) => void
  onGenerateQuote: () => void
  onQuoteAction: (action: 'line' | 'fb' | 'download') => void
  onAskAnother: () => void
  onListen: () => void
}

const poweredBy = 'POWERED BY MLYTICS AI'

export function CortexPlaygroundWidget({
  mode,
  selectedIndex,
  quoteFeedback,
  quoteSignature,
  quoteGenerated,
  quoteActionStatus,
  audioPlaying,
  audioElapsedSeconds,
  widgetRef,
  onQuestion,
  onQuote,
  onFeedback,
  onSignature,
  onGenerateQuote,
  onQuoteAction,
  onAskAnother,
  onListen,
}: WidgetProps) {
  const content = mode === 'chat' ? CHAT_CONTENT : mode === 'quote' ? QUOTE_CONTENT : LISTEN_CONTENT
  const isSelected = selectedIndex !== null
  const chatAnswer = CHAT_CONTENT.answers[selectedIndex ?? 0]
  const elapsed = `${String(Math.floor(audioElapsedSeconds / 60)).padStart(2, '0')}:${String(audioElapsedSeconds % 60).padStart(2, '0')}`
  const progressPercent = (audioElapsedSeconds / LISTEN_CONTENT.durationSeconds) * 100

  return (
    <div id="cortex-widget" ref={widgetRef} className={styles.widgetPanel} data-testid="cortex-widget">
      <div className={styles.widgetHeader}>
        <div className={styles.widgetMode}><span className={styles.widgetModeMark} aria-hidden="true">✦</span><span>{content.label}</span></div>
        <span className={styles.widgetGrounding}>GROUNDED IN THIS ARTICLE</span>
      </div>

      {mode === 'chat' && (
        <>
          <h3 className={styles.widgetHeading}>Ask something about this article</h3>
          {!isSelected ? (
            <div className={styles.widgetPrompts}>
              <ul className={styles.questionList} aria-label="Article questions">
                {CHAT_CONTENT.questions.map((question, index) => (
                  <li key={question}><button className={styles.choice} type="button" onClick={() => onQuestion(index)}>{question}</button></li>
                ))}
              </ul>
            </div>
          ) : (
            <div className={styles.widgetAnswer} aria-live="polite">
              <p className={styles.selectedPrompt}>{CHAT_CONTENT.questions[selectedIndex]}</p>
              <p>{chatAnswer.selectedIntro}</p>
              <p className={styles.answerProduct}>{chatAnswer.selectedProductLead} <mark>{chatAnswer.product}</mark> {chatAnswer.selectedProductTail}</p>
              <p className={styles.answerGrounded}>{chatAnswer.grounded}</p>
              <button className={`${styles.choice} ${styles.askAnother}`} type="button" onClick={onAskAnother}>← Ask another question</button>
            </div>
          )}
          <div className={styles.widgetStatus} role="status" aria-live="polite" />
        </>
      )}

      {mode === 'quote' && (
        <div className={styles.quoteLayout}>
          <div className={styles.quoteControls}>
            <div className={styles.quoteStep}>
              <span className={styles.quoteStepLabel}>1 · Choose a line</span>
              <ul className={styles.quoteList} aria-label="Quote options">
                {QUOTE_CONTENT.options.map((option, index) => (
                  <QuoteChoice key={option.text} option={option} selected={selectedIndex === index} onClick={() => onQuote(index)} />
                ))}
              </ul>
            </div>
            <div className={styles.quoteFeedbackStep}>
              <span className={styles.quoteStepLabel}>2 · How did this land?</span>
              <div className={styles.quoteFeedback} role="radiogroup" aria-label="Quote feedback">
                {['Great', 'Useful', 'Really?'].map((feedback) => (
                  <button
                    key={feedback}
                    className={styles.quoteFeedbackChoice}
                    type="button"
                    role="radio"
                    aria-checked={quoteFeedback === feedback.toLowerCase().replace('?', '')}
                    onClick={() => onFeedback(feedback.toLowerCase().replace('?', ''))}
                  >
                    {feedback}
                  </button>
                ))}
              </div>
            </div>
            <label className={styles.quoteSignature}>
              <span>Signature <em>(optional)</em></span>
              <input type="text" value={quoteSignature} onChange={(event) => onSignature(event.target.value)} placeholder="Add your name" autoComplete="off" />
            </label>
            <button className={styles.quoteGenerate} type="button" onClick={onGenerateQuote} disabled={!isSelected || !quoteFeedback}>
              {quoteGenerated ? 'Regenerate quote card' : 'Generate quote card'}
            </button>
            <div className={styles.quoteFormStatus} role="status" aria-live="polite" />
          </div>
          <div className={styles.quotePreviewColumn}>
            {!quoteGenerated ? (
              <div className={styles.quotePreviewPlaceholder}><span>Choose a quote and press “Generate quote card” to preview the result.</span></div>
            ) : (
              <section className={styles.quotePreview} aria-label="Quote preview" role="region">
                <div className={styles.quoteCard} aria-label="Cortex quote card">
                  <div className={styles.quoteCardTop}><span>HEARTHSIDE REVIEW</span><span className={styles.quoteCardBrand}>THORNWELL</span></div>
                  <div className={styles.quoteCardQuote}>
                    <span className={styles.quoteMark} aria-hidden="true">“</span>
                    <blockquote>{QUOTE_CONTENT.options[selectedIndex ?? 0].text}</blockquote>
                    <span className={`${styles.quoteMark} ${styles.quoteMarkEnd}`} aria-hidden="true">”</span>
                  </div>
                  <div className={styles.quoteCardMeta}>
                    <span className={styles.quoteCardSignature}>{quoteSignature || 'Cortex reader'}</span>
                  </div>
                </div>
                <div className={styles.quoteActions} aria-label="Quote actions">
                  <button className={`${styles.quoteAction} ${styles.quoteActionIcon} ${styles.quoteActionLine}`} type="button" aria-label="Share on LINE" onClick={() => onQuoteAction('line')}>
                    <LineIcon />
                  </button>
                  <button className={`${styles.quoteAction} ${styles.quoteActionIcon} ${styles.quoteActionFacebook}`} type="button" aria-label="Share on Facebook" onClick={() => onQuoteAction('fb')}>
                    <FacebookIcon />
                  </button>
                  <button className={`${styles.quoteAction} ${styles.quoteActionDownload}`} type="button" onClick={() => onQuoteAction('download')}>Download</button>
                </div>
                <div className={styles.quoteActionStatus} role="status" aria-live="polite">{quoteActionStatus ? `Simulated locally on this device: ${quoteActionStatus}.` : ''}</div>
              </section>
            )}
          </div>
        </div>
      )}

      {mode === 'listen' && (
        <div className={styles.listenBody}>
          <div className={styles.listenVisual}>
            <button className={styles.listenToggle} type="button" aria-pressed={audioPlaying} aria-label={audioPlaying ? 'Pause' : 'Play'} onClick={onListen}>
              <span aria-hidden="true">{audioPlaying ? 'Ⅱ' : '▶'}</span>
            </button>
            <div className={styles.waveform} data-testid="cortex-waveform" aria-hidden="true">
              {WAVEFORM_BARS.map((height, index) => <span key={index} style={{ height: `${height}%` }} />)}
            </div>
          </div>
          <div className={styles.listenProgress} role="progressbar" aria-label="Audio progress" aria-valuemin={0} aria-valuemax={LISTEN_CONTENT.durationSeconds} aria-valuenow={audioElapsedSeconds}>
            <span style={{ width: `${progressPercent}%` }} />
          </div>
          <div className={styles.listenMeta}>
            <span className={styles.listenTimer}>{elapsed} / 00:32</span>
            <span className={styles.listenStatus} role="status" aria-live="polite">{audioPlaying ? LISTEN_CONTENT.playingStatus : LISTEN_CONTENT.status}</span>
          </div>
        </div>
      )}

      <div className={styles.widgetFooter}>{poweredBy}</div>
    </div>
  )
}

function QuoteChoice({ option, selected, onClick }: { option: QuoteSource; selected: boolean; onClick: () => void }) {
  return (
    <li>
      <button className={styles.choice} type="button" aria-pressed={selected} onClick={onClick}>
        <span className={styles.choicePrimary}>{option.text}</span>
        {option.sourceType === 'attributed' && option.byline && <span className={styles.choiceSecondary}>— {option.byline}</span>}
      </button>
    </li>
  )
}

function LineIcon() {
  return (
    <svg className={styles.quoteActionSvg} viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path fill="currentColor" d="M12 3.25c-4.83 0-8.75 3.08-8.75 6.88 0 3.47 3.26 6.3 7.62 6.81v2.42a.7.7 0 0 0 1.2.5l2.25-2.39c3.76-.85 6.43-3.62 6.43-6.94 0-3.8-3.92-6.88-8.75-6.88Zm-3.4 8.82H7.3a.65.65 0 0 1-.65-.65V8.56a.65.65 0 1 1 1.3 0v2.86h.65a.65.65 0 1 1 0 1.3Zm2.37-.65a.65.65 0 1 1-1.3 0V8.56a.65.65 0 1 1 1.3 0v2.86Zm3.44.65a.65.65 0 0 1-.65-.65V10.4l-1.28 1.38a.65.65 0 0 1-1.12-.44V8.56a.65.65 0 1 1 1.3 0v1.02l1.28-1.38a.65.65 0 0 1 1.12.44v2.78c0 .36-.29.65-.65.65Zm3.13-.65a.65.65 0 1 1 0 1.3h-1.55a.65.65 0 0 1-.65-.65V8.56c0-.36.29-.65.65-.65h1.55a.65.65 0 1 1 0 1.3h-.9v.65h.65a.65.65 0 1 1 0 1.3h-.65v.26h.9Z" />
    </svg>
  )
}

function FacebookIcon() {
  return (
    <svg className={styles.quoteActionSvg} viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path fill="currentColor" d="M13.6 21v-8.02h2.7l.4-3.13h-3.1v-2c0-.91.25-1.53 1.56-1.53h1.67V3.52c-.29-.04-1.29-.12-2.45-.12-2.42 0-4.08 1.48-4.08 4.2v2.25H7.56v3.13h2.74V21h3.3Z" />
    </svg>
  )
}
