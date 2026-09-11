import type { LedgerEvent, LedgerLens, PlaygroundMode } from './ai-mode-playground-data'
import { getLensContent } from './ai-mode-playground-data'
import styles from './AiModePlayground.module.css'

type SignalLedgerProps = {
  lens: LedgerLens
  mode: PlaygroundMode
  events: LedgerEvent[]
  scrollDepth: number
  widgetImpression: boolean
  onLensChange: (lens: LedgerLens) => void
}

export function SignalLedger({ lens, mode, events, scrollDepth, widgetImpression, onLensChange }: SignalLedgerProps) {

  return (
    <aside className={styles.ledger} aria-label="Experience ledger">
      <div className={styles.lensSwitch} role="radiogroup" aria-label="Ledger lens">
        <button id="lens-media" type="button" role="radio" aria-checked={lens === 'media'} onClick={() => onLensChange('media')}>
          Media and Content
        </button>
        <button id="lens-brand" type="button" role="radio" aria-checked={lens === 'brand'} onClick={() => onLensChange('brand')}>
          Brand
        </button>
      </div>
      <div className={styles.surfaceLabel}><span>{lens === 'brand' ? 'Brand' : 'Media'} signal ledger</span><span>{String(events.length).padStart(2, '0')} EVENTS</span></div>
      <div className={styles.ledgerBody}>
        <div className={styles.ledgerShared}>
          <div className={styles.metrics} aria-label="Preview metrics">
            <div className={styles.metric}><span className={styles.metricLabel}>Scroll depth</span><span className={styles.metricValue} aria-live="polite">{scrollDepth}%</span></div>
            <div className={styles.metric}><span className={styles.metricLabel}>Widget impression</span><span className={styles.metricValue} aria-live="polite">{widgetImpression ? 'Captured' : 'Waiting'}</span></div>
          </div>
        </div>
        {(['media', 'brand'] as const).map((panelLens) => {
          const panelContent = getLensContent(panelLens)
          return (
            <div key={panelLens} id={`lens-panel-${panelLens}`} className={styles.ledgerPanel} hidden={lens !== panelLens}>
              <span className={styles.ledgerKicker}>{panelLens.toUpperCase()} LENS · {mode.toUpperCase()}</span>
              <h2>{panelContent.heading}</h2>
              <p className={styles.ledgerIntro}>{panelContent.intro}</p>
              <div className={styles.eventStream} aria-live="polite">
                {events.length > 0 ? events.map((event) => {
                  const copy = event.lensCopy[panelLens]
                  return (
                    <div key={event.id} className={styles.eventRow} data-tone={event.tone}>
                      <i aria-hidden="true" />
                      <div><b>{event.kind.replace('-', '_').toUpperCase()}</b><strong>{copy.title}</strong><small>{copy.detail}</small></div>
                    </div>
                  )
                }) : (
                  <div className={styles.empty}><b>Nothing captured yet.</b><span>Scroll the article or interact with the widget to see signals appear here.</span></div>
                )}
              </div>
              <div className={styles.projection}><b>{panelContent.projectionTitle}</b><p>{panelContent.projection}</p></div>
            </div>
          )
        })}
      </div>
    </aside>
  )
}
