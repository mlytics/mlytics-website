import { useRef, type KeyboardEvent } from 'react'
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

/** `value` is the wire format — it matches the site path the lens speaks for
 *  (`/content-owners/`, `/brands/`) and travels through the URL, the DOM ids
 *  and the copy keys. `surface` is the word shown on screen, and is
 *  deliberately NOT derived from `value`: uppercasing the value would read
 *  "CONTENT-OWNERS LENS". Renaming the value must not rename the copy. */
const LENSES = [
  { value: 'content-owners', id: 'lens-content-owners', label: 'Media and Content', note: 'Media value', surface: 'Media' },
  { value: 'brands', id: 'lens-brands', label: 'Brand', note: 'Brand value', surface: 'Brand' },
] as const satisfies readonly { value: LedgerLens; id: string; label: string; note: string; surface: string }[]

const LENS_SURFACE: Record<LedgerLens, string> = Object.fromEntries(
  LENSES.map((item) => [item.value, item.surface]),
) as Record<LedgerLens, string>

export function SignalLedger({ lens, mode, events, scrollDepth, widgetImpression, onLensChange }: SignalLedgerProps) {
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([])

  // ARIA APG tabs with automatic activation: arrows move selection and focus
  // together, and wrap. Position is taken from the focused tab, not from the
  // selected lens — the two normally coincide, but a programmatic focus can
  // put them out of step.
  function handleLensKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    const focused = tabRefs.current.indexOf(document.activeElement as HTMLButtonElement)
    const current = focused === -1 ? LENSES.findIndex((item) => item.value === lens) : focused
    let next: number
    switch (event.key) {
      case 'ArrowRight':
      case 'ArrowDown':
        next = (current + 1) % LENSES.length
        break
      case 'ArrowLeft':
      case 'ArrowUp':
        next = (current - 1 + LENSES.length) % LENSES.length
        break
      case 'Home':
        next = 0
        break
      case 'End':
        next = LENSES.length - 1
        break
      default:
        return
    }
    event.preventDefault()
    tabRefs.current[next]?.focus()
    if (LENSES[next].value !== lens) onLensChange(LENSES[next].value)
  }

  return (
    <aside className={styles.ledger} aria-label="Experience ledger">
      <div className={styles.lensTabs} role="tablist" aria-label="Ledger lens" onKeyDown={handleLensKeyDown}>
        {LENSES.map((item, index) => (
          <button
            key={item.value}
            ref={(node) => { tabRefs.current[index] = node }}
            id={item.id}
            type="button"
            role="tab"
            aria-selected={lens === item.value}
            aria-controls={`lens-panel-${item.value}`}
            tabIndex={lens === item.value ? 0 : -1}
            onClick={() => onLensChange(item.value)}
          >
            {item.label}<small>{item.note}</small>
          </button>
        ))}
      </div>
      <div className={styles.ledgerBody}>
        <div className={styles.ledgerShared}>
          <div className={styles.metrics} aria-label="Preview metrics">
            <div className={styles.metric}><span className={styles.metricLabel}>Scroll depth</span><span className={styles.metricValue} aria-live="polite">{scrollDepth}%</span></div>
            <div className={styles.metric}><span className={styles.metricLabel}>Widget impression</span><span className={styles.metricValue} aria-live="polite">{widgetImpression ? 'Captured' : 'Waiting'}</span></div>
          </div>
        </div>
        {LENSES.map(({ value: panelLens }) => {
          const panelContent = getLensContent(panelLens)
          return (
            <div key={panelLens} id={`lens-panel-${panelLens}`} className={styles.ledgerPanel} role="tabpanel" aria-labelledby={`lens-${panelLens}`} hidden={lens !== panelLens}>
              {/* The event count rides the kicker rather than a row of its own:
                  it is the only thing up here that changes as the user
                  interacts, so it belongs beside the list it counts. */}
              <div className={styles.ledgerKicker}>
                <span>{LENS_SURFACE[panelLens].toUpperCase()} LENS · {mode.toUpperCase()}</span>
                <span>{String(events.length).padStart(2, '0')} EVENTS</span>
              </div>
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
