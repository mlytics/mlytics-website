import type { CortexEvent, CortexLens, CortexMode } from './cortex-playground-data'
import { getLensContent } from './cortex-playground-data'
import styles from './CortexPlayground.module.css'

type SignalLedgerProps = {
  lens: CortexLens
  lensReady: boolean
  mode: CortexMode
  events: CortexEvent[]
  scrollDepth: number
  widgetImpression: boolean
  onLensChange: (lens: CortexLens) => void
}

export function SignalLedger({ lens, lensReady, mode, events, scrollDepth, widgetImpression, onLensChange }: SignalLedgerProps) {

  return (
    <aside className={styles.ledger} aria-label="Experience ledger">
      <div className={styles.lensTabs} data-lens-ready={lensReady ? 'true' : 'false'} role="tablist" aria-label="Ledger lens">
        <button id="lens-publisher" type="button" role="tab" aria-selected={lens === 'publisher'} aria-controls="lens-panel-publisher" onClick={() => onLensChange('publisher')}>
          Publisher<small>Media value</small>
        </button>
        <button id="lens-brand" type="button" role="tab" aria-selected={lens === 'brand'} aria-controls="lens-panel-brand" onClick={() => onLensChange('brand')}>
          Brand<small>Brand value</small>
        </button>
      </div>
      <div className={styles.surfaceLabel}><span>{lens === 'brand' ? 'Brand' : 'Publisher'} signal ledger</span><span>{String(events.length).padStart(2, '0')} EVENTS</span></div>
      <div className={styles.ledgerBody}>
        <div className={styles.ledgerShared}>
          <div className={styles.metrics} aria-label="Preview metrics">
            <div className={styles.metric}><span className={styles.metricLabel}>Scroll depth</span><span className={styles.metricValue} aria-live="polite">{scrollDepth}%</span></div>
            <div className={styles.metric}><span className={styles.metricLabel}>Widget impression</span><span className={styles.metricValue} aria-live="polite">{widgetImpression ? 'Captured' : 'Waiting'}</span></div>
          </div>
        </div>
        {(['publisher', 'brand'] as const).map((panelLens) => {
          const panelContent = getLensContent(panelLens)
          return (
            <div key={panelLens} id={`lens-panel-${panelLens}`} className={styles.ledgerPanel} role="tabpanel" aria-labelledby={`lens-${panelLens}`} hidden={lens !== panelLens}>
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
