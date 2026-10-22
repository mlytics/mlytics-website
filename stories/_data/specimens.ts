export type Specimen = {
  id: string
  layer: 'atom' | 'molecule'
  label: string
  className: string
  note?: string
}

export const SPECIMENS: Specimen[] = [
  {
    id: 'button-solid-44',
    layer: 'atom',
    label: '實心藥丸・標準 44',
    className: 'inline-flex items-center justify-center px-6 py-3 rounded-full text-sm font-semibold text-white bg-primary transition-opacity hover:opacity-90',
  },
  {
    id: 'button-solid-40',
    layer: 'atom',
    label: '實心藥丸・輸入框內 40',
    className: 'shrink-0 px-4 md:px-5 py-2.5 rounded-full text-sm font-semibold transition-[opacity,scale] hover:opacity-90 active:scale-[0.98] bg-primary text-white disabled:opacity-60 whitespace-nowrap',
  },
  {
    id: 'button-solid-36',
    layer: 'atom',
    label: '實心藥丸・導覽列 36',
    className: 'px-4 py-2 rounded-full text-sm font-semibold text-white transition-opacity hover:opacity-90 bg-primary',
  },
  {
    id: 'button-full-44',
    layer: 'atom',
    label: '滿版藥丸 44',
    className: 'w-full inline-flex items-center justify-center px-6 py-3 rounded-full text-sm font-semibold text-white bg-primary transition-opacity hover:opacity-90',
  },
  {
    id: 'button-outline-36',
    layer: 'atom',
    label: '淺底外框 36',
    className: 'pill-btn px-[calc(1rem-1px)] py-[calc(0.5rem-1px)]',
  },
  {
    id: 'button-outline-44',
    layer: 'atom',
    label: '淺底外框 44',
    className: 'pill-btn',
  },
  {
    id: 'button-outline-dark',
    layer: 'atom',
    label: '深底外框',
    className: 'pill-btn pill-btn--dark',
  },
  {
    id: 'focus-ring',
    layer: 'atom',
    label: '互動元素焦點外框',
    className: 'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary',
  },
  { id: 'eyebrow', layer: 'atom', label: '區塊小標籤', className: 'label-eyebrow' },
  { id: 'eyebrow-medium', layer: 'atom', label: '較大小標籤', className: 'label-eyebrow-md' },
  {
    id: 'hero-pill',
    layer: 'atom',
    label: 'Hero 小膠囊',
    className: 'label-eyebrow-pill mb-4 bg-primary/40 text-on-dark',
    note: 'DATAI-621／DATAI-625 完成前只列規格，不渲染樣本。',
  },
  {
    id: 'input',
    layer: 'atom',
    label: '多欄表單輸入框',
    className: 'w-full px-3 py-2 text-sm border border-line rounded-lg focus:border-primary transition-colors placeholder:text-ink-muted',
  },
  { id: 'divider-light', layer: 'atom', label: '淺底分隔線', className: 'border-t border-line' },
  { id: 'divider-dark', layer: 'atom', label: '深底分隔線', className: 'border-t border-on-dark/12' },
  {
    id: 'icon-badge',
    layer: 'atom',
    label: '大號圖示底座',
    className: 'grid place-items-center w-12 h-12 rounded-2xl bg-primary text-white',
  },
  { id: 'card-light', layer: 'molecule', label: '淺底卡片', className: 'rounded-2xl border border-line' },
  { id: 'card-small', layer: 'molecule', label: '小卡內距', className: 'p-5' },
  { id: 'card-regular', layer: 'molecule', label: '一般卡內距', className: 'p-6' },
  { id: 'card-large', layer: 'molecule', label: '大卡內距', className: 'p-8' },
  { id: 'card-title', layer: 'molecule', label: '卡片標題 24', className: 'text-h3 font-bold leading-snug' },
  { id: 'heading-title', layer: 'molecule', label: '區塊標題', className: 'section-heading mb-4 text-ink' },
  {
    id: 'heading-description',
    layer: 'molecule',
    label: '區塊說明',
    className: 'text-base max-w-xl mx-auto text-ink-muted',
  },
  {
    id: 'faq-trigger',
    layer: 'molecule',
    label: 'FAQ 題目列',
    className: 'w-full flex items-center justify-between gap-4 py-5 text-left',
  },
  {
    id: 'faq-question',
    layer: 'molecule',
    label: 'FAQ 題目文字',
    className: 'text-base font-semibold leading-snug text-ink',
  },
  {
    id: 'faq-icon',
    layer: 'molecule',
    label: 'FAQ 加號',
    className: 'shrink-0 w-6 h-6 rounded-full flex items-center justify-center transition-transform duration-200 bg-primary/8',
  },
  {
    id: 'faq-answer',
    layer: 'molecule',
    label: 'FAQ 答案',
    className: 'pb-5 text-sm md:text-base leading-relaxed text-ink-muted',
  },
  {
    id: 'stat-card-primary',
    layer: 'molecule',
    label: '卡片主數字',
    className: 'text-4xl md:text-5xl font-bold',
  },
  {
    id: 'stat-card-secondary',
    layer: 'molecule',
    label: '規格數字',
    className: 'text-xl font-bold text-primary',
  },
  {
    id: 'stat-price',
    layer: 'molecule',
    label: '方案價格',
    className: 'text-4xl font-black text-primary',
  },
]
