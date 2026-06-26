import { test, expect } from '@playwright/test'

test('homepage has h1', async ({ page }) => {
  await page.goto('/')
  const h1 = page.locator('h1')
  await expect(h1).toBeVisible()
  await expect(h1).not.toBeEmpty()
})
