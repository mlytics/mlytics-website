import type { StorybookConfig } from '@storybook/nextjs-vite'

const config: StorybookConfig = {
  stories: [
    '../stories/**/*.mdx',
    '../stories/**/*.stories.@(ts|tsx)',
    '../components/**/*.stories.@(ts|tsx)',
    '../app/**/*.stories.@(ts|tsx)',
  ],
  addons: ['@storybook/addon-docs', '@storybook/addon-a11y'],
  framework: { name: '@storybook/nextjs-vite', options: {} },
  staticDirs: ['../public'],
  // Storybook copies public/ via staticDirs; Vite's own publicDir copy would run
  // concurrently into the same storybook-static/ and race (EEXIST on CI).
  viteFinal: (config) => ({ ...config, publicDir: false }),
  core: { disableTelemetry: true },
}

export default config
