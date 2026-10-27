export type ColorToken = {
  token: `--color-${string}`
  hex: string
  usage: string
}

export const COLOR_TOKENS: ColorToken[] = [
  { token: '--color-primary', hex: '#225D59', usage: '主要行動、淺底強調文字與小標籤' },
  { token: '--color-primary-dark', hex: '#1A3D3A', usage: '元件內的小面積深色底' },
  { token: '--color-primary-light', hex: '#2d7a74', usage: '僅限既有地圖訊號點與深底外框 hover' },
  { token: '--color-gold', hex: '#F59E0B', usage: '數字亮點與強調標籤' },
  { token: '--color-gold-light', hex: '#FCD34D', usage: '目前沒有核准用途' },
  { token: '--color-warn', hex: '#D97706', usage: '痛點或問題段落' },
  { token: '--color-warn-deep', hex: '#B45309', usage: '痛點段落的小標籤與圖表線' },
  { token: '--color-surface', hex: '#FAFAFA', usage: '淺灰卡片表面' },
  { token: '--color-ink', hex: '#1A1A1A', usage: '淺底主要文字' },
  { token: '--color-ink-muted', hex: '#6B6B6B', usage: '淺底次要與說明文字' },
  { token: '--color-ink-subtle', hex: '#9B9B9B', usage: '不可用於文字' },
  { token: '--color-on-dark', hex: '#A8C5C3', usage: '深底文字' },
  { token: '--color-line', hex: '#E5E5E5', usage: '淺底框線與分隔線' },
  { token: '--color-error', hex: '#B91C1C', usage: '錯誤提示專用，淺底的錯誤訊息與錯誤框線（§2.2）' },
  { token: '--color-error-on-dark', hex: '#FCA5A5', usage: '錯誤提示專用，深底的錯誤訊息與錯誤框線（§2.2）' },
]
