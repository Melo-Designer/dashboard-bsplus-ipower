import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { SectionType } from '@/generated/prisma'
import { z } from 'zod'

const tripleItemSchema = z.object({
  title: z.string(),
  content: z.string(),
})

const buttonSchema = z.object({
  text: z.string(),
  type: z.enum(['internal', 'external', 'button']).optional(),
  link: z.string(),
  btnClass: z.enum(['primary', 'secondary']).optional(),
})

const statSchema = z.object({
  number: z.string(),
  title: z.string(),
})

const cardSchema = z.object({
  title: z.string(),
  content: z.string(),
  linkUrl: z.string().optional().nullable(),
  linkText: z.string().optional().nullable(),
  btnClass: z.enum(['primary', 'secondary']).optional().nullable(),
})

const sectionUpdateSchema = z.object({
  type: z.enum(['triple', 'text_image', 'black_cta', 'numbers', 'hero', 'accordion']).optional(),
  title: z.string().optional().nullable(),
  subtitle: z.string().optional().nullable(),
  content: z.string().optional().nullable(),
  imageUrl: z.string().optional().nullable(),
  imageAlt: z.string().optional().nullable(),
  imageAlign: z.enum(['left', 'right']).optional().nullable(),
  items: z.array(tripleItemSchema).optional(),
  buttons: z.array(buttonSchema).optional(),
  cards: z.array(cardSchema).optional(),
  stats: z.array(statSchema).optional(),
  backgroundImage: z.string().optional().nullable(),
  backgroundColor: z.string().optional().nullable(),
  textColor: z.string().optional().nullable(),
  active: z.boolean().optional(),
})

// PUT - Update section
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; sectionId: string }> }
) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: 'Nicht autorisiert' }, { status: 401 })
    }

    const { id: pageId, sectionId } = await params
    const body = await request.json()

    // Check if section exists and belongs to page
    const existing = await prisma.pageSection.findFirst({
      where: { id: sectionId, pageId },
    })
    if (!existing) {
      return NextResponse.json({ error: 'Abschnitt nicht gefunden' }, { status: 404 })
    }

    const validated = sectionUpdateSchema.parse(body)

    // Build update data
    const updateData: Record<string, unknown> = {}

    if (validated.type !== undefined) updateData.type = validated.type as SectionType
    if (validated.title !== undefined) updateData.title = validated.title
    if (validated.subtitle !== undefined) updateData.subtitle = validated.subtitle
    if (validated.content !== undefined) updateData.content = validated.content
    if (validated.imageUrl !== undefined) updateData.imageUrl = validated.imageUrl
    if (validated.imageAlt !== undefined) updateData.imageAlt = validated.imageAlt
    if (validated.imageAlign !== undefined) updateData.imageAlign = validated.imageAlign
    if (validated.backgroundImage !== undefined) updateData.backgroundImage = validated.backgroundImage
    if (validated.backgroundColor !== undefined) updateData.backgroundColor = validated.backgroundColor
    if (validated.textColor !== undefined) updateData.textColor = validated.textColor
    if (validated.active !== undefined) updateData.active = validated.active

    // JSON fields
    if (validated.items !== undefined) updateData.items = JSON.stringify(validated.items)
    if (validated.buttons !== undefined) updateData.buttons = JSON.stringify(validated.buttons)
    if (validated.cards !== undefined) updateData.cards = JSON.stringify(validated.cards)
    if (validated.stats !== undefined) updateData.stats = JSON.stringify(validated.stats)

    const section = await prisma.pageSection.update({
      where: { id: sectionId },
      data: updateData,
    })

    return NextResponse.json({
      ...section,
      items: section.items ? JSON.parse(section.items) : [],
      buttons: section.buttons ? JSON.parse(section.buttons) : [],
      cards: section.cards ? JSON.parse(section.cards) : [],
      stats: section.stats ? JSON.parse(section.stats) : [],
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0].message }, { status: 400 })
    }
    console.error('Update section error:', error)
    return NextResponse.json({ error: 'Fehler beim Aktualisieren' }, { status: 500 })
  }
}

// DELETE - Delete section
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; sectionId: string }> }
) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: 'Nicht autorisiert' }, { status: 401 })
    }

    const { id: pageId, sectionId } = await params

    // Check if section exists and belongs to page
    const existing = await prisma.pageSection.findFirst({
      where: { id: sectionId, pageId },
    })
    if (!existing) {
      return NextResponse.json({ error: 'Abschnitt nicht gefunden' }, { status: 404 })
    }

    await prisma.pageSection.delete({
      where: { id: sectionId },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete section error:', error)
    return NextResponse.json({ error: 'Fehler beim Löschen' }, { status: 500 })
  }
}
