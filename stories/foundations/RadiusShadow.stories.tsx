import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { StoryFrame } from '../_components/StoryPrimitives'

const meta = { title: 'Foundations/RadiusShadow', parameters: { layout: 'fullscreen' } } satisfies Meta
export default meta
type Story = StoryObj<typeof meta>

export const 圓角與陰影: Story = {
  render: () => (
    <StoryFrame title="圓角與陰影" intro="圓角依元件角色選擇；卡片預設扁平，需要浮出時只用三級陰影。">
      <section className="grid gap-6 md:grid-cols-2" aria-label="圓角樣本">
        {[
          ['小元件／表單欄位', 'rounded-lg'],
          ['卡片內層元件', 'rounded-xl'],
          ['卡片', 'rounded-2xl'],
          ['藥丸', 'rounded-full'],
        ].map(([label, className]) => (
          <article key={label} className={`${className} border border-line bg-surface p-6`}>
            <h2 className="text-base font-semibold">{label}</h2>
            <code className="text-sm text-ink-muted">{className}</code>
          </article>
        ))}
      </section>
      <section className="grid gap-6 md:grid-cols-3" aria-label="陰影樣本">
        {[
          ['輕微浮出', 'shadow-sm'],
          ['面板', 'shadow-lg'],
          ['高層浮出', 'shadow-xl'],
        ].map(([label, className]) => (
          <article key={label} className={`rounded-2xl border border-line bg-white p-6 ${className}`}>
            <h2 className="text-base font-semibold">{label}</h2>
            <code className="text-sm text-ink-muted">{className}</code>
          </article>
        ))}
      </section>
    </StoryFrame>
  ),
  parameters: { docs: { description: { story: '決定元件圓角角色或核准陰影級別時使用。' } } },
}
