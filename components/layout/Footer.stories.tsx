import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { Footer } from './Footer'

// Footer (DESIGN.md §5.2): width follows the page content — home 1152 (max-w-6xl),
// every other page 1024 (max-w-5xl). The width is chosen from usePathname(), so the
// stories set the pathname through the Next.js framework parameters.
const meta = {
  title: 'Components/Footer',
  component: Footer,
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof Footer>
export default meta
type Story = StoryObj<typeof meta>

export const 首頁: Story = {
  parameters: {
    nextjs: { appDirectory: true, navigation: { pathname: '/' } },
    docs: { description: { story: '首頁：頁尾容器 1152（max-w-6xl），與首頁內容同寬。' } },
  },
}

export const 內頁: Story = {
  parameters: {
    nextjs: { appDirectory: true, navigation: { pathname: '/brands/' } },
    docs: { description: { story: '其他頁：頁尾容器 1024（max-w-5xl），與內頁內容同寬；目前頁連結為白色 600。' } },
  },
}
