import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { Eyebrow } from '@/components/ui/Eyebrow'
import { SpecimenBlock, StoryFrame, specimen } from '../_components/StoryPrimitives'

const meta = { title: 'Molecules/HeadingGroup', parameters: { layout: 'fullscreen' } } satisfies Meta
export default meta
type Story = StoryObj<typeof meta>

export const 置中標題組: Story = {
  render: () => (
    <StoryFrame title="區塊標題組" intro="標題組由緊鄰的小標籤、區塊標題與 576px 內的說明組成。">
      <SpecimenBlock
        title="置中・淺底"
        lines={[
          { element: '容器 <div>', code: 'text-center' },
          { element: '小標籤（元件，§3.8）', code: '<Eyebrow>' },
          { element: '區塊標題 <h2>', code: specimen('heading-title').className },
          { element: '說明 <p>', code: specimen('heading-description').className },
        ]}
      >
        <div className="text-center">
          <Eyebrow>Shared foundation</Eyebrow>
          <h2 className={specimen('heading-title').className}>A consistent structure for every section.</h2>
          <p className={specimen('heading-description').className}>Use the same rhythm so readers can understand each section before moving into its content.</p>
        </div>
      </SpecimenBlock>
    </StoryFrame>
  ),
  parameters: { docs: { description: { story: '內容區塊需要小標籤、h2 與說明的標準組合時使用。' } } },
}
