import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { StoryFrame } from '../_components/StoryPrimitives'
import { COLOR_TOKENS } from '../_data/tokens'

const SWATCH_CLASSES: Record<(typeof COLOR_TOKENS)[number]['token'], string> = {
  '--color-primary': 'bg-primary',
  '--color-primary-dark': 'bg-primary-dark',
  '--color-primary-light': 'bg-primary-light',
  '--color-gold': 'bg-gold',
  '--color-gold-light': 'bg-gold-light',
  '--color-warn': 'bg-warn',
  '--color-warn-deep': 'bg-warn-deep',
  '--color-surface': 'bg-surface',
  '--color-ink': 'bg-ink',
  '--color-ink-muted': 'bg-ink-muted',
  '--color-ink-subtle': 'bg-ink-subtle',
  '--color-on-dark': 'bg-on-dark',
  '--color-line': 'bg-line',
}

const meta = { title: 'Foundations/Colors', parameters: { layout: 'fullscreen' } } satisfies Meta
export default meta
type Story = StoryObj<typeof meta>

export const 色彩總覽: Story = {
  render: () => (
    <StoryFrame title="色彩" intro="色票逐一對應 app/site-base.css 的 @theme；用途與限制以 DESIGN.md 為準。">
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3" aria-label="設計系統色票">
        {COLOR_TOKENS.map((color) => (
          <article key={color.token} className="overflow-hidden rounded-2xl border border-line bg-white">
            <div className={`h-24 ${SWATCH_CLASSES[color.token]}`} data-hex={color.hex} aria-hidden="true" />
            <div className="space-y-1 p-5">
              <code className="text-sm font-semibold text-ink">{color.token}</code>
              <p className="text-sm text-ink-muted">{color.hex}</p>
              <p className="text-sm leading-relaxed text-ink-muted">{color.usage}</p>
            </div>
          </article>
        ))}
      </section>
    </StoryFrame>
  ),
  parameters: { docs: { description: { story: '查閱全站核准色票、色碼與各自用途時使用。' } } },
}
