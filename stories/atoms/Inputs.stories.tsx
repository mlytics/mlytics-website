import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { SpecimenBlock, StoryFrame, specimenClasses } from '../_components/StoryPrimitives'

const meta = { title: 'Atoms/Inputs', parameters: { layout: 'fullscreen' } } satisfies Meta
export default meta
type Story = StoryObj<typeof meta>

// DESIGN.md §3.10 表單標籤
const LABEL = 'block text-xs font-medium text-ink-muted mb-1'

export const 表單欄位: Story = {
  render: () => (
    <StoryFrame title="輸入框" intro="多欄位表單使用方角欄位；單欄 email 應重用 InlineEmailCTA。">
      <SpecimenBlock
        title="多欄表單輸入框"
        lines={[
          { element: '表單標籤 <label>', code: LABEL },
          { element: '輸入框 <input>（焦點外框由全站規則提供，§3.7）', code: specimenClasses('input') },
        ]}
      >
        <div className="max-w-lg">
          <label htmlFor="storybook-name" className={LABEL}>顯示名稱</label>
          <input
            id="storybook-name"
            type="text"
            className={specimenClasses('input')}
            placeholder="Enter a name"
          />
        </div>
      </SpecimenBlock>
    </StoryFrame>
  ),
  parameters: { docs: { description: { story: '建立多欄表單的文字輸入欄位時使用。' } } },
}
