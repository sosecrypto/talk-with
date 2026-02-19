import { test, expect } from '@playwright/test'

test.describe('Landing Page', () => {
  test('로그인 페이지가 정상 로드된다', async ({ page }) => {
    await page.goto('/login')
    await expect(page.getByText('Talk With')).toBeVisible()
    await expect(page.getByText('Sign in to your account')).toBeVisible()
  })

  test('OAuth 로그인 버튼들이 표시된다', async ({ page }) => {
    await page.goto('/login')
    await expect(page.getByText('Continue with Google')).toBeVisible()
    await expect(page.getByText('Continue with GitHub')).toBeVisible()
  })

  test('미인증 상태에서 /chat 접근 시 /login으로 리다이렉트된다', async ({ page }) => {
    await page.goto('/chat')
    await page.waitForURL(/\/login|\/api\/auth/, { timeout: 10000 })
  })
})
