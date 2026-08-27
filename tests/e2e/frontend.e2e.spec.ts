import { test, expect } from '@playwright/test'

test.describe('Frontend', () => {
  test('can go on homepage', async ({ page }) => {
    await page.goto('http://localhost:3000')

    await expect(page).toHaveTitle(/Informbiro/)

    const heading = page.locator('h1').first()

    await expect(heading).toBeVisible()
  })

  test('homepage shows Informbiro branding and no leftover Geopolitika branding', async ({
    page,
  }) => {
    await page.goto('http://localhost:3000')

    await expect(page).toHaveTitle(/Informbiro/)
    await expect(page).not.toHaveTitle(/geopolitika/i)

    const header = page.locator('header')
    await expect(header).toContainText('Informbiro')

    await expect(page.locator('body')).not.toContainText(/geopolitika/i)

    const metaDescription = await page
      .locator('meta[name="description"]')
      .getAttribute('content')
    expect(metaDescription ?? '').not.toMatch(/geopolitika/i)
  })
})
