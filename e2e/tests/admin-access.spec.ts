import { test, expect } from '@playwright/test'

test.describe('Admin Access Control', () => {
  test('일반 유저가 /admin 접근 시 리다이렉트된다', async ({ page }) => {
    await page.goto('/admin')
    // Admin layout redirects non-admin users to /chat or shows forbidden
    await page.waitForURL(/\/(chat|login)/, { timeout: 10000 }).catch(() => {
      // If not redirected, check for forbidden/error content on the page
    })
    const url = page.url()
    // Should NOT remain on admin pages for non-admin users
    const isOnAdmin = url.includes('/admin') && !url.includes('/login')
    if (isOnAdmin) {
      // If still on admin, verify forbidden content is shown
      const body = await page.textContent('body')
      expect(body).toMatch(/forbidden|unauthorized|access denied|redirect/i)
    }
  })
})
