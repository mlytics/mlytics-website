import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { SpecimenBlock, StoryFrame } from '@/stories/_components/StoryPrimitives'

// InlineEmailCTA (DESIGN.md §4.7, §3.10) is shown as a spec only. Like
// Nav.stories, this story does NOT import ./InlineEmailCTA: the component uses
// framer-motion, which fails to load in the stories test project. The live
// field is in the home page Hero and every audience page's footer CTA.
const meta = {
  title: 'Components/InlineEmailCTA',
  parameters: { layout: 'fullscreen' },
} satisfies Meta
export default meta
type Story = StoryObj<typeof meta>

export const 規格說明: Story = {
  render: () => (
    <StoryFrame
      title="email 輸入組"
      intro="所有 email 等候名單一律用共用元件 InlineEmailCTA（components/ui/InlineEmailCTA.tsx），不自己另做 email 欄或送出鈕。這裡只列規格；實際樣子請看首頁 Hero 或任一受眾頁的頁尾 CTA。"
    >
      <SpecimenBlock title="用法（§4.7）" lines={[{ element: '頁尾 CTA（.section-dark）', code: '<InlineEmailCTA ctaLabel="…" pageName="…" tone="dark" className="mx-auto" />' }]}>
        <ul className="space-y-1 text-sm leading-relaxed text-ink-muted">
          <li>ctaLabel 是 trackCTA 的位置名稱，沿用該頁既有字串；只在送出成功後記錄。</li>
          <li>tone 必填：tone=&quot;light&quot;（白／淺底，只有首頁 Hero）、tone=&quot;dark&quot;（.section-dark 頁尾 CTA）。</li>
        </ul>
      </SpecimenBlock>
      <SpecimenBlock
        title="藥丸欄（§3.10）"
        lines={[
          { element: '藥丸外框', code: 'rounded-full border border-line bg-white focus-within:border-primary' },
          { element: '提示文字', code: 'placeholder:text-ink-muted' },
        ]}
      >
        <ul className="space-y-1 text-sm leading-relaxed text-ink-muted">
          <li>提示文字用 text-ink-muted（白底約 5.3:1）；不可用 ink-subtle、Tailwind 灰或瀏覽器預設色。</li>
          <li>焦點外框畫在藥丸容器，不畫在裡面的輸入框；顏色依 tone：dark 用 on-dark、light 用主色（§3.7）。</li>
        </ul>
      </SpecimenBlock>
      <SpecimenBlock
        title="40 送出鈕（§3.2）"
        className="shrink-0 px-4 md:px-5 py-2.5 rounded-full text-sm font-semibold transition-[opacity,scale] hover:opacity-90 active:scale-[0.98] bg-primary text-white disabled:opacity-60 whitespace-nowrap"
      >
        <p className="text-sm leading-relaxed text-ink-muted">實心藥丸・輸入框內 40，只用在這個元件內。</p>
      </SpecimenBlock>
      <SpecimenBlock
        title="錯誤色（§2.2）"
        lines={[
          { element: 'tone="light"', code: 'text-error / border-error' },
          { element: 'tone="dark"', code: 'text-error-on-dark / border-error-on-dark' },
        ]}
      >
        <p className="text-sm leading-relaxed text-ink-muted">錯誤訊息與錯誤框線用同一個紅，依 email 欄所在底色選用。</p>
      </SpecimenBlock>
    </StoryFrame>
  ),
  parameters: { docs: { description: { story: 'email 輸入組的規格（§4.7）。不渲染元件本身；看實際樣子請開首頁。' } } },
}
