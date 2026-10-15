import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import storybookNextjs from 'vite-plugin-storybook-nextjs'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'),
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./vitest.setup.ts'],
    projects: [
      {
        extends: true,
        test: {
          name: 'unit',
          exclude: ['node_modules', 'dist', '.idea', '.git', '.cache', 'e2e/**', '__tests__/design-system/**'],
        },
      },
      {
        // The Storybook plugin must stay scoped to this project: loaded globally
        // it breaks an existing AiModePlayground reduced-motion test.
        extends: true,
        plugins: [storybookNextjs({ dir: __dirname })],
        test: {
          name: 'stories',
          include: ['__tests__/design-system/**/*.test.{ts,tsx}'],
          server: { deps: { inline: ['vite-plugin-storybook-nextjs', '@storybook/nextjs-vite', '@storybook/react'] } },
        },
      },
    ],
  },
})
