import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { SpecimenBlock, StoryFrame } from '@/stories/_components/StoryPrimitives'

// ContentOwnerFAQ (DESIGN.md §5.5) is shown as a spec only. Like Nav.stories and
// ReducedMotion.stories, this story does NOT import ./ContentOwnerFAQ: the component
// imports framer-motion, which fails to load in the stories test project
// ("Cannot find module next/dist/compiled/react/jsx-runtime"). The live FAQ is
// on /content-owners/; a single FAQ row is rendered in Molecules/FaqItem.
const meta = {
  title: 'Components/ContentOwnerFAQ',
  parameters: { layout: 'fullscreen' },
} satisfies Meta
export default meta
type Story = StoryObj<typeof meta>

export const 規格說明: Story = {
  render: () => (
    <StoryFrame
      title="FAQ 區塊（/content-owners/）"
      intro="/content-owners/ 的 FAQ（components/pages/publishers/ContentOwnerFAQ.tsx），與 /brands/ 標準版 BrandFAQ 一致，只有題目不同。這裡只列規格；實際樣子請看 /content-owners/。"
    >
      <SpecimenBlock
        title="區塊（§5.5）"
        lines={[
          { element: '區塊 <section>', code: 'section-white pt-8 pb-16 lg:pb-20' },
          { element: '容器 <div>', code: 'max-w-5xl mx-auto px-6' },
          { element: '標題組 <div>', code: 'text-center mb-12' },
          { element: '標題 <h2>（小標籤「FAQ」用 <Eyebrow>，不加 mb-*）', code: 'section-heading text-ink' },
        ]}
      >
        <ul className="space-y-1 text-sm leading-relaxed text-ink-muted">
          <li>白底；上 32、下 64（桌機 80）；接在深色區塊之後時，上方改用一般區塊距離（§2.11）。</li>
          <li>置中標題組：小標籤「FAQ」＋ h2「Common questions.」。</li>
        </ul>
      </SpecimenBlock>
      <SpecimenBlock
        title="每一題（§4.4）"
        lines={[
          { element: '題目清單外層 <div>（列線，§4.4）', code: 'border-t border-line' },
          { element: '每一題 <div>（列線）', code: 'border-b border-line' },
          { element: '題目列 <button>（加 aria-expanded／aria-controls；焦點外框由全站規則提供，§3.7）', code: 'w-full flex items-center justify-between gap-4 py-5 text-left' },
          { element: '題目文字', code: 'text-base font-semibold leading-snug text-ink' },
          { element: '加號（展開時旋轉 45°）', code: 'shrink-0 w-6 h-6 rounded-full flex items-center justify-center transition-transform duration-200 bg-primary/8' },
          { element: '答案', code: 'pb-5 text-sm md:text-base leading-relaxed text-ink-muted' },
        ]}
      >
        <p className="text-sm leading-relaxed text-ink-muted">可展開的單題樣本見 Molecules/FaqItem。</p>
      </SpecimenBlock>
      <SpecimenBlock title="結構化資料（§7.2）" lines={[{ element: '區塊內放一段', code: '<script type="application/ld+json">' }]}>
        <ul className="space-y-1 text-sm leading-relaxed text-ink-muted">
          <li>必帶 FAQPage JSON-LD：@type 為 FAQPage，mainEntity 由畫面渲染用的同一個題目陣列產生（每題 Question＋acceptedAnswer）。</li>
          <li>不可另寫一份與畫面不同的題目或答案。</li>
        </ul>
      </SpecimenBlock>
    </StoryFrame>
  ),
  parameters: { docs: { description: { story: 'FAQ 區塊的規格（§5.5）。不渲染元件本身；看實際樣子請開 /content-owners/。' } } },
}
