import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const cardSchema = z.object({
  title: z.string().min(1),
  content: z.string(),
  linkUrl: z.string().optional().nullable(),
  linkText: z.string().optional().nullable(),
  btnClass: z.enum(['primary', 'secondary']).optional().nullable(),
})

const updateSchema = z.object({
  identifier: z.string().min(1).regex(/^[a-z0-9-]+$/).optional(),
  title: z.string().min(1).optional(),
  subtitle: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  backgroundImage: z.string().optional().nullable(),
  backgroundColor: z.enum(['primary', 'secondary', 'light', 'dark']).optional().nullable(),
  textColor: z.enum(['light', 'dark']).optional().nullable(),
  cards: z.array(cardSchema).optional(),
  active: z.boolean().optional(),
  sortOrder: z.number().optional(),
})

// GET
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const section = await prisma.homepageSection.findUnique({ where: { id } })

    if (!section) {
      return NextResponse.json({ error: 'Nicht gefunden' }, { status: 404 })
    }

    return NextResponse.json({
      ...section,
      cards: section.cards ? JSON.parse(section.cards) : [],
    })
  } catch (error) {
    console.error('Get section error:', error)
    return NextResponse.json({ error: 'Fehler' }, { status: 500 })
  }
}

// PUT
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: 'Nicht autorisiert' }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()
    const validated = updateSchema.parse(body)

    const updateData: Record<string, unknown> = { ...validated }
    if (validated.cards !== undefined) {
      updateData.cards = JSON.stringify(validated.cards)
    }

    const section = await prisma.homepageSection.update({
      where: { id },
      data: updateData,
    })

    return NextResponse.json({
      ...section,
      cards: section.cards ? JSON.parse(section.cards) : [],
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0].message }, { status: 400 })
    }
    console.error('Update section error:', error)
    return NextResponse.json({ error: 'Fehler' }, { status: 500 })
  }
}

// DELETE
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: 'Nicht autorisiert' }, { status: 401 })
    }

    const { id } = await params
    await prisma.homepageSection.delete({ where: { id } })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete section error:', error)
    return NextResponse.json({ error: 'Fehler' }, { status: 500 })
  }
}
