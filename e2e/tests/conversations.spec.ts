import { test, expect } from '@playwright/test'
import { setupMockAPIs } from '../mocks/api-handlers'

test.describe('Conversations', () => {
  test.beforeEach(async ({ page }) => {
    await setupMockAPIs(page)
  })

  test('대화 목록이 표시된다', async ({ page }) => {
    await page.goto('/chat')
    const conversationItems = page.getByTestId('conversation-item')
    await expect(conversationItems.first()).toBeVisible({ timeout: 5000 })
  })

  test('대화를 선택하면 메시지가 로드된다', async ({ page }) => {
    await page.goto('/chat')
    const conversationItem = page.getByTestId('conversation-item').first()
    await conversationItem.click()

    const messageList = page.getByTestId('message-list')
    await expect(messageList).toBeVisible({ timeout: 5000 })
  })

  test('New Chat 버튼이 동작한다', async ({ page }) => {
    await page.goto('/chat')
    const newChatButton = page.getByTestId('new-chat-button')
    await expect(newChatButton).toBeVisible()
    await newChatButton.click()
  })

  test('대화 삭제 버튼이 존재한다', async ({ page }) => {
    await page.goto('/chat')
    const conversationItem = page.getByTestId('conversation-item').first()
    await conversationItem.hover()

    const deleteButton = page.getByTestId('delete-conversation-button').first()
    // Delete button appears on hover
    await expect(deleteButton).toBeAttached()
  })
})
