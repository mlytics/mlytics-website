import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { ScrollToTop } from './ScrollToTop'
import { SpecimenBlock, StoryFrame } from '@/stories/_components/StoryPrimitives'

// ScrollToTop (DESIGN.md §5.8) renders nothing. The story explains what it
// does and still mounts it, so the render check exercises the real component.
const meta = {
  title: 'Components/ScrollToTop',
  component: ScrollToTop,
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof ScrollToTop>
export default meta
type Story = StoryObj<typeof meta>

export const 行為說明: Story = {
  render: () => (
    <StoryFrame title="換頁捲回頂端" intro="ScrollToTop 沒有畫面：它只負責在換頁時把視窗捲回頁首。全站只有一份，需要相同功能時重用，不另寫。">
      <SpecimenBlock title="行為" lines={[{ element: '掛載位置（app/layout.tsx 的 <body> 內第一個元素）', code: '<ScrollToTop />' }]}>
        <ul className="space-y-1 text-sm leading-relaxed text-ink-muted">
          <li>做什麼：網址路徑（pathname）改變時，立即捲回頁面最上方。</li>
          <li>掛在哪：app/layout.tsx，所有頁面共用，各頁不用再放。</li>
          <li>畫面：沒有。這個區塊下方已掛載元件本身，所以看不到任何東西是正常的。</li>
        </ul>
        <ScrollToTop />
      </SpecimenBlock>
    </StoryFrame>
  ),
  parameters: { docs: { description: { story: '新增頁面不需要處理換頁捲動；app/layout.tsx 已全站掛載。' } } },
}
