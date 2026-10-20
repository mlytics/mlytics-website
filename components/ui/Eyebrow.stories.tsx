import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { Eyebrow } from './Eyebrow'
import { SpecimenBlock, StoryFrame } from '@/stories/_components/StoryPrimitives'

// The real Eyebrow component (DESIGN.md §3.8). Each code line is exactly the
// JSX the sample renders, so what is shown is what to copy.
const meta = {
  title: 'Components/Eyebrow',
  component: Eyebrow,
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof Eyebrow>
export default meta
type Story = StoryObj<typeof meta>

const LIGHT = '<Eyebrow>Foundation</Eyebrow>'
const DARK = '<Eyebrow dark>Foundation</Eyebrow>'
const PAIN = '<Eyebrow color="var(--color-warn-deep)">The problem</Eyebrow>'

const INTRO = '區塊標題（h2）上方的大寫小字，一律用 Eyebrow 元件（.label-eyebrow：12／600／大寫／字距 0.1em），換色用元件參數，不用 className 覆寫，也不加 block 或 mb-*。'

export const 淺底: Story = {
  args: { children: 'Foundation' },
  render: () => (
    <StoryFrame title="小標籤・淺底" intro={INTRO}>
      <SpecimenBlock title="淺底預設（主色）" lines={[{ element: '元件用法（§3.8）', code: LIGHT }]}>
        <Eyebrow>Foundation</Eyebrow>
      </SpecimenBlock>
    </StoryFrame>
  ),
  parameters: { docs: { description: { story: '白色區塊的標題組開頭使用；不帶參數，預設主色。' } } },
}

export const 深底: Story = {
  args: { children: 'Foundation', dark: true },
  render: () => (
    <StoryFrame title="小標籤・深底" intro={INTRO}>
      <section className="section-dark space-y-3 rounded-2xl p-6">
        <h2 className="text-base font-semibold text-white">深底（on-dark）</h2>
        <div>
          <Eyebrow dark>Foundation</Eyebrow>
        </div>
        <p className="text-xs font-semibold text-on-dark">元件用法（§3.8）</p>
        <code className="block overflow-x-auto rounded-lg bg-primary/25 p-3 text-xs text-on-dark">{DARK}</code>
      </section>
    </StoryFrame>
  ),
  parameters: { docs: { description: { story: '深色區塊（.section-dark）的標題組開頭使用；加 dark 參數換成 on-dark。' } } },
}

export const 痛點色: Story = {
  args: { children: 'The problem', color: 'var(--color-warn-deep)' },
  render: () => (
    <StoryFrame title="小標籤・痛點段落" intro={INTRO}>
      <SpecimenBlock title="痛點段落（warn-deep）" lines={[{ element: '元件用法（§3.8）', code: PAIN }]}>
        <Eyebrow color="var(--color-warn-deep)">The problem</Eyebrow>
      </SpecimenBlock>
    </StoryFrame>
  ),
  parameters: { docs: { description: { story: '只用於痛點／問題段落（例：/brands/ 痛點段落）；用 color 參數換成 warn-deep。' } } },
}
