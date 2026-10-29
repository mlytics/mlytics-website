import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { SpecimenBlock, StoryFrame } from '@/stories/_components/StoryPrimitives'

// Footer CTA (DESIGN.md §5.4) is shown as a spec only. Like InlineEmailCTA.stories,
// this story does NOT import ./BrandPageCTA: it embeds InlineEmailCTA, which uses
// framer-motion and fails to load in the stories test project. The live CTA is at
// the bottom of /brands/ (and the home page and the other audience pages).
const meta = {
  title: 'Components/BrandPageCTA',
  parameters: { layout: 'fullscreen' },
} satisfies Meta
export default meta
type Story = StoryObj<typeof meta>

export const 規格說明: Story = {
  render: () => (
    <StoryFrame
      title="頁尾 CTA"
      intro="每頁最後的深色區塊：置中的標題組加 email 欄（components/pages/brands/BrandPageCTA.tsx；首頁與其他受眾頁同一結構）。這裡只列規格；實際樣子請看 /brands/ 頁尾。"
    >
      <SpecimenBlock
        title="結構（§5.4）"
        lines={[
          { element: '區塊 <section>', code: 'section-dark py-16 text-center' },
          { element: '容器 <div>', code: 'max-w-5xl mx-auto px-6' },
          { element: '區塊標題 <h2>', code: 'section-heading text-white mb-4' },
          { element: '說明 <p>', code: 'text-base max-w-xl mx-auto mb-8 text-on-dark' },
          { element: 'email 欄', code: '<InlineEmailCTA ctaLabel="…" pageName="…" tone="dark" className="mx-auto" />' },
        ]}
      >
        <ul className="space-y-1 text-sm leading-relaxed text-ink-muted">
          <li>h2 → 說明 16（mb-4）；說明寬 576（max-w-xl，置中加 mx-auto）；說明 → email 欄 32（mb-8）。</li>
          <li>首頁容器改 max-w-6xl；/decisive-engine/ 用產品頁變體：email 欄換成標準 44「Contact Us」並呼叫 trackCTA。</li>
          <li>不可在 .section-dark 上再疊 bg-primary-dark；不可自做 email 欄。</li>
        </ul>
      </SpecimenBlock>
    </StoryFrame>
  ),
  parameters: { docs: { description: { story: '頁尾 CTA 的規格（§5.4）。不渲染元件本身；看實際樣子請開 /brands/ 頁尾。' } } },
}
