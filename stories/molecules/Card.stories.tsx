import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { SpecimenBlock, StoryFrame, specimen } from '../_components/StoryPrimitives'

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
                <h3 className={specimen('card-title').className}>Card title</h3>
                <p className="text-base leading-relaxed text-ink-muted">Supporting content demonstrates the available space.</p>
              </div>
            </SpecimenBlock>
          )
        })}
      </div>
    </StoryFrame>
  ),
  parameters: { docs: { description: { story: '選擇內容卡片外框與 20／24／32px 內距時使用。' } } },
}
