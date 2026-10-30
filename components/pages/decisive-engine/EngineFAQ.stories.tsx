import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { SpecimenBlock, StoryFrame } from '@/stories/_components/StoryPrimitives'

// FAQ on /decisive-engine/ (DESIGN.md §5.5) is shown as a spec only. Like
// BrandPageCTA.stories, this story does NOT import ./EngineFAQ: the component
// uses framer-motion, which fails to load in the stories test project. The live
// FAQ is near the bottom of /decisive-engine/.
const meta = {
  title: 'Components/EngineFAQ',
  parameters: { layout: 'fullscreen' },
} satisfies Meta
export default meta
type Story = StoryObj<typeof meta>

export const 規格說明: Story = {
  render: () => (
    <StoryFrame
      title="FAQ 區塊（/decisive-engine/）"
      intro="與 /brands/ 標準版 BrandFAQ 一致（components/pages/decisive-engine/EngineFAQ.tsx）。這裡只列規格；實際樣子請看 /decisive-engine/ 頁尾 CTA 上方。"
    >
      <SpecimenBlock
        title="結構（§2.11、§5.5）"
        lines={[
          { element: '區塊 <section>', code: 'section-white pt-16 lg:pt-28 pb-16 lg:pb-20' },
          { element: '容器 <div>', code: 'max-w-5xl mx-auto px-6' },
        ]}
      >
        <ul className="space-y-1 text-sm leading-relaxed text-ink-muted">
          <li>接在深色結果區之後，上方改用一般區塊距離：手機與平板 64、桌機（≥1024）112；下方同一般 FAQ（64，桌機 80）。</li>
          <li>置中標題組「FAQ」＋「Common questions.」（.section-heading）；每題見 Components/BrandFAQ（§4.4）。</li>
          <li>必帶 FAQPage JSON-LD（§7.2）。</li>
        </ul>
      </SpecimenBlock>
    </StoryFrame>
  ),
  parameters: { docs: { description: { story: '/decisive-engine/ FAQ 的規格（§5.5）。不渲染元件本身；看實際樣子請開 /decisive-engine/。' } } },
}
