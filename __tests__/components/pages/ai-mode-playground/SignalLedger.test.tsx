import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { useState } from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import type { LedgerLens } from '@/components/pages/ai-mode-playground/ai-mode-playground-data'
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
    render(<SignalLedger lens="content-owners" {...base} />)
    expect(screen.getByText('Media and Content')).toBeInTheDocument()
    expect(screen.queryByText(/publisher/i)).not.toBeInTheDocument()
  })

  it('整個 ledger 不出現 publisher 或 reader 字樣', () => {
    const { container } = render(<SignalLedger lens="content-owners" {...base} />)
    expect(container.textContent).not.toMatch(/publisher|reader/i)
  })

  it('lens kicker 顯示 MEDIA LENS 而非 PUBLISHER LENS', () => {
    render(<SignalLedger lens="content-owners" {...base} />)
    expect(screen.getByText(/MEDIA LENS · CHAT/)).toBeInTheDocument()
  })

  // The value is renamed to match the site path; the words on screen are not.
  it('surface label 與 lens 控制項的 id 都改用 content-owners', () => {
    render(<SignalLedger lens="content-owners" {...base} />)
    expect(screen.getByText('Media signal ledger')).toBeInTheDocument()
    const control = screen.getByRole('radio', { name: /media and content/i })
    expect(control).toHaveAttribute('id', 'lens-content-owners')
    expect(document.getElementById('lens-panel-content-owners')).toBeInTheDocument()
  })

  it('brand 側的 id 改用 brands，顯示標籤仍是 Brand', () => {
    render(<SignalLedger lens="brands" {...base} />)
    expect(screen.getByText('Brand signal ledger')).toBeInTheDocument()
    const control = screen.getByRole('radio', { name: /^brand$/i })
    expect(control).toHaveAttribute('id', 'lens-brands')
    expect(document.getElementById('lens-panel-brands')).toBeInTheDocument()
  })

  // The renamed value must not leak into the kicker: `content-owners`.toUpperCase()
  // would read CONTENT-OWNERS LENS, which is a copy change nobody asked for.
  it('kicker 不因改值而變成 CONTENT-OWNERS LENS / BRANDS LENS', () => {
    render(<SignalLedger lens="brands" {...base} />)
    expect(screen.getByText(/BRAND LENS · CHAT/)).toBeInTheDocument()
    const { container } = render(<SignalLedger lens="content-owners" {...base} />)
    expect(container.textContent).not.toMatch(/CONTENT-OWNERS LENS|BRANDS LENS/)
  })
})

describe('SignalLedger lens 控制項形制', () => {
  it('lens 切換使用 radiogroup 語意，與左側 tablist 區隔', () => {
    render(<SignalLedger lens="content-owners" {...base} />)
    expect(screen.getByRole('radiogroup', { name: /ledger lens/i })).toBeInTheDocument()
    expect(screen.getAllByRole('radio')).toHaveLength(2)
    expect(screen.queryByRole('tablist')).not.toBeInTheDocument()
  })

  it('radio 反映目前 lens，且不再有 tabpanel', () => {
    render(<SignalLedger lens="content-owners" {...base} />)
    expect(screen.getByRole('radio', { name: /media and content/i })).toHaveAttribute('aria-checked', 'true')
    expect(screen.getByRole('radio', { name: /^brand$/i })).toHaveAttribute('aria-checked', 'false')
    expect(screen.queryAllByRole('tabpanel')).toHaveLength(0)
  })

  it('移除 lens 按鈕內的 10px mono 說明文字', () => {
    render(<SignalLedger lens="content-owners" {...base} />)
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

describe('lens radiogroup 鍵盤操作（ARIA APG roving tabindex）', () => {
  // A controlled harness: the real page owns lens state, so arrow keys must
  // move focus AND flip the checked radio, not just fire a callback.
  function Harness({ initial = 'content-owners' as LedgerLens, onLensChange = vi.fn() }) {
    const [lens, setLens] = useState<LedgerLens>(initial)
    return (
      <SignalLedger
        {...base}
        lens={lens}
        onLensChange={(next) => { onLensChange(next); setLens(next) }}
      />
    )
  }

  const media = () => screen.getByRole('radio', { name: /media and content/i })
  const brand = () => screen.getByRole('radio', { name: /^brand$/i })

  it('只有被選取的 radio 進得了 Tab 順序', () => {
    render(<SignalLedger lens="content-owners" {...base} />)
    expect(media()).toHaveAttribute('tabindex', '0')
    expect(brand()).toHaveAttribute('tabindex', '-1')
  })

  it('選取換邊時 tabindex 跟著換邊', () => {
    render(<SignalLedger lens="brands" {...base} />)
    expect(brand()).toHaveAttribute('tabindex', '0')
    expect(media()).toHaveAttribute('tabindex', '-1')
  })

  it('Tab 進入 radiogroup 時落在被選取的那一顆', async () => {
    const user = userEvent.setup()
    render(<Harness initial="brands" />)
    await user.tab()
    expect(brand()).toHaveFocus()
  })

  it('ArrowRight 同時移動焦點與選取', async () => {
    const onLensChange = vi.fn()
    const user = userEvent.setup()
    render(<Harness onLensChange={onLensChange} />)
    media().focus()
    await user.keyboard('{ArrowRight}')
    expect(onLensChange).toHaveBeenCalledWith('brands')
    expect(brand()).toHaveFocus()
    expect(brand()).toHaveAttribute('aria-checked', 'true')
    expect(media()).toHaveAttribute('aria-checked', 'false')
  })

  it('ArrowDown 同向、ArrowLeft／ArrowUp 反向，且兩端都會繞回', async () => {
    const user = userEvent.setup()
    render(<Harness />)
    media().focus()

    await user.keyboard('{ArrowDown}')
    expect(brand()).toHaveFocus()

    await user.keyboard('{ArrowLeft}')
    expect(media()).toHaveFocus()
    expect(media()).toHaveAttribute('aria-checked', 'true')

    // Wraps backwards past the first radio.
    await user.keyboard('{ArrowUp}')
    expect(brand()).toHaveFocus()
    expect(brand()).toHaveAttribute('aria-checked', 'true')
  })

  it('Home 選第一顆、End 選最後一顆', async () => {
    const user = userEvent.setup()
    render(<Harness />)
    media().focus()

    await user.keyboard('{End}')
    expect(brand()).toHaveFocus()
    expect(brand()).toHaveAttribute('aria-checked', 'true')

    await user.keyboard('{Home}')
    expect(media()).toHaveFocus()
    expect(media()).toHaveAttribute('aria-checked', 'true')
  })
})
