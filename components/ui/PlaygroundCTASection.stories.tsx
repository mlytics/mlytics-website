import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { SpecimenBlock, StoryFrame } from '@/stories/_components/StoryPrimitives'

// AI Mode entry (DESIGN.md §5.6) is shown as a spec only. Like BrandPageCTA.stories,
// this story does NOT import ./PlaygroundCTASection: the component uses
// framer-motion, which fails to load in the stories test project. The live
// standalone entry is on /content-owners/; the embedded one is inside the dark
// solution block on /brands/.
const meta = {
  title: 'Components/PlaygroundCTASection',
  parameters: { layout: 'fullscreen' },
} satisfies Meta
export default meta
type Story = StoryObj<typeof meta>

export const 規格說明: Story = {
  render: () => (
    <StoryFrame
      title="AI Mode 入口區"
      intro="/content-owners/ 與 /brands/ 共用一份元件（components/ui/PlaygroundCTASection.tsx），用 variant 選放法，不另做第二份。這裡只列規格；實際樣子請看 /content-owners/ 與 /brands/。"
    >
      <SpecimenBlock
        title='variant="standalone"（預設，§5.6）'
        lines={[
          { element: '區塊 <section>', code: 'section-white relative overflow-hidden py-16 lg:py-28' },
          { element: '按鈕（§3.2 標準 44）', code: 'inline-flex items-center justify-center px-6 py-3 rounded-full text-sm font-semibold text-white bg-primary transition-opacity hover:opacity-90' },
        ]}
      >
        <ul className="space-y-1 text-sm leading-relaxed text-ink-muted">
          <li>自己是一個白底區塊，上下距同一般內容區塊（手機與平板 64、桌機 112）；背景用 §2.4 標準淺底光暈（/content-owners/）。</li>
          <li>標題組照 §4.3；按鈕呼叫 trackCTA(ctaLabel, trackingPosition)。</li>
        </ul>
      </SpecimenBlock>
      <SpecimenBlock
        title='variant="embedded"（§5.6）'
        lines={[{ element: '按鈕（§3.2 標準 44，與 standalone 同一顆）', code: 'inline-flex items-center justify-center px-6 py-3 rounded-full text-sm font-semibold text-white bg-primary transition-opacity hover:opacity-90' }]}
      >
        <ul className="space-y-1 text-sm leading-relaxed text-ink-muted">
          <li>只輸出內容，放進既有的 .section-dark 區塊（/brands/ 方案區塊第四段）；放在淺底會變白字白底，不可這樣用。</li>
          <li>它是深色區塊的最後一段：外側下緣同一般內容區塊（手機與平板 64、桌機 112）；細線之後的上方照細線分段 48／64（§2.11）。</li>
        </ul>
      </SpecimenBlock>
    </StoryFrame>
  ),
  parameters: { docs: { description: { story: 'AI Mode 入口區的規格（§5.6）。不渲染元件本身；看實際樣子請開 /content-owners/ 與 /brands/。' } } },
}
