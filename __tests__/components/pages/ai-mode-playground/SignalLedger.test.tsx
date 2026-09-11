import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { SignalLedger } from '@/components/pages/ai-mode-playground/SignalLedger'

const base = {
  mode: 'chat' as const,
  events: [],
  scrollDepth: 0,
  widgetImpression: false,
  onLensChange: vi.fn(),
}

describe('SignalLedger 詞彙', () => {
  it('2B 側標籤為 Media and Content，不出現 Publisher', () => {
    render(<SignalLedger lens="media" {...base} />)
    expect(screen.getByText('Media and Content')).toBeInTheDocument()
    expect(screen.queryByText(/publisher/i)).not.toBeInTheDocument()
  })

  it('整個 ledger 不出現 publisher 或 reader 字樣', () => {
    const { container } = render(<SignalLedger lens="media" {...base} />)
    expect(container.textContent).not.toMatch(/publisher|reader/i)
  })

  it('lens kicker 顯示 MEDIA LENS 而非 PUBLISHER LENS', () => {
    render(<SignalLedger lens="media" {...base} />)
    expect(screen.getByText(/MEDIA LENS · CHAT/)).toBeInTheDocument()
  })

  it('surface label 與 lens tab 的 id/aria-controls 都改用 media', () => {
    render(<SignalLedger lens="media" {...base} />)
    expect(screen.getByText('Media signal ledger')).toBeInTheDocument()
    const tab = screen.getByRole('tab', { name: /media and content/i })
    expect(tab).toHaveAttribute('id', 'lens-media')
    expect(tab).toHaveAttribute('aria-controls', 'lens-panel-media')
    expect(document.getElementById('lens-panel-media')).toHaveAttribute('aria-labelledby', 'lens-media')
  })
})
