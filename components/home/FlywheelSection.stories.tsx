import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { SpecimenBlock, StoryFrame } from '@/stories/_components/StoryPrimitives'

// Home Flywheel (DESIGN.md §5.8) is shown as a spec only. Like BrandPageCTA.stories,
// this story does NOT import ./FlywheelSection: the component uses framer-motion,
// which fails to load in the stories test project. The live section is the dark
// block on the home page.
const meta = {
  title: 'Components/FlywheelSection',
  parameters: { layout: 'fullscreen' },
} satisfies Meta
export default meta
type Story = StoryObj<typeof meta>

export const 規格說明: Story = {
  render: () => (
    <StoryFrame
      title="Flywheel（首頁專屬）"
      intro="首頁專屬的深色區塊，含展示大數字，全站只有一份（components/home/FlywheelSection.tsx）。這裡只列規格；實際樣子請看首頁。"
    >
      <SpecimenBlock
        title="結構（§2.11、§2.12、§5.8）"
        lines={[
          { element: '區塊上下距（一般內容區塊）', code: 'py-16 lg:py-28' },
          { element: '容器（首頁專屬 1152）', code: 'max-w-6xl' },
          { element: '區塊標題 <h2>', code: '.section-heading' },
        ]}
      >
        <ul className="space-y-1 text-sm leading-relaxed text-ink-muted">
          <li>深色區塊（.section-dark）；上下距手機與平板 64、桌機（≥1024）112。</li>
          <li>展示大數字見 §4.5；計數動畫用元件內自己的 CountUp，是只限這一處的核准例外（§3.13）。</li>
          <li>1152 容器只限首頁，其他頁不可照抄（§6.4）。</li>
        </ul>
      </SpecimenBlock>
    </StoryFrame>
  ),
  parameters: { docs: { description: { story: '首頁 Flywheel 的規格（§5.8）。不渲染元件本身；看實際樣子請開首頁。' } } },
}
