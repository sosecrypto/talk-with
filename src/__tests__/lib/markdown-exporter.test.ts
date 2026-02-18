import { describe, it, expect } from 'vitest'
import { exportToMarkdown } from '@/lib/export/markdown-exporter'

const MOCK_MESSAGES = [
  {
    id: 'msg-1',
    role: 'user' as const,
    content: 'What is your vision for the future?',
    conversationId: 'conv-1',
    createdAt: new Date('2026-02-18T10:00:00Z'),
  },
  {
    id: 'msg-2',
    role: 'assistant' as const,
    content: 'I believe **AI** will transform everything.',
    conversationId: 'conv-1',
    createdAt: new Date('2026-02-18T10:00:05Z'),
  },
]

describe('exportToMarkdown', () => {
  it('헤더에 페르소나 이름과 날짜를 포함한다', () => {
    const result = exportToMarkdown({
      personaName: 'Elon Musk',
      messages: MOCK_MESSAGES,
      exportDate: '2026-02-18',
    })

    expect(result).toContain('# Talk With Legends - Elon Musk')
    expect(result).toContain('2026-02-18')
  })

  it('메시지 수를 헤더에 표시한다', () => {
    const result = exportToMarkdown({
      personaName: 'Elon Musk',
      messages: MOCK_MESSAGES,
      exportDate: '2026-02-18',
    })

    expect(result).toContain('2')
  })

  it('사용자 메시지를 **You:** 형식으로 포맷한다', () => {
    const result = exportToMarkdown({
      personaName: 'Elon Musk',
      messages: MOCK_MESSAGES,
      exportDate: '2026-02-18',
    })

    expect(result).toContain('**You:**')
    expect(result).toContain('What is your vision for the future?')
  })

  it('어시스턴트 메시지를 페르소나 이름으로 포맷한다', () => {
    const result = exportToMarkdown({
      personaName: 'Elon Musk',
      messages: MOCK_MESSAGES,
      exportDate: '2026-02-18',
    })

    expect(result).toContain('**Elon Musk:**')
    expect(result).toContain('I believe **AI** will transform everything.')
  })

  it('메시지 사이에 구분선을 넣는다', () => {
    const result = exportToMarkdown({
      personaName: 'Elon Musk',
      messages: MOCK_MESSAGES,
      exportDate: '2026-02-18',
    })

    expect(result).toContain('---')
  })

  it('페르소나 이름이 없으면 "AI"를 사용한다', () => {
    const result = exportToMarkdown({
      messages: MOCK_MESSAGES,
      exportDate: '2026-02-18',
    })

    expect(result).toContain('**AI:**')
  })

  it('첨부 이미지 URL을 마크다운으로 포함한다', () => {
    const messagesWithImage = [
      {
        ...MOCK_MESSAGES[0],
        attachments: [{ id: 'att-1', url: 'https://example.com/image.png', type: 'image' as const, name: 'image.png', messageId: 'msg-1', createdAt: new Date() }],
      },
      MOCK_MESSAGES[1],
    ]

    const result = exportToMarkdown({
      personaName: 'Elon Musk',
      messages: messagesWithImage,
      exportDate: '2026-02-18',
    })

    expect(result).toContain('![image.png](https://example.com/image.png)')
  })
})
