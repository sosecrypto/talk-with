import { Page } from '@playwright/test'

const MOCK_PERSONAS = [
  {
    id: 'p1',
    name: 'Elon Musk',
    nameKo: '일론 머스크',
    slug: 'elon-musk',
    imageUrl: null,
    accentColor: '#FF6B35',
    bioShort: 'CEO of Tesla and SpaceX',
    totalDocuments: 50,
  },
  {
    id: 'p2',
    name: 'Steve Jobs',
    nameKo: '스티브 잡스',
    slug: 'steve-jobs',
    imageUrl: null,
    accentColor: '#333333',
    bioShort: 'Co-founder of Apple',
    totalDocuments: 30,
  },
]

const MOCK_CONVERSATIONS = [
  {
    id: 'conv-1',
    title: 'AI Discussion',
    createdAt: '2024-01-01T10:00:00Z',
    updatedAt: '2024-01-01T10:00:05Z',
    persona: { name: 'Elon Musk', slug: 'elon-musk', imageUrl: null, accentColor: '#FF6B35' },
    _count: { messages: 2 },
  },
]

const MOCK_CONVERSATION_DETAIL = {
  id: 'conv-1',
  title: 'AI Discussion',
  userId: 'user-1',
  personaId: 'p1',
  messages: [
    { id: 'msg-1', role: 'user', content: 'What do you think about AI?', conversationId: 'conv-1', createdAt: '2024-01-01T10:00:00Z', attachments: [] },
    { id: 'msg-2', role: 'assistant', content: 'AI is the most transformative technology.', conversationId: 'conv-1', createdAt: '2024-01-01T10:00:05Z', attachments: [] },
  ],
  createdAt: '2024-01-01T10:00:00Z',
  updatedAt: '2024-01-01T10:00:05Z',
}

const MOCK_SETTINGS = {
  theme: 'system',
  defaultPersona: null,
  displayName: 'Test User',
}

export async function setupMockAPIs(page: Page) {
  await page.route('**/api/personas', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(MOCK_PERSONAS),
    })
  })

  await page.route('**/api/conversations', async (route) => {
    if (route.request().method() === 'GET') {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(MOCK_CONVERSATIONS),
      })
    } else if (route.request().method() === 'POST') {
      await route.fulfill({
        status: 201,
        contentType: 'application/json',
        body: JSON.stringify({ id: 'conv-new', title: 'New Chat' }),
      })
    }
  })

  await page.route('**/api/conversations/conv-1', async (route) => {
    if (route.request().method() === 'GET') {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(MOCK_CONVERSATION_DETAIL),
      })
    } else if (route.request().method() === 'DELETE') {
      await route.fulfill({ status: 200, contentType: 'application/json', body: '{"success":true}' })
    }
  })

  await page.route('**/api/chat', async (route) => {
    const sseBody = [
      'data: {"type":"start","conversationId":"conv-new"}\n\n',
      'data: {"type":"text","content":"Hello! "}\n\n',
      'data: {"type":"text","content":"I am an AI persona."}\n\n',
      'data: {"type":"title","title":"AI Chat"}\n\n',
      'data: {"type":"done"}\n\n',
    ].join('')

    await route.fulfill({
      status: 200,
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
      body: sseBody,
    })
  })

  await page.route('**/api/settings', async (route) => {
    if (route.request().method() === 'GET') {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(MOCK_SETTINGS),
      })
    } else if (route.request().method() === 'PUT') {
      const body = route.request().postDataJSON()
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ ...MOCK_SETTINGS, ...body }),
      })
    }
  })
}
