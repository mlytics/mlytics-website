import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { SpecimenBlock, StoryFrame } from '@/stories/_components/StoryPrimitives'

// ReducedMotion (DESIGN.md §8.4) renders nothing. Unlike ScrollToTop.stories,
// this story does NOT import ./ReducedMotion: the component imports
// framer-motion, which fails to load in the stories test project
// ("Cannot find module next/dist/compiled/react/jsx-runtime"). The story only
// explains the behaviour; the component itself is covered by
// __tests__/components/layout/ReducedMotion.test.tsx.
const meta = {
  title: 'Components/ReducedMotion',
  parameters: { layout: 'fullscreen' },
} satisfies Meta
export default meta
type Story = StoryObj<typeof meta>

export const 行為說明: Story = {
  render: () => (
    <StoryFrame
      title="減少動態全站開關"
      intro="ReducedMotion 沒有畫面：系統開啟「減少動態效果」時，它讓全站的 framer-motion 動畫直接到結束畫面。全站只有一份，需要相同功能時重用，不另寫。"
    >
      <SpecimenBlock title="行為" lines={[{ element: '掛載位置（app/layout.tsx 的 <body> 內，緊接 <ScrollToTop /> 之後）', code: '<ReducedMotion />' }]}>
        <ul className="space-y-1 text-sm leading-relaxed text-ink-muted">
          <li>做什麼：依系統的 prefers-reduced-motion 設定 framer-motion 的全站開關（MotionGlobalConfig.skipAnimations），設定變更時立即跟著切換。</li>
          <li>作用範圍：所有 framer-motion 動畫（進場的位移與淡入、展開高度、輪播換頁過場）直接到結束畫面，元件不需另寫。</li>
          <li>不涵蓋：計數動畫（requestAnimationFrame）、setInterval 自動輪播、SVG 動畫（animateMotion）；這些用 usePrefersReducedMotion()（lib/usePrefersReducedMotion.ts）各自停止。</li>
          <li>畫面：沒有。</li>
        </ul>
      </SpecimenBlock>
    </StoryFrame>
  ),
  parameters: { docs: { description: { story: '新增頁面不需要處理 framer-motion 的減少動態；app/layout.tsx 已全站掛載。' } } },
}
