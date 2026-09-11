import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
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

  it('surface label 與 lens 控制項的 id 都改用 media', () => {
    render(<SignalLedger lens="media" {...base} />)
    expect(screen.getByText('Media signal ledger')).toBeInTheDocument()
    const control = screen.getByRole('radio', { name: /media and content/i })
    expect(control).toHaveAttribute('id', 'lens-media')
    expect(document.getElementById('lens-panel-media')).toBeInTheDocument()
  })
})

describe('SignalLedger lens 控制項形制', () => {
  it('lens 切換使用 radiogroup 語意，與左側 tablist 區隔', () => {
    render(<SignalLedger lens="media" {...base} />)
    expect(screen.getByRole('radiogroup', { name: /ledger lens/i })).toBeInTheDocument()
    expect(screen.getAllByRole('radio')).toHaveLength(2)
    expect(screen.queryByRole('tablist')).not.toBeInTheDocument()
  })

  it('radio 反映目前 lens，且不再有 tabpanel', () => {
    render(<SignalLedger lens="media" {...base} />)
    expect(screen.getByRole('radio', { name: /media and content/i })).toHaveAttribute('aria-checked', 'true')
    expect(screen.getByRole('radio', { name: /^brand$/i })).toHaveAttribute('aria-checked', 'false')
    expect(screen.queryAllByRole('tabpanel')).toHaveLength(0)
  })

  it('移除 lens 按鈕內的 10px mono 說明文字', () => {
    render(<SignalLedger lens="media" {...base} />)
    expect(screen.getByRole('radio', { name: /media and content/i }).querySelector('small')).toBeNull()
    expect(screen.getByRole('radio', { name: /^brand$/i }).querySelector('small')).toBeNull()
  })

  it('CSS 不再讓 mode tab 與 lens 控制項共用規則', () => {
    const css = readFileSync(
      resolve(__dirname, '../../../../components/pages/ai-mode-playground/AiModePlayground.module.css'),
      'utf8',
    )
    expect(css).not.toMatch(/\.lensTabs/)
    expect(css).not.toMatch(/\.modeTabs button,\s*\.lensTabs button/)
    expect(css).toMatch(/\.lensSwitch button\s*\{[^}]*min-height:\s*34px/)
    expect(css).toMatch(/\.modeTabs button\s*\{[^}]*min-height:\s*69px/)
  })
})
