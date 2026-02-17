import type { Conversation, Message } from '@/types/chat'

export const MOCK_MESSAGES: Message[] = [
  {
    id: 'msg-1',
    role: 'user',
    content: 'What do you think about AI?',
    conversationId: 'conv-1',
    createdAt: new Date('2024-01-01T10:00:00Z'),
  },
  {
    id: 'msg-2',
    role: 'assistant',
    content: 'AI is the most transformative technology of our time.',
    conversationId: 'conv-1',
    createdAt: new Date('2024-01-01T10:00:05Z'),
  },
]

export const MOCK_CONVERSATION: Conversation = {
  id: 'conv-1',
  title: 'AI Discussion',
  userId: 'user-1',
  messages: MOCK_MESSAGES,
  createdAt: new Date('2024-01-01T10:00:00Z'),
  updatedAt: new Date('2024-01-01T10:00:05Z'),
}

export const MOCK_CONVERSATION_EMPTY: Conversation = {
  id: 'conv-2',
  title: null,
  userId: 'user-1',
  messages: [],
  createdAt: new Date('2024-01-02T10:00:00Z'),
  updatedAt: new Date('2024-01-02T10:00:00Z'),
}

export const MOCK_CONVERSATIONS_LIST = [
  {
    id: 'conv-1',
    title: 'AI Discussion',
    createdAt: new Date('2024-01-01T10:00:00Z'),
    updatedAt: new Date('2024-01-01T10:00:05Z'),
    persona: {
      name: 'Elon Musk',
      slug: 'elon-musk',
      imageUrl: 'https://example.com/elon.jpg',
      accentColor: '#FF6B35',
    },
    _count: { messages: 2 },
  },
  {
    id: 'conv-2',
    title: null,
    createdAt: new Date('2024-01-02T10:00:00Z'),
    updatedAt: new Date('2024-01-02T10:00:00Z'),
    persona: null,
    _count: { messages: 0 },
  },
]

export const MOCK_DB_CONVERSATION = {
  id: 'conv-1',
  title: 'AI Discussion',
  userId: 'user-1',
  personaId: 'persona-1',
  messageCount: 2,
  totalTokens: 150,
  createdAt: new Date('2024-01-01T10:00:00Z'),
  updatedAt: new Date('2024-01-01T10:00:05Z'),
  messages: [
    {
      id: 'msg-1',
      role: 'user',
      content: 'What do you think about AI?',
      conversationId: 'conv-1',
      inputTokens: null,
      outputTokens: null,
      retrievedChunkIds: [],
      retrievalScores: [],
      model: null,
      createdAt: new Date('2024-01-01T10:00:00Z'),
    },
  ],
}
