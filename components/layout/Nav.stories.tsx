import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { SpecimenBlock, StoryFrame } from '@/stories/_components/StoryPrimitives'

// Nav (DESIGN.md §5.1) is shown as a spec only. Like ReducedMotion.stories,
// this story does NOT import ./Nav: the component imports framer-motion, which
// fails to load in the stories test project ("Cannot find module
// next/dist/compiled/react/jsx-runtime"). The live navigation bar is on every
// page; its behaviour is covered by __tests__/components/layout/Nav.test.tsx.
const meta = {
  title: 'Components/Nav',
  parameters: { layout: 'fullscreen' },
} satisfies Meta
export default meta
type Story = StoryObj<typeof meta>

export const 規格說明: Story = {
  render: () => (
    <StoryFrame
      title="導覽列"
      intro="全站唯一的導覽列（components/layout/Nav.tsx），由 app/layout.tsx 提供，不另做。這裡只列規格；實際樣子請看任一頁面。"
    >
      <SpecimenBlock title="外觀" lines={[{ element: '掛載位置（app/layout.tsx 的 <body> 內，<main> 之前）', code: '<Nav />' }]}>
        <ul className="space-y-1 text-sm leading-relaxed text-ink-muted">
          <li>高 65px；fixed、z-50；底色 bg-white/80 加 backdrop-blur-sm（§2.3 核准例外）；底線 1px border-line。</li>
          <li>連結 14／500 text-ink、滑過主色；目前頁 14／600 主色（顏色與滿版選單連結相同；半透明白底蓋在深色區塊上會變灰，不可用 text-ink-muted）。</li>
        </ul>
      </SpecimenBlock>
      <SpecimenBlock title="入口排法" lines={[{ element: '桌機右側（≥1024）', code: '[Book a Demo 外框 36｜Try AI Mode 實心 36]' }]}>
        <ul className="space-y-1 text-sm leading-relaxed text-ink-muted">
          <li>≥1024：右側為外框 Book a Demo 36、實心 Try AI Mode 36，主按鈕在最右。</li>
          <li>&lt;1024：Logo 與漢堡鈕之間只放實心 Try AI Mode 36；中間不放 AI Mode 文字連結。</li>
          <li>滿版選單（z-[60]）：上方 Logo＋關閉鈕、連結逐列 border-line 分隔、底部 [Book a Demo 外框 44｜Try AI Mode 實心 44] 等寬並排。</li>
          <li>追蹤位置：桌機 nav、手機導覽列 nav_mobile_header、滿版選單 nav_mobile。</li>
        </ul>
      </SpecimenBlock>
      <SpecimenBlock title="技術約束（改導覽列必讀，§7.4）" lines={[{ element: '桌機斷點', code: "matchMedia('(min-width: 64rem)')" }]}>
        <ul className="space-y-1 text-sm leading-relaxed text-ink-muted">
          <li>滿版選單必須是 &lt;nav&gt; 的兄弟元素（&lt;nav&gt; 帶 transform／backdrop-blur，會困住 fixed 子元素）。</li>
          <li>選單內不可含 &lt;nav&gt;／&lt;header&gt;（AI Mode 頁以 header, nav 找導覽列）。</li>
          <li>導覽列高度維持 65px；斷點一律用上方的 matchMedia。</li>
        </ul>
      </SpecimenBlock>
    </StoryFrame>
  ),
  parameters: { docs: { description: { story: '導覽列的規格（§5.1）。不渲染元件本身；看實際樣子請開任一頁面。' } } },
}
