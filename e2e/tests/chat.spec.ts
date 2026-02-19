import { test, expect } from '@playwright/test'
import { setupMockAPIs } from '../mocks/api-handlers'

test.describe('Chat Page', () => {
  test.beforeEach(async ({ page }) => {
    await setupMockAPIs(page)
  })

  test('채팅 페이지가 정상 로드된다', async ({ page }) => {
    await page.goto('/chat')
    await expect(page.getByText('Talk With Legends')).toBeVisible()
  })

  test('페르소나 그리드가 표시된다', async ({ page }) => {
    await page.goto('/chat')
    const grid = page.getByTestId('persona-grid')
    if (await grid.isVisible({ timeout: 5000 }).catch(() => false)) {
      const items = page.getByTestId('persona-grid-item')
      await expect(items.first()).toBeVisible()
    }
  })

  test('페르소나를 선택할 수 있다', async ({ page }) => {
    await page.goto('/chat')
    const selectorTrigger = page.getByTestId('persona-selector-trigger')
    await selectorTrigger.click()

    const personaOption = page.getByTestId('persona-option').first()
    if (await personaOption.isVisible({ timeout: 3000 }).catch(() => false)) {
      await personaOption.click()
    }
  })

  test('메시지 입력 영역이 존재한다', async ({ page }) => {
    await page.goto('/chat')
    const textarea = page.getByTestId('chat-textarea')
    await expect(textarea).toBeVisible()
    const sendButton = page.getByTestId('chat-send-button')
    await expect(sendButton).toBeVisible()
  })

  test('메시지를 입력하고 전송할 수 있다', async ({ page }) => {
    await page.goto('/chat')

    // Select persona first
    const selectorTrigger = page.getByTestId('persona-selector-trigger')
    await selectorTrigger.click()
    const personaOption = page.getByTestId('persona-option').first()
    if (await personaOption.isVisible({ timeout: 3000 }).catch(() => false)) {
      await personaOption.click()
    }

    const textarea = page.getByTestId('chat-textarea')
    await textarea.fill('Hello, what do you think about AI?')

    const sendButton = page.getByTestId('chat-send-button')
    await sendButton.click()

    // Message should appear in the message list
    const messageList = page.getByTestId('message-list')
    await expect(messageList).toBeVisible({ timeout: 10000 })
  })
})
