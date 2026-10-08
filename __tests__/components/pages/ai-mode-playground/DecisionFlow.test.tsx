import { readFileSync } from 'node:fs'
import { cleanup, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createRef } from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { DecisionFlow } from '@/components/pages/ai-mode-playground/DecisionFlow'
import { trackCTA } from '@/lib/analytics'
import {
  CAPTURE,
  CUSTOMER_CTA,
  EXPERIENCE_DEFAULT_OBSERVATION,
  LENS_LABELS,
  PATHS,
  UI,
} from '@/components/pages/ai-mode-playground/ai-mode-playground-copy'

vi.mock('@/lib/analytics', () => ({ trackCTA: vi.fn() }))

beforeEach(() => {
  vi.stubGlobal('IntersectionObserver', vi.fn(function IntersectionObserver() {
    return { observe: vi.fn(), disconnect: vi.fn() }
  }))
})

afterEach(() => {
  vi.mocked(trackCTA).mockClear()
})

function renderFlow(overrides: Partial<React.ComponentProps<typeof DecisionFlow>> = {}) {
  const onLensChange = vi.fn()
  const props: React.ComponentProps<typeof DecisionFlow> = {
    lens: 'content-owners',
    onLensChange,
    experience: 'chat',
    chatQuestionIndex: null,
    captures: {},
    signalRef: createRef<HTMLParagraphElement>(),
    titleRef: createRef<HTMLHeadingElement>(),
    ...overrides,
  }
  return { ...render(<DecisionFlow {...props} />), onLensChange }
}

describe('DecisionFlow', () => {
  it('renders the canvas heading, customer tabs, and only the selected panel', () => {
    renderFlow()
    expect(screen.getByRole('heading', { level: 2, name: UI.canvas.title })).toHaveAttribute('id', 'canvas-title')
    expect(screen.getByRole('tablist', { name: UI.canvas.customerTablistLabel })).toBeInTheDocument()
    const contentTab = screen.getByRole('tab', { name: LENS_LABELS['content-owners'] })
    expect(contentTab).toHaveAttribute('aria-selected', 'true')
    expect(contentTab).toHaveAttribute('tabindex', '0')
    const contentPanel = screen.getByRole('tabpanel', { name: LENS_LABELS['content-owners'] })
    expect(contentPanel).not.toHaveAttribute('hidden')
    expect(contentPanel).toHaveAttribute('id', 'customer-panel-content-owners')
    expect(contentPanel).toHaveAttribute('aria-labelledby', 'customer-tab-content-owners')
    expect(contentTab).toHaveAttribute('aria-controls', 'customer-panel-content-owners')
    const brandsPanel = document.getElementById('customer-panel-brands')!
    expect(brandsPanel).toHaveAttribute('role', 'tabpanel')
    expect(brandsPanel).toHaveAttribute('aria-labelledby', 'customer-tab-brands')
    expect(brandsPanel).toHaveAttribute('hidden')
    expect(brandsPanel).toBeEmptyDOMElement()
    expect(screen.getByRole('group', { name: UI.canvas.flowLabel })).toContainElement(contentPanel)
    expect(document.querySelectorAll('[data-stage-node]')).toHaveLength(5)
  })

  it('activates the brands lens by click and by arrow key', async () => {
    const user = userEvent.setup()
    const { onLensChange } = renderFlow()
    const contentTab = screen.getByRole('tab', { name: LENS_LABELS['content-owners'] })
    const brandsTab = screen.getByRole('tab', { name: LENS_LABELS.brands })
    await user.click(brandsTab)
    expect(onLensChange).toHaveBeenCalledWith('brands')

    contentTab.focus()
    await user.keyboard('{ArrowRight}')
    expect(onLensChange).toHaveBeenCalledWith('brands')
    expect(brandsTab).toHaveFocus()
  })

  it('treats re-selecting the active lens as a no-op for click, Home, and End at the edge', async () => {
    const user = userEvent.setup()
    const { onLensChange } = renderFlow()
    const contentTab = screen.getByRole('tab', { name: LENS_LABELS['content-owners'] })
    await user.click(contentTab)
    contentTab.focus()
    await user.keyboard('{Home}')
    expect(contentTab).toHaveFocus()
    expect(onLensChange).not.toHaveBeenCalled()

    cleanup()
    const brands = renderFlow({ lens: 'brands' })
    const brandsTab = screen.getByRole('tab', { name: LENS_LABELS.brands })
    brandsTab.focus()
    await user.keyboard('{End}')
    expect(brandsTab).toHaveFocus()
    await user.click(brandsTab)
    expect(brands.onLensChange).not.toHaveBeenCalled()
  })

  it.each(['content-owners', 'brands'] as const)('tracks both CTAs with the %s lens-specific position', async (lens) => {
    const user = userEvent.setup()
    renderFlow({ lens })
    const stopNavigation = (event: MouseEvent) => event.preventDefault()
    document.addEventListener('click', stopNavigation)
    try {
      await user.click(screen.getByRole('link', { name: UI.cta.bookDemo }))
      await user.click(screen.getByRole('link', { name: CUSTOMER_CTA[lens].label }))
    } finally {
      document.removeEventListener('click', stopNavigation)
    }
    expect(vi.mocked(trackCTA).mock.calls).toEqual([
      [UI.cta.bookDemo, `ai-mode-playground-flow-${lens}`],
      [CUSTOMER_CTA[lens].label, `ai-mode-playground-flow-${lens}`],
    ])
  })

  it('marks stages 01/02 complete only for the current experience capture', () => {
    renderFlow({ experience: 'quote', captures: { chat: CAPTURE.chat('Question') } })
    expect(document.querySelector('[data-stage="01"]')).toHaveAttribute('data-complete', 'false')
    expect(document.querySelector('[data-stage="02"]')).toHaveAttribute('data-complete', 'false')
    expect(screen.getByText(EXPERIENCE_DEFAULT_OBSERVATION.quote)).toBeInTheDocument()
  })

  it('renders default and captured stage copy with completion state', () => {
    const { rerender } = renderFlow()
    expect(screen.getByText(EXPERIENCE_DEFAULT_OBSERVATION.chat)).toBeInTheDocument()
    expect(screen.getByText(UI.stages.s02.empty)).toBeInTheDocument()
    expect(screen.getByText(PATHS['content-owners'][0].question)).toBeInTheDocument()
    expect(screen.getByText(PATHS['content-owners'][0].decision)).toBeInTheDocument()

    const capture = CAPTURE.chat('Question')
    rerender(
      <DecisionFlow
        lens="content-owners"
        onLensChange={vi.fn()}
        experience="chat"
        chatQuestionIndex={1}
        captures={{ chat: capture }}
        signalRef={createRef<HTMLParagraphElement>()}
        titleRef={createRef<HTMLHeadingElement>()}
      />,
    )
    expect(screen.getByText(capture.observation)).toBeInTheDocument()
    expect(screen.getByText(`${UI.stages.s02.capturedPrefix}${capture.rawSignal}`)).toBeInTheDocument()
    expect(screen.getByText(PATHS['content-owners'][0].chatVariants[1].question)).toBeInTheDocument()
    expect(document.querySelector('[data-stage="01"]')).toHaveAttribute('data-complete', 'true')
    expect(document.querySelector('[data-stage="02"]')).toHaveAttribute('data-complete', 'true')
  })

  it('switches path content by lens and renders all evidence fields and CTA links', () => {
    const { unmount } = renderFlow({ lens: 'brands' })
    for (const path of PATHS.brands) {
      expect(screen.getAllByText(path.name).length).toBeGreaterThan(0)
      expect(screen.getAllByText(path.evidence[0].observed).length).toBeGreaterThan(0)
      expect(screen.getAllByText(path.evidence[0].comparison).length).toBeGreaterThan(0)
      expect(screen.getAllByText(path.evidence[0].supports).length).toBeGreaterThan(0)
    }
    expect(screen.getAllByText(UI.cell.observed).length).toBeGreaterThan(0)
    expect(screen.getAllByText(UI.cell.comparison).length).toBeGreaterThan(0)
    expect(screen.getAllByText(UI.cell.supports).length).toBeGreaterThan(0)
    expect(screen.getByRole('link', { name: UI.cta.bookDemo })).toHaveAttribute('href', '/book-a-demo')
    expect(screen.getByRole('link', { name: CUSTOMER_CTA.brands.label })).toHaveAttribute('href', CUSTOMER_CTA.brands.href)
    expect(screen.getByText(CUSTOMER_CTA.brands.description)).toBeInTheDocument()
    expect([...document.querySelectorAll('[class*="cellPathTag"]')].map((tag) => tag.textContent)).toEqual([
      ...PATHS.brands.map((path) => path.name),
      ...PATHS.brands.map((path) => path.name),
      ...PATHS.brands.map((path) => path.name),
    ])
    unmount()
    renderFlow({ lens: 'content-owners' })
    expect(screen.getByText(CUSTOMER_CTA['content-owners'].description)).toBeInTheDocument()
  })

  it('uses the selected chat variant and quote/listen base paths in stage 03', () => {
    const { rerender } = renderFlow({ chatQuestionIndex: 1 })
    expect(screen.getByText(PATHS['content-owners'][1].chatVariants[1].decision)).toBeInTheDocument()
    rerender(
      <DecisionFlow
        lens="content-owners"
        onLensChange={vi.fn()}
        experience="quote"
        chatQuestionIndex={1}
        captures={{}}
        signalRef={createRef<HTMLParagraphElement>()}
        titleRef={createRef<HTMLHeadingElement>()}
      />,
    )
    expect(screen.getByText(PATHS['content-owners'][1].decision)).toBeInTheDocument()
  })
})

describe('DecisionFlow CSS contract', () => {
  it('keeps selectors single-class and repeats the mobile path tag selector', () => {
    const cssFiles = [
      'components/pages/ai-mode-playground/AiModePlayground.module.css',
      'components/pages/ai-mode-playground/ExperiencePanel.module.css',
      'components/pages/ai-mode-playground/DecisionFlow.module.css',
    ]
    for (const file of cssFiles) {
      const css = readFileSync(file, 'utf8')
      expect(css).not.toMatch(/\.[A-Za-z][\w-]*\s+(p|h[1-6]|strong|span|a|button|li|ul|img|input|blockquote)\b[^\{]*\{/)
    }
    const flowCss = readFileSync('components/pages/ai-mode-playground/DecisionFlow.module.css', 'utf8')
    expect(flowCss).toMatch(/@media\s*\(max-width:\s*760px\)[\s\S]*\.cellPathTag\s*\{/)
    expect(flowCss).toMatch(/\.customerTabsShell\s*\{[\s\S]*position:\s*sticky[\s\S]*top:\s*var\(--playground-sticky-top\)/)
  })
})
