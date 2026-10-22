import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { NumberTicker } from './NumberTicker'
import { SpecimenBlock, StoryFrame } from '@/stories/_components/StoryPrimitives'

// The real NumberTicker (DESIGN.md §3.13). Each code line is exactly the JSX
// the sample renders, so what is shown is what to copy.
const meta = {
  title: 'Components/NumberTicker',
  component: NumberTicker,
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof NumberTicker>
export default meta
type Story = StoryObj<typeof meta>

const WRAPPER = '<div className="text-4xl md:text-5xl font-bold">'
const TICKER = '<NumberTicker value={85} suffix="%" />'

export const 卡片數字: Story = {
  args: { value: 85, suffix: '%' },
  render: () => (
    <StoryFrame
      title="數字滾動（NumberTicker）"
      intro="數字需要從 0 滾到目標值時用共用元件 NumberTicker。元件不帶字級與顏色，由外層決定（卡片數字・主角見 §4.5）。"
    >
      <SpecimenBlock
        title="卡片數字・主角（48／700）"
        lines={[
          { element: '外層（§4.5 卡片數字字級）', code: WRAPPER },
          { element: '元件用法（§3.13）', code: TICKER },
        ]}
      >
        <div className="text-4xl md:text-5xl font-bold">
          <NumberTicker value={85} suffix="%" />
        </div>
      </SpecimenBlock>
      <ul className="space-y-1 text-sm leading-relaxed text-ink-muted">
        <li>預設 1200ms（duration）從 0 滾到目標值。</li>
        <li>系統開啟「減少動態效果」時直接顯示最終數字，不滾動（§8.4）。</li>
        <li>字級與顏色由外層決定，元件內不寫死。</li>
      </ul>
    </StoryFrame>
  ),
  parameters: { docs: { description: { story: '卡片數字的計數動畫（例：/content-owners/ 痛點數據）。重新整理頁面可再看一次滾動。' } } },
}
