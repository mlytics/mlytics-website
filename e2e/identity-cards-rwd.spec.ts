import { test, expect } from '@playwright/test'

test.describe('IdentityCards RWD', () => {
  test('stacks cards vertically on mobile (375px)', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 })
    await page.goto('/')

    const card1 = page.getByRole('heading', { name: 'Media and Content Owner', exact: true })
    const card2 = page.getByRole('heading', { name: 'Brand', exact: true })
    const card3 = page.getByRole('heading', { name: 'Developer', exact: true })

    await expect(card1).toBeVisible()
    await expect(card2).toBeVisible()
    await expect(card3).toBeVisible()

    const box1 = await card1.boundingBox()
    const box2 = await card2.boundingBox()
    const box3 = await card3.boundingBox()

    expect(box1).not.toBeNull()
    expect(box2).not.toBeNull()
    expect(box3).not.toBeNull()

    // Each card should be below the previous one
    expect(box2!.y).toBeGreaterThan(box1!.y + box1!.height)
    expect(box3!.y).toBeGreaterThan(box2!.y + box2!.height)
  })

  test('renders cards side by side on desktop (1280px)', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 })
    await page.goto('/')

    const card1 = page.getByRole('heading', { name: 'Media and Content Owner', exact: true })
    const card2 = page.getByRole('heading', { name: 'Brand', exact: true })
    const card3 = page.getByRole('heading', { name: 'Developer', exact: true })

    await expect(card1).toBeVisible()
    await expect(card2).toBeVisible()
    await expect(card3).toBeVisible()

    const box1 = await card1.boundingBox()
    const box2 = await card2.boundingBox()
    const box3 = await card3.boundingBox()

    expect(box1).not.toBeNull()
    expect(box2).not.toBeNull()
    expect(box3).not.toBeNull()

    // All cards should be on the same row (top values within 10px of each other)
    expect(Math.abs(box1!.y - box2!.y)).toBeLessThan(10)
    expect(Math.abs(box1!.y - box3!.y)).toBeLessThan(10)
  })
})
