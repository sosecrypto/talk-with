import { test as setup, expect } from '@playwright/test'

setup('authenticate', async ({ page }) => {
  await page.goto('/login')

  // Dev mode CredentialsProvider login
  const emailInput = page.getByTestId('test-email-input')
  const loginButton = page.getByTestId('test-login-button')

  // Check if dev mode login is available
  const isDevLogin = await emailInput.isVisible({ timeout: 5000 }).catch(() => false)
  if (!isDevLogin) {
    throw new Error('Dev mode login UI not available. E2E setup requires dev server (NODE_ENV=development).')
  }

  await emailInput.fill('test@example.com')
  await loginButton.click()
  await page.waitForURL('/chat', { timeout: 15000 })
  await expect(page).toHaveURL('/chat')

  // Save auth state
  await page.context().storageState({ path: 'e2e/.auth/user.json' })
})
