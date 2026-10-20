import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { Eyebrow } from '@/components/ui/Eyebrow'
import { PendingNotice, SpecimenBlock, StoryFrame, specimen } from '../_components/StoryPrimitives'

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
