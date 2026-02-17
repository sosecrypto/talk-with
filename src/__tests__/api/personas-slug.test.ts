import { describe, it, expect, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'
import { mockPrisma, resetPrismaMocks } from '../mocks/prisma'

import { GET } from '@/app/api/personas/[slug]/route'

function createParams(slug: string) {
  return { params: Promise.resolve({ slug }) }
}

describe('GET /api/personas/[slug]', () => {
  beforeEach(() => {
    resetPrismaMocks()
  })

  it('존재하는 persona를 반환한다', async () => {
    mockPrisma.persona.findUnique.mockResolvedValue({
      id: 'p-1',
      slug: 'elon-musk',
      name: 'Elon Musk',
      visibility: 'PUBLIC',
      topics: [],
      aliases: [],
      _count: { sources: 10, documents: 50, characteristics: 30 },
    } as never)

    const req = new NextRequest('http://localhost:3000/api/personas/elon-musk')
    const response = await GET(req, createParams('elon-musk'))
    const json = await response.json()

    expect(response.status).toBe(200)
    expect(json.success).toBe(true)
    expect(json.persona.slug).toBe('elon-musk')
  })

  it('존재하지 않는 slug면 404를 반환한다', async () => {
    mockPrisma.persona.findUnique.mockResolvedValue(null as never)

    const req = new NextRequest('http://localhost:3000/api/personas/nonexistent')
    const response = await GET(req, createParams('nonexistent'))
    const json = await response.json()

    expect(response.status).toBe(404)
    expect(json.error).toBe('Persona not found')
  })

  it('DRAFT visibility면 403을 반환한다', async () => {
    mockPrisma.persona.findUnique.mockResolvedValue({
      id: 'p-2',
      slug: 'draft-persona',
      visibility: 'DRAFT',
    } as never)

    const req = new NextRequest('http://localhost:3000/api/personas/draft-persona')
    const response = await GET(req, createParams('draft-persona'))

    expect(response.status).toBe(403)
  })

  it('ARCHIVED visibility면 403을 반환한다', async () => {
    mockPrisma.persona.findUnique.mockResolvedValue({
      id: 'p-3',
      slug: 'archived-persona',
      visibility: 'ARCHIVED',
    } as never)

    const req = new NextRequest('http://localhost:3000/api/personas/archived-persona')
    const response = await GET(req, createParams('archived-persona'))

    expect(response.status).toBe(403)
  })

  it('PUBLIC visibility면 정상 반환한다', async () => {
    mockPrisma.persona.findUnique.mockResolvedValue({
      id: 'p-1',
      visibility: 'PUBLIC',
      topics: [],
      aliases: [],
      _count: { sources: 0, documents: 0, characteristics: 0 },
    } as never)

    const req = new NextRequest('http://localhost:3000/api/personas/test')
    const response = await GET(req, createParams('test'))

    expect(response.status).toBe(200)
  })

  it('BETA visibility면 정상 반환한다', async () => {
    mockPrisma.persona.findUnique.mockResolvedValue({
      id: 'p-4',
      visibility: 'BETA',
      topics: [],
      aliases: [],
      _count: { sources: 0, documents: 0, characteristics: 0 },
    } as never)

    const req = new NextRequest('http://localhost:3000/api/personas/beta')
    const response = await GET(req, createParams('beta'))

    expect(response.status).toBe(200)
  })

  it('에러 발생 시 500을 반환한다', async () => {
    mockPrisma.persona.findUnique.mockRejectedValue(new Error('DB error'))

    const req = new NextRequest('http://localhost:3000/api/personas/error')
    const response = await GET(req, createParams('error'))

    expect(response.status).toBe(500)
  })
})
