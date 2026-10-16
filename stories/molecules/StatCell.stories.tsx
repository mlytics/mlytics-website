import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { SpecimenBlock, StoryFrame, specimen } from '../_components/StoryPrimitives'

const meta = { title: 'Molecules/StatCell', parameters: { layout: 'fullscreen' } } satisfies Meta
export default meta
type Story = StoryObj<typeof meta>

const STATS = [
  ['stat-card-primary', '卡片主數字', '48%', 'A primary card metric'],
  ['stat-card-secondary', '規格數字', '24', 'A supporting specification'],
  ['stat-price', '方案價格', '$120', 'A plan price'],
] as const

export const 數字角色: Story = {
  render: () => (
    <StoryFrame title="統計數字" intro="卡片數字依資訊層級選擇主角、規格或方案價格角色。">
      <div className="grid gap-4 lg:grid-cols-3">
        {STATS.map(([id, label, value, description]) => (
          <SpecimenBlock key={id} title={label} className={specimen(id).className}>
            <div className="rounded-2xl border border-line bg-surface p-5">
              <p className={specimen(id).className}>{value}</p>
              <p className="mt-2 text-sm leading-relaxed text-ink-muted">{description}</p>
            </div>
          </SpecimenBlock>
        ))}
      </div>
    </StoryFrame>
  ),
  parameters: { docs: { description: { story: '在卡片中呈現主要數字、規格或價格時使用。' } } },
}
