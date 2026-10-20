import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { PendingNotice, SpecimenBlock, StoryFrame, specimen, specimenClasses } from '../_components/StoryPrimitives'

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
    <StoryFrame title="按鈕" intro="行動按鈕依類型選擇固定高度與寫法；所有可互動樣本都帶全站焦點外框。">
      <div className="grid gap-4 md:grid-cols-2">
        {BUTTONS.map(([id, text]) => {
          // Button classes and the §3.7 focus ring sit on the same element: one string.
          const className = specimenClasses(id, 'focus-ring')
          return (
            <SpecimenBlock key={id} title={specimen(id).label} className={className}>
              <button type="button" className={className}>{text}</button>
            </SpecimenBlock>
          )
        })}
      </div>
      <SpecimenBlock title="滿版藥丸 44" className={specimenClasses('button-full-44', 'focus-ring')}>
        <div className="max-w-lg">
          <button type="button" className={specimenClasses('button-full-44', 'focus-ring')}>Complete request</button>
        </div>
      </SpecimenBlock>
      <PendingNotice
        title="深底外框"
        ticket="DATAI-624"
        className={specimen('button-outline-dark').className}
        spec={[
          '寫法：pill-btn pill-btn--dark（.pill-btn--dark 疊在 .pill-btn 上），只作深底次要按鈕。',
          '平常：透明底、on-dark 字、on-dark .4 框。',
          '滑過：主色 .6 底、白字、--color-primary-light 框。',
          '字級 14／600、框線 1px、高度與旁邊主要按鈕相同：DATAI-624 統一 .pill-btn 定義後由類別提供。',
        ]}
      >
        依 §7.8，DATAI-624 完成前只列目標規格與票號，不渲染樣本。
      </PendingNotice>
      <aside className="rounded-2xl border border-line bg-surface p-6">
        <h2 className="text-base font-semibold">控制類</h2>
        <p className="mt-2 text-sm leading-relaxed text-ink-muted">FAQ、分頁、輪播點、選單開關與下拉鈕依各自元件規格呈現，不套行動按鈕樣式。</p>
      </aside>
    </StoryFrame>
  ),
  parameters: { docs: { description: { story: '選擇行動按鈕高度、滿版或外框變體時使用。' } } },
}
