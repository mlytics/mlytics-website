import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { StoryFrame } from '../_components/StoryPrimitives'

const meta = { title: 'Foundations/BreakpointsLayers', parameters: { layout: 'fullscreen' } } satisfies Meta
export default meta
type Story = StoryObj<typeof meta>

const rows = {
  breakpoints: [
    ['sm', '480px', '大型手機起'],
    ['md', '768px', '平板起'],
    ['lg', '1024px', '桌機起'],
    ['max-[420px]', '≤420px', '僅限首頁 Hero'],
  ],
  layers: [
    ['z-0', '基底'],
    ['z-10', '一般前景'],
    ['z-20', '較高前景'],
    ['z-50', '導覽列'],
    ['z-[60]', '滿版選單'],
  ],
}

export const 斷點與圖層: Story = {
  render: () => (
    <StoryFrame title="斷點與圖層" intro="響應式排版與疊層只使用列出的斷點及層級。">
      <div className="grid gap-6 lg:grid-cols-2">
        {[
          ['斷點', rows.breakpoints],
          ['圖層', rows.layers],
        ].map(([title, values]) => (
          <section key={title as string} className="overflow-hidden rounded-2xl border border-line bg-white">
            <h2 className="border-b border-line p-5 text-base font-semibold">{title as string}</h2>
            <table className="w-full text-left text-sm">
              <tbody>
                {(values as string[][]).map(([token, value, note]) => (
                  <tr key={token} className="border-b border-line last:border-b-0">
                    <th scope="row" className="p-4 font-semibold"><code>{token}</code></th>
                    <td className="p-4 text-ink-muted">{value}</td>
                    {note && <td className="p-4 text-ink-muted">{note}</td>}
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        ))}
      </div>
    </StoryFrame>
  ),
  parameters: { docs: { description: { story: '設定響應式切換或疊層順序時查閱。' } } },
}
