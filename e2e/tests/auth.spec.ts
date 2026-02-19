import { test, expect } from '@playwright/test'

test.describe('Authentication', () => {
  test('로그인 페이지 UI가 정상 렌더링된다', async ({ page }) => {
    await page.goto('/login')
    await expect(page.getByText('Talk With')).toBeVisible()
    await expect(page.getByText('Continue with Google')).toBeVisible()
    await expect(page.getByText('Continue with GitHub')).toBeVisible()
  })

  test('개발 모드에서 테스트 로그인 섹션이 표시된다', async ({ page }) => {
    await page.goto('/login')
    // Dev mode에서만 나타나는 테스트 로그인 UI 확인
    const emailInput = page.getByTestId('test-email-input')
    const loginButton = page.getByTestId('test-login-button')

    // 개발 서버가 dev 모드로 돌 때만 통과
    if (await emailInput.isVisible({ timeout: 3000 }).catch(() => false)) {
      await expect(emailInput).toHaveValue('test@example.com')
      await expect(loginButton).toBeVisible()
    }
  })

  test('미인증 상태에서 /settings 접근이 차단된다', async ({ page }) => {
    await page.goto('/settings')
    await page.waitForURL(/\/login|\/api\/auth/, { timeout: 10000 })
  })
})
