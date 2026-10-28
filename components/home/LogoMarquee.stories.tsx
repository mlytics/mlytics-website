import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { LogoMarquee } from './LogoMarquee'
import { SpecimenBlock, StoryFrame } from '@/stories/_components/StoryPrimitives'

// The real LogoMarquee (DESIGN.md §5.8). It has no framer-motion, so it renders
// here; logos load from public/ (staticDirs).
const meta = {
  title: 'Components/LogoMarquee',
  component: LogoMarquee,
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof LogoMarquee>
export default meta
type Story = StoryObj<typeof meta>

export const 預設: Story = {
  render: () => (
    <StoryFrame
      title="Logo 跑馬燈"
      intro="首頁「Trusted by」標誌捲動列（components/home/LogoMarquee.tsx），用 .animate-marquee 捲動、滑鼠移上暫停，左右淡出遮罩；全站只有一份。圖片載入失敗時改顯示品牌名稱，文字色 text-ink-muted。"
    >
      <SpecimenBlock title="元件（§5.8）" lines={[{ element: '用法', code: '<LogoMarquee />' }]}>
        <div className="h-16">
          <LogoMarquee />
        </div>
      </SpecimenBlock>
    </StoryFrame>
  ),
  parameters: { docs: { description: { story: '實際的 LogoMarquee 元件。' } } },
}
