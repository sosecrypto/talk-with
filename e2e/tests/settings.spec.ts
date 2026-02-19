import { test, expect } from '@playwright/test'
import { setupMockAPIs } from '../mocks/api-handlers'

test.describe('Settings Page', () => {
  test.beforeEach(async ({ page }) => {
    await setupMockAPIs(page)
  })

  test('설정 페이지가 정상 로드된다', async ({ page }) => {
    await page.goto('/settings')
    await expect(page.getByText('Settings')).toBeVisible({ timeout: 10000 })
  })

  test('테마 설정 섹션이 존재한다', async ({ page }) => {
    await page.goto('/settings')
    await expect(page.getByText(/Theme|테마/i)).toBeVisible({ timeout: 10000 })
  })

  test('프로필 섹션이 존재한다', async ({ page }) => {
    await page.goto('/settings')
    await expect(page.getByText(/Profile|프로필/i)).toBeVisible({ timeout: 10000 })
  })
})
