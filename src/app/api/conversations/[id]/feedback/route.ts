import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

interface RouteParams {
  params: Promise<{ id: string }>
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id: conversationId } = await params
    const body = await request.json()
    const { messageId, thumbsUp, feedbackType, comment, rating } = body

    if (!messageId || typeof thumbsUp !== 'boolean') {
      return NextResponse.json(
        { error: 'messageId (string) and thumbsUp (boolean) are required' },
        { status: 400 }
      )
    }

    if (rating !== undefined && (typeof rating !== 'number' || rating < 1 || rating > 5)) {
      return NextResponse.json(
        { error: 'rating must be a number between 1 and 5' },
        { status: 400 }
      )
    }

    const conversation = await prisma.conversation.findFirst({
      where: { id: conversationId, userId: session.user.id },
    })

    if (!conversation) {
      return NextResponse.json({ error: 'Conversation not found' }, { status: 404 })
    }

    const existing = await prisma.conversationFeedback.findFirst({
      where: { messageId, userId: session.user.id },
    })

    if (existing) {
      return NextResponse.json({ error: 'Feedback already exists for this message' }, { status: 409 })
    }

    const feedback = await prisma.conversationFeedback.create({
      data: {
        conversationId,
        userId: session.user.id,
        messageId,
        thumbsUp,
        feedbackType: feedbackType ?? null,
        comment: comment ?? null,
        rating: rating ?? null,
      },
    })

    return NextResponse.json(feedback, { status: 201 })
  } catch (error) {
    console.error('Create feedback error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
