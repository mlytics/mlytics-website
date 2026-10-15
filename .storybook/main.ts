import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import type { StorybookConfig } from '@storybook/nextjs-vite'

const siteCss = fileURLToPath(new URL('../app/globals.css', import.meta.url))
const IMPORT_SITE_CSS = '@import "../app/globals.css";'

const config: StorybookConfig = {
  stories: [
    '../stories/**/*.mdx',
    '../stories/**/*.stories.@(ts|tsx)',
    '../components/**/*.stories.@(ts|tsx)',
  ],
  addons: ['@storybook/addon-docs', '@storybook/addon-a11y'],
  framework: { name: '@storybook/nextjs-vite', options: {} },
  staticDirs: ['../public'],
  core: { disableTelemetry: true },
  async viteFinal(config) {
    // app/globals.css excludes story and doc files with `@source not` so their
    // classes never reach the site CSS. Tailwind applies `@source not` to the
    // whole compilation, so storybook.css cannot re-add them with `@source`
    // while it imports globals.css. Instead, inline globals.css into
    // storybook.css without its `@source not` lines. Both files sit one
    // directory below the repo root, so the remaining relative paths still
    // resolve the same way.
    config.plugins = [
      ...(config.plugins ?? []),
      {
        name: 'storybook-css-include-stories',
        enforce: 'pre',
        transform(code, id) {
          if (!id.split('?')[0].endsWith('/.storybook/storybook.css')) return null
          this.addWatchFile(siteCss)
          const site = readFileSync(siteCss, 'utf8').replace(/^@source not .*;$/gm, '')
          if (!code.includes(IMPORT_SITE_CSS)) throw new Error(`storybook.css must contain ${IMPORT_SITE_CSS}`)
          return { code: code.replace(IMPORT_SITE_CSS, site), map: null }
        },
      },
    ]
    return config
  },
}

export default config
