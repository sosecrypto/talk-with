import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { anthropic, generateTitle } from '@/lib/anthropic'
import { generatePersonaPrompt, getPersonaBySlug } from '@/lib/prompt-generator'
import { generateEmbedding } from '@/lib/openai'
import { getSupabaseAdmin } from '@/lib/supabase'
import { rerankChunks } from '@/lib/reranker'

const isDev = process.env.NODE_ENV === 'development'

// 개발 모드에서 테스트 사용자 자동 생성/조회
async function getOrCreateDevUser(userId: string) {
  let user = await prisma.user.findUnique({ where: { id: userId } })

  if (!user) {
    user = await prisma.user.create({
      data: {
        id: userId,
        email: 'test@example.com',
        name: 'Test User',
      },
    })
  }

  return user
}

interface RAGChunk {
  id: string
  content: string
  document_title: string | null
  similarity: number
}

async function searchRAG(query: string, personaSlug: string, topK = 5): Promise<RAGChunk[]> {
  try {
    const queryEmbedding = await generateEmbedding(query)
    const supabase = getSupabaseAdmin()

    const fetchCount = topK * 3

    const { data: chunks, error } = await supabase.rpc('hybrid_search_chunks', {
      query_embedding: queryEmbedding,
      query_text: query,
      persona_slug: personaSlug,
      match_count: fetchCount,
      vector_threshold: 0.3,
      keyword_weight: 0.3,
      rrf_k: 60,
    })

    if (error) {
      console.error('RAG search error:', error)
      return []
    }

    const candidates: RAGChunk[] = (chunks || []).map((chunk: RAGChunk & { combined_score?: number }) => ({
      id: chunk.id,
      content: chunk.content,
      document_title: chunk.document_title,
      similarity: chunk.combined_score ?? chunk.similarity,
    }))

    if (candidates.length === 0) return []

    const reranked = await rerankChunks(query, candidates, topK)

    return reranked.map(chunk => ({
      id: chunk.id,
      content: chunk.content,
      document_title: chunk.document_title,
      similarity: chunk.rerankScore || chunk.similarity,
    }))
  } catch (error) {
    console.error('RAG search failed:', error)
    return []
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    // 개발 모드에서는 인증 우회 + 테스트 사용자 생성
    let userId: string
    if (isDev) {
      userId = session?.user?.id || 'dev-user-1'
      await getOrCreateDevUser(userId)
    } else {
      if (!session?.user?.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }
      userId = session.user.id
    }

    const { message, conversationId, personaSlug, attachments } = await request.json()

    if (!message || typeof message !== 'string') {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 })
    }

    // Validate attachments
    const validAttachments: Array<{ url: string; type: string; name: string }> = []
    if (Array.isArray(attachments)) {
      for (const att of attachments) {
        if (att?.url && att?.type && att?.name) {
          validAttachments.push({ url: att.url, type: att.type, name: att.name })
        }
      }
    }

    let conversation
    let isNewConversation = false
    let personaId: string | null = null

    // Validate persona if provided
    if (personaSlug) {
      const persona = await getPersonaBySlug(personaSlug)
      if (!persona) {
        return NextResponse.json({ error: 'Persona not found' }, { status: 404 })
      }
      personaId = persona.id
    }

    if (conversationId) {
      conversation = await prisma.conversation.findFirst({
        where: {
          id: conversationId,
          userId,
        },
        include: {
          messages: {
            orderBy: { createdAt: 'asc' },
          },
        },
      })

      if (!conversation) {
        return NextResponse.json({ error: 'Conversation not found' }, { status: 404 })
      }
    } else {
      conversation = await prisma.conversation.create({
        data: {
          userId,
          personaId,
        },
        include: {
          messages: true,
        },
      })
      isNewConversation = true
    }

    // Save user message
    const userMsg = await prisma.message.create({
      data: {
        role: 'user',
        content: message,
        conversationId: conversation.id,
      },
    })

    // Save attachments if any
    for (const att of validAttachments) {
      await prisma.messageAttachment.create({
        data: {
          messageId: userMsg.id,
          url: att.url,
          type: att.type,
          name: att.name,
        },
      })
    }

    // Build message history - construct last user message with vision content if attachments exist
    const historyMessages = conversation.messages.map((msg) => ({
      role: msg.role as 'user' | 'assistant',
      content: msg.content,
    }))

    const imageAttachments = validAttachments.filter(att => att.type === 'image')

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let messages: any[]
    if (imageAttachments.length > 0) {
      const contentBlocks = [
        ...imageAttachments.map(att => ({
          type: 'image',
          source: { type: 'url', url: att.url },
        })),
        { type: 'text', text: message },
      ]
      messages = [...historyMessages, { role: 'user', content: contentBlocks }]
    } else {
      messages = [...historyMessages, { role: 'user', content: message }]
    }

    // Generate system prompt with RAG context
    let systemPrompt = 'You are a helpful assistant.'
    let retrievedChunkIds: string[] = []
    let retrievalScores: number[] = []

    if (personaSlug) {
      // Search for relevant context
      const ragChunks = await searchRAG(message, personaSlug, 5)

      if (ragChunks.length > 0) {
        retrievedChunkIds = ragChunks.map(c => c.id)
        retrievalScores = ragChunks.map(c => c.similarity)
      }

      // Generate persona prompt with RAG context
      const ragContext = ragChunks.length > 0
        ? {
            chunks: ragChunks.map(c => ({
              id: c.id,
              content: c.content,
              documentTitle: c.document_title,
              similarity: c.similarity,
              keywordRank: null,
              combinedScore: null,
              rerankScore: c.similarity,
              metadata: null,
            })),
          }
        : undefined

      systemPrompt = await generatePersonaPrompt(personaSlug, ragContext)
    }

    const encoder = new TextEncoder()
    const stream = new ReadableStream({
      async start(controller) {
        let fullResponse = ''
        let inputTokens = 0
        let outputTokens = 0

        try {
          const messageStream = await anthropic.messages.stream({
            model: 'claude-sonnet-4-20250514',
            max_tokens: 4096,
            system: systemPrompt,
            messages,
          })

          for await (const event of messageStream) {
            if (
              event.type === 'content_block_delta' &&
              event.delta.type === 'text_delta'
            ) {
              const text = event.delta.text
              fullResponse += text
              controller.enqueue(
                encoder.encode(`data: ${JSON.stringify({
                  text,
                  conversationId: conversation.id,
                  personaSlug: personaSlug || null,
                })}\n\n`)
              )
            }

            // Capture token usage
            if (event.type === 'message_delta' && event.usage) {
              outputTokens = event.usage.output_tokens
            }
          }

          // Get final message for input tokens
          const finalMessage = await messageStream.finalMessage()
          inputTokens = finalMessage.usage?.input_tokens || 0

          // Save assistant message with RAG metadata
          await prisma.message.create({
            data: {
              role: 'assistant',
              content: fullResponse,
              conversationId: conversation.id,
              inputTokens,
              outputTokens,
              retrievedChunkIds,
              retrievalScores,
              model: 'claude-sonnet-4-20250514',
            },
          })

          // Update conversation stats
          await prisma.conversation.update({
            where: { id: conversation.id },
            data: {
              messageCount: { increment: 2 },
              totalTokens: { increment: inputTokens + outputTokens },
            },
          })

          if (isNewConversation) {
            const title = await generateTitle(message)
            await prisma.conversation.update({
              where: { id: conversation.id },
              data: { title },
            })
            controller.enqueue(
              encoder.encode(`data: ${JSON.stringify({ title, done: true })}\n\n`)
            )
          } else {
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ done: true })}\n\n`))
          }
        } catch (error) {
          console.error('Stream error:', error)
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ error: 'Stream error occurred' })}\n\n`)
          )
        }

        controller.close()
      },
    })

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
      },
    })
  } catch (error) {
    console.error('Chat API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
