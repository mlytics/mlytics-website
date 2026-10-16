import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { SpecimenBlock, StoryFrame, specimen } from '../_components/StoryPrimitives'

const meta = { title: 'Atoms/Dividers', parameters: { layout: 'fullscreen' } } satisfies Meta
export default meta
type Story = StoryObj<typeof meta>

export const 分隔線: Story = {
  render: () => (
    <StoryFrame title="分隔線" intro="分隔線固定 1px，並依淺底或深底選擇對應顏色。">
      <SpecimenBlock title="淺底分隔線" className={specimen('divider-light').className}>
        <div className="space-y-4">
          <p className="text-sm text-ink-muted">Content above</p>
          <div className={specimen('divider-light').className} />
          <p className="text-sm text-ink-muted">Content below</p>
        </div>
      </SpecimenBlock>
      <section className="section-dark space-y-3 rounded-2xl p-6">
        <h2 className="text-base font-semibold text-white">深底分隔線</h2>
        <p className="text-sm text-on-dark">Content above</p>
        <div className={specimen('divider-dark').className} />
        <p className="text-sm text-on-dark">Content below</p>
        <code className="block overflow-x-auto rounded-lg bg-primary/25 p-3 text-xs text-on-dark">{specimen('divider-dark').className}</code>
      </section>
    </StoryFrame>
  ),
  parameters: { docs: { description: { story: '區隔同色相鄰內容或列表列線時使用。' } } },
}
