import type { Preview } from '@storybook/nextjs-vite'
import '../app/globals.css'

// Storybook renders components without app/layout.tsx, so no Nav, Footer,
// GA or HubSpot scripts load here. DESIGN.md is the source of truth; stories
// only illustrate it.
const preview: Preview = {
  parameters: {
    layout: 'padded',
    nextjs: { appDirectory: true },
  },
}

export default preview
