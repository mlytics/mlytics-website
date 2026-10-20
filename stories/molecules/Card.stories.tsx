import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { PendingNotice, SpecimenBlock, StoryFrame, specimen } from '../_components/StoryPrimitives'

const meta = { title: 'Molecules/Card', parameters: { layout: 'fullscreen' } } satisfies Meta
export default meta
type Story = StoryObj<typeof meta>

const PADDINGS = [
  ['card-small', '小卡 20'],
  ['card-regular', '一般卡 24'],
  ['card-large', '大卡 32'],
] as const

export const 卡片外框與內距: Story = {
  render: () => (
    <StoryFrame title="卡片" intro="卡片使用 16px 圓角與 1px 框線，預設扁平；內距依角色選三級。">
      <div className="grid gap-4 lg:grid-cols-3">
        {PADDINGS.map(([id, label]) => {
          // §4.1 light card (frame + bg-surface) and §4.2 padding sit on one element: one string.
          const className = `${specimen('card-light').className} bg-surface ${specimen(id).className}`
          return (
            <SpecimenBlock key={id} title={label} className={className}>
              <div className={className}>
                <p className="text-base leading-relaxed text-ink-muted">Supporting content demonstrates the available space without introducing a pending card title.</p>
              </div>
            </SpecimenBlock>
          )
        })}
      </div>
      <PendingNotice
        title="卡片標題 24px"
        ticket="DATAI-556"
        className={specimen('card-title-pending').className}
        spec={[
          '字級：24px（§2.7 卡片標題；首頁身分卡標題也是 24）。',
          '寫法：text-h3。DATAI-556 把字級 token 改名為 --text-* 後，text-h3 才會是 24px（§2.8）。',
          'DATAI-556 完成前不得新增卡片標題；需要時先問 An。',
        ]}
      >
        依 §7.8，DATAI-556 完成前只列目標規格與票號，不渲染樣本。
      </PendingNotice>
    </StoryFrame>
  ),
  parameters: { docs: { description: { story: '選擇內容卡片外框與 20／24／32px 內距時使用。' } } },
}
