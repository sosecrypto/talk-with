import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { anthropic, generateTitle } from '@/lib/anthropic'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { message, conversationId } = await request.json()

    if (!message || typeof message !== 'string') {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 })
    }

    let conversation
    let isNewConversation = false

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
        },
        include: {
          messages: true,
        },
      })
      isNewConversation = true
    }

    await prisma.message.create({
      data: {
        role: 'user',
        content: message,
        conversationId: conversation.id,
      },
    })

    const messages = [
      ...conversation.messages.map((msg) => ({
        role: msg.role as 'user' | 'assistant',
        content: msg.content,
      })),
      { role: 'user' as const, content: message },
    ]

    const encoder = new TextEncoder()
    const stream = new ReadableStream({
      async start(controller) {
        let fullResponse = ''

        try {
          const messageStream = await anthropic.messages.stream({
            model: 'claude-sonnet-4-20250514',
            max_tokens: 4096,
            system: 'You are a helpful assistant.',
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
                encoder.encode(`data: ${JSON.stringify({ text, conversationId: conversation.id })}\n\n`)
              )
            }
          }

          await prisma.message.create({
            data: {
              role: 'assistant',
              content: fullResponse,
              conversationId: conversation.id,
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
