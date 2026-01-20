import Anthropic from '@anthropic-ai/sdk'

export const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

export type MessageRole = 'user' | 'assistant'

export interface ChatMessage {
  role: MessageRole
  content: string
}

export async function* streamChat(
  messages: ChatMessage[],
  systemPrompt?: string
): AsyncGenerator<string, void, unknown> {
  const stream = await anthropic.messages.stream({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 4096,
    system: systemPrompt || 'You are a helpful assistant.',
    messages: messages.map((msg) => ({
      role: msg.role,
      content: msg.content,
    })),
  })

  for await (const event of stream) {
    if (
      event.type === 'content_block_delta' &&
      event.delta.type === 'text_delta'
    ) {
      yield event.delta.text
    }
  }
}

export async function generateTitle(content: string): Promise<string> {
  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 50,
    messages: [
      {
        role: 'user',
        content: `Generate a very short title (max 5 words) for a conversation that starts with: "${content.slice(0, 200)}". Return only the title, nothing else.`,
      },
    ],
  })

  const textBlock = response.content.find((block) => block.type === 'text')
  return textBlock ? textBlock.text.trim() : 'New Conversation'
}
