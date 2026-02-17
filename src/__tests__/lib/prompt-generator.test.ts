import { describe, it, expect, vi, beforeEach } from 'vitest'
import { generatePersonaPrompt, getPersonaBySlug, listPublicPersonas } from '@/lib/prompt-generator'
import { mockPrisma, resetPrismaMocks } from '../mocks/prisma'
import {
  MOCK_PERSONA_WITH_CHARACTERISTICS,
  MOCK_PERSONA_EMPTY_CHARACTERISTICS,
  MOCK_RAG_CHUNKS,
  MOCK_PERSONA_LIST,
  MOCK_CHARACTERISTICS,
} from '../fixtures/persona'

describe('prompt-generator', () => {
  beforeEach(() => {
    resetPrismaMocks()
  })

  describe('generatePersonaPrompt', () => {
    it('persona가 존재할 때 올바른 시스템 프롬프트를 생성한다', async () => {
      mockPrisma.persona.findUnique.mockResolvedValue(MOCK_PERSONA_WITH_CHARACTERISTICS as never)

      const prompt = await generatePersonaPrompt('elon-musk')

      expect(prompt).toContain('You are Elon Musk')
      expect(prompt).toContain('(일론 머스크)')
      expect(prompt).toContain('## Identity')
      expect(prompt).toContain('## Communication Style')
      expect(prompt).toContain('## Core Beliefs & Values')
      expect(prompt).toContain('## Key Opinions')
      expect(prompt).toContain('## Instructions')
    })

    it('존재하지 않는 slug이면 Error를 throw한다', async () => {
      mockPrisma.persona.findUnique.mockResolvedValue(null as never)

      await expect(generatePersonaPrompt('nonexistent')).rejects.toThrow(
        'Persona not found: nonexistent'
      )
    })

    it('RAG context가 있으면 "Relevant Context" 섹션을 추가한다', async () => {
      mockPrisma.persona.findUnique.mockResolvedValue(MOCK_PERSONA_WITH_CHARACTERISTICS as never)

      const prompt = await generatePersonaPrompt('elon-musk', { chunks: MOCK_RAG_CHUNKS })

      expect(prompt).toContain('## Relevant Context from Your Actual Statements')
      expect(prompt).toContain(MOCK_RAG_CHUNKS[0].content)
      expect(prompt).toContain('Source: Interview with Elon Musk 2024')
    })

    it('RAG context가 없으면 context 섹션을 생략한다', async () => {
      mockPrisma.persona.findUnique.mockResolvedValue(MOCK_PERSONA_WITH_CHARACTERISTICS as never)

      const prompt = await generatePersonaPrompt('elon-musk')

      expect(prompt).not.toContain('## Relevant Context')
    })

    it('빈 RAG chunks면 context 섹션을 생략한다', async () => {
      mockPrisma.persona.findUnique.mockResolvedValue(MOCK_PERSONA_WITH_CHARACTERISTICS as never)

      const prompt = await generatePersonaPrompt('elon-musk', { chunks: [] })

      expect(prompt).not.toContain('## Relevant Context')
    })

    it('characteristics가 없으면 fallback 텍스트를 사용한다', async () => {
      mockPrisma.persona.findUnique.mockResolvedValue(MOCK_PERSONA_EMPTY_CHARACTERISTICS as never)

      const prompt = await generatePersonaPrompt('elon-musk')

      expect(prompt).toContain('Speak authentically and consistently')
      expect(prompt).toContain('Stay true to your documented principles')
      expect(prompt).toContain('Apply your known decision-making frameworks')
      expect(prompt).toContain('Use your characteristic expressions naturally')
      expect(prompt).toContain('Provide guidance consistent with your known approach')
    })

    it('category별로 올바르게 분류한다 (OPINION, STYLE, BELIEF, CATCHPHRASE, PRINCIPLE, ADVICE)', async () => {
      mockPrisma.persona.findUnique.mockResolvedValue(MOCK_PERSONA_WITH_CHARACTERISTICS as never)

      const prompt = await generatePersonaPrompt('elon-musk')

      // STYLE
      expect(prompt).toContain('Speaks in direct, often casual tone')
      // BELIEF
      expect(prompt).toContain('First principles thinking is the most powerful')
      // OPINION
      expect(prompt).toContain('AI is potentially the most dangerous technology')
      // CATCHPHRASE
      expect(prompt).toContain('"The future is gonna be wild"')
      // PRINCIPLE
      expect(prompt).toContain('If something is important enough')
      // ADVICE
      expect(prompt).toContain('Work like hell')
    })

    it('opinions는 최대 10개까지 표시한다', async () => {
      const manyOpinions = Array.from({ length: 15 }, (_, i) => ({
        id: `opinion-${i}`,
        category: 'OPINION',
        topic: `Topic ${i}`,
        content: `Opinion ${i}`,
        confidence: 0.9,
      }))

      mockPrisma.persona.findUnique.mockResolvedValue({
        ...MOCK_PERSONA_WITH_CHARACTERISTICS,
        characteristics: manyOpinions,
      } as never)

      const prompt = await generatePersonaPrompt('elon-musk')

      // First 10 should appear
      expect(prompt).toContain('Opinion 9')
      // 11th should not
      expect(prompt).not.toContain('Opinion 10')
    })

    it('advice는 최대 5개까지 표시한다', async () => {
      const manyAdvice = Array.from({ length: 8 }, (_, i) => ({
        id: `advice-${i}`,
        category: 'ADVICE',
        topic: null,
        content: `Advice content ${i}`,
        confidence: 0.9,
      }))

      mockPrisma.persona.findUnique.mockResolvedValue({
        ...MOCK_PERSONA_WITH_CHARACTERISTICS,
        characteristics: manyAdvice,
      } as never)

      const prompt = await generatePersonaPrompt('elon-musk')

      expect(prompt).toContain('Advice content 4')
      expect(prompt).not.toContain('Advice content 5')
    })

    it('confidence >= 0.6만 포함한다 (DB 쿼리 where 조건)', async () => {
      // Prisma mock에서 confidence >= 0.6 필터링이 적용된 결과를 반환
      const filteredChars = MOCK_CHARACTERISTICS.filter(c => c.confidence >= 0.6)
      mockPrisma.persona.findUnique.mockResolvedValue({
        ...MOCK_PERSONA_WITH_CHARACTERISTICS,
        characteristics: filteredChars,
      } as never)

      const prompt = await generatePersonaPrompt('elon-musk')

      // 0.55 confidence인 EV opinion은 제외됨
      expect(prompt).not.toContain('Electric vehicles are not just better')
      // 0.92 confidence인 AI opinion은 포함됨
      expect(prompt).toContain('AI is potentially the most dangerous')

      // Prisma 호출 시 confidence >= 0.6 where 조건 확인
      expect(mockPrisma.persona.findUnique).toHaveBeenCalledWith(
        expect.objectContaining({
          include: expect.objectContaining({
            characteristics: expect.objectContaining({
              where: { confidence: { gte: 0.6 } },
            }),
          }),
        })
      )
    })

    it('nameKo가 null이면 한국어 이름을 표시하지 않는다', async () => {
      mockPrisma.persona.findUnique.mockResolvedValue({
        ...MOCK_PERSONA_WITH_CHARACTERISTICS,
        nameKo: null,
      } as never)

      const prompt = await generatePersonaPrompt('elon-musk')

      expect(prompt).toMatch(/^You are Elon Musk\./)
      expect(prompt).not.toContain('(일론 머스크)')
    })

    it('bio가 없으면 기본 bio 텍스트를 사용한다', async () => {
      mockPrisma.persona.findUnique.mockResolvedValue({
        ...MOCK_PERSONA_WITH_CHARACTERISTICS,
        bio: null,
      } as never)

      const prompt = await generatePersonaPrompt('elon-musk')

      expect(prompt).toContain('You are Elon Musk, a notable figure')
    })
  })

  describe('getPersonaBySlug', () => {
    it('slug로 persona를 조회한다', async () => {
      const mockResult = { id: 'p-1', slug: 'elon-musk', name: 'Elon Musk' }
      mockPrisma.persona.findUnique.mockResolvedValue(mockResult as never)

      const result = await getPersonaBySlug('elon-musk')

      expect(result).toEqual(mockResult)
      expect(mockPrisma.persona.findUnique).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { slug: 'elon-musk' },
        })
      )
    })
  })

  describe('listPublicPersonas', () => {
    it('PUBLIC/BETA visibility + isActive=true persona를 priority 내림차순으로 반환한다', async () => {
      mockPrisma.persona.findMany.mockResolvedValue(MOCK_PERSONA_LIST as never)

      const result = await listPublicPersonas()

      expect(result).toEqual(MOCK_PERSONA_LIST)
      expect(mockPrisma.persona.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            visibility: { in: ['PUBLIC', 'BETA'] },
            isActive: true,
          },
          orderBy: { priority: 'desc' },
        })
      )
    })
  })
})
