import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'
import { mockPrisma, resetPrismaMocks } from '../mocks/prisma'

const mocks = vi.hoisted(() => ({
  getServerSession: vi.fn(),
}))

vi.mock('next-auth', () => ({
  getServerSession: mocks.getServerSession,
}))

vi.mock('@/lib/auth', () => ({
  authOptions: {},
}))

import { GET } from '@/app/api/conversations/[id]/export/route'

const MOCK_SESSION = { user: { id: 'user-1', name: 'Test', email: 'test@test.com' } }

const MOCK_CONVERSATION = {
  id: 'conv-1',
  userId: 'user-1',
  title: 'AI Chat',
  persona: { name: 'Elon Musk', slug: 'elon-musk' },
  messages: [
    { id: 'msg-1', role: 'user', content: 'Hello', createdAt: new Date('2026-02-18'), attachments: [] },
    { id: 'msg-2', role: 'assistant', content: 'Hi there!', createdAt: new Date('2026-02-18'), attachments: [] },
  ],
}

function createRequest(id: string, format: string): NextRequest {
  return new NextRequest(`http://localhost:3000/api/conversations/${id}/export?format=${format}`)
}

describe('GET /api/conversations/[id]/export', () => {
  beforeEach(() => {
    resetPrismaMocks()
    Object.values(mocks).forEach(m => m.mockReset())
  })

  it('인증되지 않으면 401을 반환한다', async () => {
    mocks.getServerSession.mockResolvedValue(null)

    const req = createRequest('conv-1', 'json')
    const response = await GET(req, { params: Promise.resolve({ id: 'conv-1' }) })

    expect(response.status).toBe(401)
  })

  it('존재하지 않는 대화면 404를 반환한다', async () => {
    mocks.getServerSession.mockResolvedValue(MOCK_SESSION)
    mockPrisma.conversation.findFirst.mockResolvedValue(null as never)

    const req = createRequest('conv-999', 'json')
    const response = await GET(req, { params: Promise.resolve({ id: 'conv-999' }) })

    expect(response.status).toBe(404)
  })

  it('잘못된 format이면 400을 반환한다', async () => {
    mocks.getServerSession.mockResolvedValue(MOCK_SESSION)

    const req = createRequest('conv-1', 'xml')
    const response = await GET(req, { params: Promise.resolve({ id: 'conv-1' }) })

    expect(response.status).toBe(400)
  })

  it('json format으로 올바른 Content-Type을 반환한다', async () => {
    mocks.getServerSession.mockResolvedValue(MOCK_SESSION)
    mockPrisma.conversation.findFirst.mockResolvedValue(MOCK_CONVERSATION as never)

    const req = createRequest('conv-1', 'json')
    const response = await GET(req, { params: Promise.resolve({ id: 'conv-1' }) })

    expect(response.status).toBe(200)
    expect(response.headers.get('Content-Type')).toContain('application/json')
    expect(response.headers.get('Content-Disposition')).toContain('attachment')
  })

  it('markdown format으로 올바른 Content-Type을 반환한다', async () => {
    mocks.getServerSession.mockResolvedValue(MOCK_SESSION)
    mockPrisma.conversation.findFirst.mockResolvedValue(MOCK_CONVERSATION as never)

    const req = createRequest('conv-1', 'markdown')
    const response = await GET(req, { params: Promise.resolve({ id: 'conv-1' }) })

    expect(response.status).toBe(200)
    expect(response.headers.get('Content-Type')).toContain('text/markdown')
    expect(response.headers.get('Content-Disposition')).toContain('attachment')
  })

  it('json 내보내기에 메시지 데이터가 포함된다', async () => {
    mocks.getServerSession.mockResolvedValue(MOCK_SESSION)
    mockPrisma.conversation.findFirst.mockResolvedValue(MOCK_CONVERSATION as never)

    const req = createRequest('conv-1', 'json')
    const response = await GET(req, { params: Promise.resolve({ id: 'conv-1' }) })
    const data = await response.json()

    expect(data.messages).toHaveLength(2)
    expect(data.persona).toBe('Elon Musk')
  })
})
