/// <reference types="vite/client" />
import { describe, expect, it, vi } from 'vitest'
import { composeStories, setProjectAnnotations } from '@storybook/nextjs-vite'
import type { ComposedStoryFn } from 'storybook/internal/types'
import * as a11yAddonAnnotations from '@storybook/addon-a11y/preview'
import preview from '../../.storybook/preview'

// vitest.setup.ts mocks next/navigation for app tests; the Storybook Next.js
// framework needs the real module (it provides its own router).
vi.unmock('next/navigation')

// Every story must render without throwing. Storybook itself is local-only,
// so this is the check CI runs on every PR.
setProjectAnnotations([a11yAddonAnnotations, preview])

const modules = import.meta.glob(
  ['../../stories/**/*.stories.tsx', '../../components/**/*.stories.tsx'],
  { eager: true },
) as Record<string, Parameters<typeof composeStories>[0]>

describe('stories render', () => {
  it('collects every Task 6 story module', () => {
    expect(Object.keys(modules)).toHaveLength(14)
  })

  for (const [file, mod] of Object.entries(modules)) {
    // The module type is erased by the glob, so composeStories cannot infer
    // the story types; every composed story has this shape.
    const stories = composeStories(mod) as Record<string, ComposedStoryFn>
    for (const [name, Story] of Object.entries(stories)) {
      it(`${file} › ${name}`, async () => {
        // render(<Story />) throws SB_FRAMEWORK_NEXTJS_0002 here; run() mounts
        // through the framework. It does not throw on a11y violations, so read
        // the reports explicitly. The addon default `test: 'todo'` reports
        // violations as 'warning', so anything not 'passed' must fail.
        await Story.run()
        const failed = Story.reporting.reports.filter((r) => r.status !== 'passed')
        expect(failed, JSON.stringify(failed.map((r) => r.result), null, 2)).toEqual([])
      })
    }
  }
})
