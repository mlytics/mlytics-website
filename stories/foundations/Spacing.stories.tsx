import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { StoryFrame } from '../_components/StoryPrimitives'

const STEPS = [
  { pixels: 4, className: 'w-1' },
  { pixels: 8, className: 'w-2' },
  { pixels: 12, className: 'w-3' },
  { pixels: 16, className: 'w-4' },
  { pixels: 24, className: 'w-6' },
  { pixels: 32, className: 'w-8' },
  { pixels: 48, className: 'w-12' },
  { pixels: 64, className: 'w-16' },
  { pixels: 112, className: 'w-28' },
]

const meta = { title: 'Foundations/Spacing', parameters: { layout: 'fullscreen' } } satisfies Meta
export default meta
type Story = StoryObj<typeof meta>

export const 間距刻度: Story = {
  render: () => (
    <StoryFrame title="間距" intro="一般間距使用 4px 整數刻度；區塊角色另依 DESIGN.md 的固定節奏。">
      <section className="space-y-4 rounded-2xl border border-line bg-white p-6" aria-label="4px 間距刻度">
        {STEPS.map((step) => (
          <div key={step.pixels} className="grid grid-cols-[4rem_1fr] items-center gap-4">
            <span className="text-sm text-ink-muted">{step.pixels}px</span>
            <div className={`${step.className} h-4 rounded-full bg-primary`} aria-hidden="true" />
          </div>
        ))}
      </section>
    </StoryFrame>
  ),
  parameters: { docs: { description: { story: '比較核准的 4px 間距刻度與區塊節奏時使用。' } } },
}
