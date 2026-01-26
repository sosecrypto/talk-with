import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { anthropic, generateTitle } from '@/lib/anthropic'
import { generatePersonaPrompt, getPersonaBySlug } from '@/lib/prompt-generator'
import { generateEmbedding } from '@/lib/openai'
import { getSupabaseAdmin } from '@/lib/supabase'

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

    const { data: chunks, error } = await supabase.rpc('match_chunks', {
      query_embedding: queryEmbedding,
      persona_slug: personaSlug,
      match_threshold: 0.65,
      match_count: topK,
    })

    if (error) {
      console.error('RAG search error:', error)
      return []
    }

    return chunks || []
  } catch (error) {
    console.error('RAG search failed:', error)
    return []
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { message, conversationId, personaSlug } = await request.json()

    if (!message || typeof message !== 'string') {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 })
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
          userId: session.user.id,
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
          userId: session.user.id,
          personaId,
        },
        include: {
          messages: true,
        },
      })
      isNewConversation = true
    }

    // Save user message
    await prisma.message.create({
      data: {
        role: 'user',
        content: message,
        conversationId: conversation.id,
      },
    })

    // Build message history
    const messages = [
      ...conversation.messages.map((msg) => ({
        role: msg.role as 'user' | 'assistant',
        content: msg.content,
      })),
      { role: 'user' as const, content: message },
    ]

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
