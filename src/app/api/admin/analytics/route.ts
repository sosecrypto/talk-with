import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin-guard'
import { prisma } from '@/lib/prisma'

export async function GET(_request: NextRequest) {
  const { error } = await requireAdmin()
  if (error) return error

  try {
    const [conversationsByPersona, personas] = await Promise.all([
      prisma.conversation.groupBy({
        by: ['personaId'],
        _count: { id: true },
        where: { personaId: { not: null } },
      }),
      prisma.persona.findMany({
        select: {
          id: true,
          name: true,
          slug: true,
          totalConversations: true,
          avgRating: true,
        },
      }),
    ])

    const personaMap = new Map(personas.map(p => [p.id, p]))

    const personaStats = conversationsByPersona.map(group => {
      const persona = personaMap.get(group.personaId!)
      return {
        personaId: group.personaId,
        name: persona?.name || 'Unknown',
        slug: persona?.slug || '',
        conversationCount: group._count.id,
        avgRating: persona?.avgRating,
      }
    }).sort((a, b) => b.conversationCount - a.conversationCount)

    return NextResponse.json({ personaStats })
  } catch (err) {
    console.error('Admin analytics error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
