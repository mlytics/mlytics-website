import { describe, it, expect } from 'vitest'
import { readFileSync } from 'fs'
import path from 'path'

const layout = readFileSync(path.resolve(__dirname, '../../app/layout.tsx'), 'utf8')

describe('root layout GA (DATAI-681)', () => {
  it('no longer reads the GA id from the environment', () => {
    expect(layout).not.toMatch(/NEXT_PUBLIC_GA_ID/)
    expect(layout).not.toMatch(/@next\/third-parties/)
  })
  it('renders the hostname-based loader', () => {
    expect(layout).toMatch(/<GoogleAnalyticsLoader \/>/)
  })
})
