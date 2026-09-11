import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { useState } from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import type { LedgerLens } from '@/components/pages/ai-mode-playground/ai-mode-playground-data'
import { SignalLedger } from '@/components/pages/ai-mode-playground/SignalLedger'

const css = () => readFileSync(
  resolve(__dirname, '../../../../components/pages/ai-mode-playground/AiModePlayground.module.css'),
  'utf8',
)

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
  it('lens 控制項的 id 改用 content-owners', () => {
    render(<SignalLedger lens="content-owners" {...base} />)
    const control = screen.getByRole('tab', { name: /media and content/i })
    expect(control).toHaveAttribute('id', 'lens-content-owners')
    expect(document.getElementById('lens-panel-content-owners')).toBeInTheDocument()
  })

  it('brand 側的 id 改用 brands，顯示標籤仍是 Brand', () => {
    render(<SignalLedger lens="brands" {...base} />)
    const control = screen.getByRole('tab', { name: /^brand/i })
    expect(control).toHaveAttribute('id', 'lens-brands')
    expect(document.getElementById('lens-panel-brands')).toBeInTheDocument()
  })

  // "This is the Media panel" was said four times inside 130 vertical pixels:
  // the tab label, its MEDIA VALUE sublabel, `Media signal ledger`, and the
  // kicker. The third carried no new information, so the row is gone and the
  // one thing on it that does change — the event count — moved next to the
  // list it counts.
  it('surfaceLabel 那一列已整列移除', () => {
    const { container } = render(<SignalLedger lens="content-owners" {...base} />)
    expect(container.textContent).not.toMatch(/signal ledger/i)
    expect(css()).not.toMatch(/\.surfaceLabel/)
  })

  it('kicker 同一行同時帶 lens · mode 與事件數', () => {
    render(<SignalLedger lens="content-owners" {...base} />)
    const kicker = screen.getByText(/MEDIA LENS · CHAT/).closest('[class]')!
    expect(kicker.textContent).toMatch(/MEDIA LENS · CHAT/)
    expect(kicker.textContent).toMatch(/00 EVENTS/)
  })

  it('事件數維持兩位數 padStart 格式，且跟著事件數量走', () => {
    const events = Array.from({ length: 3 }, (_, i) => ({
      id: `e${i}`,
      kind: 'article_scroll',
      title: 't',
      detail: 'd',
      tone: 'raw' as const,
      lensCopy: {
        'content-owners': { title: 't', detail: 'd' },
        brands: { title: 't', detail: 'd' },
      },
    }))
    render(<SignalLedger lens="content-owners" {...base} events={events as never} />)
    const visible = screen.getAllByText('03 EVENTS').filter((n) => n.closest('[hidden]') === null)
    expect(visible).toHaveLength(1)
  })

  it('kicker 為左右兩欄對齊，且保留 mono 樣式', () => {
    expect(css()).toMatch(/\.ledgerKicker\s*\{[^}]*display:\s*flex/)
    expect(css()).toMatch(/\.ledgerKicker\s*\{[^}]*justify-content:\s*space-between/)
    expect(css()).toMatch(/\.ledgerKicker\s*\{[^}]*'SFMono-Regular'/)
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
  it('lens 切換回到 tablist 語意，與左側 mode tab 同形制', () => {
    render(<SignalLedger lens="content-owners" {...base} />)
    expect(screen.getByRole('tablist', { name: /ledger lens/i })).toBeInTheDocument()
    expect(screen.getAllByRole('tab')).toHaveLength(2)
    expect(screen.queryByRole('radiogroup')).not.toBeInTheDocument()
    expect(screen.queryAllByRole('radio')).toHaveLength(0)
  })

  it('tab 反映目前 lens，panel 回到 tabpanel 並與 tab 互相指向', () => {
    render(<SignalLedger lens="content-owners" {...base} />)
    const media = screen.getByRole('tab', { name: /media and content/i })
    const brand = screen.getByRole('tab', { name: /^brand/i })
    expect(media).toHaveAttribute('aria-selected', 'true')
    expect(media).toHaveAttribute('aria-controls', 'lens-panel-content-owners')
    expect(brand).toHaveAttribute('aria-selected', 'false')
    expect(brand).toHaveAttribute('aria-controls', 'lens-panel-brands')
    // Only the selected panel is exposed; the other is `hidden`.
    expect(screen.getAllByRole('tabpanel')).toHaveLength(1)
    expect(document.getElementById('lens-panel-content-owners')).toHaveAttribute('aria-labelledby', 'lens-content-owners')
    expect(document.getElementById('lens-panel-brands')).toHaveAttribute('aria-labelledby', 'lens-brands')
  })

  it('lens tab 內的 Media value／Brand value 小字加回來', () => {
    render(<SignalLedger lens="content-owners" {...base} />)
    expect(screen.getByRole('tab', { name: /media and content/i }).querySelector('small')?.textContent).toBe('Media value')
    expect(screen.getByRole('tab', { name: /^brand/i }).querySelector('small')?.textContent).toBe('Brand value')
  })

  it('CSS 讓 lens tab 與 mode tab 共用 tab 形制，膠囊 lensSwitch 已移除', () => {
    expect(css()).not.toMatch(/\.lensSwitch/)
    expect(css()).toMatch(/\.modeTabs button,\s*\.lensTabs button/)
    expect(css()).toMatch(/\.lensTabs button\s*\{[^}]*min-height:\s*69px/)
    expect(css()).toMatch(/\.modeTabs button\s*\{[^}]*min-height:\s*69px/)
  })

  // Restoring the tab shape must not restore the contrast failures that came
  // with it: the original unselected label measured 2.38:1 and its 10px line
  // 1.57:1, both from literal greys.
  it('還原的 lens tab 顏色一律走 token，不帶回低對比 hex', () => {
    // Scoped to the lens rules: the same grey survives elsewhere in the file
    // as the decorative waveform fill, which is not text and not in scope.
    // Only `color:` is checked — the strip's own surface is the restored UAT
    // tint, which is a background rather than a text colour.
    const lensRules = css().match(/^\.lensTabs[^\n]*$/gm)?.join('\n') ?? ''
    expect(lensRules).not.toBe('')
    expect(lensRules).not.toMatch(/[^-]color:\s*#[0-9A-Fa-f]{3,8}/)
    expect(css()).toMatch(/\.lensTabs button\s*\{[^}]*color:\s*var\(--color-ink-muted\)/)
    expect(css()).toMatch(/\.lensTabs button\[aria-selected='true'\]\s*\{[^}]*border-color:\s*var\(--color-primary\)/)
    expect(css()).toMatch(/\.lensTabs button\[aria-selected='true'\]\s*\{[^}]*color:\s*var\(--color-primary-dark\)/)
    expect(css()).toMatch(/\.modeTabs small,\s*\.lensTabs small\s*\{[^}]*color:\s*var\(--color-ink-muted\)/)
  })

  // The tint was dropped after a contrast reading taken against the wrong
  // surface. #6B6B6B on #E4F0EB measures 4.56:1, so the UAT strip stands.
  it('lens tab 帶還原 UAT 的 #E4F0EB 底色', () => {
    expect(css()).toMatch(/\.lensTabs\s*\{[^}]*background:\s*#E4F0EB/)
  })
})

describe('lens tablist 鍵盤操作（ARIA APG roving tabindex）', () => {
  // A controlled harness: the real page owns lens state, so arrow keys must
  // move focus AND flip the selected tab, not just fire a callback.
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

  const media = () => screen.getByRole('tab', { name: /media and content/i })
  const brand = () => screen.getByRole('tab', { name: /^brand/i })

  it('只有被選取的 tab 進得了 Tab 順序', () => {
    render(<SignalLedger lens="content-owners" {...base} />)
    expect(media()).toHaveAttribute('tabindex', '0')
    expect(brand()).toHaveAttribute('tabindex', '-1')
  })

  it('選取換邊時 tabindex 跟著換邊', () => {
    render(<SignalLedger lens="brands" {...base} />)
    expect(brand()).toHaveAttribute('tabindex', '0')
    expect(media()).toHaveAttribute('tabindex', '-1')
  })

  it('Tab 進入 tablist 時落在被選取的那一顆', async () => {
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
    expect(brand()).toHaveAttribute('aria-selected', 'true')
    expect(media()).toHaveAttribute('aria-selected', 'false')
  })

  it('ArrowDown 同向、ArrowLeft／ArrowUp 反向，且兩端都會繞回', async () => {
    const user = userEvent.setup()
    render(<Harness />)
    media().focus()

    await user.keyboard('{ArrowDown}')
    expect(brand()).toHaveFocus()

    await user.keyboard('{ArrowLeft}')
    expect(media()).toHaveFocus()
    expect(media()).toHaveAttribute('aria-selected', 'true')

    // Wraps backwards past the first tab.
    await user.keyboard('{ArrowUp}')
    expect(brand()).toHaveFocus()
    expect(brand()).toHaveAttribute('aria-selected', 'true')
  })

  it('Home 選第一顆、End 選最後一顆', async () => {
    const user = userEvent.setup()
    render(<Harness />)
    media().focus()

    await user.keyboard('{End}')
    expect(brand()).toHaveFocus()
    expect(brand()).toHaveAttribute('aria-selected', 'true')

    await user.keyboard('{Home}')
    expect(media()).toHaveFocus()
    expect(media()).toHaveAttribute('aria-selected', 'true')
  })
})
