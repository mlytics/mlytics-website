import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { Check, ChevronDown, CircleCheck, Sparkles } from 'lucide-react'
import { SpecimenBlock, StoryFrame, specimen } from '../_components/StoryPrimitives'

const meta = { title: 'Atoms/Icons', parameters: { layout: 'fullscreen' } } satisfies Meta
export default meta
type Story = StoryObj<typeof meta>

// §3.12 big badge, including its centering classes; the shown code is exactly
// the rendered className.
const BADGE = specimen('icon-badge').className

export const 圖示角色: Story = {
  render: () => (
    <StoryFrame title="圖示" intro="功能圖示使用 lucide-react；尺寸依角色固定。">
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4" aria-label="圖示尺寸角色">
        <article className="rounded-2xl border border-line bg-white p-5">
          <ChevronDown size={12} aria-hidden="true" />
          <h2 className="mt-4 text-base font-semibold">小控制</h2>
          <p className="text-sm text-ink-muted">12px</p>
        </article>
        <article className="rounded-2xl border border-line bg-white p-5">
          <Check size={14} aria-hidden="true" />
          <h2 className="mt-4 text-base font-semibold">行內勾勾</h2>
          <p className="text-sm text-ink-muted">14px</p>
        </article>
        <article className="rounded-2xl border border-line bg-white p-5">
          <Sparkles size={22} aria-hidden="true" />
          <h2 className="mt-4 text-base font-semibold">功能圖示</h2>
          <p className="text-sm text-ink-muted">22px</p>
        </article>
        <article className="rounded-2xl border border-line bg-white p-5">
          <CircleCheck size={32} aria-hidden="true" />
          <h2 className="mt-4 text-base font-semibold">狀態大圖示</h2>
          <p className="text-sm text-ink-muted">32px</p>
        </article>
      </section>
      <SpecimenBlock title="大號圖示底座" className={BADGE}>
        <div className={BADGE}>
          <Sparkles size={22} aria-hidden="true" />
        </div>
      </SpecimenBlock>
    </StoryFrame>
  ),
  parameters: { docs: { description: { story: '選擇功能圖示、尺寸角色或一般卡片底座時使用。' } } },
}
