import type { ReactNode } from 'react'
import { SPECIMENS } from '../_data/specimens'

export const specimen = (id: string) => {
  const found = SPECIMENS.find((item) => item.id === id)
  if (!found) throw new Error(`Unknown Storybook specimen: ${id}`)
  return found
}

export const specimenClasses = (...ids: string[]) => ids.map((id) => specimen(id).className).join(' ')

export function StoryFrame({ title, intro, children }: { title: string; intro: string; children: ReactNode }) {
  return (
    <main className="mx-auto max-w-5xl space-y-8 p-6 text-ink">
      <header className="space-y-2">
        <h1 className="text-3xl font-bold">{title}</h1>
        <p className="max-w-3xl text-base leading-relaxed text-ink-muted">{intro}</p>
      </header>
      {children}
    </main>
  )
}

/** One element of a multi-element specimen: which element it is, and the code to copy for it. */
export type CodeLine = { element: string; code: string }

function CodeLines({ lines }: { lines: CodeLine[] }) {
  return (
    <div className="space-y-2">
      {lines.map((line) => (
        <div key={line.element} className="space-y-1">
          <p className="text-xs font-semibold text-ink-muted">{line.element}</p>
          <code className="block overflow-x-auto rounded-lg bg-surface p-3 text-xs text-ink">{line.code}</code>
        </div>
      ))}
    </div>
  )
}

/**
 * The code shown must equal what the sample renders. Pass `className` when the
 * sample is one element; pass `lines` (one per element, labelled) when it has
 * several, so nothing has to be joined with " + ".
 */
export function SpecimenBlock({ title, className, lines, children }: { title: string; className?: string; lines?: CodeLine[]; children: ReactNode }) {
  return (
    <section className="space-y-3 rounded-2xl border border-line bg-white p-6">
      <h2 className="text-base font-semibold">{title}</h2>
      <div>{children}</div>
      {lines ? (
        <CodeLines lines={lines} />
      ) : (
        <code className="block overflow-x-auto rounded-lg bg-surface p-3 text-xs text-ink">{className}</code>
      )}
    </section>
  )
}

/** Pending fixes (DESIGN.md §7.8): target spec and ticket only, never a sample element. */
export function PendingNotice({ title, ticket, className, spec, children }: { title: string; ticket: string; className: string; spec: string[]; children: ReactNode }) {
  return (
    <aside className="space-y-2 rounded-2xl border border-line bg-surface p-6" aria-label={`${title} 待修說明`}>
      <div className="flex flex-wrap items-center gap-2">
        <h2 className="text-base font-semibold text-ink">{title}</h2>
        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-primary/8 text-primary">{ticket}</span>
      </div>
      <p className="text-sm leading-relaxed text-ink-muted">{children}</p>
      <p className="text-sm font-semibold text-ink">目標規格</p>
      <ul className="space-y-1 text-sm leading-relaxed text-ink-muted">
        {spec.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
      <code className="block overflow-x-auto rounded-lg bg-white p-3 text-xs text-ink">{className}</code>
    </aside>
  )
}
