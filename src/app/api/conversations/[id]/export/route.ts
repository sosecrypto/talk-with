import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { exportToMarkdown } from '@/lib/export/markdown-exporter'

const VALID_FORMATS = ['json', 'markdown'] as const
type ExportFormat = typeof VALID_FORMATS[number]

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const format = request.nextUrl.searchParams.get('format') as ExportFormat
    if (!format || !VALID_FORMATS.includes(format)) {
      return NextResponse.json(
        { error: 'Invalid format. Use: json, markdown' },
        { status: 400 }
      )
    }

    const { id } = await params

    const conversation = await prisma.conversation.findFirst({
      where: { id, userId: session.user.id },
      include: {
        persona: { select: { name: true, slug: true } },
        messages: {
          orderBy: { createdAt: 'asc' },
          include: { attachments: true },
        },
      },
    })

    if (!conversation) {
      return NextResponse.json({ error: 'Conversation not found' }, { status: 404 })
    }

    const personaName = conversation.persona?.name || 'AI'
    const exportDate = new Date().toISOString().split('T')[0]
    const filename = `talk-with-${conversation.persona?.slug || 'chat'}-${exportDate}`

    if (format === 'json') {
      const data = {
        persona: personaName,
        title: conversation.title,
        exportDate,
        messages: conversation.messages.map(msg => ({
          role: msg.role,
          content: msg.content,
          createdAt: msg.createdAt,
          attachments: msg.attachments.map(a => ({ url: a.url, type: a.type, name: a.name })),
        })),
      }

      return new NextResponse(JSON.stringify(data, null, 2), {
        headers: {
          'Content-Type': 'application/json',
          'Content-Disposition': `attachment; filename="${filename}.json"`,
        },
      })
    }

    if (format === 'markdown') {
      const md = exportToMarkdown({
        personaName,
        messages: conversation.messages.map(msg => ({
          id: msg.id,
          role: msg.role as 'user' | 'assistant',
          content: msg.content,
          conversationId: msg.conversationId,
          createdAt: msg.createdAt,
          attachments: msg.attachments.map(a => ({
            id: a.id,
            url: a.url,
            type: a.type as 'image' | 'document',
            name: a.name || '',
            messageId: a.messageId,
            createdAt: a.createdAt,
          })),
        })),
        exportDate,
      })

      return new NextResponse(md, {
        headers: {
          'Content-Type': 'text/markdown; charset=utf-8',
          'Content-Disposition': `attachment; filename="${filename}.md"`,
        },
      })
    }

    return NextResponse.json({ error: 'Unsupported format' }, { status: 400 })
  } catch (error) {
    console.error('Export error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
