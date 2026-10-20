import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { Eyebrow } from '@/components/ui/Eyebrow'
import { SpecimenBlock, StoryFrame, specimen } from '../_components/StoryPrimitives'

const meta = { title: 'Foundations/Typography', parameters: { layout: 'fullscreen' } } satisfies Meta
export default meta
type Story = StoryObj<typeof meta>

// Each sample renders exactly the string shown under it (DESIGN.md §2.7, §4.6).
const HERO = 'text-4xl md:text-5xl font-bold'
const DISPLAY = 'text-4xl md:text-6xl font-bold leading-tight'
const BODY = 'text-base leading-relaxed'
const SUPPORT = 'text-sm text-ink-muted'

export const 字級角色: Story = {
  render: () => (
    <StoryFrame title="字級角色" intro="字級依文字角色決定；以下英文僅為中性排版樣本。">
      <div className="space-y-4">
        <SpecimenBlock title="Hero 標題" className={HERO}>
          <p className={HERO}>Build a clearer path forward.</p>
        </SpecimenBlock>
        <SpecimenBlock title="區塊標題" className="section-heading">
          <p className="section-heading">A system for consistent decisions.</p>
        </SpecimenBlock>
        <SpecimenBlock title="卡片標題" className={specimen('card-title').className}>
          <p className={specimen('card-title').className}>A clear card title.</p>
        </SpecimenBlock>
        <SpecimenBlock title="展示大字句" className={DISPLAY}>
          <p className={DISPLAY}>Make every signal useful.</p>
        </SpecimenBlock>
        <SpecimenBlock title="內文" className={BODY}>
          <p className={BODY}>A shared language helps teams create coherent experiences across every page.</p>
        </SpecimenBlock>
        <SpecimenBlock title="輔助文字" className={SUPPORT}>
          <p className={SUPPORT}>Supporting context stays readable without competing with the main message.</p>
        </SpecimenBlock>
        <SpecimenBlock title="小標籤" lines={[{ element: '元件用法（§3.8）', code: '<Eyebrow>' }]}>
          <Eyebrow>Design foundation</Eyebrow>
        </SpecimenBlock>
      </div>
    </StoryFrame>
  ),
  parameters: { docs: { description: { story: '依內容角色選擇全站字級時使用。' } } },
}
