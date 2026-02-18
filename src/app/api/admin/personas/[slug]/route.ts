import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin-guard'
import { prisma } from '@/lib/prisma'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { error } = await requireAdmin()
  if (error) return error

  try {
    const { slug } = await params
    const body = await request.json()

    const persona = await prisma.persona.update({
      where: { slug },
      data: body,
    })

    return NextResponse.json(persona)
  } catch (err) {
    console.error('Admin persona PATCH error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { error } = await requireAdmin()
  if (error) return error

  try {
    const { slug } = await params

    await prisma.persona.update({
      where: { slug },
      data: { isActive: false },
    })

    return NextResponse.json({ message: 'Persona deactivated' })
  } catch (err) {
    console.error('Admin persona DELETE error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
