/// <reference types="vite/client" />
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
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
  // jsdom has no window.scrollTo; the ScrollToTop story calls it on mount.
  // Stub it here (test-only) so the run stays quiet; the story is unchanged.
  beforeEach(() => {
    vi.spyOn(window, 'scrollTo').mockImplementation(() => {})
  })
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('collects every story module', () => {
    // 14 under stories/ (Task 6) + 2 next to real components (Eyebrow,
    // ScrollToTop). MDX docs pages are not *.stories.tsx, so they don't count.
    expect(Object.keys(modules)).toHaveLength(16)
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
