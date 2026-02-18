import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

const VALID_THEMES = ['light', 'dark', 'system'] as const
const VALID_LANGUAGES = ['ko', 'en', 'ja'] as const

const DEFAULT_PREFERENCES = {
  theme: 'system',
  defaultPersona: null,
  language: 'ko',
}

export async function GET(_request: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const preference = await prisma.userPreference.findUnique({
      where: { userId: session.user.id },
    })

    if (!preference) {
      return NextResponse.json(DEFAULT_PREFERENCES)
    }

    return NextResponse.json({
      theme: preference.theme,
      defaultPersona: preference.defaultPersona,
      language: preference.language,
    })
  } catch (err) {
    console.error('Settings GET error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { theme, defaultPersona, language } = body

    if (theme !== undefined && !VALID_THEMES.includes(theme)) {
      return NextResponse.json({ error: 'Invalid theme value' }, { status: 400 })
    }

    if (language !== undefined && !VALID_LANGUAGES.includes(language)) {
      return NextResponse.json({ error: 'Invalid language value' }, { status: 400 })
    }

    const updateData: Record<string, unknown> = {}
    if (theme !== undefined) updateData.theme = theme
    if (defaultPersona !== undefined) updateData.defaultPersona = defaultPersona
    if (language !== undefined) updateData.language = language

    const preference = await prisma.userPreference.upsert({
      where: { userId: session.user.id },
      create: {
        userId: session.user.id,
        ...updateData,
      },
      update: updateData,
    })

    return NextResponse.json({
      theme: preference.theme,
      defaultPersona: preference.defaultPersona,
      language: preference.language,
    })
  } catch (err) {
    console.error('Settings PATCH error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
