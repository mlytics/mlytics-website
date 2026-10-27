import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { Eyebrow } from '@/components/ui/Eyebrow'
import { SpecimenBlock, StoryFrame, specimen } from '../_components/StoryPrimitives'

const meta = { title: 'Atoms/Eyebrows', parameters: { layout: 'fullscreen' } } satisfies Meta
export default meta
type Story = StoryObj<typeof meta>

export const 小標籤: Story = {
  render: () => (
    <StoryFrame title="小標籤" intro="區塊小標籤一律用 Eyebrow 元件，依底色選參數；Hero 小膠囊用 .label-eyebrow-pill。">
      <div className="grid gap-4 md:grid-cols-2">
        <SpecimenBlock title="區塊小標籤 12px・淺底" lines={[{ element: '元件用法（§3.8）', code: '<Eyebrow>' }]}>
          <Eyebrow>Foundation</Eyebrow>
        </SpecimenBlock>
        <section className="section-dark space-y-3 rounded-2xl p-6">
          <h2 className="text-base font-semibold text-white">區塊小標籤 12px・深底</h2>
          <div>
            <Eyebrow dark>Foundation</Eyebrow>
          </div>
          <p className="text-xs font-semibold text-on-dark">元件用法（§3.8）</p>
          <code className="block overflow-x-auto rounded-lg bg-primary/25 p-3 text-xs text-on-dark">{'<Eyebrow dark>'}</code>
        </section>
        <SpecimenBlock title="較大小標籤 14px" className={specimen('eyebrow-medium').className}>
          <span className={specimen('eyebrow-medium').className}>Supporting signal</span>
        </SpecimenBlock>
      </div>
      <section className="section-dark space-y-3 rounded-2xl p-6">
        <h2 className="text-base font-semibold text-white">Hero 小膠囊（§3.9）</h2>
        <div>
          <span className={specimen('hero-pill').className}>For Brands</span>
        </div>
        <p className="text-xs font-semibold text-on-dark">深色 Hero 的 h1 上方與 404 CDN 版；框線 1px primary .6、行高 16、內距上下 4・左右 12（高 26）由類別提供</p>
        <code className="block overflow-x-auto rounded-lg bg-primary/25 p-3 text-xs text-on-dark">{specimen('hero-pill').className}</code>
      </section>
    </StoryFrame>
  ),
  parameters: { docs: { description: { story: '標示區塊主題或較大的輔助標示時使用。' } } },
}
