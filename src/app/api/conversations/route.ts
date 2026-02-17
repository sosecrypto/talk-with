import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

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

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

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

    const conversations = await prisma.conversation.findMany({
      where: { userId },
      orderBy: { updatedAt: 'desc' },
      take: 50,
      select: {
        id: true,
        title: true,
        createdAt: true,
        updatedAt: true,
        persona: {
          select: {
            name: true,
            slug: true,
            imageUrl: true,
            accentColor: true,
          },
        },
        _count: {
          select: { messages: true },
        },
      },
    })

    return NextResponse.json(conversations)
  } catch (error) {
    console.error('Get conversations error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

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

    const { title } = await request.json()

    const conversation = await prisma.conversation.create({
      data: {
        userId,
        title: title || null,
      },
    })

    return NextResponse.json(conversation, { status: 201 })
  } catch (error) {
    console.error('Create conversation error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
