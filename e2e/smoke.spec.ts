import { test, expect } from '@playwright/test'

test('homepage has h1', async ({ page }) => {
  await page.goto('/')
  await expect(page.locator('h1')).toBeVisible()
})
