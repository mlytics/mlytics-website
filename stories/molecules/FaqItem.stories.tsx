import { useId, useState } from 'react'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { SpecimenBlock, StoryFrame, specimen, specimenClasses } from '../_components/StoryPrimitives'

const meta = { title: 'Molecules/FaqItem', parameters: { layout: 'fullscreen' } } satisfies Meta
export default meta
type Story = StoryObj<typeof meta>

// §4.4 列線：每題上下 1px border-line
const ROW = 'border-y border-line'

function FaqSpecimen() {
  const [open, setOpen] = useState(true)
  const answerId = useId()

  return (
    <div className={ROW}>
      <button
        type="button"
        className={specimenClasses('faq-trigger', 'focus-ring')}
        aria-expanded={open}
        aria-controls={answerId}
        onClick={() => setOpen((value) => !value)}
      >
        <span className={specimen('faq-question').className}>How does this pattern support clear navigation?</span>
        <span className={`${specimen('faq-icon').className} ${open ? 'rotate-45' : ''}`} aria-hidden="true">+</span>
      </button>
      {open && (
        <div id={answerId} className={specimen('faq-answer').className}>
          The question exposes its state and controls a matching answer region for keyboard and assistive technology users.
        </div>
      )}
    </div>
  )
}

export const 可展開單題: Story = {
  render: () => (
    <StoryFrame title="FAQ 單題" intro="題目列使用按鈕語意，並以 aria-expanded 與 aria-controls 說明狀態。">
      <SpecimenBlock
        title="展開與收合"
        lines={[
          { element: '列線 <div>', code: ROW },
          { element: '題目列 <button>（含 §3.7 焦點外框）', code: specimenClasses('faq-trigger', 'focus-ring') },
          { element: '題目文字 <span>', code: specimen('faq-question').className },
          { element: '加號 <span>（展開時另加 rotate-45）', code: specimen('faq-icon').className },
          { element: '答案 <div>', code: specimen('faq-answer').className },
        ]}
      >
        <FaqSpecimen />
      </SpecimenBlock>
    </StoryFrame>
  ),
  parameters: { docs: { description: { story: 'FAQ 區塊中需要可鍵盤操作的單一問答列時使用。' } } },
}
