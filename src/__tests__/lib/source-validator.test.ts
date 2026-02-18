import { describe, it, expect } from 'vitest'
import {
  validateCreateSource,
  validateSourceType,
  validateSourceStatus,
  SOURCE_TYPES,
  SOURCE_STATUSES,
} from '@/lib/validators/source-validator'

describe('source-validator', () => {
  describe('validateCreateSource', () => {
    it('유효한 입력이면 null을 반환한다', () => {
      const result = validateCreateSource({
        personaId: 'persona-1',
        type: 'YOUTUBE_CHANNEL',
        name: 'Test Source',
      })
      expect(result).toBeNull()
    })

    it('personaId가 없으면 에러 메시지를 반환한다', () => {
      const result = validateCreateSource({
        type: 'YOUTUBE_CHANNEL',
        name: 'Test Source',
      })
      expect(result).toBe('personaId is required')
    })

    it('type이 없으면 에러 메시지를 반환한다', () => {
      const result = validateCreateSource({
        personaId: 'persona-1',
        name: 'Test Source',
      })
      expect(result).toBe('type is required')
    })

    it('name이 없으면 에러 메시지를 반환한다', () => {
      const result = validateCreateSource({
        personaId: 'persona-1',
        type: 'YOUTUBE_CHANNEL',
      })
      expect(result).toBe('name is required')
    })

    it('잘못된 type이면 에러 메시지를 반환한다', () => {
      const result = validateCreateSource({
        personaId: 'persona-1',
        type: 'INVALID_TYPE',
        name: 'Test Source',
      })
      expect(result).toBe('Invalid source type: INVALID_TYPE')
    })

    it('빈 문자열 name이면 에러 메시지를 반환한다', () => {
      const result = validateCreateSource({
        personaId: 'persona-1',
        type: 'YOUTUBE_CHANNEL',
        name: '   ',
      })
      expect(result).toBe('name is required')
    })
  })

  describe('validateSourceType', () => {
    it('유효한 SourceType이면 true를 반환한다', () => {
      expect(validateSourceType('YOUTUBE_CHANNEL')).toBe(true)
      expect(validateSourceType('TWITTER_PROFILE')).toBe(true)
      expect(validateSourceType('BLOG')).toBe(true)
      expect(validateSourceType('NEWS_SEARCH')).toBe(true)
    })

    it('잘못된 SourceType이면 false를 반환한다', () => {
      expect(validateSourceType('INVALID')).toBe(false)
      expect(validateSourceType('')).toBe(false)
      expect(validateSourceType('youtube_channel')).toBe(false)
    })
  })

  describe('validateSourceStatus', () => {
    it('유효한 SourceStatus이면 true를 반환한다', () => {
      expect(validateSourceStatus('PENDING')).toBe(true)
      expect(validateSourceStatus('ACTIVE')).toBe(true)
      expect(validateSourceStatus('PAUSED')).toBe(true)
      expect(validateSourceStatus('ARCHIVED')).toBe(true)
    })

    it('잘못된 SourceStatus이면 false를 반환한다', () => {
      expect(validateSourceStatus('INVALID')).toBe(false)
      expect(validateSourceStatus('')).toBe(false)
      expect(validateSourceStatus('active')).toBe(false)
    })
  })

  describe('상수 배열', () => {
    it('SOURCE_TYPES에 모든 SourceType이 포함되어 있다', () => {
      expect(SOURCE_TYPES).toContain('YOUTUBE_VIDEO')
      expect(SOURCE_TYPES).toContain('YOUTUBE_CHANNEL')
      expect(SOURCE_TYPES).toContain('TWITTER_PROFILE')
      expect(SOURCE_TYPES).toContain('BLOG')
      expect(SOURCE_TYPES).toContain('NEWS_SEARCH')
      expect(SOURCE_TYPES).toContain('CUSTOM')
      expect(SOURCE_TYPES.length).toBeGreaterThanOrEqual(30)
    })

    it('SOURCE_STATUSES에 모든 SourceStatus가 포함되어 있다', () => {
      expect(SOURCE_STATUSES).toEqual([
        'PENDING', 'ACTIVE', 'PAUSED', 'FAILED', 'EXHAUSTED', 'ARCHIVED',
      ])
    })
  })
})
