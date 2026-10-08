import Link from 'next/link'
import { useRef, type KeyboardEvent, type RefObject } from 'react'
import { trackCTA } from '@/lib/analytics'
import {
  CUSTOMER_CTA,
  EXPERIENCE_DEFAULT_OBSERVATION,
  LENS_LABELS,
  PATHS,
  UI,
} from './ai-mode-playground-copy'
import type { PlaygroundLens } from './ai-mode-playground-data'
import { activePathContent, stageStates } from './playground-logic'
import type { Captures } from './playground-logic'
import { nextTabIndex } from './playground-logic'
import { useProgressRail } from './useProgressRail'
import styles from './DecisionFlow.module.css'

export type DecisionFlowProps = {
  lens: PlaygroundLens
  onLensChange: (lens: PlaygroundLens) => void
  experience: 'chat' | 'quote' | 'listen'
  chatQuestionIndex: number | null
  captures: Captures
  signalRef: RefObject<HTMLParagraphElement | null>
}

const LENSES: PlaygroundLens[] = ['content-owners', 'brands']

function Stage({
  number,
  label,
  title,
  state,
  children,
  copyId,
  copyRef,
}: {
  number: string
  label: string
  title: string
  state: { position: 'active' | 'past' | 'upcoming'; complete: boolean }
  children: React.ReactNode
  copyId?: string
  copyRef?: RefObject<HTMLParagraphElement | null>
}) {
  return (
    <section
      className={styles.stage}
      data-stage={number}
      data-state={state.position}
      data-complete={String(state.complete)}
      aria-labelledby={`progress-stage-${number}`}
    >
      <div className={styles.stageRail} aria-hidden="true">
        <span className={styles.stageNode} data-stage-node>{number}</span>
      </div>
      <div className={styles.stageMain}>
        <div className={styles.stageHead}>
          <p className={styles.stageKicker}>{label}</p>
          <h3 className={styles.stageTitle} id={`progress-stage-${number}`}>
            {title}
          </h3>
        </div>
        {copyId ? (
          <div className={styles.stageBody}>
            <p className={styles.stageCopy} id={copyId} tabIndex={-1} ref={copyRef}>
              {children}
            </p>
          </div>
        ) : (
          children
        )}
      </div>
    </section>
  )
}

function Cell({ children, pathName }: { children: React.ReactNode; pathName: string }) {
  return (
    <article className={styles.cell}>
      <p className={styles.cellPathTag}>{pathName}</p>
      {children}
    </article>
  )
}

function PathHeaders({ paths }: { paths: readonly [{ name: string }, { name: string }] }) {
  return (
    <div className={styles.pathsHead}>
      <h3 className={styles.pathsTitle}>{UI.stages.pathsHead.title}</h3>
      <ul className={styles.pathHeaders} aria-label={UI.stages.pathsHead.listLabel}>
        {paths.map((path) => (
          <li className={styles.pathHeader} key={path.name}>
            <p className={styles.pathHeaderKicker}>{UI.stages.pathsHead.pathLabel}</p>
            <p className={styles.pathHeaderName}>{path.name}</p>
          </li>
        ))}
      </ul>
    </div>
  )
}

export function DecisionFlow({
  lens,
  onLensChange,
  experience,
  chatQuestionIndex,
  captures,
  signalRef,
}: DecisionFlowProps) {
  const flowRef = useRef<HTMLDivElement>(null)
  const activeStageIndex = useProgressRail(flowRef, lens, `${experience}:${chatQuestionIndex ?? ''}`)
  const states = stageStates(5, activeStageIndex, captures, experience)
  const activePaths = PATHS[lens]
  const capture = captures[experience]

  const handleCustomerKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    const currentIndex = LENSES.indexOf(lens)
    const nextIndex = nextTabIndex(event.key, currentIndex, LENSES.length)
    if (nextIndex === null) return
    event.preventDefault()
    const nextLens = LENSES[nextIndex]
    document.getElementById(`customer-tab-${nextLens}`)?.focus()
    if (nextLens !== lens) onLensChange(nextLens)
  }

  const renderStage03Cell = (path: (typeof activePaths)[number]) => {
    const content = activePathContent(path, experience, chatQuestionIndex)
    return (
      <Cell key={path.name} pathName={path.name}>
        <p className={styles.cellKicker}>{UI.cell.question}</p>
        <p className={styles.cellBody}>{content.question}</p>
        <p className={styles.cellBody}>
          <strong className={styles.cellLabel}>{UI.cell.decision}</strong>
          <br />
          {content.decision}
        </p>
      </Cell>
    )
  }

  const renderStage04Cell = (path: (typeof activePaths)[number]) => {
    const content = activePathContent(path, experience, chatQuestionIndex)
    return (
      <Cell key={path.name} pathName={path.name}>
        <p className={styles.cellKicker}>{UI.cell.unit}</p>
        <p className={styles.cellBody}>{content.unit}</p>
        <p className={styles.cellBody}>
          <strong className={styles.cellLabel}>{UI.cell.value}</strong>
          <br />
          {content.value}
        </p>
      </Cell>
    )
  }

  const renderStage05Cell = (path: (typeof activePaths)[number]) => {
    const content = activePathContent(path, experience, chatQuestionIndex)
    return (
      <Cell key={path.name} pathName={path.name}>
        {content.evidence.map((evidence) => (
          <div className={styles.evidence} key={`${path.name}-${evidence.observed}`}>
            <p className={styles.cellBody}>
              <strong className={styles.cellLabel}>{UI.cell.observed}</strong>
              <br />
              {evidence.observed}
            </p>
            <p className={styles.cellBody}>
              <strong className={styles.cellLabel}>{UI.cell.comparison}</strong>
              <br />
              {evidence.comparison}
            </p>
            <p className={styles.cellBody}>
              <strong className={styles.cellLabel}>{UI.cell.supports}</strong>
              <br />
              {evidence.supports}
            </p>
          </div>
        ))}
      </Cell>
    )
  }

  return (
    <section className={styles.canvas} aria-labelledby="canvas-title">
      <div className={styles.canvasHead}>
        <p className={styles.canvasSectionLabel}>{UI.canvas.sectionLabel}</p>
        <h2 className={styles.canvasTitle} id="canvas-title">
          {UI.canvas.title}
        </h2>
      </div>
      <div className={styles.customerPrompt}>
        <p className={styles.customerPromptText}>{UI.canvas.customerPrompt}</p>
      </div>
      <div className={styles.customerTabsShell}>
        <div className={styles.customerTabs} role="tablist" aria-label={UI.canvas.customerTablistLabel}>
          {LENSES.map((item) => (
            <button
              className={styles.customerTab}
              id={`customer-tab-${item}`}
              key={item}
              type="button"
              role="tab"
              aria-selected={lens === item}
              aria-controls={`customer-panel-${item}`}
              tabIndex={lens === item ? 0 : -1}
              onClick={() => {
                if (item !== lens) onLensChange(item)
              }}
              onKeyDown={handleCustomerKeyDown}
            >
              {LENS_LABELS[item]}
            </button>
          ))}
        </div>
      </div>
      <div className={styles.progressFlow} ref={flowRef} role="group" aria-label={UI.canvas.flowLabel}>
        <Stage
          number="01"
          label={UI.stages.s01.label}
          title={UI.stages.s01.title}
          state={states[0]}
          copyId="stage-01-copy"
        >
          {capture?.observation ?? EXPERIENCE_DEFAULT_OBSERVATION[experience]}
        </Stage>
        <Stage
          number="02"
          label={UI.stages.s02.label}
          title={UI.stages.s02.title}
          state={states[1]}
          copyId="stage-02-copy"
          copyRef={signalRef}
        >
          {capture?.rawSignal ? `${UI.stages.s02.capturedPrefix}${capture.rawSignal}` : UI.stages.s02.empty}
        </Stage>
        {LENSES.map((item) => {
          if (item !== lens) {
            return (
              <div
                className={styles.customerPanel}
                id={`customer-panel-${item}`}
                key={item}
                role="tabpanel"
                aria-labelledby={`customer-tab-${item}`}
                hidden
              />
            )
          }

          return (
            <div
              className={styles.customerPanel}
              id={`customer-panel-${item}`}
              key={item}
              role="tabpanel"
              aria-labelledby={`customer-tab-${item}`}
            >
              <PathHeaders paths={activePaths} />
              <Stage number="03" label={UI.stages.s03.label} title={UI.stages.s03.title} state={states[2]}>
                <div className={styles.stageGrid}>{activePaths.map(renderStage03Cell)}</div>
              </Stage>
              <Stage number="04" label={UI.stages.s04.label} title={UI.stages.s04.title} state={states[3]}>
                <div className={styles.stageGrid}>{activePaths.map(renderStage04Cell)}</div>
              </Stage>
              <Stage number="05" label={UI.stages.s05.label} title={UI.stages.s05.title} state={states[4]}>
                <div className={styles.stageGrid}>{activePaths.map(renderStage05Cell)}</div>
                <div className={styles.cta} role="group" aria-labelledby={`cta-title-${item}`}>
                  <div className={styles.ctaCopy}>
                    <p className={styles.ctaKicker}>{UI.cta.label}</p>
                    <h4 className={styles.ctaTitle} id={`cta-title-${item}`}>
                      {UI.cta.title}
                    </h4>
                    <p className={styles.ctaDescription}>{CUSTOMER_CTA[item].description}</p>
                  </div>
                  <div className={styles.ctaActions}>
                    <Link
                      className={styles.ctaPrimary}
                      href="/book-a-demo"
                      onClick={() => trackCTA(UI.cta.bookDemo, `ai-mode-playground-flow-${item}`)}
                    >
                      {UI.cta.bookDemo}
                    </Link>
                    <Link
                      className={styles.ctaSecondary}
                      href={CUSTOMER_CTA[item].href}
                      onClick={() => trackCTA(CUSTOMER_CTA[item].label, `ai-mode-playground-flow-${item}`)}
                    >
                      {CUSTOMER_CTA[item].label}
                    </Link>
                  </div>
                </div>
              </Stage>
            </div>
          )
        })}
      </div>
    </section>
  )
}
