import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { WorldMapDots } from './WorldMapDots'
import { SpecimenBlock, StoryFrame } from '@/stories/_components/StoryPrimitives'

// The real WorldMapDots (DESIGN.md §5.8), in the light variant the home Hero
// uses (components/home/HeroSection.tsx). It does not import framer-motion, so
// it renders in the stories test project. The component is absolutely
// positioned (inset-0), so the sample gives it a sized, relative white box.
const meta = {
  title: 'Components/WorldMapDots',
  component: WorldMapDots,
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof WorldMapDots>
export default meta
type Story = StoryObj<typeof meta>

const USAGE = '<WorldMapDots variant="light" />'

export const 首頁Hero背景: Story = {
  args: { variant: 'light' },
  render: () => (
    <StoryFrame
      title="世界地圖點陣（WorldMapDots）"
      intro="首頁 Hero 背景點陣：底圖點 primary .12、訊號點 --color-primary-light、擴散圈 .ping-ring；減少動態時不出現訊號點（§8.4）。全站只有一份，需要相同功能時重用，不另寫。"
    >
      <SpecimenBlock title='首頁 Hero（白底，variant="light"）' lines={[{ element: '元件用法（放在 relative 的容器內，元件本身 absolute inset-0）', code: USAGE }]}>
        <div className="relative h-80 overflow-hidden rounded-xl bg-white">
          <WorldMapDots variant="light" />
        </div>
      </SpecimenBlock>
      <ul className="space-y-1 text-sm leading-relaxed text-ink-muted">
        <li>底圖點陣：primary .12（rgba(34,93,89,0.12)，§2.3 階梯）。</li>
        <li>訊號點：每 1.4–2.4 秒出現一個，3 秒後消失；一般訊號點用 --color-primary-light，擴散圈用 .ping-ring。</li>
        <li>系統開啟「減少動態效果」時只顯示底圖點陣，不出現訊號點（§8.4）。</li>
      </ul>
    </StoryFrame>
  ),
  parameters: { docs: { description: { story: '首頁 Hero 的背景點陣（§5.8）。訊號點隨機出現，畫面每次不同。' } } },
}
