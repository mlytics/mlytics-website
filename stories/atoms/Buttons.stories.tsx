import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { SpecimenBlock, StoryFrame, specimen, specimenClasses } from '../_components/StoryPrimitives'

const meta = { title: 'Atoms/Buttons', parameters: { layout: 'fullscreen' } } satisfies Meta
export default meta
type Story = StoryObj<typeof meta>

const BUTTONS = [
  ['button-solid-44', 'Continue'],
  ['button-solid-40', 'Submit'],
  ['button-solid-36', 'Open menu'],
  ['button-outline-44', 'Secondary action'],
  ['button-outline-36', 'Navigation action'],
] as const

export const 按鈕類型: Story = {
  render: () => (
    <StoryFrame title="按鈕" intro="行動按鈕依類型選擇固定高度與寫法；焦點外框由全站規則提供（§3.7），不需另加 class。">
      <div className="grid gap-4 md:grid-cols-2">
        {BUTTONS.map(([id, text]) => {
          // The §3.7 focus ring comes from the site-wide rule, not from these classes.
          const className = specimenClasses(id)
          return (
            <SpecimenBlock key={id} title={specimen(id).label} className={className}>
              <button type="button" className={className}>{text}</button>
            </SpecimenBlock>
          )
        })}
      </div>
      <SpecimenBlock title="滿版藥丸 44" className={specimenClasses('button-full-44')}>
        <div className="max-w-lg">
          <button type="button" className={specimenClasses('button-full-44')}>Complete request</button>
        </div>
      </SpecimenBlock>
      <SpecimenBlock
        title={specimen('button-outline-dark').label}
        lines={[
          { element: '主要（實心藥丸・標準 44）', code: specimenClasses('button-solid-44') },
          { element: '次要（深底外框，與主要同高）', code: specimenClasses('button-outline-dark') },
        ]}
      >
        <div className="section-dark flex flex-wrap items-center gap-3 rounded-2xl p-6">
          <button type="button" className={specimenClasses('button-solid-44')}>Primary action</button>
          <button type="button" className={specimenClasses('button-outline-dark')}>Secondary action</button>
        </div>
      </SpecimenBlock>
      <aside className="rounded-2xl border border-line bg-surface p-6">
        <h2 className="text-base font-semibold">控制類</h2>
        <p className="mt-2 text-sm leading-relaxed text-ink-muted">FAQ、分頁、輪播點、選單開關與下拉鈕依各自元件規格呈現，不套行動按鈕樣式。</p>
      </aside>
    </StoryFrame>
  ),
  parameters: { docs: { description: { story: '選擇行動按鈕高度、滿版或外框變體時使用。' } } },
}
