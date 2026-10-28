import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { SpecimenBlock, StoryFrame } from '@/stories/_components/StoryPrimitives'

// BookADemoForm (DESIGN.md §5.8, §3.10) is shown as a spec only. Like
// Nav.stories, this story does NOT import ./BookADemoForm: the component uses
// framer-motion (fails to load in the stories test project) and
// next/navigation. The live form is on /book-a-demo/.
const meta = {
  title: 'Components/BookADemoForm',
  parameters: { layout: 'fullscreen' },
} satisfies Meta
export default meta
type Story = StoryObj<typeof meta>

export const 規格說明: Story = {
  render: () => (
    <StoryFrame
      title="預約表單"
      intro="/book-a-demo/ 多欄位表單（app/book-a-demo/BookADemoForm.tsx）。這裡只列規格；實際樣子請看 /book-a-demo/。"
    >
      <SpecimenBlock
        title="欄位與標籤（§3.10）"
        lines={[
          { element: '表單欄位', code: 'w-full px-3 py-2 text-sm border border-line rounded-lg focus:border-primary transition-colors placeholder:text-ink-muted' },
          { element: '表單標籤', code: 'block text-xs font-medium text-ink-muted mb-1' },
        ]}
      >
        <ul className="space-y-1 text-sm leading-relaxed text-ink-muted">
          <li>8px 圓角、1px line 框、14px、聚焦框線變主色；焦點外框由全站規則提供（§3.7）。</li>
          <li>提示文字用 placeholder:text-ink-muted（白底約 5.3:1）。</li>
        </ul>
      </SpecimenBlock>
      <SpecimenBlock title="國碼選單（§3.6 下拉鈕）" lines={[{ element: '選單內放大鏡圖示', code: 'size={12}' }]}>
        <p className="text-sm leading-relaxed text-ink-muted">外觀同表單欄位；選單內放大鏡圖示 12（§2.17）。</p>
      </SpecimenBlock>
      <SpecimenBlock
        title="送出鈕（§3.3 滿版藥丸）"
        className="w-full inline-flex items-center justify-center px-6 py-3 rounded-full text-sm font-semibold text-white bg-primary transition-opacity hover:opacity-90"
      >
        <p className="text-sm leading-relaxed text-ink-muted">送出記錄 contact_form_submit 事件（維持，不用 trackCTA）。</p>
      </SpecimenBlock>
    </StoryFrame>
  ),
  parameters: { docs: { description: { story: '預約表單的規格（§5.8）。不渲染元件本身；看實際樣子請開 /book-a-demo/。' } } },
}
