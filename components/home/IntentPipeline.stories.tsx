import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { SpecimenBlock, StoryFrame } from '@/stories/_components/StoryPrimitives'

// IntentPipeline (DESIGN.md §5.7, §3.6, §3.12) is shown as a spec only. Like
// Nav.stories, this story does NOT import ./IntentPipeline: the component uses
// framer-motion, which fails to load in the stories test project. The live
// carousel is on the home page; its behaviour is covered by
// __tests__/components/home/IntentPipeline.test.tsx.
const meta = {
  title: 'Components/IntentPipeline',
  parameters: { layout: 'fullscreen' },
} satisfies Meta
export default meta
type Story = StoryObj<typeof meta>

export const 規格說明: Story = {
  render: () => (
    <StoryFrame
      title="自動輪播（首頁流程圖）"
      intro="首頁 Intent Refinery 區塊的五層流程（components/home/IntentPipeline.tsx），是自動輪播的標準版。這裡只列規格；實際樣子請看首頁。"
    >
      <SpecimenBlock title="輪播行為（§5.7）" lines={[{ element: '切換間隔', code: '3 秒' }]}>
        <ul className="space-y-1 text-sm leading-relaxed text-ink-muted">
          <li>自動切換；滑鼠移上或鍵盤焦點在內時暫停；點擊後永久停止；捲出畫面時不輪播。</li>
          <li>開啟減少動態時停止自動切換，停在第一列展開。</li>
        </ul>
      </SpecimenBlock>
      <SpecimenBlock title="流程列（§3.6 控制類）" lines={[{ element: '列', code: 'w-full text-left relative flex items-start gap-4 pl-14 pr-4 py-3 rounded-xl' }]}>
        <ul className="space-y-1 text-sm leading-relaxed text-ink-muted">
          <li>每列是真正的 &lt;button&gt;，帶 aria-expanded 與 aria-controls；外觀不像行動按鈕。</li>
          <li>節點用流程圖專用小底座（§3.12）：32px 圓形、框線 1px、內放 15px 圖示。</li>
          <li>受眾標籤是內容區資訊小膠囊深底版（§3.14）。選中列字改白。</li>
        </ul>
      </SpecimenBlock>
    </StoryFrame>
  ),
  parameters: { docs: { description: { story: '首頁流程圖的規格（§5.7）。不渲染元件本身；看實際樣子請開首頁。' } } },
}
