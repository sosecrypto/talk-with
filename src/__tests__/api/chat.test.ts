import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'
import { mockPrisma, resetPrismaMocks } from '../mocks/prisma'
import { createMockStream } from '../mocks/anthropic'
import { MOCK_SESSION, MOCK_SESSION_NULL } from '../fixtures/user'
import { MOCK_RAG_CHUNKS_RAW } from '../fixtures/persona'
import { MOCK_DB_CONVERSATION } from '../fixtures/conversation'

// Use vi.hoisted to ensure mocks exist before vi.mock factories run
const mocks = vi.hoisted(() => ({
  anthropicStream: vi.fn(),
  generateTitle: vi.fn(),
  getPersonaBySlug: vi.fn(),
  generatePersonaPrompt: vi.fn(),
  generateEmbedding: vi.fn(),
  rpc: vi.fn(),
  getServerSession: vi.fn(),
}))

vi.mock('next-auth', () => ({
  getServerSession: mocks.getServerSession,
}))

vi.mock('@/lib/auth', () => ({
  authOptions: {},
}))

vi.mock('@/lib/anthropic', () => ({
  anthropic: {
    messages: { stream: mocks.anthropicStream },
  },
  generateTitle: mocks.generateTitle,
}))

vi.mock('@/lib/prompt-generator', () => ({
  getPersonaBySlug: mocks.getPersonaBySlug,
  generatePersonaPrompt: mocks.generatePersonaPrompt,
}))

vi.mock('@/lib/openai', () => ({
  generateEmbedding: mocks.generateEmbedding,
}))

vi.mock('@/lib/supabase', () => ({
  getSupabaseAdmin: () => ({ rpc: mocks.rpc }),
}))

import { POST } from '@/app/api/chat/route'

function createRequest(body: Record<string, unknown>): NextRequest {
  return new NextRequest('http://localhost:3000/api/chat', {
    method: 'POST',
    body: JSON.stringify(body),
    headers: { 'Content-Type': 'application/json' },
  })
}

async function readSSEStream(response: Response): Promise<string[]> {
  const reader = response.body!.getReader()
  const decoder = new TextDecoder()
  const events: string[] = []

  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    events.push(decoder.decode(value))
  }

  return events
}

describe('POST /api/chat', () => {
  beforeEach(() => {
    resetPrismaMocks()
    Object.values(mocks).forEach(m => m.mockReset())
    mocks.generateEmbedding.mockResolvedValue(Array(1536).fill(0))
  })

  describe('인증', () => {
    it('세션 없으면 401을 반환한다', async () => {
      mocks.getServerSession.mockResolvedValue(MOCK_SESSION_NULL)

      const req = createRequest({ message: 'Hello' })
      const response = await POST(req)

      expect(response.status).toBe(401)
      const json = await response.json()
      expect(json.error).toBe('Unauthorized')
    })

    it('세션이 있으면 인증을 통과한다', async () => {
      mocks.getServerSession.mockResolvedValue(MOCK_SESSION)
      mockPrisma.conversation.create.mockResolvedValue({ id: 'conv-new', messages: [] } as never)
      mockPrisma.message.create.mockResolvedValue({} as never)
      mockPrisma.conversation.update.mockResolvedValue({} as never)

      const mockStream = createMockStream(['Hello'])
      mocks.anthropicStream.mockResolvedValue(mockStream)
      mocks.generateTitle.mockResolvedValue('Test')

      const req = createRequest({ message: 'Hello' })
      const response = await POST(req)

      expect(response.status).not.toBe(401)
    })
  })

  describe('입력 검증', () => {
    it('message가 없으면 400을 반환한다', async () => {
      mocks.getServerSession.mockResolvedValue(MOCK_SESSION)

      const req = createRequest({})
      const response = await POST(req)

      expect(response.status).toBe(400)
      const json = await response.json()
      expect(json.error).toBe('Message is required')
    })

    it('message가 문자열이 아니면 400을 반환한다', async () => {
      mocks.getServerSession.mockResolvedValue(MOCK_SESSION)

      const req = createRequest({ message: 123 })
      const response = await POST(req)

      expect(response.status).toBe(400)
    })

    it('존재하지 않는 personaSlug이면 404를 반환한다', async () => {
      mocks.getServerSession.mockResolvedValue(MOCK_SESSION)
      mocks.getPersonaBySlug.mockResolvedValue(null)

      const req = createRequest({ message: 'Hello', personaSlug: 'nonexistent' })
      const response = await POST(req)

      expect(response.status).toBe(404)
      const json = await response.json()
      expect(json.error).toBe('Persona not found')
    })
  })

  describe('대화 관리', () => {
    it('conversationId가 없으면 새 대화를 생성한다', async () => {
      mocks.getServerSession.mockResolvedValue(MOCK_SESSION)
      mockPrisma.conversation.create.mockResolvedValue({ id: 'conv-new', messages: [] } as never)
      mockPrisma.message.create.mockResolvedValue({} as never)
      mockPrisma.conversation.update.mockResolvedValue({} as never)

      const mockStream = createMockStream(['Hello there!'])
      mocks.anthropicStream.mockResolvedValue(mockStream)
      mocks.generateTitle.mockResolvedValue('New Chat')

      const req = createRequest({ message: 'Hi' })
      const response = await POST(req)

      expect(response.status).toBe(200)
      expect(mockPrisma.conversation.create).toHaveBeenCalled()
    })

    it('기존 conversationId로 대화를 로드한다', async () => {
      mocks.getServerSession.mockResolvedValue(MOCK_SESSION)
      mockPrisma.conversation.findFirst.mockResolvedValue(MOCK_DB_CONVERSATION as never)
      mockPrisma.message.create.mockResolvedValue({} as never)
      mockPrisma.conversation.update.mockResolvedValue({} as never)

      const mockStream = createMockStream(['Response'])
      mocks.anthropicStream.mockResolvedValue(mockStream)

      const req = createRequest({ message: 'Hi', conversationId: 'conv-1' })
      const response = await POST(req)

      expect(response.status).toBe(200)
      expect(mockPrisma.conversation.findFirst).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'conv-1', userId: 'user-1' },
        })
      )
    })

    it('다른 사용자의 대화에 접근하면 404를 반환한다', async () => {
      mocks.getServerSession.mockResolvedValue(MOCK_SESSION)
      mockPrisma.conversation.findFirst.mockResolvedValue(null as never)

      const req = createRequest({ message: 'Hi', conversationId: 'other-conv' })
      const response = await POST(req)

      expect(response.status).toBe(404)
      const json = await response.json()
      expect(json.error).toBe('Conversation not found')
    })
  })

  describe('RAG 파이프라인', () => {
    it('personaSlug이 있으면 RAG 검색 후 persona prompt를 생성한다', async () => {
      mocks.getServerSession.mockResolvedValue(MOCK_SESSION)
      mocks.getPersonaBySlug.mockResolvedValue({ id: 'p-1', slug: 'elon-musk' })
      mockPrisma.conversation.create.mockResolvedValue({ id: 'conv-new', messages: [] } as never)
      mockPrisma.message.create.mockResolvedValue({} as never)
      mockPrisma.conversation.update.mockResolvedValue({} as never)

      mocks.rpc.mockResolvedValue({ data: MOCK_RAG_CHUNKS_RAW, error: null })
      mocks.generatePersonaPrompt.mockResolvedValue('You are Elon Musk...')
      mocks.generateTitle.mockResolvedValue('Test Title')

      const mockStream = createMockStream(['AI response'])
      mocks.anthropicStream.mockResolvedValue(mockStream)

      const req = createRequest({ message: 'Tell me about AI', personaSlug: 'elon-musk' })
      const response = await POST(req)
      await readSSEStream(response)

      expect(mocks.generatePersonaPrompt).toHaveBeenCalledWith(
        'elon-musk',
        expect.objectContaining({
          chunks: expect.arrayContaining([
            expect.objectContaining({ id: 'chunk-1' }),
          ]),
        })
      )
    })

    it('personaSlug이 없으면 기본 system prompt를 사용한다', async () => {
      mocks.getServerSession.mockResolvedValue(MOCK_SESSION)
      mockPrisma.conversation.create.mockResolvedValue({ id: 'conv-new', messages: [] } as never)
      mockPrisma.message.create.mockResolvedValue({} as never)
      mockPrisma.conversation.update.mockResolvedValue({} as never)

      const mockStream = createMockStream(['Response'])
      mocks.anthropicStream.mockResolvedValue(mockStream)
      mocks.generateTitle.mockResolvedValue('Test')

      const req = createRequest({ message: 'Hello' })
      const response = await POST(req)
      await readSSEStream(response)

      expect(mocks.anthropicStream).toHaveBeenCalledWith(
        expect.objectContaining({
          system: 'You are a helpful assistant.',
        })
      )
    })
  })

  describe('SSE 스트리밍', () => {
    it('text/event-stream Content-Type으로 응답한다', async () => {
      mocks.getServerSession.mockResolvedValue(MOCK_SESSION)
      mockPrisma.conversation.create.mockResolvedValue({ id: 'conv-new', messages: [] } as never)
      mockPrisma.message.create.mockResolvedValue({} as never)
      mockPrisma.conversation.update.mockResolvedValue({} as never)

      const mockStream = createMockStream(['Hi'])
      mocks.anthropicStream.mockResolvedValue(mockStream)
      mocks.generateTitle.mockResolvedValue('Test')

      const req = createRequest({ message: 'Hello' })
      const response = await POST(req)

      expect(response.headers.get('Content-Type')).toBe('text/event-stream')
      expect(response.headers.get('Cache-Control')).toBe('no-cache')
    })

    it('SSE 이벤트에 text와 conversationId를 포함한다', async () => {
      mocks.getServerSession.mockResolvedValue(MOCK_SESSION)
      mockPrisma.conversation.create.mockResolvedValue({ id: 'conv-123', messages: [] } as never)
      mockPrisma.message.create.mockResolvedValue({} as never)
      mockPrisma.conversation.update.mockResolvedValue({} as never)

      const mockStream = createMockStream(['Hello', ' World'])
      mocks.anthropicStream.mockResolvedValue(mockStream)
      mocks.generateTitle.mockResolvedValue('Test')

      const req = createRequest({ message: 'Hi' })
      const response = await POST(req)
      const events = await readSSEStream(response)

      const allText = events.join('')
      expect(allText).toContain('"text":"Hello"')
      expect(allText).toContain('"conversationId":"conv-123"')
    })

    it('새 대화에서는 title을 포함한 done 이벤트를 보낸다', async () => {
      mocks.getServerSession.mockResolvedValue(MOCK_SESSION)
      mockPrisma.conversation.create.mockResolvedValue({ id: 'conv-new', messages: [] } as never)
      mockPrisma.message.create.mockResolvedValue({} as never)
      mockPrisma.conversation.update.mockResolvedValue({} as never)

      const mockStream = createMockStream(['Reply'])
      mocks.anthropicStream.mockResolvedValue(mockStream)
      mocks.generateTitle.mockResolvedValue('My New Chat')

      const req = createRequest({ message: 'Hello' })
      const response = await POST(req)
      const events = await readSSEStream(response)

      const allText = events.join('')
      expect(allText).toContain('"title":"My New Chat"')
      expect(allText).toContain('"done":true')
    })
  })

  describe('DB 저장', () => {
    it('user 메시지를 DB에 저장한다', async () => {
      mocks.getServerSession.mockResolvedValue(MOCK_SESSION)
      mockPrisma.conversation.create.mockResolvedValue({ id: 'conv-new', messages: [] } as never)
      mockPrisma.message.create.mockResolvedValue({} as never)
      mockPrisma.conversation.update.mockResolvedValue({} as never)

      const mockStream = createMockStream(['Reply'])
      mocks.anthropicStream.mockResolvedValue(mockStream)
      mocks.generateTitle.mockResolvedValue('Test')

      const req = createRequest({ message: 'Hello World' })
      const response = await POST(req)
      await readSSEStream(response)

      expect(mockPrisma.message.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            role: 'user',
            content: 'Hello World',
            conversationId: 'conv-new',
          }),
        })
      )
    })

    it('assistant 응답을 토큰 정보와 함께 DB에 저장한다', async () => {
      mocks.getServerSession.mockResolvedValue(MOCK_SESSION)
      mockPrisma.conversation.create.mockResolvedValue({ id: 'conv-new', messages: [] } as never)
      mockPrisma.message.create.mockResolvedValue({} as never)
      mockPrisma.conversation.update.mockResolvedValue({} as never)

      const mockStream = createMockStream(['Reply text'], 100, 50)
      mocks.anthropicStream.mockResolvedValue(mockStream)
      mocks.generateTitle.mockResolvedValue('Test')

      const req = createRequest({ message: 'Hello' })
      const response = await POST(req)
      await readSSEStream(response)

      const calls = mockPrisma.message.create.mock.calls
      const assistantCall = calls.find(
        (c: unknown[]) => (c[0] as { data: { role: string } }).data.role === 'assistant'
      )
      expect(assistantCall).toBeDefined()
      expect((assistantCall![0] as { data: { model: string } }).data.model).toBe('claude-sonnet-4-20250514')
    })

    it('대화 통계를 업데이트한다 (messageCount +2)', async () => {
      mocks.getServerSession.mockResolvedValue(MOCK_SESSION)
      mockPrisma.conversation.create.mockResolvedValue({ id: 'conv-new', messages: [] } as never)
      mockPrisma.message.create.mockResolvedValue({} as never)
      mockPrisma.conversation.update.mockResolvedValue({} as never)

      const mockStream = createMockStream(['Reply'], 100, 50)
      mocks.anthropicStream.mockResolvedValue(mockStream)
      mocks.generateTitle.mockResolvedValue('Test')

      const req = createRequest({ message: 'Hello' })
      const response = await POST(req)
      await readSSEStream(response)

      expect(mockPrisma.conversation.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            messageCount: { increment: 2 },
          }),
        })
      )
    })
  })

  describe('에러 처리', () => {
    it('잘못된 JSON body면 500을 반환한다', async () => {
      mocks.getServerSession.mockResolvedValue(MOCK_SESSION)

      const req = new NextRequest('http://localhost:3000/api/chat', {
        method: 'POST',
        body: 'invalid json',
        headers: { 'Content-Type': 'application/json' },
      })

      const response = await POST(req)
      expect(response.status).toBe(500)
    })
  })
})
